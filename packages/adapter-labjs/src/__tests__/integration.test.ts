/**
 * Integration tests for @slopit/adapter-labjs with real lab.js.
 *
 * These tests run lab.js components in a jsdom environment using the actual
 * lab.js library to verify real-world compatibility.
 *
 * @module
 */

import {
  MockClipboardEvent,
  MockDataTransfer,
  delay,
  simulateKeystroke,
} from "@slopit/adapter-shared";
import * as lab from "lab.js";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { LabjsRecorder, withSlopit } from "../index.js";
import type { LabjsComponentConstructor, LabjsSlopitConfig } from "../types.js";

/**
 * Waits for an element to appear in the DOM.
 */
async function waitForElement(selector: string, timeout = 2000): Promise<HTMLElement | null> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const element = document.querySelector<HTMLElement>(selector);
    if (element) return element;
    await delay(10);
  }
  return null;
}

/**
 * Simulates typing text into an element.
 * Note: simulateKeystroke fires both keydown and keyup events.
 */
async function simulateTyping(
  element: HTMLElement,
  text: string,
  options: { delayBetweenKeys?: number } = {},
): Promise<void> {
  const charDelay = options.delayBetweenKeys ?? 10;

  for (const char of text) {
    simulateKeystroke(element, char, { code: `Key${char.toUpperCase()}` });
    await delay(charDelay);
  }
}

/**
 * Simulates a paste event using shared test utilities.
 */
function simulatePasteEvent(element: HTMLElement, text: string): void {
  const clipboardData = new MockDataTransfer();
  clipboardData.setData("text/plain", text);
  const pasteEvent = new MockClipboardEvent("paste", {
    clipboardData,
    bubbles: true,
    cancelable: true,
  });
  element.dispatchEvent(pasteEvent);
}

/**
 * Simulates focus and blur events for testing focus transitions.
 */
function simulateFocusEvents(element: HTMLElement): void {
  element.dispatchEvent(new FocusEvent("focus", { bubbles: true }));
  element.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
  element.dispatchEvent(new FocusEvent("focus", { bubbles: true }));
}

describe("lab.js Integration Tests", () => {
  let displayElement: HTMLDivElement;

  beforeEach(() => {
    // Create the lab.js display element (where lab.js renders content)
    displayElement = document.createElement("div");
    displayElement.id = "labjs-display";
    document.body.appendChild(displayElement);
  });

  afterEach(() => {
    displayElement.remove();
    document.body.innerHTML = "";
  });

  describe("withSlopit mixin with real lab.js components", () => {
    it("should enhance lab.html.Screen with slopit capture", async () => {
      // Create enhanced Screen class
      const SlopitScreen = withSlopit(lab.html.Screen as unknown as LabjsComponentConstructor);

      const config: LabjsSlopitConfig = {
        keystroke: { enabled: true },
        targetSelector: "#test-textarea",
      };

      // lab.js will render this content, which includes our textarea
      const screen = new SlopitScreen({
        content: '<p>Type something:</p><textarea id="test-textarea"></textarea>',
        el: displayElement,
        slopit: config,
      });

      // Run the component
      const runPromise = screen.run();

      // Wait for lab.js to render the content and slopit to discover the element
      const textarea = await waitForElement("#test-textarea");
      expect(textarea).not.toBeNull();

      if (textarea) {
        await simulateTyping(textarea, "Hello", { delayBetweenKeys: 10 });
      }

      // End the component
      screen.end();
      await runPromise;

      // Verify slopit data was captured
      const slopitData = (screen as unknown as { data: Record<string, unknown> }).data["slopit"] as
        | { behavioral: { keystrokes: unknown[] } }
        | undefined;

      expect(slopitData).toBeDefined();
      // 5 characters * 2 events (keydown + keyup) = 10 keystrokes
      expect(slopitData?.behavioral.keystrokes.length).toBeGreaterThan(0);
    });

    it("should capture paste events with real lab.js component", async () => {
      const SlopitScreen = withSlopit(lab.html.Screen as unknown as LabjsComponentConstructor);

      const config: LabjsSlopitConfig = {
        keystroke: { enabled: true },
        paste: { enabled: true, prevent: false },
        targetSelector: "#paste-target",
      };

      const screen = new SlopitScreen({
        content: '<p>Paste test</p><textarea id="paste-target"></textarea>',
        el: displayElement,
        slopit: config,
      });

      const runPromise = screen.run();

      const textarea = await waitForElement("#paste-target");
      expect(textarea).not.toBeNull();

      if (textarea) {
        simulatePasteEvent(textarea, "Pasted content");
      }

      screen.end();
      await runPromise;

      const slopitData = (screen as unknown as { data: Record<string, unknown> }).data["slopit"] as
        | { behavioral: { paste: unknown[] } }
        | undefined;

      expect(slopitData?.behavioral.paste.length).toBe(1);
    });

    it("should capture focus events with real lab.js component", async () => {
      const SlopitScreen = withSlopit(lab.html.Screen as unknown as LabjsComponentConstructor);

      const config: LabjsSlopitConfig = {
        keystroke: { enabled: true },
        focus: { enabled: true },
        targetSelector: "#focus-target",
      };

      const screen = new SlopitScreen({
        content: '<p>Focus test</p><textarea id="focus-target"></textarea>',
        el: displayElement,
        slopit: config,
      });

      const runPromise = screen.run();

      const textarea = await waitForElement("#focus-target");
      expect(textarea).not.toBeNull();

      if (textarea) {
        simulateFocusEvents(textarea);
      }

      screen.end();
      await runPromise;

      const slopitData = (screen as unknown as { data: Record<string, unknown> }).data["slopit"] as
        | { behavioral: { focus: unknown[] } }
        | undefined;

      expect(slopitData?.behavioral.focus.length).toBeGreaterThan(0);
    });
  });

  describe("flow.Sequence with enhanced components", () => {
    it("should handle multiple trials in sequence", async () => {
      const SlopitScreen = withSlopit(lab.html.Screen as unknown as LabjsComponentConstructor);

      const trial1 = new SlopitScreen({
        content: '<p>Trial 1</p><textarea id="trial1-input"></textarea>',
        el: displayElement,
        slopit: {
          keystroke: { enabled: true },
          targetSelector: "#trial1-input",
        },
      });

      const trial2 = new SlopitScreen({
        content: '<p>Trial 2</p><textarea id="trial2-input"></textarea>',
        el: displayElement,
        slopit: {
          keystroke: { enabled: true },
          targetSelector: "#trial2-input",
        },
      });

      const sequence = new lab.flow.Sequence({
        content: [trial1, trial2],
        el: displayElement,
      });

      const runPromise = sequence.run();

      // Trial 1
      const textarea1 = await waitForElement("#trial1-input");
      expect(textarea1).not.toBeNull();
      if (textarea1) {
        await simulateTyping(textarea1, "First", { delayBetweenKeys: 5 });
      }
      trial1.end();

      // Wait for transition to trial 2
      await delay(50);

      // Trial 2
      const textarea2 = await waitForElement("#trial2-input");
      expect(textarea2).not.toBeNull();
      if (textarea2) {
        await simulateTyping(textarea2, "Second", { delayBetweenKeys: 5 });
      }
      trial2.end();

      await runPromise;

      // Verify each trial captured its own data
      const slopitData1 = (trial1 as unknown as { data: Record<string, unknown> }).data["slopit"] as
        | { behavioral: { keystrokes: unknown[] } }
        | undefined;

      const slopitData2 = (trial2 as unknown as { data: Record<string, unknown> }).data["slopit"] as
        | { behavioral: { keystrokes: unknown[] } }
        | undefined;

      expect(slopitData1?.behavioral.keystrokes.length).toBeGreaterThan(0);
      expect(slopitData2?.behavioral.keystrokes.length).toBeGreaterThan(0);
    });
  });

  describe("component without slopit config", () => {
    it("should not attach capture when slopit config is not provided", async () => {
      const SlopitScreen = withSlopit(lab.html.Screen as unknown as LabjsComponentConstructor);

      // No slopit config provided
      const screen = new SlopitScreen({
        content: "<p>No capture</p><textarea></textarea>",
        el: displayElement,
      });

      const runPromise = screen.run();
      await delay(100);

      screen.end();
      await runPromise;

      const slopitData = (screen as unknown as { data: Record<string, unknown> }).data["slopit"];
      expect(slopitData).toBeUndefined();
    });

    it("should not attach capture when slopit.enabled is false", async () => {
      const SlopitScreen = withSlopit(lab.html.Screen as unknown as LabjsComponentConstructor);

      const screen = new SlopitScreen({
        content: '<p>Disabled capture</p><textarea id="disabled-target"></textarea>',
        el: displayElement,
        slopit: {
          enabled: false,
          targetSelector: "#disabled-target",
        },
      });

      const runPromise = screen.run();
      await delay(100);

      screen.end();
      await runPromise;

      const slopitData = (screen as unknown as { data: Record<string, unknown> }).data["slopit"];
      expect(slopitData).toBeUndefined();
    });
  });

  describe("edge cases", () => {
    it("should handle empty response gracefully", async () => {
      const SlopitScreen = withSlopit(lab.html.Screen as unknown as LabjsComponentConstructor);

      const screen = new SlopitScreen({
        content: '<p>Leave blank</p><textarea id="empty-target"></textarea>',
        el: displayElement,
        slopit: {
          keystroke: { enabled: true },
          targetSelector: "#empty-target",
        },
      });

      const runPromise = screen.run();

      // Wait for element to be rendered
      await waitForElement("#empty-target");
      await delay(50);

      // No typing, just end
      screen.end();
      await runPromise;

      const slopitData = (screen as unknown as { data: Record<string, unknown> }).data["slopit"] as
        | { behavioral: { keystrokes: unknown[] } }
        | undefined;

      expect(slopitData).toBeDefined();
      expect(slopitData?.behavioral.keystrokes.length).toBe(0);
    });

    it("should handle target element that does not exist", async () => {
      const SlopitScreen = withSlopit(lab.html.Screen as unknown as LabjsComponentConstructor);

      const screen = new SlopitScreen({
        content: "<p>No input element</p>",
        el: displayElement,
        slopit: {
          keystroke: { enabled: true },
          targetSelector: "#nonexistent-element",
        },
      });

      // This should not throw
      const runPromise = screen.run();
      await delay(100);

      screen.end();
      await runPromise;

      // Component should complete without error
      expect(true).toBe(true);
    });
  });
});

describe("Integration: withSlopit and LabjsRecorder", () => {
  let displayElement: HTMLDivElement;

  beforeEach(() => {
    displayElement = document.createElement("div");
    displayElement.id = "labjs-display";
    document.body.appendChild(displayElement);
  });

  afterEach(() => {
    displayElement.remove();
    document.body.innerHTML = "";
  });

  it("should work together in a complete workflow", async () => {
    // Set up recorder
    const recorder = new LabjsRecorder({
      participantId: "test-participant",
      studyId: "test-study",
    });

    // Create enhanced component
    const SlopitScreen = withSlopit(lab.html.Screen as unknown as LabjsComponentConstructor);

    // Create component instance with content including the textarea
    const slopitConfig: LabjsSlopitConfig = {
      keystroke: { enabled: true },
      paste: { enabled: true, prevent: false },
      targetSelector: "#workflow-input",
    };

    const screen = new SlopitScreen({
      content: '<p>Type your response:</p><textarea id="workflow-input"></textarea>',
      el: displayElement,
      slopit: slopitConfig,
    });

    // Start component lifecycle
    const runPromise = screen.run();

    // Wait for element to be rendered
    const textarea = await waitForElement("#workflow-input");
    expect(textarea).not.toBeNull();

    if (textarea) {
      // Start recorder trial after element is available
      recorder.startTrial({
        trialType: "text-entry",
        targetElement: textarea,
      });

      // Simulate user interaction (2 characters = 4 keystroke events)
      await simulateTyping(textarea, "Hi", { delayBetweenKeys: 50 });
    }

    // End component lifecycle
    screen.end();
    await runPromise;

    // End recorder trial
    const completedTrial = recorder.endTrial({
      type: "text",
      value: "Hi",
      characterCount: 2,
      wordCount: 1,
    });

    // Verify recorder data (2 chars * 2 events = 4 keystrokes)
    expect(completedTrial.behavioral).toBeDefined();
    expect(completedTrial.behavioral?.keystrokes.length).toBe(4);

    // Verify component data
    const componentData = (screen as unknown as { data: Record<string, unknown> }).data[
      "slopit"
    ] as { behavioral: { keystrokes: unknown[] } };
    expect(componentData).toBeDefined();
    // lab.js component should also have captured the same keystrokes
    expect(componentData.behavioral.keystrokes.length).toBe(4);

    // Export session
    const session = recorder.exportSession();
    expect(session.trials.length).toBe(1);
    expect(session.platform.name).toBe("lab.js");
  });

  it("should handle multiple trials in sequence with recorder", async () => {
    const recorder = new LabjsRecorder({
      participantId: "P002",
      studyId: "multi-trial-study",
    });

    const SlopitScreen = withSlopit(lab.html.Screen as unknown as LabjsComponentConstructor);

    // Trial 1
    const screen1 = new SlopitScreen({
      content: '<p>Trial 1</p><textarea id="trial1-textarea"></textarea>',
      el: displayElement,
      slopit: { keystroke: { enabled: true }, targetSelector: "#trial1-textarea" },
    });

    const run1 = screen1.run();

    const textarea1 = await waitForElement("#trial1-textarea");
    expect(textarea1).not.toBeNull();

    if (textarea1) {
      recorder.startTrial({ trialType: "trial-1", targetElement: textarea1 });
      await simulateTyping(textarea1, "a", { delayBetweenKeys: 10 });
    }

    screen1.end();
    await run1;
    recorder.endTrial({ type: "text", value: "a" });

    // Trial 2
    const screen2 = new SlopitScreen({
      content: '<p>Trial 2</p><textarea id="trial2-textarea"></textarea>',
      el: displayElement,
      slopit: { keystroke: { enabled: true }, targetSelector: "#trial2-textarea" },
    });

    const run2 = screen2.run();

    const textarea2 = await waitForElement("#trial2-textarea");
    expect(textarea2).not.toBeNull();

    if (textarea2) {
      recorder.startTrial({ trialType: "trial-2", targetElement: textarea2 });
      await simulateTyping(textarea2, "bc", { delayBetweenKeys: 10 });
    }

    screen2.end();
    await run2;
    recorder.endTrial({ type: "text", value: "bc" });

    // Verify session
    const session = recorder.exportSession();
    expect(session.trials.length).toBe(2);
    expect(session.trials[0]?.trialType).toBe("trial-1");
    // 1 char * 2 events = 2 keystrokes
    expect(session.trials[0]?.behavioral?.keystrokes.length).toBe(2);
    expect(session.trials[1]?.trialType).toBe("trial-2");
    // 2 chars * 2 events = 4 keystrokes
    expect(session.trials[1]?.behavioral?.keystrokes.length).toBe(4);
  });
});

describe("LabjsRecorder", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  describe("session management", () => {
    it("should create a unique session ID", () => {
      const recorder1 = new LabjsRecorder();
      const recorder2 = new LabjsRecorder();

      expect(recorder1.getSessionId()).not.toBe(recorder2.getSessionId());
    });

    it("should include participant and study IDs in session", () => {
      const recorder = new LabjsRecorder({
        participantId: "P123",
        studyId: "study-456",
      });

      const session = recorder.exportSession();

      expect(session.participantId).toBe("P123");
      expect(session.studyId).toBe("study-456");
    });

    it("should include metadata in session", () => {
      const recorder = new LabjsRecorder({
        metadata: { condition: "A", group: 1 },
      });

      const session = recorder.exportSession();

      expect(session.metadata).toEqual({ condition: "A", group: 1 });
    });
  });

  describe("platform info", () => {
    it("should return lab.js as platform name", () => {
      const recorder = new LabjsRecorder();
      const session = recorder.exportSession();

      expect(session.platform.name).toBe("lab.js");
    });

    it("should detect version from lab global when available", () => {
      // lab.js sets this global when imported
      (window as WindowWithLab).lab = { version: lab.version };

      const recorder = new LabjsRecorder();
      const session = recorder.exportSession();

      // The version should be detected from the lab global
      expect(session.platform.version).toBe(lab.version);

      // Clean up
      delete (window as WindowWithLab).lab;
    });

    it("should return unknown version when lab global is not available", () => {
      // Ensure no lab global
      delete (window as WindowWithLab).lab;

      const recorder = new LabjsRecorder();
      const session = recorder.exportSession();

      expect(session.platform.version).toBe("unknown");
    });

    it("should include adapter version", () => {
      const recorder = new LabjsRecorder();
      const session = recorder.exportSession();

      expect(session.platform.adapterVersion).toBe("0.1.0");
    });
  });

  describe("trial management", () => {
    it("should throw when ending a trial that was not started", () => {
      const recorder = new LabjsRecorder();

      expect(() => recorder.endTrial()).toThrow("No trial in progress");
    });

    it("should throw when starting a trial while one is in progress", () => {
      const recorder = new LabjsRecorder();

      recorder.startTrial({ trialType: "test" });

      expect(() => recorder.startTrial({ trialType: "another" })).toThrow(
        "A trial is already in progress",
      );
    });

    it("should track trial state correctly", () => {
      const recorder = new LabjsRecorder();

      expect(recorder.isTrialInProgress()).toBe(false);

      recorder.startTrial({ trialType: "test" });
      expect(recorder.isTrialInProgress()).toBe(true);

      recorder.endTrial();
      expect(recorder.isTrialInProgress()).toBe(false);
    });

    it("should auto-increment trial index", () => {
      const recorder = new LabjsRecorder();

      recorder.startTrial({ trialType: "first" });
      const trial1 = recorder.endTrial();

      recorder.startTrial({ trialType: "second" });
      const trial2 = recorder.endTrial();

      recorder.startTrial({ trialType: "third" });
      const trial3 = recorder.endTrial();

      expect(trial1.trialIndex).toBe(0);
      expect(trial2.trialIndex).toBe(1);
      expect(trial3.trialIndex).toBe(2);
    });
  });

  describe("behavioral capture integration", () => {
    let container: HTMLDivElement;

    beforeEach(() => {
      container = document.createElement("div");
      document.body.appendChild(container);
    });

    afterEach(() => {
      container.remove();
    });

    it("should capture keystrokes when element is provided", async () => {
      const recorder = new LabjsRecorder({
        behavioral: { keystroke: { enabled: true } },
      });

      const textarea = document.createElement("textarea");
      container.appendChild(textarea);

      recorder.startTrial({
        trialType: "text-entry",
        targetElement: textarea,
      });

      await simulateTyping(textarea, "x", { delayBetweenKeys: 10 });

      const trial = recorder.endTrial();

      // simulateKeystroke fires both keydown and keyup, so 2 events per character
      expect(trial.behavioral?.keystrokes.length).toBe(2);
    });

    it("should allow late attachment of capture", async () => {
      const recorder = new LabjsRecorder({
        behavioral: { keystroke: { enabled: true } },
      });

      recorder.startTrial({ trialType: "late-attach" });

      const textarea = document.createElement("textarea");
      container.appendChild(textarea);

      recorder.attachCapture(textarea);

      await simulateTyping(textarea, "y", { delayBetweenKeys: 10 });

      const trial = recorder.endTrial();

      // simulateKeystroke fires both keydown and keyup, so 2 events per character
      expect(trial.behavioral?.keystrokes.length).toBe(2);
    });
  });

  describe("reset", () => {
    it("should clear all trials and generate new session ID", () => {
      const recorder = new LabjsRecorder();
      const originalSessionId = recorder.getSessionId();

      recorder.startTrial({ trialType: "test" });
      recorder.endTrial();

      expect(recorder.getTrials().length).toBe(1);

      recorder.reset();

      expect(recorder.getTrials().length).toBe(0);
      expect(recorder.getSessionId()).not.toBe(originalSessionId);
    });

    it("should reset trial counter", () => {
      const recorder = new LabjsRecorder();

      recorder.startTrial({ trialType: "first" });
      recorder.endTrial();

      recorder.reset();

      recorder.startTrial({ trialType: "after-reset" });
      const trial = recorder.endTrial();

      expect(trial.trialIndex).toBe(0);
    });
  });
});

describe("lab.js lifecycle events", () => {
  let displayElement: HTMLDivElement;

  beforeEach(() => {
    displayElement = document.createElement("div");
    displayElement.id = "labjs-display";
    document.body.appendChild(displayElement);
  });

  afterEach(() => {
    displayElement.remove();
    document.body.innerHTML = "";
  });

  it("should call slopit handlers on run and end events", async () => {
    const SlopitScreen = withSlopit(lab.html.Screen as unknown as LabjsComponentConstructor);

    const lifecycleEvents: string[] = [];

    const screen = new SlopitScreen({
      content: '<p>Lifecycle test</p><textarea id="lifecycle-target"></textarea>',
      el: displayElement,
      slopit: {
        keystroke: { enabled: true },
        targetSelector: "#lifecycle-target",
      },
    });

    // Hook into lab.js lifecycle
    screen.on("run", () => {
      lifecycleEvents.push("run");
    });
    screen.on("end", () => {
      lifecycleEvents.push("end");
    });

    const runPromise = screen.run();

    const textarea = await waitForElement("#lifecycle-target");
    expect(textarea).not.toBeNull();

    if (textarea) {
      await simulateTyping(textarea, "Test", { delayBetweenKeys: 5 });
    }

    screen.end();
    await runPromise;

    expect(lifecycleEvents).toContain("run");
    expect(lifecycleEvents).toContain("end");

    // Verify slopit data was captured between run and end
    const slopitData = (screen as unknown as { data: Record<string, unknown> }).data["slopit"] as
      | { behavioral: { keystrokes: unknown[] } }
      | undefined;

    expect(slopitData?.behavioral.keystrokes.length).toBeGreaterThan(0);
  });

  it("should properly clean up between sequential components", async () => {
    const SlopitScreen = withSlopit(lab.html.Screen as unknown as LabjsComponentConstructor);

    // First component with paste
    const screen1 = new SlopitScreen({
      content: '<p>First</p><textarea id="cleanup-target-1"></textarea>',
      el: displayElement,
      slopit: {
        keystroke: { enabled: true },
        paste: { enabled: true },
        targetSelector: "#cleanup-target-1",
      },
    });

    const run1 = screen1.run();

    const textarea1 = await waitForElement("#cleanup-target-1");
    expect(textarea1).not.toBeNull();

    if (textarea1) {
      await simulateTyping(textarea1, "A", { delayBetweenKeys: 5 });
      simulatePasteEvent(textarea1, "Pasted in first");
    }

    screen1.end();
    await run1;

    // Verify first component data
    const slopitData1 = (screen1 as unknown as { data: Record<string, unknown> }).data["slopit"] as
      | { behavioral: { paste: unknown[] } }
      | undefined;
    expect(slopitData1?.behavioral.paste.length).toBe(1);

    // Second component
    const screen2 = new SlopitScreen({
      content: '<p>Second</p><textarea id="cleanup-target-2"></textarea>',
      el: displayElement,
      slopit: {
        keystroke: { enabled: true },
        paste: { enabled: true },
        targetSelector: "#cleanup-target-2",
      },
    });

    const run2 = screen2.run();

    const textarea2 = await waitForElement("#cleanup-target-2");
    expect(textarea2).not.toBeNull();

    if (textarea2) {
      await simulateTyping(textarea2, "B", { delayBetweenKeys: 5 });
      // No paste in second component
    }

    screen2.end();
    await run2;

    // Verify second component data (no paste events)
    const slopitData2 = (screen2 as unknown as { data: Record<string, unknown> }).data["slopit"] as
      | { behavioral: { paste: unknown[] } }
      | undefined;
    expect(slopitData2?.behavioral.paste.length).toBe(0);
  });
});

describe("getSlopitData method", () => {
  let displayElement: HTMLDivElement;

  beforeEach(() => {
    displayElement = document.createElement("div");
    displayElement.id = "labjs-display";
    document.body.appendChild(displayElement);
  });

  afterEach(() => {
    displayElement.remove();
    document.body.innerHTML = "";
  });

  it("should return captured data via getSlopitData()", async () => {
    const SlopitScreen = withSlopit(lab.html.Screen as unknown as LabjsComponentConstructor);

    const screen = new SlopitScreen({
      content: '<p>Test getSlopitData</p><textarea id="get-data-target"></textarea>',
      el: displayElement,
      slopit: {
        keystroke: { enabled: true },
        targetSelector: "#get-data-target",
      },
    });

    const runPromise = screen.run();

    const textarea = await waitForElement("#get-data-target");
    expect(textarea).not.toBeNull();

    if (textarea) {
      await simulateTyping(textarea, "Data", { delayBetweenKeys: 5 });
    }

    screen.end();
    await runPromise;

    // Access via the getSlopitData method
    const getSlopitData = (screen as unknown as { getSlopitData: () => unknown }).getSlopitData;
    const slopitData = getSlopitData.call(screen) as { behavioral: { keystrokes: unknown[] } };

    expect(slopitData).toBeDefined();
    expect(slopitData.behavioral.keystrokes.length).toBeGreaterThan(0);
  });

  it("should return null when no capture was configured", async () => {
    const SlopitScreen = withSlopit(lab.html.Screen as unknown as LabjsComponentConstructor);

    const screen = new SlopitScreen({
      content: "<p>No capture</p>",
      el: displayElement,
    });

    const runPromise = screen.run();
    await delay(100);

    screen.end();
    await runPromise;

    const getSlopitData = (screen as unknown as { getSlopitData: () => unknown }).getSlopitData;
    const slopitData = getSlopitData.call(screen);

    expect(slopitData).toBeNull();
  });
});

/**
 * Window interface with optional lab global.
 */
interface WindowWithLab extends Window {
  lab?: { version?: string };
}
