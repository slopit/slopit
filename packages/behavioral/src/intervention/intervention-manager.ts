/**
 * Manager for evaluating behavioral triggers and applying interventions.
 *
 * @module
 */

import type {
  BehavioralState,
  InterventionManagerConfig,
  InterventionResult,
  InterventionType,
  TriggerConfig,
} from "./types.js";

/**
 * Intervention levels in escalation order.
 */
const INTERVENTION_LEVELS: InterventionType[] = ["warning", "friction", "challenge", "block"];

/**
 * Manages behavioral interventions based on configurable triggers.
 *
 * The InterventionManager evaluates behavioral state against configured triggers
 * and fires interventions when thresholds are exceeded. It supports callback
 * registration for each intervention type and optional escalation on repeated
 * triggers.
 *
 * @example
 * ```typescript
 * const manager = new InterventionManager({
 *   triggers: [
 *     {
 *       type: "paste",
 *       threshold: { paste: { minLength: 100, maxPrecedingKeystrokes: 5 } },
 *       intervention: "warning",
 *     },
 *   ],
 *   escalate: true,
 * });
 *
 * manager.onIntervention("warning", (result) => {
 *   console.log("Warning triggered:", result.reason);
 * });
 *
 * const result = manager.evaluate({
 *   pasteEvents: [{ textLength: 500, precedingKeystrokes: 2 }],
 * });
 *
 * if (result) {
 *   console.log("Intervention fired:", result.type);
 * }
 * ```
 */
export class InterventionManager {
  private readonly triggers: TriggerConfig[];
  private readonly escalate: boolean;
  private interventionHistory: InterventionResult[] = [];
  private callbacks: Map<InterventionType, ((result: InterventionResult) => void)[]> = new Map();
  private triggerCounts: Map<TriggerConfig, number> = new Map();

  /**
   * Creates a new InterventionManager.
   *
   * @param config - Configuration with triggers and escalation settings
   */
  constructor(config: InterventionManagerConfig) {
    this.triggers = config.triggers;
    this.escalate = config.escalate ?? false;

    // Initialize callback arrays for each intervention type
    for (const type of INTERVENTION_LEVELS) {
      this.callbacks.set(type, []);
    }

    // Initialize trigger counts for escalation
    for (const trigger of this.triggers) {
      this.triggerCounts.set(trigger, 0);
    }
  }

  /**
   * Evaluates triggers against the current behavioral state.
   *
   * Checks each configured trigger against the provided state and returns
   * an InterventionResult if any trigger fires. Only the first matching
   * trigger is returned.
   *
   * @param state - Current behavioral state to evaluate
   * @returns InterventionResult if a trigger fires, null otherwise
   *
   * @example
   * ```typescript
   * const result = manager.evaluate({
   *   pasteEvents: [{ textLength: 500, precedingKeystrokes: 2 }],
   *   blurCount: 5,
   *   totalBlurDuration: 15000,
   * });
   * ```
   */
  evaluate(state: BehavioralState): InterventionResult | null {
    for (const trigger of this.triggers) {
      const result = this.evaluateTrigger(trigger, state);
      if (result !== null) {
        // Update trigger count for escalation
        const currentCount = this.triggerCounts.get(trigger) ?? 0;
        this.triggerCounts.set(trigger, currentCount + 1);

        // Apply escalation if enabled
        const finalResult = this.escalate ? this.applyEscalation(result, trigger) : result;

        this.interventionHistory.push(finalResult);
        this.fireCallbacks(finalResult);
        return finalResult;
      }
    }
    return null;
  }

  /**
   * Registers a callback for a specific intervention type.
   *
   * Callbacks are invoked whenever an intervention of the specified type
   * is triggered during evaluation.
   *
   * @param type - The intervention type to listen for
   * @param callback - Function to call when the intervention fires
   *
   * @example
   * ```typescript
   * manager.onIntervention("warning", (result) => {
   *   alert(result.reason);
   * });
   *
   * manager.onIntervention("block", (result) => {
   *   disableSubmitButton();
   * });
   * ```
   */
  onIntervention(type: InterventionType, callback: (result: InterventionResult) => void): void {
    const callbacks = this.callbacks.get(type);
    if (callbacks !== undefined) {
      callbacks.push(callback);
    }
  }

  /**
   * Returns the history of all triggered interventions.
   *
   * @returns Copy of the intervention history array
   *
   * @example
   * ```typescript
   * const history = manager.getHistory();
   * console.log(`Total interventions: ${history.length}`);
   * ```
   */
  getHistory(): InterventionResult[] {
    return [...this.interventionHistory];
  }

  /**
   * Resets the intervention history and trigger counts.
   *
   * Call this method to clear all recorded interventions and reset
   * escalation counters.
   *
   * @example
   * ```typescript
   * manager.reset();
   * // History is now empty and escalation counters are reset
   * ```
   */
  reset(): void {
    this.interventionHistory = [];
    for (const trigger of this.triggers) {
      this.triggerCounts.set(trigger, 0);
    }
  }

  /**
   * Evaluates a single trigger against the behavioral state.
   */
  private evaluateTrigger(
    trigger: TriggerConfig,
    state: BehavioralState,
  ): InterventionResult | null {
    switch (trigger.type) {
      case "paste":
        return this.evaluatePasteTrigger(trigger, state);
      case "blur":
        return this.evaluateBlurTrigger(trigger, state);
      case "idle":
        return this.evaluateIdleTrigger(trigger, state);
      case "timing":
        return this.evaluateTimingTrigger(trigger, state);
      case "composite":
        return this.evaluateCompositeTrigger(trigger, state);
      default:
        return null;
    }
  }

  /**
   * Evaluates a paste-based trigger.
   */
  private evaluatePasteTrigger(
    trigger: TriggerConfig,
    state: BehavioralState,
  ): InterventionResult | null {
    const threshold = trigger.threshold.paste;
    if (threshold === undefined || state.pasteEvents === undefined) {
      return null;
    }

    for (const event of state.pasteEvents) {
      if (
        event.textLength >= threshold.minLength &&
        event.precedingKeystrokes <= threshold.maxPrecedingKeystrokes
      ) {
        return this.createResult(
          trigger,
          `Large paste detected (${event.textLength} characters) with minimal preceding keystrokes (${event.precedingKeystrokes})`,
        );
      }
    }

    return null;
  }

  /**
   * Evaluates a blur-based trigger.
   */
  private evaluateBlurTrigger(
    trigger: TriggerConfig,
    state: BehavioralState,
  ): InterventionResult | null {
    const threshold = trigger.threshold.blur;
    if (threshold === undefined) {
      return null;
    }

    const blurCount = state.blurCount ?? 0;
    const totalBlurDuration = state.totalBlurDuration ?? 0;

    if (blurCount >= threshold.countThreshold || totalBlurDuration >= threshold.durationThreshold) {
      const reasons: string[] = [];
      if (blurCount >= threshold.countThreshold) {
        reasons.push(`blur count (${blurCount}) exceeded threshold (${threshold.countThreshold})`);
      }
      if (totalBlurDuration >= threshold.durationThreshold) {
        reasons.push(
          `blur duration (${totalBlurDuration}ms) exceeded threshold (${threshold.durationThreshold}ms)`,
        );
      }
      return this.createResult(trigger, `Focus loss detected: ${reasons.join("; ")}`);
    }

    return null;
  }

  /**
   * Evaluates an idle-based trigger.
   */
  private evaluateIdleTrigger(
    trigger: TriggerConfig,
    state: BehavioralState,
  ): InterventionResult | null {
    const threshold = trigger.threshold.idle;
    if (threshold === undefined || state.idleDuration === undefined) {
      return null;
    }

    if (state.idleDuration >= threshold.durationMs) {
      return this.createResult(
        trigger,
        `Idle period detected (${state.idleDuration}ms) exceeded threshold (${threshold.durationMs}ms)`,
      );
    }

    return null;
  }

  /**
   * Evaluates a timing-based trigger.
   */
  private evaluateTimingTrigger(
    trigger: TriggerConfig,
    state: BehavioralState,
  ): InterventionResult | null {
    const threshold = trigger.threshold.timing;
    if (threshold === undefined || state.charactersPerSecond === undefined) {
      return null;
    }

    if (state.charactersPerSecond > threshold.maxCharactersPerSecond) {
      return this.createResult(
        trigger,
        `Typing speed (${state.charactersPerSecond.toFixed(1)} chars/sec) exceeded threshold (${threshold.maxCharactersPerSecond} chars/sec)`,
      );
    }

    return null;
  }

  /**
   * Evaluates a composite trigger (combination of multiple factors).
   */
  private evaluateCompositeTrigger(
    trigger: TriggerConfig,
    state: BehavioralState,
  ): InterventionResult | null {
    const triggeredConditions: string[] = [];

    // Check paste condition
    if (trigger.threshold.paste !== undefined && state.pasteEvents !== undefined) {
      const threshold = trigger.threshold.paste;
      for (const event of state.pasteEvents) {
        if (
          event.textLength >= threshold.minLength &&
          event.precedingKeystrokes <= threshold.maxPrecedingKeystrokes
        ) {
          triggeredConditions.push("suspicious paste");
          break;
        }
      }
    }

    // Check blur condition
    if (trigger.threshold.blur !== undefined) {
      const threshold = trigger.threshold.blur;
      const blurCount = state.blurCount ?? 0;
      const totalBlurDuration = state.totalBlurDuration ?? 0;
      if (
        blurCount >= threshold.countThreshold ||
        totalBlurDuration >= threshold.durationThreshold
      ) {
        triggeredConditions.push("excessive focus loss");
      }
    }

    // Check idle condition
    if (trigger.threshold.idle !== undefined && state.idleDuration !== undefined) {
      if (state.idleDuration >= trigger.threshold.idle.durationMs) {
        triggeredConditions.push("extended idle period");
      }
    }

    // Check timing condition
    if (trigger.threshold.timing !== undefined && state.charactersPerSecond !== undefined) {
      if (state.charactersPerSecond > trigger.threshold.timing.maxCharactersPerSecond) {
        triggeredConditions.push("abnormal typing speed");
      }
    }

    // Composite trigger fires if multiple conditions are met
    if (triggeredConditions.length >= 2) {
      return this.createResult(
        trigger,
        `Multiple behavioral anomalies detected: ${triggeredConditions.join(", ")}`,
      );
    }

    return null;
  }

  /**
   * Creates an InterventionResult from a trigger.
   */
  private createResult(trigger: TriggerConfig, reason: string): InterventionResult {
    return {
      type: trigger.intervention,
      triggered: true,
      reason,
      triggerConfig: trigger,
      timestamp: performance.now(),
    };
  }

  /**
   * Applies escalation to an intervention result based on trigger count.
   */
  private applyEscalation(result: InterventionResult, trigger: TriggerConfig): InterventionResult {
    const count = this.triggerCounts.get(trigger) ?? 0;
    const currentIndex = INTERVENTION_LEVELS.indexOf(result.type);

    if (currentIndex === -1) {
      return result;
    }

    // Escalate based on how many times this trigger has fired
    const escalationSteps = Math.floor(count / 2); // Escalate every 2 triggers
    const newIndex = Math.min(currentIndex + escalationSteps, INTERVENTION_LEVELS.length - 1);

    if (newIndex === currentIndex) {
      return result;
    }

    const escalatedType = INTERVENTION_LEVELS[newIndex];
    if (escalatedType === undefined) {
      return result;
    }

    return {
      ...result,
      type: escalatedType,
      reason: `${result.reason} (escalated from ${result.type} due to repeated triggers)`,
    };
  }

  /**
   * Fires callbacks for an intervention result.
   */
  private fireCallbacks(result: InterventionResult): void {
    const callbacks = this.callbacks.get(result.type);
    if (callbacks !== undefined) {
      for (const callback of callbacks) {
        callback(result);
      }
    }
  }
}

/**
 * Creates a new InterventionManager instance.
 *
 * @param config - Configuration with triggers and escalation settings
 * @returns New InterventionManager instance
 *
 * @example
 * ```typescript
 * const manager = createInterventionManager({
 *   triggers: [
 *     {
 *       type: "paste",
 *       threshold: { paste: { minLength: 100, maxPrecedingKeystrokes: 5 } },
 *       intervention: "warning",
 *     },
 *   ],
 * });
 * ```
 */
export function createInterventionManager(config: InterventionManagerConfig): InterventionManager {
  return new InterventionManager(config);
}
