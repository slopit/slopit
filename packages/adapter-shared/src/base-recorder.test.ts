import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { PlatformInfo } from "@slopit/core";

import { BaseRecorder } from "./base-recorder.js";
import type { RecorderConfig } from "./types.js";

/**
 * Concrete implementation of BaseRecorder for testing.
 */
class TestRecorder extends BaseRecorder {
  static platformInfo: PlatformInfo = {
    name: "test-platform",
    version: "1.0.0",
    adapterVersion: "0.1.0",
  };

  protected getPlatformInfo(): PlatformInfo {
    return TestRecorder.platformInfo;
  }
}

describe("BaseRecorder", () => {
  let recorder: TestRecorder;
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    recorder = new TestRecorder();
  });

  afterEach(() => {
    container.remove();
  });

  describe("constructor", () => {
    it("should create a recorder with default values", () => {
      expect(recorder.getSessionId()).toBeDefined();
      expect(recorder.getTrials()).toEqual([]);
      expect(recorder.getCurrentTrial()).toBeNull();
      expect(recorder.isTrialInProgress()).toBe(false);
    });

    it("should accept configuration options", () => {
      const config: RecorderConfig = {
        participantId: "P001",
        studyId: "study-123",
        metadata: { condition: "A" },
      };

      const customRecorder = new TestRecorder(config);
      const session = customRecorder.exportSession();

      expect(session.participantId).toBe("P001");
      expect(session.studyId).toBe("study-123");
      expect(session.metadata).toEqual({ condition: "A" });
    });
  });

  describe("startTrial", () => {
    it("should start a new trial", () => {
      recorder.startTrial({ trialType: "text-entry" });

      expect(recorder.isTrialInProgress()).toBe(true);
      expect(recorder.getCurrentTrial()).not.toBeNull();
      expect(recorder.getCurrentTrial()?.trialType).toBe("text-entry");
    });

    it("should auto-generate trialId if not provided", () => {
      recorder.startTrial({});

      expect(recorder.getCurrentTrial()?.trialId).toBeDefined();
    });

    it("should use provided trialId", () => {
      recorder.startTrial({ trialId: "custom-trial-id" });

      expect(recorder.getCurrentTrial()?.trialId).toBe("custom-trial-id");
    });

    it("should auto-increment trialIndex", () => {
      recorder.startTrial({});
      expect(recorder.getCurrentTrial()?.trialIndex).toBe(0);
      recorder.endTrial();

      recorder.startTrial({});
      expect(recorder.getCurrentTrial()?.trialIndex).toBe(1);
    });

    it("should use provided trialIndex", () => {
      recorder.startTrial({ trialIndex: 5 });

      expect(recorder.getCurrentTrial()?.trialIndex).toBe(5);
    });

    it("should throw if trial already in progress", () => {
      recorder.startTrial({});

      expect(() => recorder.startTrial({})).toThrow("A trial is already in progress");
    });

    it("should attach behavioral capture when targetElement provided", () => {
      const textarea = document.createElement("textarea");
      container.appendChild(textarea);

      recorder.startTrial({ targetElement: textarea });

      expect(recorder.getCurrentTrial()?.element).toBe(textarea);
    });
  });

  describe("endTrial", () => {
    it("should end the current trial and return completed data", () => {
      recorder.startTrial({ trialType: "test" });
      const completedTrial = recorder.endTrial();

      expect(completedTrial.trialType).toBe("test");
      expect(completedTrial.endTime).toBeGreaterThan(completedTrial.startTime);
      expect(recorder.isTrialInProgress()).toBe(false);
    });

    it("should throw if no trial in progress", () => {
      expect(() => recorder.endTrial()).toThrow("No trial in progress");
    });

    it("should include response data", () => {
      recorder.startTrial({});
      const response = { type: "text" as const, value: "Hello", characterCount: 5, wordCount: 1 };
      const completedTrial = recorder.endTrial(response);

      expect(completedTrial.response).toEqual(response);
    });

    it("should include platform data", () => {
      recorder.startTrial({});
      const platformData = { customField: "value" };
      const completedTrial = recorder.endTrial(undefined, platformData);

      expect(completedTrial.platformData).toEqual(platformData);
    });

    it("should add trial to trials array", () => {
      recorder.startTrial({});
      recorder.endTrial();

      expect(recorder.getTrials()).toHaveLength(1);
    });

    it("should include behavioral data when capture was attached", async () => {
      const textarea = document.createElement("textarea");
      container.appendChild(textarea);

      recorder.startTrial({ targetElement: textarea });

      // Simulate some input
      textarea.dispatchEvent(
        new KeyboardEvent("keydown", { key: "a", code: "KeyA", bubbles: true }),
      );

      const completedTrial = recorder.endTrial();

      expect(completedTrial.behavioral).toBeDefined();
    });
  });

  describe("attachCapture", () => {
    it("should attach capture to element during trial", () => {
      const textarea = document.createElement("textarea");
      container.appendChild(textarea);

      recorder.startTrial({});
      recorder.attachCapture(textarea);

      expect(recorder.getCurrentTrial()?.element).toBe(textarea);
    });

    it("should throw if no trial in progress", () => {
      const textarea = document.createElement("textarea");

      expect(() => recorder.attachCapture(textarea)).toThrow("No trial in progress");
    });

    it("should throw if capture already attached", () => {
      const textarea1 = document.createElement("textarea");
      const textarea2 = document.createElement("textarea");
      container.appendChild(textarea1);
      container.appendChild(textarea2);

      recorder.startTrial({ targetElement: textarea1 });

      expect(() => recorder.attachCapture(textarea2)).toThrow("Capture already attached");
    });
  });

  describe("detachCapture", () => {
    it("should detach capture without ending trial", () => {
      const textarea = document.createElement("textarea");
      container.appendChild(textarea);

      recorder.startTrial({ targetElement: textarea });
      recorder.detachCapture();

      expect(recorder.isTrialInProgress()).toBe(true);
      expect(recorder.getCurrentTrial()?.element).toBeUndefined();
    });

    it("should do nothing if no capture attached", () => {
      recorder.startTrial({});

      // Should not throw
      recorder.detachCapture();
    });
  });

  describe("exportSession", () => {
    it("should export complete session data", () => {
      recorder.startTrial({ trialType: "trial-1" });
      recorder.endTrial({ type: "text", value: "Response 1" });

      recorder.startTrial({ trialType: "trial-2" });
      recorder.endTrial({ type: "text", value: "Response 2" });

      const session = recorder.exportSession();

      expect(session.schemaVersion).toBe("1.0");
      expect(session.sessionId).toBe(recorder.getSessionId());
      expect(session.platform).toEqual(TestRecorder.platformInfo);
      expect(session.environment).toBeDefined();
      expect(session.timing).toBeDefined();
      expect(session.timing.startTime).toBeDefined();
      expect(session.timing.endTime).toBeDefined();
      expect(session.timing.duration).toBeDefined();
      expect(session.trials).toHaveLength(2);
      expect(session.globalEvents).toEqual({ focus: [], errors: [] });
    });

    it("should include participant and study IDs when configured", () => {
      const customRecorder = new TestRecorder({
        participantId: "P001",
        studyId: "study-123",
      });

      const session = customRecorder.exportSession();

      expect(session.participantId).toBe("P001");
      expect(session.studyId).toBe("study-123");
    });
  });

  describe("reset", () => {
    it("should reset recorder for new session", () => {
      recorder.startTrial({});
      recorder.endTrial();
      const oldSessionId = recorder.getSessionId();

      recorder.reset();

      expect(recorder.getSessionId()).not.toBe(oldSessionId);
      expect(recorder.getTrials()).toHaveLength(0);
      expect(recorder.getCurrentTrial()).toBeNull();
    });

    it("should detach capture if trial in progress", () => {
      const textarea = document.createElement("textarea");
      container.appendChild(textarea);

      recorder.startTrial({ targetElement: textarea });
      recorder.reset();

      expect(recorder.isTrialInProgress()).toBe(false);
    });

    it("should reset trial counter", () => {
      recorder.startTrial({});
      recorder.endTrial();
      recorder.startTrial({});
      recorder.endTrial();

      recorder.reset();
      recorder.startTrial({});

      expect(recorder.getCurrentTrial()?.trialIndex).toBe(0);
    });
  });

  describe("getTrials", () => {
    it("should return a copy of trials array", () => {
      recorder.startTrial({});
      recorder.endTrial();

      const trials = recorder.getTrials();
      trials.push({
        trialId: "fake",
        trialIndex: 99,
        startTime: 0,
        endTime: 0,
      });

      // Original should be unchanged
      expect(recorder.getTrials()).toHaveLength(1);
    });
  });
});
