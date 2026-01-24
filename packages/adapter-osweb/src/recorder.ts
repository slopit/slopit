/**
 * OSWeb session recorder.
 *
 * @module
 */

import {
  type AdapterData,
  BaseRecorder,
  type CompletedTrial,
  discoverElement,
  type TrialConfig,
} from "@slopit/adapter-shared";
import type { PlatformInfo, ResponseInfo } from "@slopit/core";

import type { OSWebRecorderConfig, OSWebVars } from "./types.js";

/**
 * SlopitRecorder for OSWeb experiments.
 *
 * Due to OSWeb's limited JavaScript sandbox, this recorder uses a
 * prepare/attach pattern that works within inline_javascript items.
 *
 * @example
 * ```javascript
 * // In prepare phase of inline_javascript
 * const slopit = new SlopitRecorder({ varsObject: vars });
 * slopit.prepareCapture();
 *
 * // In run phase
 * await slopit.attachWhenReady("textarea");
 * // ... wait for response ...
 * slopit.endTrial(vars.response);
 * vars.slopit_data = JSON.stringify(slopit.getTrialData());
 * ```
 */
export class SlopitRecorder extends BaseRecorder {
  /**
   * Reference to OSWeb vars object for storing data.
   */
  private varsObject: OSWebVars | null = null;

  /**
   * Cleanup function for element discovery.
   */
  private discoveryCleanup: (() => void) | null = null;

  /**
   * Whether prepareCapture() has been called for the current trial.
   */
  private prepared = false;

  /**
   * Data from the most recently completed trial.
   */
  private lastTrialData: AdapterData | null = null;

  /**
   * Creates a new SlopitRecorder.
   *
   * @param config - Recorder configuration
   *
   * @example
   * ```javascript
   * const recorder = new SlopitRecorder({
   *   varsObject: vars,
   *   studyId: "my-study",
   * });
   * ```
   */
  constructor(config?: OSWebRecorderConfig) {
    // Extract participant ID from OSWeb vars if available
    const vars = config?.varsObject;
    const participantId = config?.participantId ?? vars?.subject_nr?.toString();

    // Only pass participantId if it has a value
    const enhancedConfig =
      participantId !== undefined
        ? {
            ...config,
            participantId,
          }
        : config;

    super(enhancedConfig);
    this.varsObject = vars ?? null;
  }

  /**
   * Gets platform information for OSWeb.
   *
   * @returns Platform information
   */
  protected override getPlatformInfo(): PlatformInfo {
    return {
      name: "osweb",
      version: this.detectOSWebVersion(),
      adapterVersion: "0.1.0",
    };
  }

  /**
   * Attempts to detect the OSWeb version.
   *
   * @returns Version string or "unknown" if not detectable
   */
  private detectOSWebVersion(): string {
    if (typeof window !== "undefined") {
      const oswebGlobal = (window as unknown as Record<string, unknown>)["osweb"] as
        | { version?: string }
        | undefined;
      if (oswebGlobal?.version !== undefined) {
        return oswebGlobal.version;
      }
    }
    return "unknown";
  }

  /**
   * Prepares capture for the next trial.
   *
   * Call this in the prepare phase of an inline_javascript item.
   * This resets the trial state and prepares for element attachment.
   *
   * @example
   * ```javascript
   * // In prepare phase
   * slopit.prepareCapture();
   * ```
   */
  prepareCapture(): void {
    this.prepared = true;
    this.lastTrialData = null;
  }

  /**
   * Attaches to an element when it becomes available.
   *
   * Call this in the run phase. Uses MutationObserver to wait for
   * dynamically created elements.
   *
   * @param selector - CSS selector for target element
   * @param timeout - Max time to wait in milliseconds (default: 10000)
   * @returns Promise that resolves when attached
   * @throws Error if prepareCapture() was not called first
   * @throws Error if element not found within timeout
   *
   * @example
   * ```javascript
   * // In run phase
   * await slopit.attachWhenReady("textarea");
   * ```
   */
  attachWhenReady(selector: string, timeout = 10000): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.prepared) {
        reject(new Error("Call prepareCapture() before attachWhenReady()"));
        return;
      }

      // Start the trial first
      const trialId = `trial_${this.trials.length}`;
      super.startTrial({ trialId });

      // Try immediate discovery
      const element = document.querySelector(selector) as HTMLElement | null;
      if (element !== null) {
        if (this.capture !== null) {
          this.capture.attach(element, this.currentTrial?.startTime ?? performance.now());
        } else {
          this.attachCapture(element);
        }
        resolve();
        return;
      }

      // Use MutationObserver for dynamic elements
      this.discoveryCleanup = discoverElement({
        selector,
        container: document.body,
        timeout,
        onFound: (el) => {
          if (this.capture !== null) {
            this.capture.attach(el, this.currentTrial?.startTime ?? performance.now());
          } else {
            this.attachCapture(el);
          }
          resolve();
        },
        onTimeout: () => {
          reject(new Error(`Element "${selector}" not found within ${timeout}ms`));
        },
      });
    });
  }

  /**
   * Starts a trial manually with a custom ID.
   *
   * Alternative to attachWhenReady() when you have direct access to
   * the target element.
   *
   * @param trialId - Unique identifier for the trial
   * @param element - Target DOM element for behavioral capture
   * @param trialConfig - Additional trial configuration
   *
   * @example
   * ```javascript
   * const textarea = document.querySelector("textarea");
   * slopit.startTrialWithId("response-1", textarea);
   * ```
   */
  startTrialWithId(
    trialId: string,
    element?: HTMLElement,
    trialConfig?: Partial<TrialConfig>,
  ): void {
    const config: TrialConfig = {
      trialId,
      ...trialConfig,
    };

    if (element !== undefined) {
      config.targetElement = element;
    }

    super.startTrial(config);
  }

  /**
   * Starts a trial manually.
   *
   * Convenience wrapper that uses startTrialWithId internally.
   *
   * @param trialId - Unique identifier for the trial
   * @param element - Target DOM element for behavioral capture
   * @param trialConfig - Additional trial configuration
   *
   * @example
   * ```javascript
   * const textarea = document.querySelector("textarea");
   * slopit.startTrial("response-1", textarea);
   * ```
   */
  override startTrial(
    trialId: string,
    element?: HTMLElement,
    trialConfig?: Partial<TrialConfig>,
  ): void;
  override startTrial(config: TrialConfig): void;
  override startTrial(
    trialIdOrConfig: string | TrialConfig,
    element?: HTMLElement,
    trialConfig?: Partial<TrialConfig>,
  ): void {
    if (typeof trialIdOrConfig === "string") {
      this.startTrialWithId(trialIdOrConfig, element, trialConfig);
    } else {
      super.startTrial(trialIdOrConfig);
    }
  }

  /**
   * Ends the current trial and stores data.
   *
   * @param response - The participant's response (text or ResponseInfo object)
   * @returns The completed trial data
   * @throws Error if no trial is in progress
   *
   * @example
   * ```javascript
   * // With text response
   * slopit.endTrial(vars.response);
   *
   * // With ResponseInfo object
   * slopit.endTrial({
   *   type: "text",
   *   value: vars.response,
   *   characterCount: vars.response.length,
   * });
   * ```
   */
  override endTrial(response?: string | ResponseInfo): CompletedTrial {
    // Clean up discovery observer if active
    if (this.discoveryCleanup !== null) {
      this.discoveryCleanup();
      this.discoveryCleanup = null;
    }

    // Convert string response to ResponseInfo
    const responseInfo: ResponseInfo | undefined =
      typeof response === "string"
        ? {
            type: "text",
            value: response,
            characterCount: response.length,
            wordCount: response.trim().split(/\s+/).filter(Boolean).length,
          }
        : response;

    const trial = super.endTrial(responseInfo);

    // Store last trial data for easy access
    this.lastTrialData = {
      behavioral: trial.behavioral ?? {
        keystrokes: [],
        focus: [],
        paste: [],
        mouse: [],
        scroll: [],
        clipboard: [],
        inputDuration: [],
        metrics: {
          keystroke: {
            totalKeystrokes: 0,
            printableKeystrokes: 0,
            deletions: 0,
            meanIKI: 0,
            stdIKI: 0,
            medianIKI: 0,
            pauseCount: 0,
            productProcessRatio: 0,
          },
          focus: {
            blurCount: 0,
            totalBlurDuration: 0,
            hiddenCount: 0,
            totalHiddenDuration: 0,
          },
          timing: {
            firstKeystrokeLatency: 0,
            totalResponseTime: 0,
            charactersPerMinute: 0,
          },
        },
      },
      flags: trial.captureFlags ?? [],
    };

    // Reset prepared state
    this.prepared = false;

    return trial;
  }

  /**
   * Gets the last trial's behavioral data.
   *
   * Use this to access data for storage in OSWeb vars.
   *
   * @returns AdapterData or null if no trial completed
   *
   * @example
   * ```javascript
   * const data = slopit.getTrialData();
   * if (data) {
   *   vars.keystroke_count = data.behavioral.keystrokes.length;
   * }
   * ```
   */
  getTrialData(): AdapterData | null {
    return this.lastTrialData;
  }

  /**
   * Gets the last trial's data as JSON string.
   *
   * Convenience method for storing in OSWeb vars.
   *
   * @returns JSON string of trial data
   *
   * @example
   * ```javascript
   * vars.slopit_data = slopit.getTrialDataJSON();
   * ```
   */
  getTrialDataJSON(): string {
    return JSON.stringify(this.lastTrialData);
  }

  /**
   * Stores session data in OSWeb vars object.
   *
   * @param key - Variable name (default: "slopit_session")
   *
   * @example
   * ```javascript
   * // At end of experiment
   * slopit.storeInVars("slopit_session");
   * ```
   */
  storeInVars(key = "slopit_session"): void {
    if (this.varsObject !== null) {
      this.varsObject[key] = JSON.stringify(this.exportSession());
    }
  }

  /**
   * Exports session as JSON string.
   *
   * @returns JSON string of complete session data
   *
   * @example
   * ```javascript
   * console.log(slopit.exportSessionJSON());
   * ```
   */
  exportSessionJSON(): string {
    return JSON.stringify(this.exportSession());
  }
}

// Also export as OSWebRecorder for clarity
export { SlopitRecorder as OSWebRecorder };
