/**
 * Integration tests for the PCIbex adapter.
 */

import {
  createMockInput,
  createMockTextarea,
  delay,
  simulateFocusBlur,
  simulatePaste,
  simulateTyping,
} from "@slopit/adapter-shared";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  PCIbexRecorder,
  clearSlopitElements,
  createPCIbexRecorder,
  getAllSlopitData,
  getSlopit,
  newSlopit,
} from "../index.js";
import type { PennElement } from "../types.js";

/**
 * Create a mock PennController element wrapping a DOM element.
 */
function createMockPennElement(element: HTMLElement): PennElement {
  return {
    _element: element,
    jQueryElement: {
      get: (index: number) => (index === 0 ? element : undefined),
      length: 1,
    },
  };
}

describe("PCIbex adapter integration", () => {
  beforeEach(() => {
    clearSlopitElements();
  });

  afterEach(() => {
    clearSlopitElements();
  });

  it("should capture a complete text entry interaction", async () => {
    const textarea = createMockTextarea();
    document.body.appendChild(textarea);

    const pennElement = createMockPennElement(textarea);

    // Simulate PCIbex trial setup
    newSlopit("response").attach(pennElement).keystroke(true).paste(true).focus(true);

    // Simulate user interaction
    textarea.focus();
    await simulateTyping(textarea, "This is my response");
    await delay(50);

    // Simulate focus loss and return
    simulateFocusBlur(textarea);
    await delay(50);

    // End of trial
    getSlopit("response")?.log();

    const data = getAllSlopitData();
    expect(data.response).not.toBeNull();

    // Verify keystroke capture
    expect(data.response?.behavioral.keystrokes.length).toBeGreaterThan(0);

    // Verify focus capture
    expect(data.response?.behavioral.focus.length).toBeGreaterThan(0);

    // Verify metrics were computed
    expect(data.response?.behavioral.metrics).toBeDefined();

    document.body.removeChild(textarea);
  });

  it("should capture paste events with text preview", async () => {
    const input = createMockInput();
    document.body.appendChild(input);

    const pennElement = createMockPennElement(input);

    newSlopit("paste-test").attach(pennElement).keystroke(true).paste(true, true);

    input.focus();
    await simulateTyping(input, "Start: ");
    simulatePaste(input, "pasted content here");
    await simulateTyping(input, " End");
    await delay(50);

    getSlopit("paste-test")?.log();

    const data = getAllSlopitData();
    expect(data["paste-test"]?.behavioral.paste.length).toBeGreaterThan(0);

    // Verify paste event has text length
    const pasteEvent = data["paste-test"]?.behavioral.paste[0];
    expect(pasteEvent?.textLength).toBeGreaterThan(0);

    document.body.removeChild(input);
  });

  it("should work with multiple elements in the same trial", async () => {
    const input1 = createMockInput();
    const input2 = createMockInput();
    document.body.appendChild(input1);
    document.body.appendChild(input2);

    const penn1 = createMockPennElement(input1);
    const penn2 = createMockPennElement(input2);

    newSlopit("field1").attach(penn1).keystroke(true);
    newSlopit("field2").attach(penn2).keystroke(true);

    input1.focus();
    await simulateTyping(input1, "First field");
    await delay(50);

    input2.focus();
    await simulateTyping(input2, "Second field");
    await delay(50);

    getSlopit("field1")?.log();
    getSlopit("field2")?.log();

    const data = getAllSlopitData();
    expect(data.field1?.behavioral.keystrokes.length).toBeGreaterThan(0);
    expect(data.field2?.behavioral.keystrokes.length).toBeGreaterThan(0);

    document.body.removeChild(input1);
    document.body.removeChild(input2);
  });
});

describe("PCIbexRecorder", () => {
  it("should create a recorder with default options", () => {
    const recorder = new PCIbexRecorder();
    expect(recorder).toBeDefined();
    expect(recorder.getSessionId()).toBeDefined();
  });

  it("should create a recorder with config", () => {
    const recorder = new PCIbexRecorder({
      participantId: "P001",
      studyId: "study-123",
    });

    expect(recorder.getSessionId()).toBeDefined();
  });

  it("should manage trial lifecycle", () => {
    const textarea = createMockTextarea();
    document.body.appendChild(textarea);

    const recorder = new PCIbexRecorder({
      participantId: "P001",
    });

    recorder.startTrial({
      trialType: "text-entry",
      targetElement: textarea,
    });

    expect(recorder.isTrialInProgress()).toBe(true);
    expect(recorder.getCurrentTrial()).not.toBeNull();

    const completedTrial = recorder.endTrial({
      type: "text",
      value: "Test response",
      characterCount: 13,
      wordCount: 2,
    });

    expect(recorder.isTrialInProgress()).toBe(false);
    expect(completedTrial.trialType).toBe("text-entry");
    expect(completedTrial.response?.type).toBe("text");

    document.body.removeChild(textarea);
  });

  it("should export session in SlopitSession format", async () => {
    const textarea = createMockTextarea();
    document.body.appendChild(textarea);

    const recorder = new PCIbexRecorder({
      participantId: "P001",
      studyId: "pcibex-study",
    });

    recorder.startTrial({
      trialType: "survey-text",
      targetElement: textarea,
    });

    textarea.focus();
    await simulateTyping(textarea, "My response");
    await delay(50);

    recorder.endTrial({
      type: "text",
      value: "My response",
      characterCount: 11,
      wordCount: 2,
    });

    const session = recorder.exportSession();

    expect(session.schemaVersion).toBeDefined();
    expect(session.sessionId).toBe(recorder.getSessionId());
    expect(session.platform.name).toBe("PCIbex");
    expect(session.platform.adapterVersion).toBe("0.1.0");
    expect(session.participantId).toBe("P001");
    expect(session.studyId).toBe("pcibex-study");
    expect(session.trials).toHaveLength(1);
    expect(session.trials[0]?.trialType).toBe("survey-text");

    document.body.removeChild(textarea);
  });

  it("should throw when starting a trial while one is in progress", () => {
    const recorder = new PCIbexRecorder();

    recorder.startTrial({ trialType: "first" });

    expect(() => {
      recorder.startTrial({ trialType: "second" });
    }).toThrow("A trial is already in progress");

    // Clean up
    recorder.endTrial();
  });

  it("should throw when ending a trial when none is in progress", () => {
    const recorder = new PCIbexRecorder();

    expect(() => {
      recorder.endTrial();
    }).toThrow("No trial in progress");
  });

  it("should reset and allow starting fresh", () => {
    const recorder = new PCIbexRecorder();
    const firstSessionId = recorder.getSessionId();

    recorder.startTrial({ trialType: "test" });
    recorder.endTrial();

    expect(recorder.getTrials()).toHaveLength(1);

    recorder.reset();

    expect(recorder.getSessionId()).not.toBe(firstSessionId);
    expect(recorder.getTrials()).toHaveLength(0);
    expect(recorder.isTrialInProgress()).toBe(false);
  });
});

describe("createPCIbexRecorder", () => {
  it("should create a PCIbexRecorder instance", () => {
    const recorder = createPCIbexRecorder({
      participantId: "P002",
      studyId: "factory-study",
    });

    expect(recorder).toBeInstanceOf(PCIbexRecorder);
    expect(recorder.getSessionId()).toBeDefined();
  });

  it("should create a recorder without config", () => {
    const recorder = createPCIbexRecorder();
    expect(recorder).toBeInstanceOf(PCIbexRecorder);
  });
});

describe("Element-based and Recorder-based API compatibility", () => {
  beforeEach(() => {
    clearSlopitElements();
  });

  afterEach(() => {
    clearSlopitElements();
  });

  it("should work together in the same experiment", async () => {
    const textarea = createMockTextarea();
    document.body.appendChild(textarea);

    // Use recorder for session management
    const recorder = new PCIbexRecorder({
      participantId: "P003",
      studyId: "combined-study",
    });

    // Use element API for capture
    const pennElement = createMockPennElement(textarea);
    newSlopit("input").attach(pennElement).keystroke(true).paste(true);

    // Start trial with recorder (without auto-attaching capture)
    recorder.startTrial({ trialType: "combined" });

    // User interaction
    textarea.focus();
    await simulateTyping(textarea, "Combined approach");
    await delay(50);

    // Get element data
    getSlopit("input")?.log();
    const elementData = getAllSlopitData();

    // End trial with recorder
    recorder.endTrial({
      type: "text",
      value: "Combined approach",
    });

    // Both should have captured data
    expect(elementData.input?.behavioral.keystrokes.length).toBeGreaterThan(0);

    const session = recorder.exportSession();
    expect(session.trials).toHaveLength(1);

    document.body.removeChild(textarea);
  });
});
