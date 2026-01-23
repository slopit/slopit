/**
 * Integration tests for Gorilla adapter.
 *
 * Tests the full workflow of integrating slopit with Gorilla experiments.
 */

import {
  createMockTextarea,
  delay,
  simulateFocusBlur,
  simulatePaste,
  simulateTyping,
} from "@slopit/adapter-shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SlopitRecorder } from "../recorder.js";
import type { GorillaModule } from "../types.js";

/**
 * Creates a mock Gorilla module with stored data tracking.
 */
function createMockGorillaWithStorage(): GorillaModule & {
  _metrics: Map<string, string | number>;
  _stored: Map<string, unknown>;
} {
  const metrics = new Map<string, string | number>();
  const stored = new Map<string, unknown>();

  return {
    _metrics: metrics,
    _stored: stored,
    ready: vi.fn((callback: () => void) => callback()),
    metric: vi.fn((key: string, value: string | number) => {
      metrics.set(key, value);
    }),
    store: vi.fn((key: string, value: unknown) => {
      stored.set(key, value);
    }),
    finish: vi.fn(),
    stimuliURL: vi.fn((filename: string) => `https://gorilla.sc/stimuli/${filename}`),
  };
}

describe("Gorilla Integration", () => {
  let mockGorilla: ReturnType<typeof createMockGorillaWithStorage>;
  let container: HTMLDivElement;

  beforeEach(() => {
    mockGorilla = createMockGorillaWithStorage();
    window.gorilla = mockGorilla;

    container = document.createElement("div");
    container.id = "experiment-container";
    document.body.appendChild(container);
  });

  afterEach(() => {
    delete window.gorilla;
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  describe("typical experiment flow", () => {
    it("records multi-trial experiment with typed responses", async () => {
      const recorder = new SlopitRecorder({
        participantId: "GORILLA_P001",
        studyId: "survey-study",
        metadata: { condition: "treatment" },
      });

      // Simulate three trials
      const prompts = [
        "What is your favorite color?",
        "Describe your ideal vacation.",
        "What motivates you?",
      ];

      for (let i = 0; i < prompts.length; i++) {
        // Simulate Gorilla creating a new trial display
        container.innerHTML = `
          <div class="trial">
            <p class="prompt">${prompts[i]}</p>
            <textarea class="response-input" rows="4"></textarea>
            <button class="submit-btn">Continue</button>
          </div>
        `;

        const textarea = container.querySelector(".response-input") as HTMLTextAreaElement;
        const response = `Response to trial ${i + 1}`;

        recorder.startTrial(`trial_${i + 1}`, textarea, {
          trialType: "free-response",
          stimulus: { type: "text", content: prompts[i] },
        });

        await simulateTyping(textarea, response);
        recorder.endTrial(response);
      }

      // Export and store session
      const session = recorder.exportSession();
      recorder.storeSession();

      // Verify session structure
      expect(session.platform.name).toBe("Gorilla");
      expect(session.participantId).toBe("GORILLA_P001");
      expect(session.studyId).toBe("survey-study");
      expect(session.trials).toHaveLength(3);

      // Verify metric was stored
      expect(mockGorilla.metric).toHaveBeenCalledWith("slopit_session", expect.any(String));

      // Parse stored metric and verify
      const storedMetric = mockGorilla._metrics.get("slopit_session");
      expect(storedMetric).toBeDefined();
      const parsedSession = JSON.parse(storedMetric as string);
      expect(parsedSession.trials).toHaveLength(3);
    });

    it("handles dynamic element discovery", async () => {
      const recorder = new SlopitRecorder();

      // Start trial before element exists
      recorder.startTrialWithSelector("dynamic_trial", ".dynamic-textarea", container);

      expect(recorder.isTrialInProgress()).toBe(true);
      expect(recorder.getCurrentTrial()?.element).toBeUndefined();

      // Simulate delayed DOM update (like Gorilla rendering)
      await delay(50);
      const textarea = createMockTextarea();
      textarea.className = "dynamic-textarea";
      container.appendChild(textarea);

      // Wait for MutationObserver
      await delay(50);

      expect(recorder.getCurrentTrial()?.element).toBe(textarea);

      // Type and complete
      await simulateTyping(textarea, "Dynamic response");
      const trial = recorder.endTrial("Dynamic response");

      expect(trial.behavioral?.keystrokes?.length ?? 0).toBeGreaterThan(0);
    });
  });

  describe("auto-store mode", () => {
    it("automatically stores trial data on each endTrial", async () => {
      const recorder = new SlopitRecorder({
        autoStore: true,
        storeKey: "experiment_data",
      });

      // Run two trials
      for (let i = 0; i < 2; i++) {
        const textarea = createMockTextarea();
        container.appendChild(textarea);

        recorder.startTrial(`trial_${i}`, textarea);
        await simulateTyping(textarea, `Response ${i}`);
        recorder.endTrial(`Response ${i}`);

        container.innerHTML = "";
      }

      // Verify both trials were stored
      expect(mockGorilla.store).toHaveBeenCalledTimes(2);
      expect(mockGorilla.store).toHaveBeenCalledWith(
        "experiment_data_trial_0",
        expect.objectContaining({ behavioral: expect.anything() }),
      );
      expect(mockGorilla.store).toHaveBeenCalledWith(
        "experiment_data_trial_1",
        expect.objectContaining({ behavioral: expect.anything() }),
      );
    });
  });

  describe("behavioral capture scenarios", () => {
    it("captures paste events", () => {
      const recorder = new SlopitRecorder();
      const textarea = createMockTextarea();
      container.appendChild(textarea);

      recorder.startTrial("paste_trial", textarea);

      // Simulate paste
      simulatePaste(textarea, "Pasted content from clipboard");

      const trial = recorder.endTrial("Pasted content from clipboard");

      // Verify paste event was captured
      expect(trial.behavioral?.paste?.length ?? 0).toBeGreaterThan(0);
    });

    it("captures focus and blur events", () => {
      const recorder = new SlopitRecorder();
      const textarea = createMockTextarea();
      container.appendChild(textarea);

      recorder.startTrial("focus_trial", textarea);

      // Simulate focus changes
      simulateFocusBlur(textarea);
      simulateFocusBlur(textarea);
      simulateFocusBlur(textarea);

      const trial = recorder.endTrial();

      // Verify focus events were captured
      expect(trial.behavioral?.focus?.length ?? 0).toBeGreaterThan(0);
    });

    it("handles multiple input elements in complex trials", async () => {
      container.innerHTML = `
        <div class="survey-form">
          <textarea id="response-1" class="response"></textarea>
          <textarea id="response-2" class="response"></textarea>
        </div>
      `;

      const recorder = new SlopitRecorder();
      const textarea1 = container.querySelector("#response-1") as HTMLTextAreaElement;

      // Start trial on first textarea
      recorder.startTrial("multi_input", textarea1);

      await simulateTyping(textarea1, "First response");

      // Detach and reattach to second textarea
      recorder.detachCapture();
      const textarea2 = container.querySelector("#response-2") as HTMLTextAreaElement;
      recorder.attachCapture(textarea2);

      await simulateTyping(textarea2, "Second");

      const trial = recorder.endTrial("Combined response");

      expect(trial.behavioral).toBeDefined();
      expect(trial.behavioral?.keystrokes?.length ?? 0).toBeGreaterThan(0);
    });
  });

  describe("session export and storage", () => {
    it("exports valid JSON via storeSession", async () => {
      const recorder = new SlopitRecorder({
        participantId: "TEST_P",
        studyId: "test-study",
      });
      const textarea = createMockTextarea();
      container.appendChild(textarea);

      recorder.startTrial("export_trial", textarea);
      await simulateTyping(textarea, "Test");
      recorder.endTrial("Test");

      recorder.storeSession("my_data");

      const storedJson = mockGorilla._metrics.get("my_data");
      expect(storedJson).toBeDefined();

      const parsed = JSON.parse(storedJson as string);
      expect(parsed.participantId).toBe("TEST_P");
      expect(parsed.studyId).toBe("test-study");
      expect(parsed.trials).toHaveLength(1);
      expect(parsed.platform.name).toBe("Gorilla");
    });

    it("stores session object via saveToStore", async () => {
      const recorder = new SlopitRecorder();
      const textarea = createMockTextarea();
      container.appendChild(textarea);

      recorder.startTrial("store_trial", textarea);
      await simulateTyping(textarea, "Store test");
      recorder.endTrial("Store test");

      recorder.saveToStore("session_backup");

      const stored = mockGorilla._stored.get("session_backup");
      expect(stored).toBeDefined();
      expect((stored as { trials: unknown[] }).trials).toHaveLength(1);
    });
  });

  describe("error handling", () => {
    it("operates without gorilla module present", async () => {
      delete window.gorilla;

      const recorder = new SlopitRecorder({ autoStore: true });
      const textarea = createMockTextarea();
      container.appendChild(textarea);

      recorder.startTrial("no_gorilla", textarea);
      await simulateTyping(textarea, "Test");
      const trial = recorder.endTrial("Test");

      expect(trial.trialId).toBe("no_gorilla");

      // These should not throw
      recorder.storeSession();
      recorder.saveToStore();
    });

    it("handles rapid trial switching", async () => {
      const recorder = new SlopitRecorder();

      for (let i = 0; i < 5; i++) {
        const textarea = createMockTextarea();
        container.appendChild(textarea);

        recorder.startTrial(`rapid_${i}`, textarea);
        await simulateTyping(textarea, "Quick");
        recorder.endTrial("Quick");

        container.innerHTML = "";
      }

      const session = recorder.exportSession();
      expect(session.trials).toHaveLength(5);
    });
  });

  describe("gorilla.ready integration", () => {
    it("works within gorilla.ready callback", async () => {
      let recorder: SlopitRecorder | null = null;

      mockGorilla.ready(() => {
        recorder = new SlopitRecorder();
        const textarea = createMockTextarea();
        container.appendChild(textarea);

        recorder.startTrial("ready_trial", textarea);
      });

      expect(recorder).not.toBeNull();
      expect(recorder?.isTrialInProgress()).toBe(true);
    });
  });
});
