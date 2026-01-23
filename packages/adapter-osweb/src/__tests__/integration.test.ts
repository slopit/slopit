/**
 * Integration tests for @slopit/adapter-osweb.
 *
 * These tests simulate the OSWeb environment and verify the complete
 * workflow of behavioral capture in an OpenSesame experiment.
 *
 * @module
 */

import {
  createMockTextarea,
  delay,
  simulateFocusBlur,
  simulateKeystroke,
  simulatePaste,
  simulateTyping,
} from "@slopit/adapter-shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SlopitRecorder } from "../recorder.js";
import type { OSWebVars } from "../types.js";

/**
 * Simulates an OSWeb inline_javascript item context.
 */
interface OSWebContext {
  vars: OSWebVars;
  element: HTMLTextAreaElement | null;
}

/**
 * Creates a mock OSWeb context.
 */
function createOSWebContext(subjectNr = 1): OSWebContext {
  return {
    vars: {
      subject_nr: subjectNr,
      subject_parity: subjectNr % 2 === 0 ? "even" : "odd",
    },
    element: null,
  };
}

describe("OSWeb Integration Tests", () => {
  let context: OSWebContext;
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    container.id = "osweb-container";
    document.body.appendChild(container);
    context = createOSWebContext(42);
    vi.spyOn(performance, "now").mockReturnValue(0);
  });

  afterEach(() => {
    container.remove();
    vi.restoreAllMocks();
  });

  describe("prepare/attach workflow", () => {
    it("should complete full trial workflow", async () => {
      // Simulate inline_javascript prepare phase
      const slopit = new SlopitRecorder({ varsObject: context.vars });
      slopit.prepareCapture();

      // Simulate trial rendering
      const textarea = createMockTextarea("response-input");
      container.appendChild(textarea);

      // Simulate inline_javascript run phase
      await slopit.attachWhenReady("#response-input");

      // Simulate participant typing
      vi.spyOn(performance, "now").mockReturnValue(100);
      simulateKeystroke(textarea, "H", { code: "KeyH", modifiers: { shift: true } });
      vi.spyOn(performance, "now").mockReturnValue(200);
      simulateKeystroke(textarea, "e", { code: "KeyE" });
      vi.spyOn(performance, "now").mockReturnValue(300);
      simulateKeystroke(textarea, "l", { code: "KeyL" });
      vi.spyOn(performance, "now").mockReturnValue(400);
      simulateKeystroke(textarea, "l", { code: "KeyL" });
      vi.spyOn(performance, "now").mockReturnValue(500);
      simulateKeystroke(textarea, "o", { code: "KeyO" });

      // End trial and store data
      slopit.endTrial("Hello");
      context.vars["slopit_data"] = slopit.getTrialDataJSON();

      // Verify data was captured (5 keystrokes * 2 events each = 10 events)
      const storedData = JSON.parse(context.vars["slopit_data"] as string);
      expect(storedData.behavioral.keystrokes.length).toBeGreaterThanOrEqual(5);
    });

    it("should handle multiple trials in sequence", async () => {
      const slopit = new SlopitRecorder({ varsObject: context.vars });

      // Trial 1
      slopit.prepareCapture();
      const textarea1 = createMockTextarea("input-1");
      container.appendChild(textarea1);
      await slopit.attachWhenReady("#input-1");

      vi.spyOn(performance, "now").mockReturnValue(100);
      simulateKeystroke(textarea1, "a", { code: "KeyA" });

      slopit.endTrial("a");
      context.vars["trial_1_data"] = slopit.getTrialDataJSON();

      // Clear container
      container.innerHTML = "";

      // Trial 2
      slopit.prepareCapture();
      const textarea2 = createMockTextarea("input-2");
      container.appendChild(textarea2);
      await slopit.attachWhenReady("#input-2");

      vi.spyOn(performance, "now").mockReturnValue(200);
      simulateKeystroke(textarea2, "b", { code: "KeyB" });
      vi.spyOn(performance, "now").mockReturnValue(300);
      simulateKeystroke(textarea2, "c", { code: "KeyC" });

      slopit.endTrial("bc");
      context.vars["trial_2_data"] = slopit.getTrialDataJSON();

      // Verify both trials captured correctly
      const trial1 = JSON.parse(context.vars["trial_1_data"] as string);
      const trial2 = JSON.parse(context.vars["trial_2_data"] as string);

      // Trial 1 had 1 keystroke, Trial 2 had 2 keystrokes (counts include keyup events)
      expect(trial1.behavioral.keystrokes.length).toBeGreaterThanOrEqual(1);
      expect(trial2.behavioral.keystrokes.length).toBeGreaterThan(
        trial1.behavioral.keystrokes.length,
      );

      // Verify session contains both trials
      const session = slopit.exportSession();
      expect(session.trials).toHaveLength(2);
    });

    it("should wait for dynamically created elements", async () => {
      const slopit = new SlopitRecorder({ varsObject: context.vars });
      slopit.prepareCapture();

      // Element doesn't exist yet
      const attachPromise = slopit.attachWhenReady("#delayed-input", 1000);

      // Simulate delayed element creation (like OSWeb form rendering)
      await delay(50);
      const textarea = createMockTextarea("delayed-input");
      container.appendChild(textarea);

      await attachPromise;

      vi.spyOn(performance, "now").mockReturnValue(100);
      simulateKeystroke(textarea, "x", { code: "KeyX" });

      slopit.endTrial("x");

      const data = slopit.getTrialData();
      expect(data?.behavioral.keystrokes.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("session management", () => {
    it("should export complete session at end of experiment", async () => {
      const slopit = new SlopitRecorder({
        varsObject: context.vars,
        studyId: "integration-test",
      });

      // Run several trials
      for (let i = 0; i < 3; i++) {
        container.innerHTML = "";
        slopit.prepareCapture();
        const textarea = createMockTextarea(`input-${i}`);
        container.appendChild(textarea);
        await slopit.attachWhenReady(`#input-${i}`);

        vi.spyOn(performance, "now").mockReturnValue((i + 1) * 100);
        simulateKeystroke(textarea, String.fromCharCode(97 + i), {
          code: `Key${String.fromCharCode(65 + i)}`,
        });

        slopit.endTrial(String.fromCharCode(97 + i));
      }

      // Store session at end
      slopit.storeInVars("final_session");

      const session = JSON.parse(context.vars["final_session"] as string);
      expect(session.schemaVersion).toBeDefined();
      expect(session.participantId).toBe("42");
      expect(session.studyId).toBe("integration-test");
      expect(session.platform.name).toBe("osweb");
      expect(session.trials).toHaveLength(3);
    });

    it("should handle session reset", async () => {
      const slopit = new SlopitRecorder({ varsObject: context.vars });

      // First session
      slopit.prepareCapture();
      const textarea = createMockTextarea("input");
      container.appendChild(textarea);
      await slopit.attachWhenReady("#input");
      slopit.endTrial("test");

      const firstSessionId = slopit.getSessionId();

      // Reset
      slopit.reset();

      // Second session
      slopit.prepareCapture();
      await slopit.attachWhenReady("#input");
      slopit.endTrial("test2");

      const secondSessionId = slopit.getSessionId();

      expect(firstSessionId).not.toBe(secondSessionId);
      expect(slopit.getTrials()).toHaveLength(1);
    });
  });

  describe("behavioral capture", () => {
    it("should capture paste events", async () => {
      const slopit = new SlopitRecorder({ varsObject: context.vars });
      slopit.prepareCapture();

      const textarea = createMockTextarea("paste-input");
      container.appendChild(textarea);
      await slopit.attachWhenReady("#paste-input");

      simulatePaste(textarea, "Pasted from ChatGPT");

      slopit.endTrial("Pasted from ChatGPT");

      const data = slopit.getTrialData();
      expect(data?.behavioral.paste.length).toBe(1);
    });

    it("should capture focus and blur events", async () => {
      const slopit = new SlopitRecorder({ varsObject: context.vars });
      slopit.prepareCapture();

      const textarea = createMockTextarea("focus-input");
      container.appendChild(textarea);
      await slopit.attachWhenReady("#focus-input");

      simulateFocusBlur(textarea);

      vi.spyOn(performance, "now").mockReturnValue(100);
      simulateKeystroke(textarea, "a", { code: "KeyA" });

      slopit.endTrial("a");

      const data = slopit.getTrialData();
      expect(data?.behavioral.focus.length).toBeGreaterThan(0);
    });

    it("should capture typing with realistic timing", async () => {
      const slopit = new SlopitRecorder({ varsObject: context.vars });
      slopit.prepareCapture();

      const textarea = createMockTextarea("typing-input");
      container.appendChild(textarea);
      await slopit.attachWhenReady("#typing-input");

      // Type with small delays
      await simulateTyping(textarea, "Test", 10);

      slopit.endTrial("Test");

      const data = slopit.getTrialData();
      expect(data?.behavioral.keystrokes.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe("error handling", () => {
    it("should reject attachWhenReady without prepareCapture", async () => {
      const slopit = new SlopitRecorder({ varsObject: context.vars });

      await expect(slopit.attachWhenReady("textarea")).rejects.toThrow(
        "Call prepareCapture() before attachWhenReady()",
      );
    });

    it("should timeout when element not found", async () => {
      const slopit = new SlopitRecorder({ varsObject: context.vars });
      slopit.prepareCapture();

      await expect(slopit.attachWhenReady("#nonexistent", 100)).rejects.toThrow(
        'Element "#nonexistent" not found within 100ms',
      );
    });

    it("should handle missing vars object gracefully", () => {
      const slopit = new SlopitRecorder();

      slopit.prepareCapture();
      const textarea = createMockTextarea();
      container.appendChild(textarea);
      slopit.startTrial("test", textarea);
      slopit.endTrial("test");

      // Should not throw when storing without vars
      expect(() => slopit.storeInVars()).not.toThrow();
    });
  });

  describe("response handling", () => {
    it("should compute word count correctly", async () => {
      const slopit = new SlopitRecorder({ varsObject: context.vars });
      slopit.prepareCapture();

      const textarea = createMockTextarea();
      container.appendChild(textarea);
      await slopit.attachWhenReady("textarea");

      const response = "The quick brown fox jumps over the lazy dog";
      const trial = slopit.endTrial(response);

      expect(trial.response?.wordCount).toBe(9);
      expect(trial.response?.characterCount).toBe(43);
    });

    it("should handle whitespace-only response", async () => {
      const slopit = new SlopitRecorder({ varsObject: context.vars });
      slopit.prepareCapture();

      const textarea = createMockTextarea();
      container.appendChild(textarea);
      await slopit.attachWhenReady("textarea");

      const trial = slopit.endTrial("   ");

      expect(trial.response?.wordCount).toBe(0);
      expect(trial.response?.characterCount).toBe(3);
    });

    it("should preserve response in session export", async () => {
      const slopit = new SlopitRecorder({ varsObject: context.vars });
      slopit.prepareCapture();

      const textarea = createMockTextarea();
      container.appendChild(textarea);
      await slopit.attachWhenReady("textarea");

      slopit.endTrial("My response text");

      const session = slopit.exportSession();
      const trial = session.trials[0];

      expect(trial?.response?.value).toBe("My response text");
    });
  });

  describe("OSWeb-specific features", () => {
    it("should detect OSWeb version when available", () => {
      (window as unknown as Record<string, unknown>)["osweb"] = { version: "2.1.0" };

      const slopit = new SlopitRecorder({ varsObject: context.vars });
      const session = slopit.exportSession();

      expect(session.platform.version).toBe("2.1.0");

      delete (window as unknown as Record<string, unknown>)["osweb"];
    });

    it("should use subject_nr as participant ID", () => {
      const vars: OSWebVars = { subject_nr: 123 };
      const slopit = new SlopitRecorder({ varsObject: vars });

      const session = slopit.exportSession();
      expect(session.participantId).toBe("123");
    });

    it("should store trial data in vars for logging", async () => {
      const slopit = new SlopitRecorder({ varsObject: context.vars });

      slopit.prepareCapture();
      const textarea = createMockTextarea();
      container.appendChild(textarea);
      await slopit.attachWhenReady("textarea");

      vi.spyOn(performance, "now").mockReturnValue(100);
      simulateKeystroke(textarea, "x", { code: "KeyX" });

      slopit.endTrial("x");

      // Store in vars as OSWeb would for logging
      context.vars["slopit_trial_data"] = slopit.getTrialDataJSON();
      context.vars["slopit_keystroke_count"] = slopit.getTrialData()?.behavioral.keystrokes.length;

      expect(context.vars["slopit_trial_data"]).toBeDefined();
      expect(context.vars["slopit_keystroke_count"] as number).toBeGreaterThanOrEqual(1);
    });
  });

  describe("real-world scenario", () => {
    it("should handle complete experiment flow", async () => {
      // Simulate experiment setup
      const vars: OSWebVars = {
        subject_nr: 42,
        subject_parity: "even",
        condition: "experimental",
      };

      const slopit = new SlopitRecorder({
        varsObject: vars,
        studyId: "my-study",
        metadata: { condition: vars["condition"] },
      });

      // Instructions trial (no behavioral capture)
      // ... would be handled by separate OSWeb item ...

      // Response trial 1
      container.innerHTML = '<textarea id="response1"></textarea>';
      slopit.prepareCapture();
      await slopit.attachWhenReady("#response1");

      const textarea1 = container.querySelector("textarea");
      if (!textarea1) throw new Error("textarea not found");

      vi.spyOn(performance, "now").mockReturnValue(1000);
      simulateKeystroke(textarea1, "T", {
        code: "KeyT",
        modifiers: { shift: true },
      });
      vi.spyOn(performance, "now").mockReturnValue(1100);
      simulateKeystroke(textarea1, "e", { code: "KeyE" });
      vi.spyOn(performance, "now").mockReturnValue(1200);
      simulateKeystroke(textarea1, "s", { code: "KeyS" });
      vi.spyOn(performance, "now").mockReturnValue(1300);
      simulateKeystroke(textarea1, "t", { code: "KeyT" });

      slopit.endTrial("Test");
      vars["response1_slopit"] = slopit.getTrialDataJSON();

      // Response trial 2 with paste
      container.innerHTML = '<textarea id="response2"></textarea>';
      slopit.prepareCapture();
      await slopit.attachWhenReady("#response2");

      const textarea2 = container.querySelector("textarea");
      if (!textarea2) throw new Error("textarea not found");
      simulatePaste(textarea2, "Copied from AI");

      slopit.endTrial("Copied from AI");
      vars["response2_slopit"] = slopit.getTrialDataJSON();

      // End of experiment
      slopit.storeInVars("slopit_session");

      // Verify complete data
      const session = JSON.parse(vars["slopit_session"] as string);

      expect(session.participantId).toBe("42");
      expect(session.studyId).toBe("my-study");
      expect(session.metadata?.condition).toBe("experimental");
      expect(session.trials).toHaveLength(2);

      // Trial 1 has keystrokes (4 keystrokes * 2 events each = 8 events)
      expect(session.trials[0].behavioral.keystrokes.length).toBeGreaterThanOrEqual(4);
      expect(session.trials[0].behavioral.paste.length).toBe(0);

      // Trial 2 has paste (no keystrokes)
      expect(session.trials[1].behavioral.keystrokes.length).toBe(0);
      expect(session.trials[1].behavioral.paste.length).toBe(1);
    });
  });
});
