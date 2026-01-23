import type { JsPsych } from "jspsych";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { exportToSlopit, getSlopitDataFromTrial } from "./export.js";

describe("exportToSlopit", () => {
  let mockJsPsych: JsPsych;

  const createMockJsPsych = (
    trials: Record<string, unknown>[],
    options?: {
      startTime?: Date;
      version?: string;
    },
  ): JsPsych => {
    return {
      data: {
        get: () => ({
          values: () => trials,
          filter: ({ trial_index }: { trial_index: number }) => ({
            values: () => [trials[trial_index]],
          }),
        }),
        urlVariables: () => ({}),
      },
      getStartTime: () => options?.startTime ?? new Date(),
      version: () => options?.version ?? "8.0.0",
    } as unknown as JsPsych;
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("basic export", () => {
    it("should export empty trial list", () => {
      mockJsPsych = createMockJsPsych([]);

      const session = exportToSlopit(mockJsPsych);

      expect(session.schemaVersion).toBe("1.0");
      expect(session.trials).toEqual([]);
    });

    it("should generate session ID", () => {
      mockJsPsych = createMockJsPsych([]);

      const session = exportToSlopit(mockJsPsych);

      expect(session.sessionId).toBeDefined();
      expect(session.sessionId.length).toBeGreaterThan(0);
    });

    it("should set platform info", () => {
      mockJsPsych = createMockJsPsych([], { version: "8.2.0" });

      const session = exportToSlopit(mockJsPsych);

      expect(session.platform.name).toBe("jspsych");
      expect(session.platform.version).toBe("8.2.0");
      expect(session.platform.adapterVersion).toBe("0.1.0");
    });

    it("should capture environment info", () => {
      mockJsPsych = createMockJsPsych([]);

      const session = exportToSlopit(mockJsPsych);

      expect(session.environment).toBeDefined();
      expect(session.environment.userAgent).toBeDefined();
      expect(session.environment.timezone).toBeDefined();
    });

    it("should calculate session timing", () => {
      const startTime = new Date("2024-01-15T11:00:00.000Z");
      mockJsPsych = createMockJsPsych([], { startTime });

      const session = exportToSlopit(mockJsPsych);

      expect(session.timing.startTime).toBe(startTime.getTime());
      expect(session.timing.endTime).toBeDefined();
      const endTime = session.timing.endTime ?? 0;
      expect(session.timing.duration).toBe(endTime - session.timing.startTime);
    });

    it("should initialize empty global events", () => {
      mockJsPsych = createMockJsPsych([]);

      const session = exportToSlopit(mockJsPsych);

      expect(session.globalEvents.focus).toEqual([]);
      expect(session.globalEvents.errors).toEqual([]);
    });
  });

  describe("options", () => {
    it("should include participantId when provided", () => {
      mockJsPsych = createMockJsPsych([]);

      const session = exportToSlopit(mockJsPsych, {
        participantId: "P12345",
      });

      expect(session.participantId).toBe("P12345");
    });

    it("should not include participantId when not provided", () => {
      mockJsPsych = createMockJsPsych([]);

      const session = exportToSlopit(mockJsPsych, {});

      expect(session.participantId).toBeUndefined();
    });

    it("should include studyId when provided", () => {
      mockJsPsych = createMockJsPsych([]);

      const session = exportToSlopit(mockJsPsych, {
        studyId: "STUDY001",
      });

      expect(session.studyId).toBe("STUDY001");
    });

    it("should not include studyId when not provided", () => {
      mockJsPsych = createMockJsPsych([]);

      const session = exportToSlopit(mockJsPsych, {});

      expect(session.studyId).toBeUndefined();
    });

    it("should filter trials when trialFilter provided", () => {
      mockJsPsych = createMockJsPsych([
        { trial_type: "survey-text", time_elapsed: 1000, rt: 500 },
        { trial_type: "html-keyboard-response", time_elapsed: 2000, rt: 300 },
        { trial_type: "survey-text", time_elapsed: 3000, rt: 600 },
      ]);

      const session = exportToSlopit(mockJsPsych, {
        trialFilter: (trial) => trial["trial_type"] === "survey-text",
      });

      expect(session.trials.length).toBe(2);
      expect(session.trials[0]?.trialType).toBe("survey-text");
      expect(session.trials[1]?.trialType).toBe("survey-text");
    });

    it("should include platform data by default", () => {
      mockJsPsych = createMockJsPsych([
        {
          trial_type: "survey-text",
          time_elapsed: 1000,
          rt: 500,
          custom_field: "value",
        },
      ]);

      const session = exportToSlopit(mockJsPsych);

      expect(session.trials[0]?.platformData).toBeDefined();
      expect(session.trials[0]?.platformData?.["custom_field"]).toBe("value");
    });

    it("should exclude platform data when configured", () => {
      mockJsPsych = createMockJsPsych([
        {
          trial_type: "survey-text",
          time_elapsed: 1000,
          rt: 500,
          custom_field: "value",
        },
      ]);

      const session = exportToSlopit(mockJsPsych, {
        includePlatformData: false,
      });

      expect(session.trials[0]?.platformData).toBeUndefined();
    });
  });

  describe("trial conversion", () => {
    it("should assign trial index", () => {
      mockJsPsych = createMockJsPsych([
        { time_elapsed: 1000, rt: 100 },
        { time_elapsed: 2000, rt: 200 },
        { time_elapsed: 3000, rt: 300 },
      ]);

      const session = exportToSlopit(mockJsPsych);

      expect(session.trials[0]?.trialIndex).toBe(0);
      expect(session.trials[1]?.trialIndex).toBe(1);
      expect(session.trials[2]?.trialIndex).toBe(2);
    });

    it("should use trial_id if provided", () => {
      mockJsPsych = createMockJsPsych([{ trial_id: "custom-id-123", time_elapsed: 1000, rt: 100 }]);

      const session = exportToSlopit(mockJsPsych);

      expect(session.trials[0]?.trialId).toBe("custom-id-123");
    });

    it("should generate trial_id if not provided", () => {
      mockJsPsych = createMockJsPsych([{ time_elapsed: 1000, rt: 100 }]);

      const session = exportToSlopit(mockJsPsych);

      expect(session.trials[0]?.trialId).toBe("trial-0");
    });

    it("should extract trial_type", () => {
      mockJsPsych = createMockJsPsych([{ trial_type: "survey-text", time_elapsed: 1000, rt: 100 }]);

      const session = exportToSlopit(mockJsPsych);

      expect(session.trials[0]?.trialType).toBe("survey-text");
    });

    it("should calculate start and end times", () => {
      mockJsPsych = createMockJsPsych([{ time_elapsed: 5000, rt: 1000 }]);

      const session = exportToSlopit(mockJsPsych);

      expect(session.trials[0]?.startTime).toBe(4000); // 5000 - 1000
      expect(session.trials[0]?.endTime).toBe(5000);
    });

    it("should extract rt", () => {
      mockJsPsych = createMockJsPsych([{ time_elapsed: 5000, rt: 1234 }]);

      const session = exportToSlopit(mockJsPsych);

      expect(session.trials[0]?.rt).toBe(1234);
    });

    it("should handle missing rt", () => {
      mockJsPsych = createMockJsPsych([{ time_elapsed: 5000 }]);

      const session = exportToSlopit(mockJsPsych);

      expect(session.trials[0]?.rt).toBe(0);
    });

    it("should extract text response", () => {
      mockJsPsych = createMockJsPsych([
        {
          time_elapsed: 5000,
          rt: 1000,
          response: "This is my response",
        },
      ]);

      const session = exportToSlopit(mockJsPsych);

      expect(session.trials[0]?.response).toBeDefined();
      expect(session.trials[0]?.response?.type).toBe("text");
      expect(session.trials[0]?.response?.value).toBe("This is my response");
      expect(session.trials[0]?.response?.characterCount).toBe(19);
      expect(session.trials[0]?.response?.wordCount).toBe(4);
    });

    it("should handle non-string response", () => {
      mockJsPsych = createMockJsPsych([
        {
          time_elapsed: 5000,
          rt: 1000,
          response: { key: "value" },
        },
      ]);

      const session = exportToSlopit(mockJsPsych);

      expect(session.trials[0]?.response?.type).toBe("other");
      expect(session.trials[0]?.response?.characterCount).toBeUndefined();
    });

    it("should extract slopit behavioral data", () => {
      mockJsPsych = createMockJsPsych([
        {
          time_elapsed: 5000,
          rt: 1000,
          slopit: {
            behavioral: {
              keystrokes: [{ time: 100, key: "a", code: "KeyA", event: "keydown" }],
            },
          },
        },
      ]);

      const session = exportToSlopit(mockJsPsych);

      expect(session.trials[0]?.behavioral).toBeDefined();
      expect(session.trials[0]?.behavioral?.keystrokes?.length).toBe(1);
    });

    it("should extract slopit flags", () => {
      mockJsPsych = createMockJsPsych([
        {
          time_elapsed: 5000,
          rt: 1000,
          slopit: {
            behavioral: {},
            flags: [
              {
                type: "paste_detected",
                severity: "medium",
                message: "Paste detected",
                timestamp: 1000,
              },
            ],
          },
        },
      ]);

      const session = exportToSlopit(mockJsPsych);

      expect(session.trials[0]?.captureFlags).toBeDefined();
      expect(session.trials[0]?.captureFlags?.length).toBe(1);
      expect(session.trials[0]?.captureFlags?.[0]?.type).toBe("paste_detected");
    });

    it("should exclude slopit from platformData", () => {
      mockJsPsych = createMockJsPsych([
        {
          time_elapsed: 5000,
          rt: 1000,
          slopit: { behavioral: {} },
          other_field: "value",
        },
      ]);

      const session = exportToSlopit(mockJsPsych);

      expect(session.trials[0]?.platformData?.["slopit"]).toBeUndefined();
      expect(session.trials[0]?.platformData?.["other_field"]).toBe("value");
    });

    it("should handle empty response string", () => {
      mockJsPsych = createMockJsPsych([
        {
          time_elapsed: 5000,
          rt: 1000,
          response: "",
        },
      ]);

      const session = exportToSlopit(mockJsPsych);

      expect(session.trials[0]?.response?.characterCount).toBe(0);
      expect(session.trials[0]?.response?.wordCount).toBe(0);
    });

    it("should count words correctly with multiple spaces", () => {
      mockJsPsych = createMockJsPsych([
        {
          time_elapsed: 5000,
          rt: 1000,
          response: "  word1   word2  word3  ",
        },
      ]);

      const session = exportToSlopit(mockJsPsych);

      expect(session.trials[0]?.response?.wordCount).toBe(3);
    });
  });

  describe("edge cases", () => {
    it("should handle null start time", () => {
      mockJsPsych = {
        ...createMockJsPsych([]),
        getStartTime: () => null,
      } as unknown as JsPsych;

      const session = exportToSlopit(mockJsPsych);

      expect(session.timing.startTime).toBeDefined();
    });

    it("should handle trials with all fields missing", () => {
      mockJsPsych = createMockJsPsych([{}]);

      const session = exportToSlopit(mockJsPsych);

      expect(session.trials[0]?.trialId).toBe("trial-0");
      expect(session.trials[0]?.trialType).toBe("unknown");
      expect(session.trials[0]?.startTime).toBe(0);
      expect(session.trials[0]?.endTime).toBe(0);
    });
  });
});

describe("getSlopitDataFromTrial", () => {
  const createMockJsPsych = (trials: Record<string, unknown>[]): JsPsych => {
    return {
      data: {
        get: () => ({
          filter: ({ trial_index }: { trial_index: number }) => ({
            values: () => {
              const trial = trials.find((_, i) => i === trial_index);
              return trial ? [trial] : [];
            },
          }),
        }),
      },
    } as unknown as JsPsych;
  };

  it("should return slopit data for trial with slopit", () => {
    const mockJsPsych = createMockJsPsych([
      {
        trial_index: 0,
        slopit: {
          behavioral: { keystrokes: [] },
          flags: [{ type: "test" }],
        },
      },
    ]);

    const data = getSlopitDataFromTrial(mockJsPsych, 0);

    expect(data).toBeDefined();
    expect(data?.behavioral).toEqual({ keystrokes: [] });
    expect(data?.flags).toEqual([{ type: "test" }]);
  });

  it("should return undefined for trial without slopit", () => {
    const mockJsPsych = createMockJsPsych([{ trial_index: 0, response: "test" }]);

    const data = getSlopitDataFromTrial(mockJsPsych, 0);

    expect(data).toBeUndefined();
  });

  it("should return undefined for non-existent trial", () => {
    const mockJsPsych = createMockJsPsych([]);

    const data = getSlopitDataFromTrial(mockJsPsych, 5);

    expect(data).toBeUndefined();
  });

  it("should handle trial at different indices", () => {
    const mockJsPsych = createMockJsPsych([
      { trial_index: 0 },
      {
        trial_index: 1,
        slopit: { behavioral: { focus: [] }, flags: [] },
      },
      { trial_index: 2 },
    ]);

    const data = getSlopitDataFromTrial(mockJsPsych, 1);

    expect(data).toBeDefined();
    expect(data?.behavioral).toEqual({ focus: [] });
  });
});
