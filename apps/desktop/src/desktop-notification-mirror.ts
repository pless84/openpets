/**
 * desktop-notification-mirror.ts — owns the `dbus-monitor` child process that
 * mirrors freedesktop desktop notifications to the default pet (Linux only).
 *
 * Runs only while the `notificationMirrorEnabled` preference is on. Parsing and
 * formatting live in desktop-notification-mirror-core.ts; this module handles
 * the process lifecycle, restarts and delivery to the pet. Notification text
 * is never logged.
 */

import { execFile, spawn, type ChildProcessByStdio } from "node:child_process";
import { createInterface, type Interface } from "node:readline";
import type { Readable } from "node:stream";

import { getAppStateSnapshot } from "./app-state.js";
import { applyExternalPetSay } from "./default-pet-controller.js";
import {
  createTestNotifyArgs,
  DuplicateMessageFilter,
  formatMirroredNotification,
  NotifyBlockReader,
  notifyMatchRule,
  parseIgnoredApps,
  type DesktopNotification,
} from "./desktop-notification-mirror-core.js";
import { isDefaultPetAwayForLan } from "./lan-controller.js";
import { debug, info, warn } from "./logger.js";

const blockFlushDelayMs = 150;
const duplicateWindowMs = 10_000;
const restartDelayMs = 5_000;
const maxRestartDelayMs = 60_000;
/** A monitor that stays up this long counts as healthy and resets the restart backoff. */
const healthyUptimeMs = 30_000;
const testNotificationTimeoutMs = 5_000;

type MonitorProcess = ChildProcessByStdio<null, Readable, Readable>;

/** Everything owned by one dbus-monitor run, torn down together. */
interface MonitorRun {
  readonly child: MonitorProcess;
  readonly lines: readonly Interface[];
  readonly startedAt: number;
  flushTimer: NodeJS.Timeout | null;
}

let run: MonitorRun | null = null;
let restartTimer: NodeJS.Timeout | null = null;
let consecutiveFailures = 0;
/** Set when dbus-monitor is missing; cleared when the user turns the mirror off. */
let unavailable = false;
const duplicates = new DuplicateMessageFilter(duplicateWindowMs);

export function isDesktopNotificationMirrorSupported(): boolean {
  return process.platform === "linux";
}

/** Starts or stops the mirror to match the current preferences. Safe to call repeatedly. */
export function syncDesktopNotificationMirror(): void {
  const enabled = isDesktopNotificationMirrorSupported() && getAppStateSnapshot().preferences.notificationMirrorEnabled;
  if (!enabled) {
    stopDesktopNotificationMirror();
    unavailable = false;
    return;
  }
  if (!run && !restartTimer && !unavailable) startMonitor();
}

/**
 * Sends a real desktop notification through the session notification server,
 * so the user can check the whole path: D-Bus → dbus-monitor → pet bubble.
 * Rejects with a readable reason when the mirror cannot show it.
 */
export function sendDesktopNotificationMirrorTest(appName: string, summary: string): Promise<void> {
  if (!isDesktopNotificationMirrorSupported()) {
    return Promise.reject(new Error("Desktop notifications can only be mirrored on Linux."));
  }
  if (unavailable) {
    return Promise.reject(new Error("dbus-monitor is not installed, so notifications cannot be mirrored."));
  }
  return new Promise((resolve, reject) => {
    const args = createTestNotifyArgs(appName, summary);
    execFile("gdbus", args, { timeout: testNotificationTimeoutMs }, (error, _stdout, stderr) => {
      if (!error) {
        info("notifications", "test notification sent");
        resolve();
        return;
      }
      const missing = (error as NodeJS.ErrnoException).code === "ENOENT";
      const reason = missing ? "gdbus is not installed" : stderr.trim().slice(0, 200) || error.message;
      warn("notifications", "test notification failed", { reason });
      reject(new Error(`Could not send a test notification: ${reason}`));
    });
  });
}

export function stopDesktopNotificationMirror(): void {
  if (restartTimer) clearTimeout(restartTimer);
  restartTimer = null;
  consecutiveFailures = 0;
  if (!run) return;
  const stopped = run;
  teardown(stopped);
  if (stopped.child.exitCode === null) stopped.child.kill();
  info("notifications", "desktop notification mirror stopped");
}

/** Detaches a run so none of its late output, timers or exit events act anymore. */
function teardown(target: MonitorRun): void {
  if (run === target) run = null;
  if (target.flushTimer) clearTimeout(target.flushTimer);
  target.flushTimer = null;
  for (const lines of target.lines) lines.close();
}

function startMonitor(): void {
  let child: MonitorProcess;
  try {
    child = spawn("dbus-monitor", ["--session", notifyMatchRule], { stdio: ["ignore", "pipe", "pipe"] });
  } catch (error) {
    warn("notifications", "could not start dbus-monitor", { error: error instanceof Error ? error.message : String(error) });
    unavailable = true;
    return;
  }
  const stdout = createInterface({ input: child.stdout });
  const stderr = createInterface({ input: child.stderr });
  const current: MonitorRun = { child, lines: [stdout, stderr], startedAt: Date.now(), flushTimer: null };
  run = current;
  info("notifications", "desktop notification mirror started", { pid: child.pid });

  const reader = new NotifyBlockReader();
  stdout.on("line", (line) => {
    if (run !== current) return;
    if (current.flushTimer) clearTimeout(current.flushTimer);
    deliver(reader.push(line));
    // dbus-monitor only prints the next header when the next message arrives,
    // so close the current block after a short pause.
    current.flushTimer = setTimeout(() => {
      current.flushTimer = null;
      if (run === current) deliver(reader.flush());
    }, blockFlushDelayMs);
    current.flushTimer.unref?.();
  });
  stderr.on("line", (line) => {
    debug("notifications", "dbus-monitor stderr", { line: line.slice(0, 200) });
  });

  child.on("error", (error) => {
    if (run !== current) return;
    teardown(current);
    // ENOENT means dbus-monitor is not installed; retrying would not help.
    unavailable = (error as NodeJS.ErrnoException).code === "ENOENT";
    warn("notifications", unavailable ? "dbus-monitor is not installed; notification mirror unavailable" : "dbus-monitor failed", { error: error.message });
    if (!unavailable) scheduleRestart(null, null);
  });
  child.on("exit", (code, signal) => {
    if (run !== current) return; // stopped on purpose or already handled
    teardown(current);
    if (Date.now() - current.startedAt >= healthyUptimeMs) consecutiveFailures = 0;
    scheduleRestart(code, signal);
  });
}

function scheduleRestart(code: number | null, signal: NodeJS.Signals | null): void {
  consecutiveFailures += 1;
  const delayMs = Math.min(maxRestartDelayMs, restartDelayMs * 2 ** (consecutiveFailures - 1));
  warn("notifications", "dbus-monitor exited; restarting", { code, signal, delayMs });
  restartTimer = setTimeout(() => {
    restartTimer = null;
    syncDesktopNotificationMirror();
  }, delayMs);
  restartTimer.unref?.();
}

function deliver(notification: DesktopNotification | null): void {
  if (!notification) return;
  // A default pet visiting another LAN host must not be woken here.
  if (isDefaultPetAwayForLan()) return;
  const preferences = getAppStateSnapshot().preferences;
  const mirrored = formatMirroredNotification(notification, {
    includeBody: preferences.notificationMirrorIncludeBody,
    ignoredApps: parseIgnoredApps(preferences.notificationMirrorIgnoredApps),
  });
  if (!mirrored || !duplicates.shouldShow(mirrored.message, Date.now())) return;
  const result = applyExternalPetSay(mirrored.message, mirrored.reaction);
  debug("notifications", "notification mirrored", { shown: result.shown, reason: result.reason, urgency: notification.urgency });
}
