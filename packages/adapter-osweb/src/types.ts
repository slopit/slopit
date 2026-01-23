/**
 * Type definitions for OSWeb adapter.
 *
 * @module
 */

import type { RecorderConfig } from "@slopit/adapter-shared";

/**
 * Configuration for OSWebRecorder.
 *
 * Extends the base RecorderConfig with OSWeb-specific options.
 */
export interface OSWebRecorderConfig extends RecorderConfig {
  /**
   * OpenSesame vars object for storing data.
   *
   * When provided, the recorder can automatically extract participantId
   * from `vars.subject_nr` and store session data in the vars object.
   */
  varsObject?: OSWebVars;
}

/**
 * OpenSesame vars object interface.
 *
 * This object is available in OSWeb inline_javascript items as `vars`
 * and contains experiment variables and participant data.
 */
export interface OSWebVars {
  /**
   * Allow access to arbitrary experiment variables.
   */
  [key: string]: unknown;

  /**
   * Participant number assigned by OpenSesame.
   */
  subject_nr?: number;

  /**
   * Participant parity ("odd" or "even").
   */
  subject_parity?: string;
}

/**
 * OSWeb runner interface.
 *
 * The runner object provides access to the experiment state in OSWeb.
 * This interface documents the structure for type safety.
 */
export interface OSWebRunner {
  /**
   * Current experiment state.
   */
  experiment: {
    /**
     * Experiment variables object.
     */
    vars: OSWebVars;

    /**
     * Experiment items (trials, sequences, etc.).
     */
    items: Record<string, unknown>;
  };
}
