import { nativeTheme } from "electron";

import { getAppStateSnapshot, type BubbleTheme } from "./app-state.js";

/**
 * The pet theme (`bubbleTheme` preference) colors every surface around the pet:
 * speech bubbles, the compact composer, chat and check-in panels, the practice
 * session overlay, pet buttons, and the popups the pet opens. The Control
 * Center has its own appearance setting.
 */
export function isPetThemeDark(theme: BubbleTheme = getAppStateSnapshot().preferences.bubbleTheme): boolean {
  if (theme === "dark") {
    return true;
  }
  if (theme === "system") {
    return nativeTheme.shouldUseDarkColors;
  }
  return false;
}

/**
 * Pet window CSS for the theme. It is injected after every base rule, so the
 * dark overrides reuse the base selectors and win by source order. They change
 * colors only, never layout. "system" follows the desktop live.
 */
export function createPetWindowThemeCss(theme: BubbleTheme): string {
  if (theme === "dark") {
    return darkPetWindowCss;
  }
  if (theme === "system") {
    return `@media (prefers-color-scheme: dark) {${darkPetWindowCss}}`;
  }
  return "";
}

/** Value for a popup page's `<html data-theme>` attribute. */
export function petThemeAttribute(): "dark" | "light" {
  return isPetThemeDark() ? "dark" : "light";
}

const darkPetWindowCss = `
    /* --- Dark pet theme: transient speech bubbles --- */
    .bubble:not(.is-pinned) {
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.96), rgba(46, 38, 78, 0.95));
      color: #e2e8f0;
      border-color: rgba(148, 163, 184, 0.28);
      box-shadow: 0 12px 24px rgba(2, 6, 23, 0.42), 0 2px 5px rgba(2, 6, 23, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08);
    }
    .bubble:not(.is-pinned)::after {
      border-right-color: rgba(148, 163, 184, 0.22);
      border-bottom-color: rgba(148, 163, 184, 0.22);
      box-shadow: 3px 3px 7px rgba(2, 6, 23, 0.25);
    }
    .bubble:not(.is-pinned) .bubble-body { color: #e2e8f0; }
    .bubble:not(.is-pinned) .bubble-divider { background: rgba(148, 163, 184, 0.2); }
    .bubble:not(.is-pinned) .bubble-markdown code { background: rgba(148, 163, 184, 0.18); }
    .bubble:not(.is-pinned) .bubble-action:not(.is-primary):not(.is-danger) { background: rgba(148, 163, 184, 0.16); color: #e2e8f0; }
    .bubble:not(.is-pinned) .bubble-action:not(.is-primary):not(.is-danger):hover { background: rgba(148, 163, 184, 0.26); }
    .bubble:not(.is-pinned) .bubble-input-control { background: rgba(15, 23, 42, 0.6); color: #e2e8f0; border-color: rgba(148, 163, 184, 0.35); }
    .bubble.is-plugin:not(.is-pinned).accent-blue { background: linear-gradient(135deg, rgba(30, 58, 138, 0.96), rgba(30, 41, 59, 0.95)); }
    .bubble.is-plugin:not(.is-pinned).accent-purple { background: linear-gradient(135deg, rgba(76, 29, 149, 0.96), rgba(46, 38, 78, 0.95)); }
    .bubble.is-plugin:not(.is-pinned).accent-green { background: linear-gradient(135deg, rgba(20, 83, 45, 0.96), rgba(30, 41, 59, 0.95)); }
    .bubble.is-plugin:not(.is-pinned).accent-amber { background: linear-gradient(135deg, rgba(120, 53, 15, 0.96), rgba(41, 37, 36, 0.95)); }
    .bubble.is-plugin:not(.is-pinned).accent-red { background: linear-gradient(135deg, rgba(127, 29, 29, 0.96), rgba(41, 37, 36, 0.95)); }
    .bubble.is-plugin:not(.is-pinned).accent-pink { background: linear-gradient(135deg, rgba(131, 24, 67, 0.96), rgba(46, 38, 78, 0.95)); }
    .bubble.is-plugin:not(.is-pinned).accent-slate { background: linear-gradient(135deg, rgba(51, 65, 85, 0.96), rgba(30, 41, 59, 0.95)); }
    /* --- Dark pet theme: compact composer --- */
    .openpets-compact-composer {
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.96), rgba(46, 38, 78, 0.95));
      color: #e2e8f0;
      border-color: rgba(148, 163, 184, 0.28);
      box-shadow: 0 12px 24px rgba(2, 6, 23, 0.42), 0 2px 5px rgba(2, 6, 23, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08);
      color-scheme: dark;
    }
    .openpets-compact-composer::after {
      background: rgb(38, 40, 68);
      border-right-color: rgba(148, 163, 184, 0.22);
      border-bottom-color: rgba(148, 163, 184, 0.22);
      box-shadow: 3px 3px 7px rgba(2, 6, 23, 0.25);
    }
    .compact-composer-title { color: #e2e8f0; }
    .compact-composer-btn {
      background: rgba(148, 163, 184, 0.16);
      border-color: rgba(148, 163, 184, 0.28);
      color: #cbd5e1;
    }
    .compact-composer-btn:hover {
      background: rgba(148, 163, 184, 0.28);
      border-color: rgba(148, 163, 184, 0.45);
      color: #f8fafc;
    }
    .compact-composer-btn.is-open-chat:hover {
      background: rgba(59, 130, 246, 0.22);
      border-color: rgba(96, 165, 250, 0.5);
      color: #93c5fd;
    }
    .compact-composer-btn.is-close:hover {
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(248, 113, 113, 0.5);
      color: #fca5a5;
    }
    .compact-composer-textarea {
      background: rgba(15, 23, 42, 0.6);
      border-color: rgba(148, 163, 184, 0.35);
      color: #e2e8f0;
      box-shadow: inset 0 1px 2px rgba(2, 6, 23, 0.3);
    }
    .compact-composer-textarea:focus {
      border-color: #60a5fa;
      box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.25), inset 0 1px 2px rgba(2, 6, 23, 0.3);
    }
    .compact-composer-textarea::placeholder { color: #94a3b8; }
    .compact-composer-send-btn:disabled {
      background: rgba(148, 163, 184, 0.18);
      color: #64748b;
    }
    /* --- Dark pet theme: pet buttons --- */
    html { color: #e2e8f0; }
    .openpets-companion-launcher {
      border-color: rgba(148, 163, 184, 0.32);
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.96) 0%, rgba(46, 38, 78, 0.94) 100%);
      color: #60a5fa;
      box-shadow: 0 2px 8px rgba(2, 6, 23, 0.42), 0 1px 2px rgba(2, 6, 23, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08);
    }
    .openpets-companion-launcher:hover {
      background: #334155;
      color: #93c5fd;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.36), 0 1px 3px rgba(2, 6, 23, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }
    .openpets-companion-launcher:focus-visible { outline-color: #60a5fa; }
    .openpets-talk-button { color: #34d399; }
    .openpets-talk-button:hover:not(:disabled):not(.is-processing) {
      color: #6ee7b7;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.34), 0 1px 3px rgba(2, 6, 23, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }
    /* Recording state stays brand red; only the neutral shadow parts darken. */
    .openpets-talk-button.is-active {
      background: #ef4444;
      border-color: rgba(248, 113, 113, 0.7);
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.45), 0 1px 2px rgba(2, 6, 23, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.25);
    }
    .openpets-talk-button.is-active:hover {
      background: #dc2626;
      border-color: #f87171;
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(239, 68, 68, 0.55), 0 1px 3px rgba(2, 6, 23, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.25);
    }
    .openpets-talk-button.is-processing,
    .openpets-talk-button:disabled,
    .openpets-talk-button.is-processing:hover,
    .openpets-talk-button:disabled:hover {
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.88) 100%);
      border-color: rgba(71, 85, 105, 0.6);
      color: #94a3b8;
      box-shadow: 0 1px 3px rgba(2, 6, 23, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05);
    }
    .openpets-check-in-button {
      color: #a5b4fc;
      background: #1e293b;
      border-color: rgba(148, 163, 184, 0.32);
      box-shadow: 0 1px 3px rgba(2, 6, 23, 0.4);
    }
    .openpets-check-in-button:hover {
      background: #334155;
      color: #c7d2fe;
      border-color: rgba(148, 163, 184, 0.45);
      box-shadow: 0 2px 5px rgba(2, 6, 23, 0.5);
    }
    .openpets-check-in-badge {
      background: #6366f1;
      border-color: #1e293b;
      color: #ffffff;
    }

    /* --- Dark pet theme: transient bubble extras --- */
    .bubble:not(.is-pinned) .bubble-input-control { caret-color: #60a5fa; color-scheme: dark; }
    .bubble:not(.is-pinned) .bubble-input-control::placeholder { color: #94a3b8; }
    .bubble:not(.is-pinned) .bubble-input-control:focus { border-color: #60a5fa; }

    /* --- Dark pet theme: pinned plugin HUD --- */
    .bubble.is-pinned {
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.94), rgba(15, 23, 42, 0.92));
      color: #cbd5e1;
      border-color: rgba(148, 163, 184, 0.24);
      box-shadow: 0 4px 10px rgba(2, 6, 23, 0.36), 0 1px 3px rgba(2, 6, 23, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.06);
    }
    .bubble.is-pinned .bubble-body,
    .bubble.is-pinned .bubble-text { color: #e2e8f0; }
    .bubble.is-pinned .bubble-divider { background: rgba(148, 163, 184, 0.2); }
    .bubble.is-pinned .bubble-markdown code { background: rgba(148, 163, 184, 0.18); }
    .bubble.is-pinned .bubble-action { background: rgba(148, 163, 184, 0.16); color: #e2e8f0; }
    .bubble.is-pinned .bubble-action:hover { background: rgba(148, 163, 184, 0.26); }
    .bubble.is-pinned .bubble-action.is-primary { background: #2563eb; color: #ffffff; }
    .bubble.is-pinned .bubble-action.is-primary:hover { background: #3b82f6; }
    .bubble.is-pinned .bubble-action.is-danger { background: #dc2626; color: #ffffff; }
    .bubble.is-pinned .bubble-action.is-danger:hover { background: #ef4444; }
    .bubble.is-pinned.accent-blue { background: linear-gradient(135deg, rgba(30, 58, 138, 0.94), rgba(30, 41, 59, 0.92)); }
    .bubble.is-pinned.accent-purple { background: linear-gradient(135deg, rgba(76, 29, 149, 0.94), rgba(46, 38, 78, 0.92)); }
    .bubble.is-pinned.accent-green { background: linear-gradient(135deg, rgba(20, 83, 45, 0.94), rgba(30, 41, 59, 0.92)); }
    .bubble.is-pinned.accent-amber { background: linear-gradient(135deg, rgba(120, 53, 15, 0.94), rgba(41, 37, 36, 0.92)); }
    .bubble.is-pinned.accent-red { background: linear-gradient(135deg, rgba(127, 29, 29, 0.94), rgba(41, 37, 36, 0.92)); }
    .bubble.is-pinned.accent-pink { background: linear-gradient(135deg, rgba(131, 24, 67, 0.94), rgba(46, 38, 78, 0.92)); }
    .bubble.is-pinned.accent-slate { background: linear-gradient(135deg, rgba(51, 65, 85, 0.94), rgba(30, 41, 59, 0.92)); }
    .bubble-hud-item-meta { color: #cbd5e1; }
    .bubble-hud-item-bar { background: rgba(148, 163, 184, 0.22); }
    .bubble-hud-item-fill.tone-amber { background: #f59e0b; }
    .bubble-hud-item-fill.tone-blue { background: #3b82f6; }
    .bubble-hud-item-fill.tone-green { background: #22c55e; }
    .bubble-hud-item-fill.tone-pink { background: #ec4899; }
    .bubble-hud-item-fill.tone-slate { background: #94a3b8; }
    .bubble-hud-item-fill.tone-red { background: #ef4444; }
    /* --- Dark: in-pet attached chat panel --- */
    .openpets-chat-panel {
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.97) 0%, rgba(36, 40, 70, 0.96) 55%, rgba(46, 38, 78, 0.95) 100%);
      color: #e2e8f0;
      border-color: rgba(148, 163, 184, 0.28);
      box-shadow: 0 24px 48px -12px rgba(2, 6, 23, 0.55), 0 4px 12px rgba(2, 6, 23, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.08);
      color-scheme: dark;
    }
    .openpets-chat-panel::after {
      background: rgb(38, 40, 68);
      border-right-color: rgba(148, 163, 184, 0.22);
      border-bottom-color: rgba(148, 163, 184, 0.22);
      box-shadow: 3px 3px 6px rgba(2, 6, 23, 0.3);
    }

    /* header */
    .chat-header {
      background: rgba(15, 23, 42, 0.45);
      border-bottom-color: rgba(148, 163, 184, 0.2);
    }
    .chat-title {
      color: #f1f5f9;
    }
    .chat-status-pill {
      background: rgba(148, 163, 184, 0.14);
      color: #cbd5e1;
      border-color: rgba(148, 163, 184, 0.28);
      box-shadow: 0 1px 2px rgba(2, 6, 23, 0.25);
    }
    .chat-status-dot {
      background: #34d399;
    }
    .chat-status-pill.is-thinking .chat-status-dot {
      background: #fbbf24;
    }
    .chat-status-pill.is-acting .chat-status-dot {
      background: #60a5fa;
    }
    .chat-status-pill.is-responding .chat-status-dot {
      background: #a78bfa;
    }
    .chat-status-pill.is-voice .chat-status-dot {
      background: #f472b6;
    }

    /* header buttons */
    .chat-voice-btn {
      background: rgba(148, 163, 184, 0.16);
      border-color: rgba(148, 163, 184, 0.28);
      color: #cbd5e1;
      box-shadow: 0 1px 2px rgba(2, 6, 23, 0.25);
    }
    .chat-voice-btn:hover {
      background: rgba(148, 163, 184, 0.26);
      border-color: rgba(148, 163, 184, 0.45);
      color: #f8fafc;
    }
    .chat-voice-btn.is-active {
      background: linear-gradient(135deg, rgba(236, 72, 153, 0.22) 0%, rgba(139, 92, 246, 0.22) 100%);
      border-color: rgba(244, 114, 182, 0.5);
      color: #f9a8d4;
    }
    .chat-voice-btn.is-muted {
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(248, 113, 113, 0.45);
      color: #fca5a5;
    }
    .chat-close-btn {
      color: #94a3b8;
    }
    .chat-close-btn:hover {
      background: rgba(148, 163, 184, 0.22);
      color: #f8fafc;
    }

    /* voice banner */
    .chat-voice-banner {
      background: linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
      border-bottom-color: rgba(96, 165, 250, 0.3);
      color: #93c5fd;
    }
    .chat-voice-bar {
      background: #60a5fa;
    }
    .chat-voice-action-btn {
      background: rgba(15, 23, 42, 0.55);
      border-color: rgba(96, 165, 250, 0.4);
      color: #bfdbfe;
      box-shadow: 0 1px 2px rgba(2, 6, 23, 0.25);
    }
    .chat-voice-action-btn:hover {
      background: rgba(59, 130, 246, 0.25);
    }
    .chat-voice-action-btn.is-end {
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(248, 113, 113, 0.45);
      color: #fca5a5;
    }
    .chat-voice-action-btn.is-end:hover {
      background: rgba(239, 68, 68, 0.32);
    }

    /* transcript + scrollbar */
    .chat-transcript {
      scrollbar-color: rgba(148, 163, 184, 0.4) transparent;
    }
    .chat-transcript::-webkit-scrollbar-thumb {
      background: rgba(148, 163, 184, 0.32);
    }
    .chat-transcript::-webkit-scrollbar-thumb:hover {
      background: rgba(148, 163, 184, 0.55);
    }

    /* empty state */
    .chat-empty-title {
      color: #f1f5f9;
    }
    .chat-empty-subtitle {
      color: #94a3b8;
    }

    /* message bubbles */
    .chat-msg.is-user .chat-msg-bubble {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(2, 6, 23, 0.4);
    }
    .chat-msg.is-assistant .chat-msg-bubble {
      background: rgba(15, 23, 42, 0.55);
      border-color: rgba(148, 163, 184, 0.24);
      color: #e2e8f0;
      box-shadow: 0 1px 3px rgba(2, 6, 23, 0.3);
    }
    .chat-msg.is-assistant .chat-msg-bubble strong {
      color: #f8fafc;
    }

    /* markdown code */
    .chat-code-inline {
      background: rgba(148, 163, 184, 0.18);
      border-color: rgba(148, 163, 184, 0.3);
      color: #93c5fd;
    }
    .chat-code-block {
      background: rgba(2, 6, 23, 0.5);
      border-color: rgba(148, 163, 184, 0.22);
      color: #e2e8f0;
    }
    .chat-typing-cursor {
      background: #60a5fa;
    }

    /* tool / action cards */
    .chat-action-card {
      background: rgba(15, 23, 42, 0.5);
      border-color: rgba(148, 163, 184, 0.24);
      box-shadow: 0 1px 3px rgba(2, 6, 23, 0.3);
      color: #cbd5e1;
    }
    .chat-action-icon {
      color: #94a3b8;
    }
    .chat-action-name {
      color: #f1f5f9;
    }
    .chat-action-badge.is-running {
      background: rgba(59, 130, 246, 0.2);
      color: #93c5fd;
      border-color: rgba(96, 165, 250, 0.35);
    }
    .chat-action-badge.is-completed {
      background: rgba(16, 185, 129, 0.18);
      color: #6ee7b7;
      border-color: rgba(52, 211, 153, 0.35);
    }
    .chat-action-badge.is-failed,
    .chat-action-badge.is-rejected {
      background: rgba(239, 68, 68, 0.2);
      color: #fca5a5;
      border-color: rgba(248, 113, 113, 0.4);
    }

    /* error banner */
    .chat-error-banner {
      background: rgba(239, 68, 68, 0.16);
      border-color: rgba(248, 113, 113, 0.4);
      color: #fca5a5;
    }

    /* suggestion chips */
    .chat-chip {
      background: rgba(148, 163, 184, 0.16);
      border-color: rgba(148, 163, 184, 0.28);
      color: #cbd5e1;
      box-shadow: 0 1px 2px rgba(2, 6, 23, 0.25);
    }
    .chat-chip:hover {
      background: rgba(59, 130, 246, 0.22);
      border-color: rgba(96, 165, 250, 0.5);
      color: #bfdbfe;
      box-shadow: 0 2px 6px rgba(2, 6, 23, 0.35);
    }

    /* composer */
    .chat-composer {
      background: rgba(15, 23, 42, 0.45);
      border-top-color: rgba(148, 163, 184, 0.2);
    }
    .chat-textarea {
      background: rgba(15, 23, 42, 0.6);
      border-color: rgba(148, 163, 184, 0.35);
      color: #e2e8f0;
      caret-color: #93c5fd;
      box-shadow: inset 0 1px 2px rgba(2, 6, 23, 0.3);
    }
    .chat-textarea:focus {
      border-color: #60a5fa;
      box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.25), inset 0 1px 2px rgba(2, 6, 23, 0.3);
    }
    .chat-textarea::placeholder {
      color: #94a3b8;
    }

    /* send / cancel buttons */
    .chat-send-btn {
      box-shadow: 0 2px 6px rgba(2, 6, 23, 0.4);
    }
    .chat-send-btn:hover:not(:disabled) {
      box-shadow: 0 3px 10px rgba(37, 99, 235, 0.45);
    }
    .chat-send-btn:disabled {
      background: rgba(148, 163, 184, 0.18);
      color: #64748b;
    }
    .chat-cancel-turn-btn {
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(248, 113, 113, 0.45);
      color: #fca5a5;
    }
    .chat-cancel-turn-btn:hover {
      background: rgba(239, 68, 68, 0.32);
      color: #fecaca;
    }
    /* --- Dark: In-Pet Manager Check-in Panel --- */
    .openpets-check-in-panel {
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.96), rgba(46, 38, 78, 0.95));
      color: #e2e8f0;
      border-color: rgba(148, 163, 184, 0.28);
      box-shadow: 0 12px 24px rgba(2, 6, 23, 0.42), 0 2px 5px rgba(2, 6, 23, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08);
      color-scheme: dark;
    }
    /* Tail: opaque mid-gradient tone so the overlap with the panel does not double up */
    .openpets-check-in-panel::after {
      background: #272845;
      border-right-color: rgba(148, 163, 184, 0.22);
      border-bottom-color: rgba(148, 163, 184, 0.22);
      box-shadow: 3px 3px 7px rgba(2, 6, 23, 0.25);
    }

    /* Header */
    .check-in-header {
      background: transparent;
      border-bottom-color: rgba(148, 163, 184, 0.2);
    }
    .check-in-title {
      color: #f1f5f9;
    }
    .check-in-progress {
      color: #94a3b8;
    }
    .check-in-intro {
      color: #cbd5e1;
    }
    .check-in-close-btn {
      background: rgba(148, 163, 184, 0.16);
      color: #cbd5e1;
      border-color: rgba(148, 163, 184, 0.28);
    }
    .check-in-close-btn:hover {
      background: rgba(148, 163, 184, 0.26);
      color: #f8fafc;
      border-color: rgba(148, 163, 184, 0.45);
    }
    .check-in-close-btn:active {
      background: rgba(148, 163, 184, 0.34);
    }

    /* Body + scrollbar */
    .check-in-body {
      scrollbar-color: rgba(148, 163, 184, 0.4) transparent;
    }
    .check-in-body::-webkit-scrollbar-thumb {
      background: rgba(148, 163, 184, 0.4);
    }
    .check-in-label {
      color: #cbd5e1;
    }

    /* Feeling buttons: neutral states */
    .check-in-feeling-btn {
      border-color: rgba(148, 163, 184, 0.24);
      background: rgba(148, 163, 184, 0.08);
    }
    .check-in-feeling-btn:hover:not(:disabled) {
      border-color: rgba(148, 163, 184, 0.45);
      background: rgba(148, 163, 184, 0.16);
    }
    .check-in-feeling-btn:active:not(:disabled) {
      background: rgba(148, 163, 184, 0.24);
    }
    .check-in-feeling-btn .check-in-feeling-name {
      color: #e2e8f0;
    }

    /* Feeling: good (emerald) */
    .check-in-feeling-btn[data-code="good"] .check-in-feeling-icon {
      background: rgba(16, 185, 129, 0.18);
      color: #34d399;
    }
    .check-in-feeling-btn[data-code="good"]:hover:not(:disabled) {
      border-color: rgba(52, 211, 153, 0.55);
      background: rgba(16, 185, 129, 0.12);
    }
    .check-in-feeling-btn[data-code="good"].is-selected {
      border-color: #34d399;
      background: rgba(16, 185, 129, 0.2);
    }
    .check-in-feeling-btn[data-code="good"].is-selected .check-in-feeling-name {
      color: #a7f3d0;
    }

    /* Feeling: steady (sky) */
    .check-in-feeling-btn[data-code="steady"] .check-in-feeling-icon {
      background: rgba(14, 165, 233, 0.18);
      color: #38bdf8;
    }
    .check-in-feeling-btn[data-code="steady"]:hover:not(:disabled) {
      border-color: rgba(56, 189, 248, 0.55);
      background: rgba(14, 165, 233, 0.12);
    }
    .check-in-feeling-btn[data-code="steady"].is-selected {
      border-color: #38bdf8;
      background: rgba(14, 165, 233, 0.2);
    }
    .check-in-feeling-btn[data-code="steady"].is-selected .check-in-feeling-name {
      color: #bae6fd;
    }

    /* Feeling: stretched (amber) */
    .check-in-feeling-btn[data-code="stretched"] .check-in-feeling-icon {
      background: rgba(245, 158, 11, 0.18);
      color: #fbbf24;
    }
    .check-in-feeling-btn[data-code="stretched"]:hover:not(:disabled) {
      border-color: rgba(251, 191, 36, 0.55);
      background: rgba(245, 158, 11, 0.12);
    }
    .check-in-feeling-btn[data-code="stretched"].is-selected {
      border-color: #fbbf24;
      background: rgba(245, 158, 11, 0.2);
    }
    .check-in-feeling-btn[data-code="stretched"].is-selected .check-in-feeling-name {
      color: #fde68a;
    }

    /* Feeling: struggling (orange) */
    .check-in-feeling-btn[data-code="struggling"] .check-in-feeling-icon {
      background: rgba(249, 115, 22, 0.18);
      color: #fb923c;
    }
    .check-in-feeling-btn[data-code="struggling"]:hover:not(:disabled) {
      border-color: rgba(251, 146, 60, 0.55);
      background: rgba(249, 115, 22, 0.12);
    }
    .check-in-feeling-btn[data-code="struggling"].is-selected {
      border-color: #fb923c;
      background: rgba(249, 115, 22, 0.2);
    }
    .check-in-feeling-btn[data-code="struggling"].is-selected .check-in-feeling-name {
      color: #fed7aa;
    }

    /* Feeling: need support (rose) */
    .check-in-feeling-btn[data-code="need_support"] .check-in-feeling-icon {
      background: rgba(244, 63, 94, 0.18);
      color: #fb7185;
    }
    .check-in-feeling-btn[data-code="need_support"]:hover:not(:disabled) {
      border-color: rgba(251, 113, 133, 0.55);
      background: rgba(244, 63, 94, 0.12);
    }
    .check-in-feeling-btn[data-code="need_support"].is-selected {
      border-color: #fb7185;
      background: rgba(244, 63, 94, 0.2);
    }
    .check-in-feeling-btn[data-code="need_support"].is-selected .check-in-feeling-name {
      color: #fecdd3;
    }

    /* Note field */
    .check-in-char-counter {
      color: #94a3b8;
    }
    .check-in-textarea {
      border-color: rgba(148, 163, 184, 0.35);
      background: rgba(15, 23, 42, 0.6);
      color: #e2e8f0;
      caret-color: #60a5fa;
    }
    .check-in-textarea:focus {
      border-color: #60a5fa;
    }
    .check-in-textarea::placeholder {
      color: #94a3b8;
    }

    /* Visibility notice */
    .check-in-visibility-notice {
      background: rgba(148, 163, 184, 0.1);
      border-color: rgba(148, 163, 184, 0.24);
      color: #cbd5e1;
    }
    .check-in-visibility-notice svg {
      color: #a5b4fc;
    }

    /* Error banner */
    .check-in-error-banner {
      background: rgba(239, 68, 68, 0.16);
      border-color: rgba(248, 113, 113, 0.4);
      color: #fca5a5;
    }

    /* Footer + submit (indigo brand kept) */
    .check-in-footer {
      background: transparent;
      border-top-color: rgba(148, 163, 184, 0.2);
    }
    .check-in-submit-btn {
      border-color: #6366f1;
      background: #4f46e5;
      color: #ffffff;
      box-shadow: 0 2px 6px rgba(2, 6, 23, 0.35);
    }
    .check-in-submit-btn:hover:not(:disabled) {
      background: #4338ca;
      border-color: #818cf8;
    }
    .check-in-submit-btn:active:not(:disabled) {
      background: #3730a3;
    }
    /* --- Practice Session Overlay: dark pet theme --- */
    .openpets-session-overlay {
      color-scheme: dark;
    }

    /* Card shell */
    .session-card {
      background: linear-gradient(160deg, rgba(30, 41, 59, 0.97) 0%, rgba(36, 40, 70, 0.96) 60%, rgba(46, 38, 78, 0.95) 100%);
      border-color: rgba(148, 163, 184, 0.28);
      box-shadow: 0 12px 24px rgba(2, 6, 23, 0.42), 0 2px 5px rgba(2, 6, 23, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08);
      color: #e2e8f0;
    }

    /* Header */
    .session-card-header {
      border-bottom-color: rgba(148, 163, 184, 0.2);
    }
    .session-header-icon {
      background: linear-gradient(to bottom right, rgba(51, 65, 85, 0.95), rgba(30, 58, 138, 0.7));
      border-color: rgba(96, 165, 250, 0.3);
      color: #93c5fd;
    }
    .session-header-icon.has-cover {
      background: #0f172a;
      border-color: rgba(148, 163, 184, 0.35);
    }
    .session-header-switch.is-switchable:hover,
    .session-card.is-practice-menu-open .session-header-switch {
      background: rgba(148, 163, 184, 0.14);
    }
    .session-header-chevron {
      color: #94a3b8;
    }
    .session-header-title {
      color: #f1f5f9;
    }
    .session-header-subtitle {
      color: #94a3b8;
    }
    .session-header-count {
      color: #93c5fd;
    }
    .session-header-count .count-unit {
      color: #94a3b8;
    }
    .session-close-btn {
      background: rgba(148, 163, 184, 0.16);
      color: #cbd5e1;
    }
    .session-close-btn:hover {
      background: rgba(148, 163, 184, 0.26);
      color: #f8fafc;
    }

    /* Practice switcher menu */
    .session-practice-menu {
      background: rgba(30, 41, 59, 0.98);
      border-color: rgba(148, 163, 184, 0.3);
      box-shadow: 0 10px 30px rgba(2, 6, 23, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06);
      scrollbar-color: rgba(148, 163, 184, 0.4) transparent;
    }
    .session-practice-option:hover {
      background: rgba(148, 163, 184, 0.14);
    }
    .session-practice-option.is-current {
      background: rgba(59, 130, 246, 0.2);
    }
    .session-practice-option-icon {
      background: linear-gradient(to bottom right, rgba(51, 65, 85, 0.95), rgba(30, 58, 138, 0.7));
      border-color: rgba(96, 165, 250, 0.3);
      color: #93c5fd;
    }
    .session-practice-option-name {
      color: #e2e8f0;
    }
    .session-practice-option.is-current .session-practice-option-name {
      color: #93c5fd;
    }
    .session-practice-option-mark {
      color: #60a5fa;
    }
    .session-practice-menu-divider {
      background: rgba(148, 163, 184, 0.2);
    }

    /* Pattern chips */
    .session-pattern-chip {
      background: rgba(15, 23, 42, 0.45);
      border-color: rgba(148, 163, 184, 0.24);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
    }
    .session-pattern-chip:hover {
      background: rgba(51, 65, 85, 0.6);
      border-color: rgba(96, 165, 250, 0.5);
    }
    .session-pattern-chip.is-selected {
      background: rgba(59, 130, 246, 0.2);
      border-color: rgba(96, 165, 250, 0.6);
    }
    .session-chip-name {
      color: #e2e8f0;
    }
    .session-chip-timing {
      color: #94a3b8;
    }
    .session-pattern-chip.is-selected .session-chip-name,
    .session-pattern-chip.is-selected .session-chip-timing {
      color: #93c5fd;
    }

    /* Media player: caption, progress, transport */
    .session-player-caption {
      color: #cbd5e1;
    }
    .session-player-caption[data-status]:not([data-status=""])::before {
      color: #fbbf24;
    }
    .session-player-progress {
      color: #94a3b8;
    }
    .session-player-bar {
      background: rgba(148, 163, 184, 0.2);
    }
    .session-player-bar-fill {
      background: #3b96ff;
    }
    .session-player-btn {
      border-color: rgba(96, 165, 250, 0.35);
      background: rgba(148, 163, 184, 0.16);
      color: #93c5fd;
    }
    .session-player-btn:hover:not(:disabled) {
      background: rgba(148, 163, 184, 0.26);
    }
    .session-sound-volume-icon {
      color: #94a3b8;
    }
    .session-sound-volume-input {
      accent-color: #3b96ff;
    }
    .session-sound-timer-btn {
      border-color: rgba(148, 163, 184, 0.3);
      background: rgba(148, 163, 184, 0.16);
      color: #cbd5e1;
    }
    .session-sound-timer-btn.is-set {
      background: rgba(59, 130, 246, 0.22);
      border-color: rgba(96, 165, 250, 0.55);
      color: #bfdbfe;
    }

    /* Grounding checklist */
    .session-grounding-item {
      border-color: rgba(148, 163, 184, 0.24);
      background: rgba(15, 23, 42, 0.45);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
    }
    .session-grounding-item:hover {
      background: rgba(51, 65, 85, 0.6);
      border-color: rgba(96, 165, 250, 0.45);
    }
    .session-grounding-list.is-inert .session-grounding-item:hover {
      background: rgba(15, 23, 42, 0.45);
      border-color: rgba(148, 163, 184, 0.24);
    }
    .session-grounding-check {
      border-color: rgba(148, 163, 184, 0.55);
    }
    .session-grounding-item.is-checked {
      background: rgba(30, 41, 59, 0.85);
    }
    .session-grounding-text {
      color: #e2e8f0;
    }
    .session-grounding-guidance {
      color: #94a3b8;
    }
    .session-grounding-summary {
      border-color: rgba(148, 163, 184, 0.24);
      background: rgba(15, 23, 42, 0.45);
    }
    .session-grounding-summary-icon {
      background: rgba(148, 163, 184, 0.16);
    }
    .session-grounding-summary-label {
      color: #e2e8f0;
    }

    /* Illustration and PMR cue columns. The PMR art has near-black outlines on a
       transparent background, so it keeps a muted light frame to stay legible. */
    .session-illustration {
      background: radial-gradient(circle at 50% 45%, rgba(203, 213, 225, 0.82), rgba(148, 163, 184, 0.62));
      border-color: rgba(148, 163, 184, 0.28);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18);
    }
    .session-cues-col {
      background: rgba(15, 23, 42, 0.45);
      border-color: rgba(148, 163, 184, 0.22);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
    }
    .session-cues-col.is-tense.is-active {
      background: rgba(230, 163, 107, 0.16);
      border-color: rgba(230, 163, 107, 0.55);
      box-shadow: 0 2px 10px rgba(230, 163, 107, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.06);
    }
    .session-cues-col.is-release.is-active {
      background: rgba(79, 220, 197, 0.14);
      border-color: rgba(79, 220, 197, 0.55);
      box-shadow: 0 2px 10px rgba(79, 220, 197, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.06);
    }
    .session-cues-title {
      color: #94a3b8;
    }
    .session-cues-col.is-tense.is-active .session-cues-title {
      color: #f0b27a;
    }
    .session-cues-col.is-release.is-active .session-cues-title {
      color: #5eead4;
    }
    .session-cue-badge {
      background: rgba(148, 163, 184, 0.22);
      color: #cbd5e1;
    }
    .session-cue-text {
      color: #cbd5e1;
    }
    .session-cues-col.is-active .session-cue-text {
      color: #f1f5f9;
    }

    /* Progress dots */
    .session-dot {
      background: rgba(148, 163, 184, 0.24);
    }
    .session-dot.is-done {
      background: #3b96ff;
    }
    .session-dots-bar {
      background: rgba(148, 163, 184, 0.2);
    }
    .session-dots-bar-fill {
      background: #3b96ff;
    }
    .session-dots-count {
      color: #cbd5e1;
    }
    .session-dots-count .count-current {
      color: #93c5fd;
    }

    /* Stat tiles */
    .session-tile {
      background: rgba(15, 23, 42, 0.45);
      border-color: rgba(148, 163, 184, 0.24);
    }
    .session-tile.is-middle {
      background: rgba(59, 130, 246, 0.16);
      border-color: rgba(96, 165, 250, 0.35);
    }
    .session-tile-icon {
      background: rgba(59, 130, 246, 0.2);
      color: #93c5fd;
    }
    .session-tile-value {
      color: #f1f5f9;
    }
    .session-tile-value.is-icon {
      color: #60a5fa;
    }
    .session-tile-label {
      color: #94a3b8;
    }
    .session-lungs {
      color: #60a5fa;
    }

    /* Phase steps */
    .session-step-bar {
      background: rgba(148, 163, 184, 0.14);
      border-color: rgba(148, 163, 184, 0.22);
    }
    .session-step.is-done .session-step-fill {
      background: rgba(96, 165, 250, 0.45);
    }
    .session-step-label {
      color: #94a3b8;
    }
    .session-step.is-active .session-step-label {
      color: #93c5fd;
    }

    /* Controls */
    .session-info-btn {
      border-color: rgba(96, 165, 250, 0.4);
      background: rgba(148, 163, 184, 0.16);
      color: #93c5fd;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 2px 4px rgba(2, 6, 23, 0.3);
    }
    .session-info-btn:hover {
      background: rgba(148, 163, 184, 0.26);
      border-color: rgba(96, 165, 250, 0.6);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 2px 4px rgba(2, 6, 23, 0.34);
    }
    .session-primary-btn {
      border-color: rgba(96, 165, 250, 0.45);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 2px 6px rgba(2, 6, 23, 0.4);
    }
    .session-ghost-btn {
      border-color: rgba(96, 165, 250, 0.4);
      background: rgba(148, 163, 184, 0.16);
      color: #93c5fd;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 2px 4px rgba(2, 6, 23, 0.3);
    }
    .session-ghost-btn:hover {
      background: rgba(148, 163, 184, 0.26);
      border-color: rgba(96, 165, 250, 0.6);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 2px 4px rgba(2, 6, 23, 0.34);
    }

    /* Footer */
    .session-footer {
      color: #94a3b8;
    }
`;
