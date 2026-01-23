/**
 * Types for the JATOS adapter.
 *
 * @module
 */

import type { RecorderConfig } from "@slopit/adapter-shared";

/**
 * Configuration for JatosRecorder.
 *
 * Extends the base RecorderConfig with JATOS-specific options.
 */
export interface JatosRecorderConfig extends RecorderConfig {
  /**
   * Key used for slopit data in JATOS result data.
   *
   * @default "slopit"
   */
  resultKey?: string;
}

/**
 * JATOS global module interface.
 *
 * This interface describes the jatos.js client library methods
 * used by the adapter.
 */
export interface JatosModule {
  /**
   * Called when JATOS component is ready.
   *
   * @param callback - Function to execute when ready
   */
  onLoad(callback: () => void): void;

  /**
   * Submit result data for the component.
   *
   * @param data - Data object to submit
   * @returns Promise that resolves when submission is complete
   */
  submitResultData(data: unknown): Promise<void>;

  /**
   * Append data to the result.
   *
   * @param data - JSON string to append
   * @returns Promise that resolves when append is complete
   */
  appendResultData(data: string): Promise<void>;

  /**
   * End the study.
   *
   * @param successful - Whether the study ended successfully
   * @param message - Optional message
   */
  endStudy(successful?: boolean, message?: string): void;

  /**
   * Start the next component in the study.
   *
   * @param message - Optional message to pass to the next component
   */
  startNextComponent(message?: string): void;

  /**
   * Shared data across components in the study.
   */
  studySessionData: Record<string, unknown>;

  /**
   * Result data for the current component.
   */
  componentResultData: unknown;

  /**
   * Result data for the entire study.
   */
  studyResultData: unknown;

  /**
   * Worker (participant) ID.
   */
  workerId: string;

  /**
   * Study ID.
   */
  studyId: string;

  /**
   * Batch ID.
   */
  batchId: string;

  /**
   * Current component ID.
   */
  componentId: string;
}

declare global {
  interface Window {
    jatos?: JatosModule;
  }
}
