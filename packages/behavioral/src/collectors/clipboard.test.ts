import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ClipboardCollector } from "./clipboard.js";

// Polyfill ClipboardEvent for jsdom
class MockClipboardEvent extends Event {
  clipboardData: DataTransfer | null;

  constructor(type: string, eventInitDict?: ClipboardEventInit) {
    super(type, eventInitDict);
    this.clipboardData = eventInitDict?.clipboardData ?? null;
  }
}

describe("ClipboardCollector", () => {
  let collector: ClipboardCollector;
  let element: HTMLTextAreaElement;
  let onPasteEventMock: ReturnType<typeof vi.fn>;
  let onCopyEventMock: ReturnType<typeof vi.fn>;
  let getRecentKeystrokesMock: ReturnType<typeof vi.fn>;

  const defaultConfig = {
    enabled: true,
    capturePaste: true,
    captureCopyCut: true,
    prevent: false,
    capturePreview: true,
    previewLength: 100,
  };

  beforeEach(() => {
    element = document.createElement("textarea");
    document.body.appendChild(element);
    onPasteEventMock = vi.fn();
    onCopyEventMock = vi.fn();
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

  const createCopyEvent = (type: "copy" | "cut"): Event => {
    return new MockClipboardEvent(type, {
      bubbles: true,
    });
  };

  describe("attach and detach", () => {
    it("should attach paste listener when capturePaste is true", () => {
      collector = new ClipboardCollector(
        defaultConfig,
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      const addEventListenerSpy = vi.spyOn(element, "addEventListener");

      collector.attach(element);

      expect(addEventListenerSpy).toHaveBeenCalledWith("paste", expect.any(Function));
    });

    it("should attach copy and cut listeners when captureCopyCut is true", () => {
      collector = new ClipboardCollector(
        defaultConfig,
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      const addEventListenerSpy = vi.spyOn(element, "addEventListener");

      collector.attach(element);

      expect(addEventListenerSpy).toHaveBeenCalledWith("copy", expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith("cut", expect.any(Function));
    });

    it("should not attach paste listener when capturePaste is false", () => {
      collector = new ClipboardCollector(
        { ...defaultConfig, capturePaste: false },
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      const addEventListenerSpy = vi.spyOn(element, "addEventListener");

      collector.attach(element);

      expect(addEventListenerSpy).not.toHaveBeenCalledWith("paste", expect.any(Function));
    });

    it("should not attach copy/cut listeners when captureCopyCut is false", () => {
      collector = new ClipboardCollector(
        { ...defaultConfig, captureCopyCut: false },
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      const addEventListenerSpy = vi.spyOn(element, "addEventListener");

      collector.attach(element);

      expect(addEventListenerSpy).not.toHaveBeenCalledWith("copy", expect.any(Function));
      expect(addEventListenerSpy).not.toHaveBeenCalledWith("cut", expect.any(Function));
    });

    it("should remove all listeners on detach", () => {
      collector = new ClipboardCollector(
        defaultConfig,
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      collector.attach(element);
      const removeEventListenerSpy = vi.spyOn(element, "removeEventListener");

      collector.detach();

      expect(removeEventListenerSpy).toHaveBeenCalledWith("paste", expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith("copy", expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith("cut", expect.any(Function));
    });

    it("should handle detach when not attached", () => {
      collector = new ClipboardCollector(
        defaultConfig,
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );

      expect(() => collector.detach()).not.toThrow();
    });

    it("should attach to document", () => {
      collector = new ClipboardCollector(
        defaultConfig,
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      const docAddSpy = vi.spyOn(document, "addEventListener");

      collector.attach(document);

      expect(docAddSpy).toHaveBeenCalledWith("paste", expect.any(Function));
      expect(docAddSpy).toHaveBeenCalledWith("copy", expect.any(Function));
    });
  });

  describe("paste event recording", () => {
    it("should record paste event with basic info", () => {
      collector = new ClipboardCollector(
        defaultConfig,
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(500);
      element.dispatchEvent(createPasteEvent("Hello world"));

      const events = collector.getPasteEvents();
      expect(events.length).toBe(1);
      expect(events[0]).toMatchObject({
        time: 500,
        textLength: 11,
        precedingKeystrokes: 5,
        blocked: false,
      });
    });

    it("should capture text preview when enabled", () => {
      collector = new ClipboardCollector(
        { ...defaultConfig, capturePreview: true },
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      collector.attach(element);

      element.dispatchEvent(createPasteEvent("Test paste content"));

      const events = collector.getPasteEvents();
      expect(events[0]?.textPreview).toBe("Test paste content");
    });

    it("should truncate preview to previewLength", () => {
      collector = new ClipboardCollector(
        { ...defaultConfig, capturePreview: true, previewLength: 10 },
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      collector.attach(element);

      element.dispatchEvent(createPasteEvent("This is a very long text"));

      const events = collector.getPasteEvents();
      expect(events[0]?.textPreview).toBe("This is a ");
      expect(events[0]?.textPreview?.length).toBe(10);
    });

    it("should not capture preview when disabled", () => {
      collector = new ClipboardCollector(
        { ...defaultConfig, capturePreview: false },
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      collector.attach(element);

      element.dispatchEvent(createPasteEvent("Test"));

      const events = collector.getPasteEvents();
      expect(events[0]?.textPreview).toBeUndefined();
    });

    it("should capture text hash", () => {
      collector = new ClipboardCollector(
        defaultConfig,
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      collector.attach(element);

      element.dispatchEvent(createPasteEvent("Test"));

      const events = collector.getPasteEvents();
      expect(events[0]?.textHash).toBeDefined();
      expect(typeof events[0]?.textHash).toBe("string");
    });

    it("should call getRecentKeystrokes function", () => {
      collector = new ClipboardCollector(
        defaultConfig,
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      collector.attach(element);

      element.dispatchEvent(createPasteEvent("Test"));

      expect(getRecentKeystrokesMock).toHaveBeenCalled();
    });

    it("should call onPasteEvent callback", () => {
      collector = new ClipboardCollector(
        defaultConfig,
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      collector.attach(element);

      element.dispatchEvent(createPasteEvent("Test"));

      expect(onPasteEventMock).toHaveBeenCalledWith(
        expect.objectContaining({
          textLength: 4,
          blocked: false,
        }),
      );
    });
  });

  describe("paste prevention", () => {
    it("should prevent paste when configured", () => {
      collector = new ClipboardCollector(
        { ...defaultConfig, prevent: true },
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      collector.attach(element);

      const pasteEvent = createPasteEvent("Test");
      const preventDefaultSpy = vi.spyOn(pasteEvent, "preventDefault");

      element.dispatchEvent(pasteEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it("should record blocked status when preventing", () => {
      collector = new ClipboardCollector(
        { ...defaultConfig, prevent: true },
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      collector.attach(element);

      element.dispatchEvent(createPasteEvent("Test"));

      const events = collector.getPasteEvents();
      expect(events[0]?.blocked).toBe(true);
    });

    it("should not prevent paste when not configured", () => {
      collector = new ClipboardCollector(
        { ...defaultConfig, prevent: false },
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
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

      collector = new ClipboardCollector(
        { ...defaultConfig, prevent: true, warnMessage: "Paste not allowed" },
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      collector.attach(element);

      element.dispatchEvent(createPasteEvent("Test"));

      expect(alertMock).toHaveBeenCalledWith("Paste not allowed");
    });

    it("should not show warning when no message configured", () => {
      const alertMock = vi.fn();
      vi.stubGlobal("alert", alertMock);

      collector = new ClipboardCollector(
        { ...defaultConfig, prevent: true },
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      collector.attach(element);

      element.dispatchEvent(createPasteEvent("Test"));

      expect(alertMock).not.toHaveBeenCalled();
    });
  });

  describe("copy event recording", () => {
    it("should record copy event", () => {
      collector = new ClipboardCollector(
        defaultConfig,
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      collector.attach(element);

      // Mock window.getSelection
      const mockSelection = {
        toString: () => "selected text",
      };
      vi.spyOn(window, "getSelection").mockReturnValue(mockSelection as Selection);

      vi.spyOn(performance, "now").mockReturnValue(300);
      element.dispatchEvent(createCopyEvent("copy"));

      const events = collector.getCopyEvents();
      expect(events.length).toBe(1);
      expect(events[0]).toMatchObject({
        time: 300,
        event: "copy",
        textLength: 13,
      });
    });

    it("should record cut event", () => {
      collector = new ClipboardCollector(
        defaultConfig,
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      collector.attach(element);

      const mockSelection = {
        toString: () => "cut text",
      };
      vi.spyOn(window, "getSelection").mockReturnValue(mockSelection as Selection);

      vi.spyOn(performance, "now").mockReturnValue(400);
      element.dispatchEvent(createCopyEvent("cut"));

      const events = collector.getCopyEvents();
      expect(events.length).toBe(1);
      expect(events[0]).toMatchObject({
        time: 400,
        event: "cut",
        textLength: 8,
      });
    });

    it("should capture text preview for copy events", () => {
      collector = new ClipboardCollector(
        { ...defaultConfig, capturePreview: true },
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      collector.attach(element);

      const mockSelection = {
        toString: () => "copied content",
      };
      vi.spyOn(window, "getSelection").mockReturnValue(mockSelection as Selection);

      element.dispatchEvent(createCopyEvent("copy"));

      const events = collector.getCopyEvents();
      expect(events[0]?.textPreview).toBe("copied content");
    });

    it("should capture text hash for copy events", () => {
      collector = new ClipboardCollector(
        defaultConfig,
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      collector.attach(element);

      const mockSelection = {
        toString: () => "test",
      };
      vi.spyOn(window, "getSelection").mockReturnValue(mockSelection as Selection);

      element.dispatchEvent(createCopyEvent("copy"));

      const events = collector.getCopyEvents();
      expect(events[0]?.textHash).toBeDefined();
    });

    it("should capture selection indices from input element", () => {
      const input = document.createElement("input");
      input.value = "hello world";
      document.body.appendChild(input);
      input.setSelectionRange(0, 5);
      input.focus();

      collector = new ClipboardCollector(
        defaultConfig,
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      collector.attach(input);

      const mockSelection = {
        toString: () => "hello",
      };
      vi.spyOn(window, "getSelection").mockReturnValue(mockSelection as Selection);

      input.dispatchEvent(createCopyEvent("copy"));

      const events = collector.getCopyEvents();
      expect(events[0]?.selectionStart).toBe(0);
      expect(events[0]?.selectionEnd).toBe(5);

      input.remove();
    });

    it("should capture selection indices from textarea element", () => {
      element.value = "hello world";
      element.setSelectionRange(6, 11);
      element.focus();

      collector = new ClipboardCollector(
        defaultConfig,
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      collector.attach(element);

      const mockSelection = {
        toString: () => "world",
      };
      vi.spyOn(window, "getSelection").mockReturnValue(mockSelection as Selection);

      element.dispatchEvent(createCopyEvent("copy"));

      const events = collector.getCopyEvents();
      expect(events[0]?.selectionStart).toBe(6);
      expect(events[0]?.selectionEnd).toBe(11);
    });

    it("should call onCopyEvent callback", () => {
      collector = new ClipboardCollector(
        defaultConfig,
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      collector.attach(element);

      const mockSelection = {
        toString: () => "test",
      };
      vi.spyOn(window, "getSelection").mockReturnValue(mockSelection as Selection);

      element.dispatchEvent(createCopyEvent("copy"));

      expect(onCopyEventMock).toHaveBeenCalledWith(
        expect.objectContaining({
          event: "copy",
          textLength: 4,
        }),
      );
    });
  });

  describe("getPasteEvents", () => {
    it("should return a copy of paste events array", () => {
      collector = new ClipboardCollector(
        defaultConfig,
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      collector.attach(element);

      element.dispatchEvent(createPasteEvent("Test"));

      const events1 = collector.getPasteEvents();
      const events2 = collector.getPasteEvents();

      expect(events1).toEqual(events2);
      expect(events1).not.toBe(events2);
    });

    it("should return empty array when no paste events", () => {
      collector = new ClipboardCollector(
        defaultConfig,
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );

      expect(collector.getPasteEvents()).toEqual([]);
    });
  });

  describe("getCopyEvents", () => {
    it("should return a copy of copy events array", () => {
      collector = new ClipboardCollector(
        defaultConfig,
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      collector.attach(element);

      const mockSelection = {
        toString: () => "test",
      };
      vi.spyOn(window, "getSelection").mockReturnValue(mockSelection as Selection);

      element.dispatchEvent(createCopyEvent("copy"));

      const events1 = collector.getCopyEvents();
      const events2 = collector.getCopyEvents();

      expect(events1).toEqual(events2);
      expect(events1).not.toBe(events2);
    });

    it("should return empty array when no copy events", () => {
      collector = new ClipboardCollector(
        defaultConfig,
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );

      expect(collector.getCopyEvents()).toEqual([]);
    });
  });

  describe("getAllEvents", () => {
    it("should return all events sorted by time", () => {
      collector = new ClipboardCollector(
        defaultConfig,
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      collector.attach(element);

      const mockSelection = {
        toString: () => "test",
      };
      vi.spyOn(window, "getSelection").mockReturnValue(mockSelection as Selection);

      // Copy at time 100
      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createCopyEvent("copy"));

      // Paste at time 200
      vi.spyOn(performance, "now").mockReturnValue(200);
      element.dispatchEvent(createPasteEvent("pasted"));

      // Cut at time 150
      vi.spyOn(performance, "now").mockReturnValue(150);
      element.dispatchEvent(createCopyEvent("cut"));

      const allEvents = collector.getAllEvents();
      expect(allEvents.length).toBe(3);
      expect(allEvents[0]?.time).toBe(100);
      expect(allEvents[1]?.time).toBe(150);
      expect(allEvents[2]?.time).toBe(200);
    });

    it("should return empty array when no events", () => {
      collector = new ClipboardCollector(
        defaultConfig,
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );

      expect(collector.getAllEvents()).toEqual([]);
    });
  });

  describe("reset", () => {
    it("should clear all paste events", () => {
      collector = new ClipboardCollector(
        defaultConfig,
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      collector.attach(element);

      element.dispatchEvent(createPasteEvent("Test 1"));
      element.dispatchEvent(createPasteEvent("Test 2"));

      collector.reset();

      expect(collector.getPasteEvents()).toEqual([]);
    });

    it("should clear all copy events", () => {
      collector = new ClipboardCollector(
        defaultConfig,
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      collector.attach(element);

      const mockSelection = {
        toString: () => "test",
      };
      vi.spyOn(window, "getSelection").mockReturnValue(mockSelection as Selection);

      element.dispatchEvent(createCopyEvent("copy"));
      element.dispatchEvent(createCopyEvent("cut"));

      collector.reset();

      expect(collector.getCopyEvents()).toEqual([]);
    });

    it("should update start time when provided", () => {
      collector = new ClipboardCollector(
        defaultConfig,
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      collector.attach(element);

      collector.reset(1000);

      vi.spyOn(performance, "now").mockReturnValue(1300);
      element.dispatchEvent(createPasteEvent("Test"));

      const events = collector.getPasteEvents();
      expect(events[0]?.time).toBe(300);
    });

    it("should keep start time when not provided", () => {
      collector = new ClipboardCollector(
        defaultConfig,
        200,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      collector.attach(element);

      collector.reset();

      vi.spyOn(performance, "now").mockReturnValue(500);
      element.dispatchEvent(createPasteEvent("Test"));

      const events = collector.getPasteEvents();
      expect(events[0]?.time).toBe(300); // 500 - 200
    });
  });

  describe("time calculation", () => {
    it("should calculate time relative to start time for paste", () => {
      collector = new ClipboardCollector(
        defaultConfig,
        500,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(800);
      element.dispatchEvent(createPasteEvent("Test"));

      const events = collector.getPasteEvents();
      expect(events[0]?.time).toBe(300); // 800 - 500
    });

    it("should calculate time relative to start time for copy", () => {
      collector = new ClipboardCollector(
        defaultConfig,
        500,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      collector.attach(element);

      const mockSelection = {
        toString: () => "test",
      };
      vi.spyOn(window, "getSelection").mockReturnValue(mockSelection as Selection);

      vi.spyOn(performance, "now").mockReturnValue(900);
      element.dispatchEvent(createCopyEvent("copy"));

      const events = collector.getCopyEvents();
      expect(events[0]?.time).toBe(400); // 900 - 500
    });
  });

  describe("edge cases", () => {
    it("should handle empty paste", () => {
      collector = new ClipboardCollector(
        defaultConfig,
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      collector.attach(element);

      element.dispatchEvent(createPasteEvent(""));

      const events = collector.getPasteEvents();
      expect(events[0]?.textLength).toBe(0);
      expect(events[0]?.textPreview).toBe("");
    });

    it("should handle empty copy selection", () => {
      collector = new ClipboardCollector(
        defaultConfig,
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      collector.attach(element);

      const mockSelection = {
        toString: () => "",
      };
      vi.spyOn(window, "getSelection").mockReturnValue(mockSelection as Selection);

      element.dispatchEvent(createCopyEvent("copy"));

      const events = collector.getCopyEvents();
      expect(events[0]?.textLength).toBe(0);
    });

    it("should handle null selection", () => {
      collector = new ClipboardCollector(
        defaultConfig,
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      collector.attach(element);

      vi.spyOn(window, "getSelection").mockReturnValue(null);

      element.dispatchEvent(createCopyEvent("copy"));

      const events = collector.getCopyEvents();
      expect(events[0]?.textLength).toBe(0);
    });

    it("should handle very long paste", () => {
      collector = new ClipboardCollector(
        { ...defaultConfig, previewLength: 50 },
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      collector.attach(element);

      const longText = "a".repeat(10000);
      element.dispatchEvent(createPasteEvent(longText));

      const events = collector.getPasteEvents();
      expect(events[0]?.textLength).toBe(10000);
      expect(events[0]?.textPreview?.length).toBe(50);
    });

    it("should handle unicode text", () => {
      collector = new ClipboardCollector(
        defaultConfig,
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      collector.attach(element);

      element.dispatchEvent(createPasteEvent("\u4E2D\u6587\u6D4B\u8BD5"));

      const events = collector.getPasteEvents();
      expect(events[0]?.textLength).toBe(4);
      expect(events[0]?.textPreview).toBe("\u4E2D\u6587\u6D4B\u8BD5");
    });

    it("should handle text with newlines", () => {
      collector = new ClipboardCollector(
        defaultConfig,
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      collector.attach(element);

      element.dispatchEvent(createPasteEvent("Line 1\nLine 2\nLine 3"));

      const events = collector.getPasteEvents();
      expect(events[0]?.textLength).toBe(20);
    });

    it("should handle missing clipboard data", () => {
      collector = new ClipboardCollector(
        defaultConfig,
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      collector.attach(element);

      const pasteEvent = new MockClipboardEvent("paste", { bubbles: true });
      element.dispatchEvent(pasteEvent);

      const events = collector.getPasteEvents();
      expect(events[0]?.textLength).toBe(0);
    });

    it("should handle multiple events of different types", () => {
      collector = new ClipboardCollector(
        defaultConfig,
        0,
        getRecentKeystrokesMock,
        onPasteEventMock,
        onCopyEventMock,
      );
      collector.attach(element);

      const mockSelection = {
        toString: () => "selected",
      };
      vi.spyOn(window, "getSelection").mockReturnValue(mockSelection as Selection);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createPasteEvent("First"));

      vi.spyOn(performance, "now").mockReturnValue(200);
      element.dispatchEvent(createCopyEvent("copy"));

      vi.spyOn(performance, "now").mockReturnValue(300);
      element.dispatchEvent(createCopyEvent("cut"));

      vi.spyOn(performance, "now").mockReturnValue(400);
      element.dispatchEvent(createPasteEvent("Second"));

      expect(collector.getPasteEvents().length).toBe(2);
      expect(collector.getCopyEvents().length).toBe(2);
      expect(collector.getAllEvents().length).toBe(4);
    });
  });
});
