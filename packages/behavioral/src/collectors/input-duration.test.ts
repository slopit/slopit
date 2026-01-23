import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InputDurationCollector } from "./input-duration.js";

describe("InputDurationCollector", () => {
  let collector: InputDurationCollector;
  let element: HTMLTextAreaElement;
  let onEventMock: ReturnType<typeof vi.fn>;

  const defaultConfig = {
    enabled: true,
    trackKeystrokes: true,
    trackPastes: true,
  };

  beforeEach(() => {
    element = document.createElement("textarea");
    element.id = "test-input";
    document.body.appendChild(element);
    onEventMock = vi.fn();

    vi.spyOn(performance, "now").mockReturnValue(1000);
  });

  afterEach(() => {
    collector?.detach();
    element.remove();
    vi.restoreAllMocks();
  });

  describe("attach and detach", () => {
    it("should attach focus and blur listeners to element", () => {
      collector = new InputDurationCollector(defaultConfig, 0, onEventMock);
      const addEventListenerSpy = vi.spyOn(element, "addEventListener");

      collector.attach(element);

      expect(addEventListenerSpy).toHaveBeenCalledWith("focus", expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith("blur", expect.any(Function));
    });

    it("should not attach to document", () => {
      collector = new InputDurationCollector(defaultConfig, 0, onEventMock);
      const addEventListenerSpy = vi.spyOn(document, "addEventListener");

      collector.attach(document);

      expect(addEventListenerSpy).not.toHaveBeenCalled();
    });

    it("should remove listeners on detach", () => {
      collector = new InputDurationCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);
      const removeEventListenerSpy = vi.spyOn(element, "removeEventListener");

      collector.detach();

      expect(removeEventListenerSpy).toHaveBeenCalledWith("focus", expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith("blur", expect.any(Function));
    });

    it("should handle detach when not attached", () => {
      collector = new InputDurationCollector(defaultConfig, 0, onEventMock);

      expect(() => collector.detach()).not.toThrow();
    });

    it("should finalize focus session on detach", () => {
      collector = new InputDurationCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      // Start focus session
      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(new Event("focus"));

      // Detach while focused
      vi.spyOn(performance, "now").mockReturnValue(500);
      collector.detach();

      const events = collector.getEvents();
      expect(events.length).toBe(1);
      expect(events[0]?.duration).toBe(400); // 500 - 100
    });
  });

  describe("focus and blur tracking", () => {
    it("should record focus session when blur occurs", () => {
      collector = new InputDurationCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(new Event("focus"));

      vi.spyOn(performance, "now").mockReturnValue(500);
      element.dispatchEvent(new Event("blur"));

      const events = collector.getEvents();
      expect(events.length).toBe(1);
      expect(events[0]).toMatchObject({
        focusTime: 100,
        blurTime: 500,
        duration: 400,
      });
    });

    it("should calculate time relative to start time", () => {
      collector = new InputDurationCollector(defaultConfig, 100, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(200);
      element.dispatchEvent(new Event("focus"));

      vi.spyOn(performance, "now").mockReturnValue(400);
      element.dispatchEvent(new Event("blur"));

      const events = collector.getEvents();
      expect(events[0]?.focusTime).toBe(100); // 200 - 100
      expect(events[0]?.blurTime).toBe(300); // 400 - 100
      expect(events[0]?.duration).toBe(200);
    });

    it("should ignore double focus events", () => {
      collector = new InputDurationCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(new Event("focus"));

      vi.spyOn(performance, "now").mockReturnValue(200);
      element.dispatchEvent(new Event("focus")); // Second focus should be ignored

      vi.spyOn(performance, "now").mockReturnValue(500);
      element.dispatchEvent(new Event("blur"));

      const events = collector.getEvents();
      expect(events.length).toBe(1);
      expect(events[0]?.focusTime).toBe(100); // Should use first focus time
    });

    it("should ignore blur without prior focus", () => {
      collector = new InputDurationCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      element.dispatchEvent(new Event("blur"));

      expect(collector.getEvents()).toEqual([]);
    });

    it("should record multiple focus sessions", () => {
      collector = new InputDurationCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      // First session
      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(new Event("focus"));
      vi.spyOn(performance, "now").mockReturnValue(300);
      element.dispatchEvent(new Event("blur"));

      // Second session
      vi.spyOn(performance, "now").mockReturnValue(500);
      element.dispatchEvent(new Event("focus"));
      vi.spyOn(performance, "now").mockReturnValue(800);
      element.dispatchEvent(new Event("blur"));

      const events = collector.getEvents();
      expect(events.length).toBe(2);
      expect(events[0]?.duration).toBe(200);
      expect(events[1]?.duration).toBe(300);
    });

    it("should call onEvent callback", () => {
      collector = new InputDurationCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(new Event("focus"));

      vi.spyOn(performance, "now").mockReturnValue(500);
      element.dispatchEvent(new Event("blur"));

      expect(onEventMock).toHaveBeenCalledTimes(1);
      expect(onEventMock).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 400,
        }),
      );
    });
  });

  describe("element identification", () => {
    it("should capture element id", () => {
      collector = new InputDurationCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(new Event("focus"));

      vi.spyOn(performance, "now").mockReturnValue(200);
      element.dispatchEvent(new Event("blur"));

      const events = collector.getEvents();
      expect(events[0]?.elementId).toBe("test-input");
    });

    it("should fall back to name attribute if no id", () => {
      const input = document.createElement("input");
      input.name = "test-name";
      document.body.appendChild(input);

      collector = new InputDurationCollector(defaultConfig, 0, onEventMock);
      collector.attach(input);

      vi.spyOn(performance, "now").mockReturnValue(100);
      input.dispatchEvent(new Event("focus"));

      vi.spyOn(performance, "now").mockReturnValue(200);
      input.dispatchEvent(new Event("blur"));

      const events = collector.getEvents();
      expect(events[0]?.elementId).toBe("test-name");

      input.remove();
    });

    it("should not include elementId if none available", () => {
      const div = document.createElement("div");
      div.setAttribute("tabindex", "0"); // Make it focusable
      document.body.appendChild(div);

      collector = new InputDurationCollector(defaultConfig, 0, onEventMock);
      collector.attach(div);

      vi.spyOn(performance, "now").mockReturnValue(100);
      div.dispatchEvent(new Event("focus"));

      vi.spyOn(performance, "now").mockReturnValue(200);
      div.dispatchEvent(new Event("blur"));

      const events = collector.getEvents();
      expect(events[0]?.elementId).toBeUndefined();

      div.remove();
    });
  });

  describe("keystroke tracking", () => {
    it("should track keystrokes during focus when enabled", () => {
      collector = new InputDurationCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(new Event("focus"));

      collector.incrementKeystrokes();
      collector.incrementKeystrokes();
      collector.incrementKeystrokes();

      vi.spyOn(performance, "now").mockReturnValue(500);
      element.dispatchEvent(new Event("blur"));

      const events = collector.getEvents();
      expect(events[0]?.keystrokesDuringFocus).toBe(3);
    });

    it("should not track keystrokes when disabled", () => {
      collector = new InputDurationCollector(
        { ...defaultConfig, trackKeystrokes: false },
        0,
        onEventMock,
      );
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(new Event("focus"));

      collector.incrementKeystrokes();
      collector.incrementKeystrokes();

      vi.spyOn(performance, "now").mockReturnValue(500);
      element.dispatchEvent(new Event("blur"));

      const events = collector.getEvents();
      expect(events[0]?.keystrokesDuringFocus).toBeUndefined();
    });

    it("should not count keystrokes when not focused", () => {
      collector = new InputDurationCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      // Increment without focus
      collector.incrementKeystrokes();
      collector.incrementKeystrokes();

      // Now focus and blur
      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(new Event("focus"));

      vi.spyOn(performance, "now").mockReturnValue(500);
      element.dispatchEvent(new Event("blur"));

      const events = collector.getEvents();
      expect(events[0]?.keystrokesDuringFocus).toBe(0);
    });

    it("should reset keystroke count between sessions", () => {
      collector = new InputDurationCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      // First session with 2 keystrokes
      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(new Event("focus"));
      collector.incrementKeystrokes();
      collector.incrementKeystrokes();
      vi.spyOn(performance, "now").mockReturnValue(200);
      element.dispatchEvent(new Event("blur"));

      // Second session with 1 keystroke
      vi.spyOn(performance, "now").mockReturnValue(300);
      element.dispatchEvent(new Event("focus"));
      collector.incrementKeystrokes();
      vi.spyOn(performance, "now").mockReturnValue(400);
      element.dispatchEvent(new Event("blur"));

      const events = collector.getEvents();
      expect(events[0]?.keystrokesDuringFocus).toBe(2);
      expect(events[1]?.keystrokesDuringFocus).toBe(1);
    });
  });

  describe("paste tracking", () => {
    it("should track pastes during focus when enabled", () => {
      collector = new InputDurationCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(new Event("focus"));

      collector.incrementPastes();
      collector.incrementPastes();

      vi.spyOn(performance, "now").mockReturnValue(500);
      element.dispatchEvent(new Event("blur"));

      const events = collector.getEvents();
      expect(events[0]?.pastesDuringFocus).toBe(2);
    });

    it("should not track pastes when disabled", () => {
      collector = new InputDurationCollector(
        { ...defaultConfig, trackPastes: false },
        0,
        onEventMock,
      );
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(new Event("focus"));

      collector.incrementPastes();

      vi.spyOn(performance, "now").mockReturnValue(500);
      element.dispatchEvent(new Event("blur"));

      const events = collector.getEvents();
      expect(events[0]?.pastesDuringFocus).toBeUndefined();
    });

    it("should not count pastes when not focused", () => {
      collector = new InputDurationCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      // Increment without focus
      collector.incrementPastes();

      // Now focus and blur
      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(new Event("focus"));

      vi.spyOn(performance, "now").mockReturnValue(500);
      element.dispatchEvent(new Event("blur"));

      const events = collector.getEvents();
      expect(events[0]?.pastesDuringFocus).toBe(0);
    });
  });

  describe("getCurrentFocusStart", () => {
    it("should return current focus start time when focused", () => {
      collector = new InputDurationCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(new Event("focus"));

      expect(collector.getCurrentFocusStart()).toBe(100);
    });

    it("should return null when not focused", () => {
      collector = new InputDurationCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      expect(collector.getCurrentFocusStart()).toBeNull();
    });

    it("should return null after blur", () => {
      collector = new InputDurationCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(new Event("focus"));

      vi.spyOn(performance, "now").mockReturnValue(200);
      element.dispatchEvent(new Event("blur"));

      expect(collector.getCurrentFocusStart()).toBeNull();
    });
  });

  describe("getEvents", () => {
    it("should return a copy of events array", () => {
      collector = new InputDurationCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(new Event("focus"));
      vi.spyOn(performance, "now").mockReturnValue(200);
      element.dispatchEvent(new Event("blur"));

      const events1 = collector.getEvents();
      const events2 = collector.getEvents();

      expect(events1).toEqual(events2);
      expect(events1).not.toBe(events2);
    });

    it("should return empty array when no events", () => {
      collector = new InputDurationCollector(defaultConfig, 0, onEventMock);

      expect(collector.getEvents()).toEqual([]);
    });
  });

  describe("reset", () => {
    it("should clear all events", () => {
      collector = new InputDurationCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(new Event("focus"));
      vi.spyOn(performance, "now").mockReturnValue(200);
      element.dispatchEvent(new Event("blur"));

      collector.reset();

      expect(collector.getEvents()).toEqual([]);
    });

    it("should reset current focus state", () => {
      collector = new InputDurationCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(new Event("focus"));

      collector.reset();

      expect(collector.getCurrentFocusStart()).toBeNull();
    });

    it("should reset keystroke count", () => {
      collector = new InputDurationCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(new Event("focus"));
      collector.incrementKeystrokes();
      collector.incrementKeystrokes();

      collector.reset();

      // Start new session after reset
      vi.spyOn(performance, "now").mockReturnValue(200);
      element.dispatchEvent(new Event("focus"));
      vi.spyOn(performance, "now").mockReturnValue(300);
      element.dispatchEvent(new Event("blur"));

      const events = collector.getEvents();
      expect(events[0]?.keystrokesDuringFocus).toBe(0);
    });

    it("should reset paste count", () => {
      collector = new InputDurationCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(new Event("focus"));
      collector.incrementPastes();

      collector.reset();

      // Start new session after reset
      vi.spyOn(performance, "now").mockReturnValue(200);
      element.dispatchEvent(new Event("focus"));
      vi.spyOn(performance, "now").mockReturnValue(300);
      element.dispatchEvent(new Event("blur"));

      const events = collector.getEvents();
      expect(events[0]?.pastesDuringFocus).toBe(0);
    });

    it("should update start time when provided", () => {
      collector = new InputDurationCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      collector.reset(1000);

      vi.spyOn(performance, "now").mockReturnValue(1200);
      element.dispatchEvent(new Event("focus"));

      vi.spyOn(performance, "now").mockReturnValue(1400);
      element.dispatchEvent(new Event("blur"));

      const events = collector.getEvents();
      expect(events[0]?.focusTime).toBe(200); // 1200 - 1000
      expect(events[0]?.blurTime).toBe(400); // 1400 - 1000
    });

    it("should keep start time when not provided", () => {
      collector = new InputDurationCollector(defaultConfig, 100, onEventMock);
      collector.attach(element);

      collector.reset();

      vi.spyOn(performance, "now").mockReturnValue(300);
      element.dispatchEvent(new Event("focus"));

      vi.spyOn(performance, "now").mockReturnValue(500);
      element.dispatchEvent(new Event("blur"));

      const events = collector.getEvents();
      expect(events[0]?.focusTime).toBe(200); // 300 - 100
    });
  });

  describe("edge cases", () => {
    it("should handle very short focus sessions", () => {
      collector = new InputDurationCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(new Event("focus"));

      vi.spyOn(performance, "now").mockReturnValue(100); // Same time
      element.dispatchEvent(new Event("blur"));

      const events = collector.getEvents();
      expect(events[0]?.duration).toBe(0);
    });

    it("should handle rapid focus/blur cycles", () => {
      collector = new InputDurationCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      for (let i = 0; i < 5; i++) {
        vi.spyOn(performance, "now").mockReturnValue(i * 100);
        element.dispatchEvent(new Event("focus"));
        vi.spyOn(performance, "now").mockReturnValue(i * 100 + 50);
        element.dispatchEvent(new Event("blur"));
      }

      const events = collector.getEvents();
      expect(events.length).toBe(5);
      for (const event of events) {
        expect(event?.duration).toBe(50);
      }
    });

    it("should work with input element", () => {
      const input = document.createElement("input");
      input.id = "text-input";
      document.body.appendChild(input);

      collector = new InputDurationCollector(defaultConfig, 0, onEventMock);
      collector.attach(input);

      vi.spyOn(performance, "now").mockReturnValue(100);
      input.dispatchEvent(new Event("focus"));

      vi.spyOn(performance, "now").mockReturnValue(200);
      input.dispatchEvent(new Event("blur"));

      const events = collector.getEvents();
      expect(events.length).toBe(1);
      expect(events[0]?.elementId).toBe("text-input");

      input.remove();
    });

    it("should work with contenteditable element", () => {
      const div = document.createElement("div");
      div.setAttribute("contenteditable", "true");
      div.id = "editable-div";
      document.body.appendChild(div);

      collector = new InputDurationCollector(defaultConfig, 0, onEventMock);
      collector.attach(div);

      vi.spyOn(performance, "now").mockReturnValue(100);
      div.dispatchEvent(new Event("focus"));

      vi.spyOn(performance, "now").mockReturnValue(200);
      div.dispatchEvent(new Event("blur"));

      const events = collector.getEvents();
      expect(events.length).toBe(1);
      expect(events[0]?.elementId).toBe("editable-div");

      div.remove();
    });

    it("should track both keystrokes and pastes in same session", () => {
      collector = new InputDurationCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(new Event("focus"));

      collector.incrementKeystrokes();
      collector.incrementKeystrokes();
      collector.incrementPastes();
      collector.incrementKeystrokes();

      vi.spyOn(performance, "now").mockReturnValue(500);
      element.dispatchEvent(new Event("blur"));

      const events = collector.getEvents();
      expect(events[0]?.keystrokesDuringFocus).toBe(3);
      expect(events[0]?.pastesDuringFocus).toBe(1);
    });
  });
});
