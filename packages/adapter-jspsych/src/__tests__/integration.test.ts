/**
 * Integration tests for @slopit/adapter-jspsych with real jsPsych.
 *
 * These tests run jsPsych in a jsdom environment using the actual jsPsych
 * library and plugins to verify real-world compatibility.
 *
 * @module
 */

import jsPsychHtmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import jsPsychSurveyHtmlForm from "@jspsych/plugin-survey-html-form";
import jsPsychSurveyText from "@jspsych/plugin-survey-text";
import { MockClipboardEvent, MockDataTransfer, delay } from "@slopit/adapter-shared";
import { type JsPsych, initJsPsych } from "jspsych";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SlopitExtension, type SlopitExtensionParams } from "../extension.js";
import type { SlopitData } from "../types.js";
import { exportToSlopit, getSlopitDataFromTrial } from "../utils/index.js";

/**
 * Waits for an element to appear in the DOM.
 */
async function waitForElement(selector: string, timeout = 1000): Promise<HTMLElement | null> {
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
 */
async function simulateTyping(
  element: HTMLElement,
  text: string,
  options: { delayBetweenKeys?: number } = {},
): Promise<void> {
  const charDelay = options.delayBetweenKeys ?? 10;

  for (const char of text) {
    element.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: char,
        code: `Key${char.toUpperCase()}`,
        bubbles: true,
        cancelable: true,
      }),
    );

    await delay(charDelay);

    element.dispatchEvent(
      new KeyboardEvent("keyup", {
        key: char,
        code: `Key${char.toUpperCase()}`,
        bubbles: true,
        cancelable: true,
      }),
    );
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
 * Simulates focus, blur, and focus events for testing multiple focus transitions.
 *
 * This differs from the shared simulateFocusBlur which only does focus->blur.
 */
function simulateMultipleFocusBlur(element: HTMLElement): void {
  element.dispatchEvent(new FocusEvent("focus", { bubbles: true }));
  element.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
  element.dispatchEvent(new FocusEvent("focus", { bubbles: true }));
}

/**
 * Creates a jsPsych instance with the SlopitExtension registered.
 */
function createJsPsychWithSlopit(): JsPsych {
  const container = document.createElement("div");
  container.id = "jspsych-target";
  document.body.appendChild(container);

  return initJsPsych({
    display_element: container,
    extensions: [{ type: SlopitExtension }],
    override_safe_mode: true,
  });
}

/**
 * Submits a jsPsych survey form by clicking the submit button.
 */
function submitForm(): void {
  const submitButton = document.querySelector<HTMLElement>(
    "#jspsych-survey-text-next, input[type='submit'], button[type='submit'], button",
  );
  submitButton?.click();
}

/**
 * Dispatches a keyboard event to end a keyboard-response trial.
 */
function pressKey(key: string): void {
  const display = document.querySelector("#jspsych-target") ?? document;
  display.dispatchEvent(
    new KeyboardEvent("keydown", {
      key,
      code: `Key${key.toUpperCase()}`,
      bubbles: true,
    }),
  );
  display.dispatchEvent(
    new KeyboardEvent("keyup", {
      key,
      code: `Key${key.toUpperCase()}`,
      bubbles: true,
    }),
  );
}

describe("jsPsych Integration Tests", () => {
  let jsPsych: JsPsych;

  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  describe("SlopitExtension initialization", () => {
    it("should register with jsPsych successfully", () => {
      jsPsych = createJsPsychWithSlopit();
      expect(jsPsych).toBeDefined();
      expect(jsPsych.version()).toMatch(/^\d+\.\d+\.\d+/);
    });

    it("should have correct extension metadata", () => {
      expect(SlopitExtension.info.name).toBe("slopit");
      expect(SlopitExtension.info.version).toBe("0.1.0");
    });
  });

  describe("survey-text plugin integration", () => {
    it("should capture keystrokes from survey-text textarea", async () => {
      jsPsych = createJsPsychWithSlopit();

      // rows > 1 creates a textarea element
      const runPromise = jsPsych.run([
        {
          type: jsPsychSurveyText,
          questions: [{ prompt: "Describe your day:", rows: 3 }],
          extensions: [
            {
              type: SlopitExtension,
              params: {
                keystroke: { enabled: true },
              } satisfies SlopitExtensionParams,
            },
          ],
        },
      ]);

      // Wait for the trial to render
      const textarea = await waitForElement("textarea");
      expect(textarea).not.toBeNull();

      if (textarea) {
        await simulateTyping(textarea, "Hello", { delayBetweenKeys: 5 });
        await delay(20);
        submitForm();
      }

      await runPromise;

      const data = jsPsych.data.get().values();
      expect(data.length).toBeGreaterThanOrEqual(1);

      const trialData = data[0] as Record<string, unknown>;
      const slopitData = trialData["slopit"] as SlopitData | undefined;

      expect(slopitData).toBeDefined();
      expect(slopitData?.behavioral).toBeDefined();
      expect(slopitData?.behavioral.keystrokes.length).toBeGreaterThan(0);
    }, 10000);

    it("should capture keystrokes from survey-text input (rows=1)", async () => {
      jsPsych = createJsPsychWithSlopit();

      // rows = 1 (default) creates an input element
      const runPromise = jsPsych.run([
        {
          type: jsPsychSurveyText,
          questions: [{ prompt: "Enter your name:", rows: 1 }],
          extensions: [
            {
              type: SlopitExtension,
              params: {
                keystroke: { enabled: true },
                targetSelector: "input[type='text'], textarea",
              } satisfies SlopitExtensionParams,
            },
          ],
        },
      ]);

      // Wait for input to render
      const input = await waitForElement("input[type='text']");
      expect(input).not.toBeNull();

      if (input) {
        await simulateTyping(input, "John", { delayBetweenKeys: 5 });
        await delay(20);
        submitForm();
      }

      await runPromise;

      const data = jsPsych.data.get().values();
      const trialData = data[0] as Record<string, unknown>;
      const slopitData = trialData["slopit"] as SlopitData | undefined;

      expect(slopitData?.behavioral.keystrokes.length).toBeGreaterThan(0);
    }, 10000);
  });

  describe("survey-html-form plugin integration", () => {
    it("should capture from custom HTML form textarea", async () => {
      jsPsych = createJsPsychWithSlopit();

      const runPromise = jsPsych.run([
        {
          type: jsPsychSurveyHtmlForm,
          html: `
            <p>Describe your experience:</p>
            <textarea name="experience" id="experience-textarea" rows="5"></textarea>
          `,
          extensions: [
            {
              type: SlopitExtension,
              params: {
                keystroke: { enabled: true },
                targetSelector: "#experience-textarea",
              } satisfies SlopitExtensionParams,
            },
          ],
        },
      ]);

      const textarea = await waitForElement("#experience-textarea");
      expect(textarea).not.toBeNull();

      if (textarea) {
        await simulateTyping(textarea, "Great experience", { delayBetweenKeys: 5 });
        await delay(20);
        submitForm();
      }

      await runPromise;

      const data = jsPsych.data.get().values();
      expect(data.length).toBeGreaterThanOrEqual(1);

      const trialData = data[0] as Record<string, unknown>;
      const slopitData = trialData["slopit"] as SlopitData | undefined;

      expect(slopitData?.behavioral).toBeDefined();
      expect(slopitData?.behavioral.keystrokes.length).toBeGreaterThan(0);
    }, 10000);

    it("should capture from text input in html form", async () => {
      jsPsych = createJsPsychWithSlopit();

      const runPromise = jsPsych.run([
        {
          type: jsPsychSurveyHtmlForm,
          html: `
            <label>Name: <input type="text" name="name" id="name-input" /></label>
          `,
          extensions: [
            {
              type: SlopitExtension,
              params: {
                keystroke: { enabled: true },
                targetSelector: "#name-input",
              } satisfies SlopitExtensionParams,
            },
          ],
        },
      ]);

      const input = await waitForElement("#name-input");
      expect(input).not.toBeNull();

      if (input) {
        await simulateTyping(input, "Jane", { delayBetweenKeys: 5 });
        await delay(20);
        submitForm();
      }

      await runPromise;

      const data = jsPsych.data.get().values();
      const trialData = data[0] as Record<string, unknown>;
      const slopitData = trialData["slopit"] as SlopitData | undefined;

      expect(slopitData?.behavioral.keystrokes.length).toBeGreaterThan(0);
    }, 10000);
  });

  describe("paste event capture", () => {
    it("should capture paste events with content", async () => {
      jsPsych = createJsPsychWithSlopit();

      const runPromise = jsPsych.run([
        {
          type: jsPsychSurveyText,
          questions: [{ prompt: "Paste text:", rows: 3 }],
          extensions: [
            {
              type: SlopitExtension,
              params: {
                keystroke: { enabled: true },
                paste: { enabled: true, prevent: false },
              } satisfies SlopitExtensionParams,
            },
          ],
        },
      ]);

      const textarea = await waitForElement("textarea");
      expect(textarea).not.toBeNull();

      if (textarea) {
        simulatePasteEvent(textarea, "Pasted content here");
        await delay(20);
        submitForm();
      }

      await runPromise;

      const data = jsPsych.data.get().values();
      const trialData = data[0] as Record<string, unknown>;
      const slopitData = trialData["slopit"] as SlopitData | undefined;

      expect(slopitData?.behavioral.paste.length).toBe(1);
      // PasteEvent uses textLength and textHash, not content
      expect(slopitData?.behavioral.paste[0]?.textLength).toBe(19); // "Pasted content here".length
    }, 10000);

    it("should generate flags array for paste events", async () => {
      jsPsych = createJsPsychWithSlopit();

      const runPromise = jsPsych.run([
        {
          type: jsPsychSurveyText,
          questions: [{ prompt: "Write:", rows: 3 }],
          extensions: [
            {
              type: SlopitExtension,
              params: {
                keystroke: { enabled: true },
                paste: { enabled: true, prevent: false },
              } satisfies SlopitExtensionParams,
            },
          ],
        },
      ]);

      const textarea = await waitForElement("textarea");
      if (textarea) {
        simulatePasteEvent(textarea, "Pasted content that should be flagged.");
        await delay(20);
        submitForm();
      }

      await runPromise;

      const data = jsPsych.data.get().values();
      const trialData = data[0] as Record<string, unknown>;
      const slopitData = trialData["slopit"] as SlopitData | undefined;

      expect(slopitData?.flags).toBeDefined();
      expect(Array.isArray(slopitData?.flags)).toBe(true);
    }, 10000);
  });

  describe("focus event capture", () => {
    it("should capture focus and blur events", async () => {
      jsPsych = createJsPsychWithSlopit();

      const runPromise = jsPsych.run([
        {
          type: jsPsychSurveyText,
          questions: [{ prompt: "Focus test:", rows: 3 }],
          extensions: [
            {
              type: SlopitExtension,
              params: {
                keystroke: { enabled: true },
                focus: { enabled: true },
              } satisfies SlopitExtensionParams,
            },
          ],
        },
      ]);

      const textarea = await waitForElement("textarea");
      if (textarea) {
        simulateMultipleFocusBlur(textarea);
        await delay(20);
        await simulateTyping(textarea, "Hi", { delayBetweenKeys: 5 });
        await delay(20);
        submitForm();
      }

      await runPromise;

      const data = jsPsych.data.get().values();
      const trialData = data[0] as Record<string, unknown>;
      const slopitData = trialData["slopit"] as SlopitData | undefined;

      expect(slopitData?.behavioral.focus.length).toBeGreaterThan(0);
    }, 10000);
  });

  describe("edge cases", () => {
    it("should handle empty response gracefully", async () => {
      jsPsych = createJsPsychWithSlopit();

      const runPromise = jsPsych.run([
        {
          type: jsPsychSurveyText,
          questions: [{ prompt: "Leave blank:", rows: 3 }],
          extensions: [
            {
              type: SlopitExtension,
              params: {
                keystroke: { enabled: true },
              } satisfies SlopitExtensionParams,
            },
          ],
        },
      ]);

      await waitForElement("textarea");
      await delay(50);
      submitForm();

      await runPromise;

      const data = jsPsych.data.get().values();
      const trialData = data[0] as Record<string, unknown>;
      const slopitData = trialData["slopit"] as SlopitData | undefined;

      expect(slopitData?.behavioral).toBeDefined();
      expect(slopitData?.behavioral.keystrokes.length).toBe(0);
    }, 10000);

    it("should handle dynamically created elements via MutationObserver", async () => {
      jsPsych = createJsPsychWithSlopit();

      const runPromise = jsPsych.run([
        {
          type: jsPsychHtmlKeyboardResponse,
          stimulus: `<div id="dynamic-container"></div>`,
          choices: "NO_KEYS",
          trial_duration: 1500,
          extensions: [
            {
              type: SlopitExtension,
              params: {
                keystroke: { enabled: true },
                targetSelector: "#dynamic-input",
              } satisfies SlopitExtensionParams,
            },
          ],
          on_load: () => {
            setTimeout(() => {
              const container = document.querySelector("#dynamic-container");
              if (container) {
                const input = document.createElement("input");
                input.type = "text";
                input.id = "dynamic-input";
                container.appendChild(input);
              }
            }, 30);
          },
        },
      ]);

      const dynamicInput = await waitForElement("#dynamic-input");
      expect(dynamicInput).not.toBeNull();

      if (dynamicInput) {
        await simulateTyping(dynamicInput, "Dynamic", { delayBetweenKeys: 5 });
        await delay(20);
      }

      await runPromise;

      const data = jsPsych.data.get().values();
      const trialData = data[0] as Record<string, unknown>;
      const slopitData = trialData["slopit"] as SlopitData | undefined;

      expect(slopitData?.behavioral.keystrokes.length).toBeGreaterThan(0);
    }, 10000);

    it("should return no slopit data when no target element found", async () => {
      jsPsych = createJsPsychWithSlopit();

      const runPromise = jsPsych.run([
        {
          type: jsPsychHtmlKeyboardResponse,
          stimulus: "<p>No input here</p>",
          choices: ["a"],
          extensions: [
            {
              type: SlopitExtension,
              params: {
                keystroke: { enabled: true },
                targetSelector: "#nonexistent-element",
              } satisfies SlopitExtensionParams,
            },
          ],
        },
      ]);

      await delay(50);
      pressKey("a");

      await runPromise;

      const data = jsPsych.data.get().values();
      const trialData = data[0] as Record<string, unknown>;

      // When no target element is found, the extension does not attach capture,
      // so on_finish returns {}, meaning no 'slopit' property is added to trial data
      expect(trialData).toBeDefined();
      expect(trialData["slopit"]).toBeUndefined();
    }, 10000);

    it("should handle multiple trials in sequence", async () => {
      jsPsych = createJsPsychWithSlopit();

      const runPromise = jsPsych.run([
        {
          type: jsPsychSurveyText,
          questions: [{ prompt: "Trial 1:", rows: 3 }],
          extensions: [
            {
              type: SlopitExtension,
              params: { keystroke: { enabled: true } } satisfies SlopitExtensionParams,
            },
          ],
        },
        {
          type: jsPsychSurveyText,
          questions: [{ prompt: "Trial 2:", rows: 3 }],
          extensions: [
            {
              type: SlopitExtension,
              params: { keystroke: { enabled: true } } satisfies SlopitExtensionParams,
            },
          ],
        },
      ]);

      // Trial 1
      let textarea = await waitForElement("textarea");
      if (textarea) {
        await simulateTyping(textarea, "First", { delayBetweenKeys: 5 });
        await delay(20);
        submitForm();
      }

      // Wait for trial 2
      await delay(50);

      // Trial 2
      textarea = await waitForElement("textarea");
      if (textarea) {
        await simulateTyping(textarea, "Second", { delayBetweenKeys: 5 });
        await delay(20);
        submitForm();
      }

      await runPromise;

      const data = jsPsych.data.get().values();
      expect(data.length).toBe(2);

      const trial1 = data[0] as Record<string, unknown>;
      const trial2 = data[1] as Record<string, unknown>;

      const slopit1 = trial1["slopit"] as SlopitData | undefined;
      const slopit2 = trial2["slopit"] as SlopitData | undefined;

      expect(slopit1?.behavioral.keystrokes.length).toBeGreaterThan(0);
      expect(slopit2?.behavioral.keystrokes.length).toBeGreaterThan(0);
    }, 15000);
  });

  describe("export utilities", () => {
    it("should export session data correctly", async () => {
      jsPsych = createJsPsychWithSlopit();

      const runPromise = jsPsych.run([
        {
          type: jsPsychSurveyText,
          questions: [{ prompt: "Export test:", rows: 3 }],
          extensions: [
            {
              type: SlopitExtension,
              params: { keystroke: { enabled: true } } satisfies SlopitExtensionParams,
            },
          ],
        },
      ]);

      const textarea = await waitForElement("textarea");
      if (textarea) {
        await simulateTyping(textarea, "Export data", { delayBetweenKeys: 5 });
        await delay(20);
        submitForm();
      }

      await runPromise;

      const session = exportToSlopit(jsPsych, {
        participantId: "test-participant-001",
        studyId: "integration-test",
      });

      expect(session.schemaVersion).toBeDefined();
      expect(session.sessionId).toBeDefined();
      expect(session.participantId).toBe("test-participant-001");
      expect(session.studyId).toBe("integration-test");
      expect(session.platform.name).toBe("jspsych");
      expect(session.trials.length).toBe(1);

      const trial = session.trials[0];
      expect(trial).toBeDefined();
      expect(trial?.behavioral).toBeDefined();
      expect(trial?.behavioral?.keystrokes?.length).toBeGreaterThan(0);
    }, 10000);

    it("should filter trials correctly", async () => {
      jsPsych = createJsPsychWithSlopit();

      const runPromise = jsPsych.run([
        {
          type: jsPsychHtmlKeyboardResponse,
          stimulus: "<p>Instructions</p>",
          choices: ["a"],
          data: { phase: "instructions" },
        },
        {
          type: jsPsychSurveyText,
          questions: [{ prompt: "Response:", rows: 3 }],
          data: { phase: "response" },
          extensions: [
            {
              type: SlopitExtension,
              params: { keystroke: { enabled: true } } satisfies SlopitExtensionParams,
            },
          ],
        },
      ]);

      // Complete first trial
      await delay(50);
      pressKey("a");

      // Complete second trial
      const textarea = await waitForElement("textarea");
      if (textarea) {
        await simulateTyping(textarea, "Response", { delayBetweenKeys: 5 });
        await delay(20);
        submitForm();
      }

      await runPromise;

      const session = exportToSlopit(jsPsych, {
        trialFilter: (trial) => (trial["phase"] as string) === "response",
      });

      expect(session.trials.length).toBe(1);
      expect(session.trials[0]?.behavioral).toBeDefined();
    }, 10000);

    it("should get slopit data from specific trial index", async () => {
      jsPsych = createJsPsychWithSlopit();

      const runPromise = jsPsych.run([
        {
          type: jsPsychSurveyText,
          questions: [{ prompt: "Test:", rows: 3 }],
          extensions: [
            {
              type: SlopitExtension,
              params: { keystroke: { enabled: true } } satisfies SlopitExtensionParams,
            },
          ],
        },
      ]);

      const textarea = await waitForElement("textarea");
      if (textarea) {
        await simulateTyping(textarea, "Data", { delayBetweenKeys: 5 });
        await delay(20);
        submitForm();
      }

      await runPromise;

      const slopitData = getSlopitDataFromTrial(jsPsych, 0);
      expect(slopitData).toBeDefined();
      expect(slopitData?.behavioral).toBeDefined();
    }, 10000);
  });

  describe("configuration options", () => {
    it("should respect disabled keystroke capture", async () => {
      jsPsych = createJsPsychWithSlopit();

      const runPromise = jsPsych.run([
        {
          type: jsPsychSurveyText,
          questions: [{ prompt: "No keystrokes:", rows: 3 }],
          extensions: [
            {
              type: SlopitExtension,
              params: {
                keystroke: { enabled: false },
                focus: { enabled: true },
              } satisfies SlopitExtensionParams,
            },
          ],
        },
      ]);

      const textarea = await waitForElement("textarea");
      if (textarea) {
        await simulateTyping(textarea, "Hello", { delayBetweenKeys: 5 });
        await delay(20);
        submitForm();
      }

      await runPromise;

      const data = jsPsych.data.get().values();
      const trialData = data[0] as Record<string, unknown>;
      const slopitData = trialData["slopit"] as SlopitData | undefined;

      expect(slopitData?.behavioral.keystrokes.length).toBe(0);
    }, 10000);

    it("should respect disabled clipboard capture", async () => {
      jsPsych = createJsPsychWithSlopit();

      const runPromise = jsPsych.run([
        {
          type: jsPsychSurveyText,
          questions: [{ prompt: "No paste:", rows: 3 }],
          extensions: [
            {
              type: SlopitExtension,
              params: {
                keystroke: { enabled: true },
                // clipboard.enabled controls both paste and copy capture
                clipboard: { enabled: false },
              } satisfies SlopitExtensionParams,
            },
          ],
        },
      ]);

      const textarea = await waitForElement("textarea");
      if (textarea) {
        simulatePasteEvent(textarea, "Pasted text");
        await delay(20);
        submitForm();
      }

      await runPromise;

      const data = jsPsych.data.get().values();
      const trialData = data[0] as Record<string, unknown>;
      const slopitData = trialData["slopit"] as SlopitData | undefined;

      expect(slopitData?.behavioral.paste.length).toBe(0);
    }, 10000);
  });
});

describe("behavioral metrics integration", () => {
  let jsPsych: JsPsych;

  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should compute keystroke metrics after capture", async () => {
    jsPsych = createJsPsychWithSlopit();

    const runPromise = jsPsych.run([
      {
        type: jsPsychSurveyText,
        questions: [{ prompt: "Type:", rows: 3 }],
        extensions: [
          {
            type: SlopitExtension,
            params: { keystroke: { enabled: true } } satisfies SlopitExtensionParams,
          },
        ],
      },
    ]);

    const textarea = await waitForElement("textarea");
    if (textarea) {
      await simulateTyping(textarea, "Metrics test", { delayBetweenKeys: 10 });
      await delay(30);
      submitForm();
    }

    await runPromise;

    const data = jsPsych.data.get().values();
    const trialData = data[0] as Record<string, unknown>;
    const slopitData = trialData["slopit"] as SlopitData | undefined;

    expect(slopitData?.behavioral.metrics).toBeDefined();
  }, 10000);
});

describe("jsPsych lifecycle", () => {
  let jsPsych: JsPsych;

  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should call extension lifecycle methods in correct order", async () => {
    jsPsych = createJsPsychWithSlopit();

    const lifecycleOrder: string[] = [];

    const runPromise = jsPsych.run([
      {
        type: jsPsychSurveyText,
        questions: [{ prompt: "Lifecycle:", rows: 3 }],
        extensions: [
          {
            type: SlopitExtension,
            params: { keystroke: { enabled: true } } satisfies SlopitExtensionParams,
          },
        ],
        on_start: () => {
          lifecycleOrder.push("trial_on_start");
        },
        on_load: () => {
          lifecycleOrder.push("trial_on_load");
        },
        on_finish: () => {
          lifecycleOrder.push("trial_on_finish");
        },
      },
    ]);

    const textarea = await waitForElement("textarea");
    if (textarea) {
      await simulateTyping(textarea, "Test", { delayBetweenKeys: 5 });
      submitForm();
    }

    await runPromise;

    expect(lifecycleOrder).toContain("trial_on_start");
    expect(lifecycleOrder).toContain("trial_on_load");
    expect(lifecycleOrder).toContain("trial_on_finish");

    const startIdx = lifecycleOrder.indexOf("trial_on_start");
    const loadIdx = lifecycleOrder.indexOf("trial_on_load");
    const finishIdx = lifecycleOrder.indexOf("trial_on_finish");
    expect(startIdx).toBeLessThan(loadIdx);
    expect(loadIdx).toBeLessThan(finishIdx);
  }, 10000);

  it("should properly clean up between trials", async () => {
    jsPsych = createJsPsychWithSlopit();

    const runPromise = jsPsych.run([
      {
        type: jsPsychSurveyText,
        questions: [{ prompt: "Trial A:", rows: 3 }],
        extensions: [
          {
            type: SlopitExtension,
            params: {
              keystroke: { enabled: true },
              paste: { enabled: true },
            } satisfies SlopitExtensionParams,
          },
        ],
      },
      {
        type: jsPsychSurveyText,
        questions: [{ prompt: "Trial B:", rows: 3 }],
        extensions: [
          {
            type: SlopitExtension,
            params: {
              keystroke: { enabled: true },
              paste: { enabled: true },
            } satisfies SlopitExtensionParams,
          },
        ],
      },
    ]);

    // Trial A: Type and paste
    let textarea = await waitForElement("textarea");
    if (textarea) {
      await simulateTyping(textarea, "A", { delayBetweenKeys: 5 });
      simulatePasteEvent(textarea, "Pasted in A");
      await delay(20);
      submitForm();
    }

    await delay(50);

    // Trial B: Only type
    textarea = await waitForElement("textarea");
    if (textarea) {
      await simulateTyping(textarea, "B", { delayBetweenKeys: 5 });
      await delay(20);
      submitForm();
    }

    await runPromise;

    const data = jsPsych.data.get().values();
    const trialA = data[0] as Record<string, unknown>;
    const trialB = data[1] as Record<string, unknown>;

    const slopitA = trialA["slopit"] as SlopitData | undefined;
    const slopitB = trialB["slopit"] as SlopitData | undefined;

    expect(slopitA?.behavioral.paste.length).toBe(1);
    expect(slopitB?.behavioral.paste.length).toBe(0);
  }, 15000);
});

describe("html-keyboard-response plugin integration", () => {
  let jsPsych: JsPsych;

  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should handle trials without text input gracefully", async () => {
    jsPsych = createJsPsychWithSlopit();

    const runPromise = jsPsych.run([
      {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: "<p>Press any key</p>",
        choices: ["a", "b", "c"],
        extensions: [
          {
            type: SlopitExtension,
            params: {
              keystroke: { enabled: true },
            } satisfies SlopitExtensionParams,
          },
        ],
      },
    ]);

    await delay(50);
    pressKey("a");

    await runPromise;

    const data = jsPsych.data.get().values();
    expect(data.length).toBeGreaterThanOrEqual(1);

    const trialData = data[0] as Record<string, unknown>;
    expect(trialData).toBeDefined();
  }, 10000);

  it("should capture from custom HTML with input field", async () => {
    jsPsych = createJsPsychWithSlopit();

    const runPromise = jsPsych.run([
      {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `
          <p>Type something:</p>
          <input type="text" id="custom-input" />
          <p>Then press Enter</p>
        `,
        choices: ["Enter"],
        extensions: [
          {
            type: SlopitExtension,
            params: {
              keystroke: { enabled: true },
              targetSelector: "#custom-input",
            } satisfies SlopitExtensionParams,
          },
        ],
      },
    ]);

    const customInput = await waitForElement("#custom-input");
    expect(customInput).not.toBeNull();

    if (customInput) {
      await simulateTyping(customInput, "Custom text", { delayBetweenKeys: 5 });
      await delay(20);
    }

    pressKey("Enter");

    await runPromise;

    const data = jsPsych.data.get().values();
    const trialData = data[0] as Record<string, unknown>;
    const slopitData = trialData["slopit"] as SlopitData | undefined;

    expect(slopitData?.behavioral.keystrokes.length).toBeGreaterThan(0);
  }, 10000);
});
