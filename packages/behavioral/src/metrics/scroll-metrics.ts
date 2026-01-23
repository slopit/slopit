import type { ScrollEvent, ScrollMetrics } from "@slopit/core";

/**
 * Compute metrics from scroll events.
 *
 * @param events - Array of scroll events
 * @param directionChanges - Number of direction changes from collector
 * @returns Computed scroll metrics
 */
export function computeScrollMetrics(
  events: ScrollEvent[],
  directionChanges: number,
): ScrollMetrics {
  if (events.length === 0) {
    return {
      totalScrollEvents: 0,
      totalScrollDistance: 0,
      directionChanges: 0,
      meanScrollVelocity: 0,
      upDownRatio: 0,
    };
  }

  // Compute total scroll distance
  const totalScrollDistance = events.reduce((sum, e) => sum + Math.abs(e.deltaY), 0);

  // Compute velocity statistics
  const eventsWithVelocity = events.filter((e) => e.velocity !== undefined);
  const velocities = eventsWithVelocity.map((e) => e.velocity ?? 0);
  const meanScrollVelocity =
    velocities.length > 0 ? velocities.reduce((a, b) => a + b, 0) / velocities.length : 0;

  // Compute up/down ratio
  const upCount = events.filter((e) => e.direction === "up").length;
  const downCount = events.filter((e) => e.direction === "down").length;
  const upDownRatio = downCount > 0 ? upCount / downCount : upCount > 0 ? 1 : 0;

  return {
    totalScrollEvents: events.length,
    totalScrollDistance,
    directionChanges,
    meanScrollVelocity,
    upDownRatio,
  };
}
