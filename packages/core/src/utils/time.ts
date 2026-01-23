/**
 * Get current Unix timestamp in milliseconds.
 *
 * @returns Current timestamp
 */
export function now(): number {
  return Date.now();
}

/**
 * Get high-resolution timestamp for performance measurement.
 *
 * Uses performance.now() when available, falls back to Date.now().
 *
 * @returns High-resolution timestamp in milliseconds
 */
export function highResTime(): number {
  if (typeof performance !== "undefined" && performance.now) {
    return performance.now();
  }
  return Date.now();
}

/**
 * Calculate duration between two timestamps.
 *
 * @param start - Start timestamp
 * @param end - End timestamp (defaults to now)
 * @returns Duration in milliseconds
 */
export function duration(start: number, end?: number): number {
  return (end ?? now()) - start;
}

/**
 * Format a duration in human-readable format.
 *
 * @param ms - Duration in milliseconds
 * @returns Formatted duration string
 *
 * @example
 * ```typescript
 * formatDuration(65000); // "1m 5s"
 * formatDuration(3661000); // "1h 1m 1s"
 * ```
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  if (seconds > 0) {
    return `${seconds}s`;
  }
  return `${ms}ms`;
}

/**
 * Convert a Date to Unix timestamp in milliseconds.
 *
 * @param date - Date object
 * @returns Unix timestamp in milliseconds
 */
export function toTimestamp(date: Date): number {
  return date.getTime();
}

/**
 * Convert Unix timestamp to Date object.
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Date object
 */
export function fromTimestamp(timestamp: number): Date {
  return new Date(timestamp);
}
