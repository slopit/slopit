import type { FocusEvent } from "@slopit/core";
import { describe, expect, it } from "vitest";
import { computeFocusMetrics } from "./focus-metrics.js";

describe("computeFocusMetrics", () => {
  describe("empty input", () => {
    it("should return zeros for empty array", () => {
      const metrics = computeFocusMetrics([]);

      expect(metrics.blurCount).toBe(0);
      expect(metrics.totalBlurDuration).toBe(0);
      expect(metrics.hiddenCount).toBe(0);
      expect(metrics.totalHiddenDuration).toBe(0);
    });
  });

  describe("blur events", () => {
    it("should count blur events", () => {
      const events: FocusEvent[] = [
        { time: 1000, event: "blur" },
        { time: 2000, event: "focus" },
        { time: 3000, event: "blur" },
        { time: 4000, event: "focus" },
      ];

      const metrics = computeFocusMetrics(events);
      expect(metrics.blurCount).toBe(2);
    });

    it("should sum blur durations", () => {
      const events: FocusEvent[] = [
        { time: 1000, event: "blur", blurDuration: 500 },
        { time: 2000, event: "focus" },
        { time: 3000, event: "blur", blurDuration: 1000 },
        { time: 4500, event: "focus" },
      ];

      const metrics = computeFocusMetrics(events);
      expect(metrics.totalBlurDuration).toBe(1500);
    });

    it("should handle blur events without duration", () => {
      const events: FocusEvent[] = [
        { time: 1000, event: "blur" },
        { time: 2000, event: "focus" },
      ];

      const metrics = computeFocusMetrics(events);
      expect(metrics.blurCount).toBe(1);
      expect(metrics.totalBlurDuration).toBe(0);
    });

    it("should ignore focus events for blur count", () => {
      const events: FocusEvent[] = [
        { time: 1000, event: "focus" },
        { time: 2000, event: "focus" },
        { time: 3000, event: "focus" },
      ];

      const metrics = computeFocusMetrics(events);
      expect(metrics.blurCount).toBe(0);
    });
  });

  describe("visibility events", () => {
    it("should count hidden events", () => {
      const events: FocusEvent[] = [
        { time: 1000, event: "visibilitychange", visibility: "hidden" },
        { time: 2000, event: "visibilitychange", visibility: "visible" },
        { time: 3000, event: "visibilitychange", visibility: "hidden" },
        { time: 4000, event: "visibilitychange", visibility: "visible" },
      ];

      const metrics = computeFocusMetrics(events);
      expect(metrics.hiddenCount).toBe(2);
    });

    it("should calculate hidden duration", () => {
      const events: FocusEvent[] = [
        { time: 1000, event: "visibilitychange", visibility: "hidden" },
        { time: 1500, event: "visibilitychange", visibility: "visible" }, // 500ms hidden
        { time: 2000, event: "visibilitychange", visibility: "hidden" },
        { time: 3000, event: "visibilitychange", visibility: "visible" }, // 1000ms hidden
      ];

      const metrics = computeFocusMetrics(events);
      expect(metrics.totalHiddenDuration).toBe(1500);
    });

    it("should handle visible events without preceding hidden", () => {
      const events: FocusEvent[] = [
        { time: 1000, event: "visibilitychange", visibility: "visible" },
        { time: 2000, event: "visibilitychange", visibility: "visible" },
      ];

      const metrics = computeFocusMetrics(events);
      expect(metrics.hiddenCount).toBe(0);
      expect(metrics.totalHiddenDuration).toBe(0);
    });

    it("should handle hidden without subsequent visible", () => {
      const events: FocusEvent[] = [
        { time: 1000, event: "visibilitychange", visibility: "hidden" },
        // No visible event follows
      ];

      const metrics = computeFocusMetrics(events);
      expect(metrics.hiddenCount).toBe(1);
      expect(metrics.totalHiddenDuration).toBe(0); // Cannot compute duration
    });

    it("should handle consecutive hidden events", () => {
      const events: FocusEvent[] = [
        { time: 1000, event: "visibilitychange", visibility: "hidden" },
        { time: 2000, event: "visibilitychange", visibility: "hidden" },
        { time: 3000, event: "visibilitychange", visibility: "visible" },
      ];

      const metrics = computeFocusMetrics(events);
      expect(metrics.hiddenCount).toBe(2);
      // Duration calculated from last hidden (2000) to visible (3000)
      expect(metrics.totalHiddenDuration).toBe(1000);
    });
  });

  describe("mixed events", () => {
    it("should count blur and hidden separately", () => {
      const events: FocusEvent[] = [
        { time: 1000, event: "blur", blurDuration: 200 },
        { time: 1500, event: "focus" },
        { time: 2000, event: "visibilitychange", visibility: "hidden" },
        { time: 2500, event: "visibilitychange", visibility: "visible" },
        { time: 3000, event: "blur", blurDuration: 300 },
        { time: 3500, event: "focus" },
      ];

      const metrics = computeFocusMetrics(events);
      expect(metrics.blurCount).toBe(2);
      expect(metrics.totalBlurDuration).toBe(500);
      expect(metrics.hiddenCount).toBe(1);
      expect(metrics.totalHiddenDuration).toBe(500);
    });

    it("should handle interleaved blur and visibility events", () => {
      const events: FocusEvent[] = [
        { time: 1000, event: "blur", blurDuration: 100 },
        { time: 1050, event: "visibilitychange", visibility: "hidden" },
        { time: 1100, event: "focus" },
        { time: 1150, event: "visibilitychange", visibility: "visible" },
      ];

      const metrics = computeFocusMetrics(events);
      expect(metrics.blurCount).toBe(1);
      expect(metrics.totalBlurDuration).toBe(100);
      expect(metrics.hiddenCount).toBe(1);
      expect(metrics.totalHiddenDuration).toBe(100);
    });
  });

  describe("edge cases", () => {
    it("should handle events with same timestamp", () => {
      const events: FocusEvent[] = [
        { time: 1000, event: "blur", blurDuration: 0 },
        { time: 1000, event: "focus" },
      ];

      const metrics = computeFocusMetrics(events);
      expect(metrics.blurCount).toBe(1);
      expect(metrics.totalBlurDuration).toBe(0);
    });

    it("should handle very long durations", () => {
      const events: FocusEvent[] = [
        { time: 0, event: "blur", blurDuration: 3600000 }, // 1 hour
      ];

      const metrics = computeFocusMetrics(events);
      expect(metrics.blurCount).toBe(1);
      expect(metrics.totalBlurDuration).toBe(3600000);
    });

    it("should handle many events", () => {
      const events: FocusEvent[] = [];
      for (let i = 0; i < 100; i++) {
        events.push({ time: i * 100, event: "blur", blurDuration: 50 });
        events.push({ time: i * 100 + 50, event: "focus" });
      }

      const metrics = computeFocusMetrics(events);
      expect(metrics.blurCount).toBe(100);
      expect(metrics.totalBlurDuration).toBe(5000);
    });

    it("should only process valid event types", () => {
      const events: FocusEvent[] = [
        { time: 1000, event: "blur" },
        { time: 1500, event: "focus" },
        { time: 2000, event: "visibilitychange", visibility: "hidden" },
        { time: 2500, event: "visibilitychange", visibility: "visible" },
      ];

      const metrics = computeFocusMetrics(events);
      // All events should be processed
      expect(metrics.blurCount + metrics.hiddenCount).toBe(2);
    });
  });
});
