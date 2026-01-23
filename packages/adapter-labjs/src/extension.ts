/**
 * Mixin and component wrapper for adding slopit behavioral capture to lab.js components.
 *
 * @module
 */

import { type AdapterData, discoverElement } from "@slopit/adapter-shared";
import {
  type BehavioralCapture,
  type BehavioralCaptureConfig,
  createBehavioralCapture,
} from "@slopit/behavioral";

import type { LabjsComponentConstructor, LabjsSlopitConfig } from "./types.js";

/**
 * Default CSS selector for finding text input elements.
 */
const DEFAULT_TARGET_SELECTOR = "textarea, input[type='text']";

/**
 * Default CSS selector for the lab.js content container.
 */
const DEFAULT_CONTAINER_SELECTOR = ".lab-content";

/**
 * Default timeout for element discovery in milliseconds.
 */
const DEFAULT_DISCOVERY_TIMEOUT = 5000;

/**
 * Mixin function to add slopit behavioral capture to any lab.js component.
 *
 * Returns an enhanced component class that automatically attaches behavioral
 * capture during the component's run lifecycle and collects data when the
 * component ends.
 *
 * @typeParam T - The lab.js component constructor type
 * @param Component - The lab.js component class to enhance
 * @returns Enhanced component class with slopit behavioral capture
 *
 * @example
 * ```typescript
 * import { withSlopit } from "@slopit/adapter-labjs";
 *
 * // Assuming lab.js is loaded as a global
 * declare const lab: { html: { Screen: new (...args: unknown[]) => unknown } };
 *
 * // Create enhanced component class
 * const SlopitScreen = withSlopit(lab.html.Screen as LabjsComponentConstructor);
 *
 * // Use the enhanced component
 * const screen = new SlopitScreen({
 *   content: "<textarea id='response'></textarea>",
 *   slopit: {
 *     targetSelector: "#response",
 *     keystroke: { enabled: true },
 *     paste: { enabled: true },
 *   },
 * });
 * ```
 */
export function withSlopit<T extends LabjsComponentConstructor>(Component: T): T {
  const EnhancedComponent = class SlopitEnhancedComponent extends (Component as LabjsComponentConstructor) {
    /**
     * Behavioral capture instance for the current component.
     */
    private _slopitCapture: BehavioralCapture | null = null;

    /**
     * Start time for the component run (performance.now()).
     */
    private _slopitStartTime = 0;

    /**
     * Cleanup function for element discovery observer.
     */
    private _slopitCleanup: (() => void) | null = null;

    /**
     * Captured slopit data after component ends.
     */
    private _slopitData: AdapterData | null = null;

    /**
     * Creates an enhanced component with slopit behavioral capture.
     *
     * @param args - Arguments passed to the base component constructor
     */
    constructor(...args: unknown[]) {
      super(...args);

      // Hook into lifecycle events
      this.on("run", () => this._slopitOnRun());
      this.on("end", () => this._slopitOnEnd());
    }

    /**
     * Handles the component "run" lifecycle event.
     *
     * Initializes behavioral capture and attaches to the target element.
     */
    private _slopitOnRun(): void {
      const config = (this.options as OptionsWithSlopit).slopit;

      // Skip if slopit is not configured or explicitly disabled
      if (config === undefined || config.enabled === false) {
        return;
      }

      this._slopitStartTime = performance.now();

      const selector = config.targetSelector ?? DEFAULT_TARGET_SELECTOR;
      const containerSelector = config.containerSelector ?? DEFAULT_CONTAINER_SELECTOR;
      const container =
        (document.querySelector(containerSelector) as HTMLElement | null) ?? document.body;

      // Try immediate element discovery
      const element = container.querySelector<HTMLElement>(selector);

      if (element !== null) {
        this._attachCapture(element, config);
      } else {
        // Use MutationObserver for dynamically created elements
        this._slopitCleanup = discoverElement({
          selector,
          container,
          timeout: DEFAULT_DISCOVERY_TIMEOUT,
          onFound: (el) => this._attachCapture(el, config),
        });
      }
    }

    /**
     * Attaches behavioral capture to the target element.
     *
     * @param element - The DOM element to attach to
     * @param config - Slopit configuration
     */
    private _attachCapture(element: HTMLElement, config: LabjsSlopitConfig): void {
      if (this._slopitCapture !== null) {
        return; // Already attached
      }

      // Build capture configuration, omitting undefined properties
      const captureConfig: BehavioralCaptureConfig = {};

      if (config.keystroke !== undefined) {
        captureConfig.keystroke = config.keystroke;
      }
      if (config.focus !== undefined) {
        captureConfig.focus = config.focus;
      }
      if (config.paste !== undefined) {
        captureConfig.paste = config.paste;
      }
      if (config.clipboard !== undefined) {
        captureConfig.clipboard = config.clipboard;
      }
      if (config.mouse !== undefined) {
        captureConfig.mouse = config.mouse;
      }
      if (config.scroll !== undefined) {
        captureConfig.scroll = config.scroll;
      }
      if (config.inputDuration !== undefined) {
        captureConfig.inputDuration = config.inputDuration;
      }

      this._slopitCapture = createBehavioralCapture(captureConfig);
      this._slopitCapture.attach(element, this._slopitStartTime);
    }

    /**
     * Handles the component "end" lifecycle event.
     *
     * Collects captured data and cleans up resources.
     */
    private _slopitOnEnd(): void {
      // Clean up element discovery observer
      if (this._slopitCleanup !== null) {
        this._slopitCleanup();
        this._slopitCleanup = null;
      }

      // Collect data and detach capture
      if (this._slopitCapture !== null) {
        this._slopitData = {
          behavioral: this._slopitCapture.getData(),
          flags: this._slopitCapture.getFlags(),
        };
        this._slopitCapture.detach();
        this._slopitCapture = null;
      }

      // Store data in component's data store
      if (this._slopitData !== null) {
        this.data["slopit"] = this._slopitData;
      }
    }

    /**
     * Gets the captured slopit data for this component.
     *
     * Returns null if capture was not enabled or no data was collected.
     *
     * @returns The captured behavioral data and flags, or null
     */
    getSlopitData(): AdapterData | null {
      return this._slopitData;
    }
  };

  return EnhancedComponent as unknown as T;
}

/**
 * Component options interface with optional slopit configuration.
 */
interface OptionsWithSlopit {
  slopit?: LabjsSlopitConfig | undefined;
}
