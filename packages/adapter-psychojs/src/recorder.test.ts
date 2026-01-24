import { createMockTextarea, simulateKeystroke, simulatePaste } from "@slopit/adapter-shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SlopitRecorder } from "./recorder.js";
import type { PsychoJSTrialConfig } from "./types.js";

describe("SlopitRecorder", () => {
  let recorder: SlopitRecorder;
  let textarea: HTMLTextAreaElement;

  beforeEach(() => {
    recorder = new SlopitRecorder();
    textarea = createMockTextarea("test-input");
    document.body.appendChild(textarea);
    vi.spyOn(performance, "now").mockReturnValue(0);
  });

  afterEach(() => {
    textarea.remove();
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("should create a recorder with default config", () => {
      const rec = new SlopitRecorder();
      expect(rec.getSessionId()).toBeDefined();
      expect(rec.isTrialInProgress()).toBe(false);
    });

    it("should accept participantId and studyId", () => {
      const rec = new SlopitRecorder({
        participantId: "P001",
        studyId: "study-123",
      });

      rec.startTrial("trial_1", textarea);
      rec.endTrial("test response");
      const session = rec.exportSession();

      expect(session.participantId).toBe("P001");
      expect(session.studyId).toBe("study-123");
    });

    it("should accept psychoJS instance for version detection", () => {
      const mockPsychoJS = { version: "2024.2.0" };
      const rec = new SlopitRecorder({ psychoJS: mockPsychoJS });

      rec.startTrial("trial_1", textarea);
      rec.endTrial("response");
      const session = rec.exportSession();

      expect(session.platform.name).toBe("PsychoJS");
      expect(session.platform.version).toBe("2024.2.0");
    });
  });

  describe("getPlatformInfo", () => {
    it("should return PsychoJS platform info", () => {
      recorder.startTrial("trial_1", textarea);
      recorder.endTrial("response");
      const session = recorder.exportSession();

      expect(session.platform.name).toBe("PsychoJS");
      expect(session.platform.adapterVersion).toBe("0.1.0");
    });

    it("should return 'unknown' version when not detectable", () => {
      recorder.startTrial("trial_1", textarea);
      recorder.endTrial("response");
      const session = recorder.exportSession();

      expect(session.platform.version).toBe("unknown");
    });

    it("should detect version from global PsychoJS object", () => {
      // Mock global PsychoJS
      const win = window as Record<string, unknown>;
      win["PsychoJS"] = { VERSION: "2024.1.5" };

      const rec = new SlopitRecorder();
      rec.startTrial("trial_1", textarea);
      rec.endTrial("response");
      const session = rec.exportSession();

      expect(session.platform.version).toBe("2024.1.5");

      // Cleanup
      delete win["PsychoJS"];
    });
  });

  describe("startTrial", () => {
    it("should start a trial with string ID", () => {
      recorder.startTrial("trial_1", textarea);

      expect(recorder.isTrialInProgress()).toBe(true);
      expect(recorder.getCurrentTrial()?.trialId).toBe("trial_1");
    });

    it("should start a trial with config object", () => {
      const config: PsychoJSTrialConfig = {
        trialId: "trial_custom",
        trialIndex: 5,
        trialType: "free_response",
        stimulus: {
          type: "text",
          content: "Describe your experience.",
        },
      };

      recorder.startTrial(config, textarea);

      const trial = recorder.getCurrentTrial();
      expect(trial?.trialId).toBe("trial_custom");
      expect(trial?.trialIndex).toBe(5);
      expect(trial?.trialType).toBe("free_response");
      expect(trial?.stimulus?.type).toBe("text");
    });

    it("should auto-generate trial ID when not provided", () => {
      recorder.startTrial({}, textarea);

      const trial = recorder.getCurrentTrial();
      expect(trial?.trialId).toBeDefined();
      expect(trial?.trialId).toMatch(/^[a-z0-9-]+$/i);
    });

    it("should auto-increment trial index", () => {
      recorder.startTrial("trial_1", textarea);
      recorder.endTrial("response 1");

      recorder.startTrial("trial_2", textarea);
      const trial = recorder.getCurrentTrial();

      expect(trial?.trialIndex).toBe(1);
    });

    it("should throw error if trial already in progress", () => {
      recorder.startTrial("trial_1", textarea);

      expect(() => recorder.startTrial("trial_2", textarea)).toThrow(
        "A trial is already in progress",
      );
    });

    it("should work without providing an element", () => {
      recorder.startTrial("trial_1");

      expect(recorder.isTrialInProgress()).toBe(true);
    });
  });

  describe("endTrial", () => {
    it("should end trial and return completed data", () => {
      recorder.startTrial("trial_1", textarea);
      const completed = recorder.endTrial("test response");

      expect(completed.trialId).toBe("trial_1");
      expect(completed.response?.type).toBe("text");
      expect(completed.response?.value).toBe("test response");
      expect(recorder.isTrialInProgress()).toBe(false);
    });

    it("should compute character and word counts from string response", () => {
      recorder.startTrial("trial_1", textarea);
      const completed = recorder.endTrial("Hello world test");

      expect(completed.response?.characterCount).toBe(16);
      expect(completed.response?.wordCount).toBe(3);
    });

    it("should handle empty response", () => {
      recorder.startTrial("trial_1", textarea);
      const completed = recorder.endTrial("");

      expect(completed.response?.value).toBe("");
      expect(completed.response?.characterCount).toBe(0);
      expect(completed.response?.wordCount).toBe(0);
    });

    it("should accept ResponseInfo object directly", () => {
      recorder.startTrial("trial_1", textarea);
      const completed = recorder.endTrial({
        type: "rating",
        value: 5,
      });

      expect(completed.response?.type).toBe("rating");
      expect(completed.response?.value).toBe(5);
    });

    it("should throw error if no trial in progress", () => {
      expect(() => recorder.endTrial("response")).toThrow("No trial in progress");
    });

    it("should capture behavioral data when element attached", () => {
      recorder.startTrial("trial_1", textarea);

      vi.spyOn(performance, "now").mockReturnValue(100);
      simulateKeystroke(textarea, "a", { code: "KeyA" });

      vi.spyOn(performance, "now").mockReturnValue(200);
      simulateKeystroke(textarea, "b", { code: "KeyB" });

      const completed = recorder.endTrial("ab");

      expect(completed.behavioral).toBeDefined();
      expect(completed.behavioral?.keystrokes.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("extractDOMElement", () => {
    it("should return HTMLElement directly", () => {
      recorder.startTrial("trial_1", textarea);

      const trial = recorder.getCurrentTrial();
      expect(trial?.element).toBe(textarea);
    });

    it("should extract element from _input_div property", () => {
      const mockPixiElement = {
        _input_div: textarea,
      };

      recorder.startTrial("trial_1", mockPixiElement);

      const trial = recorder.getCurrentTrial();
      expect(trial?.element).toBe(textarea);
    });

    it("should extract element from htmlInput property", () => {
      const mockPixiElement = {
        htmlInput: textarea,
      };

      recorder.startTrial("trial_1", mockPixiElement);

      const trial = recorder.getCurrentTrial();
      expect(trial?.element).toBe(textarea);
    });

    it("should extract element from _pixi._input_div property", () => {
      const mockTextBox = {
        _pixi: {
          _input_div: textarea,
        },
      };

      recorder.startTrial("trial_1", mockTextBox);

      const trial = recorder.getCurrentTrial();
      expect(trial?.element).toBe(textarea);
    });

    it("should handle null/undefined gracefully", () => {
      recorder.startTrial("trial_1", null);

      const trial = recorder.getCurrentTrial();
      expect(trial?.element).toBeUndefined();
    });

    it("should handle objects without DOM element gracefully", () => {
      const mockObject = { someProperty: "value" };

      recorder.startTrial("trial_1", mockObject);

      const trial = recorder.getCurrentTrial();
      expect(trial?.element).toBeUndefined();
    });
  });

  describe("storeInExperiment", () => {
    it("should call addData on experiment handler", () => {
      const addDataMock = vi.fn();
      const mockPsychoJS = {
        experiment: {
          addData: addDataMock,
        },
      };

      recorder.startTrial("trial_1", textarea);
      recorder.endTrial("response");
      recorder.storeInExperiment(mockPsychoJS);

      expect(addDataMock).toHaveBeenCalledTimes(1);
      expect(addDataMock).toHaveBeenCalledWith("slopit_session", expect.any(String));

      // Verify the data is valid JSON
      const jsonArg = addDataMock.mock.calls[0]?.[1];
      expect(() => JSON.parse(jsonArg as string)).not.toThrow();
    });

    it("should use custom key when provided", () => {
      const addDataMock = vi.fn();
      const mockPsychoJS = {
        experiment: {
          addData: addDataMock,
        },
      };

      recorder.startTrial("trial_1", textarea);
      recorder.endTrial("response");
      recorder.storeInExperiment(mockPsychoJS, "custom_key");

      expect(addDataMock).toHaveBeenCalledWith("custom_key", expect.any(String));
    });

    it("should handle missing experiment handler gracefully", () => {
      const mockPsychoJS = {};

      recorder.startTrial("trial_1", textarea);
      recorder.endTrial("response");

      // Should not throw
      expect(() => recorder.storeInExperiment(mockPsychoJS)).not.toThrow();
    });

    it("should handle missing addData method gracefully", () => {
      const mockPsychoJS = {
        experiment: {},
      };

      recorder.startTrial("trial_1", textarea);
      recorder.endTrial("response");

      // Should not throw
      expect(() => recorder.storeInExperiment(mockPsychoJS)).not.toThrow();
    });
  });

  describe("exportSession", () => {
    it("should export complete session with all trials", () => {
      recorder.startTrial("trial_1", textarea);
      simulateKeystroke(textarea, "a");
      recorder.endTrial("a");

      recorder.startTrial("trial_2", textarea);
      simulateKeystroke(textarea, "b");
      recorder.endTrial("b");

      const session = recorder.exportSession();

      expect(session.trials).toHaveLength(2);
      expect(session.trials[0]?.trialId).toBe("trial_1");
      expect(session.trials[1]?.trialId).toBe("trial_2");
    });

    it("should include schema version", () => {
      recorder.startTrial("trial_1", textarea);
      recorder.endTrial("response");

      const session = recorder.exportSession();

      expect(session.schemaVersion).toBeDefined();
    });

    it("should include session metadata", () => {
      const rec = new SlopitRecorder({
        participantId: "P001",
        studyId: "study-123",
        metadata: { condition: "experimental" },
      });

      rec.startTrial("trial_1", textarea);
      rec.endTrial("response");

      const session = rec.exportSession();

      expect(session.participantId).toBe("P001");
      expect(session.studyId).toBe("study-123");
      expect(session.metadata).toEqual({ condition: "experimental" });
    });
  });

  describe("behavioral capture integration", () => {
    it("should capture keystrokes", () => {
      recorder.startTrial("trial_1", textarea);

      vi.spyOn(performance, "now").mockReturnValue(100);
      simulateKeystroke(textarea, "H", { code: "KeyH", modifiers: { shift: true } });

      vi.spyOn(performance, "now").mockReturnValue(200);
      simulateKeystroke(textarea, "i", { code: "KeyI" });

      const completed = recorder.endTrial("Hi");

      expect(completed.behavioral?.keystrokes.length).toBeGreaterThanOrEqual(2);
    });

    it("should capture paste events", () => {
      recorder.startTrial("trial_1", textarea);

      simulatePaste(textarea, "pasted content");

      const completed = recorder.endTrial("pasted content");

      expect(completed.behavioral?.paste.length).toBe(1);
      expect(completed.behavioral?.paste[0]?.textLength).toBe(14);
    });

    it("should compute metrics", () => {
      recorder.startTrial("trial_1", textarea);

      vi.spyOn(performance, "now").mockReturnValue(100);
      simulateKeystroke(textarea, "a");

      vi.spyOn(performance, "now").mockReturnValue(200);
      simulateKeystroke(textarea, "b");

      vi.spyOn(performance, "now").mockReturnValue(300);
      simulateKeystroke(textarea, "c");

      const completed = recorder.endTrial("abc");

      expect(completed.behavioral?.metrics).toBeDefined();
      expect(completed.behavioral?.metrics?.keystroke).toBeDefined();
    });
  });

  describe("reset", () => {
    it("should clear all trials and generate new session ID", () => {
      recorder.startTrial("trial_1", textarea);
      recorder.endTrial("response");

      const oldSessionId = recorder.getSessionId();
      recorder.reset();

      expect(recorder.getTrials()).toHaveLength(0);
      expect(recorder.getSessionId()).not.toBe(oldSessionId);
    });
  });
});
