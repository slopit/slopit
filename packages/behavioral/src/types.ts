import type {
  ClipboardCopyEvent,
  FocusEvent,
  InputDurationEvent,
  KeystrokeEvent,
  MouseEvent,
  PasteEvent,
  ScrollEvent,
} from "@slopit/core";

/**
 * Configuration for behavioral capture.
 */
export interface BehavioralCaptureConfig {
  /**
   * Keystroke capture configuration.
   */
  keystroke?: KeystrokeCaptureConfig;

  /**
   * Focus/visibility capture configuration.
   */
  focus?: FocusCaptureConfig;

  /**
   * Paste event capture configuration.
   */
  paste?: PasteCaptureConfig;

  /**
   * Input duration capture configuration.
   */
  inputDuration?: InputDurationCaptureConfig;

  /**
   * Clipboard capture configuration (paste, copy, cut).
   */
  clipboard?: ClipboardCaptureConfig;

  /**
   * Mouse event capture configuration.
   */
  mouse?: MouseCaptureConfig;

  /**
   * Scroll event capture configuration.
   */
  scroll?: ScrollCaptureConfig;
}

/**
 * Keystroke capture configuration.
 */
export interface KeystrokeCaptureConfig {
  /**
   * Whether to capture keystrokes.
   * @default true
   */
  enabled?: boolean;

  /**
   * Whether to capture keyup events in addition to keydown.
   * @default true
   */
  captureKeyUp?: boolean;

  /**
   * Whether to include modifier key states.
   * @default true
   */
  includeModifiers?: boolean;
}

/**
 * Focus capture configuration.
 */
export interface FocusCaptureConfig {
  /**
   * Whether to capture focus events.
   * @default true
   */
  enabled?: boolean;

  /**
   * Whether to use the Page Visibility API.
   * @default true
   */
  useVisibilityAPI?: boolean;

  /**
   * Whether to use window blur/focus events.
   * @default true
   */
  useBlurFocus?: boolean;
}

/**
 * Paste capture configuration.
 */
export interface PasteCaptureConfig {
  /**
   * Whether to capture paste events.
   * @default true
   */
  enabled?: boolean;

  /**
   * Whether to prevent paste operations.
   * @default false
   */
  prevent?: boolean;

  /**
   * Message to show when paste is prevented.
   */
  warnMessage?: string;

  /**
   * Whether to capture a preview of pasted text.
   * @default true
   */
  capturePreview?: boolean;

  /**
   * Length of text preview to capture.
   * @default 100
   */
  previewLength?: number;
}

/**
 * Input duration capture configuration.
 */
export interface InputDurationCaptureConfig {
  /**
   * Whether to capture input duration events.
   * @default true
   */
  enabled?: boolean;

  /**
   * Whether to count keystrokes during focus periods.
   * @default true
   */
  trackKeystrokes?: boolean;

  /**
   * Whether to count paste events during focus periods.
   * @default true
   */
  trackPastes?: boolean;
}

/**
 * Clipboard capture configuration for paste and copy/cut events.
 */
export interface ClipboardCaptureConfig {
  /**
   * Whether clipboard capture is enabled.
   * @default true
   */
  enabled?: boolean;

  /**
   * Whether to capture paste events.
   * @default true
   */
  capturePaste?: boolean;

  /**
   * Whether to capture copy and cut events.
   * @default true
   */
  captureCopyCut?: boolean;

  /**
   * Whether to prevent paste operations.
   * @default false
   */
  prevent?: boolean;

  /**
   * Message to show when paste is prevented.
   */
  warnMessage?: string;

  /**
   * Whether to capture a preview of clipboard text.
   * @default true
   */
  capturePreview?: boolean;

  /**
   * Length of text preview to capture.
   * @default 100
   */
  previewLength?: number;
}

/**
 * Mouse capture configuration.
 */
export interface MouseCaptureConfig {
  /**
   * Whether mouse capture is enabled.
   * @default true
   */
  enabled?: boolean;

  /**
   * Whether to capture click events (mousedown, mouseup, click).
   * @default true
   */
  captureClicks?: boolean;

  /**
   * Whether to capture mousemove events.
   * @default true
   */
  captureMovement?: boolean;

  /**
   * Throttle interval for mousemove events in milliseconds.
   * Lower values capture more detail but produce more data.
   * @default 50
   */
  throttleMs?: number;

  /**
   * Threshold for detecting idle periods in milliseconds.
   * Periods with no mouse activity exceeding this threshold are recorded.
   * @default 5000
   */
  idleThresholdMs?: number;
}

/**
 * Scroll capture configuration.
 */
export interface ScrollCaptureConfig {
  /**
   * Whether to capture scroll events.
   * @default true
   */
  enabled?: boolean;

  /**
   * Throttle interval for scroll events in milliseconds.
   * @default 100
   */
  throttleMs?: number;

  /**
   * Whether to capture scroll direction changes.
   * @default true
   */
  captureDirection?: boolean;
}

/**
 * Event handlers for behavioral capture events.
 */
export interface BehavioralCaptureEvents {
  keystroke: (event: KeystrokeEvent) => void;
  focus: (event: FocusEvent) => void;
  paste: (event: PasteEvent) => void;
  inputDuration: (event: InputDurationEvent) => void;
  clipboard: (event: ClipboardCopyEvent) => void;
  mouse: (event: MouseEvent) => void;
  scroll: (event: ScrollEvent) => void;
}

/**
 * Normalized (fully resolved) configuration.
 */
export interface NormalizedConfig {
  keystroke: Required<KeystrokeCaptureConfig>;
  focus: Required<FocusCaptureConfig>;
  paste: Required<Omit<PasteCaptureConfig, "warnMessage">> & { warnMessage?: string };
  inputDuration: Required<InputDurationCaptureConfig>;
  clipboard: Required<Omit<ClipboardCaptureConfig, "warnMessage">> & { warnMessage?: string };
  mouse: Required<MouseCaptureConfig>;
  scroll: Required<ScrollCaptureConfig>;
}
