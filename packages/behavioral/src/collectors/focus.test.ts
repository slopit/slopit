import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FocusCollector } from "./focus.js";

describe("FocusCollector", () => {
  let collector: FocusCollector;
  let onEventMock: ReturnType<typeof vi.fn>;

  const defaultConfig = {
    enabled: true,
    useVisibilityAPI: true,
    useBlurFocus: true,
  };

  beforeEach(() => {
    onEventMock = vi.fn();
    vi.spyOn(performance, "now").mockReturnValue(1000);
  });

  afterEach(() => {
    collector?.detach();
    vi.restoreAllMocks();
  });

  describe("attach and detach", () => {
    it("should attach blur/focus listeners to window when enabled", () => {
      collector = new FocusCollector(defaultConfig, 0, onEventMock);
      const windowAddSpy = vi.spyOn(window, "addEventListener");

      collector.attach(document);

      expect(windowAddSpy).toHaveBeenCalledWith("focus", expect.any(Function));
      expect(windowAddSpy).toHaveBeenCalledWith("blur", expect.any(Function));
    });

    it("should attach visibility listener to document when enabled", () => {
      collector = new FocusCollector(defaultConfig, 0, onEventMock);
      const docAddSpy = vi.spyOn(document, "addEventListener");

      collector.attach(document);

      expect(docAddSpy).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
    });

    it("should not attach blur/focus when disabled", () => {
      collector = new FocusCollector({ ...defaultConfig, useBlurFocus: false }, 0, onEventMock);
      const windowAddSpy = vi.spyOn(window, "addEventListener");

      collector.attach(document);

      expect(windowAddSpy).not.toHaveBeenCalledWith("focus", expect.any(Function));
      expect(windowAddSpy).not.toHaveBeenCalledWith("blur", expect.any(Function));
    });

    it("should not attach visibility when disabled", () => {
      collector = new FocusCollector({ ...defaultConfig, useVisibilityAPI: false }, 0, onEventMock);
      const docAddSpy = vi.spyOn(document, "addEventListener");

      collector.attach(document);

      expect(docAddSpy).not.toHaveBeenCalledWith("visibilitychange", expect.any(Function));
    });

    it("should not attach twice", () => {
      collector = new FocusCollector(defaultConfig, 0, onEventMock);
      const windowAddSpy = vi.spyOn(window, "addEventListener");

      collector.attach(document);
      collector.attach(document);

      // Should only add listeners once
      expect(windowAddSpy).toHaveBeenCalledTimes(2); // focus + blur
    });

    it("should remove listeners on detach", () => {
      collector = new FocusCollector(defaultConfig, 0, onEventMock);
      collector.attach(document);

      const windowRemoveSpy = vi.spyOn(window, "removeEventListener");
      const docRemoveSpy = vi.spyOn(document, "removeEventListener");

      collector.detach();

      expect(windowRemoveSpy).toHaveBeenCalledWith("focus", expect.any(Function));
      expect(windowRemoveSpy).toHaveBeenCalledWith("blur", expect.any(Function));
      expect(docRemoveSpy).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
    });

    it("should handle detach when not attached", () => {
      collector = new FocusCollector(defaultConfig, 0, onEventMock);

      expect(() => collector.detach()).not.toThrow();
    });
  });

  describe("focus events", () => {
    it("should record focus event", () => {
      collector = new FocusCollector(defaultConfig, 0, onEventMock);
      collector.attach(document);

      vi.spyOn(performance, "now").mockReturnValue(500);
      window.dispatchEvent(new Event("focus"));

      const events = collector.getEvents();
      expect(events.length).toBe(1);
      expect(events[0]).toMatchObject({
        time: 500,
        event: "focus",
      });
    });

    it("should call onEvent callback for focus", () => {
      collector = new FocusCollector(defaultConfig, 0, onEventMock);
      collector.attach(document);

      window.dispatchEvent(new Event("focus"));

      expect(onEventMock).toHaveBeenCalledWith(expect.objectContaining({ event: "focus" }));
    });
  });

  describe("blur events", () => {
    it("should record blur event", () => {
      collector = new FocusCollector(defaultConfig, 0, onEventMock);
      collector.attach(document);

      vi.spyOn(performance, "now").mockReturnValue(600);
      window.dispatchEvent(new Event("blur"));

      const events = collector.getEvents();
      expect(events.length).toBe(1);
      expect(events[0]).toMatchObject({
        time: 600,
        event: "blur",
      });
    });

    it("should calculate blur duration on focus", () => {
      collector = new FocusCollector(defaultConfig, 0, onEventMock);
      collector.attach(document);

      vi.spyOn(performance, "now").mockReturnValue(1000);
      window.dispatchEvent(new Event("blur"));

      vi.spyOn(performance, "now").mockReturnValue(1500);
      window.dispatchEvent(new Event("focus"));

      const events = collector.getEvents();
      expect(events[0]?.blurDuration).toBe(500);
    });

    it("should calculate blur duration on detach", () => {
      collector = new FocusCollector(defaultConfig, 0, onEventMock);
      collector.attach(document);

      vi.spyOn(performance, "now").mockReturnValue(1000);
      window.dispatchEvent(new Event("blur"));

      vi.spyOn(performance, "now").mockReturnValue(2000);
      collector.detach();

      const events = collector.getEvents();
      expect(events[0]?.blurDuration).toBe(1000);
    });

    it("should not update blur duration multiple times", () => {
      collector = new FocusCollector(defaultConfig, 0, onEventMock);
      collector.attach(document);

      vi.spyOn(performance, "now").mockReturnValue(1000);
      window.dispatchEvent(new Event("blur"));

      vi.spyOn(performance, "now").mockReturnValue(1500);
      window.dispatchEvent(new Event("focus"));

      vi.spyOn(performance, "now").mockReturnValue(2000);
      window.dispatchEvent(new Event("focus")); // Another focus

      const events = collector.getEvents();
      // First blur should still have duration of 500
      expect(events[0]?.blurDuration).toBe(500);
    });
  });

  describe("visibility events", () => {
    it("should record visibility hidden", () => {
      collector = new FocusCollector(defaultConfig, 0, onEventMock);
      collector.attach(document);

      vi.spyOn(performance, "now").mockReturnValue(700);
      Object.defineProperty(document, "visibilityState", {
        value: "hidden",
        configurable: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));

      const events = collector.getEvents();
      expect(events.length).toBe(1);
      expect(events[0]).toMatchObject({
        time: 700,
        event: "visibilitychange",
        visibility: "hidden",
      });
    });

    it("should record visibility visible", () => {
      collector = new FocusCollector(defaultConfig, 0, onEventMock);
      collector.attach(document);

      vi.spyOn(performance, "now").mockReturnValue(800);
      Object.defineProperty(document, "visibilityState", {
        value: "visible",
        configurable: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));

      const events = collector.getEvents();
      expect(events[0]).toMatchObject({
        event: "visibilitychange",
        visibility: "visible",
      });
    });

    it("should call onEvent callback for visibility", () => {
      collector = new FocusCollector(defaultConfig, 0, onEventMock);
      collector.attach(document);

      Object.defineProperty(document, "visibilityState", {
        value: "hidden",
        configurable: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));

      expect(onEventMock).toHaveBeenCalledWith(
        expect.objectContaining({
          event: "visibilitychange",
          visibility: "hidden",
        }),
      );
    });
  });

  describe("getEvents", () => {
    it("should return a copy of events array", () => {
      collector = new FocusCollector(defaultConfig, 0, onEventMock);
      collector.attach(document);

      window.dispatchEvent(new Event("blur"));

      const events1 = collector.getEvents();
      const events2 = collector.getEvents();

      expect(events1).toEqual(events2);
      expect(events1).not.toBe(events2);
    });

    it("should return empty array when no events", () => {
      collector = new FocusCollector(defaultConfig, 0, onEventMock);

      expect(collector.getEvents()).toEqual([]);
    });
  });

  describe("reset", () => {
    it("should clear all events", () => {
      collector = new FocusCollector(defaultConfig, 0, onEventMock);
      collector.attach(document);

      window.dispatchEvent(new Event("blur"));
      window.dispatchEvent(new Event("focus"));

      collector.reset();

      expect(collector.getEvents()).toEqual([]);
    });

    it("should clear blur tracking state", () => {
      collector = new FocusCollector(defaultConfig, 0, onEventMock);
      collector.attach(document);

      vi.spyOn(performance, "now").mockReturnValue(1000);
      window.dispatchEvent(new Event("blur"));

      collector.reset();

      // New blur should start fresh
      vi.spyOn(performance, "now").mockReturnValue(2000);
      window.dispatchEvent(new Event("blur"));

      vi.spyOn(performance, "now").mockReturnValue(2500);
      window.dispatchEvent(new Event("focus"));

      const events = collector.getEvents();
      expect(events[0]?.blurDuration).toBe(500);
    });

    it("should update start time when provided", () => {
      collector = new FocusCollector(defaultConfig, 0, onEventMock);
      collector.attach(document);

      collector.reset(1000);

      vi.spyOn(performance, "now").mockReturnValue(1300);
      window.dispatchEvent(new Event("blur"));

      const events = collector.getEvents();
      expect(events[0]?.time).toBe(300);
    });

    it("should keep start time when not provided", () => {
      collector = new FocusCollector(defaultConfig, 100, onEventMock);
      collector.attach(document);

      collector.reset();

      vi.spyOn(performance, "now").mockReturnValue(400);
      window.dispatchEvent(new Event("blur"));

      const events = collector.getEvents();
      expect(events[0]?.time).toBe(300); // 400 - 100
    });

    it("should clear hidden tracking state", () => {
      collector = new FocusCollector(defaultConfig, 0, onEventMock);
      collector.attach(document);

      Object.defineProperty(document, "visibilityState", {
        value: "hidden",
        configurable: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));

      collector.reset();

      expect(collector.getEvents()).toEqual([]);
    });
  });

  describe("time calculation", () => {
    it("should calculate time relative to start time", () => {
      collector = new FocusCollector(defaultConfig, 500, onEventMock);
      collector.attach(document);

      vi.spyOn(performance, "now").mockReturnValue(800);
      window.dispatchEvent(new Event("blur"));

      const events = collector.getEvents();
      expect(events[0]?.time).toBe(300); // 800 - 500
    });
  });

  describe("mixed events", () => {
    it("should record interleaved blur, focus, and visibility events", () => {
      collector = new FocusCollector(defaultConfig, 0, onEventMock);
      collector.attach(document);

      vi.spyOn(performance, "now").mockReturnValue(100);
      window.dispatchEvent(new Event("blur"));

      vi.spyOn(performance, "now").mockReturnValue(200);
      Object.defineProperty(document, "visibilityState", {
        value: "hidden",
        configurable: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));

      vi.spyOn(performance, "now").mockReturnValue(300);
      Object.defineProperty(document, "visibilityState", {
        value: "visible",
        configurable: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));

      vi.spyOn(performance, "now").mockReturnValue(400);
      window.dispatchEvent(new Event("focus"));

      const events = collector.getEvents();
      expect(events.length).toBe(4);
      expect(events[0]?.event).toBe("blur");
      expect(events[1]?.event).toBe("visibilitychange");
      expect(events[2]?.event).toBe("visibilitychange");
      expect(events[3]?.event).toBe("focus");
    });
  });
});
