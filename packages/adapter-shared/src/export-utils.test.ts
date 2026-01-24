import type { BehavioralData, CaptureFlag } from "@slopit/core";
import { describe, expect, it } from "vitest";

import {
  completeSession,
  convertCompletedTrialToSlopit,
  convertTrialToSlopit,
  createSessionMetadata,
  createTextResponse,
} from "./export-utils.js";
import type { CompletedTrial } from "./types.js";

describe("createSessionMetadata", () => {
  it("should create session metadata with required fields", () => {
    const platform = { name: "test-platform", version: "1.0.0", adapterVersion: "0.1.0" };
    const result = createSessionMetadata(platform);

    expect(result.schemaVersion).toBe("1.0");
    expect(result.sessionId).toBeDefined();
    expect(typeof result.sessionId).toBe("string");
    expect(result.platform).toEqual(platform);
    expect(result.environment).toBeDefined();
    expect(result.timing.startTime).toBeDefined();
  });

  it("should include optional participantId", () => {
    const platform = { name: "test" };
    const result = createSessionMetadata(platform, { participantId: "P001" });

    expect(result.participantId).toBe("P001");
  });

  it("should include optional studyId", () => {
    const platform = { name: "test" };
    const result = createSessionMetadata(platform, { studyId: "study-123" });

    expect(result.studyId).toBe("study-123");
  });

  it("should include optional metadata", () => {
    const platform = { name: "test" };
    const metadata = { condition: "A", version: 2 };
    const result = createSessionMetadata(platform, { metadata });

    expect(result.metadata).toEqual(metadata);
  });

  it("should use provided startTime", () => {
    const platform = { name: "test" };
    const startTime = 1700000000000;
    const result = createSessionMetadata(platform, { startTime });

    expect(result.timing.startTime).toBe(startTime);
  });

  it("should not include undefined optional fields", () => {
    const platform = { name: "test" };
    const result = createSessionMetadata(platform);

    expect("participantId" in result).toBe(false);
    expect("studyId" in result).toBe(false);
    expect("metadata" in result).toBe(false);
  });
});

describe("completeSession", () => {
  it("should add timing and global events to session base", () => {
    const platform = { name: "test" };
    const sessionBase = createSessionMetadata(platform, { startTime: 1700000000000 });
    const trials = [
      {
        trialId: "trial-1",
        trialIndex: 0,
        startTime: 1700000001000,
        endTime: 1700000002000,
      },
    ];

    const result = completeSession(sessionBase, trials, { endTime: 1700000010000 });

    expect(result.timing.startTime).toBe(1700000000000);
    expect(result.timing.endTime).toBe(1700000010000);
    expect(result.timing.duration).toBe(10000);
    expect(result.trials).toEqual(trials);
    expect(result.globalEvents).toEqual({ focus: [], errors: [] });
  });

  it("should use current time if endTime not provided", () => {
    const now = Date.now();
    const platform = { name: "test" };
    const sessionBase = createSessionMetadata(platform, { startTime: now - 5000 });

    const result = completeSession(sessionBase, []);

    expect(result.timing.endTime).toBeGreaterThanOrEqual(now);
    expect(result.timing.duration).toBeGreaterThanOrEqual(5000);
  });
});

describe("convertTrialToSlopit", () => {
  it("should convert minimal trial data", () => {
    const result = convertTrialToSlopit({
      trialId: "trial-001",
      trialIndex: 0,
      startTime: 1000,
      endTime: 2000,
    });

    expect(result).toEqual({
      trialId: "trial-001",
      trialIndex: 0,
      startTime: 1000,
      endTime: 2000,
      rt: 1000,
    });
  });

  it("should include trialType when provided", () => {
    const result = convertTrialToSlopit({
      trialId: "trial-001",
      trialIndex: 0,
      trialType: "survey-text",
      startTime: 1000,
      endTime: 2000,
    });

    expect(result.trialType).toBe("survey-text");
  });

  it("should include stimulus when provided", () => {
    const stimulus = { type: "text" as const, content: "What is your name?" };
    const result = convertTrialToSlopit({
      trialId: "trial-001",
      trialIndex: 0,
      startTime: 1000,
      endTime: 2000,
      stimulus,
    });

    expect(result.stimulus).toEqual(stimulus);
  });

  it("should include response when provided", () => {
    const response = { type: "text" as const, value: "John", characterCount: 4, wordCount: 1 };
    const result = convertTrialToSlopit({
      trialId: "trial-001",
      trialIndex: 0,
      startTime: 1000,
      endTime: 2000,
      response,
    });

    expect(result.response).toEqual(response);
  });

  it("should include behavioral data when provided", () => {
    const behavioral: BehavioralData = {
      keystrokes: [],
      focus: [],
      paste: [],
      mouse: [],
      scroll: [],
      clipboard: [],
      inputDuration: [],
      metrics: {
        timing: {
          firstKeystrokeTime: 100,
          lastKeystrokeTime: 200,
          totalTypingTime: 100,
          averageSpeed: 0.01,
        },
      },
    };

    const result = convertTrialToSlopit({
      trialId: "trial-001",
      trialIndex: 0,
      startTime: 1000,
      endTime: 2000,
      behavioral,
    });

    expect(result.behavioral).toEqual(behavioral);
  });

  it("should include flags when provided and non-empty", () => {
    const flags: CaptureFlag[] = [
      { type: "paste_detected", severity: "medium", message: "Paste detected", timestamp: 1500 },
    ];

    const result = convertTrialToSlopit({
      trialId: "trial-001",
      trialIndex: 0,
      startTime: 1000,
      endTime: 2000,
      flags,
    });

    expect(result.captureFlags).toEqual(flags);
  });

  it("should not include flags when empty array", () => {
    const result = convertTrialToSlopit({
      trialId: "trial-001",
      trialIndex: 0,
      startTime: 1000,
      endTime: 2000,
      flags: [],
    });

    expect("captureFlags" in result).toBe(false);
  });

  it("should include platformData when provided", () => {
    const platformData = { customField: "value", score: 42 };

    const result = convertTrialToSlopit({
      trialId: "trial-001",
      trialIndex: 0,
      startTime: 1000,
      endTime: 2000,
      platformData,
    });

    expect(result.platformData).toEqual(platformData);
  });
});

describe("convertCompletedTrialToSlopit", () => {
  it("should convert a CompletedTrial to SlopitTrial", () => {
    const completedTrial: CompletedTrial = {
      trialId: "trial-001",
      trialIndex: 0,
      trialType: "text-entry",
      startTime: 1000,
      endTime: 2000,
      response: { type: "text", value: "Hello", characterCount: 5, wordCount: 1 },
      captureFlags: [{ type: "test_flag", severity: "low", message: "Test", timestamp: 1500 }],
    };

    const result = convertCompletedTrialToSlopit(completedTrial);

    expect(result.trialId).toBe("trial-001");
    expect(result.trialIndex).toBe(0);
    expect(result.trialType).toBe("text-entry");
    expect(result.startTime).toBe(1000);
    expect(result.endTime).toBe(2000);
    expect(result.rt).toBe(1000);
    expect(result.response).toEqual(completedTrial.response);
    expect(result.captureFlags).toEqual(completedTrial.captureFlags);
  });
});

describe("createTextResponse", () => {
  it("should create response info from text", () => {
    const result = createTextResponse("Hello world");

    expect(result).toEqual({
      type: "text",
      value: "Hello world",
      characterCount: 11,
      wordCount: 2,
    });
  });

  it("should handle empty string", () => {
    const result = createTextResponse("");

    expect(result).toEqual({
      type: "text",
      value: "",
      characterCount: 0,
      wordCount: 0,
    });
  });

  it("should handle whitespace-only string", () => {
    const result = createTextResponse("   ");

    expect(result).toEqual({
      type: "text",
      value: "   ",
      characterCount: 3,
      wordCount: 0,
    });
  });

  it("should handle multiple spaces between words", () => {
    const result = createTextResponse("Hello    world");

    expect(result).toEqual({
      type: "text",
      value: "Hello    world",
      characterCount: 14,
      wordCount: 2,
    });
  });

  it("should count words with leading/trailing whitespace correctly", () => {
    const result = createTextResponse("  Hello world  ");

    expect(result).toEqual({
      type: "text",
      value: "  Hello world  ",
      characterCount: 15,
      wordCount: 2,
    });
  });
});
