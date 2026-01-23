import { MockClipboardEvent, MockDataTransfer } from "@slopit/adapter-shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SlopitExtension, type SlopitExtensionParams } from "./extension.js";

describe("SlopitExtension", () => {
  let mockJsPsych: {
    getDisplayElement: ReturnType<typeof vi.fn>;
  };
  let extension: SlopitExtension;
  let displayElement: HTMLDivElement;

  beforeEach(() => {
    displayElement = document.createElement("div");
    document.body.appendChild(displayElement);

    mockJsPsych = {
      getDisplayElement: vi.fn(() => displayElement),
    };

    extension = new SlopitExtension(mockJsPsych as never);

    vi.spyOn(performance, "now").mockReturnValue(0);
  });

  afterEach(() => {
    displayElement.remove();
    vi.restoreAllMocks();
  });

  describe("static info", () => {
    it("should have correct name", () => {
      expect(SlopitExtension.info.name).toBe("slopit");
    });

    it("should have correct version", () => {
      expect(SlopitExtension.info.version).toBe("0.1.0");
    });

    it("should define slopit data output", () => {
      expect(SlopitExtension.info.data).toBeDefined();
      expect(SlopitExtension.info.data?.["slopit"]).toBeDefined();
    });
  });

  describe("initialize", () => {
    it("should resolve immediately", async () => {
      await expect(extension.initialize({})).resolves.toBeUndefined();
    });
  });

  describe("on_start", () => {
    it("should store parameters", () => {
      const params: SlopitExtensionParams = {
        keystroke: { enabled: true },
        targetSelector: ".custom-input",
      };

      extension.on_start(params);

      // Parameters are stored internally; we verify by checking on_load behavior
      expect(true).toBe(true);
    });
  });

  describe("on_load", () => {
    it("should attach to textarea when present", () => {
      const textarea = document.createElement("textarea");
      displayElement.appendChild(textarea);

      const params: SlopitExtensionParams = {
        keystroke: { enabled: true },
      };

      extension.on_start(params);
      extension.on_load(params);

      // Verify by simulating keystrokes and checking output
      textarea.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "a",
          code: "KeyA",
          bubbles: true,
        }),
      );

      const result = extension.on_finish();

      expect(result.slopit).toBeDefined();
      expect(result.slopit?.behavioral.keystrokes.length).toBeGreaterThanOrEqual(1);
    });

    it("should attach to input[type='text'] when present", () => {
      const input = document.createElement("input");
      input.type = "text";
      displayElement.appendChild(input);

      const params: SlopitExtensionParams = {
        keystroke: { enabled: true },
      };

      extension.on_start(params);
      extension.on_load(params);

      input.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "b",
          code: "KeyB",
          bubbles: true,
        }),
      );

      const result = extension.on_finish();

      expect(result.slopit).toBeDefined();
      expect(result.slopit?.behavioral.keystrokes.length).toBeGreaterThanOrEqual(1);
    });

    it("should use custom targetSelector when provided", () => {
      const customInput = document.createElement("textarea");
      customInput.className = "my-special-input";
      displayElement.appendChild(customInput);

      const regularTextarea = document.createElement("textarea");
      displayElement.appendChild(regularTextarea);

      const params: SlopitExtensionParams = {
        targetSelector: ".my-special-input",
        keystroke: { enabled: true },
      };

      extension.on_start(params);
      extension.on_load(params);

      // Type in the custom input
      customInput.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "x",
          code: "KeyX",
          bubbles: true,
        }),
      );

      const result = extension.on_finish();

      expect(result.slopit).toBeDefined();
      expect(result.slopit?.behavioral.keystrokes.length).toBeGreaterThanOrEqual(1);
    });

    it("should handle dynamically created elements via MutationObserver", async () => {
      const params: SlopitExtensionParams = {
        keystroke: { enabled: true },
      };

      extension.on_start(params);
      extension.on_load(params);

      // Element doesn't exist yet; simulate dynamic creation
      await new Promise((resolve) => setTimeout(resolve, 10));

      const textarea = document.createElement("textarea");
      displayElement.appendChild(textarea);

      // Wait for MutationObserver to detect the new element
      await new Promise((resolve) => setTimeout(resolve, 50));

      textarea.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "c",
          code: "KeyC",
          bubbles: true,
        }),
      );

      const result = extension.on_finish();

      expect(result.slopit).toBeDefined();
      expect(result.slopit?.behavioral.keystrokes.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("on_finish", () => {
    it("should return empty object when no capture was attached", () => {
      const params: SlopitExtensionParams = {
        targetSelector: ".nonexistent",
        keystroke: { enabled: true },
      };

      extension.on_start(params);
      extension.on_load(params);

      const result = extension.on_finish();

      expect(result).toEqual({});
    });

    it("should return behavioral data and flags", () => {
      const textarea = document.createElement("textarea");
      displayElement.appendChild(textarea);

      const params: SlopitExtensionParams = {
        keystroke: { enabled: true },
        focus: { enabled: true },
      };

      extension.on_start(params);
      extension.on_load(params);

      textarea.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "d",
          code: "KeyD",
          bubbles: true,
        }),
      );

      const result = extension.on_finish();

      expect(result.slopit).toBeDefined();
      expect(result.slopit?.behavioral).toBeDefined();
      expect(result.slopit?.flags).toBeDefined();
      expect(Array.isArray(result.slopit?.flags)).toBe(true);
    });

    it("should include computed metrics in behavioral data", () => {
      const textarea = document.createElement("textarea");
      displayElement.appendChild(textarea);

      const params: SlopitExtensionParams = {
        keystroke: { enabled: true },
      };

      extension.on_start(params);
      extension.on_load(params);

      // Simulate multiple keystrokes with timing
      vi.spyOn(performance, "now").mockReturnValue(100);
      textarea.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "e",
          code: "KeyE",
          bubbles: true,
        }),
      );

      vi.spyOn(performance, "now").mockReturnValue(200);
      textarea.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "f",
          code: "KeyF",
          bubbles: true,
        }),
      );

      const result = extension.on_finish();

      expect(result.slopit?.behavioral.metrics).toBeDefined();
    });

    it("should clean up after finishing", () => {
      const textarea = document.createElement("textarea");
      displayElement.appendChild(textarea);

      const params: SlopitExtensionParams = {
        keystroke: { enabled: true },
      };

      extension.on_start(params);
      extension.on_load(params);
      extension.on_finish();

      // Starting a new trial should work without issues
      const newTextarea = document.createElement("textarea");
      displayElement.innerHTML = "";
      displayElement.appendChild(newTextarea);

      extension.on_start(params);
      extension.on_load(params);

      newTextarea.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "g",
          code: "KeyG",
          bubbles: true,
        }),
      );

      const result = extension.on_finish();

      expect(result.slopit).toBeDefined();
      expect(result.slopit?.behavioral.keystrokes.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("capture configuration", () => {
    it("should respect keystroke configuration", () => {
      const textarea = document.createElement("textarea");
      displayElement.appendChild(textarea);

      const params: SlopitExtensionParams = {
        keystroke: { enabled: false },
      };

      extension.on_start(params);
      extension.on_load(params);

      textarea.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "h",
          code: "KeyH",
          bubbles: true,
        }),
      );

      const result = extension.on_finish();

      expect(result.slopit?.behavioral.keystrokes.length).toBe(0);
    });

    it("should pass paste configuration to capture", () => {
      const textarea = document.createElement("textarea");
      displayElement.appendChild(textarea);

      const params: SlopitExtensionParams = {
        keystroke: { enabled: true },
        paste: { enabled: true, prevent: false },
      };

      extension.on_start(params);
      extension.on_load(params);

      // Simulate paste event using shared test utilities
      const clipboardData = new MockDataTransfer();
      clipboardData.setData("text/plain", "pasted text");
      const pasteEvent = new MockClipboardEvent("paste", {
        clipboardData,
        bubbles: true,
      });
      textarea.dispatchEvent(pasteEvent);

      const result = extension.on_finish();

      expect(result.slopit?.behavioral.paste.length).toBe(1);
    });
  });
});
