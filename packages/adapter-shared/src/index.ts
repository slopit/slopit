/**
 * Shared utilities for slopit platform adapters.
 *
 * @module
 */

// Base recorder
export { BaseRecorder } from "./base-recorder.js";

// Element discovery
export { discoverElement, discoverElements } from "./element-discovery.js";
export type { DiscoverElementOptions, DiscoverElementsOptions } from "./element-discovery.js";

// Export utilities
export {
  captureEnvironment,
  completeSession,
  convertCompletedTrialToSlopit,
  convertTrialToSlopit,
  createSessionMetadata,
  createTextResponse,
} from "./export-utils.js";
export type {
  CompleteSessionOptions,
  CreateSessionMetadataOptions,
  EnvironmentInfo,
  TrialConversionData,
} from "./export-utils.js";

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

// Test utilities
export {
  MockClipboardEvent,
  MockDataTransfer,
  createMockBehavioralData,
  createMockInput,
  createMockTextarea,
  delay,
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
export type { SimulateKeystrokeOptions, SimulatePasteOptions } from "./test-utils.js";
