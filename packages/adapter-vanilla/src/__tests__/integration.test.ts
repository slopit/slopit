/**
 * Integration tests for the vanilla adapter.
 *
 * Tests element discovery and end-to-end scenarios.
 */

import { createMockTextarea, delay, simulateFocus, simulateTyping } from "@slopit/adapter-shared";
import { isValidSession } from "@slopit/core";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { SlopitRecorder } from "../recorder.js";

describe("VanillaAdapter Integration", () => {
  let recorder: SlopitRecorder;
  let container: HTMLDivElement;

  beforeEach(() => {
    recorder = new SlopitRecorder({
      participantId: "test-participant",
      studyId: "integration-test",
    });
    container = document.createElement("div");
    container.id = "test-container";
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  describe("startTrialWithDiscovery", () => {
    it("should find element that already exists", async () => {
      const textarea = createMockTextarea("existing-input");
      container.appendChild(textarea);

      await recorder.startTrialWithDiscovery({ trialId: "trial_1" }, "#existing-input", container);

      expect(recorder.isTrialActive()).toBe(true);
      expect(recorder.getCurrentTrialId()).toBe("trial_1");
    });

    it("should wait for element to appear", async () => {
      // Start discovery before element exists
      const discoveryPromise = recorder.startTrialWithDiscovery(
        { trialId: "trial_1" },
        "#delayed-input",
        container,
        1000,
      );

      // Add element after a delay
      setTimeout(() => {
        const textarea = createMockTextarea("delayed-input");
        container.appendChild(textarea);
      }, 50);

      await discoveryPromise;

      expect(recorder.isTrialActive()).toBe(true);
      expect(recorder.getCurrentTrialId()).toBe("trial_1");
    });

    it("should reject when element not found within timeout", async () => {
      await expect(
        recorder.startTrialWithDiscovery({ trialId: "trial_1" }, "#nonexistent", container, 100),
      ).rejects.toThrow('Element "#nonexistent" not found within 100ms');

      // Trial should still be started (without capture element)
      expect(recorder.getTrialCount()).toBe(0);
    });

    it("should attach capture after discovery", async () => {
      // Start discovery
      const discoveryPromise = recorder.startTrialWithDiscovery(
        { trialId: "trial_1" },
        "#dynamic-input",
        container,
        500,
      );

      // Add element
      setTimeout(() => {
        const textarea = createMockTextarea("dynamic-input");
        container.appendChild(textarea);
      }, 30);

      await discoveryPromise;

      // Type in the discovered element
      const textarea = container.querySelector("#dynamic-input") as HTMLTextAreaElement;
      simulateFocus(textarea);
      await simulateTyping(textarea, "test", 10);
      await delay(10);

      const result = recorder.endTrial(textarea.value);

      expect(result.data.behavioral.keystrokes.length).toBeGreaterThan(0);
    });

    it("should use document as default container", async () => {
      const textarea = createMockTextarea("doc-level-input");
      document.body.appendChild(textarea);

      await recorder.startTrialWithDiscovery({ trialId: "trial_1" }, "#doc-level-input");

      expect(recorder.isTrialActive()).toBe(true);
    });

    it("should clean up discovery on endTrial", async () => {
      // Start discovery for element that will never appear
      const _discoveryPromise = recorder.startTrialWithDiscovery(
        { trialId: "trial_1" },
        "#never-appears",
        container,
        5000,
      );

      // Start a regular trial instead (should clean up discovery)
      recorder.startTrial({ trialId: "trial_override" });
      recorder.endTrial("response");

      // Original discovery should not have started the trial
      expect(recorder.getTrialCount()).toBe(1);
      expect(recorder.getTrials()[0]?.trialId).toBe("trial_override");
    });
  });

  describe("end-to-end session export", () => {
    it("should produce valid session data", async () => {
      const textarea = createMockTextarea("response-input");
      container.appendChild(textarea);

      // Complete a trial
      recorder.startTrial({
        trialId: "trial_1",
        trialType: "text-entry",
        targetElement: textarea,
        stimulus: "Please describe your experience.",
      });

      simulateFocus(textarea);
      await simulateTyping(textarea, "My experience was good.", 10);
      await delay(10);

      recorder.endTrial(textarea.value);

      // Export and validate
      const session = recorder.exportSession();

      expect(isValidSession(session)).toBe(true);
      expect(session.schemaVersion).toBe("1.0");
      expect(session.participantId).toBe("test-participant");
      expect(session.studyId).toBe("integration-test");
      expect(session.trials).toHaveLength(1);

      const trial = session.trials[0];
      expect(trial?.trialId).toBe("trial_1");
      expect(trial?.trialType).toBe("text-entry");
      expect(trial?.stimulus?.type).toBe("text");
      expect(trial?.stimulus?.content).toBe("Please describe your experience.");
      expect(trial?.behavioral?.keystrokes.length).toBeGreaterThan(0);
    });

    it("should handle session with multiple trial types", async () => {
      const textarea = createMockTextarea("text-input");
      container.appendChild(textarea);

      // Trial 1: text entry
      recorder.startTrial({
        trialId: "text_trial",
        trialType: "text-entry",
        targetElement: textarea,
      });
      simulateFocus(textarea);
      await simulateTyping(textarea, "text response", 5);
      await delay(5);
      recorder.endTrial(textarea.value);

      // Trial 2: choice (no behavioral capture)
      recorder.startTrial({
        trialId: "choice_trial",
        trialType: "multiple-choice",
      });
      recorder.endTrial({ type: "choice", value: "option_b" });

      // Trial 3: likert
      recorder.startTrial({
        trialId: "likert_trial",
        trialType: "likert-scale",
      });
      recorder.endTrial({ type: "likert", value: 4 });

      const session = recorder.exportSession();

      expect(session.trials).toHaveLength(3);
      expect(session.trials[0]?.trialType).toBe("text-entry");
      expect(session.trials[0]?.behavioral?.keystrokes.length).toBeGreaterThan(0);

      expect(session.trials[1]?.trialType).toBe("multiple-choice");
      expect(session.trials[1]?.response?.type).toBe("choice");

      expect(session.trials[2]?.trialType).toBe("likert-scale");
      expect(session.trials[2]?.response?.value).toBe(4);
    });

    it("should preserve timing information", async () => {
      recorder.startTrial({ trialId: "trial_1" });
      await delay(100);
      recorder.endTrial("response");

      const session = recorder.exportSession();
      const trial = session.trials[0];

      expect(trial?.startTime).toBeDefined();
      expect(trial?.endTime).toBeDefined();
      expect(trial?.endTime).toBeGreaterThan(trial?.startTime ?? 0);
      expect(trial?.rt ?? 0).toBeGreaterThanOrEqual(90);
    });

    it("should export valid JSON", async () => {
      recorder.startTrial({ trialId: "trial_1" });
      recorder.endTrial("response");

      const json = recorder.exportSessionJSON();
      const parsed = JSON.parse(json);

      expect(isValidSession(parsed)).toBe(true);
    });
  });

  describe("session management", () => {
    it("should maintain session ID across trials", () => {
      const sessionId = recorder.getSessionId();

      recorder.startTrial({ trialId: "trial_1" });
      recorder.endTrial("response 1");

      recorder.startTrial({ trialId: "trial_2" });
      recorder.endTrial("response 2");

      expect(recorder.getSessionId()).toBe(sessionId);

      const session = recorder.exportSession();
      expect(session.sessionId).toBe(sessionId);
    });

    it("should reset session completely", () => {
      recorder.startTrial({ trialId: "trial_1" });
      recorder.endTrial("response");

      const originalSessionId = recorder.getSessionId();

      recorder.resetSession();

      expect(recorder.getSessionId()).not.toBe(originalSessionId);
      expect(recorder.getTrialCount()).toBe(0);
      expect(recorder.isTrialActive()).toBe(false);
    });

    it("should allow new session after reset", () => {
      recorder.startTrial({ trialId: "trial_1" });
      recorder.endTrial("response");

      recorder.resetSession();

      recorder.startTrial({ trialId: "new_trial" });
      recorder.endTrial("new response");

      const session = recorder.exportSession();

      expect(session.trials).toHaveLength(1);
      expect(session.trials[0]?.trialId).toBe("new_trial");
      expect(session.trials[0]?.trialIndex).toBe(0);
    });
  });

  describe("error recovery", () => {
    it("should handle trial without target element", () => {
      recorder.startTrial({ trialId: "trial_1" });

      const result = recorder.endTrial("response");

      expect(result.trialId).toBe("trial_1");
      expect(result.data.behavioral.keystrokes).toHaveLength(0);
    });

    it("should recover after invalid operations", () => {
      // Try to end non-existent trial
      expect(() => recorder.endTrial("response")).toThrow();

      // Should still be able to start a trial
      recorder.startTrial({ trialId: "trial_1" });
      expect(recorder.isTrialActive()).toBe(true);

      const result = recorder.endTrial("response");
      expect(result.trialId).toBe("trial_1");
    });
  });

  describe("platform identification", () => {
    it("should use custom platform info", () => {
      const customRecorder = new SlopitRecorder({
        platformName: "my-experiment-framework",
        platformVersion: "3.2.1",
      });

      customRecorder.startTrial({ trialId: "trial_1" });
      customRecorder.endTrial("response");

      const session = customRecorder.exportSession();

      expect(session.platform.name).toBe("my-experiment-framework");
      expect(session.platform.version).toBe("3.2.1");
      expect(session.platform.adapterVersion).toBe("0.1.0");
    });
  });
});
