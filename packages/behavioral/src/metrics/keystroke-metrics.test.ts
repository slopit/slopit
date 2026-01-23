import type { KeystrokeEvent } from "@slopit/core";
import { describe, expect, it } from "vitest";
import { computeKeystrokeMetrics } from "./keystroke-metrics.js";

describe("computeKeystrokeMetrics", () => {
  const createKeystrokeEvent = (
    time: number,
    key: string,
    code: string,
    eventType: "keydown" | "keyup" = "keydown",
    textLength?: number,
  ): KeystrokeEvent => ({
    time,
    key,
    code,
    event: eventType,
    ...(textLength !== undefined ? { textLength } : {}),
  });

  describe("empty input", () => {
    it("should return zeros for empty array", () => {
      const metrics = computeKeystrokeMetrics([]);

      expect(metrics.totalKeystrokes).toBe(0);
      expect(metrics.printableKeystrokes).toBe(0);
      expect(metrics.deletions).toBe(0);
      expect(metrics.meanIKI).toBe(0);
      expect(metrics.stdIKI).toBe(0);
      expect(metrics.medianIKI).toBe(0);
      expect(metrics.pauseCount).toBe(0);
      expect(metrics.productProcessRatio).toBe(0);
    });

    it("should return zeros for array with only keyup events", () => {
      const events = [
        createKeystrokeEvent(100, "a", "KeyA", "keyup"),
        createKeystrokeEvent(200, "b", "KeyB", "keyup"),
      ];

      const metrics = computeKeystrokeMetrics(events);
      expect(metrics.totalKeystrokes).toBe(0);
    });
  });

  describe("keystroke counting", () => {
    it("should count total keydown events", () => {
      const events = [
        createKeystrokeEvent(100, "a", "KeyA", "keydown"),
        createKeystrokeEvent(150, "a", "KeyA", "keyup"),
        createKeystrokeEvent(200, "b", "KeyB", "keydown"),
        createKeystrokeEvent(250, "b", "KeyB", "keyup"),
        createKeystrokeEvent(300, "c", "KeyC", "keydown"),
      ];

      const metrics = computeKeystrokeMetrics(events);
      expect(metrics.totalKeystrokes).toBe(3);
    });

    it("should count printable keystrokes (single character keys)", () => {
      const events = [
        createKeystrokeEvent(100, "a", "KeyA"),
        createKeystrokeEvent(200, "Enter", "Enter"),
        createKeystrokeEvent(300, "B", "KeyB"),
        createKeystrokeEvent(400, " ", "Space"),
        createKeystrokeEvent(500, "Shift", "ShiftLeft"),
      ];

      const metrics = computeKeystrokeMetrics(events);
      expect(metrics.printableKeystrokes).toBe(3); // a, B, space
    });

    it("should count deletions (Backspace and Delete)", () => {
      const events = [
        createKeystrokeEvent(100, "a", "KeyA"),
        createKeystrokeEvent(200, "Backspace", "Backspace"),
        createKeystrokeEvent(300, "b", "KeyB"),
        createKeystrokeEvent(400, "Delete", "Delete"),
        createKeystrokeEvent(500, "Backspace", "Backspace"),
      ];

      const metrics = computeKeystrokeMetrics(events);
      expect(metrics.deletions).toBe(3);
    });
  });

  describe("inter-keystroke interval (IKI)", () => {
    it("should compute correct mean IKI", () => {
      const events = [
        createKeystrokeEvent(0, "a", "KeyA"),
        createKeystrokeEvent(100, "b", "KeyB"),
        createKeystrokeEvent(200, "c", "KeyC"),
        createKeystrokeEvent(300, "d", "KeyD"),
      ];

      const metrics = computeKeystrokeMetrics(events);
      // IKIs: 100, 100, 100; mean = 100
      expect(metrics.meanIKI).toBe(100);
    });

    it("should compute correct mean IKI with varying intervals", () => {
      const events = [
        createKeystrokeEvent(0, "a", "KeyA"),
        createKeystrokeEvent(100, "b", "KeyB"),
        createKeystrokeEvent(300, "c", "KeyC"),
        createKeystrokeEvent(400, "d", "KeyD"),
      ];

      const metrics = computeKeystrokeMetrics(events);
      // IKIs: 100, 200, 100; mean = 400/3 = 133.33...
      expect(metrics.meanIKI).toBeCloseTo(133.33, 1);
    });

    it("should compute correct standard deviation", () => {
      const events = [
        createKeystrokeEvent(0, "a", "KeyA"),
        createKeystrokeEvent(100, "b", "KeyB"),
        createKeystrokeEvent(200, "c", "KeyC"),
        createKeystrokeEvent(300, "d", "KeyD"),
      ];

      const metrics = computeKeystrokeMetrics(events);
      // All IKIs are 100, so std = 0
      expect(metrics.stdIKI).toBe(0);
    });

    it("should compute non-zero standard deviation for varying intervals", () => {
      const events = [
        createKeystrokeEvent(0, "a", "KeyA"),
        createKeystrokeEvent(50, "b", "KeyB"),
        createKeystrokeEvent(200, "c", "KeyC"),
      ];

      const metrics = computeKeystrokeMetrics(events);
      // IKIs: 50, 150; mean = 100; variance = ((50-100)^2 + (150-100)^2)/2 = 2500
      // std = sqrt(2500) = 50
      expect(metrics.stdIKI).toBe(50);
    });

    it("should compute correct median IKI for odd number of intervals", () => {
      const events = [
        createKeystrokeEvent(0, "a", "KeyA"),
        createKeystrokeEvent(100, "b", "KeyB"),
        createKeystrokeEvent(150, "c", "KeyC"),
        createKeystrokeEvent(400, "d", "KeyD"),
      ];

      const metrics = computeKeystrokeMetrics(events);
      // IKIs: 100, 50, 250; sorted: 50, 100, 250; median = 100
      expect(metrics.medianIKI).toBe(100);
    });

    it("should compute correct median IKI for even number of intervals", () => {
      const events = [
        createKeystrokeEvent(0, "a", "KeyA"),
        createKeystrokeEvent(100, "b", "KeyB"),
        createKeystrokeEvent(300, "c", "KeyC"),
        createKeystrokeEvent(400, "d", "KeyD"),
        createKeystrokeEvent(500, "e", "KeyE"),
      ];

      const metrics = computeKeystrokeMetrics(events);
      // IKIs: 100, 200, 100, 100; sorted: 100, 100, 100, 200
      // median = (100 + 100) / 2 = 100
      expect(metrics.medianIKI).toBe(100);
    });

    it("should return zero IKI metrics for single keystroke", () => {
      const events = [createKeystrokeEvent(100, "a", "KeyA")];

      const metrics = computeKeystrokeMetrics(events);
      expect(metrics.meanIKI).toBe(0);
      expect(metrics.stdIKI).toBe(0);
      expect(metrics.medianIKI).toBe(0);
    });
  });

  describe("pause detection", () => {
    it("should count pauses with default threshold (2000ms)", () => {
      const events = [
        createKeystrokeEvent(0, "a", "KeyA"),
        createKeystrokeEvent(100, "b", "KeyB"),
        createKeystrokeEvent(2200, "c", "KeyC"), // 2100ms pause
        createKeystrokeEvent(2300, "d", "KeyD"),
        createKeystrokeEvent(4400, "e", "KeyE"), // 2100ms pause
      ];

      const metrics = computeKeystrokeMetrics(events);
      expect(metrics.pauseCount).toBe(2);
    });

    it("should use custom pause threshold", () => {
      const events = [
        createKeystrokeEvent(0, "a", "KeyA"),
        createKeystrokeEvent(600, "b", "KeyB"), // 600ms
        createKeystrokeEvent(700, "c", "KeyC"), // 100ms
        createKeystrokeEvent(1400, "d", "KeyD"), // 700ms
      ];

      const metrics = computeKeystrokeMetrics(events, 500);
      // Pauses > 500ms: 600ms, 700ms
      expect(metrics.pauseCount).toBe(2);
    });

    it("should count zero pauses when all intervals are short", () => {
      const events = [
        createKeystrokeEvent(0, "a", "KeyA"),
        createKeystrokeEvent(100, "b", "KeyB"),
        createKeystrokeEvent(200, "c", "KeyC"),
      ];

      const metrics = computeKeystrokeMetrics(events);
      expect(metrics.pauseCount).toBe(0);
    });
  });

  describe("product-process ratio", () => {
    it("should compute ratio based on final text length", () => {
      const events = [
        createKeystrokeEvent(0, "a", "KeyA", "keydown", 1),
        createKeystrokeEvent(100, "b", "KeyB", "keydown", 2),
        createKeystrokeEvent(200, "c", "KeyC", "keydown", 3),
        createKeystrokeEvent(300, "d", "KeyD", "keydown", 4),
      ];

      const metrics = computeKeystrokeMetrics(events);
      // finalLength = 4, keystrokes = 4, ratio = 4/4 = 1.0
      expect(metrics.productProcessRatio).toBe(1.0);
    });

    it("should show lower ratio when there are deletions", () => {
      const events = [
        createKeystrokeEvent(0, "a", "KeyA", "keydown", 1),
        createKeystrokeEvent(100, "b", "KeyB", "keydown", 2),
        createKeystrokeEvent(200, "Backspace", "Backspace", "keydown", 1),
        createKeystrokeEvent(300, "c", "KeyC", "keydown", 2),
      ];

      const metrics = computeKeystrokeMetrics(events);
      // finalLength = 2, keystrokes = 4, ratio = 2/4 = 0.5
      expect(metrics.productProcessRatio).toBe(0.5);
    });

    it("should return 0 when no textLength is captured", () => {
      const events = [createKeystrokeEvent(0, "a", "KeyA"), createKeystrokeEvent(100, "b", "KeyB")];

      const metrics = computeKeystrokeMetrics(events);
      expect(metrics.productProcessRatio).toBe(0);
    });
  });

  describe("edge cases", () => {
    it("should handle events with same timestamp", () => {
      const events = [
        createKeystrokeEvent(100, "a", "KeyA"),
        createKeystrokeEvent(100, "b", "KeyB"),
        createKeystrokeEvent(100, "c", "KeyC"),
      ];

      const metrics = computeKeystrokeMetrics(events);
      expect(metrics.meanIKI).toBe(0);
      expect(metrics.totalKeystrokes).toBe(3);
    });

    it("should handle very large timestamps", () => {
      const baseTime = 1700000000000;
      const events = [
        createKeystrokeEvent(baseTime, "a", "KeyA"),
        createKeystrokeEvent(baseTime + 100, "b", "KeyB"),
        createKeystrokeEvent(baseTime + 200, "c", "KeyC"),
      ];

      const metrics = computeKeystrokeMetrics(events);
      expect(metrics.meanIKI).toBe(100);
    });

    it("should handle mixed keyup and keydown events correctly", () => {
      const events = [
        createKeystrokeEvent(0, "a", "KeyA", "keydown"),
        createKeystrokeEvent(50, "a", "KeyA", "keyup"),
        createKeystrokeEvent(100, "b", "KeyB", "keydown"),
        createKeystrokeEvent(150, "b", "KeyB", "keyup"),
      ];

      const metrics = computeKeystrokeMetrics(events);
      // Only keydown events are counted: 2
      // IKI between keydowns: 100ms
      expect(metrics.totalKeystrokes).toBe(2);
      expect(metrics.meanIKI).toBe(100);
    });

    it("should handle special keys", () => {
      const events = [
        createKeystrokeEvent(0, "Control", "ControlLeft"),
        createKeystrokeEvent(100, "c", "KeyC"),
        createKeystrokeEvent(200, "Control", "ControlLeft"),
      ];

      const metrics = computeKeystrokeMetrics(events);
      expect(metrics.totalKeystrokes).toBe(3);
      expect(metrics.printableKeystrokes).toBe(1); // Only 'c'
    });
  });
});
