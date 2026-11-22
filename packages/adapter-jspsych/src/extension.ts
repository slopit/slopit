/**
 * jsPsych extension for adding behavioral capture to existing plugins.
 *
 * @module
 */

import { discoverElement } from "@slopit/adapter-shared";
import {
  type BehavioralCapture,
  type BehavioralCaptureConfig,
  captureResponseControls,
  createBehavioralCapture,
  type ResponseControlsConfig,
} from "@slopit/behavioral";
import {
  type JsPsych,
  type JsPsychExtension,
  type JsPsychExtensionInfo,
  ParameterType,
} from "jspsych";
import type { SlopitData } from "./types.js";

/**
 * Extension parameters passed to individual trials.
 */
export interface SlopitExtensionParams extends BehavioralCaptureConfig {
  /**
   * CSS selector for the input element to monitor.
   *
   * If not specified, the extension will search for textarea or text input
   * elements within the trial display.
   *
   * @default "textarea, input[type='text']"
   */
  targetSelector?: string;

  /** Use the consent-gated response-control profile in place of text capture. */
  responseControls?: ResponseControlsConfig;
}

/**
 * jsPsych extension for behavioral capture.
 *
 * This extension wraps existing jsPsych plugins to add behavioral capture
 * without requiring plugin modifications. It attaches to text input elements
 * and collects keystroke dynamics, focus events, and clipboard operations.
 *
 * @example
 * ```javascript
 * import { initJsPsych } from "jspsych";
 * import jsPsychSurveyText from "@jspsych/plugin-survey-text";
 * import { SlopitExtension } from "@slopit/adapter-jspsych";
 *
 * const jsPsych = initJsPsych({
 *   extensions: [{ type: SlopitExtension }],
 * });
 *
 * const trial = {
 *   type: jsPsychSurveyText,
 *   questions: [{ prompt: "Describe your morning routine:" }],
 *   extensions: [
 *     {
 *       type: SlopitExtension,
 *       params: {
 *         targetSelector: "textarea",
 *         keystroke: { enabled: true },
 *         paste: { enabled: true, prevent: false },
 *       },
 *     },
 *   ],
 * };
 * ```
 */
class SlopitExtension implements JsPsychExtension {
  static info: JsPsychExtensionInfo = {
    name: "slopit",
    version: "0.1.0",
    data: {
      slopit: {
        type: ParameterType.OBJECT,
      },
    },
  };

  private jsPsych: JsPsych;
  private capture: BehavioralCapture | null = null;
  private responseCapture: ReturnType<typeof captureResponseControls> = null;
  private startTime = 0;
  private observerCleanup: (() => void) | null = null;

  /**
   * Creates a new SlopitExtension instance.
   *
   * @param jsPsych - The jsPsych instance
   */
  constructor(jsPsych: JsPsych) {
    this.jsPsych = jsPsych;
  }

  /**
   * Initializes the extension. Called once when jsPsych initializes.
   *
   * @param _params - Initialization parameters (unused)
   * @returns Promise that resolves when initialization is complete
   */
  initialize(_params: Record<string, unknown>): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Called when a trial using this extension begins.
   *
   * @param params - Extension parameters for this trial
   */
  on_start(_params: SlopitExtensionParams): void {
    this.startTime = performance.now();
  }

  /**
   * Called after the trial display is rendered.
   *
   * Searches for the target element and attaches behavioral capture.
   *
   * @param params - Extension parameters for this trial
   */
  on_load(params: SlopitExtensionParams): void {
    const displayElement = this.jsPsych.getDisplayElement();
    if (params.responseControls !== undefined) {
      this.responseCapture = captureResponseControls(
        displayElement,
        params.responseControls,
        this.startTime,
      );
      return;
    }
    const selector = params.targetSelector ?? "textarea, input[type='text']";

    const cleanup = discoverElement({
      selector,
      container: displayElement,
      timeout: 5000,
      onFound: (element) => {
        this.attachCapture(element, params);
      },
      onTimeout: () => {
        console.warn("[slopit] Target element not found within timeout");
      },
    });
    this.observerCleanup = cleanup;
  }

  /**
   * Called when the trial ends.
   *
   * @returns Object containing behavioral capture data
   */
  on_finish(): { slopit: SlopitData } | Record<string, never> {
    if (this.observerCleanup !== null) {
      this.observerCleanup();
      this.observerCleanup = null;
    }

    if (this.responseCapture !== null) {
      const responseControls = this.responseCapture.finish();
      this.responseCapture = null;
      return responseControls === null
        ? {}
        : { slopit: { behavioral: { responseControls }, flags: [] } };
    }
    if (this.capture === null) {
      return {};
    }

    const behavioral = this.capture.getData();
    const flags = this.capture.getFlags();

    this.capture.detach();
    this.capture = null;

    return {
      slopit: {
        behavioral,
        flags,
      },
    };
  }

  /**
   * Attaches behavioral capture to the target element.
   *
   * @param element - The element to attach to
   * @param params - Extension parameters
   */
  private attachCapture(element: HTMLElement, params: SlopitExtensionParams): void {
    if (this.capture !== null) {
      return; // Already attached
    }

    // Build config object, omitting undefined properties
    const config: BehavioralCaptureConfig = {};

    if (params.keystroke !== undefined) {
      config.keystroke = params.keystroke;
    }
    if (params.focus !== undefined) {
      config.focus = params.focus;
    }
    if (params.paste !== undefined) {
      config.paste = params.paste;
    }
    if (params.clipboard !== undefined) {
      config.clipboard = params.clipboard;
    }
    if (params.mouse !== undefined) {
      config.mouse = params.mouse;
    }
    if (params.scroll !== undefined) {
      config.scroll = params.scroll;
    }
    if (params.inputDuration !== undefined) {
      config.inputDuration = params.inputDuration;
    }

    this.capture = createBehavioralCapture(config);
    this.capture.attach(element, this.startTime);
  }
}

export { SlopitExtension };
