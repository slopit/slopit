/**
 * Detector for sudden text appearance without keystroke or paste source.
 *
 * @module
 */

import type { DetectionIndicator, DetectionResult, Detector } from "./types.js";

/**
 * Configuration for the text appearance detector.
 */
export interface TextAppearanceDetectorConfig {
  /**
   * Minimum character count to flag as suspicious.
   * @default 50
   */
  minTextLength?: number;

  /**
   * Time window in milliseconds to check for keystroke activity.
   * @default 2000
   */
  timeWindowMs?: number;
}

/**
 * Callbacks for checking keystroke and paste activity.
 */
export interface TextAppearanceCallbacks {
  /**
   * Returns the number of keystrokes in the recent time window.
   */
  getRecentKeystrokes?: () => number;

  /**
   * Returns whether a paste occurred in the recent time window.
   */
  hadRecentPaste?: () => boolean;
}

/**
 * Default configuration values.
 */
const DEFAULT_CONFIG: Required<TextAppearanceDetectorConfig> = {
  minTextLength: 50,
  timeWindowMs: 2000,
};

/**
 * Detects sudden text appearance without corresponding keystroke or paste events.
 *
 * This detector uses MutationObserver to watch for text changes in input fields,
 * textareas, and contenteditable elements. When text appears faster than possible
 * via normal typing (e.g., 50+ characters with no keystrokes), it flags the event
 * as suspicious.
 *
 * @example
 * ```typescript
 * const detector = new TextAppearanceDetector(
 *   { minTextLength: 30, timeWindowMs: 1500 },
 *   {
 *     getRecentKeystrokes: () => keystrokeCollector.getRecentCount(1500),
 *     hadRecentPaste: () => pasteCollector.hadRecentPaste(1500),
 *   }
 * );
 *
 * detector.startMonitoring(document.getElementById("response"));
 * // ... user interaction ...
 * const result = detector.detect();
 * detector.stopMonitoring();
 * ```
 */
export class TextAppearanceDetector implements Detector {
  readonly name = "text_appearance";

  private observer: MutationObserver | null = null;
  private indicators: DetectionIndicator[] = [];
  private lastTextLength: Map<Element, number> = new Map();
  private keystrokeCallback: (() => number) | undefined;
  private pasteCallback: (() => boolean) | undefined;
  private config: Required<TextAppearanceDetectorConfig>;
  private startTime: number;
  private monitoredElement: HTMLElement | null = null;
  private inputHandler: ((e: Event) => void) | null = null;

  /**
   * Creates a new TextAppearanceDetector.
   *
   * @param config - Configuration options
   * @param callbacks - Callbacks for checking keystroke and paste activity
   */
  constructor(config: TextAppearanceDetectorConfig = {}, callbacks?: TextAppearanceCallbacks) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.keystrokeCallback = callbacks?.getRecentKeystrokes;
    this.pasteCallback = callbacks?.hadRecentPaste;
    this.startTime = performance.now();
  }

  /**
   * Returns detection results with all recorded indicators.
   *
   * @returns Detection result with indicators of sudden text appearance
   */
  detect(): DetectionResult {
    const detected = this.indicators.length > 0;
    const confidence = detected ? this.calculateConfidence() : 0;

    return {
      detected,
      confidence,
      message: detected
        ? `Detected ${this.indicators.length} instance(s) of sudden text appearance`
        : "No sudden text appearance detected",
      indicators: [...this.indicators],
    };
  }

  /**
   * Starts monitoring an element for sudden text appearance.
   *
   * Watches for text changes in input/textarea elements and content changes
   * in contenteditable elements via MutationObserver.
   *
   * @param element - The element to monitor
   */
  startMonitoring(element: HTMLElement): void {
    if (this.observer) {
      this.stopMonitoring();
    }

    this.monitoredElement = element;
    this.startTime = performance.now();
    this.initializeTextLengths(element);

    // Set up input event listener for input/textarea elements
    this.inputHandler = this.handleInputEvent.bind(this);
    element.addEventListener("input", this.inputHandler, true);

    // Set up MutationObserver for contenteditable and other DOM changes
    this.observer = new MutationObserver(this.handleMutations.bind(this));
    this.observer.observe(element, {
      characterData: true,
      childList: true,
      subtree: true,
      characterDataOldValue: true,
    });
  }

  /**
   * Stops monitoring and cleans up resources.
   */
  stopMonitoring(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.monitoredElement && this.inputHandler) {
      this.monitoredElement.removeEventListener("input", this.inputHandler, true);
      this.inputHandler = null;
    }

    this.monitoredElement = null;
    this.lastTextLength.clear();
  }

  /**
   * Resets the detector state.
   *
   * @param newStartTime - Optional new start time for timing calculations
   */
  reset(newStartTime?: number): void {
    this.indicators = [];
    this.lastTextLength.clear();
    if (newStartTime !== undefined) {
      this.startTime = newStartTime;
    }
  }

  /**
   * Returns the current list of indicators.
   *
   * @returns Copy of the indicators array
   */
  getIndicators(): DetectionIndicator[] {
    return [...this.indicators];
  }

  private initializeTextLengths(element: HTMLElement): void {
    // Initialize lengths for input/textarea elements
    const inputs = element.querySelectorAll("input, textarea");
    for (const input of inputs) {
      if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
        this.lastTextLength.set(input, input.value.length);
      }
    }

    // Initialize for contenteditable elements
    const editables = element.querySelectorAll("[contenteditable]");
    for (const editable of editables) {
      this.lastTextLength.set(editable, editable.textContent?.length ?? 0);
    }

    // Check if the element itself is editable
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      this.lastTextLength.set(element, element.value.length);
    } else if (element.isContentEditable) {
      this.lastTextLength.set(element, element.textContent?.length ?? 0);
    }
  }

  private handleInputEvent(e: Event): void {
    const target = e.target;
    if (!target) {
      return;
    }

    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      this.checkTextChange(target, target.value.length);
    }
  }

  private handleMutations(mutations: MutationRecord[]): void {
    for (const mutation of mutations) {
      if (mutation.type === "characterData" && mutation.target.parentElement) {
        const parent = mutation.target.parentElement;
        if (parent.isContentEditable) {
          const newLength = parent.textContent?.length ?? 0;
          this.checkTextChange(parent, newLength);
        }
      } else if (mutation.type === "childList") {
        const target = mutation.target;
        if (target instanceof HTMLElement && target.isContentEditable) {
          const newLength = target.textContent?.length ?? 0;
          this.checkTextChange(target, newLength);
        }
      }
    }
  }

  private checkTextChange(element: Element, newLength: number): void {
    const previousLength = this.lastTextLength.get(element) ?? 0;
    const lengthChange = newLength - previousLength;

    this.lastTextLength.set(element, newLength);

    // Only check significant increases
    if (lengthChange < this.config.minTextLength) {
      return;
    }

    // Check for recent keystrokes
    const recentKeystrokes = this.keystrokeCallback?.() ?? 0;

    // Check for recent paste
    const hadPaste = this.pasteCallback?.() ?? false;

    // Flag if text appeared without sufficient keystroke or paste activity
    if (recentKeystrokes < lengthChange && !hadPaste) {
      const time = performance.now() - this.startTime;
      const selector = this.getSelector(element);

      this.indicators.push({
        type: "sudden_text_appearance",
        selector,
        details: {
          characterCount: lengthChange,
          previousLength,
          newLength,
          recentKeystrokes,
          hadPaste,
          time,
        },
      });
    }
  }

  private getSelector(element: Element): string {
    if (element.id) {
      return `#${element.id}`;
    }

    if (element.className && typeof element.className === "string") {
      const classes = element.className.trim().split(/\s+/).join(".");
      if (classes) {
        return `${element.tagName.toLowerCase()}.${classes}`;
      }
    }

    return element.tagName.toLowerCase();
  }

  private calculateConfidence(): number {
    if (this.indicators.length === 0) {
      return 0;
    }

    // Higher confidence with more indicators and larger text amounts
    const totalCharacters = this.indicators.reduce((sum, ind) => {
      const count = (ind.details?.["characterCount"] as number) ?? 0;
      return sum + count;
    }, 0);

    // Base confidence from having indicators
    let confidence = 0.5;

    // Increase confidence based on total suspicious characters
    if (totalCharacters > 100) {
      confidence += 0.2;
    }
    if (totalCharacters > 500) {
      confidence += 0.2;
    }

    // Increase confidence based on number of incidents
    confidence += Math.min(0.1 * this.indicators.length, 0.1);

    return Math.min(confidence, 1);
  }
}
