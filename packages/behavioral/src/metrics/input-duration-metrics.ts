import type { InputDurationEvent, InputDurationMetrics } from "@slopit/core";

/**
 * Compute metrics from input duration events.
 *
 * @param events - Array of input duration events
 * @returns Computed input duration metrics
 */
export function computeInputDurationMetrics(events: InputDurationEvent[]): InputDurationMetrics {
  if (events.length === 0) {
    return {
      totalFocusDuration: 0,
      meanFocusDuration: 0,
      focusSessionCount: 0,
      maxFocusDuration: 0,
    };
  }

  const durations = events.map((e) => e.duration);
  const totalFocusDuration = durations.reduce((a, b) => a + b, 0);
  const meanFocusDuration = totalFocusDuration / events.length;
  const maxFocusDuration = Math.max(...durations);

  return {
    totalFocusDuration,
    meanFocusDuration,
    focusSessionCount: events.length,
    maxFocusDuration,
  };
}
