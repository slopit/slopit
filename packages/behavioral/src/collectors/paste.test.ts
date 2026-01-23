import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PasteCollector } from "./paste.js";

// Polyfill ClipboardEvent for jsdom
class MockClipboardEvent extends Event {
  clipboardData: DataTransfer | null;

  constructor(type: string, eventInitDict?: ClipboardEventInit) {
    super(type, eventInitDict);
    this.clipboardData = eventInitDict?.clipboardData ?? null;
  }
}

describe("PasteCollector", () => {
  let collector: PasteCollector;
  let element: HTMLTextAreaElement;
  let onEventMock: ReturnType<typeof vi.fn>;
  let getRecentKeystrokesMock: ReturnType<typeof vi.fn>;

  const defaultConfig = {
    enabled: true,
    prevent: false,
    capturePreview: true,
    previewLength: 100,
  };

  beforeEach(() => {
    element = document.createElement("textarea");
    document.body.appendChild(element);
    onEventMock = vi.fn();
    getRecentKeystrokesMock = vi.fn().mockReturnValue(5);

    vi.spyOn(performance, "now").mockReturnValue(1000);
  });

  afterEach(() => {
    collector?.detach();
    element.remove();
    vi.restoreAllMocks();
  });

  const createPasteEvent = (text: string): Event => {
    const clipboardData = {
      getData: (type: string) => (type === "text/plain" ? text : ""),
    } as DataTransfer;

    return new MockClipboardEvent("paste", {
      clipboardData,
      bubbles: true,
    });
  };

  describe("attach and detach", () => {
    it("should attach paste listener to element", () => {
      collector = new PasteCollector(defaultConfig, 0, getRecentKeystrokesMock, onEventMock);
      const addEventListenerSpy = vi.spyOn(element, "addEventListener");

      collector.attach(element);

      expect(addEventListenerSpy).toHaveBeenCalledWith("paste", expect.any(Function));
    });

    it("should remove listener on detach", () => {
      collector = new PasteCollector(defaultConfig, 0, getRecentKeystrokesMock, onEventMock);
      collector.attach(element);
      const removeEventListenerSpy = vi.spyOn(element, "removeEventListener");

      collector.detach();

      expect(removeEventListenerSpy).toHaveBeenCalledWith("paste", expect.any(Function));
    });

    it("should handle detach when not attached", () => {
      collector = new PasteCollector(defaultConfig, 0, getRecentKeystrokesMock, onEventMock);

      expect(() => collector.detach()).not.toThrow();
    });

    it("should attach to document", () => {
      collector = new PasteCollector(defaultConfig, 0, getRecentKeystrokesMock, onEventMock);
      const docAddSpy = vi.spyOn(document, "addEventListener");

      collector.attach(document);

      expect(docAddSpy).toHaveBeenCalledWith("paste", expect.any(Function));
    });
  });

  describe("paste event recording", () => {
    it("should record paste event with basic info", () => {
      collector = new PasteCollector(defaultConfig, 0, getRecentKeystrokesMock, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(500);
      element.dispatchEvent(createPasteEvent("Hello world"));

      const events = collector.getEvents();
      expect(events.length).toBe(1);
      expect(events[0]).toMatchObject({
        time: 500,
        textLength: 11,
        precedingKeystrokes: 5,
        blocked: false,
      });
    });

    it("should capture text preview when enabled", () => {
      collector = new PasteCollector(
        { ...defaultConfig, capturePreview: true },
        0,
        getRecentKeystrokesMock,
        onEventMock,
      );
      collector.attach(element);

      element.dispatchEvent(createPasteEvent("Test paste content"));

      const events = collector.getEvents();
      expect(events[0]?.textPreview).toBe("Test paste content");
    });

    it("should truncate preview to previewLength", () => {
      collector = new PasteCollector(
        { ...defaultConfig, capturePreview: true, previewLength: 10 },
        0,
        getRecentKeystrokesMock,
        onEventMock,
      );
      collector.attach(element);

      element.dispatchEvent(createPasteEvent("This is a very long text"));

      const events = collector.getEvents();
      expect(events[0]?.textPreview).toBe("This is a ");
      expect(events[0]?.textPreview?.length).toBe(10);
    });

    it("should not capture preview when disabled", () => {
      collector = new PasteCollector(
        { ...defaultConfig, capturePreview: false },
        0,
        getRecentKeystrokesMock,
        onEventMock,
      );
      collector.attach(element);

      element.dispatchEvent(createPasteEvent("Test"));

      const events = collector.getEvents();
      expect(events[0]?.textPreview).toBeUndefined();
    });

    it("should capture text hash", () => {
      collector = new PasteCollector(defaultConfig, 0, getRecentKeystrokesMock, onEventMock);
      collector.attach(element);

      element.dispatchEvent(createPasteEvent("Test"));

      const events = collector.getEvents();
      expect(events[0]?.textHash).toBeDefined();
      expect(typeof events[0]?.textHash).toBe("string");
    });

    it("should call getRecentKeystrokes function", () => {
      collector = new PasteCollector(defaultConfig, 0, getRecentKeystrokesMock, onEventMock);
      collector.attach(element);

      element.dispatchEvent(createPasteEvent("Test"));

      expect(getRecentKeystrokesMock).toHaveBeenCalled();
    });

    it("should call onEvent callback", () => {
      collector = new PasteCollector(defaultConfig, 0, getRecentKeystrokesMock, onEventMock);
      collector.attach(element);

      element.dispatchEvent(createPasteEvent("Test"));

      expect(onEventMock).toHaveBeenCalledWith(
        expect.objectContaining({
          textLength: 4,
          blocked: false,
        }),
      );
    });
  });

  describe("paste prevention", () => {
    it("should prevent paste when configured", () => {
      collector = new PasteCollector(
        { ...defaultConfig, prevent: true },
        0,
        getRecentKeystrokesMock,
        onEventMock,
      );
      collector.attach(element);

      const pasteEvent = createPasteEvent("Test");
      const preventDefaultSpy = vi.spyOn(pasteEvent, "preventDefault");

      element.dispatchEvent(pasteEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it("should record blocked status when preventing", () => {
      collector = new PasteCollector(
        { ...defaultConfig, prevent: true },
        0,
        getRecentKeystrokesMock,
        onEventMock,
      );
      collector.attach(element);

      element.dispatchEvent(createPasteEvent("Test"));

      const events = collector.getEvents();
      expect(events[0]?.blocked).toBe(true);
    });

    it("should not prevent paste when not configured", () => {
      collector = new PasteCollector(
        { ...defaultConfig, prevent: false },
        0,
        getRecentKeystrokesMock,
        onEventMock,
      );
      collector.attach(element);

      const pasteEvent = createPasteEvent("Test");
      const preventDefaultSpy = vi.spyOn(pasteEvent, "preventDefault");

      element.dispatchEvent(pasteEvent);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    it("should show warning message when configured", () => {
      const alertMock = vi.fn();
      vi.stubGlobal("alert", alertMock);

      collector = new PasteCollector(
        { ...defaultConfig, prevent: true, warnMessage: "Paste not allowed" },
        0,
        getRecentKeystrokesMock,
        onEventMock,
      );
      collector.attach(element);

      element.dispatchEvent(createPasteEvent("Test"));

      expect(alertMock).toHaveBeenCalledWith("Paste not allowed");
    });

    it("should not show warning when no message configured", () => {
      const alertMock = vi.fn();
      vi.stubGlobal("alert", alertMock);

      collector = new PasteCollector(
        { ...defaultConfig, prevent: true },
        0,
        getRecentKeystrokesMock,
        onEventMock,
      );
      collector.attach(element);

      element.dispatchEvent(createPasteEvent("Test"));

      expect(alertMock).not.toHaveBeenCalled();
    });
  });

  describe("getEvents", () => {
    it("should return a copy of events array", () => {
      collector = new PasteCollector(defaultConfig, 0, getRecentKeystrokesMock, onEventMock);
      collector.attach(element);

      element.dispatchEvent(createPasteEvent("Test"));

      const events1 = collector.getEvents();
      const events2 = collector.getEvents();

      expect(events1).toEqual(events2);
      expect(events1).not.toBe(events2);
    });

    it("should return empty array when no events", () => {
      collector = new PasteCollector(defaultConfig, 0, getRecentKeystrokesMock, onEventMock);

      expect(collector.getEvents()).toEqual([]);
    });
  });

  describe("reset", () => {
    it("should clear all events", () => {
      collector = new PasteCollector(defaultConfig, 0, getRecentKeystrokesMock, onEventMock);
      collector.attach(element);

      element.dispatchEvent(createPasteEvent("Test 1"));
      element.dispatchEvent(createPasteEvent("Test 2"));

      collector.reset();

      expect(collector.getEvents()).toEqual([]);
    });

    it("should update start time when provided", () => {
      collector = new PasteCollector(defaultConfig, 0, getRecentKeystrokesMock, onEventMock);
      collector.attach(element);

      collector.reset(1000);

      vi.spyOn(performance, "now").mockReturnValue(1300);
      element.dispatchEvent(createPasteEvent("Test"));

      const events = collector.getEvents();
      expect(events[0]?.time).toBe(300);
    });

    it("should keep start time when not provided", () => {
      collector = new PasteCollector(defaultConfig, 200, getRecentKeystrokesMock, onEventMock);
      collector.attach(element);

      collector.reset();

      vi.spyOn(performance, "now").mockReturnValue(500);
      element.dispatchEvent(createPasteEvent("Test"));

      const events = collector.getEvents();
      expect(events[0]?.time).toBe(300); // 500 - 200
    });
  });

  describe("time calculation", () => {
    it("should calculate time relative to start time", () => {
      collector = new PasteCollector(defaultConfig, 500, getRecentKeystrokesMock, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(800);
      element.dispatchEvent(createPasteEvent("Test"));

      const events = collector.getEvents();
      expect(events[0]?.time).toBe(300); // 800 - 500
    });
  });

  describe("edge cases", () => {
    it("should handle empty paste", () => {
      collector = new PasteCollector(defaultConfig, 0, getRecentKeystrokesMock, onEventMock);
      collector.attach(element);

      element.dispatchEvent(createPasteEvent(""));

      const events = collector.getEvents();
      expect(events[0]?.textLength).toBe(0);
      expect(events[0]?.textPreview).toBe("");
    });

    it("should handle very long paste", () => {
      collector = new PasteCollector(
        { ...defaultConfig, previewLength: 50 },
        0,
        getRecentKeystrokesMock,
        onEventMock,
      );
      collector.attach(element);

      const longText = "a".repeat(10000);
      element.dispatchEvent(createPasteEvent(longText));

      const events = collector.getEvents();
      expect(events[0]?.textLength).toBe(10000);
      expect(events[0]?.textPreview?.length).toBe(50);
    });

    it("should handle unicode text", () => {
      collector = new PasteCollector(defaultConfig, 0, getRecentKeystrokesMock, onEventMock);
      collector.attach(element);

      element.dispatchEvent(createPasteEvent("\u4E2D\u6587\u6D4B\u8BD5"));

      const events = collector.getEvents();
      expect(events[0]?.textLength).toBe(4);
      expect(events[0]?.textPreview).toBe("\u4E2D\u6587\u6D4B\u8BD5");
    });

    it("should handle text with newlines", () => {
      collector = new PasteCollector(defaultConfig, 0, getRecentKeystrokesMock, onEventMock);
      collector.attach(element);

      element.dispatchEvent(createPasteEvent("Line 1\nLine 2\nLine 3"));

      const events = collector.getEvents();
      expect(events[0]?.textLength).toBe(20);
    });

    it("should handle multiple paste events", () => {
      collector = new PasteCollector(defaultConfig, 0, getRecentKeystrokesMock, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createPasteEvent("First"));

      vi.spyOn(performance, "now").mockReturnValue(200);
      element.dispatchEvent(createPasteEvent("Second"));

      vi.spyOn(performance, "now").mockReturnValue(300);
      element.dispatchEvent(createPasteEvent("Third"));

      const events = collector.getEvents();
      expect(events.length).toBe(3);
      expect(events[0]?.time).toBe(100);
      expect(events[1]?.time).toBe(200);
      expect(events[2]?.time).toBe(300);
    });

    it("should handle missing clipboard data", () => {
      collector = new PasteCollector(defaultConfig, 0, getRecentKeystrokesMock, onEventMock);
      collector.attach(element);

      // Create paste event without clipboard data
      const pasteEvent = new MockClipboardEvent("paste", { bubbles: true });
      element.dispatchEvent(pasteEvent);

      const events = collector.getEvents();
      expect(events[0]?.textLength).toBe(0);
    });
  });
});
