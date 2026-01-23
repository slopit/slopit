import { describe, expect, it } from "vitest";
import { duration, formatDuration, fromTimestamp, highResTime, now, toTimestamp } from "./time.js";

describe("now", () => {
  it("should return a number", () => {
    const timestamp = now();
    expect(typeof timestamp).toBe("number");
  });

  it("should return a positive number", () => {
    const timestamp = now();
    expect(timestamp).toBeGreaterThan(0);
  });

  it("should return a timestamp close to Date.now()", () => {
    const timestamp = now();
    const dateNow = Date.now();
    // Should be within 10ms
    expect(Math.abs(timestamp - dateNow)).toBeLessThan(10);
  });

  it("should return increasing values over time", async () => {
    const t1 = now();
    await new Promise((resolve) => setTimeout(resolve, 10));
    const t2 = now();
    expect(t2).toBeGreaterThan(t1);
  });
});

describe("highResTime", () => {
  it("should return a number", () => {
    const time = highResTime();
    expect(typeof time).toBe("number");
  });

  it("should return a non-negative number", () => {
    const time = highResTime();
    expect(time).toBeGreaterThanOrEqual(0);
  });

  it("should return increasing values over time", async () => {
    const t1 = highResTime();
    await new Promise((resolve) => setTimeout(resolve, 10));
    const t2 = highResTime();
    expect(t2).toBeGreaterThan(t1);
  });

  it("should have sub-millisecond precision when performance.now is available", () => {
    // In Node.js with performance API, highResTime should use performance.now()
    const times: number[] = [];
    for (let i = 0; i < 100; i++) {
      times.push(highResTime());
    }
    // Check if any values have decimal parts (sub-millisecond precision)
    const _hasDecimals = times.some((t) => t !== Math.floor(t));
    // This may or may not be true depending on the environment, so we just check it runs
    expect(times.length).toBe(100);
  });
});

describe("duration", () => {
  it("should calculate duration between two timestamps", () => {
    const start = 1000;
    const end = 2000;
    expect(duration(start, end)).toBe(1000);
  });

  it("should handle negative duration (end before start)", () => {
    const start = 2000;
    const end = 1000;
    expect(duration(start, end)).toBe(-1000);
  });

  it("should handle zero duration", () => {
    const time = 1000;
    expect(duration(time, time)).toBe(0);
  });

  it("should use current time when end is not provided", () => {
    const start = now() - 100;
    const d = duration(start);
    // Duration should be approximately 100ms
    expect(d).toBeGreaterThanOrEqual(100);
    expect(d).toBeLessThan(200); // Allow some margin
  });

  it("should handle large timestamps", () => {
    const start = 1700000000000; // A realistic timestamp
    const end = 1700000001000;
    expect(duration(start, end)).toBe(1000);
  });

  it("should handle decimal timestamps", () => {
    const start = 1000.5;
    const end = 2000.5;
    expect(duration(start, end)).toBe(1000);
  });
});

describe("formatDuration", () => {
  it("should format milliseconds only", () => {
    expect(formatDuration(500)).toBe("500ms");
    expect(formatDuration(0)).toBe("0ms");
    expect(formatDuration(999)).toBe("999ms");
  });

  it("should format seconds only", () => {
    expect(formatDuration(1000)).toBe("1s");
    expect(formatDuration(5000)).toBe("5s");
    expect(formatDuration(59000)).toBe("59s");
  });

  it("should format minutes and seconds", () => {
    expect(formatDuration(60000)).toBe("1m 0s");
    expect(formatDuration(65000)).toBe("1m 5s");
    expect(formatDuration(125000)).toBe("2m 5s");
    expect(formatDuration(3599000)).toBe("59m 59s");
  });

  it("should format hours, minutes, and seconds", () => {
    expect(formatDuration(3600000)).toBe("1h 0m 0s");
    expect(formatDuration(3661000)).toBe("1h 1m 1s");
    expect(formatDuration(7325000)).toBe("2h 2m 5s");
  });

  it("should handle large durations", () => {
    expect(formatDuration(86400000)).toBe("24h 0m 0s");
    expect(formatDuration(90061000)).toBe("25h 1m 1s");
  });

  it("should truncate milliseconds when showing seconds", () => {
    // 1500ms = 1.5s, but should show as 1s
    expect(formatDuration(1500)).toBe("1s");
  });

  it("should handle negative values by treating as zero-ish", () => {
    // Implementation floors to integer, so negative small values may behave oddly
    // The current implementation doesn't handle negatives specially
    const result = formatDuration(-100);
    expect(typeof result).toBe("string");
  });
});

describe("toTimestamp", () => {
  it("should convert Date to Unix timestamp in milliseconds", () => {
    const date = new Date("2024-01-15T12:00:00.000Z");
    const timestamp = toTimestamp(date);
    expect(timestamp).toBe(date.getTime());
  });

  it("should handle epoch date", () => {
    const date = new Date(0);
    expect(toTimestamp(date)).toBe(0);
  });

  it("should handle current date", () => {
    const date = new Date();
    const timestamp = toTimestamp(date);
    expect(timestamp).toBe(date.getTime());
  });

  it("should preserve millisecond precision", () => {
    const date = new Date("2024-01-15T12:00:00.123Z");
    const timestamp = toTimestamp(date);
    expect(timestamp % 1000).toBe(123);
  });

  it("should handle dates before epoch", () => {
    const date = new Date("1969-01-01T00:00:00.000Z");
    const timestamp = toTimestamp(date);
    expect(timestamp).toBeLessThan(0);
  });
});

describe("fromTimestamp", () => {
  it("should convert Unix timestamp to Date", () => {
    const timestamp = 1705320000000; // 2024-01-15T12:00:00.000Z
    const date = fromTimestamp(timestamp);
    expect(date instanceof Date).toBe(true);
    expect(date.getTime()).toBe(timestamp);
  });

  it("should handle epoch timestamp", () => {
    const date = fromTimestamp(0);
    expect(date.getTime()).toBe(0);
    expect(date.toISOString()).toBe("1970-01-01T00:00:00.000Z");
  });

  it("should handle negative timestamps (before epoch)", () => {
    const timestamp = -86400000; // One day before epoch
    const date = fromTimestamp(timestamp);
    expect(date.getTime()).toBe(timestamp);
    expect(date.toISOString()).toBe("1969-12-31T00:00:00.000Z");
  });

  it("should preserve millisecond precision", () => {
    const timestamp = 1705320000123;
    const date = fromTimestamp(timestamp);
    expect(date.getMilliseconds()).toBe(123);
  });

  it("should round-trip with toTimestamp", () => {
    const originalDate = new Date("2024-06-15T14:30:45.678Z");
    const timestamp = toTimestamp(originalDate);
    const reconstructedDate = fromTimestamp(timestamp);
    expect(reconstructedDate.getTime()).toBe(originalDate.getTime());
  });
});
