/**
 * Unit tests for SlopitRecorder.
 */

import {
  createMockTextarea,
  delay,
  simulateFocus,
  simulateKeystroke,
  simulatePaste,
  simulateTyping,
} from "@slopit/adapter-shared";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { SlopitRecorder, VanillaRecorder } from "./recorder.js";
import type { VanillaRecorderConfig } from "./types.js";

describe("SlopitRecorder", () => {
  let recorder: SlopitRecorder;
  let textarea: HTMLTextAreaElement;

  beforeEach(() => {
    recorder = new SlopitRecorder();
    textarea = createMockTextarea("test-input");
    document.body.appendChild(textarea);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  describe("constructor", () => {
    it("should create a recorder with default configuration", () => {
      const rec = new SlopitRecorder();
      expect(rec.getSessionId()).toBeDefined();
      expect(rec.getTrialCount()).toBe(0);
      expect(rec.isTrialActive()).toBe(false);
    });

    it("should create a recorder with custom configuration", () => {
      const config: VanillaRecorderConfig = {
        participantId: "P001",
        studyId: "study_1",
        platformName: "custom-platform",
        platformVersion: "2.0.0",
      };

      const rec = new SlopitRecorder(config);
      const session = rec.exportSession();

      expect(session.participantId).toBe("P001");
      expect(session.studyId).toBe("study_1");
      expect(session.platform.name).toBe("custom-platform");
      expect(session.platform.version).toBe("2.0.0");
    });

    it("should use default platform info when not specified", () => {
      const rec = new SlopitRecorder();
      const session = rec.exportSession();

      expect(session.platform.name).toBe("vanilla");
      expect(session.platform.version).toBe("1.0.0");
      expect(session.platform.adapterVersion).toBe("0.1.0");
    });
  });

  describe("startTrial", () => {
    it("should start a trial with basic configuration", () => {
      recorder.startTrial({
        trialId: "trial_1",
        targetElement: textarea,
      });

      expect(recorder.isTrialActive()).toBe(true);
      expect(recorder.getCurrentTrialId()).toBe("trial_1");
    });

    it("should auto-generate trial ID if not provided", () => {
      recorder.startTrial({ targetElement: textarea });

      const trialId = recorder.getCurrentTrialId();
      expect(trialId).not.toBeNull();
      expect(trialId).toMatch(/^[a-z0-9-]+$/);
    });

    it("should throw error if trial already in progress", () => {
      recorder.startTrial({ trialId: "trial_1" });

      expect(() => {
        recorder.startTrial({ trialId: "trial_2" });
      }).toThrow("A trial is already in progress");
    });

    it("should normalize string stimulus to StimulusInfo", () => {
      recorder.startTrial({
        trialId: "trial_1",
        stimulus: "Please describe your experience.",
      });

      const trial = recorder.getCurrentTrial();
      expect(trial?.stimulus).toEqual({
        type: "text",
        content: "Please describe your experience.",
      });
    });

    it("should preserve StimulusInfo stimulus", () => {
      const stimulus = {
        type: "html" as const,
        content: "<p>Instructions</p>",
      };

      recorder.startTrial({
        trialId: "trial_1",
        stimulus,
      });

      const trial = recorder.getCurrentTrial();
      expect(trial?.stimulus).toEqual(stimulus);
    });
  });

  describe("endTrial", () => {
    it("should end a trial and return result", () => {
      recorder.startTrial({
        trialId: "trial_1",
        targetElement: textarea,
      });

      const result = recorder.endTrial("Test response");

      expect(result.trialId).toBe("trial_1");
      expect(result.trialIndex).toBe(0);
      expect(result.rt).toBeGreaterThanOrEqual(0);
      expect(result.data.behavioral).toBeDefined();
      expect(result.data.flags).toBeDefined();
    });

    it("should throw error if no trial in progress", () => {
      expect(() => {
        recorder.endTrial("response");
      }).toThrow("No trial in progress");
    });

    it("should normalize string response to ResponseInfo", () => {
      recorder.startTrial({ trialId: "trial_1" });
      const _result = recorder.endTrial("Hello world");

      const session = recorder.exportSession();
      const trial = session.trials[0];

      expect(trial?.response).toEqual({
        type: "text",
        value: "Hello world",
        characterCount: 11,
        wordCount: 2,
      });
    });

    it("should handle empty string response", () => {
      recorder.startTrial({ trialId: "trial_1" });
      recorder.endTrial("");

      const session = recorder.exportSession();
      const trial = session.trials[0];

      expect(trial?.response?.characterCount).toBe(0);
      expect(trial?.response?.wordCount).toBe(0);
    });

    it("should handle response with extra whitespace", () => {
      recorder.startTrial({ trialId: "trial_1" });
      recorder.endTrial("  hello   world  ");

      const session = recorder.exportSession();
      const trial = session.trials[0];

      expect(trial?.response?.wordCount).toBe(2);
    });

    it("should preserve ResponseInfo response", () => {
      const response = {
        type: "choice" as const,
        value: "option_a",
      };

      recorder.startTrial({ trialId: "trial_1" });
      recorder.endTrial(response);

      const session = recorder.exportSession();
      const trial = session.trials[0];

      expect(trial?.response).toEqual(response);
    });

    it("should increment trial index", () => {
      recorder.startTrial({ trialId: "trial_1" });
      const result1 = recorder.endTrial("response 1");

      recorder.startTrial({ trialId: "trial_2" });
      const result2 = recorder.endTrial("response 2");

      expect(result1.trialIndex).toBe(0);
      expect(result2.trialIndex).toBe(1);
    });
  });

  describe("behavioral capture", () => {
    it("should capture keystrokes", async () => {
      recorder.startTrial({
        trialId: "trial_1",
        targetElement: textarea,
      });

      simulateFocus(textarea);
      await simulateTyping(textarea, "Hi", 10);
      await delay(10);

      const result = recorder.endTrial(textarea.value);

      expect(result.data.behavioral.keystrokes.length).toBeGreaterThan(0);
    });

    it("should capture paste events", async () => {
      recorder.startTrial({
        trialId: "trial_1",
        targetElement: textarea,
      });

      simulateFocus(textarea);
      simulatePaste(textarea, "Pasted content");
      await delay(10);

      const result = recorder.endTrial(textarea.value);

      expect(result.data.behavioral.paste.length).toBe(1);
      expect(result.data.behavioral.paste[0]?.textLength).toBe(14);
    });

    it("should capture focus events", async () => {
      recorder.startTrial({
        trialId: "trial_1",
        targetElement: textarea,
      });

      simulateFocus(textarea);
      await delay(10);

      const result = recorder.endTrial("");

      expect(result.data.behavioral.focus.length).toBeGreaterThan(0);
    });
  });

  describe("isTrialActive", () => {
    it("should return false when no trial is active", () => {
      expect(recorder.isTrialActive()).toBe(false);
    });

    it("should return true when a trial is in progress", () => {
      recorder.startTrial({ trialId: "trial_1" });
      expect(recorder.isTrialActive()).toBe(true);
    });

    it("should return false after trial ends", () => {
      recorder.startTrial({ trialId: "trial_1" });
      recorder.endTrial("response");
      expect(recorder.isTrialActive()).toBe(false);
    });
  });

  describe("getCurrentTrialId", () => {
    it("should return null when no trial is active", () => {
      expect(recorder.getCurrentTrialId()).toBeNull();
    });

    it("should return trial ID when trial is active", () => {
      recorder.startTrial({ trialId: "trial_1" });
      expect(recorder.getCurrentTrialId()).toBe("trial_1");
    });

    it("should return null after trial ends", () => {
      recorder.startTrial({ trialId: "trial_1" });
      recorder.endTrial("response");
      expect(recorder.getCurrentTrialId()).toBeNull();
    });
  });

  describe("getTrialCount", () => {
    it("should return 0 for new recorder", () => {
      expect(recorder.getTrialCount()).toBe(0);
    });

    it("should increment after each completed trial", () => {
      recorder.startTrial({ trialId: "trial_1" });
      recorder.endTrial("response 1");
      expect(recorder.getTrialCount()).toBe(1);

      recorder.startTrial({ trialId: "trial_2" });
      recorder.endTrial("response 2");
      expect(recorder.getTrialCount()).toBe(2);
    });

    it("should not increment for active trials", () => {
      recorder.startTrial({ trialId: "trial_1" });
      expect(recorder.getTrialCount()).toBe(0);
    });
  });

  describe("resetSession", () => {
    it("should clear all trials", () => {
      recorder.startTrial({ trialId: "trial_1" });
      recorder.endTrial("response");

      recorder.resetSession();

      expect(recorder.getTrialCount()).toBe(0);
    });

    it("should generate a new session ID", () => {
      const originalSessionId = recorder.getSessionId();

      recorder.resetSession();

      expect(recorder.getSessionId()).not.toBe(originalSessionId);
    });

    it("should clear active trial", () => {
      recorder.startTrial({ trialId: "trial_1" });
      expect(recorder.isTrialActive()).toBe(true);

      recorder.resetSession();

      expect(recorder.isTrialActive()).toBe(false);
    });

    it("should reset trial counter", () => {
      recorder.startTrial({ trialId: "trial_1" });
      recorder.endTrial("response");

      recorder.resetSession();

      recorder.startTrial({ trialId: "trial_new" });
      const result = recorder.endTrial("response");

      expect(result.trialIndex).toBe(0);
    });
  });

  describe("exportSession", () => {
    it("should return valid SlopitSession", () => {
      recorder.startTrial({ trialId: "trial_1" });
      recorder.endTrial("response");

      const session = recorder.exportSession();

      expect(session.schemaVersion).toBe("1.0");
      expect(session.sessionId).toBeDefined();
      expect(session.platform).toBeDefined();
      expect(session.environment).toBeDefined();
      expect(session.timing).toBeDefined();
      expect(session.trials).toHaveLength(1);
      expect(session.globalEvents).toBeDefined();
    });

    it("should include all completed trials", () => {
      recorder.startTrial({ trialId: "trial_1" });
      recorder.endTrial("response 1");

      recorder.startTrial({ trialId: "trial_2" });
      recorder.endTrial("response 2");

      const session = recorder.exportSession();

      expect(session.trials).toHaveLength(2);
      expect(session.trials[0]?.trialId).toBe("trial_1");
      expect(session.trials[1]?.trialId).toBe("trial_2");
    });

    it("should include participant and study IDs", () => {
      const rec = new SlopitRecorder({
        participantId: "P001",
        studyId: "study_1",
      });

      rec.startTrial({ trialId: "trial_1" });
      rec.endTrial("response");

      const session = rec.exportSession();

      expect(session.participantId).toBe("P001");
      expect(session.studyId).toBe("study_1");
    });

    it("should include session metadata", () => {
      const rec = new SlopitRecorder({
        metadata: { condition: "A", version: 2 },
      });

      rec.startTrial({ trialId: "trial_1" });
      rec.endTrial("response");

      const session = rec.exportSession();

      expect(session.metadata).toEqual({ condition: "A", version: 2 });
    });
  });

  describe("exportSessionJSON", () => {
    it("should return valid JSON string", () => {
      recorder.startTrial({ trialId: "trial_1" });
      recorder.endTrial("response");

      const json = recorder.exportSessionJSON();

      expect(typeof json).toBe("string");
      const parsed = JSON.parse(json);
      expect(parsed.schemaVersion).toBe("1.0");
      expect(parsed.trials).toHaveLength(1);
    });
  });

  describe("VanillaRecorder alias", () => {
    it("should be an alias for SlopitRecorder", () => {
      expect(VanillaRecorder).toBe(SlopitRecorder);
    });

    it("should create equivalent recorder", () => {
      const rec = new VanillaRecorder({ participantId: "P001" });
      const session = rec.exportSession();

      expect(session.participantId).toBe("P001");
      expect(session.platform.name).toBe("vanilla");
    });
  });

  describe("multi-trial scenarios", () => {
    it("should handle multiple trials in sequence", async () => {
      // Trial 1
      recorder.startTrial({ trialId: "trial_1", targetElement: textarea });
      simulateFocus(textarea);
      await simulateTyping(textarea, "First response", 5);
      await delay(5);
      recorder.endTrial(textarea.value);

      // Clear textarea
      textarea.value = "";

      // Trial 2
      recorder.startTrial({ trialId: "trial_2", targetElement: textarea });
      simulateFocus(textarea);
      await simulateTyping(textarea, "Second response", 5);
      await delay(5);
      recorder.endTrial(textarea.value);

      const session = recorder.exportSession();

      expect(session.trials).toHaveLength(2);
      expect(session.trials[0]?.behavioral?.keystrokes.length).toBeGreaterThan(0);
      expect(session.trials[1]?.behavioral?.keystrokes.length).toBeGreaterThan(0);
    });

    it("should track timing correctly across trials", async () => {
      recorder.startTrial({ trialId: "trial_1" });
      await delay(50);
      const result1 = recorder.endTrial("response 1");

      recorder.startTrial({ trialId: "trial_2" });
      await delay(30);
      const result2 = recorder.endTrial("response 2");

      expect(result1.rt).toBeGreaterThanOrEqual(40);
      expect(result2.rt).toBeGreaterThanOrEqual(20);
    });

    it("should preserve behavioral data for each trial", async () => {
      recorder.startTrial({ trialId: "trial_1", targetElement: textarea });
      simulateFocus(textarea);
      simulateKeystroke(textarea, "A");
      await delay(5);
      recorder.endTrial("A");

      textarea.value = "";

      recorder.startTrial({ trialId: "trial_2", targetElement: textarea });
      simulateFocus(textarea);
      simulatePaste(textarea, "pasted");
      await delay(5);
      recorder.endTrial("pasted");

      const session = recorder.exportSession();

      // Trial 1 should have keystroke, no paste
      expect(session.trials[0]?.behavioral?.keystrokes.length).toBeGreaterThan(0);
      expect(session.trials[0]?.behavioral?.paste.length).toBe(0);

      // Trial 2 should have paste, no keystroke (or just from setup)
      expect(session.trials[1]?.behavioral?.paste.length).toBe(1);
    });
  });
});
