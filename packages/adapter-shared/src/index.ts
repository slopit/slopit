/**
 * Shared utilities for slopit platform adapters.
 *
 * @module
 */

// Base recorder
export { BaseRecorder } from "./base-recorder.js";
export type { DiscoverElementOptions, DiscoverElementsOptions } from "./element-discovery.js";
// Element discovery
export { discoverElement, discoverElements } from "./element-discovery.js";
export type {
  CompleteSessionOptions,
  CreateSessionMetadataOptions,
  EnvironmentInfo,
  TrialConversionData,
} from "./export-utils.js";
// Export utilities
export {
  captureEnvironment,
  completeSession,
  convertCompletedTrialToSlopit,
  convertTrialToSlopit,
  createSessionMetadata,
  createTextResponse,
} from "./export-utils.js";
export type { SimulateKeystrokeOptions, SimulatePasteOptions } from "./test-utils.js";

// Test utilities
export {
  createMockBehavioralData,
  createMockInput,
  createMockTextarea,
  delay,
  MockClipboardEvent,
  MockDataTransfer,
  simulateBlur,
  simulateClick,
  simulateCopy,
  simulateFocus,
  simulateFocusBlur,
  simulateKeystroke,
  simulateMouseMove,
  simulatePaste,
  simulateTyping,
  waitFor,
} from "./test-utils.js";
// Types
export type {
  AdapterConfig,
  AdapterData,
  CompletedTrial,
  PlatformInfo,
  RecorderConfig,
  ResponseInfo,
  SessionMetadata,
  StimulusInfo,
  TrialConfig,
  TrialState,
} from "./types.js";
