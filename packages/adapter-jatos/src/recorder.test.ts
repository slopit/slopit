/**
 * Unit tests for JatosRecorder.
 */

import {
  createMockTextarea,
  delay,
  simulateFocus,
  simulateKeystroke,
  simulatePaste,
  simulateTyping,
} from "@slopit/adapter-shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { JatosRecorder, SlopitRecorder } from "./recorder.js";
import type { JatosModule, JatosRecorderConfig } from "./types.js";

/**
 * Creates a mock JATOS module for testing.
 */
function createMockJatos(): JatosModule {
  return {
    onLoad: vi.fn((callback: () => void) => callback()),
    submitResultData: vi.fn().mockResolvedValue(undefined),
    appendResultData: vi.fn().mockResolvedValue(undefined),
    endStudy: vi.fn(),
    startNextComponent: vi.fn(),
    studySessionData: {},
    componentResultData: {},
    studyResultData: {},
    workerId: "worker_123",
    studyId: "study_456",
    batchId: "batch_789",
    componentId: "component_1",
  };
}

describe("SlopitRecorder", () => {
  let recorder: SlopitRecorder;
  let textarea: HTMLTextAreaElement;
  let mockJatos: JatosModule;

  beforeEach(() => {
    mockJatos = createMockJatos();
    (window as unknown as { jatos: JatosModule }).jatos = mockJatos;
    recorder = new SlopitRecorder();
    textarea = createMockTextarea("test-input");
    document.body.appendChild(textarea);
  });

  afterEach(() => {
    document.body.innerHTML = "";
    delete (window as unknown as { jatos?: JatosModule }).jatos;
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create a recorder with default configuration", () => {
      const rec = new SlopitRecorder();
      expect(rec.getSessionId()).toBeDefined();
      expect(rec.getTrials()).toHaveLength(0);
      expect(rec.isTrialInProgress()).toBe(false);
    });

    it("should auto-detect participantId from JATOS workerId", () => {
      const rec = new SlopitRecorder();
      const session = rec.exportSession();

      expect(session.participantId).toBe("worker_123");
    });

    it("should auto-detect studyId from JATOS", () => {
      const rec = new SlopitRecorder();
      const session = rec.exportSession();

      expect(session.studyId).toBe("study_456");
    });

    it("should allow overriding auto-detected IDs", () => {
      const config: JatosRecorderConfig = {
        participantId: "custom_participant",
        studyId: "custom_study",
      };

      const rec = new SlopitRecorder(config);
      const session = rec.exportSession();

      expect(session.participantId).toBe("custom_participant");
      expect(session.studyId).toBe("custom_study");
    });

    it("should use custom result key when specified", () => {
      const rec = new SlopitRecorder({ resultKey: "behavioral_data" });
      expect(rec.getResultKey()).toBe("behavioral_data");
    });

    it("should use default result key 'slopit'", () => {
      const rec = new SlopitRecorder();
      expect(rec.getResultKey()).toBe("slopit");
    });

    it("should handle missing JATOS gracefully", () => {
      delete (window as unknown as { jatos?: JatosModule }).jatos;

      const rec = new SlopitRecorder();
      const session = rec.exportSession();

      expect(session.participantId).toBeUndefined();
      expect(session.studyId).toBeUndefined();
    });
  });

  describe("getPlatformInfo", () => {
    it("should return JATOS platform info", () => {
      const session = recorder.exportSession();

      expect(session.platform.name).toBe("JATOS");
      expect(session.platform.version).toBe("unknown");
      expect(session.platform.adapterVersion).toBe("0.1.0");
    });
  });

  describe("beginTrial", () => {
    it("should start a trial with ID and element", () => {
      recorder.beginTrial("trial_1", textarea);

      expect(recorder.isTrialInProgress()).toBe(true);
      expect(recorder.getCurrentTrial()?.trialId).toBe("trial_1");
    });

    it("should start a trial without element", () => {
      recorder.beginTrial("trial_1");

      expect(recorder.isTrialInProgress()).toBe(true);
      expect(recorder.getCurrentTrial()?.trialId).toBe("trial_1");
    });

    it("should start a trial with additional config", () => {
      recorder.beginTrial("trial_1", textarea, {
        trialType: "free-response",
        stimulus: { type: "text", content: "Describe your experience." },
      });

      const trial = recorder.getCurrentTrial();
      expect(trial?.trialType).toBe("free-response");
      expect(trial?.stimulus).toEqual({
        type: "text",
        content: "Describe your experience.",
      });
    });

    it("should throw error if trial already in progress", () => {
      recorder.beginTrial("trial_1");

      expect(() => {
        recorder.beginTrial("trial_2");
      }).toThrow("A trial is already in progress");
    });
  });

  describe("startTrialWithSelector", () => {
    it("should start trial with existing element", () => {
      recorder.startTrialWithSelector("trial_1", "#test-input");

      expect(recorder.isTrialInProgress()).toBe(true);
      expect(recorder.getCurrentTrial()?.element).toBe(textarea);
    });

    it("should start trial without element when selector not found", () => {
      recorder.startTrialWithSelector("trial_1", "#nonexistent");

      expect(recorder.isTrialInProgress()).toBe(true);
      expect(recorder.getCurrentTrial()?.element).toBeUndefined();
    });

    it("should discover element when it appears later", async () => {
      recorder.startTrialWithSelector("trial_1", "#late-element");

      expect(recorder.getCurrentTrial()?.element).toBeUndefined();

      // Add element after trial starts
      const lateElement = createMockTextarea("late-element");
      document.body.appendChild(lateElement);

      // Wait for MutationObserver to fire
      await delay(50);

      // The element should be attached
      expect(recorder.getCurrentTrial()?.element).toBe(lateElement);
    });

    it("should respect custom container", () => {
      const container = document.createElement("div");
      container.id = "container";
      const containerTextarea = createMockTextarea("container-input");
      container.appendChild(containerTextarea);
      document.body.appendChild(container);

      recorder.startTrialWithSelector("trial_1", "#container-input", container);

      expect(recorder.getCurrentTrial()?.element).toBe(containerTextarea);
    });
  });

  describe("finishTrial", () => {
    it("should end a trial and return completed data", () => {
      recorder.beginTrial("trial_1", textarea);
      const result = recorder.finishTrial("Test response");

      expect(result.trialId).toBe("trial_1");
      expect(result.trialIndex).toBe(0);
      expect(result.response).toEqual({
        type: "text",
        value: "Test response",
        characterCount: 13,
        wordCount: 2,
      });
    });

    it("should normalize string response to ResponseInfo", () => {
      recorder.beginTrial("trial_1");
      const result = recorder.finishTrial("Hello world");

      expect(result.response).toEqual({
        type: "text",
        value: "Hello world",
        characterCount: 11,
        wordCount: 2,
      });
    });

    it("should handle empty string response", () => {
      recorder.beginTrial("trial_1");
      const result = recorder.finishTrial("");

      expect(result.response?.characterCount).toBe(0);
      expect(result.response?.wordCount).toBe(0);
    });

    it("should handle response with extra whitespace", () => {
      recorder.beginTrial("trial_1");
      const result = recorder.finishTrial("  hello   world  ");

      expect(result.response?.wordCount).toBe(2);
    });

    it("should preserve ResponseInfo response", () => {
      const response = {
        type: "choice" as const,
        value: "option_a",
      };

      recorder.beginTrial("trial_1");
      const result = recorder.finishTrial(response);

      expect(result.response).toEqual(response);
    });

    it("should throw error if no trial in progress", () => {
      expect(() => {
        recorder.finishTrial("response");
      }).toThrow("No trial in progress");
    });

    it("should clean up element discovery on end", async () => {
      recorder.startTrialWithSelector("trial_1", "#nonexistent");
      recorder.finishTrial("response");

      // Add element after trial ends
      const lateElement = createMockTextarea("nonexistent");
      document.body.appendChild(lateElement);

      await delay(50);

      // Trial is ended, so no errors should occur
      expect(recorder.isTrialInProgress()).toBe(false);
    });
  });

  describe("behavioral capture", () => {
    it("should capture keystrokes", async () => {
      recorder.beginTrial("trial_1", textarea);

      simulateFocus(textarea);
      await simulateTyping(textarea, "Hi", 10);
      await delay(10);

      const result = recorder.finishTrial(textarea.value);

      expect(result.behavioral?.keystrokes.length).toBeGreaterThan(0);
    });

    it("should capture paste events", async () => {
      recorder.beginTrial("trial_1", textarea);

      simulateFocus(textarea);
      simulatePaste(textarea, "Pasted content");
      await delay(10);

      const result = recorder.finishTrial(textarea.value);

      expect(result.behavioral?.paste.length).toBe(1);
      expect(result.behavioral?.paste[0]?.textLength).toBe(14);
    });

    it("should capture focus events", async () => {
      recorder.beginTrial("trial_1", textarea);

      simulateFocus(textarea);
      await delay(10);

      const result = recorder.finishTrial("");

      expect(result.behavioral?.focus.length).toBeGreaterThan(0);
    });
  });

  describe("submitToJatos", () => {
    it("should submit session data to JATOS", async () => {
      recorder.beginTrial("trial_1", textarea);
      simulateFocus(textarea);
      simulateKeystroke(textarea, "A");
      await delay(5);
      recorder.finishTrial("A");

      await recorder.submitToJatos();

      expect(mockJatos.submitResultData).toHaveBeenCalledTimes(1);

      const submittedData = (mockJatos.submitResultData as ReturnType<typeof vi.fn>).mock
        .calls[0]?.[0] as Record<string, unknown>;
      expect(submittedData).toHaveProperty("slopit");
      expect((submittedData.slopit as { trials: unknown[] }).trials).toHaveLength(1);
    });

    it("should use custom result key", async () => {
      const customRecorder = new SlopitRecorder({ resultKey: "behavioral" });
      customRecorder.beginTrial("trial_1");
      customRecorder.finishTrial("response");

      await customRecorder.submitToJatos();

      const submittedData = (mockJatos.submitResultData as ReturnType<typeof vi.fn>).mock
        .calls[0]?.[0] as Record<string, unknown>;
      expect(submittedData).toHaveProperty("behavioral");
    });

    it("should warn if JATOS is not available", async () => {
      delete (window as unknown as { jatos?: JatosModule }).jatos;
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const rec = new SlopitRecorder();
      await rec.submitToJatos();

      expect(consoleSpy).toHaveBeenCalledWith("[slopit] JATOS not available, cannot submit data");

      consoleSpy.mockRestore();
    });
  });

  describe("appendToJatos", () => {
    it("should append session data to JATOS", async () => {
      recorder.beginTrial("trial_1");
      recorder.finishTrial("response");

      await recorder.appendToJatos();

      expect(mockJatos.appendResultData).toHaveBeenCalledTimes(1);

      const appendedData = (mockJatos.appendResultData as ReturnType<typeof vi.fn>).mock
        .calls[0]?.[0] as string;
      const parsed = JSON.parse(appendedData);
      expect(parsed).toHaveProperty("slopit");
    });

    it("should warn if JATOS is not available", async () => {
      delete (window as unknown as { jatos?: JatosModule }).jatos;
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const rec = new SlopitRecorder();
      await rec.appendToJatos();

      expect(consoleSpy).toHaveBeenCalledWith("[slopit] JATOS not available, cannot append data");

      consoleSpy.mockRestore();
    });
  });

  describe("storeInStudySession", () => {
    it("should store session in JATOS study session data", () => {
      recorder.beginTrial("trial_1");
      recorder.finishTrial("response");

      recorder.storeInStudySession();

      expect(mockJatos.studySessionData.slopit).toBeDefined();
      expect((mockJatos.studySessionData.slopit as { trials: unknown[] }).trials).toHaveLength(1);
    });

    it("should use custom result key", () => {
      const customRecorder = new SlopitRecorder({ resultKey: "custom_key" });
      customRecorder.beginTrial("trial_1");
      customRecorder.finishTrial("response");

      customRecorder.storeInStudySession();

      expect(mockJatos.studySessionData.custom_key).toBeDefined();
    });

    it("should handle missing JATOS gracefully", () => {
      delete (window as unknown as { jatos?: JatosModule }).jatos;
      const rec = new SlopitRecorder();

      // Should not throw
      expect(() => rec.storeInStudySession()).not.toThrow();
    });
  });

  describe("loadFromStudySession", () => {
    it("should load session from JATOS study session data", () => {
      // Store a session
      recorder.beginTrial("trial_1");
      recorder.finishTrial("response");
      recorder.storeInStudySession();

      // Create a new recorder and load the session
      const newRecorder = new SlopitRecorder();
      const loadedSession = newRecorder.loadFromStudySession();

      expect(loadedSession).toBeDefined();
      expect(loadedSession?.trials).toHaveLength(1);
      expect(loadedSession?.trials[0]?.trialId).toBe("trial_1");
    });

    it("should return undefined if no session stored", () => {
      const result = recorder.loadFromStudySession();
      expect(result).toBeUndefined();
    });

    it("should use custom result key", () => {
      const customRecorder = new SlopitRecorder({ resultKey: "custom_key" });
      customRecorder.beginTrial("trial_1");
      customRecorder.finishTrial("response");
      customRecorder.storeInStudySession();

      const newRecorder = new SlopitRecorder({ resultKey: "custom_key" });
      const loadedSession = newRecorder.loadFromStudySession();

      expect(loadedSession).toBeDefined();
    });

    it("should return undefined if JATOS not available", () => {
      delete (window as unknown as { jatos?: JatosModule }).jatos;
      const rec = new SlopitRecorder();

      const result = rec.loadFromStudySession();
      expect(result).toBeUndefined();
    });
  });

  describe("exportSession", () => {
    it("should return valid SlopitSession", () => {
      recorder.beginTrial("trial_1");
      recorder.finishTrial("response");

      const session = recorder.exportSession();

      expect(session.schemaVersion).toBe("1.0");
      expect(session.sessionId).toBeDefined();
      expect(session.platform.name).toBe("JATOS");
      expect(session.environment).toBeDefined();
      expect(session.timing).toBeDefined();
      expect(session.trials).toHaveLength(1);
      expect(session.globalEvents).toBeDefined();
    });

    it("should include all completed trials", () => {
      recorder.beginTrial("trial_1");
      recorder.finishTrial("response 1");

      recorder.beginTrial("trial_2");
      recorder.finishTrial("response 2");

      const session = recorder.exportSession();

      expect(session.trials).toHaveLength(2);
      expect(session.trials[0]?.trialId).toBe("trial_1");
      expect(session.trials[1]?.trialId).toBe("trial_2");
    });
  });

  describe("JatosRecorder alias", () => {
    it("should be an alias for SlopitRecorder", () => {
      expect(JatosRecorder).toBe(SlopitRecorder);
    });

    it("should create equivalent recorder", () => {
      const rec = new JatosRecorder({ resultKey: "test" });
      expect(rec.getResultKey()).toBe("test");
    });
  });

  describe("multi-trial scenarios", () => {
    it("should handle multiple trials in sequence", async () => {
      // Trial 1
      recorder.beginTrial("trial_1", textarea);
      simulateFocus(textarea);
      await simulateTyping(textarea, "First", 5);
      await delay(5);
      recorder.finishTrial(textarea.value);

      textarea.value = "";

      // Trial 2
      recorder.beginTrial("trial_2", textarea);
      simulateFocus(textarea);
      await simulateTyping(textarea, "Second", 5);
      await delay(5);
      recorder.finishTrial(textarea.value);

      const session = recorder.exportSession();

      expect(session.trials).toHaveLength(2);
      expect(session.trials[0]?.behavioral?.keystrokes.length).toBeGreaterThan(0);
      expect(session.trials[1]?.behavioral?.keystrokes.length).toBeGreaterThan(0);
    });

    it("should track timing correctly across trials", async () => {
      recorder.beginTrial("trial_1");
      await delay(50);
      const result1 = recorder.finishTrial("response 1");

      recorder.beginTrial("trial_2");
      await delay(30);
      const result2 = recorder.finishTrial("response 2");

      expect(result1.endTime - result1.startTime).toBeGreaterThanOrEqual(40);
      expect(result2.endTime - result2.startTime).toBeGreaterThanOrEqual(20);
    });

    it("should preserve behavioral data for each trial", async () => {
      recorder.beginTrial("trial_1", textarea);
      simulateFocus(textarea);
      simulateKeystroke(textarea, "A");
      await delay(5);
      recorder.finishTrial("A");

      textarea.value = "";

      recorder.beginTrial("trial_2", textarea);
      simulateFocus(textarea);
      simulatePaste(textarea, "pasted");
      await delay(5);
      recorder.finishTrial("pasted");

      const session = recorder.exportSession();

      // Trial 1 should have keystroke, no paste
      expect(session.trials[0]?.behavioral?.keystrokes.length).toBeGreaterThan(0);
      expect(session.trials[0]?.behavioral?.paste.length).toBe(0);

      // Trial 2 should have paste
      expect(session.trials[1]?.behavioral?.paste.length).toBe(1);
    });
  });
});
