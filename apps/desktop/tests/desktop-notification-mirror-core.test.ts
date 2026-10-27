import assert from "node:assert/strict";

import {
  DuplicateMessageFilter,
  formatMirroredNotification,
  maxMirroredMessageLength,
  NotifyBlockReader,
  parseIgnoredApps,
  parseNotifyBlock,
  toGVariantStringLiteral,
} from "../src/desktop-notification-mirror-core.js";

// Captured from `dbus-monitor --session` for:
//   notify-send -a "TestApp" "Hello title" $'Body line one\nline "two"'
// Strings can span lines and quotes inside them are not escaped.
const capturedNotify = [
  "method call time=1793114163.836848 sender=:1.4533 -> destination=:1.45 serial=9 path=/org/freedesktop/Notifications; interface=org.freedesktop.Notifications; member=Notify",
  "   string \"TestApp\"",
  "   uint32 0",
  "   string \"\"",
  "   string \"Hello title\"",
  "   string \"Body line one",
  "line \"two\"\"",
  "   array [",
  "   ]",
  "   array [",
  "      dict entry(",
  "         string \"urgency\"",
  "         variant             byte 2",
  "      )",
  "   ]",
  "   int32 -1",
];

const noIgnores = { includeBody: false, ignoredApps: parseIgnoredApps("") };

{
  const parsed = parseNotifyBlock(capturedNotify.join("\n"));
  assert.deepEqual(parsed, { appName: "TestApp", summary: "Hello title", body: "Body line one\nline \"two\"", urgency: 2 });
  console.log("parseNotifyBlock: multi-line body with unescaped quotes — PASS");
}

{
  const reader = new NotifyBlockReader();
  const signal = "signal time=1 sender=org.freedesktop.DBus -> destination=:1.1 serial=1 path=/org/freedesktop/DBus; interface=org.freedesktop.DBus; member=NameAcquired";
  for (const line of capturedNotify) assert.equal(reader.push(line), null);
  assert.equal(reader.push(signal)?.summary, "Hello title", "the next message header completes the Notify block");
  assert.equal(reader.flush(), null, "non-Notify messages are not mirrored");
  console.log("NotifyBlockReader: completes blocks on the next header — PASS");
}

{
  const notification = { appName: "Slack", summary: "New message from Anna", body: "<b>Lunch</b> &amp; coffee?", urgency: 1 as const };
  assert.deepEqual(formatMirroredNotification(notification, noIgnores), { message: "Slack: New message from Anna", reaction: "waving" });
  assert.equal(
    formatMirroredNotification(notification, { includeBody: true, ignoredApps: parseIgnoredApps("") })?.message,
    "Slack: New message from Anna — Lunch & coffee?",
    "body is opt-in and stripped of markup",
  );
  assert.equal(formatMirroredNotification({ ...notification, urgency: 2 }, noIgnores)?.reaction, "waiting");
  console.log("formatMirroredNotification: title by default, body opt-in, urgency reaction — PASS");
}

{
  const notification = { appName: "Spotify", summary: "Now playing", body: "", urgency: 1 as const };
  assert.equal(formatMirroredNotification(notification, { includeBody: false, ignoredApps: parseIgnoredApps(" spotify , KDE Connect") }), null);
  assert.equal(formatMirroredNotification({ ...notification, appName: "OpenPets" }, noIgnores), null, "OpenPets' own notifications are not echoed");
  assert.equal(formatMirroredNotification({ ...notification, summary: "" }, noIgnores), null, "empty notifications are skipped");
  console.log("formatMirroredNotification: ignored apps and own notifications skipped — PASS");
}

{
  const long = formatMirroredNotification({ appName: "Mail", summary: "x".repeat(400), body: "", urgency: 1 }, noIgnores);
  assert.equal(long?.message.length, maxMirroredMessageLength, "messages respect the pet.say length limit");
  const emoji = formatMirroredNotification({ appName: "Chat", summary: "😀".repeat(100), body: "", urgency: 1 }, noIgnores)?.message ?? "";
  assert.ok(emoji.length <= maxMirroredMessageLength && !/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/.test(emoji), "truncation never splits an emoji");
  console.log("formatMirroredNotification: long messages truncated — PASS");
}

{
  const filter = new DuplicateMessageFilter(10_000);
  assert.equal(filter.shouldShow("Mail: Hi", 0), true);
  assert.equal(filter.shouldShow("Mail: Hi", 5_000), false, "repeat inside the window is dropped");
  assert.equal(filter.shouldShow("Mail: Hi", 20_000), true, "repeat after the window is shown again");
  console.log("DuplicateMessageFilter: drops quick repeats — PASS");
}

{
  assert.equal(toGVariantStringLiteral('Say "hi" C:\\pets'), '"Say \\"hi\\" C:\\\\pets"', "quotes and backslashes stay inside one gdbus string");
  assert.equal(toGVariantStringLiteral("line one\nline two"), '"line one line two"', "control characters cannot split the argument");
  console.log("toGVariantStringLiteral: test notification text is quoted safely — PASS");
}

console.log("\nAll desktop-notification-mirror-core tests passed.");
