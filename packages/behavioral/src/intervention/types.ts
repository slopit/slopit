/**
 * Types for the intervention module.
 *
 * @module
 */

/**
 * The type of intervention to apply when a trigger condition is met.
 *
 * - `warning`: Display a warning message to the user
 * - `friction`: Add friction (e.g., delay, extra confirmation)
 * - `challenge`: Require the user to complete a challenge
 * - `block`: Block the action entirely
 */
export type InterventionType = "warning" | "friction" | "challenge" | "block";

/**
 * Threshold configuration for paste-based triggers.
 */
export interface PasteThreshold {
  /** Minimum text length to trigger intervention. */
  minLength: number;

  /** Maximum preceding keystrokes allowed before paste. */
  maxPrecedingKeystrokes: number;
}

/**
 * Threshold configuration for blur/focus-based triggers.
 */
export interface BlurThreshold {
  /** Number of blur events to trigger intervention. */
  countThreshold: number;

  /** Total blur duration in milliseconds to trigger intervention. */
  durationThreshold: number;
}

/**
 * Threshold configuration for idle-based triggers.
 */
export interface IdleThreshold {
  /** Duration of idle time in milliseconds to trigger intervention. */
  durationMs: number;
}

/**
 * Threshold configuration for typing speed triggers.
 */
export interface TimingThreshold {
  /** Maximum characters per second before triggering intervention. */
  maxCharactersPerSecond: number;
}

/**
 * Configuration for a single trigger that can invoke an intervention.
 *
 * @example
 * ```typescript
 * const pasteTrigger: TriggerConfig = {
 *   type: "paste",
 *   threshold: {
 *     paste: { minLength: 100, maxPrecedingKeystrokes: 5 },
 *   },
 *   intervention: "warning",
 * };
 * ```
 */
export interface TriggerConfig {
  /**
   * The type of behavior that triggers this intervention.
   *
   * - `paste`: Triggered by paste events
   * - `blur`: Triggered by window/tab blur events
   * - `idle`: Triggered by user inactivity
   * - `timing`: Triggered by typing speed anomalies
   * - `composite`: Triggered by a combination of factors
   */
  type: "paste" | "blur" | "idle" | "timing" | "composite";

  /**
   * Threshold values for this trigger.
   * Only the relevant threshold for the trigger type needs to be specified.
   */
  threshold: {
    paste?: PasteThreshold;
    blur?: BlurThreshold;
    idle?: IdleThreshold;
    timing?: TimingThreshold;
  };

  /** The intervention type to apply when this trigger fires. */
  intervention: InterventionType;
}

/**
 * Result returned when an intervention is triggered.
 *
 * @example
 * ```typescript
 * const result: InterventionResult = {
 *   type: "warning",
 *   triggered: true,
 *   reason: "Large paste detected with minimal preceding keystrokes",
 *   triggerConfig: { ... },
 *   timestamp: 1234567890,
 * };
 * ```
 */
export interface InterventionResult {
  /** The type of intervention that was triggered. */
  type: InterventionType;

  /** Whether the intervention was actually triggered. */
  triggered: boolean;

  /** Human-readable reason explaining why the intervention was triggered. */
  reason: string;

  /** The trigger configuration that caused this intervention. */
  triggerConfig: TriggerConfig;

  /** Timestamp when the intervention was triggered (performance.now()). */
  timestamp: number;
}

/**
 * Configuration for the InterventionManager.
 *
 * @example
 * ```typescript
 * const config: InterventionManagerConfig = {
 *   triggers: [
 *     {
 *       type: "paste",
 *       threshold: { paste: { minLength: 100, maxPrecedingKeystrokes: 5 } },
 *       intervention: "warning",
 *     },
 *     {
 *       type: "blur",
 *       threshold: { blur: { countThreshold: 3, durationThreshold: 10000 } },
 *       intervention: "friction",
 *     },
 *   ],
 *   escalate: true,
 * };
 * ```
 */
export interface InterventionManagerConfig {
  /** Array of trigger configurations to evaluate. */
  triggers: TriggerConfig[];

  /**
   * Whether to escalate intervention level on repeated triggers.
   * When true, repeated triggers will escalate: warning -> friction -> challenge -> block.
   * @default false
   */
  escalate?: boolean;
}

/**
 * Behavioral state passed to the InterventionManager for evaluation.
 */
export interface BehavioralState {
  /** Array of paste events with text length and preceding keystroke count. */
  pasteEvents?: { textLength: number; precedingKeystrokes: number }[];

  /** Number of blur events that have occurred. */
  blurCount?: number;

  /** Total duration of blur events in milliseconds. */
  totalBlurDuration?: number;

  /** Current idle duration in milliseconds. */
  idleDuration?: number;

  /** Current typing speed in characters per second. */
  charactersPerSecond?: number;
}
