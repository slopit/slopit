/**
 * Shared types for platform adapters.
 *
 * @module
 */

import type { BehavioralCaptureConfig } from "@slopit/behavioral";
import type {
  BehavioralData,
  CaptureFlag,
  PlatformInfo,
  ResponseInfo,
  StimulusInfo,
} from "@slopit/core";

/**
 * Base configuration for platform adapters.
 *
 * Extends BehavioralCaptureConfig with common adapter options.
 */
export interface AdapterConfig extends BehavioralCaptureConfig {
  /**
   * Whether the adapter is enabled.
   *
   * @default true
   */
  enabled?: boolean;

  /**
   * CSS selector for the input element to monitor.
   *
   * If not specified, the adapter will search for common input elements.
   */
  targetSelector?: string;
}

/**
 * Data collected by the adapter during a trial.
 */
export interface AdapterData {
  /**
   * Behavioral capture data including events and metrics.
   */
  behavioral: BehavioralData;

  /**
   * Flags generated during capture indicating potential AI-assisted responses.
   */
  flags: CaptureFlag[];
}

/**
 * State of a trial currently being recorded.
 */
export interface TrialState {
  /**
   * Unique identifier for the trial.
   */
  trialId: string;

  /**
   * Zero-indexed position of the trial in the session.
   */
  trialIndex: number;

  /**
   * Type identifier for the trial.
   */
  trialType?: string | undefined;

  /**
   * Start time in milliseconds (performance.now()).
   */
  startTime: number;

  /**
   * Stimulus information for this trial.
   */
  stimulus?: StimulusInfo | undefined;

  /**
   * DOM element being monitored.
   */
  element?: HTMLElement | undefined;
}

/**
 * Configuration for starting a new trial.
 */
export interface TrialConfig {
  /**
   * Unique identifier for the trial.
   * If not provided, one will be generated.
   */
  trialId?: string;

  /**
   * Zero-indexed position of the trial in the session.
   * If not provided, will be auto-incremented.
   */
  trialIndex?: number;

  /**
   * Type identifier for the trial.
   */
  trialType?: string;

  /**
   * Stimulus information for this trial.
   */
  stimulus?: StimulusInfo;

  /**
   * DOM element to monitor for behavioral capture.
   */
  targetElement?: HTMLElement;

  /**
   * CSS selector to find the target element.
   * Used if targetElement is not provided.
   */
  targetSelector?: string;
}

/**
 * Configuration for the base recorder.
 */
export interface RecorderConfig {
  /**
   * Participant identifier from recruitment platform.
   */
  participantId?: string;

  /**
   * Study identifier.
   */
  studyId?: string;

  /**
   * Session-level metadata.
   */
  metadata?: Record<string, unknown>;

  /**
   * Behavioral capture configuration.
   */
  behavioral?: BehavioralCaptureConfig;
}

/**
 * Complete trial data after recording.
 */
export interface CompletedTrial {
  /**
   * Unique identifier for the trial.
   */
  trialId: string;

  /**
   * Zero-indexed position of the trial in the session.
   */
  trialIndex: number;

  /**
   * Type identifier for the trial.
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
   * Stimulus information for this trial.
   */
  stimulus?: StimulusInfo | undefined;

  /**
   * Response information.
   */
  response?: ResponseInfo | undefined;

  /**
   * Behavioral capture data.
   */
  behavioral?: BehavioralData | undefined;

  /**
   * Flags generated during capture.
   */
  captureFlags?: CaptureFlag[] | undefined;

  /**
   * Platform-specific trial data.
   */
  platformData?: Record<string, unknown> | undefined;
}

/**
 * Metadata for session creation.
 */
export interface SessionMetadata {
  /**
   * Participant identifier.
   */
  participantId?: string;

  /**
   * Study identifier.
   */
  studyId?: string;

  /**
   * Custom metadata.
   */
  metadata?: Record<string, unknown>;
}

/**
 * Information about a platform for use in session export.
 */
export type { PlatformInfo, ResponseInfo, StimulusInfo };
