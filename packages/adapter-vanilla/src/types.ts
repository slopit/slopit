/**
 * Types for the vanilla adapter.
 *
 * @module
 */

import type { AdapterData, RecorderConfig, TrialConfig } from "@slopit/adapter-shared";
import type { ResponseInfo, StimulusInfo } from "@slopit/core";

/**
 * Configuration for VanillaRecorder.
 *
 * Extends the base RecorderConfig with platform identification options.
 */
export interface VanillaRecorderConfig extends RecorderConfig {
  /**
   * Platform name for identification.
   *
   * @default "vanilla"
   */
  platformName?: string;

  /**
   * Platform version string.
   *
   * @default "1.0.0"
   */
  platformVersion?: string;
}

/**
 * Trial configuration for VanillaRecorder.
 *
 * Extends the base TrialConfig with a more flexible stimulus type.
 */
export interface VanillaTrialConfig extends Omit<TrialConfig, "stimulus"> {
  /**
   * Stimulus information for this trial.
   *
   * Accepts either a StimulusInfo object or a plain string.
   * Strings are automatically converted to text stimuli.
   */
  stimulus?: StimulusInfo | string;
}

/**
 * Result of a completed trial.
 *
 * Contains trial identification, behavioral data, and timing information.
 * This type extends the base CompletedTrial to maintain type compatibility
 * while providing a more convenient interface.
 */
export interface VanillaTrialResult {
  /**
   * Unique trial identifier.
   */
  trialId: string;

  /**
   * Zero-indexed position of the trial in the session.
   */
  trialIndex: number;

  /**
   * Trial type identifier.
   */
  trialType?: string | undefined;

  /**
   * Start time in milliseconds (Unix timestamp).
   */
  startTime: number;

  /**
   * End time in milliseconds (Unix timestamp).
   */
  endTime: number;

  /**
   * Collected behavioral data and flags.
   */
  data: AdapterData;

  /**
   * Response time in milliseconds (computed from endTime - startTime).
   */
  rt: number;
}

// Re-export related types for convenience
export type { AdapterData, ResponseInfo, StimulusInfo };
