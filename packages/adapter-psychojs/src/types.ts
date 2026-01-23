/**
 * Type definitions for PsychoJS adapter.
 *
 * @module
 */

import type { RecorderConfig, StimulusInfo } from "@slopit/adapter-shared";

/**
 * Configuration for PsychoJSRecorder.
 *
 * Extends the base RecorderConfig with PsychoJS-specific options.
 */
export interface PsychoJSRecorderConfig extends RecorderConfig {
  /**
   * PsychoJS instance for version detection.
   *
   * If provided, the recorder will attempt to detect the PsychoJS version
   * from this instance.
   */
  psychoJS?: unknown;
}

/**
 * Configuration for starting a trial in PsychoJS.
 *
 * This interface maps to common PsychoJS trial parameters.
 */
export interface PsychoJSTrialConfig {
  /**
   * Unique identifier for the trial.
   *
   * If not provided, one will be generated automatically.
   */
  trialId?: string;

  /**
   * Zero-indexed position of the trial in the experiment.
   *
   * If not provided, will be auto-incremented.
   */
  trialIndex?: number;

  /**
   * Type identifier for the trial (e.g., "text_entry", "survey").
   */
  trialType?: string;

  /**
   * Information about the stimulus presented in this trial.
   */
  stimulus?: StimulusInfo;
}
