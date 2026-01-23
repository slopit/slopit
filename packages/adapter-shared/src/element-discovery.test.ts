import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { discoverElement, discoverElements } from "./element-discovery.js";

describe("discoverElement", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    container.id = "test-container";
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    vi.restoreAllMocks();
  });

  describe("when element exists", () => {
    it("should call onFound immediately", () => {
      const textarea = document.createElement("textarea");
      textarea.id = "existing-input";
      container.appendChild(textarea);

      const onFound = vi.fn();
      const cleanup = discoverElement({
        selector: "#existing-input",
        container,
        onFound,
      });

      expect(onFound).toHaveBeenCalledTimes(1);
      expect(onFound).toHaveBeenCalledWith(textarea);
      cleanup();
    });

    it("should not set up MutationObserver when element exists", () => {
      const textarea = document.createElement("textarea");
      container.appendChild(textarea);

      const observeSpy = vi.spyOn(MutationObserver.prototype, "observe");
      const onFound = vi.fn();

      const cleanup = discoverElement({
        selector: "textarea",
        container,
        onFound,
      });

      expect(observeSpy).not.toHaveBeenCalled();
      cleanup();
    });
  });

  describe("when element does not exist", () => {
    it("should call onFound when element is added to DOM", async () => {
      const onFound = vi.fn();
      const cleanup = discoverElement({
        selector: "#dynamic-input",
        container,
        onFound,
      });

      expect(onFound).not.toHaveBeenCalled();

      // Add the element dynamically
      const textarea = document.createElement("textarea");
      textarea.id = "dynamic-input";
      container.appendChild(textarea);

      // Wait for MutationObserver callback
      await vi.waitFor(() => {
        expect(onFound).toHaveBeenCalledTimes(1);
      });

      expect(onFound).toHaveBeenCalledWith(textarea);
      cleanup();
    });

    it("should call onTimeout when element is not found within timeout", async () => {
      const onFound = vi.fn();
      const onTimeout = vi.fn();

      vi.useFakeTimers();

      const cleanup = discoverElement({
        selector: "#nonexistent",
        container,
        timeout: 1000,
        onFound,
        onTimeout,
      });

      expect(onFound).not.toHaveBeenCalled();
      expect(onTimeout).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(1000);

      expect(onFound).not.toHaveBeenCalled();
      expect(onTimeout).toHaveBeenCalledTimes(1);

      cleanup();
      vi.useRealTimers();
    });

    it("should not call onTimeout if element is found before timeout", async () => {
      const onFound = vi.fn();
      const onTimeout = vi.fn();

      vi.useFakeTimers();

      const cleanup = discoverElement({
        selector: "#delayed-input",
        container,
        timeout: 1000,
        onFound,
        onTimeout,
      });

      // Add element before timeout
      await vi.advanceTimersByTimeAsync(500);

      const textarea = document.createElement("textarea");
      textarea.id = "delayed-input";
      container.appendChild(textarea);

      // Wait for MutationObserver
      await vi.advanceTimersByTimeAsync(0);

      expect(onFound).toHaveBeenCalledTimes(1);

      // Advance past timeout
      await vi.advanceTimersByTimeAsync(600);

      expect(onTimeout).not.toHaveBeenCalled();

      cleanup();
      vi.useRealTimers();
    });
  });

  describe("cleanup", () => {
    it("should disconnect observer when cleanup is called", () => {
      const disconnectSpy = vi.spyOn(MutationObserver.prototype, "disconnect");
      const onFound = vi.fn();

      const cleanup = discoverElement({
        selector: "#nonexistent",
        container,
        onFound,
      });

      cleanup();

      expect(disconnectSpy).toHaveBeenCalled();
    });

    it("should clear timeout when cleanup is called", () => {
      vi.useFakeTimers();
      const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

      const cleanup = discoverElement({
        selector: "#nonexistent",
        container,
        timeout: 5000,
        onFound: vi.fn(),
      });

      cleanup();

      expect(clearTimeoutSpy).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe("with document as container", () => {
    it("should search within document", () => {
      const textarea = document.createElement("textarea");
      textarea.id = "doc-level-input";
      document.body.appendChild(textarea);

      const onFound = vi.fn();
      const cleanup = discoverElement({
        selector: "#doc-level-input",
        container: document,
        onFound,
      });

      expect(onFound).toHaveBeenCalledWith(textarea);

      cleanup();
      textarea.remove();
    });
  });
});

describe("discoverElements", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("should call onFound when minimum count is met immediately", () => {
    const input1 = document.createElement("input");
    const input2 = document.createElement("input");
    container.appendChild(input1);
    container.appendChild(input2);

    const onFound = vi.fn();
    const cleanup = discoverElements({
      selector: "input",
      container,
      minCount: 2,
      onFound,
    });

    expect(onFound).toHaveBeenCalledTimes(1);
    expect(onFound).toHaveBeenCalledWith([input1, input2]);
    cleanup();
  });

  it("should wait until minimum count is reached", async () => {
    const input1 = document.createElement("input");
    container.appendChild(input1);

    const onFound = vi.fn();
    const cleanup = discoverElements({
      selector: "input",
      container,
      minCount: 2,
      onFound,
    });

    expect(onFound).not.toHaveBeenCalled();

    // Add second input
    const input2 = document.createElement("input");
    container.appendChild(input2);

    await vi.waitFor(() => {
      expect(onFound).toHaveBeenCalledTimes(1);
    });

    expect(onFound).toHaveBeenCalledWith([input1, input2]);
    cleanup();
  });

  it("should call onTimeout with partial results", async () => {
    vi.useFakeTimers();

    const input1 = document.createElement("input");
    container.appendChild(input1);

    const onFound = vi.fn();
    const onTimeout = vi.fn();

    const cleanup = discoverElements({
      selector: "input",
      container,
      minCount: 3,
      timeout: 1000,
      onFound,
      onTimeout,
    });

    await vi.advanceTimersByTimeAsync(1000);

    expect(onFound).not.toHaveBeenCalled();
    expect(onTimeout).toHaveBeenCalledTimes(1);
    expect(onTimeout).toHaveBeenCalledWith([input1]);

    cleanup();
    vi.useRealTimers();
  });

  it("should use default minCount of 1", () => {
    const input = document.createElement("input");
    container.appendChild(input);

    const onFound = vi.fn();
    const cleanup = discoverElements({
      selector: "input",
      container,
      onFound,
    });

    expect(onFound).toHaveBeenCalledWith([input]);
    cleanup();
  });
});
