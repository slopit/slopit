import {
  createMockTextarea,
  delay,
  simulateFocusBlur,
  simulateKeystroke,
  simulatePaste,
} from "@slopit/adapter-shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PsychoJSRecorder, SlopitRecorder } from "../index.js";

describe("PsychoJS Adapter Integration", () => {
  let textarea: HTMLTextAreaElement;

  beforeEach(() => {
    textarea = createMockTextarea("psychojs-input");
    document.body.appendChild(textarea);
    vi.spyOn(performance, "now").mockReturnValue(0);
  });

  afterEach(() => {
    textarea.remove();
    vi.restoreAllMocks();
  });

  describe("exports", () => {
    it("should export SlopitRecorder", () => {
      expect(SlopitRecorder).toBeDefined();
      expect(typeof SlopitRecorder).toBe("function");
    });

    it("should export PsychoJSRecorder as alias", () => {
      expect(PsychoJSRecorder).toBeDefined();
      expect(PsychoJSRecorder).toBe(SlopitRecorder);
    });
  });

  describe("complete experiment workflow", () => {
    it("should handle a complete experiment session", async () => {
      // Setup: create recorder like in a real PsychoJS experiment
      const mockPsychoJS = {
        version: "2024.2.0",
        experiment: {
          addData: vi.fn(),
        },
      };

      const recorder = new SlopitRecorder({
        psychoJS: mockPsychoJS,
        participantId: "P001",
        studyId: "experiment-1",
        metadata: {
          condition: "A",
          counterbalance: 1,
        },
      });

      // Trial 1: Free response question
      recorder.startTrial(
        {
          trialId: "q1",
          trialIndex: 0,
          trialType: "free_response",
          stimulus: {
            type: "text",
            content: "Describe your typical morning routine.",
          },
        },
        textarea,
      );

      // Simulate participant typing
      vi.spyOn(performance, "now").mockReturnValue(500);
      simulateKeystroke(textarea, "I");
      await delay(10);

      vi.spyOn(performance, "now").mockReturnValue(600);
      simulateKeystroke(textarea, " ");
      await delay(10);

      vi.spyOn(performance, "now").mockReturnValue(700);
      simulateKeystroke(textarea, "w");
      await delay(10);

      vi.spyOn(performance, "now").mockReturnValue(800);
      simulateKeystroke(textarea, "a");
      await delay(10);

      vi.spyOn(performance, "now").mockReturnValue(900);
      simulateKeystroke(textarea, "k");
      await delay(10);

      vi.spyOn(performance, "now").mockReturnValue(1000);
      simulateKeystroke(textarea, "e");

      const trial1 = recorder.endTrial("I wake");
      textarea.value = "";

      // Verify trial 1 data
      expect(trial1.trialId).toBe("q1");
      expect(trial1.response?.value).toBe("I wake");
      expect(trial1.behavioral?.keystrokes.length).toBeGreaterThan(0);

      // Trial 2: Another question with paste detection
      recorder.startTrial(
        {
          trialId: "q2",
          trialIndex: 1,
          trialType: "free_response",
          stimulus: {
            type: "text",
            content: "What is your favorite hobby?",
          },
        },
        textarea,
      );

      // Simulate paste (potential AI-assisted response)
      vi.spyOn(performance, "now").mockReturnValue(2000);
      simulatePaste(textarea, "I enjoy reading books and playing chess.");

      const trial2 = recorder.endTrial("I enjoy reading books and playing chess.");

      // Verify trial 2 data
      expect(trial2.trialId).toBe("q2");
      expect(trial2.behavioral?.paste.length).toBe(1);

      // End of experiment: store and export
      recorder.storeInExperiment(mockPsychoJS);
      const session = recorder.exportSession();

      // Verify complete session
      expect(session.sessionId).toBeDefined();
      expect(session.participantId).toBe("P001");
      expect(session.studyId).toBe("experiment-1");
      expect(session.metadata?.["condition"]).toBe("A");
      expect(session.platform.name).toBe("PsychoJS");
      expect(session.platform.version).toBe("2024.2.0");
      expect(session.trials).toHaveLength(2);

      // Verify data was stored
      expect(mockPsychoJS.experiment.addData).toHaveBeenCalledWith(
        "slopit_session",
        expect.any(String),
      );
    });

    it("should handle trials without elements", () => {
      const recorder = new SlopitRecorder();

      // Start trial without element (delayed attachment)
      recorder.startTrial("trial_1");

      expect(recorder.isTrialInProgress()).toBe(true);

      // Attach element later
      recorder.attachCapture(textarea);

      // Now behavioral capture should work
      simulateKeystroke(textarea, "x");

      const completed = recorder.endTrial("x");

      expect(completed.behavioral?.keystrokes.length).toBeGreaterThanOrEqual(1);
    });

    it("should handle focus/blur events", () => {
      const recorder = new SlopitRecorder();

      recorder.startTrial("trial_1", textarea);

      vi.spyOn(performance, "now").mockReturnValue(100);
      simulateFocusBlur(textarea);

      const completed = recorder.endTrial("response");

      expect(completed.behavioral?.focus.length).toBeGreaterThan(0);
    });
  });

  describe("PsychoJS-specific element handling", () => {
    it("should handle mock TextBox with _pixi property", () => {
      const mockTextBox = {
        text: "response text",
        _pixi: {
          _input_div: textarea,
        },
      };

      const recorder = new SlopitRecorder();
      recorder.startTrial("trial_1", mockTextBox);

      simulateKeystroke(textarea, "a");

      const completed = recorder.endTrial(mockTextBox.text);

      expect(completed.behavioral?.keystrokes.length).toBeGreaterThanOrEqual(1);
    });

    it("should handle mock TextInput with htmlInput property", () => {
      const mockTextInput = {
        htmlInput: textarea,
      };

      const recorder = new SlopitRecorder();
      recorder.startTrial("trial_1", mockTextInput);

      simulateKeystroke(textarea, "b");

      const completed = recorder.endTrial("b");

      expect(completed.behavioral?.keystrokes.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("session persistence", () => {
    it("should maintain state across multiple trials", () => {
      const recorder = new SlopitRecorder({
        participantId: "P123",
      });

      // Run 5 trials
      for (let i = 0; i < 5; i++) {
        recorder.startTrial(`trial_${i}`, textarea);
        simulateKeystroke(textarea, String(i));
        recorder.endTrial(`response_${i}`);
      }

      const session = recorder.exportSession();

      expect(session.trials).toHaveLength(5);
      expect(session.trials[4]?.trialIndex).toBe(4);
      expect(session.participantId).toBe("P123");

      // Session ID should remain consistent
      const sessionId = recorder.getSessionId();
      expect(session.sessionId).toBe(sessionId);
    });

    it("should reset properly for new session", () => {
      const recorder = new SlopitRecorder({
        participantId: "P001",
      });

      recorder.startTrial("trial_1", textarea);
      recorder.endTrial("response");

      const sessionId1 = recorder.getSessionId();
      recorder.reset();
      const sessionId2 = recorder.getSessionId();

      expect(sessionId1).not.toBe(sessionId2);
      expect(recorder.getTrials()).toHaveLength(0);
    });
  });

  describe("error handling", () => {
    it("should provide clear error for double startTrial", () => {
      const recorder = new SlopitRecorder();

      recorder.startTrial("trial_1");

      expect(() => recorder.startTrial("trial_2")).toThrow("A trial is already in progress");
    });

    it("should provide clear error for endTrial without startTrial", () => {
      const recorder = new SlopitRecorder();

      expect(() => recorder.endTrial("response")).toThrow("No trial in progress");
    });
  });
});
