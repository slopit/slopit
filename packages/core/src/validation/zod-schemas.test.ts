import { describe, expect, it } from "vitest";
import {
  AnalysisFlagSchema,
  BehavioralDataSchema,
  CaptureFlagSchema,
  EnvironmentInfoSchema,
  FocusEventSchema,
  FocusMetricsSchema,
  GlobalEventsSchema,
  KeystrokeEventSchema,
  KeystrokeMetricsSchema,
  ModifierStateSchema,
  MouseEventSchema,
  PasteEventSchema,
  PlatformInfoSchema,
  ResponseInfoSchema,
  SessionTimingSchema,
  SeveritySchema,
  SlopitSessionSchema,
  SlopitTrialSchema,
  SpanAnnotationSchema,
  StimulusInfoSchema,
  TimingMetricsSchema,
} from "./zod-schemas.js";

describe("ModifierStateSchema", () => {
  it("should accept valid modifier state", () => {
    const result = ModifierStateSchema.safeParse({
      shift: true,
      ctrl: false,
      alt: false,
      meta: true,
    });
    expect(result.success).toBe(true);
  });

  it("should reject missing fields", () => {
    const result = ModifierStateSchema.safeParse({ shift: true });
    expect(result.success).toBe(false);
  });

  it("should reject non-boolean values", () => {
    const result = ModifierStateSchema.safeParse({
      shift: "true",
      ctrl: false,
      alt: false,
      meta: false,
    });
    expect(result.success).toBe(false);
  });
});

describe("KeystrokeEventSchema", () => {
  it("should accept valid keystroke event", () => {
    const result = KeystrokeEventSchema.safeParse({
      time: 100.5,
      key: "a",
      code: "KeyA",
      event: "keydown",
    });
    expect(result.success).toBe(true);
  });

  it("should accept keystroke with optional fields", () => {
    const result = KeystrokeEventSchema.safeParse({
      time: 100,
      key: "a",
      code: "KeyA",
      event: "keydown",
      textLength: 5,
      modifiers: { shift: false, ctrl: false, alt: false, meta: false },
    });
    expect(result.success).toBe(true);
  });

  it("should accept keyup events", () => {
    const result = KeystrokeEventSchema.safeParse({
      time: 150,
      key: "a",
      code: "KeyA",
      event: "keyup",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid event type", () => {
    const result = KeystrokeEventSchema.safeParse({
      time: 100,
      key: "a",
      code: "KeyA",
      event: "keypress",
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing required fields", () => {
    const result = KeystrokeEventSchema.safeParse({
      time: 100,
      key: "a",
    });
    expect(result.success).toBe(false);
  });
});

describe("FocusEventSchema", () => {
  it("should accept focus event", () => {
    const result = FocusEventSchema.safeParse({
      time: 1000,
      event: "focus",
    });
    expect(result.success).toBe(true);
  });

  it("should accept blur event with duration", () => {
    const result = FocusEventSchema.safeParse({
      time: 1000,
      event: "blur",
      blurDuration: 5000,
    });
    expect(result.success).toBe(true);
  });

  it("should accept visibilitychange with visibility state", () => {
    const result = FocusEventSchema.safeParse({
      time: 1000,
      event: "visibilitychange",
      visibility: "hidden",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid event type", () => {
    const result = FocusEventSchema.safeParse({
      time: 1000,
      event: "click",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid visibility state", () => {
    const result = FocusEventSchema.safeParse({
      time: 1000,
      event: "visibilitychange",
      visibility: "minimized",
    });
    expect(result.success).toBe(false);
  });
});

describe("PasteEventSchema", () => {
  it("should accept valid paste event", () => {
    const result = PasteEventSchema.safeParse({
      time: 500,
      textLength: 100,
      precedingKeystrokes: 5,
      blocked: false,
    });
    expect(result.success).toBe(true);
  });

  it("should accept paste with optional fields", () => {
    const result = PasteEventSchema.safeParse({
      time: 500,
      textLength: 100,
      textPreview: "Hello world...",
      textHash: "abc123",
      precedingKeystrokes: 0,
      blocked: true,
    });
    expect(result.success).toBe(true);
  });

  it("should reject missing required fields", () => {
    const result = PasteEventSchema.safeParse({
      time: 500,
      textLength: 100,
    });
    expect(result.success).toBe(false);
  });
});

describe("MouseEventSchema", () => {
  it("should accept valid mouse event", () => {
    const result = MouseEventSchema.safeParse({
      time: 200,
      event: "click",
      x: 100,
      y: 200,
    });
    expect(result.success).toBe(true);
  });

  it("should accept all mouse event types", () => {
    for (const event of ["mousemove", "mousedown", "mouseup", "click"]) {
      const result = MouseEventSchema.safeParse({
        time: 200,
        event,
        x: 0,
        y: 0,
      });
      expect(result.success).toBe(true);
    }
  });

  it("should accept negative coordinates", () => {
    const result = MouseEventSchema.safeParse({
      time: 200,
      event: "mousemove",
      x: -10,
      y: -20,
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid event type", () => {
    const result = MouseEventSchema.safeParse({
      time: 200,
      event: "dblclick",
      x: 100,
      y: 200,
    });
    expect(result.success).toBe(false);
  });
});

describe("KeystrokeMetricsSchema", () => {
  it("should accept valid keystroke metrics", () => {
    const result = KeystrokeMetricsSchema.safeParse({
      totalKeystrokes: 100,
      printableKeystrokes: 80,
      deletions: 10,
      meanIKI: 150.5,
      stdIKI: 50.2,
      medianIKI: 140,
      pauseCount: 3,
      productProcessRatio: 0.7,
    });
    expect(result.success).toBe(true);
  });

  it("should accept zero values", () => {
    const result = KeystrokeMetricsSchema.safeParse({
      totalKeystrokes: 0,
      printableKeystrokes: 0,
      deletions: 0,
      meanIKI: 0,
      stdIKI: 0,
      medianIKI: 0,
      pauseCount: 0,
      productProcessRatio: 0,
    });
    expect(result.success).toBe(true);
  });

  it("should reject missing fields", () => {
    const result = KeystrokeMetricsSchema.safeParse({
      totalKeystrokes: 100,
    });
    expect(result.success).toBe(false);
  });
});

describe("FocusMetricsSchema", () => {
  it("should accept valid focus metrics", () => {
    const result = FocusMetricsSchema.safeParse({
      blurCount: 5,
      totalBlurDuration: 10000,
      hiddenCount: 2,
      totalHiddenDuration: 5000,
    });
    expect(result.success).toBe(true);
  });

  it("should accept zero values", () => {
    const result = FocusMetricsSchema.safeParse({
      blurCount: 0,
      totalBlurDuration: 0,
      hiddenCount: 0,
      totalHiddenDuration: 0,
    });
    expect(result.success).toBe(true);
  });
});

describe("TimingMetricsSchema", () => {
  it("should accept valid timing metrics", () => {
    const result = TimingMetricsSchema.safeParse({
      firstKeystrokeLatency: 500,
      totalResponseTime: 30000,
      charactersPerMinute: 60,
    });
    expect(result.success).toBe(true);
  });

  it("should accept with only required fields", () => {
    const result = TimingMetricsSchema.safeParse({
      totalResponseTime: 30000,
    });
    expect(result.success).toBe(true);
  });

  it("should reject missing totalResponseTime", () => {
    const result = TimingMetricsSchema.safeParse({
      firstKeystrokeLatency: 500,
    });
    expect(result.success).toBe(false);
  });
});

describe("BehavioralDataSchema", () => {
  it("should accept empty object", () => {
    const result = BehavioralDataSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should accept full behavioral data", () => {
    const result = BehavioralDataSchema.safeParse({
      keystrokes: [{ time: 100, key: "a", code: "KeyA", event: "keydown" }],
      focus: [{ time: 200, event: "blur" }],
      paste: [{ time: 300, textLength: 50, precedingKeystrokes: 2, blocked: false }],
      metrics: {
        keystroke: {
          totalKeystrokes: 1,
          printableKeystrokes: 1,
          deletions: 0,
          meanIKI: 0,
          stdIKI: 0,
          medianIKI: 0,
          pauseCount: 0,
          productProcessRatio: 1,
        },
      },
    });
    expect(result.success).toBe(true);
  });
});

describe("SeveritySchema", () => {
  it("should accept valid severity levels", () => {
    for (const severity of ["info", "low", "medium", "high"]) {
      const result = SeveritySchema.safeParse(severity);
      expect(result.success).toBe(true);
    }
  });

  it("should reject invalid severity", () => {
    const result = SeveritySchema.safeParse("critical");
    expect(result.success).toBe(false);
  });
});

describe("CaptureFlagSchema", () => {
  it("should accept valid capture flag", () => {
    const result = CaptureFlagSchema.safeParse({
      type: "paste_detected",
      severity: "medium",
      message: "Paste event detected",
      timestamp: Date.now(),
    });
    expect(result.success).toBe(true);
  });

  it("should accept flag with details", () => {
    const result = CaptureFlagSchema.safeParse({
      type: "paste_detected",
      severity: "medium",
      message: "Paste event detected",
      timestamp: Date.now(),
      details: { count: 3, source: "clipboard" },
    });
    expect(result.success).toBe(true);
  });
});

describe("AnalysisFlagSchema", () => {
  it("should accept valid analysis flag", () => {
    const result = AnalysisFlagSchema.safeParse({
      type: "low_iki_variance",
      analyzer: "keystroke",
      severity: "high",
      message: "Unusually consistent typing speed detected",
    });
    expect(result.success).toBe(true);
  });

  it("should accept flag with optional fields", () => {
    const result = AnalysisFlagSchema.safeParse({
      type: "low_iki_variance",
      analyzer: "keystroke",
      severity: "high",
      message: "Unusually consistent typing speed",
      confidence: 0.95,
      evidence: { ikiVariance: 5.2 },
      trialIds: ["trial-1", "trial-2"],
    });
    expect(result.success).toBe(true);
  });

  it("should reject confidence outside 0-1 range", () => {
    const result = AnalysisFlagSchema.safeParse({
      type: "test",
      analyzer: "test",
      severity: "low",
      message: "test",
      confidence: 1.5,
    });
    expect(result.success).toBe(false);
  });

  it("should reject negative confidence", () => {
    const result = AnalysisFlagSchema.safeParse({
      type: "test",
      analyzer: "test",
      severity: "low",
      message: "test",
      confidence: -0.1,
    });
    expect(result.success).toBe(false);
  });
});

describe("PlatformInfoSchema", () => {
  it("should accept minimal platform info", () => {
    const result = PlatformInfoSchema.safeParse({
      name: "jspsych",
    });
    expect(result.success).toBe(true);
  });

  it("should accept full platform info", () => {
    const result = PlatformInfoSchema.safeParse({
      name: "jspsych",
      version: "8.0.0",
      adapterVersion: "0.1.0",
    });
    expect(result.success).toBe(true);
  });
});

describe("EnvironmentInfoSchema", () => {
  it("should accept valid environment info", () => {
    const result = EnvironmentInfoSchema.safeParse({
      userAgent: "Mozilla/5.0",
      screenResolution: [1920, 1080],
      viewportSize: [1200, 800],
      devicePixelRatio: 2,
      timezone: "America/New_York",
      language: "en-US",
      touchCapable: false,
    });
    expect(result.success).toBe(true);
  });

  it("should accept with connectionType", () => {
    const result = EnvironmentInfoSchema.safeParse({
      userAgent: "Mozilla/5.0",
      screenResolution: [1920, 1080],
      viewportSize: [1200, 800],
      devicePixelRatio: 1,
      timezone: "UTC",
      language: "en",
      touchCapable: true,
      connectionType: "4g",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid screenResolution format", () => {
    const result = EnvironmentInfoSchema.safeParse({
      userAgent: "Mozilla/5.0",
      screenResolution: [1920], // Should be tuple of 2
      viewportSize: [1200, 800],
      devicePixelRatio: 1,
      timezone: "UTC",
      language: "en",
      touchCapable: false,
    });
    expect(result.success).toBe(false);
  });
});

describe("SessionTimingSchema", () => {
  it("should accept minimal timing", () => {
    const result = SessionTimingSchema.safeParse({
      startTime: Date.now(),
    });
    expect(result.success).toBe(true);
  });

  it("should accept complete timing", () => {
    const start = Date.now();
    const end = start + 60000;
    const result = SessionTimingSchema.safeParse({
      startTime: start,
      endTime: end,
      duration: 60000,
    });
    expect(result.success).toBe(true);
  });
});

describe("StimulusInfoSchema", () => {
  it("should accept valid stimulus types", () => {
    for (const type of ["text", "image", "audio", "video", "html", "other"]) {
      const result = StimulusInfoSchema.safeParse({ type });
      expect(result.success).toBe(true);
    }
  });

  it("should accept stimulus with content", () => {
    const result = StimulusInfoSchema.safeParse({
      type: "text",
      content: "What is your opinion?",
      contentHash: "abc123",
      parameters: { fontSize: 16 },
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid stimulus type", () => {
    const result = StimulusInfoSchema.safeParse({
      type: "document",
    });
    expect(result.success).toBe(false);
  });
});

describe("SpanAnnotationSchema", () => {
  it("should accept valid span annotation", () => {
    const result = SpanAnnotationSchema.safeParse({
      start: 0,
      end: 10,
      label: "error",
      text: "misspelled",
    });
    expect(result.success).toBe(true);
  });
});

describe("ResponseInfoSchema", () => {
  it("should accept text response", () => {
    const result = ResponseInfoSchema.safeParse({
      type: "text",
      value: "This is my response",
      characterCount: 19,
      wordCount: 4,
    });
    expect(result.success).toBe(true);
  });

  it("should accept all response types", () => {
    for (const type of [
      "text",
      "choice",
      "multi-choice",
      "slider",
      "likert",
      "annotation",
      "other",
    ]) {
      const result = ResponseInfoSchema.safeParse({
        type,
        value: "test",
      });
      expect(result.success).toBe(true);
    }
  });
});

describe("SlopitTrialSchema", () => {
  it("should accept minimal trial", () => {
    const result = SlopitTrialSchema.safeParse({
      trialId: "trial-abc123",
      trialIndex: 0,
      startTime: 0,
      endTime: 5000,
    });
    expect(result.success).toBe(true);
  });

  it("should accept full trial", () => {
    const result = SlopitTrialSchema.safeParse({
      trialId: "trial-abc123",
      trialIndex: 0,
      trialType: "survey-text",
      startTime: 0,
      endTime: 5000,
      rt: 5000,
      stimulus: { type: "text", content: "Question?" },
      response: { type: "text", value: "Answer" },
      behavioral: {
        keystrokes: [{ time: 100, key: "A", code: "KeyA", event: "keydown" }],
      },
      platformData: { internal_id: 1 },
      captureFlags: [
        {
          type: "test",
          severity: "info",
          message: "Test flag",
          timestamp: Date.now(),
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe("GlobalEventsSchema", () => {
  it("should accept empty arrays", () => {
    const result = GlobalEventsSchema.safeParse({
      focus: [],
      errors: [],
    });
    expect(result.success).toBe(true);
  });

  it("should accept populated arrays", () => {
    const result = GlobalEventsSchema.safeParse({
      focus: [{ timestamp: 1000, event: "blur" }],
      errors: [{ timestamp: 2000, message: "Test error" }],
      custom: [{ timestamp: 3000, type: "custom_event", data: { key: "value" } }],
    });
    expect(result.success).toBe(true);
  });
});

describe("SlopitSessionSchema", () => {
  const createValidSession = () => ({
    schemaVersion: "1.0",
    sessionId: "test-session-id",
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
    timing: { startTime: Date.now() },
    trials: [],
    globalEvents: { focus: [], errors: [] },
  });

  it("should accept valid minimal session", () => {
    const result = SlopitSessionSchema.safeParse(createValidSession());
    expect(result.success).toBe(true);
  });

  it("should accept session with optional fields", () => {
    const session = {
      ...createValidSession(),
      participantId: "P001",
      studyId: "STUDY001",
      metadata: { condition: "A" },
    };
    const result = SlopitSessionSchema.safeParse(session);
    expect(result.success).toBe(true);
  });

  it("should reject wrong schema version", () => {
    const session = {
      ...createValidSession(),
      schemaVersion: "2.0",
    };
    const result = SlopitSessionSchema.safeParse(session);
    expect(result.success).toBe(false);
  });

  it("should reject missing required fields", () => {
    const result = SlopitSessionSchema.safeParse({
      schemaVersion: "1.0",
      sessionId: "test",
    });
    expect(result.success).toBe(false);
  });

  it("should accept session with trials", () => {
    const session = {
      ...createValidSession(),
      trials: [
        {
          trialId: "trial-1",
          trialIndex: 0,
          startTime: 0,
          endTime: 1000,
        },
        {
          trialId: "trial-2",
          trialIndex: 1,
          startTime: 1000,
          endTime: 2000,
        },
      ],
    };
    const result = SlopitSessionSchema.safeParse(session);
    expect(result.success).toBe(true);
  });

  it("should provide meaningful error paths", () => {
    const session = {
      ...createValidSession(),
      environment: {
        ...createValidSession().environment,
        screenResolution: "invalid", // Should be tuple
      },
    };
    const result = SlopitSessionSchema.safeParse(session);
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."));
      expect(paths.some((p) => p.includes("environment"))).toBe(true);
    }
  });
});

describe("Type inference", () => {
  it("should infer correct types from schemas", () => {
    // These are compile-time checks, but we can verify runtime behavior
    const keystroke = KeystrokeEventSchema.parse({
      time: 100,
      key: "a",
      code: "KeyA",
      event: "keydown",
    });
    expect(keystroke.time).toBe(100);
    expect(keystroke.key).toBe("a");
    expect(keystroke.event).toBe("keydown");
  });
});
