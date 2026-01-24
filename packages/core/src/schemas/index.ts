// Session types

// Behavioral types
export type {
  BehavioralData,
  BehavioralMetrics,
  ClipboardCopyEvent,
  FocusEvent,
  FocusMetrics,
  InputDurationEvent,
  InputDurationMetrics,
  KeystrokeEvent,
  KeystrokeMetrics,
  ModifierState,
  MouseEvent,
  MouseMetrics,
  PasteEvent,
  ScrollEvent,
  ScrollMetrics,
  TimingMetrics,
} from "./behavioral.js";
// Flag types
export type { AnalysisFlag, CaptureFlag, Severity } from "./flags.js";
export type {
  CustomEvent,
  EnvironmentInfo,
  ErrorEvent,
  GlobalEvents,
  PlatformInfo,
  ResponseInfo,
  SessionFocusEvent,
  SessionTiming,
  SlopitSession,
  SlopitTrial,
  SpanAnnotation,
  StimulusInfo,
} from "./session.js";
