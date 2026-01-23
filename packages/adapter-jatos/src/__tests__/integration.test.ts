/**
 * Integration tests for JATOS adapter.
 *
 * Tests realistic JATOS workflow scenarios.
 */

import {
  createMockTextarea,
  delay,
  simulateBlur,
  simulateFocus,
  simulatePaste,
  simulateTyping,
} from "@slopit/adapter-shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SlopitRecorder } from "../recorder.js";
import type { JatosModule } from "../types.js";

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
    workerId: "prolific_P123",
    studyId: "study_exp_001",
    batchId: "batch_001",
    componentId: "component_1",
  };
}

describe("JATOS integration scenarios", () => {
  let mockJatos: JatosModule;
  let trialContainer: HTMLDivElement;

  beforeEach(() => {
    mockJatos = createMockJatos();
    (window as unknown as { jatos: JatosModule }).jatos = mockJatos;

    trialContainer = document.createElement("div");
    trialContainer.id = "trial-container";
    document.body.appendChild(trialContainer);
  });

  afterEach(() => {
    document.body.innerHTML = "";
    delete (window as unknown as { jatos?: JatosModule }).jatos;
    vi.clearAllMocks();
  });

  describe("typical JATOS experiment workflow", () => {
    it("should complete a full JATOS experiment flow", async () => {
      const recorder = new SlopitRecorder();

      // Verify JATOS IDs were auto-detected
      expect(recorder.exportSession().participantId).toBe("prolific_P123");
      expect(recorder.exportSession().studyId).toBe("study_exp_001");

      // Create trial interface
      const textarea = createMockTextarea("response");
      trialContainer.appendChild(textarea);

      // Trial 1
      recorder.beginTrial("trial_1", textarea, {
        trialType: "free-response",
        stimulus: { type: "text", content: "Describe your morning routine." },
      });

      simulateFocus(textarea);
      await simulateTyping(textarea, "I wake up early", 5);
      await delay(5);

      recorder.finishTrial(textarea.value);
      textarea.value = "";

      // Trial 2
      recorder.beginTrial("trial_2", textarea, {
        trialType: "free-response",
        stimulus: { type: "text", content: "Describe your evening routine." },
      });

      simulateFocus(textarea);
      await simulateTyping(textarea, "I relax at night", 5);
      await delay(5);

      recorder.finishTrial(textarea.value);

      // Submit to JATOS
      await recorder.submitToJatos();

      expect(mockJatos.submitResultData).toHaveBeenCalledTimes(1);

      const submittedData = (mockJatos.submitResultData as ReturnType<typeof vi.fn>).mock
        .calls[0]?.[0] as Record<string, unknown>;
      const session = submittedData.slopit as { trials: unknown[] };
      expect(session.trials).toHaveLength(2);
    });

    it("should handle dynamic element creation in JATOS", async () => {
      const recorder = new SlopitRecorder();

      // Start trial before element exists
      recorder.startTrialWithSelector("trial_1", "#dynamic-textarea");

      expect(recorder.isTrialInProgress()).toBe(true);
      expect(recorder.getCurrentTrial()?.element).toBeUndefined();

      // Simulate JATOS rendering the trial interface
      await delay(10);
      const textarea = createMockTextarea("dynamic-textarea");
      trialContainer.appendChild(textarea);

      // Wait for MutationObserver
      await delay(50);

      // Element should now be attached
      expect(recorder.getCurrentTrial()?.element).toBe(textarea);

      // Complete the trial
      simulateFocus(textarea);
      await simulateTyping(textarea, "Response", 5);
      await delay(5);

      const result = recorder.finishTrial(textarea.value);
      expect(result.behavioral?.keystrokes.length).toBeGreaterThan(0);
    });
  });

  describe("multi-component study workflow", () => {
    it("should share session data across components", async () => {
      // Component 1: Create a recorder, run a trial, and store to study session
      const recorder1 = new SlopitRecorder({ resultKey: "slopit" });
      const textarea1 = createMockTextarea("comp1-input");
      trialContainer.appendChild(textarea1);

      recorder1.beginTrial("comp1_trial_1", textarea1);
      simulateFocus(textarea1);
      await simulateTyping(textarea1, "Component 1 response", 5);
      await delay(5);
      recorder1.finishTrial(textarea1.value);

      // Verify recorder1 has 1 trial
      expect(recorder1.getTrials()).toHaveLength(1);

      // Store session for next component
      recorder1.storeInStudySession();
      expect(mockJatos.studySessionData.slopit).toBeDefined();
      const storedSession = mockJatos.studySessionData.slopit as { trials: { trialId: string }[] };
      expect(storedSession.trials).toHaveLength(1);
      expect(storedSession.trials[0]?.trialId).toBe("comp1_trial_1");

      // Component 2: Create a new recorder and verify it can load the previous session
      const recorder2 = new SlopitRecorder({ resultKey: "slopit" });

      // Load previous session to verify cross-component data sharing works
      const previousSession = recorder2.loadFromStudySession();
      expect(previousSession).toBeDefined();
      expect(previousSession?.trials).toHaveLength(1);
      expect(previousSession?.trials[0]?.trialId).toBe("comp1_trial_1");

      // Recorder2 should start fresh (no trials yet)
      expect(recorder2.getTrials()).toHaveLength(0);

      // Run a trial in component 2
      const textarea2 = createMockTextarea("comp2-input");
      trialContainer.appendChild(textarea2);

      recorder2.beginTrial("comp2_trial_1", textarea2);
      simulateFocus(textarea2);
      await simulateTyping(textarea2, "Component 2 response", 5);
      await delay(5);
      recorder2.finishTrial(textarea2.value);

      // Verify recorder2 has 1 trial
      expect(recorder2.getTrials()).toHaveLength(1);

      // Final submission of recorder2's session
      await recorder2.submitToJatos();

      // Verify the submitted data has only recorder2's trials
      const submittedData = (mockJatos.submitResultData as ReturnType<typeof vi.fn>).mock
        .calls[0]?.[0] as Record<string, unknown>;
      const session = submittedData.slopit as { trials: { trialId: string }[] };
      expect(session.trials).toHaveLength(1);
      expect(session.trials[0]?.trialId).toBe("comp2_trial_1");
    });

    it("should allow incremental data submission with appendToJatos", async () => {
      const recorder = new SlopitRecorder();
      const textarea = createMockTextarea("append-input");
      trialContainer.appendChild(textarea);

      // First block of trials
      recorder.beginTrial("block1_trial_1", textarea);
      simulateFocus(textarea);
      await simulateTyping(textarea, "Block 1", 5);
      await delay(5);
      recorder.finishTrial(textarea.value);
      textarea.value = "";

      // Append first block data
      await recorder.appendToJatos();
      expect(mockJatos.appendResultData).toHaveBeenCalledTimes(1);

      // Second block of trials
      recorder.beginTrial("block2_trial_1", textarea);
      simulateFocus(textarea);
      await simulateTyping(textarea, "Block 2", 5);
      await delay(5);
      recorder.finishTrial(textarea.value);

      // Append second block data
      await recorder.appendToJatos();
      expect(mockJatos.appendResultData).toHaveBeenCalledTimes(2);
    });
  });

  describe("behavioral data capture in JATOS context", () => {
    it("should capture paste detection for AI-assisted response identification", async () => {
      const recorder = new SlopitRecorder();
      const textarea = createMockTextarea("paste-input");
      trialContainer.appendChild(textarea);

      recorder.beginTrial("trial_1", textarea);
      simulateFocus(textarea);

      // Simulate pasting (potential AI-generated content)
      simulatePaste(
        textarea,
        "This is a long pasted response that might have been generated by AI.",
      );
      await delay(5);

      const result = recorder.finishTrial(textarea.value);

      // Verify paste was captured
      expect(result.behavioral?.paste.length).toBe(1);
      expect(result.behavioral?.paste[0]?.textLength).toBeGreaterThan(0);
    });

    it("should capture focus/blur events for attention monitoring", async () => {
      const recorder = new SlopitRecorder();
      const textarea = createMockTextarea("focus-input");
      trialContainer.appendChild(textarea);

      recorder.beginTrial("trial_1", textarea);

      // Simulate participant losing focus (possibly consulting AI)
      simulateFocus(textarea);
      await delay(20);
      simulateBlur(textarea);
      await delay(50);
      simulateFocus(textarea);
      await delay(20);

      const result = recorder.finishTrial("response");

      // Verify focus events were captured
      expect(result.behavioral?.focus.length).toBeGreaterThan(0);
      const focusEvents = result.behavioral?.focus.filter((e) => e.event === "focus");
      const blurEvents = result.behavioral?.focus.filter((e) => e.event === "blur");
      expect(focusEvents?.length).toBeGreaterThan(0);
      expect(blurEvents?.length).toBeGreaterThan(0);
    });

    it("should capture keystroke timing for behavioral analysis", async () => {
      const recorder = new SlopitRecorder();
      const textarea = createMockTextarea("keystroke-input");
      trialContainer.appendChild(textarea);

      recorder.beginTrial("trial_1", textarea);
      simulateFocus(textarea);

      // Type with variable timing
      await simulateTyping(textarea, "Hello", 30);
      await delay(100); // Pause
      await simulateTyping(textarea, " world", 30);

      await delay(5);
      const result = recorder.finishTrial(textarea.value);

      // Verify keystrokes were captured
      expect(result.behavioral?.keystrokes.length).toBeGreaterThan(0);

      // Verify metrics were calculated
      expect(result.behavioral?.metrics?.keystroke).toBeDefined();
    });
  });

  describe("error handling in JATOS context", () => {
    it("should handle submission failure gracefully", async () => {
      mockJatos.submitResultData = vi.fn().mockRejectedValue(new Error("Network error"));

      const recorder = new SlopitRecorder();
      recorder.beginTrial("trial_1");
      recorder.finishTrial("response");

      // Should throw the network error
      await expect(recorder.submitToJatos()).rejects.toThrow("Network error");
    });

    it("should handle missing JATOS module during experiment", async () => {
      delete (window as unknown as { jatos?: JatosModule }).jatos;
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const recorder = new SlopitRecorder();
      recorder.beginTrial("trial_1");
      recorder.finishTrial("response");

      // Should warn but not throw
      await recorder.submitToJatos();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should continue recording even if session storage fails", () => {
      // Make studySessionData readonly to simulate storage failure
      Object.defineProperty(mockJatos, "studySessionData", {
        value: Object.freeze({}),
        writable: false,
      });

      const recorder = new SlopitRecorder();
      recorder.beginTrial("trial_1");
      recorder.finishTrial("response");

      // Should throw when trying to store (frozen object)
      expect(() => recorder.storeInStudySession()).toThrow();

      // But session data should still be exportable
      const session = recorder.exportSession();
      expect(session.trials).toHaveLength(1);
    });
  });

  describe("JATOS metadata integration", () => {
    it("should include JATOS IDs in session metadata", () => {
      const recorder = new SlopitRecorder({
        metadata: {
          condition: "experimental",
          version: "2.0",
        },
      });

      const session = recorder.exportSession();

      expect(session.participantId).toBe("prolific_P123");
      expect(session.studyId).toBe("study_exp_001");
      expect(session.metadata?.condition).toBe("experimental");
      expect(session.metadata?.version).toBe("2.0");
    });

    it("should preserve custom IDs when specified", () => {
      const recorder = new SlopitRecorder({
        participantId: "custom_participant",
        studyId: "custom_study",
      });

      const session = recorder.exportSession();

      expect(session.participantId).toBe("custom_participant");
      expect(session.studyId).toBe("custom_study");
    });
  });
});
