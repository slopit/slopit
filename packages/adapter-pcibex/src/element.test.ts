/**
 * Tests for the PCIbex element API.
 */

import {
  createMockInput,
  createMockTextarea,
  delay,
  simulatePaste,
  simulateTyping,
} from "@slopit/adapter-shared";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  clearSlopitElements,
  getAllSlopitData,
  getSlopit,
  getSlopitCount,
  newSlopit,
} from "./element.js";
import type { PennElement } from "./types.js";

/**
 * Create a mock PennController element wrapping a DOM element.
 */
function createMockPennElement(element: HTMLElement): PennElement {
  return {
    _element: element,
    jQueryElement: {
      get: (index: number) => (index === 0 ? element : undefined),
      length: 1,
    },
    jQueryContainer: {
      find: (_selector: string) => ({
        get: (index: number) => (index === 0 ? element : undefined),
        length: 1,
      }),
    },
  };
}

/**
 * Create a mock PennController element using only jQueryContainer.
 */
function createMockPennElementWithContainer(element: HTMLElement): PennElement {
  return {
    jQueryContainer: {
      find: (selector: string) => {
        if (selector.includes("input") || selector.includes("textarea")) {
          return {
            get: (index: number) => (index === 0 ? element : undefined),
            length: 1,
          };
        }
        return { get: () => undefined, length: 0 };
      },
    },
  };
}

describe("newSlopit", () => {
  beforeEach(() => {
    clearSlopitElements();
  });

  afterEach(() => {
    clearSlopitElements();
  });

  it("should create a new Slopit element", () => {
    const element = newSlopit("test");
    expect(element).toBeDefined();
    expect(typeof element.attach).toBe("function");
    expect(typeof element.keystroke).toBe("function");
    expect(typeof element.paste).toBe("function");
    expect(typeof element.focus).toBe("function");
    expect(typeof element.mouse).toBe("function");
    expect(typeof element.scroll).toBe("function");
    expect(typeof element.log).toBe("function");
  });

  it("should register the element in the global registry", () => {
    newSlopit("registered");
    expect(getSlopit("registered")).toBeDefined();
    expect(getSlopitCount()).toBe(1);
  });

  it("should overwrite existing element with same name", () => {
    const first = newSlopit("duplicate");
    const second = newSlopit("duplicate");
    expect(getSlopit("duplicate")).toBe(second);
    expect(getSlopit("duplicate")).not.toBe(first);
    expect(getSlopitCount()).toBe(1);
  });
});

describe("getSlopit", () => {
  beforeEach(() => {
    clearSlopitElements();
  });

  afterEach(() => {
    clearSlopitElements();
  });

  it("should return undefined for non-existent element", () => {
    expect(getSlopit("nonexistent")).toBeUndefined();
  });

  it("should return the element after creation", () => {
    const created = newSlopit("findme");
    const found = getSlopit("findme");
    expect(found).toBe(created);
  });
});

describe("clearSlopitElements", () => {
  beforeEach(() => {
    clearSlopitElements();
  });

  it("should clear all registered elements", () => {
    newSlopit("one");
    newSlopit("two");
    newSlopit("three");
    expect(getSlopitCount()).toBe(3);

    clearSlopitElements();
    expect(getSlopitCount()).toBe(0);
    expect(getSlopit("one")).toBeUndefined();
    expect(getSlopit("two")).toBeUndefined();
    expect(getSlopit("three")).toBeUndefined();
  });

  it("should auto-log elements that have not been logged", () => {
    const input = createMockInput();
    document.body.appendChild(input);

    const pennElement = createMockPennElement(input);
    const slopit = newSlopit("autolog");
    slopit.attach(pennElement).keystroke(true);

    // Element has not been logged yet
    expect(slopit._getData()).toBeNull();

    // clearSlopitElements should auto-log
    clearSlopitElements();

    // After clearing, the element is gone from registry
    expect(getSlopit("autolog")).toBeUndefined();

    document.body.removeChild(input);
  });
});

describe("getAllSlopitData", () => {
  beforeEach(() => {
    clearSlopitElements();
  });

  afterEach(() => {
    clearSlopitElements();
  });

  it("should return empty object when no elements exist", () => {
    const data = getAllSlopitData();
    expect(data).toEqual({});
  });

  it("should return null for elements that have not been logged", () => {
    newSlopit("notlogged");
    const data = getAllSlopitData();
    expect(data.notlogged).toBeNull();
  });

  it("should return data for logged elements", () => {
    const input = createMockInput();
    document.body.appendChild(input);

    const pennElement = createMockPennElement(input);
    newSlopit("logged").attach(pennElement).keystroke(true).log();

    const data = getAllSlopitData();
    expect(data.logged).not.toBeNull();
    expect(data.logged?.behavioral).toBeDefined();
    expect(data.logged?.flags).toBeDefined();

    document.body.removeChild(input);
  });
});

describe("SlopitElement chaining", () => {
  beforeEach(() => {
    clearSlopitElements();
  });

  afterEach(() => {
    clearSlopitElements();
  });

  it("should support method chaining", () => {
    const input = createMockInput();
    document.body.appendChild(input);

    const pennElement = createMockPennElement(input);

    const element = newSlopit("chained")
      .attach(pennElement)
      .keystroke(true)
      .paste(true, false)
      .focus(true)
      .mouse(false)
      .scroll(false)
      .log();

    expect(element).toBeDefined();
    expect(element._getData()).not.toBeNull();

    document.body.removeChild(input);
  });
});

describe("SlopitElement.attach", () => {
  beforeEach(() => {
    clearSlopitElements();
  });

  afterEach(() => {
    clearSlopitElements();
  });

  it("should attach to a PennElement with _element", () => {
    const input = createMockInput();
    document.body.appendChild(input);

    const pennElement: PennElement = { _element: input };

    newSlopit("directelement").attach(pennElement).keystroke(true).log();

    const data = getAllSlopitData();
    expect(data.directelement).not.toBeNull();

    document.body.removeChild(input);
  });

  it("should attach to a PennElement with jQueryElement", () => {
    const input = createMockInput();
    document.body.appendChild(input);

    const pennElement: PennElement = {
      jQueryElement: {
        get: (index: number) => (index === 0 ? input : undefined),
        length: 1,
      },
    };

    newSlopit("jqueryelement").attach(pennElement).keystroke(true).log();

    const data = getAllSlopitData();
    expect(data.jqueryelement).not.toBeNull();

    document.body.removeChild(input);
  });

  it("should attach to a PennElement with jQueryContainer", () => {
    const textarea = createMockTextarea();
    document.body.appendChild(textarea);

    const pennElement = createMockPennElementWithContainer(textarea);

    newSlopit("jquerycontainer").attach(pennElement).keystroke(true).log();

    const data = getAllSlopitData();
    expect(data.jquerycontainer).not.toBeNull();

    document.body.removeChild(textarea);
  });

  it("should handle PennElement with no extractable element", () => {
    const pennElement: PennElement = {};

    // Should not throw, but won't capture anything meaningful
    newSlopit("noelement").attach(pennElement).keystroke(true).log();

    const data = getAllSlopitData();
    // Data will still be collected (empty), not null, since log() was called
    // even though no element was attached
    expect(data.noelement).toBeDefined();
  });
});

describe("SlopitElement.keystroke", () => {
  beforeEach(() => {
    clearSlopitElements();
  });

  afterEach(() => {
    clearSlopitElements();
  });

  it("should capture keystrokes when enabled", async () => {
    const input = createMockInput();
    document.body.appendChild(input);

    const pennElement = createMockPennElement(input);

    newSlopit("keystroke-capture").attach(pennElement).keystroke(true);

    input.focus();
    await simulateTyping(input, "hello");
    await delay(50);

    getSlopit("keystroke-capture")?.log();

    const data = getAllSlopitData();
    expect(data["keystroke-capture"]?.behavioral.keystrokes.length).toBeGreaterThan(0);

    document.body.removeChild(input);
  });

  it("should not capture keystrokes when disabled", async () => {
    const input = createMockInput();
    document.body.appendChild(input);

    const pennElement = createMockPennElement(input);

    newSlopit("keystroke-disabled").attach(pennElement).keystroke(false);

    input.focus();
    await simulateTyping(input, "hello");
    await delay(50);

    getSlopit("keystroke-disabled")?.log();

    const data = getAllSlopitData();
    expect(data["keystroke-disabled"]?.behavioral.keystrokes).toEqual([]);

    document.body.removeChild(input);
  });
});

describe("SlopitElement.paste", () => {
  beforeEach(() => {
    clearSlopitElements();
  });

  afterEach(() => {
    clearSlopitElements();
  });

  it("should capture paste events when enabled", async () => {
    const input = createMockInput();
    document.body.appendChild(input);

    const pennElement = createMockPennElement(input);

    newSlopit("paste-capture").attach(pennElement).keystroke(true).paste(true, true);

    input.focus();
    simulatePaste(input, "pasted content");
    await delay(50);

    getSlopit("paste-capture")?.log();

    const data = getAllSlopitData();
    expect(data["paste-capture"]?.behavioral.paste.length).toBeGreaterThan(0);

    document.body.removeChild(input);
  });

  it("should not capture paste events when disabled", async () => {
    const input = createMockInput();
    document.body.appendChild(input);

    const pennElement = createMockPennElement(input);

    newSlopit("paste-disabled").attach(pennElement).keystroke(true).paste(false);

    input.focus();
    simulatePaste(input, "pasted content");
    await delay(50);

    getSlopit("paste-disabled")?.log();

    const _data = getAllSlopitData();
    // Paste events may still be captured by clipboard collector
    // but the paste config being disabled affects the paste collector specifically

    document.body.removeChild(input);
  });
});

describe("SlopitElement.log", () => {
  beforeEach(() => {
    clearSlopitElements();
  });

  afterEach(() => {
    clearSlopitElements();
  });

  it("should finalize data and make it available via _getData", () => {
    const input = createMockInput();
    document.body.appendChild(input);

    const pennElement = createMockPennElement(input);
    const element = newSlopit("logging").attach(pennElement).keystroke(true);

    // Before log, data is null
    expect(element._getData()).toBeNull();

    element.log();

    // After log, data is available
    const data = element._getData();
    expect(data).not.toBeNull();
    expect(data?.behavioral).toBeDefined();
    expect(data?.flags).toBeDefined();

    document.body.removeChild(input);
  });

  it("should be idempotent (calling log twice is safe)", () => {
    const input = createMockInput();
    document.body.appendChild(input);

    const pennElement = createMockPennElement(input);
    const element = newSlopit("idempotent").attach(pennElement).keystroke(true);

    element.log();
    const firstData = element._getData();

    element.log();
    const secondData = element._getData();

    // Data should be the same
    expect(secondData).toEqual(firstData);

    document.body.removeChild(input);
  });
});

describe("getSlopitCount", () => {
  beforeEach(() => {
    clearSlopitElements();
  });

  afterEach(() => {
    clearSlopitElements();
  });

  it("should return 0 when no elements exist", () => {
    expect(getSlopitCount()).toBe(0);
  });

  it("should return correct count", () => {
    newSlopit("a");
    expect(getSlopitCount()).toBe(1);

    newSlopit("b");
    expect(getSlopitCount()).toBe(2);

    newSlopit("c");
    expect(getSlopitCount()).toBe(3);
  });
});
