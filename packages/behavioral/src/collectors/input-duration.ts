import type { InputDurationEvent } from "@slopit/core";
import type { InputDurationCaptureConfig } from "../types.js";

/**
 * Tracks focus and blur events on input elements to measure engagement duration.
 *
 * This collector monitors element-level focus (not document-level) and records
 * the duration of each focus session. It can optionally track keystrokes and
 * paste events that occur during each focus period.
 */
export class InputDurationCollector {
  private events: InputDurationEvent[] = [];
  private element: HTMLElement | null = null;
  private startTime: number;
  private currentFocusStart: number | null = null;
  private currentKeystrokeCount = 0;
  private currentPasteCount = 0;
  private boundFocus: (e: Event) => void;
  private boundBlur: (e: Event) => void;

  constructor(
    private config: Required<InputDurationCaptureConfig>,
    startTime: number,
    private onEvent?: (event: InputDurationEvent) => void,
  ) {
    this.startTime = startTime;
    this.boundFocus = this.handleFocus.bind(this);
    this.boundBlur = this.handleBlur.bind(this);
  }

  /**
   * Attach collector to an element.
   *
   * @param element - The element to monitor for focus events.
   */
  attach(element: HTMLElement | Document): void {
    // Input duration tracking requires an HTMLElement, not Document
    if (element instanceof Document) {
      return;
    }
    this.element = element;
    element.addEventListener("focus", this.boundFocus);
    element.addEventListener("blur", this.boundBlur);
  }

  /**
   * Detach collector from element.
   */
  detach(): void {
    if (this.element) {
      this.element.removeEventListener("focus", this.boundFocus);
      this.element.removeEventListener("blur", this.boundBlur);
      this.element = null;
    }
    // Finalize any ongoing focus session
    if (this.currentFocusStart !== null) {
      this.finalizeCurrentSession();
    }
  }

  /**
   * Reset collected data.
   *
   * @param newStartTime - Optional new start time for relative timing.
   */
  reset(newStartTime?: number): void {
    this.events = [];
    this.currentFocusStart = null;
    this.currentKeystrokeCount = 0;
    this.currentPasteCount = 0;
    if (newStartTime !== undefined) {
      this.startTime = newStartTime;
    }
  }

  /**
   * Get all collected events.
   *
   * @returns A copy of the collected input duration events.
   */
  getEvents(): InputDurationEvent[] {
    return [...this.events];
  }

  /**
   * Get the start time of the current focus session.
   *
   * @returns The focus start time relative to startTime, or null if not focused.
   */
  getCurrentFocusStart(): number | null {
    return this.currentFocusStart;
  }

  /**
   * Increment the keystroke count for the current focus session.
   *
   * This method is called externally by the orchestrator when a keystroke
   * occurs on the tracked element.
   */
  incrementKeystrokes(): void {
    if (this.config.trackKeystrokes && this.currentFocusStart !== null) {
      this.currentKeystrokeCount++;
    }
  }

  /**
   * Increment the paste count for the current focus session.
   *
   * This method is called externally by the orchestrator when a paste
   * event occurs on the tracked element.
   */
  incrementPastes(): void {
    if (this.config.trackPastes && this.currentFocusStart !== null) {
      this.currentPasteCount++;
    }
  }

  private handleFocus(_e: Event): void {
    if (this.currentFocusStart === null) {
      this.currentFocusStart = performance.now() - this.startTime;
      this.currentKeystrokeCount = 0;
      this.currentPasteCount = 0;
    }
  }

  private handleBlur(_e: Event): void {
    this.finalizeCurrentSession();
  }

  private finalizeCurrentSession(): void {
    if (this.currentFocusStart === null) {
      return;
    }

    const blurTime = performance.now() - this.startTime;
    const duration = blurTime - this.currentFocusStart;
    const elementId = this.getElementId();

    const event: InputDurationEvent = {
      focusTime: this.currentFocusStart,
      blurTime,
      duration,
    };

    if (elementId !== undefined) {
      event.elementId = elementId;
    }

    if (this.config.trackKeystrokes) {
      event.keystrokesDuringFocus = this.currentKeystrokeCount;
    }

    if (this.config.trackPastes) {
      event.pastesDuringFocus = this.currentPasteCount;
    }

    this.events.push(event);
    this.onEvent?.(event);

    this.currentFocusStart = null;
    this.currentKeystrokeCount = 0;
    this.currentPasteCount = 0;
  }

  private getElementId(): string | undefined {
    if (!this.element) {
      return undefined;
    }

    // Prefer id attribute, then fall back to name attribute
    if (this.element.id) {
      return this.element.id;
    }

    if (this.element instanceof HTMLInputElement || this.element instanceof HTMLTextAreaElement) {
      return this.element.name || undefined;
    }

    return undefined;
  }
}
