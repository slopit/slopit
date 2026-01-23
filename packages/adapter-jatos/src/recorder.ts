/**
 * JATOS SlopitRecorder implementation.
 *
 * @module
 */

import {
  BaseRecorder,
  type CompletedTrial,
  type RecorderConfig,
  type TrialConfig,
  discoverElement,
} from "@slopit/adapter-shared";
import type { PlatformInfo, ResponseInfo, SlopitSession } from "@slopit/core";

import type { JatosModule, JatosRecorderConfig } from "./types.js";

/**
 * SlopitRecorder for JATOS experiments.
 *
 * Provides integration with JATOS for behavioral data capture and
 * submission. Automatically detects JATOS worker and study IDs when available.
 *
 * @example
 * ```typescript
 * jatos.onLoad(function() {
 *   const recorder = new SlopitRecorder();
 *
 *   // Run trials
 *   recorder.beginTrial("trial_1", textarea);
 *   // ... participant completes trial ...
 *   recorder.finishTrial(response);
 *
 *   // Submit and end
 *   await recorder.submitToJatos();
 *   jatos.endStudy();
 * });
 * ```
 */
export class SlopitRecorder extends BaseRecorder {
  private resultKey: string;
  private discoveryCleanup: (() => void) | null = null;

  /**
   * Creates a new SlopitRecorder for JATOS.
   *
   * @param config - Recorder configuration
   */
  constructor(config?: JatosRecorderConfig) {
    // Auto-detect participantId and studyId from JATOS if available
    const jatos = typeof window !== "undefined" ? window.jatos : undefined;

    // Build enhanced config explicitly to satisfy exactOptionalPropertyTypes
    const enhancedConfig: RecorderConfig = {};

    // Use config value if provided, otherwise fall back to JATOS values
    const participantId = config?.participantId ?? jatos?.workerId;
    if (participantId !== undefined) {
      enhancedConfig.participantId = participantId;
    }

    const studyId = config?.studyId ?? jatos?.studyId;
    if (studyId !== undefined) {
      enhancedConfig.studyId = studyId;
    }

    if (config?.metadata !== undefined) {
      enhancedConfig.metadata = config.metadata;
    }

    if (config?.behavioral !== undefined) {
      enhancedConfig.behavioral = config.behavioral;
    }

    super(enhancedConfig);
    this.resultKey = config?.resultKey ?? "slopit";
  }

  /**
   * Gets platform-specific information.
   *
   * @returns Platform information for session export
   */
  protected override getPlatformInfo(): PlatformInfo {
    return {
      name: "JATOS",
      version: this.detectJatosVersion(),
      adapterVersion: "0.1.0",
    };
  }

  /**
   * Detects JATOS version.
   *
   * JATOS does not expose version information client-side, so this returns
   * "unknown" unless overridden.
   *
   * @returns JATOS version string or "unknown"
   */
  private detectJatosVersion(): string {
    // JATOS doesn't expose version client-side
    return "unknown";
  }

  /**
   * Gets the JATOS module from the window object.
   *
   * @returns JatosModule or undefined if not available
   */
  private getJatos(): JatosModule | undefined {
    return typeof window !== "undefined" ? window.jatos : undefined;
  }

  /**
   * Builds a TrialConfig from the provided parameters.
   *
   * @param trialId - Trial identifier
   * @param element - Optional target element
   * @param trialConfig - Optional additional configuration
   * @returns TrialConfig compatible with base class
   */
  private buildTrialConfig(
    trialId: string,
    element?: HTMLElement,
    trialConfig?: Partial<TrialConfig>,
  ): TrialConfig {
    const config: TrialConfig = {
      trialId,
    };

    if (element !== undefined) {
      config.targetElement = element;
    }

    if (trialConfig?.trialIndex !== undefined) {
      config.trialIndex = trialConfig.trialIndex;
    }

    if (trialConfig?.trialType !== undefined) {
      config.trialType = trialConfig.trialType;
    }

    if (trialConfig?.stimulus !== undefined) {
      config.stimulus = trialConfig.stimulus;
    }

    if (trialConfig?.targetSelector !== undefined) {
      config.targetSelector = trialConfig.targetSelector;
    }

    return config;
  }

  /**
   * Start capturing behavioral data for a trial.
   *
   * @param trialId - Unique identifier for the trial
   * @param element - Target DOM element to monitor (optional)
   * @param trialConfig - Additional trial configuration
   *
   * @example
   * ```typescript
   * const textarea = document.querySelector("textarea");
   * recorder.beginTrial("trial_1", textarea, {
   *   trialType: "free-response",
   *   stimulus: { type: "text", content: "Describe your experience." },
   * });
   * ```
   */
  beginTrial(trialId: string, element?: HTMLElement, trialConfig?: Partial<TrialConfig>): void {
    const config = this.buildTrialConfig(trialId, element, trialConfig);
    super.startTrial(config);
  }

  /**
   * Start a trial with automatic element discovery.
   *
   * Uses a MutationObserver to watch for the target element to appear in
   * the DOM. Useful when the element is created dynamically.
   *
   * @param trialId - Unique identifier for the trial
   * @param selector - CSS selector for target element
   * @param container - Container to search within (default: document)
   *
   * @example
   * ```typescript
   * recorder.startTrialWithSelector(
   *   "trial_1",
   *   "textarea.response-input",
   *   document.getElementById("trial-container")
   * );
   * ```
   */
  startTrialWithSelector(
    trialId: string,
    selector: string,
    container: HTMLElement | Document = document,
  ): void {
    const element = container.querySelector(selector) as HTMLElement | null;

    if (element !== null) {
      this.beginTrial(trialId, element);
    } else {
      // Start trial without element, then attach when found
      const config: TrialConfig = { trialId };
      super.startTrial(config);

      this.discoveryCleanup = discoverElement({
        selector,
        container: container as HTMLElement,
        timeout: 10000,
        onFound: (el) => {
          if (this.capture !== null) {
            // If capture was already created by a previous attach, skip
            return;
          }
          if (this.currentTrial !== null) {
            this.attachCapture(el, this.currentTrial.startTime);
          }
        },
      });
    }
  }

  /**
   * Internal method to call the base class endTrial.
   * This avoids TypeScript override signature issues.
   */
  private endTrialBase(
    response?: ResponseInfo,
    platformData?: Record<string, unknown>,
  ): CompletedTrial {
    return BaseRecorder.prototype.endTrial.call(this, response, platformData) as CompletedTrial;
  }

  /**
   * End the current trial.
   *
   * @param response - The participant's response (string or ResponseInfo)
   * @returns The completed trial data
   *
   * @example
   * ```typescript
   * // With a text string
   * const trial = recorder.finishTrial("The participant's response.");
   *
   * // With a ResponseInfo object
   * const trial = recorder.finishTrial({
   *   type: "text",
   *   value: "Response text",
   *   characterCount: 13,
   *   wordCount: 2,
   * });
   * ```
   */
  finishTrial(response?: string | ResponseInfo): CompletedTrial {
    // Clean up any pending discovery
    if (this.discoveryCleanup !== null) {
      this.discoveryCleanup();
      this.discoveryCleanup = null;
    }

    // Normalize response: convert string to ResponseInfo
    const responseInfo: ResponseInfo | undefined =
      typeof response === "string"
        ? {
            type: "text",
            value: response,
            characterCount: response.length,
            wordCount: response
              .trim()
              .split(/\s+/)
              .filter((w) => w.length > 0).length,
          }
        : response;

    return this.endTrialBase(responseInfo);
  }

  /**
   * Submit session data to JATOS.
   *
   * Call this at the end of the component or study to submit all captured
   * behavioral data to JATOS.
   *
   * @returns Promise that resolves when data is submitted
   *
   * @example
   * ```typescript
   * // After all trials are complete
   * await recorder.submitToJatos();
   * jatos.endStudy();
   * ```
   */
  async submitToJatos(): Promise<void> {
    const jatos = this.getJatos();
    if (jatos === undefined) {
      console.warn("[slopit] JATOS not available, cannot submit data");
      return;
    }

    const session = this.exportSession();
    await jatos.submitResultData({
      [this.resultKey]: session,
    });
  }

  /**
   * Append session data to JATOS result.
   *
   * Use this for incremental data submission during long experiments.
   * Unlike submitToJatos(), this appends to existing data rather than
   * replacing it.
   *
   * @returns Promise that resolves when data is appended
   *
   * @example
   * ```typescript
   * // After each block of trials
   * await recorder.appendToJatos();
   * ```
   */
  async appendToJatos(): Promise<void> {
    const jatos = this.getJatos();
    if (jatos === undefined) {
      console.warn("[slopit] JATOS not available, cannot append data");
      return;
    }

    const session = this.exportSession();
    await jatos.appendResultData(
      JSON.stringify({
        [this.resultKey]: session,
      }),
    );
  }

  /**
   * Store session in JATOS study session data.
   *
   * Use this to share session data across components in a multi-component
   * study. The data is stored in jatos.studySessionData and persists across
   * component transitions.
   *
   * @example
   * ```typescript
   * // In component 1
   * recorder.storeInStudySession();
   * jatos.startNextComponent();
   *
   * // In component 2, retrieve with loadFromStudySession()
   * ```
   */
  storeInStudySession(): void {
    const jatos = this.getJatos();
    if (jatos !== undefined) {
      jatos.studySessionData[this.resultKey] = this.exportSession();
    }
  }

  /**
   * Load previous session data from JATOS study session.
   *
   * Use this in multi-component studies to retrieve session data stored
   * by a previous component using storeInStudySession().
   *
   * @returns Previous session data or undefined if not found
   *
   * @example
   * ```typescript
   * // In a later component
   * const previousSession = recorder.loadFromStudySession();
   * if (previousSession !== undefined) {
   *   console.log(`Previous session had ${previousSession.trials.length} trials`);
   * }
   * ```
   */
  loadFromStudySession(): SlopitSession | undefined {
    const jatos = this.getJatos();
    if (jatos !== undefined && jatos.studySessionData[this.resultKey] !== undefined) {
      return jatos.studySessionData[this.resultKey] as SlopitSession;
    }
    return undefined;
  }

  /**
   * Get the result key used for JATOS data storage.
   *
   * @returns The result key string
   */
  getResultKey(): string {
    return this.resultKey;
  }
}

// Also export as JatosRecorder for clarity
export { SlopitRecorder as JatosRecorder };
