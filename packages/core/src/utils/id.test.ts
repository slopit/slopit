import { describe, expect, it } from "vitest";
import { generateSessionId, generateTrialId } from "./id.js";

describe("generateSessionId", () => {
  it("should return a string", () => {
    const id = generateSessionId();
    expect(typeof id).toBe("string");
  });

  it("should return a valid UUID v4 format", () => {
    const id = generateSessionId();
    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(id).toMatch(uuidV4Regex);
  });

  it("should generate unique IDs", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      ids.add(generateSessionId());
    }
    expect(ids.size).toBe(1000);
  });

  it("should always have version 4 in the third segment", () => {
    for (let i = 0; i < 100; i++) {
      const id = generateSessionId();
      const thirdSegment = id.split("-")[2];
      expect(thirdSegment?.[0]).toBe("4");
    }
  });

  it("should have variant bits in the fourth segment", () => {
    for (let i = 0; i < 100; i++) {
      const id = generateSessionId();
      const fourthSegment = id.split("-")[3];
      const firstChar = fourthSegment?.[0];
      expect(["8", "9", "a", "b"]).toContain(firstChar);
    }
  });
});

describe("generateTrialId", () => {
  it("should return a string", () => {
    const id = generateTrialId();
    expect(typeof id).toBe("string");
  });

  it("should use default prefix 'trial'", () => {
    const id = generateTrialId();
    expect(id.startsWith("trial-")).toBe(true);
  });

  it("should use custom prefix when provided", () => {
    const id = generateTrialId("survey");
    expect(id.startsWith("survey-")).toBe(true);
  });

  it("should generate unique IDs", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      ids.add(generateTrialId());
    }
    expect(ids.size).toBe(1000);
  });

  it("should contain first two UUID segments after prefix", () => {
    const id = generateTrialId("test");
    const parts = id.split("-");
    // Format: prefix-xxxxxxxx-xxxx
    expect(parts.length).toBe(3);
    expect(parts[0]).toBe("test");
    expect(parts[1]).toMatch(/^[0-9a-f]{8}$/i);
    expect(parts[2]).toMatch(/^[0-9a-f]{4}$/i);
  });

  it("should handle empty prefix", () => {
    const id = generateTrialId("");
    expect(id.startsWith("-")).toBe(true);
  });

  it("should handle prefix with special characters", () => {
    const id = generateTrialId("my_trial_001");
    expect(id.startsWith("my_trial_001-")).toBe(true);
  });
});
