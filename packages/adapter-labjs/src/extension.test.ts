import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { withSlopit } from "./extension.js";
import type { LabjsComponentLike, LabjsSlopitConfig } from "./types.js";

/**
 * Mock ClipboardEvent for jsdom compatibility.
 */
class MockClipboardEvent extends Event {
  clipboardData: DataTransfer | null;

  constructor(type: string, eventInitDict?: ClipboardEventInit) {
    super(type, eventInitDict);
    this.clipboardData = eventInitDict?.clipboardData ?? null;
  }
}

/**
 * Creates a mock lab.js component class for testing.
 */
function createMockLabjsComponent(): new (options: Record<string, unknown>) => LabjsComponentLike {
  return class MockComponent implements LabjsComponentLike {
    options: Record<string, unknown>;
    data: Record<string, unknown> = {};
    private handlers: Map<string, Array<(...args: unknown[]) => void>> = new Map();

    constructor(options: Record<string, unknown>) {
      this.options = options;
    }

    on(event: string, handler: (...args: unknown[]) => void): void {
      const existing = this.handlers.get(event) ?? [];
      existing.push(handler);
      this.handlers.set(event, existing);
    }

    /**
     * Triggers a lifecycle event for testing.
     */
    trigger(event: string, ...args: unknown[]): void {
      const handlers = this.handlers.get(event) ?? [];
      for (const handler of handlers) {
        handler(...args);
      }
    }
  };
}

describe("withSlopit", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    container.className = "lab-content";
    document.body.appendChild(container);

    vi.spyOn(performance, "now").mockReturnValue(0);
  });

  afterEach(() => {
    container.remove();
    vi.restoreAllMocks();
  });

  describe("mixin application", () => {
    it("should return a class that extends the original", () => {
      const MockComponent = createMockLabjsComponent();
      const EnhancedComponent = withSlopit(MockComponent);

      const instance = new EnhancedComponent({});

      expect(instance).toBeInstanceOf(MockComponent);
    });

    it("should preserve original constructor behavior", () => {
      const MockComponent = createMockLabjsComponent();
      const EnhancedComponent = withSlopit(MockComponent);

      const options = { foo: "bar", baz: 42 };
      const instance = new EnhancedComponent(options);

      expect(instance.options).toEqual(options);
    });

    it("should add getSlopitData method", () => {
      const MockComponent = createMockLabjsComponent();
      const EnhancedComponent = withSlopit(MockComponent);

      const instance = new EnhancedComponent({}) as LabjsComponentLike & {
        getSlopitData(): unknown;
      };

      expect(typeof instance.getSlopitData).toBe("function");
    });
  });

  describe("lifecycle integration", () => {
    it("should attach capture on run when element exists", () => {
      const textarea = document.createElement("textarea");
      container.appendChild(textarea);

      const MockComponent = createMockLabjsComponent();
      const EnhancedComponent = withSlopit(MockComponent);

      const slopitConfig: LabjsSlopitConfig = {
        keystroke: { enabled: true },
      };

      const instance = new EnhancedComponent({ slopit: slopitConfig });

      // Trigger run lifecycle
      (instance as MockComponentInstance).trigger("run");

      // Simulate keystroke
      textarea.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "a",
          code: "KeyA",
          bubbles: true,
        }),
      );

      // Trigger end lifecycle
      (instance as MockComponentInstance).trigger("end");

      expect(instance.data["slopit"]).toBeDefined();
    });

    it("should not attach capture when slopit is not configured", () => {
      const textarea = document.createElement("textarea");
      container.appendChild(textarea);

      const MockComponent = createMockLabjsComponent();
      const EnhancedComponent = withSlopit(MockComponent);

      const instance = new EnhancedComponent({});

      (instance as MockComponentInstance).trigger("run");
      (instance as MockComponentInstance).trigger("end");

      expect(instance.data["slopit"]).toBeUndefined();
    });

    it("should not attach capture when enabled is false", () => {
      const textarea = document.createElement("textarea");
      container.appendChild(textarea);

      const MockComponent = createMockLabjsComponent();
      const EnhancedComponent = withSlopit(MockComponent);

      const slopitConfig: LabjsSlopitConfig = {
        enabled: false,
        keystroke: { enabled: true },
      };

      const instance = new EnhancedComponent({ slopit: slopitConfig });

      (instance as MockComponentInstance).trigger("run");
      (instance as MockComponentInstance).trigger("end");

      expect(instance.data["slopit"]).toBeUndefined();
    });
  });

  describe("element discovery", () => {
    it("should find textarea with default selector", () => {
      const textarea = document.createElement("textarea");
      container.appendChild(textarea);

      const MockComponent = createMockLabjsComponent();
      const EnhancedComponent = withSlopit(MockComponent);

      const instance = new EnhancedComponent({
        slopit: { keystroke: { enabled: true } },
      });

      (instance as MockComponentInstance).trigger("run");

      textarea.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "b",
          code: "KeyB",
          bubbles: true,
        }),
      );

      (instance as MockComponentInstance).trigger("end");

      const data = instance.data["slopit"] as { behavioral: { keystrokes: unknown[] } };
      expect(data.behavioral.keystrokes.length).toBeGreaterThanOrEqual(1);
    });

    it("should find input[type='text'] with default selector", () => {
      const input = document.createElement("input");
      input.type = "text";
      container.appendChild(input);

      const MockComponent = createMockLabjsComponent();
      const EnhancedComponent = withSlopit(MockComponent);

      const instance = new EnhancedComponent({
        slopit: { keystroke: { enabled: true } },
      });

      (instance as MockComponentInstance).trigger("run");

      input.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "c",
          code: "KeyC",
          bubbles: true,
        }),
      );

      (instance as MockComponentInstance).trigger("end");

      const data = instance.data["slopit"] as { behavioral: { keystrokes: unknown[] } };
      expect(data.behavioral.keystrokes.length).toBeGreaterThanOrEqual(1);
    });

    it("should use custom targetSelector when provided", () => {
      const customInput = document.createElement("textarea");
      customInput.id = "custom-input";
      container.appendChild(customInput);

      const regularTextarea = document.createElement("textarea");
      container.appendChild(regularTextarea);

      const MockComponent = createMockLabjsComponent();
      const EnhancedComponent = withSlopit(MockComponent);

      const instance = new EnhancedComponent({
        slopit: {
          targetSelector: "#custom-input",
          keystroke: { enabled: true },
        },
      });

      (instance as MockComponentInstance).trigger("run");

      // Type in custom input
      customInput.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "d",
          code: "KeyD",
          bubbles: true,
        }),
      );

      (instance as MockComponentInstance).trigger("end");

      const data = instance.data["slopit"] as { behavioral: { keystrokes: unknown[] } };
      expect(data.behavioral.keystrokes.length).toBeGreaterThanOrEqual(1);
    });

    it("should discover dynamically created elements via MutationObserver", async () => {
      const MockComponent = createMockLabjsComponent();
      const EnhancedComponent = withSlopit(MockComponent);

      const instance = new EnhancedComponent({
        slopit: { keystroke: { enabled: true } },
      });

      (instance as MockComponentInstance).trigger("run");

      // Element does not exist yet; create it after a delay
      await new Promise((resolve) => setTimeout(resolve, 10));

      const textarea = document.createElement("textarea");
      container.appendChild(textarea);

      // Wait for MutationObserver to detect the element
      await new Promise((resolve) => setTimeout(resolve, 50));

      textarea.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "e",
          code: "KeyE",
          bubbles: true,
        }),
      );

      (instance as MockComponentInstance).trigger("end");

      const data = instance.data["slopit"] as { behavioral: { keystrokes: unknown[] } };
      expect(data.behavioral.keystrokes.length).toBeGreaterThanOrEqual(1);
    });

    it("should use custom containerSelector when provided", () => {
      // Create a custom container
      const customContainer = document.createElement("div");
      customContainer.id = "custom-container";
      document.body.appendChild(customContainer);

      const textarea = document.createElement("textarea");
      customContainer.appendChild(textarea);

      const MockComponent = createMockLabjsComponent();
      const EnhancedComponent = withSlopit(MockComponent);

      const instance = new EnhancedComponent({
        slopit: {
          containerSelector: "#custom-container",
          keystroke: { enabled: true },
        },
      });

      (instance as MockComponentInstance).trigger("run");

      textarea.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "f",
          code: "KeyF",
          bubbles: true,
        }),
      );

      (instance as MockComponentInstance).trigger("end");

      const data = instance.data["slopit"] as { behavioral: { keystrokes: unknown[] } };
      expect(data.behavioral.keystrokes.length).toBeGreaterThanOrEqual(1);

      customContainer.remove();
    });
  });

  describe("behavioral capture", () => {
    it("should capture keystrokes when enabled", () => {
      const textarea = document.createElement("textarea");
      container.appendChild(textarea);

      const MockComponent = createMockLabjsComponent();
      const EnhancedComponent = withSlopit(MockComponent);

      const instance = new EnhancedComponent({
        slopit: { keystroke: { enabled: true } },
      });

      (instance as MockComponentInstance).trigger("run");

      vi.spyOn(performance, "now").mockReturnValue(100);
      textarea.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "g",
          code: "KeyG",
          bubbles: true,
        }),
      );

      vi.spyOn(performance, "now").mockReturnValue(200);
      textarea.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "h",
          code: "KeyH",
          bubbles: true,
        }),
      );

      (instance as MockComponentInstance).trigger("end");

      const data = instance.data["slopit"] as { behavioral: { keystrokes: unknown[] } };
      expect(data.behavioral.keystrokes.length).toBe(2);
    });

    it("should not capture keystrokes when disabled", () => {
      const textarea = document.createElement("textarea");
      container.appendChild(textarea);

      const MockComponent = createMockLabjsComponent();
      const EnhancedComponent = withSlopit(MockComponent);

      const instance = new EnhancedComponent({
        slopit: { keystroke: { enabled: false } },
      });

      (instance as MockComponentInstance).trigger("run");

      textarea.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "i",
          code: "KeyI",
          bubbles: true,
        }),
      );

      (instance as MockComponentInstance).trigger("end");

      const data = instance.data["slopit"] as { behavioral: { keystrokes: unknown[] } };
      expect(data.behavioral.keystrokes.length).toBe(0);
    });

    it("should capture paste events", () => {
      const textarea = document.createElement("textarea");
      container.appendChild(textarea);

      const MockComponent = createMockLabjsComponent();
      const EnhancedComponent = withSlopit(MockComponent);

      const instance = new EnhancedComponent({
        slopit: {
          keystroke: { enabled: true },
          paste: { enabled: true, prevent: false },
        },
      });

      (instance as MockComponentInstance).trigger("run");

      const clipboardData = {
        getData: (type: string) => (type === "text/plain" ? "pasted content" : ""),
      } as DataTransfer;

      const pasteEvent = new MockClipboardEvent("paste", {
        clipboardData,
        bubbles: true,
      });
      textarea.dispatchEvent(pasteEvent);

      (instance as MockComponentInstance).trigger("end");

      const data = instance.data["slopit"] as { behavioral: { paste: unknown[] } };
      expect(data.behavioral.paste.length).toBe(1);
    });

    it("should include flags in output", () => {
      const textarea = document.createElement("textarea");
      container.appendChild(textarea);

      const MockComponent = createMockLabjsComponent();
      const EnhancedComponent = withSlopit(MockComponent);

      const instance = new EnhancedComponent({
        slopit: { keystroke: { enabled: true } },
      });

      (instance as MockComponentInstance).trigger("run");

      textarea.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "j",
          code: "KeyJ",
          bubbles: true,
        }),
      );

      (instance as MockComponentInstance).trigger("end");

      const data = instance.data["slopit"] as { flags: unknown[] };
      expect(Array.isArray(data.flags)).toBe(true);
    });
  });

  describe("getSlopitData", () => {
    it("should return null before component ends", () => {
      const textarea = document.createElement("textarea");
      container.appendChild(textarea);

      const MockComponent = createMockLabjsComponent();
      const EnhancedComponent = withSlopit(MockComponent);

      const instance = new EnhancedComponent({
        slopit: { keystroke: { enabled: true } },
      }) as LabjsComponentLike & { getSlopitData(): unknown };

      (instance as MockComponentInstance).trigger("run");

      expect(instance.getSlopitData()).toBeNull();
    });

    it("should return captured data after component ends", () => {
      const textarea = document.createElement("textarea");
      container.appendChild(textarea);

      const MockComponent = createMockLabjsComponent();
      const EnhancedComponent = withSlopit(MockComponent);

      const instance = new EnhancedComponent({
        slopit: { keystroke: { enabled: true } },
      }) as LabjsComponentLike & { getSlopitData(): unknown };

      (instance as MockComponentInstance).trigger("run");

      textarea.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "k",
          code: "KeyK",
          bubbles: true,
        }),
      );

      (instance as MockComponentInstance).trigger("end");

      const data = instance.getSlopitData() as { behavioral: { keystrokes: unknown[] } };
      expect(data).not.toBeNull();
      expect(data.behavioral.keystrokes.length).toBeGreaterThanOrEqual(1);
    });

    it("should return null when slopit was not configured", () => {
      const MockComponent = createMockLabjsComponent();
      const EnhancedComponent = withSlopit(MockComponent);

      const instance = new EnhancedComponent({}) as LabjsComponentLike & {
        getSlopitData(): unknown;
      };

      (instance as MockComponentInstance).trigger("run");
      (instance as MockComponentInstance).trigger("end");

      expect(instance.getSlopitData()).toBeNull();
    });
  });

  describe("cleanup", () => {
    it("should clean up MutationObserver on end", async () => {
      const MockComponent = createMockLabjsComponent();
      const EnhancedComponent = withSlopit(MockComponent);

      const instance = new EnhancedComponent({
        slopit: { keystroke: { enabled: true } },
      });

      (instance as MockComponentInstance).trigger("run");

      // End before element is found
      (instance as MockComponentInstance).trigger("end");

      // Adding element after end should not cause issues
      const textarea = document.createElement("textarea");
      container.appendChild(textarea);

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Data should not have been attached
      expect(instance.data["slopit"]).toBeUndefined();
    });

    it("should allow reuse after cleanup", () => {
      const MockComponent = createMockLabjsComponent();
      const EnhancedComponent = withSlopit(MockComponent);

      // First trial
      const instance1 = new EnhancedComponent({
        slopit: { keystroke: { enabled: true } },
      });

      const textarea1 = document.createElement("textarea");
      container.appendChild(textarea1);

      (instance1 as MockComponentInstance).trigger("run");
      textarea1.dispatchEvent(
        new KeyboardEvent("keydown", { key: "l", code: "KeyL", bubbles: true }),
      );
      (instance1 as MockComponentInstance).trigger("end");

      container.innerHTML = "";

      // Second trial
      const instance2 = new EnhancedComponent({
        slopit: { keystroke: { enabled: true } },
      });

      const textarea2 = document.createElement("textarea");
      container.appendChild(textarea2);

      (instance2 as MockComponentInstance).trigger("run");
      textarea2.dispatchEvent(
        new KeyboardEvent("keydown", { key: "m", code: "KeyM", bubbles: true }),
      );
      (instance2 as MockComponentInstance).trigger("end");

      const data1 = instance1.data["slopit"] as { behavioral: { keystrokes: unknown[] } };
      const data2 = instance2.data["slopit"] as { behavioral: { keystrokes: unknown[] } };

      expect(data1.behavioral.keystrokes.length).toBeGreaterThanOrEqual(1);
      expect(data2.behavioral.keystrokes.length).toBeGreaterThanOrEqual(1);
    });
  });
});

/**
 * Mock component instance with trigger method for testing.
 */
interface MockComponentInstance extends LabjsComponentLike {
  trigger(event: string, ...args: unknown[]): void;
}
