import { describe, expect, it } from "vitest";
import type { SlopitSession } from "../schemas/index.js";
import { isValidSession, validateSession } from "./index.js";

describe("validateSession", () => {
  const createValidSession = (): SlopitSession => ({
    schemaVersion: "1.0",
    sessionId: "test-session-123",
    platform: {
      name: "jspsych",
      version: "8.0.0",
    },
    environment: {
      userAgent: "Mozilla/5.0 (Test)",
      screenResolution: [1920, 1080],
      viewportSize: [1200, 800],
      devicePixelRatio: 2,
      timezone: "America/New_York",
      language: "en-US",
      touchCapable: false,
    },
    timing: {
      startTime: Date.now() - 60000,
      endTime: Date.now(),
      duration: 60000,
    },
    trials: [],
    globalEvents: {
      focus: [],
      errors: [],
    },
  });

  it("should return success for valid session", () => {
    const session = createValidSession();
    const result = validateSession(session);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.errors).toBeUndefined();
  });

  it("should return validated data on success", () => {
    const session = createValidSession();
    const result = validateSession(session);

    expect(result.data?.sessionId).toBe("test-session-123");
    expect(result.data?.schemaVersion).toBe("1.0");
  });

  it("should return errors for invalid session", () => {
    const result = validateSession({
      schemaVersion: "1.0",
      // Missing required fields
    });

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors?.length).toBeGreaterThan(0);
  });

  it("should include error paths", () => {
    const session = {
      ...createValidSession(),
      environment: {
        ...createValidSession().environment,
        screenResolution: [1920], // Invalid: should be tuple of 2
      },
    };

    const result = validateSession(session);

    expect(result.success).toBe(false);
    expect(result.errors?.some((e) => e.path.includes("environment"))).toBe(true);
  });

  it("should include error messages", () => {
    const result = validateSession({
      schemaVersion: "2.0", // Invalid version
      sessionId: "test",
      platform: { name: "test" },
      environment: {
        userAgent: "test",
        screenResolution: [1920, 1080],
        viewportSize: [1200, 800],
        devicePixelRatio: 1,
        timezone: "UTC",
        language: "en",
        touchCapable: false,
      },
      timing: { startTime: 0 },
      trials: [],
      globalEvents: { focus: [], errors: [] },
    });

    expect(result.success).toBe(false);
    expect(result.errors?.some((e) => e.message.length > 0)).toBe(true);
  });

  it("should validate nested trial data", () => {
    const session = {
      ...createValidSession(),
      trials: [
        {
          trialId: "trial-1",
          trialIndex: 0,
          startTime: 0,
          endTime: 1000,
          behavioral: {
            keystrokes: [
              {
                time: 100,
                key: "a",
                code: "KeyA",
                event: "keydown",
              },
            ],
          },
        },
      ],
    };

    const result = validateSession(session);
    expect(result.success).toBe(true);
    expect(result.data?.trials.length).toBe(1);
    expect(result.data?.trials[0]?.behavioral?.keystrokes?.length).toBe(1);
  });

  it("should validate trial with invalid behavioral data", () => {
    const session = {
      ...createValidSession(),
      trials: [
        {
          trialId: "trial-1",
          trialIndex: 0,
          startTime: 0,
          endTime: 1000,
          behavioral: {
            keystrokes: [
              {
                time: 100,
                key: "a",
                // Missing required 'code' and 'event' fields
              },
            ],
          },
        },
      ],
    };

    const result = validateSession(session);
    expect(result.success).toBe(false);
    expect(result.errors?.some((e) => e.path.includes("trials"))).toBe(true);
  });

  it("should handle null input", () => {
    const result = validateSession(null);
    expect(result.success).toBe(false);
  });

  it("should handle undefined input", () => {
    const result = validateSession(undefined);
    expect(result.success).toBe(false);
  });

  it("should handle non-object input", () => {
    const result = validateSession("not an object");
    expect(result.success).toBe(false);
  });

  it("should handle array input", () => {
    const result = validateSession([createValidSession()]);
    expect(result.success).toBe(false);
  });

  it("should validate global events", () => {
    const session = {
      ...createValidSession(),
      globalEvents: {
        focus: [
          { timestamp: 1000, event: "blur" as const },
          { timestamp: 2000, event: "focus" as const },
        ],
        errors: [{ timestamp: 1500, message: "Test error" }],
      },
    };

    const result = validateSession(session);
    expect(result.success).toBe(true);
    expect(result.data?.globalEvents.focus.length).toBe(2);
  });

  it("should validate capture flags in trials", () => {
    const session = {
      ...createValidSession(),
      trials: [
        {
          trialId: "trial-1",
          trialIndex: 0,
          startTime: 0,
          endTime: 1000,
          captureFlags: [
            {
              type: "paste_detected",
              severity: "medium" as const,
              message: "Paste detected",
              timestamp: 500,
              details: { textLength: 100 },
            },
          ],
        },
      ],
    };

    const result = validateSession(session);
    expect(result.success).toBe(true);
  });
});

describe("isValidSession", () => {
  const createValidSession = (): SlopitSession => ({
    schemaVersion: "1.0",
    sessionId: "test-session-123",
    platform: { name: "jspsych" },
    environment: {
      userAgent: "Test",
      screenResolution: [1920, 1080],
      viewportSize: [1200, 800],
      devicePixelRatio: 1,
      timezone: "UTC",
      language: "en",
      touchCapable: false,
    },
    timing: { startTime: 0 },
    trials: [],
    globalEvents: { focus: [], errors: [] },
  });

  it("should return true for valid session", () => {
    const session = createValidSession();
    expect(isValidSession(session)).toBe(true);
  });

  it("should return false for invalid session", () => {
    expect(isValidSession({})).toBe(false);
    expect(isValidSession(null)).toBe(false);
    expect(isValidSession(undefined)).toBe(false);
    expect(isValidSession("string")).toBe(false);
  });

  it("should act as type guard", () => {
    const data: unknown = createValidSession();

    if (isValidSession(data)) {
      // TypeScript should recognize data as SlopitSession
      expect(data.sessionId).toBe("test-session-123");
      expect(data.schemaVersion).toBe("1.0");
    } else {
      throw new Error("Should have been valid");
    }
  });

  it("should reject partial session", () => {
    const partial = {
      schemaVersion: "1.0",
      sessionId: "test",
      // Missing other required fields
    };

    expect(isValidSession(partial)).toBe(false);
  });

  it("should reject session with wrong schema version", () => {
    const session = {
      ...createValidSession(),
      schemaVersion: "2.0",
    };

    expect(isValidSession(session)).toBe(false);
  });

  it("should validate deeply nested structures", () => {
    const session = {
      ...createValidSession(),
      trials: [
        {
          trialId: "t1",
          trialIndex: 0,
          startTime: 0,
          endTime: 1000,
          response: {
            type: "text" as const,
            value: "test response",
            characterCount: 13,
            wordCount: 2,
          },
        },
      ],
    };

    expect(isValidSession(session)).toBe(true);
  });
});

describe("round-trip serialization", () => {
  const createValidSession = (): SlopitSession => ({
    schemaVersion: "1.0",
    sessionId: "test-session-123",
    participantId: "P001",
    studyId: "STUDY001",
    platform: {
      name: "jspsych",
      version: "8.0.0",
      adapterVersion: "0.1.0",
    },
    environment: {
      userAgent: "Mozilla/5.0",
      screenResolution: [1920, 1080],
      viewportSize: [1200, 800],
      devicePixelRatio: 2,
      timezone: "America/New_York",
      language: "en-US",
      touchCapable: true,
      connectionType: "4g",
    },
    timing: {
      startTime: 1700000000000,
      endTime: 1700000060000,
      duration: 60000,
    },
    trials: [
      {
        trialId: "trial-1",
        trialIndex: 0,
        trialType: "survey-text",
        startTime: 0,
        endTime: 30000,
        rt: 30000,
        stimulus: {
          type: "text",
          content: "Question?",
        },
        response: {
          type: "text",
          value: "Answer text",
          characterCount: 11,
          wordCount: 2,
        },
        behavioral: {
          keystrokes: [
            { time: 100, key: "A", code: "KeyA", event: "keydown" },
            { time: 150, key: "A", code: "KeyA", event: "keyup" },
          ],
          focus: [{ time: 5000, event: "blur" }],
          paste: [],
        },
      },
    ],
    globalEvents: {
      focus: [{ timestamp: 10000, event: "blur" }],
      errors: [],
    },
    metadata: {
      condition: "experimental",
      version: 1,
    },
  });

  it("should survive JSON round-trip", () => {
    const original = createValidSession();
    const json = JSON.stringify(original);
    const parsed = JSON.parse(json);

    const result = validateSession(parsed);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(original);
  });

  it("should preserve all nested data after round-trip", () => {
    const original = createValidSession();
    const json = JSON.stringify(original);
    const parsed = JSON.parse(json);

    const result = validateSession(parsed);

    expect(result.data?.trials[0]?.behavioral?.keystrokes?.length).toBe(2);
    expect(result.data?.trials[0]?.response?.value).toBe("Answer text");
    expect(result.data?.metadata?.["condition"]).toBe("experimental");
  });
});
