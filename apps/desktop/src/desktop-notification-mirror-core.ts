/**
 * desktop-notification-mirror-core.ts — pure parsing and formatting for
 * mirroring freedesktop desktop notifications to the default pet.
 *
 * The adapter (desktop-notification-mirror.ts) feeds `dbus-monitor` output
 * lines in; this module turns Notify method calls into short pet messages.
 * No Electron, filesystem or process access here.
 */

import type { OpenPetsReaction } from "./local-ipc-protocol.js";

/** dbus-monitor match rule for Notify calls to the session notification server. */
export const notifyMatchRule = "type='method_call',interface='org.freedesktop.Notifications',member='Notify'";

/** Same limit the local IPC applies to pet.say messages. */
export const maxMirroredMessageLength = 140;

export type NotificationUrgency = 0 | 1 | 2;

export interface DesktopNotification {
  readonly appName: string;
  readonly summary: string;
  readonly body: string;
  readonly urgency: NotificationUrgency;
}

export interface NotificationMirrorOptions {
  readonly includeBody: boolean;
  /** Lower-cased app names to skip. */
  readonly ignoredApps: ReadonlySet<string>;
}

export interface MirroredNotification {
  readonly message: string;
  readonly reaction: OpenPetsReaction;
}

const notifyHeaderPattern = /^method call .*member=Notify$/;
const messageHeaderPattern = /^(method call|method return|signal|error) /;

/**
 * Parses one dbus-monitor block (header line plus argument lines) for a
 * Notify(app_name, replaces_id, app_icon, summary, body, actions, hints, timeout) call.
 *
 * dbus-monitor prints each top-level argument on a line indented by three
 * spaces. Strings may span lines and their quotes are not escaped, so the
 * block is split on top-level argument starts rather than parsed per line.
 */
export function parseNotifyBlock(block: string): DesktopNotification | null {
  const lines = block.split("\n");
  if (!notifyHeaderPattern.test(lines[0] ?? "")) return null;

  const args: string[] = [];
  for (const chunk of lines.slice(1).join("\n").split(/\n(?=   \S)/)) {
    if (!chunk.startsWith("   ")) continue;
    // An array's closing "]" sits at argument indent; keep it with its array.
    if (/^   [\])]/.test(chunk) && args.length > 0) args[args.length - 1] += `\n${chunk}`;
    else args.push(chunk.slice(3));
  }
  if (args.length < 7) return null;

  const appName = readString(args[0]);
  const summary = readString(args[3]);
  const body = readString(args[4]);
  if (appName === null || summary === null || body === null) return null;

  const urgencyMatch = /"urgency"\s+variant\s+byte (\d)/.exec(args[6] ?? "");
  const urgencyValue = urgencyMatch ? Number(urgencyMatch[1]) : 1;
  const urgency: NotificationUrgency = urgencyValue === 0 || urgencyValue === 2 ? urgencyValue : 1;
  return { appName, summary, body, urgency };
}

function readString(arg: string | undefined): string | null {
  const match = /^string "([\s\S]*)"$/.exec(arg ?? "");
  return match ? match[1] : null;
}

/** Quotes text as a GVariant string literal for `gdbus call` arguments. */
export function toGVariantStringLiteral(text: string): string {
  const escaped = text
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, "\\\"");
  return `"${escaped}"`;
}

/** `gdbus` arguments for a Notify call, as a test notification from `appName`. */
export function createTestNotifyArgs(appName: string, summary: string): string[] {
  return [
    "call",
    "--session",
    "--dest", "org.freedesktop.Notifications",
    "--object-path", "/org/freedesktop/Notifications",
    "--method", "org.freedesktop.Notifications.Notify",
    toGVariantStringLiteral(appName),
    "0", // replaces_id
    "\"\"", // app_icon
    toGVariantStringLiteral(summary),
    "\"\"", // body
    "[]", // actions
    "{}", // hints
    "5000", // expire_timeout in ms
  ];
}

/** Turns the comma-separated ignore preference into a lookup set. */
export function parseIgnoredApps(value: string): ReadonlySet<string> {
  return new Set(value.split(",").map((app) => app.trim().toLowerCase()).filter(Boolean));
}

/** Strips the simple markup notification bodies may carry and collapses whitespace. */
export function cleanNotificationText(text: string): string {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Builds the pet message for a notification, or null when it should be
 * skipped (ignored app, OpenPets' own notifications, or nothing to say).
 */
export function formatMirroredNotification(notification: DesktopNotification, options: NotificationMirrorOptions): MirroredNotification | null {
  const appName = cleanNotificationText(notification.appName);
  // OpenPets' own OS notifications already reach the user; mirroring them would echo.
  if (/openpets/i.test(appName) || options.ignoredApps.has(appName.toLowerCase())) return null;

  const summary = cleanNotificationText(notification.summary);
  const body = options.includeBody ? cleanNotificationText(notification.body) : "";
  if (!summary && !body) return null;

  const text = [summary, body].filter(Boolean).join(" — ");
  let message = appName ? `${appName}: ${text}` : text;
  if (message.length > maxMirroredMessageLength) {
    // Cut on code points so an emoji is never split into a lone surrogate.
    let cut = "";
    for (const char of message) {
      if (cut.length + char.length > maxMirroredMessageLength - 1) break;
      cut += char;
    }
    message = `${cut}…`;
  }
  return { message, reaction: notification.urgency === 2 ? "waiting" : "waving" };
}

/**
 * Groups dbus-monitor output lines into Notify blocks. A block is complete
 * when the next message header arrives or the adapter flushes after a pause.
 */
export class NotifyBlockReader {
  private block: string | null = null;

  /** Returns a notification when this line completes the previous Notify block. */
  push(line: string): DesktopNotification | null {
    const startsMessage = messageHeaderPattern.test(line);
    const completed = startsMessage ? this.flush() : null;
    if (notifyHeaderPattern.test(line)) this.block = line;
    else if (this.block !== null && !startsMessage) this.block += `\n${line}`;
    return completed;
  }

  flush(): DesktopNotification | null {
    if (this.block === null) return null;
    const block = this.block;
    this.block = null;
    return parseNotifyBlock(block);
  }
}

/** Drops identical messages repeated within `windowMs` (apps often re-send updates). */
export class DuplicateMessageFilter {
  private readonly seen = new Map<string, number>();

  constructor(private readonly windowMs: number) {}

  shouldShow(message: string, now: number): boolean {
    for (const [seenMessage, at] of this.seen) {
      if (now - at > this.windowMs) this.seen.delete(seenMessage);
    }
    if (this.seen.has(message)) return false;
    this.seen.set(message, now);
    return true;
  }
}
