/**
 * Framework-agnostic adapter for slopit behavioral capture.
 *
 * Provides a reference implementation for custom experiment integrations.
 *
 * @module
 */

export type { AdapterData } from "@slopit/adapter-shared";
// Re-export commonly used types for convenience
export type {
  BehavioralData,
  ResponseInfo,
  SlopitSession,
  SlopitTrial,
  StimulusInfo,
} from "@slopit/core";
export { SlopitRecorder, VanillaRecorder } from "./recorder.js";
export type {
  VanillaRecorderConfig,
  VanillaTrialConfig,
  VanillaTrialResult,
} from "./types.js";
