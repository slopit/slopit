/**
 * Base types for detection modules.
 *
 * @module
 */

/**
 * Represents an individual detection indicator found during detection.
 *
 * @example
 * ```typescript
 * const indicator: DetectionIndicator = {
 *   type: "clipboard-paste",
 *   selector: "#response-field",
 *   details: { pasteLength: 500 },
 * };
 * ```
 */
export interface DetectionIndicator {
  /** The type identifier for this indicator. */
  type: string;

  /** Optional CSS selector identifying the element where detection occurred. */
  selector?: string;

  /** Optional additional details about the detection. */
  details?: Record<string, unknown>;
}

/**
 * The result returned by a detector after running detection.
 *
 * @example
 * ```typescript
 * const result: DetectionResult = {
 *   detected: true,
 *   confidence: 0.85,
 *   message: "Large clipboard paste detected",
 *   indicators: [
 *     { type: "paste-size", details: { characters: 500 } },
 *   ],
 * };
 * ```
 */
export interface DetectionResult {
  /** Whether the detector found evidence of the behavior it monitors. */
  detected: boolean;

  /** Confidence score from 0 to 1, where 1 indicates highest confidence. */
  confidence: number;

  /** Human-readable message describing the detection result. */
  message: string;

  /** List of specific indicators that contributed to this result. */
  indicators: DetectionIndicator[];
}

/**
 * Interface for detection modules that identify specific behaviors.
 *
 * Detectors can operate in two modes:
 * 1. One-shot detection via `detect()`
 * 2. Continuous monitoring via `startMonitoring()` and `stopMonitoring()`
 *
 * @example
 * ```typescript
 * class PasteDetector implements Detector {
 *   readonly name = "paste-detector";
 *
 *   detect(): DetectionResult {
 *     // Check for paste indicators
 *     return {
 *       detected: false,
 *       confidence: 0,
 *       message: "No paste detected",
 *       indicators: [],
 *     };
 *   }
 * }
 * ```
 */
export interface Detector {
  /** Unique identifier for this detector. */
  readonly name: string;

  /**
   * Performs detection and returns the result.
   *
   * @returns The detection result with confidence and indicators.
   */
  detect(): DetectionResult;

  /**
   * Starts continuous monitoring for the behavior.
   * Optional; not all detectors support continuous monitoring.
   *
   * @param element - Optional element to monitor (implementation-specific)
   */
  startMonitoring?(element?: HTMLElement): void;

  /**
   * Stops continuous monitoring.
   * Optional; not all detectors support continuous monitoring.
   */
  stopMonitoring?(): void;
}
