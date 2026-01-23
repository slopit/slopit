/**
 * Shared test utilities for adapter testing.
 *
 * @module
 */

import type { BehavioralData, ModifierState } from "@slopit/core";

/**
 * Creates a mock textarea element.
 *
 * @param id - Optional element ID
 * @returns HTMLTextAreaElement suitable for testing
 *
 * @example
 * ```typescript
 * const textarea = createMockTextarea("response-input");
 * document.body.appendChild(textarea);
 * capture.attach(textarea);
 * ```
 */
export function createMockTextarea(id?: string): HTMLTextAreaElement {
  const textarea = document.createElement("textarea");
  if (id !== undefined) {
    textarea.id = id;
  }
  textarea.style.width = "400px";
  textarea.style.height = "200px";
  return textarea;
}

/**
 * Creates a mock input element.
 *
 * @param id - Optional element ID
 * @param type - Input type (defaults to "text")
 * @returns HTMLInputElement suitable for testing
 *
 * @example
 * ```typescript
 * const input = createMockInput("user-name", "text");
 * document.body.appendChild(input);
 * ```
 */
export function createMockInput(id?: string, type = "text"): HTMLInputElement {
  const input = document.createElement("input");
  input.type = type;
  if (id !== undefined) {
    input.id = id;
  }
  return input;
}

/**
 * Options for simulating a keystroke.
 */
export interface SimulateKeystrokeOptions {
  /**
   * Physical key code (e.g., "KeyA", "Enter").
   */
  code?: string;

  /**
   * Modifier key states.
   */
  modifiers?: Partial<ModifierState>;

  /**
   * Whether to include the keyup event.
   *
   * @default true
   */
  includeKeyUp?: boolean;
}

/**
 * Simulates a keystroke on an element.
 *
 * Dispatches both keydown and keyup events unless includeKeyUp is false.
 *
 * @param element - Target element
 * @param key - Key value (e.g., "a", "Enter", "Backspace")
 * @param options - Simulation options
 *
 * @example
 * ```typescript
 * simulateKeystroke(textarea, "a", { code: "KeyA" });
 * simulateKeystroke(textarea, "A", { code: "KeyA", modifiers: { shift: true } });
 * simulateKeystroke(textarea, "Enter", { code: "Enter" });
 * ```
 */
export function simulateKeystroke(
  element: HTMLElement,
  key: string,
  options?: SimulateKeystrokeOptions,
): void {
  const code = options?.code ?? `Key${key.toUpperCase()}`;
  const modifiers = options?.modifiers ?? {};
  const includeKeyUp = options?.includeKeyUp ?? true;

  const eventInit: KeyboardEventInit = {
    key,
    code,
    bubbles: true,
    cancelable: true,
    ctrlKey: modifiers.ctrl ?? false,
    altKey: modifiers.alt ?? false,
    shiftKey: modifiers.shift ?? false,
    metaKey: modifiers.meta ?? false,
  };

  const keydownEvent = new KeyboardEvent("keydown", eventInit);
  element.dispatchEvent(keydownEvent);

  // Update input value if it's an input or textarea
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    if (key.length === 1 && !modifiers.ctrl && !modifiers.meta) {
      element.value += key;
    }
  }

  if (includeKeyUp) {
    const keyupEvent = new KeyboardEvent("keyup", eventInit);
    element.dispatchEvent(keyupEvent);
  }
}

/**
 * Simulates typing a string character by character.
 *
 * @param element - Target element
 * @param text - Text to type
 * @param delayMs - Delay between keystrokes in milliseconds (default 50)
 * @returns Promise that resolves when typing is complete
 *
 * @example
 * ```typescript
 * await simulateTyping(textarea, "Hello world");
 * ```
 */
export async function simulateTyping(
  element: HTMLElement,
  text: string,
  delayMs = 50,
): Promise<void> {
  for (const char of text) {
    simulateKeystroke(element, char);
    await delay(delayMs);
  }
}

/**
 * Options for simulating a paste event.
 */
export interface SimulatePasteOptions {
  /**
   * Whether the paste should be prevented/blocked.
   *
   * @default false
   */
  blocked?: boolean;
}

/**
 * Simulates a paste event on an element.
 *
 * @param element - Target element
 * @param text - Text to paste
 * @param options - Simulation options
 *
 * @example
 * ```typescript
 * simulatePaste(textarea, "Pasted content");
 * simulatePaste(textarea, "Blocked paste", { blocked: true });
 * ```
 */
export function simulatePaste(
  element: HTMLElement,
  text: string,
  options?: SimulatePasteOptions,
): void {
  const blocked = options?.blocked ?? false;

  // Create a mock DataTransfer
  const dataTransfer = new MockDataTransfer();
  dataTransfer.setData("text/plain", text);

  const pasteEvent = new MockClipboardEvent("paste", {
    clipboardData: dataTransfer,
    bubbles: true,
    cancelable: true,
  });

  if (blocked) {
    element.addEventListener(
      "paste",
      (e) => {
        e.preventDefault();
      },
      { once: true },
    );
  }

  element.dispatchEvent(pasteEvent);

  // Update input value if not blocked
  if (!blocked && (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
    element.value += text;
  }
}

/**
 * Simulates a copy event on an element.
 *
 * @param element - Target element
 * @param text - Text being copied (for verification purposes)
 *
 * @example
 * ```typescript
 * simulateCopy(textarea, "Selected text");
 * ```
 */
export function simulateCopy(element: HTMLElement, text: string): void {
  const dataTransfer = new MockDataTransfer();
  dataTransfer.setData("text/plain", text);

  const copyEvent = new MockClipboardEvent("copy", {
    clipboardData: dataTransfer,
    bubbles: true,
    cancelable: true,
  });

  element.dispatchEvent(copyEvent);
}

/**
 * Simulates focus and blur events on an element.
 *
 * @param element - Target element
 *
 * @example
 * ```typescript
 * simulateFocusBlur(textarea); // Focus, then blur
 * ```
 */
export function simulateFocusBlur(element: HTMLElement): void {
  element.dispatchEvent(new FocusEvent("focus", { bubbles: true }));
  element.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
}

/**
 * Simulates a focus event on an element.
 *
 * @param element - Target element
 */
export function simulateFocus(element: HTMLElement): void {
  element.dispatchEvent(new FocusEvent("focus", { bubbles: true }));
}

/**
 * Simulates a blur event on an element.
 *
 * @param element - Target element
 */
export function simulateBlur(element: HTMLElement): void {
  element.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
}

/**
 * Simulates a mouse click on an element.
 *
 * @param element - Target element
 * @param x - X coordinate
 * @param y - Y coordinate
 */
export function simulateClick(element: HTMLElement, x = 0, y = 0): void {
  const eventInit: MouseEventInit = {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
  };

  element.dispatchEvent(new MouseEvent("mousedown", eventInit));
  element.dispatchEvent(new MouseEvent("mouseup", eventInit));
  element.dispatchEvent(new MouseEvent("click", eventInit));
}

/**
 * Simulates mouse movement on an element.
 *
 * @param element - Target element
 * @param x - X coordinate
 * @param y - Y coordinate
 */
export function simulateMouseMove(element: HTMLElement, x: number, y: number): void {
  element.dispatchEvent(
    new MouseEvent("mousemove", {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
    }),
  );
}

/**
 * Creates mock behavioral data for testing.
 *
 * @returns BehavioralData with sample events and metrics
 *
 * @example
 * ```typescript
 * const mockData = createMockBehavioralData();
 * expect(mockData.keystrokes).toHaveLength(3);
 * ```
 */
export function createMockBehavioralData(): BehavioralData {
  return {
    keystrokes: [
      {
        key: "H",
        code: "KeyH",
        event: "keydown",
        time: 100,
        modifiers: { ctrl: false, alt: false, shift: true, meta: false },
      },
      {
        key: "i",
        code: "KeyI",
        event: "keydown",
        time: 200,
        modifiers: { ctrl: false, alt: false, shift: false, meta: false },
      },
      {
        key: "!",
        code: "Digit1",
        event: "keydown",
        time: 300,
        modifiers: { ctrl: false, alt: false, shift: true, meta: false },
      },
    ],
    focus: [
      { event: "focus", time: 50 },
      { event: "blur", time: 400 },
    ],
    paste: [],
    mouse: [],
    scroll: [],
    clipboard: [],
    inputDuration: [],
    metrics: {
      keystroke: {
        totalKeystrokes: 3,
        printableKeystrokes: 3,
        deletions: 0,
        meanIKI: 100,
        stdIKI: 0,
        medianIKI: 100,
        pauseCount: 0,
        productProcessRatio: 1.0,
      },
      focus: {
        blurCount: 1,
        totalBlurDuration: 0,
        hiddenCount: 0,
        totalHiddenDuration: 0,
      },
      timing: {
        firstKeystrokeLatency: 100,
        totalResponseTime: 350,
        charactersPerMinute: 514,
      },
    },
  };
}

/**
 * Mock DataTransfer class for clipboard events.
 */
export class MockDataTransfer {
  private data: Map<string, string> = new Map();

  setData(format: string, data: string): void {
    this.data.set(format, data);
  }

  getData(format: string): string {
    return this.data.get(format) ?? "";
  }

  clearData(format?: string): void {
    if (format !== undefined) {
      this.data.delete(format);
    } else {
      this.data.clear();
    }
  }

  get types(): string[] {
    return Array.from(this.data.keys());
  }
}

/**
 * Mock ClipboardEvent class.
 */
export class MockClipboardEvent extends Event {
  clipboardData: MockDataTransfer;

  constructor(
    type: string,
    init?: {
      clipboardData?: MockDataTransfer;
      bubbles?: boolean;
      cancelable?: boolean;
    },
  ) {
    super(type, { bubbles: init?.bubbles ?? true, cancelable: init?.cancelable ?? true });
    this.clipboardData = init?.clipboardData ?? new MockDataTransfer();
  }
}

/**
 * Utility function for creating a delay.
 *
 * @param ms - Delay in milliseconds
 * @returns Promise that resolves after the delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Waits for a condition to become true.
 *
 * @param condition - Function that returns true when the condition is met
 * @param timeout - Maximum time to wait in milliseconds
 * @param interval - Polling interval in milliseconds
 * @returns Promise that resolves when the condition is met
 * @throws Error if timeout is reached
 *
 * @example
 * ```typescript
 * await waitFor(() => document.querySelector(".loaded") !== null);
 * ```
 */
export async function waitFor(
  condition: () => boolean,
  timeout = 5000,
  interval = 50,
): Promise<void> {
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error("waitFor timeout exceeded");
    }
    await delay(interval);
  }
}
