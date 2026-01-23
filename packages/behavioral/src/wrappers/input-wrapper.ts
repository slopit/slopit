/**
 * Generic wrapper for HTML input elements combining behavioral capture with interventions.
 *
 * @module
 */

import type { BehavioralData, CaptureFlag } from "@slopit/core";
import { BehavioralCapture } from "../capture.js";
import type { DetectionResult, Detector } from "../detection/index.js";
import type { BehavioralCaptureConfig } from "../types.js";

/**
 * Result of an intervention action.
 */
export interface InterventionResult {
  /**
   * Unique identifier for the intervention.
   */
  id: string;

  /**
   * Timestamp when the intervention was triggered.
   */
  timestamp: number;

  /**
   * Type of intervention applied.
   */
  type: string;

  /**
   * Whether the intervention was shown to the user.
   */
  shown: boolean;

  /**
   * User's response to the intervention, if any.
   */
  userResponse?: string;

  /**
   * Duration the intervention was displayed in milliseconds.
   */
  displayDuration?: number;

  /**
   * Additional metadata about the intervention.
   */
  metadata?: Record<string, unknown>;
}

/**
 * Interface for managing interventions during behavioral capture.
 *
 * Implementations can provide various intervention strategies such as
 * warnings, confirmations, or educational prompts.
 */
export interface InterventionManager {
  /**
   * Unique name for this intervention manager.
   */
  readonly name: string;

  /**
   * Evaluates whether an intervention should be triggered.
   *
   * @param data - Current behavioral data
   * @param flags - Current capture flags
   * @returns Whether an intervention should be shown
   */
  shouldIntervene(data: BehavioralData, flags: CaptureFlag[]): boolean;

  /**
   * Executes the intervention and returns the result.
   *
   * @param data - Current behavioral data
   * @param flags - Current capture flags
   * @returns Promise resolving to the intervention result
   */
  intervene(data: BehavioralData, flags: CaptureFlag[]): Promise<InterventionResult>;

  /**
   * Resets the intervention manager state.
   */
  reset(): void;
}

/**
 * Event types emitted by the InputWrapper.
 */
export type WrapperEvent =
  | "data" // Data captured
  | "flag" // Flag generated
  | "intervention" // Intervention triggered
  | "detection"; // Detection result

/**
 * Configuration for InputWrapper.
 */
export interface InputWrapperConfig {
  /**
   * Configuration for behavioral capture.
   */
  capture?: BehavioralCaptureConfig;

  /**
   * Optional intervention manager for handling detected behaviors.
   */
  interventionManager?: InterventionManager;

  /**
   * Array of detectors to run periodically.
   */
  detectors?: Detector[];

  /**
   * Interval in milliseconds between detector runs.
   * @default 5000
   */
  detectionInterval?: number;
}

/**
 * Extended behavioral data including flags, detection results, and interventions.
 */
export interface EnhancedBehavioralData extends BehavioralData {
  /**
   * Flags generated during capture.
   */
  flags: CaptureFlag[];

  /**
   * Results from all detector runs.
   */
  detectionResults: DetectionResult[];

  /**
   * Results from all interventions.
   */
  interventions: InterventionResult[];
}

/**
 * Event handler type for wrapper events.
 */
type WrapperEventHandler<T> = (data: T) => void;

/**
 * Generic wrapper for HTML input elements combining behavioral capture with detection and intervention.
 *
 * The InputWrapper provides a unified interface for:
 * - Behavioral data capture via BehavioralCapture
 * - Periodic detection via configurable Detectors
 * - Intervention handling via InterventionManager
 * - Event-based notification of capture, detection, and intervention events
 *
 * @example
 * ```typescript
 * import { InputWrapper, createInputWrapper } from "@slopit/behavioral";
 *
 * // Create wrapper with default configuration
 * const wrapper = createInputWrapper({
 *   capture: { keystroke: { enabled: true } },
 *   detectionInterval: 3000,
 * });
 *
 * // Wrap an input element
 * const textarea = document.getElementById("response") as HTMLTextAreaElement;
 * wrapper.wrap(textarea);
 *
 * // Subscribe to events
 * wrapper.on("detection", (result) => {
 *   console.log("Detection:", result);
 * });
 *
 * // Later, get all captured data
 * const data = wrapper.getData();
 *
 * // Cleanup
 * wrapper.unwrap();
 * ```
 */
export class InputWrapper {
  private element: HTMLTextAreaElement | HTMLInputElement | null = null;
  private capture: BehavioralCapture;
  private interventionManager?: InterventionManager;
  private detectors: Detector[] = [];
  private detectionInterval: number;
  private detectionTimer?: ReturnType<typeof setInterval>;
  private detectionResults: DetectionResult[] = [];
  private interventionResults: InterventionResult[] = [];
  private listeners: Map<WrapperEvent, Set<WrapperEventHandler<unknown>>> = new Map();
  private isInterventionInProgress = false;

  /**
   * Creates a new InputWrapper instance.
   *
   * @param config - Configuration options for the wrapper
   */
  constructor(config: InputWrapperConfig = {}) {
    this.capture = new BehavioralCapture(config.capture ?? {});
    if (config.interventionManager !== undefined) {
      this.interventionManager = config.interventionManager;
    }
    this.detectors = config.detectors ?? [];
    this.detectionInterval = config.detectionInterval ?? 5000;
  }

  /**
   * Wraps an input element with behavioral capture.
   *
   * Attaches event listeners to the element and starts detection
   * if detectors are configured.
   *
   * @param element - The textarea or input element to wrap
   * @throws {Error} If the wrapper is already attached to an element
   *
   * @example
   * ```typescript
   * const wrapper = createInputWrapper();
   * const input = document.querySelector("textarea");
   * wrapper.wrap(input);
   * ```
   */
  wrap(element: HTMLTextAreaElement | HTMLInputElement): void {
    if (this.element !== null) {
      throw new Error("InputWrapper already attached. Call unwrap() first.");
    }

    this.element = element;
    this.capture.attach(element);

    if (this.detectors.length > 0) {
      this.startDetection();
    }

    if (this.interventionManager !== undefined) {
      this.setupInterventionChecks();
    }
  }

  /**
   * Unwraps the element and cleans up all resources.
   *
   * Stops detection, detaches capture, and clears all internal state.
   *
   * @example
   * ```typescript
   * wrapper.unwrap();
   * // Can now wrap a different element
   * wrapper.wrap(anotherElement);
   * ```
   */
  unwrap(): void {
    this.stopDetection();
    this.capture.detach();
    this.element = null;
  }

  /**
   * Resets all collected data without unwrapping.
   *
   * Clears captured data, detection results, and intervention results
   * while maintaining the element attachment.
   *
   * @param newStartTime - Optional new start time for capture timing
   */
  reset(newStartTime?: number): void {
    this.capture.reset(newStartTime);
    this.detectionResults = [];
    this.interventionResults = [];

    if (this.interventionManager !== undefined) {
      this.interventionManager.reset();
    }
  }

  /**
   * Gets all captured data including flags, detection results, and interventions.
   *
   * @returns Enhanced behavioral data with all capture information
   *
   * @example
   * ```typescript
   * const data = wrapper.getData();
   * console.log("Keystrokes:", data.keystrokes?.length);
   * console.log("Flags:", data.flags.length);
   * console.log("Detections:", data.detectionResults.length);
   * ```
   */
  getData(): EnhancedBehavioralData {
    return {
      ...this.capture.getData(),
      flags: this.capture.getFlags(),
      detectionResults: [...this.detectionResults],
      interventions: [...this.interventionResults],
    };
  }

  /**
   * Gets flags generated during capture.
   *
   * @returns Array of capture flags
   */
  getFlags(): CaptureFlag[] {
    return this.capture.getFlags();
  }

  /**
   * Gets all detection results from detector runs.
   *
   * @returns Array of detection results
   */
  getDetectionResults(): DetectionResult[] {
    return [...this.detectionResults];
  }

  /**
   * Gets all intervention results.
   *
   * @returns Array of intervention results
   */
  getInterventionResults(): InterventionResult[] {
    return [...this.interventionResults];
  }

  /**
   * Manually triggers all detectors immediately.
   *
   * Useful for running detection on demand rather than waiting
   * for the next scheduled interval.
   *
   * @returns Array of detection results from this run
   */
  runDetection(): DetectionResult[] {
    const results: DetectionResult[] = [];

    for (const detector of this.detectors) {
      const result = detector.detect();
      results.push(result);
      this.detectionResults.push(result);
      this.emit("detection", result);
    }

    return results;
  }

  /**
   * Subscribes to wrapper events.
   *
   * @param event - The event type to subscribe to
   * @param handler - The callback function to invoke
   *
   * @example
   * ```typescript
   * wrapper.on("flag", (flag) => {
   *   console.log("Flag generated:", flag.type);
   * });
   *
   * wrapper.on("detection", (result) => {
   *   if (result.detected) {
   *     console.log("Detected:", result.message);
   *   }
   * });
   * ```
   */
  on(event: WrapperEvent, handler: WrapperEventHandler<unknown>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(handler);
  }

  /**
   * Unsubscribes from wrapper events.
   *
   * @param event - The event type to unsubscribe from
   * @param handler - The callback function to remove
   */
  off(event: WrapperEvent, handler: WrapperEventHandler<unknown>): void {
    this.listeners.get(event)?.delete(handler);
  }

  /**
   * Starts the detection timer for periodic detector runs.
   */
  private startDetection(): void {
    if (this.detectionTimer !== undefined) {
      return;
    }

    // Start monitoring for detectors that support it
    for (const detector of this.detectors) {
      if (detector.startMonitoring !== undefined && this.element !== null) {
        detector.startMonitoring(this.element);
      }
    }

    this.detectionTimer = setInterval(() => {
      this.runDetection();
    }, this.detectionInterval);
  }

  /**
   * Stops the detection timer and monitoring.
   */
  private stopDetection(): void {
    if (this.detectionTimer !== undefined) {
      clearInterval(this.detectionTimer);
      delete this.detectionTimer;
    }

    // Stop monitoring for detectors that support it
    for (const detector of this.detectors) {
      if (detector.stopMonitoring !== undefined) {
        detector.stopMonitoring();
      }
    }
  }

  /**
   * Sets up intervention checks on behavioral capture events.
   */
  private setupInterventionChecks(): void {
    if (this.interventionManager === undefined) {
      return;
    }

    // Check for intervention on keystroke events
    this.capture.on("keystroke", () => {
      void this.checkIntervention();
    });

    // Check for intervention on paste events
    this.capture.on("paste", () => {
      void this.checkIntervention();
    });

    // Check for intervention on focus events
    this.capture.on("focus", () => {
      void this.checkIntervention();
    });
  }

  /**
   * Checks if an intervention should be triggered and executes it.
   */
  private async checkIntervention(): Promise<void> {
    if (this.interventionManager === undefined || this.isInterventionInProgress) {
      return;
    }

    const data = this.capture.getData();
    const flags = this.capture.getFlags();

    if (this.interventionManager.shouldIntervene(data, flags)) {
      this.isInterventionInProgress = true;

      try {
        const result = await this.interventionManager.intervene(data, flags);
        this.interventionResults.push(result);
        this.emit("intervention", result);
      } finally {
        this.isInterventionInProgress = false;
      }
    }
  }

  /**
   * Emits an event to all subscribed handlers.
   *
   * @param event - The event type
   * @param data - The event data
   */
  private emit(event: WrapperEvent, data: unknown): void {
    const handlers = this.listeners.get(event);
    if (handlers === undefined) {
      return;
    }

    for (const handler of handlers) {
      handler(data);
    }
  }
}

/**
 * Factory function to create an InputWrapper instance.
 *
 * @param config - Optional configuration for the wrapper
 * @returns A new InputWrapper instance
 *
 * @example
 * ```typescript
 * const wrapper = createInputWrapper({
 *   capture: {
 *     keystroke: { enabled: true },
 *     paste: { enabled: true, prevent: false },
 *   },
 *   detectionInterval: 3000,
 * });
 * ```
 */
export function createInputWrapper(config?: InputWrapperConfig): InputWrapper {
  return new InputWrapper(config);
}
