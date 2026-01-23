/**
 * Type definitions for Gorilla adapter.
 *
 * @module
 */

import type { RecorderConfig } from "@slopit/adapter-shared";

/**
 * Configuration options for the Gorilla recorder.
 */
export interface GorillaRecorderConfig extends RecorderConfig {
  /**
   * Automatically call gorilla.store() on each endTrial().
   *
   * @default false
   */
  autoStore?: boolean;

  /**
   * Key prefix for gorilla.store() calls.
   *
   * @default "slopit"
   */
  storeKey?: string;
}

/**
 * Interface for the global Gorilla module.
 *
 * Gorilla provides this module on the window object when running experiments.
 */
export interface GorillaModule {
  /**
   * Registers a callback to run when the experiment is ready.
   *
   * @param callback - Function to execute when ready
   */
  ready(callback: () => void): void;

  /**
   * Stores a metric value that appears in the exported data.
   *
   * @param key - Metric identifier
   * @param value - Value to store (strings or numbers)
   */
  metric(key: string, value: string | number): void;

  /**
   * Stores arbitrary data for later retrieval within the experiment.
   *
   * @param key - Storage key
   * @param value - Value to store
   */
  store(key: string, value: unknown): void;

  /**
   * Signals that the experiment has finished.
   */
  finish(): void;

  /**
   * Returns the URL for a stimuli file uploaded to Gorilla.
   *
   * @param filename - Name of the stimuli file
   * @returns Full URL to the stimuli resource
   */
  stimuliURL(filename: string): string;
}

declare global {
  interface Window {
    gorilla?: GorillaModule;
  }
}
