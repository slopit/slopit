import type { KeystrokeEvent, KeystrokeMetrics } from "@slopit/core";

/**
 * Default pause threshold in milliseconds.
 */
const DEFAULT_PAUSE_THRESHOLD = 2000;

/**
 * Compute metrics from keystroke events.
 *
 * @param keystrokes - Array of keystroke events
 * @param pauseThreshold - Minimum IKI to count as a pause (default: 2000ms)
 * @returns Computed keystroke metrics
 */
export function computeKeystrokeMetrics(
  keystrokes: KeystrokeEvent[],
  pauseThreshold = DEFAULT_PAUSE_THRESHOLD,
): KeystrokeMetrics {
  // Filter to keydown events only
  const keydowns = keystrokes.filter((k) => k.event === "keydown");

  if (keydowns.length === 0) {
    return {
      totalKeystrokes: 0,
      printableKeystrokes: 0,
      deletions: 0,
      meanIKI: 0,
      stdIKI: 0,
      medianIKI: 0,
      pauseCount: 0,
      productProcessRatio: 0,
    };
  }

  // Count keystroke types
  const printableKeystrokes = keydowns.filter((k) => k.key.length === 1).length;
  const deletions = keydowns.filter((k) => k.key === "Backspace" || k.key === "Delete").length;

  // Compute inter-keystroke intervals
  const ikis = computeIKIs(keydowns);

  // Compute IKI statistics
  const { mean, std, median } = computeIKIStats(ikis);

  // Count pauses
  const pauseCount = ikis.filter((iki) => iki > pauseThreshold).length;

  // Compute product-process ratio
  const lastEvent = keydowns[keydowns.length - 1];
  const finalLength = lastEvent?.textLength ?? 0;
  const productProcessRatio = keydowns.length > 0 ? finalLength / keydowns.length : 0;

  return {
    totalKeystrokes: keydowns.length,
    printableKeystrokes,
    deletions,
    meanIKI: mean,
    stdIKI: std,
    medianIKI: median,
    pauseCount,
    productProcessRatio,
  };
}

/**
 * Compute inter-keystroke intervals from keydown events.
 */
function computeIKIs(keydowns: KeystrokeEvent[]): number[] {
  if (keydowns.length < 2) {
    return [];
  }

  const ikis: number[] = [];
  for (let i = 1; i < keydowns.length; i++) {
    const prev = keydowns[i - 1];
    const curr = keydowns[i];
    if (prev && curr) {
      ikis.push(curr.time - prev.time);
    }
  }

  return ikis;
}

/**
 * Compute mean, standard deviation, and median of IKIs.
 */
function computeIKIStats(ikis: number[]): { mean: number; std: number; median: number } {
  if (ikis.length === 0) {
    return { mean: 0, std: 0, median: 0 };
  }

  // Mean
  const sum = ikis.reduce((a, b) => a + b, 0);
  const mean = sum / ikis.length;

  // Standard deviation
  const squaredDiffs = ikis.map((iki) => (iki - mean) ** 2);
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / ikis.length;
  const std = Math.sqrt(variance);

  // Median
  const sorted = [...ikis].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0
      ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
      : (sorted[mid] ?? 0);

  return { mean, std, median };
}
