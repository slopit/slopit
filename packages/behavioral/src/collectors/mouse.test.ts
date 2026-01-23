import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MouseCollector } from "./mouse.js";

describe("MouseCollector", () => {
  let collector: MouseCollector;
  let element: HTMLDivElement;
  let onEventMock: ReturnType<typeof vi.fn>;

  const defaultConfig = {
    enabled: true,
    captureClicks: true,
    captureMovement: true,
    throttleMs: 0, // No throttling in tests for predictable behavior
    idleThresholdMs: 5000,
  };

  beforeEach(() => {
    element = document.createElement("div");
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

  const createMouseEvent = (
    type: "mousemove" | "mousedown" | "mouseup" | "click",
    x: number,
    y: number,
  ): globalThis.MouseEvent => {
    return new MouseEvent(type, {
      clientX: x,
      clientY: y,
      bubbles: true,
    });
  };

  describe("attach and detach", () => {
    it("should attach mousemove listener when captureMovement is true", () => {
      collector = new MouseCollector(defaultConfig, 0, onEventMock);
      const addEventListenerSpy = vi.spyOn(element, "addEventListener");

      collector.attach(element);

      expect(addEventListenerSpy).toHaveBeenCalledWith("mousemove", expect.any(Function));
    });

    it("should attach click listeners when captureClicks is true", () => {
      collector = new MouseCollector(defaultConfig, 0, onEventMock);
      const addEventListenerSpy = vi.spyOn(element, "addEventListener");

      collector.attach(element);

      expect(addEventListenerSpy).toHaveBeenCalledWith("mousedown", expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith("mouseup", expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith("click", expect.any(Function));
    });

    it("should not attach mousemove listener when captureMovement is false", () => {
      collector = new MouseCollector({ ...defaultConfig, captureMovement: false }, 0, onEventMock);
      const addEventListenerSpy = vi.spyOn(element, "addEventListener");

      collector.attach(element);

      expect(addEventListenerSpy).not.toHaveBeenCalledWith("mousemove", expect.any(Function));
    });

    it("should not attach click listeners when captureClicks is false", () => {
      collector = new MouseCollector({ ...defaultConfig, captureClicks: false }, 0, onEventMock);
      const addEventListenerSpy = vi.spyOn(element, "addEventListener");

      collector.attach(element);

      expect(addEventListenerSpy).not.toHaveBeenCalledWith("mousedown", expect.any(Function));
      expect(addEventListenerSpy).not.toHaveBeenCalledWith("click", expect.any(Function));
    });

    it("should remove event listeners on detach", () => {
      collector = new MouseCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);
      const removeEventListenerSpy = vi.spyOn(element, "removeEventListener");

      collector.detach();

      expect(removeEventListenerSpy).toHaveBeenCalledWith("mousemove", expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith("mousedown", expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith("mouseup", expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith("click", expect.any(Function));
    });

    it("should handle detach when not attached", () => {
      collector = new MouseCollector(defaultConfig, 0, onEventMock);

      expect(() => collector.detach()).not.toThrow();
    });

    it("should attach to document", () => {
      collector = new MouseCollector(defaultConfig, 0, onEventMock);
      const addEventListenerSpy = vi.spyOn(document, "addEventListener");

      collector.attach(document);

      expect(addEventListenerSpy).toHaveBeenCalled();
    });
  });

  describe("event recording", () => {
    it("should record mousemove events", () => {
      collector = new MouseCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createMouseEvent("mousemove", 50, 75));

      const events = collector.getEvents();
      expect(events.length).toBe(1);
      expect(events[0]).toMatchObject({
        time: 100,
        event: "mousemove",
        x: 50,
        y: 75,
      });
    });

    it("should record mousedown events", () => {
      collector = new MouseCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(200);
      element.dispatchEvent(createMouseEvent("mousedown", 100, 150));

      const events = collector.getEvents();
      expect(events.length).toBe(1);
      expect(events[0]).toMatchObject({
        time: 200,
        event: "mousedown",
        x: 100,
        y: 150,
      });
    });

    it("should record mouseup events", () => {
      collector = new MouseCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(300);
      element.dispatchEvent(createMouseEvent("mouseup", 120, 180));

      const events = collector.getEvents();
      expect(events.length).toBe(1);
      expect(events[0]).toMatchObject({
        time: 300,
        event: "mouseup",
        x: 120,
        y: 180,
      });
    });

    it("should record click events", () => {
      collector = new MouseCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(400);
      element.dispatchEvent(createMouseEvent("click", 200, 250));

      const events = collector.getEvents();
      expect(events.length).toBe(1);
      expect(events[0]).toMatchObject({
        time: 400,
        event: "click",
        x: 200,
        y: 250,
      });
    });

    it("should calculate time relative to start time", () => {
      collector = new MouseCollector(defaultConfig, 100, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(350);
      element.dispatchEvent(createMouseEvent("mousemove", 50, 50));

      const events = collector.getEvents();
      expect(events[0]?.time).toBe(250); // 350 - 100
    });

    it("should call onEvent callback", () => {
      collector = new MouseCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      element.dispatchEvent(createMouseEvent("click", 100, 100));

      expect(onEventMock).toHaveBeenCalledTimes(1);
      expect(onEventMock).toHaveBeenCalledWith(
        expect.objectContaining({
          event: "click",
          x: 100,
          y: 100,
        }),
      );
    });
  });

  describe("velocity and distance calculation", () => {
    it("should calculate distance between mousemove events", () => {
      collector = new MouseCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createMouseEvent("mousemove", 0, 0));

      vi.spyOn(performance, "now").mockReturnValue(200);
      element.dispatchEvent(createMouseEvent("mousemove", 3, 4));

      const events = collector.getEvents();
      expect(events[1]?.distance).toBe(5); // sqrt(3^2 + 4^2) = 5
    });

    it("should calculate velocity for mousemove events", () => {
      collector = new MouseCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createMouseEvent("mousemove", 0, 0));

      vi.spyOn(performance, "now").mockReturnValue(200);
      element.dispatchEvent(createMouseEvent("mousemove", 50, 0));

      const events = collector.getEvents();
      // distance = 50, time delta = 100ms, velocity = 0.5 px/ms
      expect(events[1]?.velocity).toBe(0.5);
    });

    it("should not have distance on first mousemove", () => {
      collector = new MouseCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createMouseEvent("mousemove", 50, 50));

      const events = collector.getEvents();
      expect(events[0]?.distance).toBeUndefined();
      expect(events[0]?.velocity).toBeUndefined();
    });
  });

  describe("drag tracking", () => {
    it("should mark mousemove as dragging after mousedown", () => {
      collector = new MouseCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createMouseEvent("mousedown", 10, 10));

      vi.spyOn(performance, "now").mockReturnValue(200);
      element.dispatchEvent(createMouseEvent("mousemove", 50, 50));

      const events = collector.getEvents();
      expect(events[1]?.isDragging).toBe(true);
    });

    it("should stop dragging after mouseup", () => {
      collector = new MouseCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createMouseEvent("mousedown", 10, 10));

      vi.spyOn(performance, "now").mockReturnValue(200);
      element.dispatchEvent(createMouseEvent("mouseup", 50, 50));

      vi.spyOn(performance, "now").mockReturnValue(300);
      element.dispatchEvent(createMouseEvent("mousemove", 100, 100));

      const events = collector.getEvents();
      expect(events[2]?.isDragging).toBeUndefined();
    });

    it("should include isDragging on mouseup if was dragging", () => {
      collector = new MouseCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createMouseEvent("mousedown", 10, 10));

      vi.spyOn(performance, "now").mockReturnValue(200);
      element.dispatchEvent(createMouseEvent("mouseup", 50, 50));

      const events = collector.getEvents();
      expect(events[1]?.isDragging).toBe(true);
    });
  });

  describe("throttling", () => {
    it("should throttle mousemove events", () => {
      collector = new MouseCollector({ ...defaultConfig, throttleMs: 100 }, 0, onEventMock);
      collector.attach(element);

      // First event should be recorded
      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createMouseEvent("mousemove", 10, 10));

      // Second event within throttle window should be ignored
      vi.spyOn(performance, "now").mockReturnValue(150);
      element.dispatchEvent(createMouseEvent("mousemove", 20, 20));

      // Third event after throttle window should be recorded
      vi.spyOn(performance, "now").mockReturnValue(250);
      element.dispatchEvent(createMouseEvent("mousemove", 30, 30));

      const events = collector.getEvents();
      expect(events.length).toBe(2);
      expect(events[0]?.x).toBe(10);
      expect(events[1]?.x).toBe(30);
    });
  });

  describe("idle detection", () => {
    it("should record idle period when activity resumes after threshold", () => {
      collector = new MouseCollector({ ...defaultConfig, idleThresholdMs: 1000 }, 0, onEventMock);
      collector.attach(element);

      // First activity at time 100
      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createMouseEvent("click", 10, 10));

      // Advance time by 1 second to trigger idle check interval
      vi.spyOn(performance, "now").mockReturnValue(1200);
      vi.advanceTimersByTime(1000);

      // Now idle detection should have started (idleStart = 100 + 1000 = 1100)

      // Resume activity at time 3000
      vi.spyOn(performance, "now").mockReturnValue(3000);
      element.dispatchEvent(createMouseEvent("click", 20, 20));

      const idlePeriods = collector.getIdlePeriods();
      expect(idlePeriods.length).toBe(1);
      expect(idlePeriods[0]?.start).toBe(1100); // last event (100) + threshold (1000)
    });

    it("should close idle period on detach", () => {
      collector = new MouseCollector({ ...defaultConfig, idleThresholdMs: 1000 }, 0, onEventMock);
      collector.attach(element);

      // First activity at time 100
      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createMouseEvent("click", 10, 10));

      // Advance time to trigger idle check
      vi.spyOn(performance, "now").mockReturnValue(1200);
      vi.advanceTimersByTime(1000);

      // Detach while idle at time 3000
      vi.spyOn(performance, "now").mockReturnValue(3000);
      collector.detach();

      const idlePeriods = collector.getIdlePeriods();
      expect(idlePeriods.length).toBe(1);
      expect(idlePeriods[0]?.end).toBe(3000);
    });
  });

  describe("getTotalIdleTime", () => {
    it("should return sum of idle period durations", () => {
      collector = new MouseCollector({ ...defaultConfig, idleThresholdMs: 1000 }, 0, onEventMock);
      collector.attach(element);

      // First activity at time 100
      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createMouseEvent("click", 10, 10));

      // Advance time to trigger idle check
      vi.spyOn(performance, "now").mockReturnValue(1200);
      vi.advanceTimersByTime(1000);

      // Resume activity at time 3000, creating idle period from 1100 to 3000
      vi.spyOn(performance, "now").mockReturnValue(3000);
      element.dispatchEvent(createMouseEvent("click", 20, 20));

      const totalIdle = collector.getTotalIdleTime();
      expect(totalIdle).toBe(1900); // 3000 - 1100
    });

    it("should return 0 when no idle periods", () => {
      collector = new MouseCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      element.dispatchEvent(createMouseEvent("click", 10, 10));

      expect(collector.getTotalIdleTime()).toBe(0);
    });
  });

  describe("getTotalDistance", () => {
    it("should return sum of all movement distances", () => {
      collector = new MouseCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createMouseEvent("mousemove", 0, 0));

      vi.spyOn(performance, "now").mockReturnValue(200);
      element.dispatchEvent(createMouseEvent("mousemove", 3, 4)); // distance = 5

      vi.spyOn(performance, "now").mockReturnValue(300);
      element.dispatchEvent(createMouseEvent("mousemove", 3, 16)); // distance = 12

      expect(collector.getTotalDistance()).toBe(17);
    });

    it("should return 0 when no mousemove events", () => {
      collector = new MouseCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      element.dispatchEvent(createMouseEvent("click", 10, 10));

      expect(collector.getTotalDistance()).toBe(0);
    });
  });

  describe("getEvents", () => {
    it("should return a copy of events array", () => {
      collector = new MouseCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      element.dispatchEvent(createMouseEvent("click", 10, 10));

      const events1 = collector.getEvents();
      const events2 = collector.getEvents();

      expect(events1).toEqual(events2);
      expect(events1).not.toBe(events2);
    });

    it("should return empty array when no events", () => {
      collector = new MouseCollector(defaultConfig, 0, onEventMock);

      expect(collector.getEvents()).toEqual([]);
    });
  });

  describe("reset", () => {
    it("should clear all events", () => {
      collector = new MouseCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      element.dispatchEvent(createMouseEvent("click", 10, 10));
      element.dispatchEvent(createMouseEvent("mousemove", 20, 20));

      collector.reset();

      expect(collector.getEvents()).toEqual([]);
    });

    it("should clear idle periods", () => {
      collector = new MouseCollector({ ...defaultConfig, idleThresholdMs: 1000 }, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createMouseEvent("click", 10, 10));

      vi.advanceTimersByTime(2000);
      vi.spyOn(performance, "now").mockReturnValue(3000);
      element.dispatchEvent(createMouseEvent("click", 20, 20));

      collector.reset();

      expect(collector.getIdlePeriods()).toEqual([]);
    });

    it("should update start time when provided", () => {
      collector = new MouseCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      collector.reset(1000);

      vi.spyOn(performance, "now").mockReturnValue(1200);
      element.dispatchEvent(createMouseEvent("click", 10, 10));

      const events = collector.getEvents();
      expect(events[0]?.time).toBe(200); // 1200 - 1000
    });

    it("should keep start time when not provided", () => {
      collector = new MouseCollector(defaultConfig, 100, onEventMock);
      collector.attach(element);

      collector.reset();

      vi.spyOn(performance, "now").mockReturnValue(300);
      element.dispatchEvent(createMouseEvent("click", 10, 10));

      const events = collector.getEvents();
      expect(events[0]?.time).toBe(200); // 300 - 100
    });

    it("should reset dragging state", () => {
      collector = new MouseCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createMouseEvent("mousedown", 10, 10));

      collector.reset();

      vi.spyOn(performance, "now").mockReturnValue(200);
      element.dispatchEvent(createMouseEvent("mousemove", 50, 50));

      const events = collector.getEvents();
      expect(events[0]?.isDragging).toBeUndefined();
    });

    it("should reset velocity calculation state", () => {
      collector = new MouseCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createMouseEvent("mousemove", 0, 0));

      vi.spyOn(performance, "now").mockReturnValue(200);
      element.dispatchEvent(createMouseEvent("mousemove", 50, 50));

      collector.reset();

      vi.spyOn(performance, "now").mockReturnValue(300);
      element.dispatchEvent(createMouseEvent("mousemove", 100, 100));

      const events = collector.getEvents();
      // First event after reset should not have distance/velocity
      expect(events[0]?.distance).toBeUndefined();
      expect(events[0]?.velocity).toBeUndefined();
    });
  });

  describe("edge cases", () => {
    it("should handle rapid successive events", () => {
      collector = new MouseCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      for (let i = 0; i < 10; i++) {
        element.dispatchEvent(createMouseEvent("mousemove", i * 10, i * 10));
      }

      const events = collector.getEvents();
      expect(events.length).toBe(10);
    });

    it("should handle zero distance movement", () => {
      collector = new MouseCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createMouseEvent("mousemove", 50, 50));

      vi.spyOn(performance, "now").mockReturnValue(200);
      element.dispatchEvent(createMouseEvent("mousemove", 50, 50));

      const events = collector.getEvents();
      expect(events[1]?.distance).toBe(0);
      expect(events[1]?.velocity).toBe(0);
    });

    it("should handle negative coordinates", () => {
      collector = new MouseCollector(defaultConfig, 0, onEventMock);
      collector.attach(element);

      vi.spyOn(performance, "now").mockReturnValue(100);
      element.dispatchEvent(createMouseEvent("mousemove", -10, -20));

      const events = collector.getEvents();
      expect(events[0]?.x).toBe(-10);
      expect(events[0]?.y).toBe(-20);
    });
  });
});
