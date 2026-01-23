/**
 * PsychoJS recorder implementation.
 *
 * @module
 */

import { BaseRecorder, type CompletedTrial, type TrialConfig } from "@slopit/adapter-shared";
import type { PlatformInfo, ResponseInfo } from "@slopit/core";

import type { PsychoJSRecorderConfig, PsychoJSTrialConfig } from "./types.js";

/**
 * Adapter version for this package.
 */
const ADAPTER_VERSION = "0.1.0";

/**
 * SlopitRecorder for PsychoJS experiments.
 *
 * Provides behavioral capture integration for PsychoJS/Pavlovia experiments.
 * This recorder extends BaseRecorder with PsychoJS-specific functionality
 * for handling PIXI.js elements and PsychoJS experiment handlers.
 *
 * @example
 * ```typescript
 * import { SlopitRecorder } from "@slopit/adapter-psychojs";
 *
 * const recorder = new SlopitRecorder({ psychoJS });
 *
 * // In routineBegin:
 * recorder.startTrial("trial_1", textBox._pixi);
 *
 * // In routineEnd:
 * const data = recorder.endTrial(textBox.text);
 *
 * // At experiment end:
 * const session = recorder.exportSession();
 * recorder.storeInExperiment(psychoJS);
 * ```
 */
export class SlopitRecorder extends BaseRecorder {
  /**
   * Reference to the PsychoJS instance for version detection.
   */
  private psychoJS: unknown;

  /**
   * Creates a new SlopitRecorder for PsychoJS.
   *
   * @param config - Recorder configuration
   *
   * @example
   * ```typescript
   * const recorder = new SlopitRecorder({
   *   psychoJS,
   *   participantId: "P001",
   *   studyId: "study-123",
   * });
   * ```
   */
  constructor(config?: PsychoJSRecorderConfig) {
    super(config);
    this.psychoJS = config?.psychoJS;
  }

  /**
   * Gets platform-specific information for PsychoJS.
   *
   * @returns Platform information including detected PsychoJS version
   */
  protected override getPlatformInfo(): PlatformInfo {
    return {
      name: "PsychoJS",
      version: this.detectPsychoJSVersion(),
      adapterVersion: ADAPTER_VERSION,
    };
  }

  /**
   * Detects the PsychoJS version from available sources.
   *
   * Attempts detection in the following order:
   * 1. From the psychoJS instance's version property
   * 2. From the global PsychoJS.VERSION constant
   * 3. Falls back to "unknown" if detection fails
   *
   * @returns Detected PsychoJS version or "unknown"
   */
  private detectPsychoJSVersion(): string {
    // Try to detect from the provided psychoJS instance
    if (this.psychoJS !== null && this.psychoJS !== undefined) {
      const instance = this.psychoJS as Record<string, unknown>;
      if (typeof instance["version"] === "string") {
        return instance["version"];
      }
    }

    // Try to detect from global PsychoJS object
    if (typeof window !== "undefined") {
      const win = window as unknown as Record<string, unknown>;
      const psychoJSGlobal = win["PsychoJS"] as Record<string, unknown> | undefined;
      if (psychoJSGlobal !== undefined && typeof psychoJSGlobal["VERSION"] === "string") {
        return psychoJSGlobal["VERSION"];
      }
    }

    return "unknown";
  }

  /**
   * Starts capturing behavioral data for a trial.
   *
   * Call this in routineBegin of your PsychoJS experiment.
   *
   * @param trialIdOrConfig - Trial ID string or full trial configuration
   * @param element - DOM element or PsychoJS/PIXI component to capture
   *
   * @example
   * ```typescript
   * // Simple usage with trial ID and element
   * recorder.startTrial("trial_1", textBox._pixi);
   *
   * // Full configuration
   * recorder.startTrial({
   *   trialId: "trial_1",
   *   trialIndex: 0,
   *   trialType: "free_response",
   *   stimulus: {
   *     type: "text",
   *     content: "Please describe your experience.",
   *   },
   * }, textBox._pixi);
   * ```
   */
  override startTrial(
    trialIdOrConfig: string | PsychoJSTrialConfig,
    element?: HTMLElement | unknown,
  ): void {
    const config: TrialConfig =
      typeof trialIdOrConfig === "string"
        ? { trialId: trialIdOrConfig }
        : this.buildTrialConfig(trialIdOrConfig);

    const extractedElement = element !== undefined ? this.extractDOMElement(element) : undefined;
    if (extractedElement !== undefined) {
      config.targetElement = extractedElement;
    }

    super.startTrial(config);
  }

  /**
   * Builds a TrialConfig from PsychoJSTrialConfig, handling optional properties.
   *
   * @param psychoConfig - PsychoJS trial configuration
   * @returns TrialConfig with only defined properties
   */
  private buildTrialConfig(psychoConfig: PsychoJSTrialConfig): TrialConfig {
    const config: TrialConfig = {};

    if (psychoConfig.trialId !== undefined) {
      config.trialId = psychoConfig.trialId;
    }
    if (psychoConfig.trialIndex !== undefined) {
      config.trialIndex = psychoConfig.trialIndex;
    }
    if (psychoConfig.trialType !== undefined) {
      config.trialType = psychoConfig.trialType;
    }
    if (psychoConfig.stimulus !== undefined) {
      config.stimulus = psychoConfig.stimulus;
    }

    return config;
  }

  /**
   * Extracts the actual DOM element from a PsychoJS/PIXI object.
   *
   * PsychoJS TextBox components wrap HTML input elements in PIXI structures.
   * This method navigates that structure to find the underlying DOM element.
   *
   * @param element - HTMLElement or PsychoJS/PIXI component
   * @returns The extracted HTMLElement or undefined if not found
   */
  private extractDOMElement(element: HTMLElement | unknown): HTMLElement | undefined {
    // Handle null/undefined
    if (element === null || element === undefined) {
      return undefined;
    }

    // If it's already an HTML element, return it
    if (element instanceof HTMLElement) {
      return element;
    }

    // Element is some other object (likely PIXI or PsychoJS component)
    const pixiElement = element as Record<string, unknown>;

    // Try to extract from PIXI TextInput (_input_div property)
    if (pixiElement["_input_div"] instanceof HTMLElement) {
      return pixiElement["_input_div"];
    }

    // Try htmlInput property (some versions use this)
    if (pixiElement["htmlInput"] instanceof HTMLElement) {
      return pixiElement["htmlInput"];
    }

    // For TextBox, the _pixi property may contain the input
    const pixi = pixiElement["_pixi"] as Record<string, unknown> | undefined;
    if (pixi !== undefined && pixi["_input_div"] instanceof HTMLElement) {
      return pixi["_input_div"];
    }

    return undefined;
  }

  /**
   * Ends the current trial and returns captured data.
   *
   * Call this in routineEnd of your PsychoJS experiment.
   *
   * @param response - The participant's response (text string or ResponseInfo object)
   * @returns The completed trial data including behavioral capture
   *
   * @example
   * ```typescript
   * // Simple usage with text response
   * const data = recorder.endTrial(textBox.text);
   *
   * // With full response info
   * const data = recorder.endTrial({
   *   type: "text",
   *   value: textBox.text,
   *   characterCount: textBox.text.length,
   *   wordCount: textBox.text.trim().split(/\s+/).length,
   * });
   * ```
   */
  override endTrial(response?: string | ResponseInfo): CompletedTrial {
    const responseInfo: ResponseInfo | undefined =
      typeof response === "string"
        ? {
            type: "text",
            value: response,
            characterCount: response.length,
            wordCount: response.trim().split(/\s+/).filter(Boolean).length,
          }
        : response;

    return super.endTrial(responseInfo);
  }

  /**
   * Stores session data in PsychoJS experiment handler.
   *
   * Call this at experiment end before uploading to Pavlovia.
   * The session data will be included in the experiment data file.
   *
   * @param psychoJS - PsychoJS instance with experimentHandler
   * @param key - Key to store the session under (default: "slopit_session")
   *
   * @example
   * ```typescript
   * // At experiment end:
   * recorder.storeInExperiment(psychoJS);
   *
   * // With custom key:
   * recorder.storeInExperiment(psychoJS, "behavioral_data");
   * ```
   */
  storeInExperiment(psychoJS: unknown, key = "slopit_session"): void {
    const session = this.exportSession();
    const psychoJSInstance = psychoJS as Record<string, unknown>;
    const handler = psychoJSInstance["experiment"] as Record<string, unknown> | undefined;

    if (handler !== undefined && typeof handler["addData"] === "function") {
      (handler["addData"] as (key: string, value: string) => void)(key, JSON.stringify(session));
    }
  }
}

/**
 * Alias for SlopitRecorder.
 *
 * Provides a more explicit name for the PsychoJS adapter.
 */
export { SlopitRecorder as PsychoJSRecorder };
