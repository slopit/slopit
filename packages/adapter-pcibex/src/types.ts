/**
 * Types for the PCIbex adapter.
 *
 * @module
 */

import type { AdapterConfig, AdapterData } from "@slopit/adapter-shared";

/**
 * Configuration for PCIbex Slopit elements.
 */
export interface PCIbexSlopitConfig extends AdapterConfig {
  /**
   * Whether to automatically log data when the element is removed from DOM.
   *
   * @default false
   */
  autoLog?: boolean;
}

/**
 * Mock type for PennController elements.
 *
 * In actual PCIbex experiments, elements have different structures
 * depending on their type. This interface provides a common shape
 * for extracting DOM elements from PennController wrappers.
 */
export interface PennElement {
  /**
   * Direct reference to the underlying DOM element.
   */
  _element?: HTMLElement;

  /**
   * jQuery-wrapped container used by some PennController element types.
   */
  jQueryContainer?: {
    find(selector: string): {
      get(index: number): HTMLElement | undefined;
      length: number;
    };
  };

  /**
   * jQuery element reference (used by TextInput elements).
   */
  jQueryElement?: {
    get(index: number): HTMLElement | undefined;
    length: number;
  };
}

/**
 * Interface for Slopit elements in PCIbex experiments.
 *
 * Provides a fluent API for configuring behavioral capture on
 * PennController TextInput and other elements.
 */
export interface SlopitElement {
  /**
   * Attach behavioral capture to a PennController element.
   *
   * @param element - The PennController element to monitor
   * @returns This element for method chaining
   */
  attach(element: PennElement): SlopitElement;

  /**
   * Enable or disable keystroke capture.
   *
   * @param enabled - Whether to capture keystrokes
   * @returns This element for method chaining
   */
  keystroke(enabled: boolean): SlopitElement;

  /**
   * Enable or disable paste event capture.
   *
   * @param enabled - Whether to capture paste events
   * @param capture - Whether to capture the pasted text content
   * @returns This element for method chaining
   */
  paste(enabled: boolean, capture?: boolean): SlopitElement;

  /**
   * Enable or disable focus event capture.
   *
   * @param enabled - Whether to capture focus events
   * @returns This element for method chaining
   */
  focus(enabled: boolean): SlopitElement;

  /**
   * Enable or disable mouse event capture.
   *
   * @param enabled - Whether to capture mouse events
   * @returns This element for method chaining
   */
  mouse(enabled: boolean): SlopitElement;

  /**
   * Enable or disable scroll event capture.
   *
   * @param enabled - Whether to capture scroll events
   * @returns This element for method chaining
   */
  scroll(enabled: boolean): SlopitElement;

  /**
   * Finalize capture and store data for logging.
   *
   * Call this before ending the trial to ensure all data is collected.
   *
   * @returns This element for method chaining
   */
  log(): SlopitElement;

  /**
   * Get the collected adapter data.
   *
   * @returns The collected data, or null if not yet logged
   */
  _getData(): AdapterData | null;
}

export type { AdapterData };
