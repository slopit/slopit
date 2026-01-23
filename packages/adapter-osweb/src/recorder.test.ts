/**
 * Unit tests for OSWebRecorder.
 *
 * @module
 */

import {
  createMockTextarea,
  delay,
  simulateKeystroke,
  simulatePaste,
} from "@slopit/adapter-shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { OSWebRecorder, SlopitRecorder } from "./recorder.js";
import type { OSWebVars } from "./types.js";

describe("SlopitRecorder", () => {
  let recorder: SlopitRecorder;
  let textarea: HTMLTextAreaElement;

  beforeEach(() => {
    textarea = createMockTextarea("test-input");
    document.body.appendChild(textarea);
    vi.spyOn(performance, "now").mockReturnValue(0);
  });

  afterEach(() => {
    textarea.remove();
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("should create instance without config", () => {
      recorder = new SlopitRecorder();
      expect(recorder).toBeInstanceOf(SlopitRecorder);
    });

    it("should accept participantId from config", () => {
      recorder = new SlopitRecorder({ participantId: "P001" });
      const session = recorder.exportSession();
      expect(session.participantId).toBe("P001");
    });

    it("should extract participantId from vars object", () => {
      const vars: OSWebVars = { subject_nr: 42 };
      recorder = new SlopitRecorder({ varsObject: vars });
      const session = recorder.exportSession();
      expect(session.participantId).toBe("42");
    });

    it("should prefer explicit participantId over vars.subject_nr", () => {
      const vars: OSWebVars = { subject_nr: 42 };
      recorder = new SlopitRecorder({
        varsObject: vars,
        participantId: "explicit-id",
      });
      const session = recorder.exportSession();
      expect(session.participantId).toBe("explicit-id");
    });

    it("should accept studyId from config", () => {
      recorder = new SlopitRecorder({ studyId: "study-123" });
      const session = recorder.exportSession();
      expect(session.studyId).toBe("study-123");
    });
  });

  describe("platform info", () => {
    it("should report platform as osweb", () => {
      recorder = new SlopitRecorder();
      const session = recorder.exportSession();
      expect(session.platform.name).toBe("osweb");
    });

    it("should report adapter version", () => {
      recorder = new SlopitRecorder();
      const session = recorder.exportSession();
      expect(session.platform.adapterVersion).toBe("0.1.0");
    });

    it("should detect OSWeb version from window.osweb", () => {
      (window as Record<string, unknown>)["osweb"] = { version: "2.0.0" };
      recorder = new SlopitRecorder();
      const session = recorder.exportSession();
      expect(session.platform.version).toBe("2.0.0");
      delete (window as Record<string, unknown>)["osweb"];
    });

    it("should report unknown version when not detectable", () => {
      recorder = new SlopitRecorder();
      const session = recorder.exportSession();
      expect(session.platform.version).toBe("unknown");
    });
  });

  describe("prepareCapture", () => {
    it("should prepare for trial capture", () => {
      recorder = new SlopitRecorder();
      expect(() => recorder.prepareCapture()).not.toThrow();
    });

    it("should reset lastTrialData", () => {
      recorder = new SlopitRecorder();
      recorder.prepareCapture();
      recorder.startTrial("test-1", textarea);
      recorder.endTrial("response");

      expect(recorder.getTrialData()).not.toBeNull();

      recorder.prepareCapture();
      expect(recorder.getTrialData()).toBeNull();
    });
  });

  describe("attachWhenReady", () => {
    it("should reject when prepareCapture not called", async () => {
      recorder = new SlopitRecorder();

      await expect(recorder.attachWhenReady("textarea")).rejects.toThrow(
        "Call prepareCapture() before attachWhenReady()",
      );
    });

    it("should attach to existing element immediately", async () => {
      recorder = new SlopitRecorder();
      recorder.prepareCapture();

      await recorder.attachWhenReady("textarea");

      expect(recorder.isTrialInProgress()).toBe(true);
    });

    it("should wait for dynamically created element", async () => {
      const dynamicId = "dynamic-textarea";
      recorder = new SlopitRecorder();
      recorder.prepareCapture();

      const attachPromise = recorder.attachWhenReady(`#${dynamicId}`, 500);

      // Create element after a delay
      await delay(50);
      const dynamic = createMockTextarea(dynamicId);
      document.body.appendChild(dynamic);

      await attachPromise;

      expect(recorder.isTrialInProgress()).toBe(true);

      recorder.endTrial("test");
      dynamic.remove();
    });

    it("should reject on timeout when element not found", async () => {
      recorder = new SlopitRecorder();
      recorder.prepareCapture();

      await expect(recorder.attachWhenReady("#nonexistent", 100)).rejects.toThrow(
        'Element "#nonexistent" not found within 100ms',
      );
    });

    it("should capture keystrokes after attachment", async () => {
      recorder = new SlopitRecorder();
      recorder.prepareCapture();
      await recorder.attachWhenReady("textarea");

      vi.spyOn(performance, "now").mockReturnValue(100);
      simulateKeystroke(textarea, "a", { code: "KeyA" });

      vi.spyOn(performance, "now").mockReturnValue(200);
      simulateKeystroke(textarea, "b", { code: "KeyB" });

      recorder.endTrial("ab");

      const data = recorder.getTrialData();
      expect(data).not.toBeNull();
      expect(data?.behavioral.keystrokes.length).toBeGreaterThan(0);
    });
  });

  describe("startTrial", () => {
    it("should start trial with custom trialId", () => {
      recorder = new SlopitRecorder();
      recorder.startTrial("custom-trial-1", textarea);

      expect(recorder.isTrialInProgress()).toBe(true);
      expect(recorder.getCurrentTrial()?.trialId).toBe("custom-trial-1");
    });

    it("should attach to provided element", () => {
      recorder = new SlopitRecorder();
      recorder.startTrial("trial-1", textarea);

      vi.spyOn(performance, "now").mockReturnValue(100);
      simulateKeystroke(textarea, "x", { code: "KeyX" });

      const trial = recorder.endTrial("x");
      expect(trial.behavioral?.keystrokes.length).toBeGreaterThan(0);
    });

    it("should accept additional trial config", () => {
      recorder = new SlopitRecorder();
      recorder.startTrial("trial-1", textarea, { trialType: "text-entry" });

      expect(recorder.getCurrentTrial()?.trialType).toBe("text-entry");

      recorder.endTrial("test");
    });
  });

  describe("endTrial", () => {
    it("should convert string response to ResponseInfo", () => {
      recorder = new SlopitRecorder();
      recorder.startTrial("trial-1", textarea);

      const trial = recorder.endTrial("Hello world");

      expect(trial.response).toBeDefined();
      expect(trial.response?.type).toBe("text");
      expect(trial.response?.value).toBe("Hello world");
      expect(trial.response?.characterCount).toBe(11);
      expect(trial.response?.wordCount).toBe(2);
    });

    it("should handle empty string response", () => {
      recorder = new SlopitRecorder();
      recorder.startTrial("trial-1", textarea);

      const trial = recorder.endTrial("");

      expect(trial.response?.characterCount).toBe(0);
      expect(trial.response?.wordCount).toBe(0);
    });

    it("should accept ResponseInfo object directly", () => {
      recorder = new SlopitRecorder();
      recorder.startTrial("trial-1", textarea);

      const trial = recorder.endTrial({
        type: "text",
        value: "Custom",
        characterCount: 6,
        wordCount: 1,
      });

      expect(trial.response?.value).toBe("Custom");
    });

    it("should store lastTrialData", () => {
      recorder = new SlopitRecorder();
      recorder.startTrial("trial-1", textarea);

      vi.spyOn(performance, "now").mockReturnValue(100);
      simulateKeystroke(textarea, "a", { code: "KeyA" });

      recorder.endTrial("a");

      const data = recorder.getTrialData();
      expect(data).not.toBeNull();
      expect(data?.behavioral).toBeDefined();
      expect(data?.flags).toBeDefined();
    });

    it("should reset prepared state", () => {
      recorder = new SlopitRecorder();
      recorder.prepareCapture();
      recorder.startTrial("trial-1", textarea);
      recorder.endTrial("test");

      // Should require prepareCapture again
      expect(recorder.getTrialData()).not.toBeNull();
    });

    it("should cleanup discovery observer", async () => {
      recorder = new SlopitRecorder();
      recorder.prepareCapture();
      await recorder.attachWhenReady("textarea");

      // End trial should cleanup without errors
      expect(() => recorder.endTrial("test")).not.toThrow();
    });
  });

  describe("getTrialData", () => {
    it("should return null before any trial", () => {
      recorder = new SlopitRecorder();
      expect(recorder.getTrialData()).toBeNull();
    });

    it("should return data after trial completion", () => {
      recorder = new SlopitRecorder();
      recorder.startTrial("trial-1", textarea);
      recorder.endTrial("response");

      const data = recorder.getTrialData();
      expect(data).not.toBeNull();
      expect(data?.behavioral).toBeDefined();
      expect(data?.flags).toBeDefined();
      expect(Array.isArray(data?.flags)).toBe(true);
    });

    it("should return most recent trial data", () => {
      recorder = new SlopitRecorder();

      recorder.startTrial("trial-1", textarea);
      simulateKeystroke(textarea, "a", { code: "KeyA" });
      recorder.endTrial("a");

      recorder.startTrial("trial-2", textarea);
      simulateKeystroke(textarea, "b", { code: "KeyB" });
      simulateKeystroke(textarea, "c", { code: "KeyC" });
      recorder.endTrial("bc");

      const data = recorder.getTrialData();
      expect(data?.behavioral.keystrokes.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("getTrialDataJSON", () => {
    it("should return valid JSON string", () => {
      recorder = new SlopitRecorder();
      recorder.startTrial("trial-1", textarea);
      recorder.endTrial("test");

      const json = recorder.getTrialDataJSON();
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it("should return 'null' when no trial data", () => {
      recorder = new SlopitRecorder();
      expect(recorder.getTrialDataJSON()).toBe("null");
    });

    it("should serialize trial data correctly", () => {
      recorder = new SlopitRecorder();
      recorder.startTrial("trial-1", textarea);

      vi.spyOn(performance, "now").mockReturnValue(100);
      simulateKeystroke(textarea, "x", { code: "KeyX" });

      recorder.endTrial("x");

      const json = recorder.getTrialDataJSON();
      const parsed = JSON.parse(json);

      expect(parsed.behavioral).toBeDefined();
      expect(parsed.flags).toBeDefined();
    });
  });

  describe("storeInVars", () => {
    it("should store session data in vars object", () => {
      const vars: OSWebVars = { subject_nr: 1 };
      recorder = new SlopitRecorder({ varsObject: vars });

      recorder.startTrial("trial-1", textarea);
      recorder.endTrial("response");
      recorder.storeInVars();

      expect(vars["slopit_session"]).toBeDefined();
      expect(typeof vars["slopit_session"]).toBe("string");
    });

    it("should use custom key name", () => {
      const vars: OSWebVars = { subject_nr: 1 };
      recorder = new SlopitRecorder({ varsObject: vars });

      recorder.startTrial("trial-1", textarea);
      recorder.endTrial("response");
      recorder.storeInVars("my_custom_key");

      expect(vars["my_custom_key"]).toBeDefined();
      expect(vars["slopit_session"]).toBeUndefined();
    });

    it("should not throw when no vars object", () => {
      recorder = new SlopitRecorder();
      recorder.startTrial("trial-1", textarea);
      recorder.endTrial("response");

      expect(() => recorder.storeInVars()).not.toThrow();
    });

    it("should store valid JSON", () => {
      const vars: OSWebVars = { subject_nr: 1 };
      recorder = new SlopitRecorder({ varsObject: vars });

      recorder.startTrial("trial-1", textarea);
      recorder.endTrial("response");
      recorder.storeInVars();

      const stored = vars["slopit_session"] as string;
      expect(() => JSON.parse(stored)).not.toThrow();
    });
  });

  describe("exportSessionJSON", () => {
    it("should return valid session JSON", () => {
      recorder = new SlopitRecorder({ participantId: "P001" });
      recorder.startTrial("trial-1", textarea);
      recorder.endTrial("test");

      const json = recorder.exportSessionJSON();
      const session = JSON.parse(json);

      expect(session.schemaVersion).toBeDefined();
      expect(session.sessionId).toBeDefined();
      expect(session.participantId).toBe("P001");
      expect(session.platform.name).toBe("osweb");
      expect(session.trials).toHaveLength(1);
    });
  });

  describe("session export", () => {
    it("should include all trials", () => {
      recorder = new SlopitRecorder();

      recorder.startTrial("trial-1", textarea);
      recorder.endTrial("first");

      recorder.startTrial("trial-2", textarea);
      recorder.endTrial("second");

      recorder.startTrial("trial-3", textarea);
      recorder.endTrial("third");

      const session = recorder.exportSession();
      expect(session.trials).toHaveLength(3);
    });

    it("should include behavioral data in trials", () => {
      recorder = new SlopitRecorder();
      recorder.startTrial("trial-1", textarea);

      vi.spyOn(performance, "now").mockReturnValue(100);
      simulateKeystroke(textarea, "h", { code: "KeyH" });
      vi.spyOn(performance, "now").mockReturnValue(200);
      simulateKeystroke(textarea, "i", { code: "KeyI" });

      recorder.endTrial("hi");

      const session = recorder.exportSession();
      const trial = session.trials[0];

      expect(trial?.behavioral).toBeDefined();
      expect(trial?.behavioral?.keystrokes?.length).toBeGreaterThan(0);
    });
  });

  describe("paste event capture", () => {
    it("should capture paste events", () => {
      recorder = new SlopitRecorder();
      recorder.startTrial("trial-1", textarea);

      simulatePaste(textarea, "Pasted content");

      const trial = recorder.endTrial("Pasted content");

      expect(trial.behavioral?.paste.length).toBe(1);
    });
  });
});

describe("OSWebRecorder alias", () => {
  it("should be same as SlopitRecorder", () => {
    expect(OSWebRecorder).toBe(SlopitRecorder);
  });

  it("should work identically", () => {
    const recorder = new OSWebRecorder({ participantId: "P001" });
    const session = recorder.exportSession();
    expect(session.platform.name).toBe("osweb");
  });
});
