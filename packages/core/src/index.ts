// Types from schemas
export type {
  // Session types
  SlopitSession,
  SlopitTrial,
  PlatformInfo,
  EnvironmentInfo,
  SessionTiming,
  StimulusInfo,
  ResponseInfo,
  SpanAnnotation,
  GlobalEvents,
  SessionFocusEvent,
  ErrorEvent,
  CustomEvent,
  // Behavioral types
  BehavioralData,
  BehavioralMetrics,
  KeystrokeEvent,
  KeystrokeMetrics,
  FocusEvent,
  FocusMetrics,
  PasteEvent,
  TimingMetrics,
  ModifierState,
  MouseEvent,
  MouseMetrics,
  ScrollEvent,
  ScrollMetrics,
  ClipboardCopyEvent,
  InputDurationEvent,
  InputDurationMetrics,
  // Flag types
  CaptureFlag,
  AnalysisFlag,
  Severity,
} from "./schemas/index.js";

// Validation
export {
  SlopitSessionSchema,
  SlopitTrialSchema,
  BehavioralDataSchema,
  KeystrokeEventSchema,
  FocusEventSchema,
  PasteEventSchema,
  CaptureFlagSchema,
  AnalysisFlagSchema,
  validateSession,
  isValidSession,
} from "./validation/index.js";

export type { ValidationResult } from "./validation/index.js";

// Utilities
export {
  generateSessionId,
  generateTrialId,
  hashText,
  simpleHash,
  now,
  highResTime,
  duration,
  formatDuration,
  toTimestamp,
  fromTimestamp,
  captureEnvironment,
} from "./utils/index.js";

// Constants
export { SCHEMA_VERSION, DEFAULT_CONFIG, SEVERITY_LEVELS, KNOWN_PLATFORMS } from "./constants.js";
