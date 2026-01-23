import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ScrollCollector } from "./scroll.js";

describe("ScrollCollector", () => {
  let collector: ScrollCollector;
  let element: HTMLDivElement;
  let onEventMock: ReturnType<typeof vi.fn>;

  const defaultConfig = {
    enabled: true,
    throttleMs: 0, // No throttling in tests for predictable behavior
    captureDirection: true,
  };

  beforeEach(() => {
    element = document.createElement("div");
    // Set up scrollable element
    element.style.height = "100px";
    element.style.overflow = "scroll";
    element.innerHTML = '<div style="height: 500px;"></div>';
    document.body.appendChild(element);
    onEventMock = vi.fn();

    vi.spyOn(performance, "now").mockReturnValue(1000);
    vi.useFakeTimers();
  });

  afterEach(() => {
    collector?.detach();
    element.remove();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // Helper to dispatch scroll event with given scroll state
  // Sets scroll properties on the element and dispatches a scroll event
  const _dispatchScrollEvent = (
    el: HTMLElement,
    scrollTop: number,
    scrollHeight: number,
    clientHeight: number,
  ): void => {
    Object.defineProperty(el, "scrollTop", { value: scrollTop, configurable: true });
    Object.defineProperty(el, "scrollHeight", { value: scrollHeight, configurable: true });
    Object.defineProperty(el, "clientHeight", { value: clientHeight, configurable: true });
    el.dispatchEvent(new Event("scroll", { bubbles: true }));
  };

  // Alias for backward compatibility
  const createScrollEvent = (
    scrollTop: number,
    scrollHeight: number,
    clientHeight: number,
  ): Event => {
    // Set properties on the element before returning the event
    Object.defineProperty(element, "scrollTop", { value: scrollTop, configurable: true });
    Object.defineProperty(element, "scrollHeight", { value: scrollHeight, configurable: true });
    Object.defineProperty(element, "clientHeight", { value: clientHeight, configurable: true });
    return new Event("scroll", { bubbles: true });
  };

  describe("attach and detach", () => {
    it("should attach scroll listener to element", () => {
      collector = new ScrollCollector(defaultConfig, 0, onEventMock);
      const addEventListenerSpy = vi.spyOn(element, "addEventListener");

      collector.attach(element);

      expect(addEventListenerSpy).toHaveBeenCalledWith("scroll", expect.any(Function), {
        passive: true,
      });
    });

    it("should remove listener on detach", () => {
      collector = new ScrollCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);
      const removeEventListenerSpy = vi.spyOn(element, "removeEventListener");

      collector.detach();

      expect(removeEventListenerSpy).toHaveBeenCalledWith("scroll", expect.any(Function));
    });

    it("should handle detach when not attached", () => {
      collector = new ScrollCollector(defaultConfig, 0, onEventMock);

      expect(() => collector.detach()).not.toThrow();
    });

    it("should attach to document", () => {
      collector = new ScrollCollector(defaultConfig, 0, onEventMock);
      const addEventListenerSpy = vi.spyOn(document, "addEventListener");

      collector.attach(document);

      expect(addEventListenerSpy).toHaveBeenCalledWith("scroll", expect.any(Function), {
        passive: true,
      });
    });
  });

  describe("event recording", () => {
    it("should record scroll event with basic info", () => {
      collector = new ScrollCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(200);
      element.dispatchEvent(createScrollEvent(100, 500, 100));

      const events = collector.getEvents();
      expect(events.length).toBe(1);
      expect(events[0]).toMatchObject({
        time: 200,
        scrollTop: 100,
        scrollHeight: 500,
        clientHeight: 100,
      });
    });

    it("should calculate deltaY from previous scroll position", () => {
      collector = new ScrollCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      // First scroll
      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createScrollEvent(50, 500, 100));

      // Clear throttle timer
      vi.advanceTimersByTime(1);

      // Second scroll
      vi.spyOn(performance, "now").mockReturnValue(200);
      element.dispatchEvent(createScrollEvent(150, 500, 100));

      const events = collector.getEvents();
      expect(events[1]?.deltaY).toBe(100); // 150 - 50
    });

    it("should set deltaY to 0 on first scroll", () => {
      collector = new ScrollCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createScrollEvent(100, 500, 100));

      const events = collector.getEvents();
      expect(events[0]?.deltaY).toBe(0);
    });

    it("should calculate time relative to start time", () => {
      collector = new ScrollCollector(defaultConfig, 100, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(350);
      element.dispatchEvent(createScrollEvent(50, 500, 100));

      const events = collector.getEvents();
      expect(events[0]?.time).toBe(250); // 350 - 100
    });

    it("should call onEvent callback", () => {
      collector = new ScrollCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      element.dispatchEvent(createScrollEvent(100, 500, 100));

      expect(onEventMock).toHaveBeenCalledTimes(1);
      expect(onEventMock).toHaveBeenCalledWith(
        expect.objectContaining({
          scrollTop: 100,
        }),
      );
    });

    it("should not record events when disabled", () => {
      collector = new ScrollCollector({ ...defaultConfig, enabled: false }, 0, onEventMock);
      collector.attach(element);

      element.dispatchEvent(createScrollEvent(100, 500, 100));

      expect(collector.getEvents()).toEqual([]);
    });
  });

  describe("direction tracking", () => {
    it("should detect down direction when scrolling down", () => {
      collector = new ScrollCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createScrollEvent(50, 500, 100));

      vi.advanceTimersByTime(1);

      vi.spyOn(performance, "now").mockReturnValue(200);
      element.dispatchEvent(createScrollEvent(150, 500, 100));

      const events = collector.getEvents();
      expect(events[1]?.direction).toBe("down");
    });

    it("should detect up direction when scrolling up", () => {
      collector = new ScrollCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createScrollEvent(150, 500, 100));

      vi.advanceTimersByTime(1);

      vi.spyOn(performance, "now").mockReturnValue(200);
      element.dispatchEvent(createScrollEvent(50, 500, 100));

      const events = collector.getEvents();
      expect(events[1]?.direction).toBe("up");
    });

    it("should track direction changes", () => {
      collector = new ScrollCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      // Scroll down
      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createScrollEvent(0, 500, 100));
      vi.advanceTimersByTime(1);

      vi.spyOn(performance, "now").mockReturnValue(200);
      element.dispatchEvent(createScrollEvent(100, 500, 100));
      vi.advanceTimersByTime(1);

      // Scroll up (direction change)
      vi.spyOn(performance, "now").mockReturnValue(300);
      element.dispatchEvent(createScrollEvent(50, 500, 100));
      vi.advanceTimersByTime(1);

      // Scroll down again (another direction change)
      vi.spyOn(performance, "now").mockReturnValue(400);
      element.dispatchEvent(createScrollEvent(150, 500, 100));

      expect(collector.getDirectionChanges()).toBe(2);
    });

    it("should not track direction changes when disabled", () => {
      collector = new ScrollCollector(
        { ...defaultConfig, captureDirection: false },
        0,
        onEventMock,
      );
      collector.attach(element);

      // Scroll down
      element.dispatchEvent(createScrollEvent(0, 500, 100));
      vi.advanceTimersByTime(1);
      element.dispatchEvent(createScrollEvent(100, 500, 100));
      vi.advanceTimersByTime(1);

      // Scroll up
      element.dispatchEvent(createScrollEvent(50, 500, 100));

      expect(collector.getDirectionChanges()).toBe(0);
    });
  });

  describe("velocity calculation", () => {
    it("should calculate scroll velocity", () => {
      collector = new ScrollCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createScrollEvent(0, 500, 100));

      vi.advanceTimersByTime(1);

      vi.spyOn(performance, "now").mockReturnValue(200);
      element.dispatchEvent(createScrollEvent(100, 500, 100));

      const events = collector.getEvents();
      // deltaY = 100, timeDelta = 100, velocity = 1.0
      expect(events[1]?.velocity).toBe(1.0);
    });

    it("should not have velocity on first scroll", () => {
      collector = new ScrollCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createScrollEvent(100, 500, 100));

      const events = collector.getEvents();
      expect(events[0]?.velocity).toBeUndefined();
    });
  });

  describe("throttling", () => {
    it("should throttle scroll events", () => {
      collector = new ScrollCollector({ ...defaultConfig, throttleMs: 100 }, 0, onEventMock);
      collector.attach(element);

      // First event should be recorded
      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createScrollEvent(50, 500, 100));

      // Second event within throttle window should be ignored
      vi.spyOn(performance, "now").mockReturnValue(150);
      element.dispatchEvent(createScrollEvent(100, 500, 100));

      // Advance timers past throttle
      vi.advanceTimersByTime(100);

      // Third event after throttle window should be recorded
      vi.spyOn(performance, "now").mockReturnValue(250);
      element.dispatchEvent(createScrollEvent(150, 500, 100));

      const events = collector.getEvents();
      expect(events.length).toBe(2);
      expect(events[0]?.scrollTop).toBe(50);
      expect(events[1]?.scrollTop).toBe(150);
    });

    it("should clear throttle timer on detach", () => {
      collector = new ScrollCollector({ ...defaultConfig, throttleMs: 100 }, 0, onEventMock);
      collector.attach(element);

      element.dispatchEvent(createScrollEvent(50, 500, 100));

      // Detach should not throw even with pending throttle timer
      expect(() => collector.detach()).not.toThrow();
    });
  });

  describe("getEvents", () => {
    it("should return a copy of events array", () => {
      collector = new ScrollCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      element.dispatchEvent(createScrollEvent(100, 500, 100));

      const events1 = collector.getEvents();
      const events2 = collector.getEvents();

      expect(events1).toEqual(events2);
      expect(events1).not.toBe(events2);
    });

    it("should return empty array when no events", () => {
      collector = new ScrollCollector(defaultConfig, 0, onEventMock);

      expect(collector.getEvents()).toEqual([]);
    });
  });

  describe("getDirectionChanges", () => {
    it("should return 0 when no direction changes", () => {
      collector = new ScrollCollector(defaultConfig, 0, onEventMock);

      expect(collector.getDirectionChanges()).toBe(0);
    });
  });

  describe("reset", () => {
    it("should clear all events", () => {
      collector = new ScrollCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      element.dispatchEvent(createScrollEvent(100, 500, 100));
      vi.advanceTimersByTime(1);
      element.dispatchEvent(createScrollEvent(150, 500, 100));

      collector.reset();

      expect(collector.getEvents()).toEqual([]);
    });

    it("should reset direction changes count", () => {
      collector = new ScrollCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      element.dispatchEvent(createScrollEvent(0, 500, 100));
      vi.advanceTimersByTime(1);
      element.dispatchEvent(createScrollEvent(100, 500, 100));
      vi.advanceTimersByTime(1);
      element.dispatchEvent(createScrollEvent(50, 500, 100));

      collector.reset();

      expect(collector.getDirectionChanges()).toBe(0);
    });

    it("should update start time when provided", () => {
      collector = new ScrollCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      collector.reset(1000);

      vi.spyOn(performance, "now").mockReturnValue(1200);
      element.dispatchEvent(createScrollEvent(100, 500, 100));

      const events = collector.getEvents();
      expect(events[0]?.time).toBe(200); // 1200 - 1000
    });

    it("should keep start time when not provided", () => {
      collector = new ScrollCollector(defaultConfig, 100, onEventMock);
      collector.attach(element);

      collector.reset();

      vi.spyOn(performance, "now").mockReturnValue(300);
      element.dispatchEvent(createScrollEvent(100, 500, 100));

      const events = collector.getEvents();
      expect(events[0]?.time).toBe(200); // 300 - 100
    });

    it("should reset scroll tracking state", () => {
      collector = new ScrollCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createScrollEvent(100, 500, 100));

      // Clear throttle before reset
      vi.advanceTimersByTime(1);

      collector.reset();

      vi.spyOn(performance, "now").mockReturnValue(200);
      element.dispatchEvent(createScrollEvent(200, 500, 100));

      const events = collector.getEvents();
      // First event after reset should have deltaY of 0
      expect(events[0]?.deltaY).toBe(0);
    });
  });

  describe("document scrolling", () => {
    it("should handle scroll events on document", () => {
      collector = new ScrollCollector(defaultConfig, 0, onEventMock);
      collector.attach(document);

      vi.spyOn(performance, "now").mockReturnValue(200);

      // Create event with document as target, simulating document scroll
      const scrollEvent = new Event("scroll", { bubbles: true });
      const _mockDocTarget = {
        scrollTop: 100,
        scrollHeight: 1000,
        clientHeight: 500,
      };
      Object.defineProperty(scrollEvent, "target", { value: document });
      // Mock document.documentElement for the getScrollTarget method
      Object.defineProperty(document.documentElement, "scrollTop", {
        value: 100,
        configurable: true,
      });
      Object.defineProperty(document.documentElement, "scrollHeight", {
        value: 1000,
        configurable: true,
      });
      Object.defineProperty(document.documentElement, "clientHeight", {
        value: 500,
        configurable: true,
      });

      document.dispatchEvent(scrollEvent);

      const events = collector.getEvents();
      expect(events.length).toBe(1);
      expect(events[0]?.scrollTop).toBe(100);
    });
  });

  describe("edge cases", () => {
    it("should handle multiple rapid scroll events", () => {
      collector = new ScrollCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      for (let i = 0; i < 10; i++) {
        vi.spyOn(performance, "now").mockReturnValue(100 + i * 10);
        element.dispatchEvent(createScrollEvent(i * 10, 500, 100));
        // Clear throttle between events
        vi.advanceTimersByTime(1);
      }

      const events = collector.getEvents();
      expect(events.length).toBe(10);
    });

    it("should handle scroll at boundaries", () => {
      collector = new ScrollCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      // Scroll at top
      element.dispatchEvent(createScrollEvent(0, 500, 100));

      // Clear throttle
      vi.advanceTimersByTime(1);

      // Scroll at bottom
      element.dispatchEvent(createScrollEvent(400, 500, 100));

      const events = collector.getEvents();
      expect(events[0]?.scrollTop).toBe(0);
      expect(events[1]?.scrollTop).toBe(400);
    });

    it("should handle zero scroll height", () => {
      collector = new ScrollCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      element.dispatchEvent(createScrollEvent(0, 0, 0));

      const events = collector.getEvents();
      expect(events.length).toBe(1);
      expect(events[0]?.scrollHeight).toBe(0);
    });
  });
});
