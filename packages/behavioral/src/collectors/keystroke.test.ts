import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { KeystrokeCollector } from "./keystroke.js";

describe("KeystrokeCollector", () => {
  let collector: KeystrokeCollector;
  let element: HTMLTextAreaElement;
  let onEventMock: ReturnType<typeof vi.fn>;

  const defaultConfig = {
    enabled: true,
    captureKeyUp: true,
    includeModifiers: true,
  };

  beforeEach(() => {
    element = document.createElement("textarea");
    document.body.appendChild(element);
    onEventMock = vi.fn();

    // Mock performance.now() for consistent timing
    vi.spyOn(performance, "now").mockReturnValue(1000);
  });

  afterEach(() => {
    collector?.detach();
    element.remove();
    vi.restoreAllMocks();
  });

  const createKeyboardEvent = (
    type: "keydown" | "keyup",
    key: string,
    code: string,
    options?: Partial<KeyboardEventInit>,
  ): KeyboardEvent => {
    return new KeyboardEvent(type, {
      key,
      code,
      bubbles: true,
      shiftKey: false,
      ctrlKey: false,
      altKey: false,
      metaKey: false,
      ...options,
    });
  };

  describe("attach and detach", () => {
    it("should attach event listeners to element", () => {
      collector = new KeystrokeCollector(defaultConfig, 0, onEventMock);
      const addEventListenerSpy = vi.spyOn(element, "addEventListener");

      collector.attach(element);

      expect(addEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith("keyup", expect.any(Function));
    });

    it("should not attach keyup listener when captureKeyUp is false", () => {
      collector = new KeystrokeCollector({ ...defaultConfig, captureKeyUp: false }, 0, onEventMock);
      const addEventListenerSpy = vi.spyOn(element, "addEventListener");

      collector.attach(element);

      expect(addEventListenerSpy).toHaveBeenCalledTimes(1);
      expect(addEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
    });

    it("should remove event listeners on detach", () => {
      collector = new KeystrokeCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);
      const removeEventListenerSpy = vi.spyOn(element, "removeEventListener");

      collector.detach();

      expect(removeEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith("keyup", expect.any(Function));
    });

    it("should handle detach when not attached", () => {
      collector = new KeystrokeCollector(defaultConfig, 0, onEventMock);

      // Should not throw
      expect(() => collector.detach()).not.toThrow();
    });

    it("should attach to document", () => {
      collector = new KeystrokeCollector(defaultConfig, 0, onEventMock);
      const addEventListenerSpy = vi.spyOn(document, "addEventListener");

      collector.attach(document);

      expect(addEventListenerSpy).toHaveBeenCalled();
    });
  });

  describe("event recording", () => {
    it("should record keydown events", () => {
      collector = new KeystrokeCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createKeyboardEvent("keydown", "a", "KeyA"));

      const events = collector.getEvents();
      expect(events.length).toBe(1);
      expect(events[0]).toMatchObject({
        time: 100,
        key: "a",
        code: "KeyA",
        event: "keydown",
      });
    });

    it("should record keyup events when enabled", () => {
      collector = new KeystrokeCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(150);
      element.dispatchEvent(createKeyboardEvent("keyup", "a", "KeyA"));

      const events = collector.getEvents();
      expect(events.length).toBe(1);
      expect(events[0]?.event).toBe("keyup");
    });

    it("should not record keyup when disabled", () => {
      collector = new KeystrokeCollector({ ...defaultConfig, captureKeyUp: false }, 0, onEventMock);
      collector.attach(element);

      element.dispatchEvent(createKeyboardEvent("keydown", "a", "KeyA"));
      element.dispatchEvent(createKeyboardEvent("keyup", "a", "KeyA"));

      const events = collector.getEvents();
      expect(events.length).toBe(1);
      expect(events[0]?.event).toBe("keydown");
    });

    it("should calculate time relative to start time", () => {
      collector = new KeystrokeCollector(defaultConfig, 100, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(350);
      element.dispatchEvent(createKeyboardEvent("keydown", "a", "KeyA"));

      const events = collector.getEvents();
      expect(events[0]?.time).toBe(250); // 350 - 100
    });

    it("should capture modifier states when enabled", () => {
      collector = new KeystrokeCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      element.dispatchEvent(
        createKeyboardEvent("keydown", "A", "KeyA", {
          shiftKey: true,
          ctrlKey: false,
          altKey: true,
          metaKey: false,
        }),
      );

      const events = collector.getEvents();
      expect(events[0]?.modifiers).toEqual({
        shift: true,
        ctrl: false,
        alt: true,
        meta: false,
      });
    });

    it("should not capture modifiers when disabled", () => {
      collector = new KeystrokeCollector(
        { ...defaultConfig, includeModifiers: false },
        0,
        onEventMock,
      );
      collector.attach(element);

      element.dispatchEvent(createKeyboardEvent("keydown", "A", "KeyA", { shiftKey: true }));

      const events = collector.getEvents();
      expect(events[0]?.modifiers).toBeUndefined();
    });

    it("should capture text length from textarea", () => {
      collector = new KeystrokeCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      element.value = "hello";
      element.dispatchEvent(createKeyboardEvent("keydown", "a", "KeyA"));

      const events = collector.getEvents();
      expect(events[0]?.textLength).toBe(5);
    });

    it("should capture text length from input element", () => {
      const input = document.createElement("input");
      document.body.appendChild(input);

      collector = new KeystrokeCollector(defaultConfig, 0, onEventMock);
      collector.attach(input);

      input.value = "test";
      input.dispatchEvent(createKeyboardEvent("keydown", "a", "KeyA"));

      const events = collector.getEvents();
      expect(events[0]?.textLength).toBe(4);

      input.remove();
    });

    it("should call onEvent callback", () => {
      collector = new KeystrokeCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      element.dispatchEvent(createKeyboardEvent("keydown", "a", "KeyA"));

      expect(onEventMock).toHaveBeenCalledTimes(1);
      expect(onEventMock).toHaveBeenCalledWith(
        expect.objectContaining({
          key: "a",
          code: "KeyA",
          event: "keydown",
        }),
      );
    });
  });

  describe("getEvents", () => {
    it("should return a copy of events array", () => {
      collector = new KeystrokeCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      element.dispatchEvent(createKeyboardEvent("keydown", "a", "KeyA"));

      const events1 = collector.getEvents();
      const events2 = collector.getEvents();

      expect(events1).toEqual(events2);
      expect(events1).not.toBe(events2); // Different references
    });

    it("should return empty array when no events", () => {
      collector = new KeystrokeCollector(defaultConfig, 0, onEventMock);

      expect(collector.getEvents()).toEqual([]);
    });
  });

  describe("getFirstKeystrokeTime", () => {
    it("should return time of first keydown", () => {
      collector = new KeystrokeCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(500);
      element.dispatchEvent(createKeyboardEvent("keydown", "a", "KeyA"));

      vi.spyOn(performance, "now").mockReturnValue(600);
      element.dispatchEvent(createKeyboardEvent("keydown", "b", "KeyB"));

      expect(collector.getFirstKeystrokeTime()).toBe(500);
    });

    it("should ignore keyup for first keystroke time", () => {
      collector = new KeystrokeCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createKeyboardEvent("keyup", "a", "KeyA"));

      vi.spyOn(performance, "now").mockReturnValue(200);
      element.dispatchEvent(createKeyboardEvent("keydown", "b", "KeyB"));

      expect(collector.getFirstKeystrokeTime()).toBe(200);
    });

    it("should return undefined when no keydowns", () => {
      collector = new KeystrokeCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      element.dispatchEvent(createKeyboardEvent("keyup", "a", "KeyA"));

      expect(collector.getFirstKeystrokeTime()).toBeUndefined();
    });

    it("should return undefined when no events", () => {
      collector = new KeystrokeCollector(defaultConfig, 0, onEventMock);

      expect(collector.getFirstKeystrokeTime()).toBeUndefined();
    });
  });

  describe("getRecentCount", () => {
    it("should count events within time window", () => {
      collector = new KeystrokeCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      // Events at relative times 100, 200, 300
      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createKeyboardEvent("keydown", "a", "KeyA"));

      vi.spyOn(performance, "now").mockReturnValue(200);
      element.dispatchEvent(createKeyboardEvent("keydown", "b", "KeyB"));

      vi.spyOn(performance, "now").mockReturnValue(300);
      element.dispatchEvent(createKeyboardEvent("keydown", "c", "KeyC"));

      // Current time is 350, window of 200ms includes events at 200 and 300
      vi.spyOn(performance, "now").mockReturnValue(350);
      expect(collector.getRecentCount(200)).toBe(2);
    });

    it("should return 0 when no recent events", () => {
      collector = new KeystrokeCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createKeyboardEvent("keydown", "a", "KeyA"));

      vi.spyOn(performance, "now").mockReturnValue(5000);
      expect(collector.getRecentCount(100)).toBe(0);
    });

    it("should return all events when window is large", () => {
      collector = new KeystrokeCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createKeyboardEvent("keydown", "a", "KeyA"));

      vi.spyOn(performance, "now").mockReturnValue(200);
      element.dispatchEvent(createKeyboardEvent("keydown", "b", "KeyB"));

      vi.spyOn(performance, "now").mockReturnValue(300);
      expect(collector.getRecentCount(10000)).toBe(2);
    });
  });

  describe("reset", () => {
    it("should clear all events", () => {
      collector = new KeystrokeCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      element.dispatchEvent(createKeyboardEvent("keydown", "a", "KeyA"));
      element.dispatchEvent(createKeyboardEvent("keydown", "b", "KeyB"));

      collector.reset();

      expect(collector.getEvents()).toEqual([]);
    });

    it("should reset first keystroke time", () => {
      collector = new KeystrokeCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      element.dispatchEvent(createKeyboardEvent("keydown", "a", "KeyA"));
      collector.reset();

      expect(collector.getFirstKeystrokeTime()).toBeUndefined();
    });

    it("should update start time when provided", () => {
      collector = new KeystrokeCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      collector.reset(1000);

      vi.spyOn(performance, "now").mockReturnValue(1200);
      element.dispatchEvent(createKeyboardEvent("keydown", "a", "KeyA"));

      const events = collector.getEvents();
      expect(events[0]?.time).toBe(200); // 1200 - 1000
    });

    it("should keep start time when not provided", () => {
      collector = new KeystrokeCollector(defaultConfig, 100, onEventMock);
      collector.attach(element);

      collector.reset();

      vi.spyOn(performance, "now").mockReturnValue(300);
      element.dispatchEvent(createKeyboardEvent("keydown", "a", "KeyA"));

      const events = collector.getEvents();
      expect(events[0]?.time).toBe(200); // 300 - 100
    });
  });

  describe("special keys", () => {
    it("should capture Backspace", () => {
      collector = new KeystrokeCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      element.dispatchEvent(createKeyboardEvent("keydown", "Backspace", "Backspace"));

      const events = collector.getEvents();
      expect(events[0]).toMatchObject({
        key: "Backspace",
        code: "Backspace",
      });
    });

    it("should capture Enter", () => {
      collector = new KeystrokeCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      element.dispatchEvent(createKeyboardEvent("keydown", "Enter", "Enter"));

      const events = collector.getEvents();
      expect(events[0]?.key).toBe("Enter");
    });

    it("should capture modifier keys", () => {
      collector = new KeystrokeCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      element.dispatchEvent(createKeyboardEvent("keydown", "Shift", "ShiftLeft"));
      element.dispatchEvent(createKeyboardEvent("keydown", "Control", "ControlLeft"));

      const events = collector.getEvents();
      expect(events[0]?.key).toBe("Shift");
      expect(events[1]?.key).toBe("Control");
    });

    it("should capture function keys", () => {
      collector = new KeystrokeCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      element.dispatchEvent(createKeyboardEvent("keydown", "F1", "F1"));

      const events = collector.getEvents();
      expect(events[0]?.key).toBe("F1");
    });
  });
});
