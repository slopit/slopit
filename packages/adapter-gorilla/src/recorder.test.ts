/**
 * Unit tests for GorillaRecorder.
 */

import { createMockTextarea, delay, simulateTyping } from "@slopit/adapter-shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GorillaRecorder, SlopitRecorder } from "./recorder.js";
import type { GorillaModule } from "./types.js";

/**
 * Creates a mock Gorilla module for testing.
 */
function createMockGorilla(): GorillaModule {
  return {
    ready: vi.fn((callback: () => void) => callback()),
    metric: vi.fn(),
    store: vi.fn(),
    finish: vi.fn(),
    stimuliURL: vi.fn((filename: string) => `https://gorilla.sc/stimuli/${filename}`),
  };
}

describe("SlopitRecorder", () => {
  let mockGorilla: GorillaModule;
  let textarea: HTMLTextAreaElement;

  beforeEach(() => {
    mockGorilla = createMockGorilla();
    window.gorilla = mockGorilla;
    textarea = createMockTextarea();
    document.body.appendChild(textarea);
  });

  afterEach(() => {
    delete window.gorilla;
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("creates a recorder with default configuration", () => {
      const recorder = new SlopitRecorder();

      expect(recorder).toBeInstanceOf(SlopitRecorder);
      expect(recorder.getSessionId()).toBeDefined();
    });

    it("creates a recorder with custom configuration", () => {
      const recorder = new SlopitRecorder({
        participantId: "P001",
        studyId: "study-123",
        autoStore: true,
        storeKey: "custom_key",
      });

      expect(recorder.getSessionId()).toBeDefined();
    });

    it("is also exported as GorillaRecorder", () => {
      const recorder = new GorillaRecorder();

      expect(recorder).toBeInstanceOf(SlopitRecorder);
    });
  });

  describe("startTrial", () => {
    it("starts a trial with trialId and element", () => {
      const recorder = new SlopitRecorder();

      recorder.startTrial("trial_1", textarea);

      expect(recorder.isTrialInProgress()).toBe(true);
      expect(recorder.getCurrentTrial()?.trialId).toBe("trial_1");
    });

    it("starts a trial with just trialId", () => {
      const recorder = new SlopitRecorder();

      recorder.startTrial("trial_1");

      expect(recorder.isTrialInProgress()).toBe(true);
    });

    it("starts a trial with full config object", () => {
      const recorder = new SlopitRecorder();

      recorder.startTrial({
        trialId: "trial_1",
        trialType: "text-entry",
        targetElement: textarea,
      });

      expect(recorder.isTrialInProgress()).toBe(true);
      expect(recorder.getCurrentTrial()?.trialType).toBe("text-entry");
    });

    it("starts a trial with additional config options", () => {
      const recorder = new SlopitRecorder();

      recorder.startTrial("trial_1", textarea, {
        trialType: "survey",
        stimulus: { type: "text", content: "What is your opinion?" },
      });

      const trial = recorder.getCurrentTrial();
      expect(trial?.trialType).toBe("survey");
      expect(trial?.stimulus?.content).toBe("What is your opinion?");
    });

    it("throws when starting a trial while one is in progress", () => {
      const recorder = new SlopitRecorder();
      recorder.startTrial("trial_1");

      expect(() => recorder.startTrial("trial_2")).toThrow("A trial is already in progress");
    });
  });

  describe("startTrialWithSelector", () => {
    it("immediately attaches to existing element", () => {
      const recorder = new SlopitRecorder();

      recorder.startTrialWithSelector("trial_1", "textarea");

      expect(recorder.isTrialInProgress()).toBe(true);
      expect(recorder.getCurrentTrial()?.element).toBe(textarea);
    });

    it("waits for element to appear in DOM", async () => {
      document.body.innerHTML = ""; // Remove textarea
      const recorder = new SlopitRecorder();

      recorder.startTrialWithSelector("trial_1", "#dynamic-input");

      expect(recorder.isTrialInProgress()).toBe(true);
      expect(recorder.getCurrentTrial()?.element).toBeUndefined();

      // Add element after a delay
      await delay(50);
      const dynamicInput = document.createElement("textarea");
      dynamicInput.id = "dynamic-input";
      document.body.appendChild(dynamicInput);

      // Wait for MutationObserver to detect the element
      await delay(50);

      expect(recorder.getCurrentTrial()?.element).toBe(dynamicInput);
    });

    it("uses custom container for discovery", () => {
      const container = document.createElement("div");
      const innerTextarea = createMockTextarea();
      innerTextarea.className = "inner-input";
      container.appendChild(innerTextarea);
      document.body.appendChild(container);

      const recorder = new SlopitRecorder();

      recorder.startTrialWithSelector("trial_1", ".inner-input", container);

      expect(recorder.getCurrentTrial()?.element).toBe(innerTextarea);
    });
  });

  describe("endTrial", () => {
    it("ends a trial with string response", async () => {
      const recorder = new SlopitRecorder();
      recorder.startTrial("trial_1", textarea);

      await simulateTyping(textarea, "Hello world");
      const trial = recorder.endTrial("Hello world");

      expect(trial.trialId).toBe("trial_1");
      expect(trial.response?.type).toBe("text");
      expect(trial.response?.value).toBe("Hello world");
      expect(trial.response?.characterCount).toBe(11);
      expect(trial.response?.wordCount).toBe(2);
    });

    it("ends a trial with ResponseInfo object", () => {
      const recorder = new SlopitRecorder();
      recorder.startTrial("trial_1", textarea);

      const trial = recorder.endTrial({
        type: "text",
        value: "Custom response",
        characterCount: 15,
        wordCount: 2,
      });

      expect(trial.response?.type).toBe("text");
      expect(trial.response?.value).toBe("Custom response");
    });

    it("ends a trial without response", () => {
      const recorder = new SlopitRecorder();
      recorder.startTrial("trial_1", textarea);

      const trial = recorder.endTrial();

      expect(trial.trialId).toBe("trial_1");
      expect(trial.response).toBeUndefined();
    });

    it("captures behavioral data", async () => {
      const recorder = new SlopitRecorder();
      recorder.startTrial("trial_1", textarea);

      await simulateTyping(textarea, "Test");
      const trial = recorder.endTrial("Test");

      expect(trial.behavioral).toBeDefined();
      expect(trial.behavioral?.keystrokes?.length ?? 0).toBeGreaterThan(0);
    });

    it("cleans up discovery observer on endTrial", async () => {
      document.body.innerHTML = "";
      const recorder = new SlopitRecorder();

      recorder.startTrialWithSelector("trial_1", "#missing-element");

      // End trial before element appears
      const trial = recorder.endTrial("response");

      expect(trial.trialId).toBe("trial_1");
      expect(recorder.isTrialInProgress()).toBe(false);
    });

    it("auto-stores trial data when autoStore is enabled", () => {
      const recorder = new SlopitRecorder({ autoStore: true, storeKey: "test" });
      recorder.startTrial("trial_1", textarea);

      recorder.endTrial("response");

      expect(mockGorilla.store).toHaveBeenCalledWith(
        "test_trial_0",
        expect.objectContaining({
          behavioral: expect.anything(),
        }),
      );
    });

    it("does not auto-store when autoStore is disabled", () => {
      const recorder = new SlopitRecorder({ autoStore: false });
      recorder.startTrial("trial_1", textarea);

      recorder.endTrial("response");

      expect(mockGorilla.store).not.toHaveBeenCalled();
    });

    it("handles missing gorilla module gracefully", () => {
      delete window.gorilla;
      const recorder = new SlopitRecorder({ autoStore: true });
      recorder.startTrial("trial_1", textarea);

      // Should not throw
      const trial = recorder.endTrial("response");

      expect(trial.trialId).toBe("trial_1");
    });

    it("throws when no trial is in progress", () => {
      const recorder = new SlopitRecorder();

      expect(() => recorder.endTrial("response")).toThrow("No trial in progress");
    });
  });

  describe("storeSession", () => {
    it("stores session via gorilla.metric with default key", () => {
      const recorder = new SlopitRecorder();
      recorder.startTrial("trial_1", textarea);
      recorder.endTrial("response");

      recorder.storeSession();

      expect(mockGorilla.metric).toHaveBeenCalledWith(
        "slopit_session",
        expect.stringContaining('"sessionId"'),
      );
    });

    it("stores session via gorilla.metric with custom key", () => {
      const recorder = new SlopitRecorder();
      recorder.startTrial("trial_1", textarea);
      recorder.endTrial("response");

      recorder.storeSession("custom_session_key");

      expect(mockGorilla.metric).toHaveBeenCalledWith("custom_session_key", expect.any(String));
    });

    it("handles missing gorilla module gracefully", () => {
      delete window.gorilla;
      const recorder = new SlopitRecorder();

      // Should not throw
      recorder.storeSession();
    });
  });

  describe("saveToStore", () => {
    it("saves session via gorilla.store with default key", () => {
      const recorder = new SlopitRecorder({ storeKey: "my_slopit" });
      recorder.startTrial("trial_1", textarea);
      recorder.endTrial("response");

      recorder.saveToStore();

      expect(mockGorilla.store).toHaveBeenCalledWith(
        "my_slopit",
        expect.objectContaining({
          sessionId: expect.any(String),
          trials: expect.any(Array),
        }),
      );
    });

    it("saves session via gorilla.store with custom key", () => {
      const recorder = new SlopitRecorder();
      recorder.startTrial("trial_1", textarea);
      recorder.endTrial("response");

      recorder.saveToStore("custom_store_key");

      expect(mockGorilla.store).toHaveBeenCalledWith(
        "custom_store_key",
        expect.objectContaining({
          sessionId: expect.any(String),
        }),
      );
    });

    it("handles missing gorilla module gracefully", () => {
      delete window.gorilla;
      const recorder = new SlopitRecorder();

      // Should not throw
      recorder.saveToStore();
    });
  });

  describe("exportSession", () => {
    it("exports a valid SlopitSession", () => {
      const recorder = new SlopitRecorder({
        participantId: "P001",
        studyId: "study-123",
      });
      recorder.startTrial("trial_1", textarea);
      recorder.endTrial("response");

      const session = recorder.exportSession();

      expect(session.sessionId).toBeDefined();
      expect(session.participantId).toBe("P001");
      expect(session.studyId).toBe("study-123");
      expect(session.platform.name).toBe("Gorilla");
      expect(session.platform.adapterVersion).toBe("0.1.0");
      expect(session.trials).toHaveLength(1);
    });

    it("exports session with multiple trials", () => {
      const recorder = new SlopitRecorder();

      recorder.startTrial("trial_1", textarea);
      recorder.endTrial("response 1");

      recorder.startTrial("trial_2", textarea);
      recorder.endTrial("response 2");

      const session = recorder.exportSession();

      expect(session.trials).toHaveLength(2);
      expect(session.trials[0]?.trialId).toBe("trial_1");
      expect(session.trials[1]?.trialId).toBe("trial_2");
    });
  });

  describe("trial lifecycle", () => {
    it("supports full trial workflow", async () => {
      const recorder = new SlopitRecorder({
        participantId: "P001",
        autoStore: true,
      });

      // Trial 1
      recorder.startTrial("trial_1", textarea, {
        trialType: "text-entry",
        stimulus: { type: "text", content: "Describe your day." },
      });
      await simulateTyping(textarea, "It was great");
      const trial1 = recorder.endTrial("It was great");

      expect(trial1.trialIndex).toBe(0);
      expect(trial1.behavioral?.keystrokes?.length ?? 0).toBeGreaterThan(0);

      // Clear textarea for next trial
      textarea.value = "";

      // Trial 2
      recorder.startTrial("trial_2", textarea);
      await simulateTyping(textarea, "Another response");
      const trial2 = recorder.endTrial("Another response");

      expect(trial2.trialIndex).toBe(1);

      // Export
      const session = recorder.exportSession();
      expect(session.trials).toHaveLength(2);

      // Store
      recorder.storeSession();
      expect(mockGorilla.metric).toHaveBeenCalledTimes(1);
    });

    it("supports reset between sessions", () => {
      const recorder = new SlopitRecorder();
      const firstSessionId = recorder.getSessionId();

      recorder.startTrial("trial_1", textarea);
      recorder.endTrial("response");

      recorder.reset();

      expect(recorder.getSessionId()).not.toBe(firstSessionId);
      expect(recorder.getTrials()).toHaveLength(0);
      expect(recorder.isTrialInProgress()).toBe(false);
    });
  });
});
