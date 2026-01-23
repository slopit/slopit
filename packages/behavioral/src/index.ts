export { BehavioralCapture, createBehavioralCapture } from "./capture.js";
export type {
  BehavioralCaptureConfig,
  BehavioralCaptureEvents,
  KeystrokeCaptureConfig,
  FocusCaptureConfig,
  PasteCaptureConfig,
  ClipboardCaptureConfig,
} from "./types.js";

// Individual collectors for advanced use
export { KeystrokeCollector } from "./collectors/keystroke.js";
export { FocusCollector } from "./collectors/focus.js";
export { PasteCollector } from "./collectors/paste.js";
export { ClipboardCollector } from "./collectors/clipboard.js";

// Metrics calculators
export { computeKeystrokeMetrics } from "./metrics/keystroke-metrics.js";
export { computeFocusMetrics } from "./metrics/focus-metrics.js";
export { computeTimingMetrics } from "./metrics/timing-metrics.js";

// Detection modules
export type {
  DetectionIndicator,
  DetectionResult,
  Detector,
  TextAppearanceDetectorConfig,
  TextAppearanceCallbacks,
  ExtensionDetectorConfig,
} from "./detection/index.js";

export {
  TextAppearanceDetector,
  ExtensionDetector,
  createExtensionDetector,
} from "./detection/index.js";

// Intervention modules
export type {
  InterventionType,
  TriggerConfig,
  InterventionResult,
  InterventionManagerConfig,
  BehavioralState,
  PasteThreshold,
  BlurThreshold,
  IdleThreshold,
  TimingThreshold,
  ChallengeType,
  ChallengeConfig,
  ChallengeResult,
  ChallengeRenderer,
} from "./intervention/index.js";

export {
  InterventionManager,
  createInterventionManager,
  TypingTestChallenge,
  MemoryRecallChallenge,
  createChallenge,
} from "./intervention/index.js";

// Wrappers
export {
  InputWrapper,
  createInputWrapper,
} from "./wrappers/index.js";

export type {
  InputWrapperConfig,
  EnhancedBehavioralData,
  WrapperEvent,
  WrapperInterventionManager,
  WrapperInterventionResult,
} from "./wrappers/index.js";
