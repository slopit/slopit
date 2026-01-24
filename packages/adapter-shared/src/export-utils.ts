/**
 * Common export utilities for creating SlopitSession data.
 *
 * @module
 */

import {
  type BehavioralData,
  type CaptureFlag,
  captureEnvironment,
  type EnvironmentInfo,
  generateSessionId,
  type PlatformInfo,
  type ResponseInfo,
  SCHEMA_VERSION,
  type SlopitSession,
  type SlopitTrial,
  type StimulusInfo,
} from "@slopit/core";

import type { CompletedTrial, SessionMetadata } from "./types.js";

/**
 * Options for creating session metadata.
 */
export interface CreateSessionMetadataOptions extends SessionMetadata {
  /**
   * Session start time in milliseconds (Unix timestamp).
   * If not provided, the current time is used.
   */
  startTime?: number;
}

/**
 * Creates the base structure for a SlopitSession.
 *
 * This function builds the non-trial portions of a session, including
 * session ID, platform info, environment, and timing.
 *
 * @param platform - Platform information
 * @param options - Session metadata options
 * @returns Partial session with metadata populated
 *
 * @example
 * ```typescript
 * const sessionBase = createSessionMetadata(
 *   { name: "jspsych", version: "8.0.0", adapterVersion: "0.1.0" },
 *   { participantId: "P001", studyId: "study-123" }
 * );
 * ```
 */
export function createSessionMetadata(
  platform: PlatformInfo,
  options?: CreateSessionMetadataOptions,
): Omit<SlopitSession, "trials" | "globalEvents" | "timing"> & {
  timing: { startTime: number };
} {
  const sessionId = generateSessionId();
  const startTime = options?.startTime ?? Date.now();

  return {
    schemaVersion: SCHEMA_VERSION,
    sessionId,
    ...(options?.participantId !== undefined ? { participantId: options.participantId } : {}),
    ...(options?.studyId !== undefined ? { studyId: options.studyId } : {}),
    platform,
    environment: captureEnvironment(),
    timing: {
      startTime,
    },
    ...(options?.metadata !== undefined ? { metadata: options.metadata } : {}),
  };
}

/**
 * Options for completing a session.
 */
export interface CompleteSessionOptions {
  /**
   * End time in milliseconds (Unix timestamp).
   * If not provided, the current time is used.
   */
  endTime?: number;
}

/**
 * Completes a session by adding timing and global events.
 *
 * @param sessionBase - The partial session from createSessionMetadata
 * @param trials - Array of completed trials
 * @param options - Completion options
 * @returns Complete SlopitSession
 *
 * @example
 * ```typescript
 * const session = completeSession(sessionBase, trials, { endTime: Date.now() });
 * ```
 */
export function completeSession(
  sessionBase: Omit<SlopitSession, "trials" | "globalEvents" | "timing"> & {
    timing: { startTime: number };
  },
  trials: SlopitTrial[],
  options?: CompleteSessionOptions,
): SlopitSession {
  const endTime = options?.endTime ?? Date.now();
  const duration = endTime - sessionBase.timing.startTime;

  return {
    ...sessionBase,
    timing: {
      startTime: sessionBase.timing.startTime,
      endTime,
      duration,
    },
    trials,
    globalEvents: {
      focus: [],
      errors: [],
    },
  };
}

/**
 * Trial data used for conversion.
 */
export interface TrialConversionData {
  /**
   * Unique trial identifier.
   */
  trialId: string;

  /**
   * Zero-indexed trial position.
   */
  trialIndex: number;

  /**
   * Trial type identifier.
   */
  trialType?: string | undefined;

  /**
   * Trial start time in milliseconds.
   */
  startTime: number;

  /**
   * Trial end time in milliseconds.
   */
  endTime: number;

  /**
   * Stimulus information.
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
   * Flags from capture.
   */
  flags?: CaptureFlag[] | undefined;

  /**
   * Platform-specific data.
   */
  platformData?: Record<string, unknown> | undefined;
}

/**
 * Converts trial data to the SlopitTrial format.
 *
 * @param data - Trial data to convert
 * @returns SlopitTrial object
 *
 * @example
 * ```typescript
 * const trial = convertTrialToSlopit({
 *   trialId: "trial-001",
 *   trialIndex: 0,
 *   trialType: "survey-text",
 *   startTime: 1700000000000,
 *   endTime: 1700000010000,
 *   response: { type: "text", value: "Hello", characterCount: 5, wordCount: 1 },
 *   behavioral: capture.getData(),
 *   flags: capture.getFlags(),
 * });
 * ```
 */
export function convertTrialToSlopit(data: TrialConversionData): SlopitTrial {
  const trial: SlopitTrial = {
    trialId: data.trialId,
    trialIndex: data.trialIndex,
    startTime: data.startTime,
    endTime: data.endTime,
    rt: data.endTime - data.startTime,
  };

  if (data.trialType !== undefined) {
    trial.trialType = data.trialType;
  }

  if (data.stimulus !== undefined) {
    trial.stimulus = data.stimulus;
  }

  if (data.response !== undefined) {
    trial.response = data.response;
  }

  if (data.behavioral !== undefined) {
    trial.behavioral = data.behavioral;
  }

  if (data.flags !== undefined && data.flags.length > 0) {
    trial.captureFlags = data.flags;
  }

  if (data.platformData !== undefined) {
    trial.platformData = data.platformData;
  }

  return trial;
}

/**
 * Converts a CompletedTrial to a SlopitTrial.
 *
 * @param trial - Completed trial to convert
 * @returns SlopitTrial object
 */
export function convertCompletedTrialToSlopit(trial: CompletedTrial): SlopitTrial {
  return convertTrialToSlopit({
    trialId: trial.trialId,
    trialIndex: trial.trialIndex,
    trialType: trial.trialType,
    startTime: trial.startTime,
    endTime: trial.endTime,
    stimulus: trial.stimulus,
    response: trial.response,
    behavioral: trial.behavioral,
    flags: trial.captureFlags,
    platformData: trial.platformData,
  });
}

/**
 * Re-export captureEnvironment for convenience.
 */
export { captureEnvironment };

/**
 * Type alias for EnvironmentInfo.
 */
export type { EnvironmentInfo };

/**
 * Creates a response info object from text input.
 *
 * @param text - The text response
 * @returns ResponseInfo object with word and character counts
 *
 * @example
 * ```typescript
 * const response = createTextResponse("Hello world");
 * // { type: "text", value: "Hello world", characterCount: 11, wordCount: 2 }
 * ```
 */
export function createTextResponse(text: string): ResponseInfo {
  const words = text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);

  return {
    type: "text",
    value: text,
    characterCount: text.length,
    wordCount: words.length,
  };
}
