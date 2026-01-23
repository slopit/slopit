import type { MouseEvent, MouseMetrics } from "@slopit/core";
import type { IdlePeriod } from "../collectors/mouse.js";

/**
 * Compute metrics from mouse events and idle periods.
 *
 * @param events - Array of mouse events
 * @param idlePeriods - Array of detected idle periods
 * @returns Computed mouse metrics
 */
export function computeMouseMetrics(events: MouseEvent[], idlePeriods: IdlePeriod[]): MouseMetrics {
  if (events.length === 0) {
    return {
      totalEvents: 0,
      clickCount: 0,
      meanVelocity: 0,
      totalDistance: 0,
      totalIdleTime: 0,
      idlePeriodCount: 0,
    };
  }

  const clickCount = events.filter((e) => e.event === "click").length;

  // Compute velocity statistics from mousemove events
  const moveEvents = events.filter((e) => e.event === "mousemove" && e.velocity !== undefined);
  const velocities = moveEvents.map((e) => e.velocity ?? 0);
  const meanVelocity =
    velocities.length > 0 ? velocities.reduce((a, b) => a + b, 0) / velocities.length : 0;

  // Compute total distance
  const totalDistance = events
    .filter((e) => e.event === "mousemove" && e.distance !== undefined)
    .reduce((sum, e) => sum + (e.distance ?? 0), 0);

  // Compute idle time statistics
  const totalIdleTime = idlePeriods.reduce((sum, p) => sum + p.duration, 0);

  return {
    totalEvents: events.length,
    clickCount,
    meanVelocity,
    totalDistance,
    totalIdleTime,
    idlePeriodCount: idlePeriods.length,
  };
}
