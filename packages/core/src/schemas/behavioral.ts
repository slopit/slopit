/**
 * Modifier key states at time of keystroke.
 */
export interface ModifierState {
  shift: boolean;
  ctrl: boolean;
  alt: boolean;
  meta: boolean;
}

/**
 * A single keystroke event.
 */
export interface KeystrokeEvent {
  /**
   * Time since trial start in milliseconds.
   */
  time: number;

  /**
   * Key value from KeyboardEvent.key.
   * Examples: "a", "Enter", "Backspace", "Shift"
   */
  key: string;

  /**
   * Physical key code from KeyboardEvent.code.
   * Examples: "KeyA", "Enter", "Backspace", "ShiftLeft"
   */
  code: string;

  /**
   * Event type.
   */
  event: "keydown" | "keyup";

  /**
   * Current text length at this moment.
   * Captured from input element.
   */
  textLength?: number;

  /**
   * Modifier key states.
   */
  modifiers?: ModifierState;
}

/**
 * A focus or visibility change event.
 */
export interface FocusEvent {
  /**
   * Time since trial start in milliseconds.
   */
  time: number;

  /**
   * Event type.
   * - focus: window gained focus
   * - blur: window lost focus
   * - visibilitychange: document visibility changed
   */
  event: "focus" | "blur" | "visibilitychange";

  /**
   * For visibilitychange events, the new state.
   */
  visibility?: "visible" | "hidden";

  /**
   * For blur events, duration until refocus.
   * Filled in retrospectively when focus returns.
   */
  blurDuration?: number;
}

/**
 * A paste event.
 */
export interface PasteEvent {
  /**
   * Time since trial start in milliseconds.
   */
  time: number;

  /**
   * Length of pasted text in characters.
   */
  textLength: number;

  /**
   * First N characters of pasted text.
   * For analysis purposes; default N=100.
   */
  textPreview?: string;

  /**
   * SHA-256 hash of full pasted text.
   */
  textHash?: string;

  /**
   * Number of keystrokes in preceding 2 seconds.
   * Low value suggests copy from external source.
   */
  precedingKeystrokes: number;

  /**
   * Whether paste was blocked by configuration.
   */
  blocked: boolean;
}

/**
 * Metrics computed from keystroke data.
 */
export interface KeystrokeMetrics {
  /**
   * Total number of keystrokes.
   */
  totalKeystrokes: number;

  /**
   * Number of printable character keystrokes.
   */
  printableKeystrokes: number;

  /**
   * Number of deletion keystrokes (Backspace, Delete).
   */
  deletions: number;

  /**
   * Mean inter-keystroke interval in milliseconds.
   */
  meanIKI: number;

  /**
   * Standard deviation of IKI.
   */
  stdIKI: number;

  /**
   * Median IKI.
   */
  medianIKI: number;

  /**
   * Number of pauses (IKI > threshold).
   */
  pauseCount: number;

  /**
   * Ratio of final characters to total keystrokes.
   * Low values indicate heavy revision.
   */
  productProcessRatio: number;
}

/**
 * Metrics computed from focus data.
 */
export interface FocusMetrics {
  /**
   * Number of blur events.
   */
  blurCount: number;

  /**
   * Total time in milliseconds with window blurred.
   */
  totalBlurDuration: number;

  /**
   * Number of visibility hidden events.
   */
  hiddenCount: number;

  /**
   * Total time in milliseconds with document hidden.
   */
  totalHiddenDuration: number;
}

/**
 * Timing metrics.
 */
export interface TimingMetrics {
  /**
   * Time from trial start to first keystroke.
   */
  firstKeystrokeLatency?: number;

  /**
   * Time from trial start to response submission.
   */
  totalResponseTime: number;

  /**
   * Characters per minute (excluding deletions).
   */
  charactersPerMinute?: number;
}

/**
 * Computed metrics from behavioral data.
 * Calculated client-side for real-time use.
 */
export interface BehavioralMetrics {
  /**
   * Keystroke metrics.
   */
  keystroke?: KeystrokeMetrics;

  /**
   * Focus metrics.
   */
  focus?: FocusMetrics;

  /**
   * Timing metrics.
   */
  timing?: TimingMetrics;

  /**
   * Mouse metrics.
   */
  mouse?: MouseMetrics;

  /**
   * Scroll metrics.
   */
  scroll?: ScrollMetrics;

  /**
   * Input duration metrics.
   */
  inputDuration?: InputDurationMetrics;
}

/**
 * Container for all behavioral capture data.
 */
export interface BehavioralData {
  /**
   * Keystroke events.
   */
  keystrokes?: KeystrokeEvent[];

  /**
   * Focus/visibility events.
   */
  focus?: FocusEvent[];

  /**
   * Paste events.
   */
  paste?: PasteEvent[];

  /**
   * Mouse events (optional, high volume).
   */
  mouse?: MouseEvent[];

  /**
   * Scroll events.
   */
  scroll?: ScrollEvent[];

  /**
   * Clipboard copy/cut events.
   */
  clipboard?: ClipboardCopyEvent[];

  /**
   * Input duration events.
   */
  inputDuration?: InputDurationEvent[];

  /**
   * Computed metrics from capture.
   */
  metrics?: BehavioralMetrics;
}

/**
 * Mouse event (optional capture).
 */
export interface MouseEvent {
  /**
   * Time since trial start in milliseconds.
   */
  time: number;

  /**
   * Event type.
   */
  event: "mousemove" | "mousedown" | "mouseup" | "click";

  /**
   * X coordinate relative to viewport.
   */
  x: number;

  /**
   * Y coordinate relative to viewport.
   */
  y: number;

  /**
   * Velocity in pixels per millisecond (for mousemove events).
   */
  velocity?: number;

  /**
   * Distance traveled since last event in pixels (for mousemove).
   */
  distance?: number;

  /**
   * Time since last mouse event in milliseconds.
   */
  deltaTime?: number;

  /**
   * Whether this event is part of a drag operation.
   */
  isDragging?: boolean;
}

/**
 * Scroll event for reading vs composing behavior detection.
 */
export interface ScrollEvent {
  /**
   * Time since trial start in milliseconds.
   */
  time: number;

  /**
   * Direction of scroll.
   */
  direction: "up" | "down";

  /**
   * Scroll delta in pixels.
   */
  deltaY: number;

  /**
   * Current scroll position from top.
   */
  scrollTop: number;

  /**
   * Scrollable element height.
   */
  scrollHeight: number;

  /**
   * Viewport height.
   */
  clientHeight: number;

  /**
   * Velocity in pixels per millisecond.
   */
  velocity?: number;
}

/**
 * Clipboard event for copy/cut tracking with selection context.
 */
export interface ClipboardCopyEvent {
  /**
   * Time since trial start in milliseconds.
   */
  time: number;

  /**
   * Event type.
   */
  event: "copy" | "cut";

  /**
   * Length of selected text.
   */
  textLength: number;

  /**
   * First N characters of copied text.
   */
  textPreview?: string;

  /**
   * SHA-256 hash of copied text.
   */
  textHash?: string;

  /**
   * Selection start index in input element.
   */
  selectionStart?: number;

  /**
   * Selection end index in input element.
   */
  selectionEnd?: number;
}

/**
 * Input duration event for per-field focus tracking.
 */
export interface InputDurationEvent {
  /**
   * Time since trial start when focus was gained.
   */
  focusTime: number;

  /**
   * Time since trial start when focus was lost.
   */
  blurTime: number;

  /**
   * Duration focused in milliseconds.
   */
  duration: number;

  /**
   * Element identifier (id or name attribute).
   */
  elementId?: string;

  /**
   * Number of keystrokes during focus.
   */
  keystrokesDuringFocus?: number;

  /**
   * Number of paste events during focus.
   */
  pastesDuringFocus?: number;
}

/**
 * Metrics computed from mouse data.
 */
export interface MouseMetrics {
  /**
   * Total number of mouse events.
   */
  totalEvents: number;

  /**
   * Number of click events.
   */
  clickCount: number;

  /**
   * Mean mouse velocity in pixels per millisecond.
   */
  meanVelocity: number;

  /**
   * Total distance traveled by cursor in pixels.
   */
  totalDistance: number;

  /**
   * Total idle time with no mouse movement in milliseconds.
   */
  totalIdleTime: number;

  /**
   * Number of idle periods exceeding threshold.
   */
  idlePeriodCount: number;
}

/**
 * Metrics computed from scroll data.
 */
export interface ScrollMetrics {
  /**
   * Total number of scroll events.
   */
  totalScrollEvents: number;

  /**
   * Total scroll distance in pixels.
   */
  totalScrollDistance: number;

  /**
   * Number of scroll direction changes.
   */
  directionChanges: number;

  /**
   * Mean scroll velocity.
   */
  meanScrollVelocity: number;

  /**
   * Time spent scrolling up vs down ratio.
   */
  upDownRatio: number;
}

/**
 * Metrics computed from input duration data.
 */
export interface InputDurationMetrics {
  /**
   * Total focus duration across all inputs.
   */
  totalFocusDuration: number;

  /**
   * Mean focus duration per input session.
   */
  meanFocusDuration: number;

  /**
   * Number of focus sessions.
   */
  focusSessionCount: number;

  /**
   * Longest single focus session.
   */
  maxFocusDuration: number;
}
