/**
 * Type definitions for lab.js adapter.
 *
 * @module
 */

import type { AdapterConfig, AdapterData } from "@slopit/adapter-shared";

/**
 * Configuration for slopit behavioral capture in lab.js components.
 *
 * Extends the base adapter configuration with lab.js-specific options.
 */
export interface LabjsSlopitConfig extends AdapterConfig {
  /**
   * Container selector to search within for the target element.
   *
   * If not specified, searches within the lab.js content container
   * or falls back to document.body.
   *
   * @default ".lab-content"
   */
  containerSelector?: string;
}

/**
 * Trial data structure with optional slopit capture data.
 *
 * Represents the data object attached to a lab.js component after capture.
 */
export interface LabjsTrialData {
  /**
   * Slopit behavioral capture data, if capture was enabled and attached.
   */
  slopit?: AdapterData | undefined;

  /**
   * Allow additional properties from lab.js components.
   */
  [key: string]: unknown;
}

/**
 * Minimal interface for lab.js component lifecycle hooks.
 *
 * Since lab.js does not provide TypeScript definitions, this interface
 * describes the subset of component behavior used by the adapter.
 */
export interface LabjsComponentLike {
  /**
   * Component options, including custom parameters.
   */
  options: Record<string, unknown>;

  /**
   * Component data store for trial results.
   */
  data: Record<string, unknown>;

  /**
   * Registers an event handler for a lifecycle event.
   *
   * @param event - Event name (e.g., "run", "end")
   * @param handler - Handler function
   */
  on(event: string, handler: (...args: unknown[]) => void): void;
}

/**
 * Constructor type for lab.js components.
 */
export type LabjsComponentConstructor<T extends LabjsComponentLike = LabjsComponentLike> = new (
  ...args: unknown[]
) => T;
