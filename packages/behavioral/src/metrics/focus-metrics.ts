import type { FocusEvent, FocusMetrics } from "@slopit/core";

/**
 * Compute metrics from focus events.
 *
 * @param focusEvents - Array of focus events
 * @returns Computed focus metrics
 */
export function computeFocusMetrics(focusEvents: FocusEvent[]): FocusMetrics {
  let blurCount = 0;
  let totalBlurDuration = 0;
  let hiddenCount = 0;
  let totalHiddenDuration = 0;
  let lastHiddenTime: number | undefined;

  for (const event of focusEvents) {
    switch (event.event) {
      case "blur":
        blurCount++;
        if (event.blurDuration !== undefined) {
          totalBlurDuration += event.blurDuration;
        }
        break;

      case "visibilitychange":
        if (event.visibility === "hidden") {
          hiddenCount++;
          lastHiddenTime = event.time;
        } else if (event.visibility === "visible" && lastHiddenTime !== undefined) {
          totalHiddenDuration += event.time - lastHiddenTime;
          lastHiddenTime = undefined;
        }
        break;
    }
  }

  return {
    blurCount,
    totalBlurDuration,
    hiddenCount,
    totalHiddenDuration,
  };
}
