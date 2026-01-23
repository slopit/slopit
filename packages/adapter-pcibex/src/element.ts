/**
 * PCIbex element implementation for Slopit behavioral capture.
 *
 * @module
 */

import { type AdapterData, discoverElement } from "@slopit/adapter-shared";
import type { BehavioralCaptureConfig } from "@slopit/behavioral";
import { BehavioralCapture } from "@slopit/behavioral";

import type { PennElement, SlopitElement } from "./types.js";

/**
 * Global registry for Slopit elements.
 *
 * PCIbex uses a global registry pattern for elements, allowing
 * getSlopit() to retrieve previously created elements by name.
 */
const slopitElements = new Map<string, SlopitElementImpl>();

/**
 * Internal implementation of the SlopitElement interface.
 */
class SlopitElementImpl implements SlopitElement {
  private name: string;
  private config: BehavioralCaptureConfig;
  private capture: BehavioralCapture | null = null;
  private targetElement: HTMLElement | null = null;
  private startTime = 0;
  private data: AdapterData | null = null;
  private cleanupFn: (() => void) | null = null;

  constructor(name: string) {
    this.name = name;
    this.config = {
      keystroke: { enabled: false },
      paste: { enabled: false, capturePreview: true },
      focus: { enabled: true },
      mouse: { enabled: false },
      scroll: { enabled: false },
    };
  }

  attach(element: PennElement): SlopitElement {
    const domElement = this.extractElement(element);

    if (domElement !== null) {
      this.targetElement = domElement;
      this.startCapture();
    }

    return this;
  }

  /**
   * Extract the underlying DOM element from a PennController element.
   *
   * PennController elements have different structures depending on type.
   * TextInput elements typically use jQueryElement or jQueryContainer.
   *
   * @param pennElement - The PennController element wrapper
   * @returns The DOM element, or null if not found
   */
  private extractElement(pennElement: PennElement): HTMLElement | null {
    // Direct element reference (some element types)
    if (pennElement._element instanceof HTMLElement) {
      return pennElement._element;
    }

    // jQuery element reference (TextInput elements)
    if (pennElement.jQueryElement !== undefined) {
      const el = pennElement.jQueryElement.get(0);
      if (el instanceof HTMLElement) {
        return el;
      }
    }

    // jQuery container with input/textarea (other element types)
    if (pennElement.jQueryContainer !== undefined) {
      const input = pennElement.jQueryContainer.find("input, textarea").get(0);
      if (input instanceof HTMLElement) {
        return input;
      }
    }

    return null;
  }

  /**
   * Start behavioral capture on the attached element.
   */
  private startCapture(): void {
    if (this.targetElement === null) {
      return;
    }

    this.startTime = performance.now();
    this.capture = new BehavioralCapture(this.config);
    this.capture.attach(this.targetElement, this.startTime);
  }

  keystroke(enabled: boolean): SlopitElement {
    this.config.keystroke = { ...this.config.keystroke, enabled };
    this.updateCaptureIfActive();
    return this;
  }

  paste(enabled: boolean, capture = true): SlopitElement {
    this.config.paste = {
      ...this.config.paste,
      enabled,
      capturePreview: capture,
    };
    this.updateCaptureIfActive();
    return this;
  }

  focus(enabled: boolean): SlopitElement {
    this.config.focus = { ...this.config.focus, enabled };
    this.updateCaptureIfActive();
    return this;
  }

  mouse(enabled: boolean): SlopitElement {
    this.config.mouse = { ...this.config.mouse, enabled };
    this.updateCaptureIfActive();
    return this;
  }

  scroll(enabled: boolean): SlopitElement {
    this.config.scroll = { ...this.config.scroll, enabled };
    this.updateCaptureIfActive();
    return this;
  }

  /**
   * Restart capture with updated configuration if already active.
   */
  private updateCaptureIfActive(): void {
    if (this.capture !== null && this.targetElement !== null) {
      this.capture.detach();
      this.startCapture();
    }
  }

  log(): SlopitElement {
    if (this.capture !== null) {
      this.data = {
        behavioral: this.capture.getData(),
        flags: this.capture.getFlags(),
      };
      this.capture.detach();
      this.capture = null;
    }

    if (this.cleanupFn !== null) {
      this.cleanupFn();
      this.cleanupFn = null;
    }

    return this;
  }

  _getData(): AdapterData | null {
    return this.data;
  }

  /**
   * Attach capture when the target element becomes available.
   *
   * Uses a MutationObserver to watch for the element to appear in the DOM.
   * Useful when the target element is not yet printed when attach() is called.
   *
   * @param selector - CSS selector for the target element
   * @param container - Container element to search within
   */
  _attachWhenReady(selector: string, container: HTMLElement | Document): void {
    this.cleanupFn = discoverElement({
      selector,
      container,
      timeout: 10000,
      onFound: (el) => {
        this.targetElement = el;
        this.startCapture();
      },
    });
  }

  /**
   * Get the name of this Slopit element.
   *
   * @returns The element name
   */
  _getName(): string {
    return this.name;
  }
}

/**
 * Create a new Slopit element for PCIbex experiments.
 *
 * Creates a behavioral capture element that can be attached to
 * PennController TextInput or other input elements.
 *
 * @param name - Unique name for this element
 * @returns A new Slopit element
 *
 * @example
 * ```javascript
 * // In a PCIbex experiment:
 * newSlopit("capture")
 *   .attach(getTextInput("answer"))
 *   .keystroke(true)
 *   .paste(true, false)
 * ```
 */
export function newSlopit(name: string): SlopitElement {
  const element = new SlopitElementImpl(name);
  slopitElements.set(name, element);
  return element;
}

/**
 * Get a previously created Slopit element by name.
 *
 * @param name - Name of the element to retrieve
 * @returns The Slopit element, or undefined if not found
 *
 * @example
 * ```javascript
 * // After creating with newSlopit:
 * getSlopit("capture").log();
 * ```
 */
export function getSlopit(name: string): SlopitElement | undefined {
  return slopitElements.get(name);
}

/**
 * Clear all Slopit elements from the registry.
 *
 * Call this between trials if reusing element names, or at the
 * end of an experiment to clean up.
 *
 * @example
 * ```javascript
 * // At the end of a trial or experiment:
 * clearSlopitElements();
 * ```
 */
export function clearSlopitElements(): void {
  // Log any elements that haven't been logged yet
  for (const element of slopitElements.values()) {
    const impl = element as SlopitElementImpl;
    if (impl._getData() === null) {
      impl.log();
    }
  }
  slopitElements.clear();
}

/**
 * Get data from all registered Slopit elements.
 *
 * Returns a record mapping element names to their collected data.
 * Elements that haven't called log() will have null data.
 *
 * @returns Record of element names to adapter data
 *
 * @example
 * ```javascript
 * // Get all captured data:
 * const allData = getAllSlopitData();
 * console.log(allData["capture"]);
 * ```
 */
export function getAllSlopitData(): Record<string, AdapterData | null> {
  const result: Record<string, AdapterData | null> = {};
  for (const [name, element] of slopitElements) {
    result[name] = element._getData();
  }
  return result;
}

/**
 * Get the number of registered Slopit elements.
 *
 * @returns The count of registered elements
 */
export function getSlopitCount(): number {
  return slopitElements.size;
}
