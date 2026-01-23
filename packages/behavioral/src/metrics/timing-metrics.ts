import type { KeystrokeEvent, TimingMetrics } from "@slopit/core";

/**
 * Compute timing metrics from keystroke events.
 *
 * @param keystrokes - Array of keystroke events
 * @param trialStartTime - Trial start time (for first keystroke latency)
 * @param totalResponseTime - Total response time in milliseconds
 * @returns Computed timing metrics
 */
export function computeTimingMetrics(
  keystrokes: KeystrokeEvent[],
  totalResponseTime: number,
): TimingMetrics {
  const keydowns = keystrokes.filter((k) => k.event === "keydown");

  // First keystroke latency
  const firstKeystroke = keydowns[0];
  const firstKeystrokeLatency = firstKeystroke?.time;

  // Characters per minute (excluding deletions)
  const printableCount = keydowns.filter((k) => k.key.length === 1).length;
  const deletionCount = keydowns.filter((k) => k.key === "Backspace" || k.key === "Delete").length;
  const netCharacters = Math.max(0, printableCount - deletionCount);

  const minutes = totalResponseTime / 60000;
  const charactersPerMinute = minutes > 0 ? netCharacters / minutes : null;

  return {
    ...(firstKeystrokeLatency !== undefined ? { firstKeystrokeLatency } : {}),
    totalResponseTime,
    ...(charactersPerMinute !== null ? { charactersPerMinute } : {}),
  };
}
