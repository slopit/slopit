/**
 * Abstract base class for session recording across platforms.
 *
 * @module
 */

import {
  type BehavioralCapture,
  type BehavioralCaptureConfig,
  createBehavioralCapture,
} from "@slopit/behavioral";
import {
  generateTrialId,
  type PlatformInfo,
  type ResponseInfo,
  type SlopitSession,
  type SlopitTrial,
} from "@slopit/core";

import {
  completeSession,
  convertCompletedTrialToSlopit,
  createSessionMetadata,
} from "./export-utils.js";
import type { CompletedTrial, RecorderConfig, TrialConfig, TrialState } from "./types.js";

/**
 * Abstract base class for platform-specific session recorders.
 *
 * Manages session state, trial lifecycle, and behavioral capture.
 * Subclasses must implement getPlatformInfo() to provide platform-specific metadata.
 *
 * @example
 * ```typescript
 * class MyPlatformRecorder extends BaseRecorder {
 *   protected getPlatformInfo(): PlatformInfo {
 *     return {
 *       name: "my-platform",
 *       version: "1.0.0",
 *       adapterVersion: "0.1.0",
 *     };
 *   }
 * }
 *
 * const recorder = new MyPlatformRecorder({
 *   participantId: "P001",
 *   studyId: "study-123",
 * });
 *
 * recorder.startTrial({ trialType: "text-entry" });
 * // ... participant completes trial ...
 * recorder.endTrial({ type: "text", value: "response text" });
 *
 * const session = recorder.exportSession();
 * ```
 */
export abstract class BaseRecorder {
  /**
   * Unique session identifier.
   */
  protected sessionId: string;

  /**
   * Participant identifier from recruitment platform.
   */
  protected participantId: string | undefined;

  /**
   * Study identifier.
   */
  protected studyId: string | undefined;

  /**
   * Session-level metadata.
   */
  protected metadata: Record<string, unknown> | undefined;

  /**
   * Configuration for behavioral capture.
   */
  protected behavioralConfig: BehavioralCaptureConfig;

  /**
   * Completed trials.
   */
  protected trials: CompletedTrial[];

  /**
   * Current trial state, if a trial is in progress.
   */
  protected currentTrial: TrialState | null;

  /**
   * Behavioral capture instance for the current trial.
   */
  protected capture: BehavioralCapture | null;

  /**
   * Session start time in milliseconds (Unix timestamp).
   */
  protected sessionStartTime: number;

  /**
   * Counter for auto-incrementing trial indices.
   */
  private trialCounter: number;

  /**
   * Creates a new BaseRecorder.
   *
   * @param config - Recorder configuration
   */
  constructor(config?: RecorderConfig) {
    this.sessionId = crypto.randomUUID();
    this.participantId = config?.participantId;
    this.studyId = config?.studyId;
    this.metadata = config?.metadata;
    this.behavioralConfig = config?.behavioral ?? {};
    this.trials = [];
    this.currentTrial = null;
    this.capture = null;
    this.sessionStartTime = Date.now();
    this.trialCounter = 0;
  }

  /**
   * Gets platform-specific information.
   *
   * Subclasses must implement this method to provide platform metadata.
   *
   * @returns Platform information
   */
  protected abstract getPlatformInfo(): PlatformInfo;

  /**
   * Starts a new trial.
   *
   * Creates a new trial state and optionally attaches behavioral capture
   * to the target element.
   *
   * @param config - Trial configuration
   * @throws Error if a trial is already in progress
   *
   * @example
   * ```typescript
   * recorder.startTrial({
   *   trialType: "survey-text",
   *   targetElement: document.querySelector("textarea"),
   * });
   * ```
   */
  startTrial(config: TrialConfig): void {
    if (this.currentTrial !== null) {
      throw new Error("A trial is already in progress. Call endTrial() first.");
    }

    const trialId = config.trialId ?? generateTrialId();
    const trialIndex = config.trialIndex ?? this.trialCounter++;
    const startTime = performance.now();

    this.currentTrial = {
      trialId,
      trialIndex,
      trialType: config.trialType,
      startTime,
      stimulus: config.stimulus,
      element: config.targetElement,
    };

    // Create and attach behavioral capture if an element is provided
    if (config.targetElement !== undefined) {
      this.attachCapture(config.targetElement, startTime);
    }
  }

  /**
   * Ends the current trial and returns the completed trial data.
   *
   * @param response - Optional response information
   * @param platformData - Optional platform-specific trial data
   * @returns The completed trial
   * @throws Error if no trial is in progress
   *
   * @example
   * ```typescript
   * const trial = recorder.endTrial({
   *   type: "text",
   *   value: "User response",
   *   characterCount: 13,
   *   wordCount: 2,
   * });
   * ```
   */
  endTrial(response?: ResponseInfo, platformData?: Record<string, unknown>): CompletedTrial {
    if (this.currentTrial === null) {
      throw new Error("No trial in progress. Call startTrial() first.");
    }

    const endTime = performance.now();
    const sessionStartPerf = performance.now() - (Date.now() - this.sessionStartTime);

    // Calculate absolute timestamps
    const startTimeAbsolute =
      this.sessionStartTime + (this.currentTrial.startTime - sessionStartPerf);
    const endTimeAbsolute = this.sessionStartTime + (endTime - sessionStartPerf);

    // Get behavioral data and flags
    const behavioral = this.capture?.getData();
    const captureFlags = this.capture?.getFlags();

    // Detach capture
    if (this.capture !== null) {
      this.capture.detach();
      this.capture = null;
    }

    const completedTrial: CompletedTrial = {
      trialId: this.currentTrial.trialId,
      trialIndex: this.currentTrial.trialIndex,
      trialType: this.currentTrial.trialType,
      startTime: startTimeAbsolute,
      endTime: endTimeAbsolute,
      stimulus: this.currentTrial.stimulus,
      response,
      behavioral,
      captureFlags:
        captureFlags !== undefined && captureFlags.length > 0 ? captureFlags : undefined,
      platformData,
    };

    this.trials.push(completedTrial);
    this.currentTrial = null;

    return completedTrial;
  }

  /**
   * Attaches behavioral capture to an element for the current trial.
   *
   * This can be called after startTrial() if the target element becomes
   * available later (e.g., dynamically created elements).
   *
   * @param element - The DOM element to attach to
   * @throws Error if no trial is in progress
   * @throws Error if capture is already attached
   *
   * @example
   * ```typescript
   * recorder.startTrial({ trialType: "survey" });
   * // Later, when the element is available:
   * recorder.attachCapture(document.querySelector("textarea")!);
   * ```
   */
  attachCapture(element: HTMLElement, startTime?: number): void {
    if (this.currentTrial === null) {
      throw new Error("No trial in progress. Call startTrial() first.");
    }

    if (this.capture !== null) {
      throw new Error("Capture already attached. Call detachCapture() first.");
    }

    this.capture = createBehavioralCapture(this.behavioralConfig);
    this.capture.attach(element, startTime ?? this.currentTrial.startTime);
    this.currentTrial.element = element;
  }

  /**
   * Detaches behavioral capture without ending the trial.
   *
   * Useful when the target element is removed before the trial ends.
   */
  detachCapture(): void {
    if (this.capture !== null) {
      this.capture.detach();
      this.capture = null;
    }
    if (this.currentTrial !== null) {
      this.currentTrial.element = undefined;
    }
  }

  /**
   * Exports the session data in SlopitSession format.
   *
   * @returns Complete session data
   *
   * @example
   * ```typescript
   * const session = recorder.exportSession();
   * await fetch("/api/sessions", {
   *   method: "POST",
   *   body: JSON.stringify(session),
   * });
   * ```
   */
  exportSession(): SlopitSession {
    // Build options object, only including defined values
    const options: {
      participantId?: string;
      studyId?: string;
      metadata?: Record<string, unknown>;
      startTime: number;
    } = {
      startTime: this.sessionStartTime,
    };

    if (this.participantId !== undefined) {
      options.participantId = this.participantId;
    }
    if (this.studyId !== undefined) {
      options.studyId = this.studyId;
    }
    if (this.metadata !== undefined) {
      options.metadata = this.metadata;
    }

    const sessionBase = createSessionMetadata(this.getPlatformInfo(), options);

    // Override the auto-generated sessionId with our stored one
    const baseWithSessionId = {
      ...sessionBase,
      sessionId: this.sessionId,
    };

    const slopitTrials: SlopitTrial[] = this.trials.map(convertCompletedTrialToSlopit);

    return completeSession(baseWithSessionId, slopitTrials);
  }

  /**
   * Gets the current trial state.
   *
   * @returns Current trial state or null if no trial is in progress
   */
  getCurrentTrial(): TrialState | null {
    return this.currentTrial;
  }

  /**
   * Gets all completed trials.
   *
   * @returns Array of completed trials
   */
  getTrials(): CompletedTrial[] {
    return [...this.trials];
  }

  /**
   * Checks if a trial is currently in progress.
   *
   * @returns True if a trial is in progress
   */
  isTrialInProgress(): boolean {
    return this.currentTrial !== null;
  }

  /**
   * Gets the session ID.
   *
   * @returns The session identifier
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Resets the recorder for a new session.
   *
   * Clears all trials and generates a new session ID.
   */
  reset(): void {
    if (this.capture !== null) {
      this.capture.detach();
      this.capture = null;
    }
    this.currentTrial = null;
    this.trials = [];
    this.sessionId = crypto.randomUUID();
    this.sessionStartTime = Date.now();
    this.trialCounter = 0;
  }
}
