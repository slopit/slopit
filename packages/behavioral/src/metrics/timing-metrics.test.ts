import type { KeystrokeEvent } from "@slopit/core";
import { describe, expect, it } from "vitest";
import { computeTimingMetrics } from "./timing-metrics.js";

describe("computeTimingMetrics", () => {
  const createKeystrokeEvent = (
    time: number,
    key: string,
    eventType: "keydown" | "keyup" = "keydown",
  ): KeystrokeEvent => ({
    time,
    key,
    code: `Key${key.toUpperCase()}`,
    event: eventType,
  });

  describe("firstKeystrokeLatency", () => {
    it("should capture time of first keydown", () => {
      const keystrokes = [
        createKeystrokeEvent(500, "a"),
        createKeystrokeEvent(600, "b"),
        createKeystrokeEvent(700, "c"),
      ];

      const metrics = computeTimingMetrics(keystrokes, 10000);
      expect(metrics.firstKeystrokeLatency).toBe(500);
    });

    it("should ignore keyup events for first keystroke", () => {
      const keystrokes = [
        createKeystrokeEvent(100, "a", "keyup"),
        createKeystrokeEvent(500, "a", "keydown"),
      ];

      const metrics = computeTimingMetrics(keystrokes, 10000);
      expect(metrics.firstKeystrokeLatency).toBe(500);
    });

    it("should be undefined when no keydown events", () => {
      const keystrokes = [
        createKeystrokeEvent(100, "a", "keyup"),
        createKeystrokeEvent(200, "b", "keyup"),
      ];

      const metrics = computeTimingMetrics(keystrokes, 10000);
      expect(metrics.firstKeystrokeLatency).toBeUndefined();
    });

    it("should be undefined for empty keystrokes", () => {
      const metrics = computeTimingMetrics([], 10000);
      expect(metrics.firstKeystrokeLatency).toBeUndefined();
    });

    it("should handle zero latency", () => {
      const keystrokes = [createKeystrokeEvent(0, "a")];

      const metrics = computeTimingMetrics(keystrokes, 10000);
      expect(metrics.firstKeystrokeLatency).toBe(0);
    });
  });

  describe("totalResponseTime", () => {
    it("should return provided total response time", () => {
      const keystrokes = [createKeystrokeEvent(500, "a")];

      const metrics = computeTimingMetrics(keystrokes, 30000);
      expect(metrics.totalResponseTime).toBe(30000);
    });

    it("should work with empty keystrokes", () => {
      const metrics = computeTimingMetrics([], 15000);
      expect(metrics.totalResponseTime).toBe(15000);
    });

    it("should handle zero response time", () => {
      const metrics = computeTimingMetrics([], 0);
      expect(metrics.totalResponseTime).toBe(0);
    });

    it("should handle very large response time", () => {
      const metrics = computeTimingMetrics([], 3600000); // 1 hour
      expect(metrics.totalResponseTime).toBe(3600000);
    });
  });

  describe("charactersPerMinute", () => {
    it("should calculate correct CPM", () => {
      // 60 printable characters in 60 seconds = 60 CPM
      const keystrokes: KeystrokeEvent[] = [];
      for (let i = 0; i < 60; i++) {
        keystrokes.push(createKeystrokeEvent(i * 1000, "a"));
      }

      const metrics = computeTimingMetrics(keystrokes, 60000);
      expect(metrics.charactersPerMinute).toBe(60);
    });

    it("should exclude deletions from character count", () => {
      const keystrokes = [
        createKeystrokeEvent(100, "a"),
        createKeystrokeEvent(200, "b"),
        createKeystrokeEvent(300, "c"),
        createKeystrokeEvent(400, "Backspace"), // deletion
        createKeystrokeEvent(500, "d"),
      ];

      // 4 printable, 1 deletion = 3 net characters
      // in 60000ms = 1 minute
      const metrics = computeTimingMetrics(keystrokes, 60000);
      expect(metrics.charactersPerMinute).toBe(3);
    });

    it("should handle Delete key as deletion", () => {
      const keystrokes = [
        createKeystrokeEvent(100, "a"),
        createKeystrokeEvent(200, "Delete"),
        createKeystrokeEvent(300, "b"),
      ];

      // 2 printable, 1 deletion = 1 net character
      const metrics = computeTimingMetrics(keystrokes, 60000);
      expect(metrics.charactersPerMinute).toBe(1);
    });

    it("should not go negative when deletions exceed printable", () => {
      const keystrokes = [
        createKeystrokeEvent(100, "a"),
        createKeystrokeEvent(200, "Backspace"),
        createKeystrokeEvent(300, "Backspace"),
        createKeystrokeEvent(400, "Backspace"),
      ];

      // 1 printable, 3 deletions = max(0, -2) = 0 net characters
      const metrics = computeTimingMetrics(keystrokes, 60000);
      expect(metrics.charactersPerMinute).toBe(0);
    });

    it("should be undefined when response time is zero", () => {
      const keystrokes = [createKeystrokeEvent(100, "a")];

      const metrics = computeTimingMetrics(keystrokes, 0);
      expect(metrics.charactersPerMinute).toBeUndefined();
    });

    it("should handle short response times", () => {
      // 10 characters in 10 seconds = 60 CPM
      const keystrokes: KeystrokeEvent[] = [];
      for (let i = 0; i < 10; i++) {
        keystrokes.push(createKeystrokeEvent(i * 1000, "a"));
      }

      const metrics = computeTimingMetrics(keystrokes, 10000);
      expect(metrics.charactersPerMinute).toBe(60);
    });

    it("should only count single-character keys as printable", () => {
      const keystrokes = [
        createKeystrokeEvent(100, "a"), // printable
        createKeystrokeEvent(200, "Enter"), // not printable (multi-char)
        createKeystrokeEvent(300, "Shift"), // not printable
        createKeystrokeEvent(400, " "), // printable (space)
        createKeystrokeEvent(500, "ArrowLeft"), // not printable
      ];

      // 2 printable in 60000ms = 2 CPM
      const metrics = computeTimingMetrics(keystrokes, 60000);
      expect(metrics.charactersPerMinute).toBe(2);
    });

    it("should ignore keyup events", () => {
      const keystrokes = [
        createKeystrokeEvent(100, "a", "keydown"),
        createKeystrokeEvent(150, "a", "keyup"),
        createKeystrokeEvent(200, "b", "keydown"),
        createKeystrokeEvent(250, "b", "keyup"),
      ];

      // 2 keydown printable in 60000ms = 2 CPM
      const metrics = computeTimingMetrics(keystrokes, 60000);
      expect(metrics.charactersPerMinute).toBe(2);
    });
  });

  describe("edge cases", () => {
    it("should handle empty keystrokes array", () => {
      const metrics = computeTimingMetrics([], 30000);

      expect(metrics.firstKeystrokeLatency).toBeUndefined();
      expect(metrics.totalResponseTime).toBe(30000);
      expect(metrics.charactersPerMinute).toBe(0); // 0 characters / positive time
    });

    it("should handle all special keys (no printable)", () => {
      const keystrokes = [
        createKeystrokeEvent(100, "Shift"),
        createKeystrokeEvent(200, "Control"),
        createKeystrokeEvent(300, "Alt"),
        createKeystrokeEvent(400, "Enter"),
      ];

      const metrics = computeTimingMetrics(keystrokes, 60000);
      expect(metrics.charactersPerMinute).toBe(0);
    });

    it("should handle very fast typing", () => {
      // 100 characters in 10 seconds = 600 CPM
      const keystrokes: KeystrokeEvent[] = [];
      for (let i = 0; i < 100; i++) {
        keystrokes.push(createKeystrokeEvent(i * 100, "a"));
      }

      const metrics = computeTimingMetrics(keystrokes, 10000);
      expect(metrics.charactersPerMinute).toBe(600);
    });

    it("should handle decimal response times", () => {
      const keystrokes = [createKeystrokeEvent(100, "a")];

      const metrics = computeTimingMetrics(keystrokes, 30000.5);
      expect(metrics.totalResponseTime).toBe(30000.5);
    });
  });
});
