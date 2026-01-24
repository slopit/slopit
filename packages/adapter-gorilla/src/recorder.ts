/**
 * Gorilla experiment recorder implementation.
 *
 * @module
 */

import {
  BaseRecorder,
  type CompletedTrial,
  discoverElement,
  type TrialConfig,
} from "@slopit/adapter-shared";
import type { PlatformInfo, ResponseInfo } from "@slopit/core";

import type { GorillaModule, GorillaRecorderConfig } from "./types.js";

/**
 * SlopitRecorder for Gorilla experiments.
 *
 * Extends BaseRecorder with Gorilla-specific functionality for storing
 * behavioral data via the Gorilla API.
 *
 * @example
 * ```typescript
 * gorilla.ready(function() {
 *   const recorder = new SlopitRecorder();
 *   recorder.startTrial("trial_1", document.querySelector("textarea"));
 *
 *   // On submit:
 *   recorder.endTrial(response);
 *   recorder.storeSession();
 * });
 * ```
 *
 * @example Auto-store mode
 * ```typescript
 * const recorder = new SlopitRecorder({ autoStore: true });
 * recorder.startTrial("trial_1", textarea);
 * recorder.endTrial(response); // Automatically stores trial data
 * ```
 */
export class SlopitRecorder extends BaseRecorder {
  private autoStore: boolean;
  private storeKey: string;
  private discoveryCleanup: (() => void) | null = null;

  /**
   * Creates a new SlopitRecorder for Gorilla experiments.
   *
   * @param config - Recorder configuration options
   */
  constructor(config?: GorillaRecorderConfig) {
    super(config);
    this.autoStore = config?.autoStore ?? false;
    this.storeKey = config?.storeKey ?? "slopit";
  }

  /**
   * Returns platform information for Gorilla.
   *
   * @returns Platform metadata
   */
  protected getPlatformInfo(): PlatformInfo {
    return {
      name: "Gorilla",
      version: this.detectGorillaVersion(),
      adapterVersion: "0.1.0",
    };
  }

  /**
   * Detects the Gorilla platform version.
   *
   * Gorilla does not expose version information publicly, so this returns
   * "unknown" by default.
   *
   * @returns Version string or "unknown"
   */
  private detectGorillaVersion(): string {
    // Gorilla does not expose version publicly
    return "unknown";
  }

  /**
   * Gets the global Gorilla module if available.
   *
   * @returns Gorilla module or undefined if not available
   */
  private getGorilla(): GorillaModule | undefined {
    return typeof window !== "undefined" ? window.gorilla : undefined;
  }

  /**
   * Starts capturing behavioral data for a trial.
   *
   * This convenience method provides a simpler API compared to the base
   * startTrial() that accepts a TrialConfig object.
   *
   * @param trialId - Unique identifier for the trial
   * @param element - Target DOM element (optional, can attach later)
   * @param trialConfig - Additional trial configuration
   *
   * @example
   * ```typescript
   * recorder.startTrial("trial_1", document.querySelector("textarea"));
   * ```
   */
  override startTrial(
    trialId: string,
    element?: HTMLElement,
    trialConfig?: Partial<TrialConfig>,
  ): void;

  /**
   * Starts capturing behavioral data for a trial with full configuration.
   *
   * @param config - Complete trial configuration
   */
  override startTrial(config: TrialConfig): void;

  override startTrial(
    trialIdOrConfig: string | TrialConfig,
    element?: HTMLElement,
    trialConfig?: Partial<TrialConfig>,
  ): void {
    if (typeof trialIdOrConfig === "string") {
      const config: TrialConfig = {
        trialId: trialIdOrConfig,
        ...trialConfig,
      };
      if (element !== undefined) {
        config.targetElement = element;
      }
      super.startTrial(config);
    } else {
      super.startTrial(trialIdOrConfig);
    }
  }

  /**
   * Starts a trial with automatic element discovery.
   *
   * If the target element does not exist yet, this method uses a
   * MutationObserver to wait for it to appear in the DOM.
   *
   * @param trialId - Unique identifier for the trial
   * @param selector - CSS selector for target element
   * @param container - Container to search within (default: document)
   *
   * @example
   * ```typescript
   * // Start trial and wait for textarea to appear
   * recorder.startTrialWithSelector("trial_1", "textarea.response");
   * ```
   */
  startTrialWithSelector(
    trialId: string,
    selector: string,
    container: HTMLElement | Document = document,
  ): void {
    // Try immediate discovery
    const element = container.querySelector(selector) as HTMLElement | null;

    if (element !== null) {
      this.startTrial(trialId, element);
    } else {
      // Start trial first, then attach when element appears
      super.startTrial({ trialId });

      this.discoveryCleanup = discoverElement({
        selector,
        container: container as HTMLElement,
        timeout: 10000,
        onFound: (el) => {
          // Attach capture to discovered element
          if (this.currentTrial !== null) {
            this.attachCapture(el, this.currentTrial.startTime);
          }
        },
      });
    }
  }

  /**
   * Ends the current trial and returns the completed trial data.
   *
   * If autoStore is enabled, automatically stores trial data via gorilla.store().
   *
   * @param response - The participant's response (string or ResponseInfo)
   * @returns The completed trial data
   *
   * @example
   * ```typescript
   * const trial = recorder.endTrial("The participant's response text");
   * ```
   *
   * @example With ResponseInfo
   * ```typescript
   * const trial = recorder.endTrial({
   *   type: "text",
   *   value: "Response text",
   *   characterCount: 13,
   *   wordCount: 2,
   * });
   * ```
   */
  override endTrial(response?: string | ResponseInfo): CompletedTrial {
    // Clean up discovery observer
    if (this.discoveryCleanup !== null) {
      this.discoveryCleanup();
      this.discoveryCleanup = null;
    }

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

    // Auto-store if enabled
    if (this.autoStore) {
      const gorilla = this.getGorilla();
      if (gorilla !== undefined) {
        gorilla.store(`${this.storeKey}_trial_${trial.trialIndex}`, {
          behavioral: trial.behavioral,
          captureFlags: trial.captureFlags,
        });
      }
    }

    return trial;
  }

  /**
   * Stores the complete session via gorilla.metric().
   *
   * Call this at experiment end to store the full session data as a metric,
   * which will appear in the exported data.
   *
   * @param key - Metric key (default: "slopit_session")
   *
   * @example
   * ```typescript
   * // At end of experiment
   * recorder.storeSession();
   * gorilla.finish();
   * ```
   */
  storeSession(key = "slopit_session"): void {
    const gorilla = this.getGorilla();
    if (gorilla !== undefined) {
      gorilla.metric(key, JSON.stringify(this.exportSession()));
    }
  }

  /**
   * Stores session data via gorilla.store() for later retrieval.
   *
   * Unlike storeSession(), this stores the data for access within the
   * experiment rather than in the exported metrics.
   *
   * @param key - Store key (default: this.storeKey)
   *
   * @example
   * ```typescript
   * recorder.saveToStore("my_session_data");
   * ```
   */
  saveToStore(key?: string): void {
    const gorilla = this.getGorilla();
    if (gorilla !== undefined) {
      gorilla.store(key ?? this.storeKey, this.exportSession());
    }
  }
}

/**
 * Alias for SlopitRecorder for naming clarity.
 */
export { SlopitRecorder as GorillaRecorder };
