// Session types
export type {
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
} from "./session.js";

// Behavioral types
export type {
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
} from "./behavioral.js";

// Flag types
export type { CaptureFlag, AnalysisFlag, Severity } from "./flags.js";
