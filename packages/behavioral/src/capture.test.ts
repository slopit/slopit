import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BehavioralCapture, createBehavioralCapture } from "./capture.js";

// Polyfill ClipboardEvent for jsdom
class MockClipboardEvent extends Event {
  clipboardData: DataTransfer | null;

  constructor(type: string, eventInitDict?: ClipboardEventInit) {
    super(type, eventInitDict);
    this.clipboardData = eventInitDict?.clipboardData ?? null;
  }
}

describe("BehavioralCapture", () => {
  let capture: BehavioralCapture;
  let element: HTMLTextAreaElement;

  beforeEach(() => {
    element = document.createElement("textarea");
    document.body.appendChild(element);
    vi.spyOn(performance, "now").mockReturnValue(0);
  });

  afterEach(() => {
    capture?.detach();
    element.remove();
    vi.restoreAllMocks();
  });

  const createKeyboardEvent = (
    type: "keydown" | "keyup",
    key: string,
    code: string,
  ): KeyboardEvent => {
    return new KeyboardEvent(type, {
      key,
      code,
      bubbles: true,
    });
  };

  const createPasteEvent = (text: string): Event => {
    const clipboardData = {
      getData: (type: string) => (type === "text/plain" ? text : ""),
    } as DataTransfer;
    return new MockClipboardEvent("paste", {
      clipboardData,
      bubbles: true,
    });
  };

  describe("constructor and config normalization", () => {
    it("should create instance with default config", () => {
      capture = new BehavioralCapture({});
      expect(capture).toBeInstanceOf(BehavioralCapture);
    });

    it("should use defaults for missing config options", () => {
      capture = new BehavioralCapture({});
      capture.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createKeyboardEvent("keydown", "a", "KeyA"));

      const data = capture.getData();
      expect(data.keystrokes?.length).toBe(1);
    });

    it("should disable keystroke capture when configured", () => {
      capture = new BehavioralCapture({ keystroke: { enabled: false } });
      capture.attach(element);

      element.dispatchEvent(createKeyboardEvent("keydown", "a", "KeyA"));

      const data = capture.getData();
      expect(data.keystrokes).toEqual([]);
    });

    it("should disable focus capture when configured", () => {
      capture = new BehavioralCapture({ focus: { enabled: false } });
      capture.attach(element);

      window.dispatchEvent(new Event("blur"));

      const data = capture.getData();
      expect(data.focus).toEqual([]);
    });

    it("should disable paste capture when configured", () => {
      capture = new BehavioralCapture({ clipboard: { enabled: false } });
      capture.attach(element);

      element.dispatchEvent(createPasteEvent("Test"));

      const data = capture.getData();
      expect(data.paste).toEqual([]);
    });

    it("should disable paste capture when only capturePaste is false", () => {
      capture = new BehavioralCapture({ clipboard: { capturePaste: false } });
      capture.attach(element);

      element.dispatchEvent(createPasteEvent("Test"));

      const data = capture.getData();
      expect(data.paste).toEqual([]);
    });
  });

  describe("attach", () => {
    it("should attach to HTMLElement", () => {
      capture = new BehavioralCapture({});
      capture.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createKeyboardEvent("keydown", "a", "KeyA"));

      const data = capture.getData();
      expect(data.keystrokes?.length).toBe(1);
    });

    it("should attach to document", () => {
      capture = new BehavioralCapture({});
      capture.attach(document);

      // Focus events should be captured at document level
      window.dispatchEvent(new Event("blur"));

      const data = capture.getData();
      expect(data.focus?.length).toBe(1);
    });

    it("should use provided start time", () => {
      capture = new BehavioralCapture({});
      capture.attach(element, 500);

      vi.spyOn(performance, "now").mockReturnValue(700);
      element.dispatchEvent(createKeyboardEvent("keydown", "a", "KeyA"));

      const data = capture.getData();
      expect(data.keystrokes?.[0]?.time).toBe(200); // 700 - 500
    });

    it("should use performance.now() when no start time provided", () => {
      vi.spyOn(performance, "now").mockReturnValue(1000);
      capture = new BehavioralCapture({});
      capture.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(1200);
      element.dispatchEvent(createKeyboardEvent("keydown", "a", "KeyA"));

      const data = capture.getData();
      expect(data.keystrokes?.[0]?.time).toBe(200);
    });
  });

  describe("detach", () => {
    it("should stop capturing events after detach", () => {
      capture = new BehavioralCapture({});
      capture.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createKeyboardEvent("keydown", "a", "KeyA"));

      // Verify keystroke was captured before detach
      const dataBeforeDetach = capture.getData();
      expect(dataBeforeDetach.keystrokes?.length).toBe(1);

      capture.detach();

      // After detach, getData returns empty arrays (collectors are null)
      const dataAfterDetach = capture.getData();
      expect(dataAfterDetach.keystrokes).toEqual([]);
    });

    it("should not capture events dispatched after detach", () => {
      capture = new BehavioralCapture({});
      const handler = vi.fn();

      capture.on("keystroke", handler);
      capture.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createKeyboardEvent("keydown", "a", "KeyA"));
      expect(handler).toHaveBeenCalledTimes(1);

      capture.detach();

      vi.spyOn(performance, "now").mockReturnValue(200);
      element.dispatchEvent(createKeyboardEvent("keydown", "b", "KeyB"));

      // Handler should not have been called again after detach
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should handle detach when not attached", () => {
      capture = new BehavioralCapture({});
      expect(() => capture.detach()).not.toThrow();
    });

    it("should handle multiple detach calls", () => {
      capture = new BehavioralCapture({});
      capture.attach(element);
      capture.detach();

      expect(() => capture.detach()).not.toThrow();
    });
  });

  describe("reset", () => {
    it("should clear all captured data", () => {
      capture = new BehavioralCapture({});
      capture.attach(element);

      element.dispatchEvent(createKeyboardEvent("keydown", "a", "KeyA"));
      window.dispatchEvent(new Event("blur"));
      element.dispatchEvent(createPasteEvent("Test"));

      capture.reset();

      const data = capture.getData();
      expect(data.keystrokes).toEqual([]);
      expect(data.focus).toEqual([]);
      expect(data.paste).toEqual([]);
    });

    it("should update start time when provided", () => {
      capture = new BehavioralCapture({});
      capture.attach(element);

      capture.reset(1000);

      vi.spyOn(performance, "now").mockReturnValue(1300);
      element.dispatchEvent(createKeyboardEvent("keydown", "a", "KeyA"));

      const data = capture.getData();
      expect(data.keystrokes?.[0]?.time).toBe(300);
    });

    it("should use performance.now() when no start time provided", () => {
      capture = new BehavioralCapture({});
      capture.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(2000);
      capture.reset();

      vi.spyOn(performance, "now").mockReturnValue(2500);
      element.dispatchEvent(createKeyboardEvent("keydown", "a", "KeyA"));

      const data = capture.getData();
      expect(data.keystrokes?.[0]?.time).toBe(500);
    });
  });

  describe("getData", () => {
    it("should return all captured data", () => {
      capture = new BehavioralCapture({});
      capture.attach(element);

      element.dispatchEvent(createKeyboardEvent("keydown", "a", "KeyA"));
      window.dispatchEvent(new Event("blur"));
      element.dispatchEvent(createPasteEvent("Test"));

      const data = capture.getData();

      expect(data.keystrokes?.length).toBeGreaterThan(0);
      expect(data.focus?.length).toBeGreaterThan(0);
      expect(data.paste?.length).toBeGreaterThan(0);
      expect(data.metrics).toBeDefined();
    });

    it("should return empty arrays when nothing captured", () => {
      capture = new BehavioralCapture({});
      capture.attach(element);

      const data = capture.getData();

      expect(data.keystrokes).toEqual([]);
      expect(data.focus).toEqual([]);
      expect(data.paste).toEqual([]);
    });

    it("should include computed metrics", () => {
      capture = new BehavioralCapture({});
      capture.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(0);
      element.dispatchEvent(createKeyboardEvent("keydown", "a", "KeyA"));

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createKeyboardEvent("keydown", "b", "KeyB"));

      const data = capture.getData();

      expect(data.metrics?.keystroke).toBeDefined();
      expect(data.metrics?.timing).toBeDefined();
    });
  });

  describe("getMetrics", () => {
    it("should compute keystroke metrics when keystrokes exist", () => {
      capture = new BehavioralCapture({});
      capture.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.value = "a";
      element.dispatchEvent(createKeyboardEvent("keydown", "a", "KeyA"));

      vi.spyOn(performance, "now").mockReturnValue(200);
      element.value = "ab";
      element.dispatchEvent(createKeyboardEvent("keydown", "b", "KeyB"));

      const metrics = capture.getMetrics();

      expect(metrics.keystroke).toBeDefined();
      expect(metrics.keystroke?.totalKeystrokes).toBe(2);
    });

    it("should not include keystroke metrics when no keystrokes", () => {
      capture = new BehavioralCapture({});
      capture.attach(element);

      const metrics = capture.getMetrics();

      expect(metrics.keystroke).toBeUndefined();
    });

    it("should compute focus metrics when focus events exist", () => {
      capture = new BehavioralCapture({});
      capture.attach(element);

      window.dispatchEvent(new Event("blur"));

      const metrics = capture.getMetrics();

      expect(metrics.focus).toBeDefined();
      expect(metrics.focus?.blurCount).toBe(1);
    });

    it("should not include focus metrics when no focus events", () => {
      capture = new BehavioralCapture({});
      capture.attach(element);

      const metrics = capture.getMetrics();

      expect(metrics.focus).toBeUndefined();
    });

    it("should always include timing metrics", () => {
      capture = new BehavioralCapture({});
      capture.attach(element);

      const metrics = capture.getMetrics();

      expect(metrics.timing).toBeDefined();
      expect(metrics.timing?.totalResponseTime).toBeDefined();
    });
  });

  describe("getFlags", () => {
    it("should generate flag for paste events", () => {
      capture = new BehavioralCapture({});
      capture.attach(element);

      element.dispatchEvent(createPasteEvent("Test paste"));

      const flags = capture.getFlags();

      expect(flags.length).toBe(1);
      expect(flags[0]?.type).toBe("paste_detected");
      expect(flags[0]?.severity).toBe("medium");
    });

    it("should include paste count in flag details", () => {
      capture = new BehavioralCapture({});
      capture.attach(element);

      element.dispatchEvent(createPasteEvent("Test 1"));
      element.dispatchEvent(createPasteEvent("Test 2"));

      const flags = capture.getFlags();

      expect(flags[0]?.details?.["count"]).toBe(2);
    });

    it("should generate flag for excessive blur events", () => {
      capture = new BehavioralCapture({});
      capture.attach(element);

      for (let i = 0; i < 6; i++) {
        window.dispatchEvent(new Event("blur"));
        window.dispatchEvent(new Event("focus"));
      }

      const flags = capture.getFlags();

      const blurFlag = flags.find((f) => f.type === "excessive_blur");
      expect(blurFlag).toBeDefined();
      expect(blurFlag?.severity).toBe("low");
    });

    it("should not generate blur flag for 5 or fewer blurs", () => {
      capture = new BehavioralCapture({});
      capture.attach(element);

      for (let i = 0; i < 5; i++) {
        window.dispatchEvent(new Event("blur"));
        window.dispatchEvent(new Event("focus"));
      }

      const flags = capture.getFlags();

      const blurFlag = flags.find((f) => f.type === "excessive_blur");
      expect(blurFlag).toBeUndefined();
    });

    it("should return empty array when no flags", () => {
      capture = new BehavioralCapture({});
      capture.attach(element);

      element.dispatchEvent(createKeyboardEvent("keydown", "a", "KeyA"));

      const flags = capture.getFlags();
      expect(flags).toEqual([]);
    });
  });

  describe("event subscription (on/off)", () => {
    it("should emit keystroke events to subscribers", () => {
      capture = new BehavioralCapture({});
      const handler = vi.fn();

      capture.on("keystroke", handler);
      capture.attach(element);

      element.dispatchEvent(createKeyboardEvent("keydown", "a", "KeyA"));

      expect(handler).toHaveBeenCalledWith(expect.objectContaining({ key: "a", event: "keydown" }));
    });

    it("should emit focus events to subscribers", () => {
      capture = new BehavioralCapture({});
      const handler = vi.fn();

      capture.on("focus", handler);
      capture.attach(element);

      window.dispatchEvent(new Event("blur"));

      expect(handler).toHaveBeenCalledWith(expect.objectContaining({ event: "blur" }));
    });

    it("should emit paste events to subscribers", () => {
      capture = new BehavioralCapture({});
      const handler = vi.fn();

      capture.on("paste", handler);
      capture.attach(element);

      element.dispatchEvent(createPasteEvent("Test"));

      expect(handler).toHaveBeenCalledWith(expect.objectContaining({ textLength: 4 }));
    });

    it("should support multiple subscribers", () => {
      capture = new BehavioralCapture({});
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      capture.on("keystroke", handler1);
      capture.on("keystroke", handler2);
      capture.attach(element);

      element.dispatchEvent(createKeyboardEvent("keydown", "a", "KeyA"));

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it("should remove subscriber on off()", () => {
      capture = new BehavioralCapture({});
      const handler = vi.fn();

      capture.on("keystroke", handler);
      capture.off("keystroke", handler);
      capture.attach(element);

      element.dispatchEvent(createKeyboardEvent("keydown", "a", "KeyA"));

      expect(handler).not.toHaveBeenCalled();
    });

    it("should not affect other subscribers when one is removed", () => {
      capture = new BehavioralCapture({});
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      capture.on("keystroke", handler1);
      capture.on("keystroke", handler2);
      capture.off("keystroke", handler1);
      capture.attach(element);

      element.dispatchEvent(createKeyboardEvent("keydown", "a", "KeyA"));

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });
  });

  describe("integration: paste with keystrokes", () => {
    it("should track preceding keystrokes for paste events", () => {
      capture = new BehavioralCapture({});
      capture.attach(element);

      // Type some characters
      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createKeyboardEvent("keydown", "a", "KeyA"));

      vi.spyOn(performance, "now").mockReturnValue(200);
      element.dispatchEvent(createKeyboardEvent("keydown", "b", "KeyB"));

      vi.spyOn(performance, "now").mockReturnValue(300);
      element.dispatchEvent(createKeyboardEvent("keydown", "c", "KeyC"));

      // Paste
      vi.spyOn(performance, "now").mockReturnValue(400);
      element.dispatchEvent(createPasteEvent("pasted text"));

      const data = capture.getData();
      expect(data.paste?.[0]?.precedingKeystrokes).toBeGreaterThan(0);
    });
  });
});

describe("createBehavioralCapture", () => {
  it("should return BehavioralCapture instance", () => {
    const capture = createBehavioralCapture({});
    expect(capture).toBeInstanceOf(BehavioralCapture);
    capture.detach();
  });

  it("should pass config to instance", () => {
    const capture = createBehavioralCapture({
      keystroke: { enabled: false },
    });

    const element = document.createElement("textarea");
    document.body.appendChild(element);
    capture.attach(element);

    element.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "a",
        code: "KeyA",
        bubbles: true,
      }),
    );

    const data = capture.getData();
    expect(data.keystrokes).toEqual([]);

    capture.detach();
    element.remove();
  });
});
