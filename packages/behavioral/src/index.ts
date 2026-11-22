export { BehavioralCapture, createBehavioralCapture } from "./capture.js";
export { ClipboardCollector } from "./collectors/clipboard.js";
export { FocusCollector } from "./collectors/focus.js";
// Individual collectors for advanced use
export { KeystrokeCollector } from "./collectors/keystroke.js";
export { PasteCollector } from "./collectors/paste.js";
export {
  captureResponseControls,
  type ResponseControlsConfig,
} from "./collectors/response-controls.js";
// Detection modules
export type {
  DetectionIndicator,
  DetectionResult,
  Detector,
  ExtensionDetectorConfig,
  TextAppearanceCallbacks,
  TextAppearanceDetectorConfig,
} from "./detection/index.js";
export {
  createExtensionDetector,
  ExtensionDetector,
  TextAppearanceDetector,
} from "./detection/index.js";
// Intervention modules
export type {
  BehavioralState,
  BlurThreshold,
  ChallengeConfig,
  ChallengeRenderer,
  ChallengeResult,
  ChallengeType,
  IdleThreshold,
  InterventionManagerConfig,
  InterventionResult,
  InterventionType,
  PasteThreshold,
  TimingThreshold,
  TriggerConfig,
} from "./intervention/index.js";
export {
  createChallenge,
  createInterventionManager,
  InterventionManager,
  MemoryRecallChallenge,
  TypingTestChallenge,
} from "./intervention/index.js";
export { computeFocusMetrics } from "./metrics/focus-metrics.js";
// Metrics calculators
export { computeKeystrokeMetrics } from "./metrics/keystroke-metrics.js";
export { computeTimingMetrics } from "./metrics/timing-metrics.js";
export type {
  BehavioralCaptureConfig,
  BehavioralCaptureEvents,
  ClipboardCaptureConfig,
  FocusCaptureConfig,
  KeystrokeCaptureConfig,
  PasteCaptureConfig,
} from "./types.js";
export type {
  EnhancedBehavioralData,
  InputWrapperConfig,
  WrapperEvent,
  WrapperInterventionManager,
  WrapperInterventionResult,
} from "./wrappers/index.js";
// Wrappers
export {
  createInputWrapper,
  InputWrapper,
} from "./wrappers/index.js";
