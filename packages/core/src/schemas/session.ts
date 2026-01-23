import type { BehavioralData } from "./behavioral.js";
import type { CaptureFlag } from "./flags.js";

/**
 * Information about the experiment platform.
 */
export interface PlatformInfo {
  /**
   * Platform name.
   * Known values: "jspsych", "labjs", "psychojs", "gorilla", "qualtrics", "custom"
   */
  name: string;

  /**
   * Platform version string.
   */
  version?: string;

  /**
   * Adapter version used for capture.
   */
  adapterVersion?: string;
}

/**
 * Client environment information.
 * Captured at session start.
 */
export interface EnvironmentInfo {
  /**
   * Browser user agent string.
   */
  userAgent: string;

  /**
   * Screen dimensions in pixels.
   */
  screenResolution: [width: number, height: number];

  /**
   * Viewport dimensions in pixels.
   */
  viewportSize: [width: number, height: number];

  /**
   * Device pixel ratio.
   */
  devicePixelRatio: number;

  /**
   * IANA timezone identifier.
   * Example: "America/New_York"
   */
  timezone: string;

  /**
   * Browser language setting.
   * Example: "en-US"
   */
  language: string;

  /**
   * Whether touch input is available.
   */
  touchCapable: boolean;

  /**
   * Estimated connection type if available.
   * From Navigator.connection API.
   */
  connectionType?: string;
}

/**
 * Session-level timing information.
 */
export interface SessionTiming {
  /**
   * Session start time.
   * Unix timestamp in milliseconds.
   */
  startTime: number;

  /**
   * Session end time.
   * Unix timestamp in milliseconds.
   * Undefined if session incomplete.
   */
  endTime?: number;

  /**
   * Total duration in milliseconds.
   * Computed as endTime - startTime.
   */
  duration?: number;
}

/**
 * Information about the trial stimulus.
 */
export interface StimulusInfo {
  /**
   * Stimulus type.
   */
  type: "text" | "image" | "audio" | "video" | "html" | "other";

  /**
   * Stimulus content.
   * For text: the text content.
   * For media: URL or data URI.
   * For HTML: the HTML string.
   */
  content?: string;

  /**
   * SHA-256 hash of content for deduplication.
   */
  contentHash?: string;

  /**
   * Additional stimulus parameters.
   */
  parameters?: Record<string, unknown>;
}

/**
 * Span annotation for text highlighting tasks.
 */
export interface SpanAnnotation {
  /**
   * Start character index (inclusive).
   */
  start: number;

  /**
   * End character index (exclusive).
   */
  end: number;

  /**
   * Annotation label or category.
   */
  label: string;

  /**
   * Annotated text content.
   */
  text: string;
}

/**
 * Participant response information.
 */
export interface ResponseInfo {
  /**
   * Response type.
   */
  type: "text" | "choice" | "multi-choice" | "slider" | "likert" | "annotation" | "other";

  /**
   * Response value.
   * Type depends on response type:
   * - text: string
   * - choice: string or number
   * - multi-choice: string[] or number[]
   * - slider: number
   * - likert: number
   * - annotation: SpanAnnotation[]
   * - other: unknown
   */
  value: unknown;

  /**
   * For text responses, character count.
   */
  characterCount?: number;

  /**
   * For text responses, word count.
   */
  wordCount?: number;
}

/**
 * Data for a single trial.
 */
export interface SlopitTrial {
  /**
   * Unique trial identifier.
   * Generated client-side or from platform.
   */
  trialId: string;

  /**
   * Zero-indexed trial position in session.
   */
  trialIndex: number;

  /**
   * Trial type identifier.
   * Matches jsPsych trial.type or equivalent.
   */
  trialType?: string;

  /**
   * Trial start time.
   * Unix timestamp in milliseconds.
   */
  startTime: number;

  /**
   * Trial end time.
   * Unix timestamp in milliseconds.
   */
  endTime: number;

  /**
   * Response time in milliseconds.
   * Time from trial start to response submission.
   */
  rt?: number;

  /**
   * Stimulus information.
   */
  stimulus?: StimulusInfo;

  /**
   * Participant response.
   */
  response?: ResponseInfo;

  /**
   * Behavioral capture data.
   */
  behavioral?: BehavioralData;

  /**
   * Platform-specific trial data.
   * Passed through without modification.
   */
  platformData?: Record<string, unknown>;

  /**
   * Trial-level flags generated during capture.
   */
  captureFlags?: CaptureFlag[];
}

/**
 * Session-level focus event.
 */
export interface SessionFocusEvent {
  /**
   * Unix timestamp in milliseconds.
   */
  timestamp: number;

  /**
   * Event type.
   */
  event: "focus" | "blur" | "visibilitychange";

  /**
   * Visibility state if applicable.
   */
  visibility?: "visible" | "hidden";
}

/**
 * Error event.
 */
export interface ErrorEvent {
  /**
   * Unix timestamp in milliseconds.
   */
  timestamp: number;

  /**
   * Error message.
   */
  message: string;

  /**
   * Error stack trace if available.
   */
  stack?: string;

  /**
   * Error source (filename, line, column).
   */
  source?: string;
}

/**
 * Custom event from platform or study.
 */
export interface CustomEvent {
  /**
   * Unix timestamp in milliseconds.
   */
  timestamp: number;

  /**
   * Event type identifier.
   */
  type: string;

  /**
   * Event data.
   */
  data?: Record<string, unknown>;
}

/**
 * Events not tied to specific trials.
 */
export interface GlobalEvents {
  /**
   * Focus events at session level.
   */
  focus: SessionFocusEvent[];

  /**
   * Error events.
   */
  errors: ErrorEvent[];

  /**
   * Custom events from platform or study.
   */
  custom?: CustomEvent[];
}

/**
 * Root container for a participant session.
 *
 * Contains all behavioral data, responses, and metadata
 * collected during a single study session.
 */
export interface SlopitSession {
  /**
   * Schema version for forward compatibility.
   * Current version: "1.0"
   */
  schemaVersion: "1.0";

  /**
   * Unique identifier for this session.
   * Generated client-side using crypto.randomUUID().
   */
  sessionId: string;

  /**
   * Participant identifier from recruitment platform.
   * For Prolific: PROLIFIC_PID
   * For MTurk: workerId
   * May be undefined for anonymous studies.
   */
  participantId?: string;

  /**
   * Study identifier.
   * Matches JATOS study ID or equivalent.
   */
  studyId?: string;

  /**
   * Platform information.
   */
  platform: PlatformInfo;

  /**
   * Client environment information.
   */
  environment: EnvironmentInfo;

  /**
   * Session timing.
   */
  timing: SessionTiming;

  /**
   * Array of trial data.
   */
  trials: SlopitTrial[];

  /**
   * Events not tied to specific trials.
   */
  globalEvents: GlobalEvents;

  /**
   * Session-level metadata.
   * Platform-specific or study-specific data.
   */
  metadata?: Record<string, unknown>;
}
