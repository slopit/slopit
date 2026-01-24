// Types from schemas

// Constants
export { DEFAULT_CONFIG, KNOWN_PLATFORMS, SCHEMA_VERSION, SEVERITY_LEVELS } from "./constants.js";
export type {
  AnalysisFlag,
  // Behavioral types
  BehavioralData,
  BehavioralMetrics,
  // Flag types
  CaptureFlag,
  ClipboardCopyEvent,
  CustomEvent,
  EnvironmentInfo,
  ErrorEvent,
  FocusEvent,
  FocusMetrics,
  GlobalEvents,
  InputDurationEvent,
  InputDurationMetrics,
  KeystrokeEvent,
  KeystrokeMetrics,
  ModifierState,
  MouseEvent,
  MouseMetrics,
  PasteEvent,
  PlatformInfo,
  ResponseInfo,
  ScrollEvent,
  ScrollMetrics,
  SessionFocusEvent,
  SessionTiming,
  Severity,
  // Session types
  SlopitSession,
  SlopitTrial,
  SpanAnnotation,
  StimulusInfo,
  TimingMetrics,
} from "./schemas/index.js";
// Utilities
export {
  captureEnvironment,
  duration,
  formatDuration,
  fromTimestamp,
  generateSessionId,
  generateTrialId,
  hashText,
  highResTime,
  now,
  simpleHash,
  toTimestamp,
} from "./utils/index.js";
export type { ValidationResult } from "./validation/index.js";
// Validation
export {
  AnalysisFlagSchema,
  BehavioralDataSchema,
  CaptureFlagSchema,
  FocusEventSchema,
  isValidSession,
  KeystrokeEventSchema,
  PasteEventSchema,
  SlopitSessionSchema,
  SlopitTrialSchema,
  validateSession,
} from "./validation/index.js";
