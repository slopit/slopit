/**
 * Framework-agnostic SlopitRecorder implementation.
 *
 * @module
 */

import { BaseRecorder, discoverElement, type TrialConfig } from "@slopit/adapter-shared";
import type { PlatformInfo, ResponseInfo, SlopitSession, StimulusInfo } from "@slopit/core";

import type { VanillaRecorderConfig, VanillaTrialConfig, VanillaTrialResult } from "./types.js";

/**
 * Framework-agnostic SlopitRecorder for custom experiment implementations.
 *
 * This is a reference implementation that can be used directly or as a
 * template for building custom platform-specific adapters.
 *
 * @example
 * ```typescript
 * const recorder = new SlopitRecorder({
 *   participantId: "P001",
 *   studyId: "study_1",
 * });
 *
 * // Start a trial
 * recorder.startTrial({
 *   trialId: "trial_1",
 *   targetElement: document.querySelector("textarea"),
 * });
 *
 * // Later, when trial ends
 * const result = recorder.endTrial("participant response text");
 *
 * // At experiment end
 * const session = recorder.exportSession();
 * ```
 */
export class SlopitRecorder extends BaseRecorder {
  private platformName: string;
  private platformVersion: string;
  private discoveryCleanup: (() => void) | null = null;

  /**
   * Creates a new SlopitRecorder.
   *
   * @param config - Recorder configuration
   */
  constructor(config?: VanillaRecorderConfig) {
    super(config);
    this.platformName = config?.platformName ?? "vanilla";
    this.platformVersion = config?.platformVersion ?? "1.0.0";
  }

  /**
   * Gets platform-specific information.
   *
   * @returns Platform information for session export
   */
  protected override getPlatformInfo(): PlatformInfo {
    return {
      name: this.platformName,
      version: this.platformVersion,
      adapterVersion: "0.1.0",
    };
  }

  /**
   * Normalizes a VanillaTrialConfig to a TrialConfig.
   *
   * @param config - Vanilla trial config with optional string stimulus
   * @returns Trial config compatible with base class
   */
  private normalizeTrialConfig(config: VanillaTrialConfig): TrialConfig {
    // Extract stimulus and convert string to StimulusInfo
    const stimulus: StimulusInfo | undefined =
      typeof config.stimulus === "string"
        ? { type: "text", content: config.stimulus }
        : config.stimulus;

    // Build the trial config explicitly, only including defined properties
    const trialConfig: TrialConfig = {};

    if (config.trialId !== undefined) {
      trialConfig.trialId = config.trialId;
    }
    if (config.trialIndex !== undefined) {
      trialConfig.trialIndex = config.trialIndex;
    }
    if (config.trialType !== undefined) {
      trialConfig.trialType = config.trialType;
    }
    if (config.targetElement !== undefined) {
      trialConfig.targetElement = config.targetElement;
    }
    if (config.targetSelector !== undefined) {
      trialConfig.targetSelector = config.targetSelector;
    }
    if (stimulus !== undefined) {
      trialConfig.stimulus = stimulus;
    }

    return trialConfig;
  }

  /**
   * Start capturing behavioral data for a trial.
   *
   * @param config - Trial configuration
   * @throws Error if a trial is already in progress
   *
   * @example
   * ```typescript
   * recorder.startTrial({
   *   trialId: "trial_1",
   *   targetElement: document.querySelector("textarea"),
   *   stimulus: "Please describe your experience.",
   * });
   * ```
   */
  override startTrial(config: VanillaTrialConfig): void {
    super.startTrial(this.normalizeTrialConfig(config));
  }

  /**
   * Start a trial with automatic element discovery.
   *
   * Use this when the target element may not exist yet (e.g., dynamically
   * rendered content). The method uses a MutationObserver to watch for
   * the element to appear in the DOM.
   *
   * @param config - Trial configuration (without targetElement)
   * @param selector - CSS selector for target element
   * @param container - Container to search within (default: document)
   * @param timeout - Max time to wait for element (default: 5000ms)
   * @returns Promise that resolves when the trial starts
   * @throws Error if element is not found within timeout
   *
   * @example
   * ```typescript
   * await recorder.startTrialWithDiscovery(
   *   { trialId: "trial_1" },
   *   "textarea.response-input",
   *   document.body,
   *   3000
   * );
   * ```
   */
  startTrialWithDiscovery(
    config: VanillaTrialConfig,
    selector: string,
    container: HTMLElement | Document = document,
    timeout = 5000,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Try immediate discovery first
      const element = container.querySelector(selector) as HTMLElement | null;
      if (element !== null) {
        this.startTrial({ ...config, targetElement: element });
        resolve();
        return;
      }

      // Use MutationObserver for delayed discovery
      this.discoveryCleanup = discoverElement({
        selector,
        container: container as HTMLElement,
        timeout,
        onFound: (el) => {
          this.discoveryCleanup = null;
          this.startTrial({ ...config, targetElement: el });
          resolve();
        },
        onTimeout: () => {
          this.discoveryCleanup = null;
          // Start trial anyway without element
          this.startTrial(config);
          reject(new Error(`Element "${selector}" not found within ${timeout}ms`));
        },
      });
    });
  }

  /**
   * End the current trial and return captured data.
   *
   * This method accepts either a string or ResponseInfo for convenience.
   * Strings are automatically converted to text responses with character
   * and word counts.
   *
   * @param response - The participant's response (text string or ResponseInfo)
   * @returns The completed trial with behavioral data
   * @throws Error if no trial is in progress
   *
   * @example
   * ```typescript
   * // With a simple text response
   * const result = recorder.endTrial("The participant's typed response");
   *
   * // With a ResponseInfo object
   * const result = recorder.endTrial({
   *   type: "text",
   *   value: "Response text",
   *   characterCount: 13,
   *   wordCount: 2,
   * });
   * ```
   */
  override endTrial(
    response?: string | ResponseInfo,
    platformData?: Record<string, unknown>,
  ): VanillaTrialResult {
    // Clean up any pending discovery
    if (this.discoveryCleanup !== null) {
      this.discoveryCleanup();
      this.discoveryCleanup = null;
    }

    // Normalize response: convert string to ResponseInfo
    let responseInfo: ResponseInfo | undefined;
    if (typeof response === "string") {
      responseInfo = {
        type: "text",
        value: response,
        characterCount: response.length,
        wordCount: response
          .trim()
          .split(/\s+/)
          .filter((w) => w.length > 0).length,
      };
    } else if (response !== undefined) {
      responseInfo = response;
    }

    // Call the base class endTrial
    const trial = super.endTrial(responseInfo, platformData);

    return {
      trialId: trial.trialId,
      trialIndex: trial.trialIndex,
      trialType: trial.trialType,
      startTime: trial.startTime,
      endTime: trial.endTime,
      data: {
        behavioral: trial.behavioral ?? {
          keystrokes: [],
          focus: [],
          paste: [],
          mouse: [],
          scroll: [],
          clipboard: [],
          inputDuration: [],
          metrics: {},
        },
        flags: trial.captureFlags ?? [],
      },
      rt: trial.endTime - trial.startTime,
    };
  }

  /**
   * Check if a trial is currently in progress.
   *
   * @returns True if a trial is active
   *
   * @example
   * ```typescript
   * if (recorder.isTrialActive()) {
   *   recorder.endTrial(responseText);
   * }
   * ```
   */
  isTrialActive(): boolean {
    return this.isTrialInProgress();
  }

  /**
   * Get the current trial ID, or null if no trial is active.
   *
   * @returns The current trial ID or null
   *
   * @example
   * ```typescript
   * const trialId = recorder.getCurrentTrialId();
   * if (trialId !== null) {
   *   console.log(`Recording trial: ${trialId}`);
   * }
   * ```
   */
  getCurrentTrialId(): string | null {
    const trial = this.getCurrentTrial();
    return trial?.trialId ?? null;
  }

  /**
   * Get the number of completed trials.
   *
   * @returns The count of completed trials
   *
   * @example
   * ```typescript
   * console.log(`Completed ${recorder.getTrialCount()} trials`);
   * ```
   */
  getTrialCount(): number {
    return this.getTrials().length;
  }

  /**
   * Reset the recorder for a new session.
   *
   * Clears all trials, detaches any active capture, and generates a new
   * session ID. Use this when starting a new experiment session with the
   * same participant.
   *
   * @example
   * ```typescript
   * // After completing a session
   * const session = recorder.exportSession();
   * await saveSession(session);
   *
   * // Reset for a new session
   * recorder.resetSession();
   * ```
   */
  resetSession(): void {
    // Clean up pending discovery
    if (this.discoveryCleanup !== null) {
      this.discoveryCleanup();
      this.discoveryCleanup = null;
    }
    this.reset();
  }

  /**
   * Export the session data.
   *
   * @returns Complete session data in SlopitSession format
   *
   * @example
   * ```typescript
   * const session = recorder.exportSession();
   * await fetch("/api/sessions", {
   *   method: "POST",
   *   headers: { "Content-Type": "application/json" },
   *   body: JSON.stringify(session),
   * });
   * ```
   */
  override exportSession(): SlopitSession {
    return super.exportSession();
  }

  /**
   * Export session data as a JSON string.
   *
   * Convenience method for storing or transmitting session data.
   *
   * @returns JSON string representation of the session
   *
   * @example
   * ```typescript
   * const json = recorder.exportSessionJSON();
   * localStorage.setItem("session", json);
   * ```
   */
  exportSessionJSON(): string {
    return JSON.stringify(this.exportSession());
  }
}

// Also export as VanillaRecorder for clarity
export { SlopitRecorder as VanillaRecorder };
