import type { KeystrokeEvent, ModifierState } from "@slopit/core";
import type { KeystrokeCaptureConfig } from "../types.js";

/**
 * Collects keystroke events from DOM elements.
 */
export class KeystrokeCollector {
  private events: KeystrokeEvent[] = [];
  private element: HTMLElement | Document | null = null;
  private startTime: number;
  private firstKeystrokeTime: number | undefined;
  private boundKeydown: (e: KeyboardEvent) => void;
  private boundKeyup: (e: KeyboardEvent) => void;

  constructor(
    private config: Required<KeystrokeCaptureConfig>,
    startTime: number,
    private onEvent?: (event: KeystrokeEvent) => void,
  ) {
    this.startTime = startTime;
    this.boundKeydown = this.handleKeydown.bind(this);
    this.boundKeyup = this.handleKeyup.bind(this);
  }

  /**
   * Attach collector to an element.
   */
  attach(element: HTMLElement | Document): void {
    this.element = element;
    element.addEventListener("keydown", this.boundKeydown as EventListener);
    if (this.config.captureKeyUp) {
      element.addEventListener("keyup", this.boundKeyup as EventListener);
    }
  }

  /**
   * Detach collector from element.
   */
  detach(): void {
    if (this.element) {
      this.element.removeEventListener("keydown", this.boundKeydown as EventListener);
      this.element.removeEventListener("keyup", this.boundKeyup as EventListener);
      this.element = null;
    }
  }

  /**
   * Reset collected data.
   */
  reset(newStartTime?: number): void {
    this.events = [];
    this.firstKeystrokeTime = undefined;
    if (newStartTime !== undefined) {
      this.startTime = newStartTime;
    }
  }

  /**
   * Get all collected events.
   */
  getEvents(): KeystrokeEvent[] {
    return [...this.events];
  }

  /**
   * Get time of first keystroke.
   */
  getFirstKeystrokeTime(): number | undefined {
    return this.firstKeystrokeTime;
  }

  /**
   * Get count of keystrokes in the last N milliseconds.
   */
  getRecentCount(windowMs: number): number {
    const now = performance.now();
    const cutoff = now - this.startTime - windowMs;
    return this.events.filter((e) => e.time >= cutoff).length;
  }

  private handleKeydown(e: KeyboardEvent): void {
    this.recordEvent(e, "keydown");
  }

  private handleKeyup(e: KeyboardEvent): void {
    this.recordEvent(e, "keyup");
  }

  private recordEvent(e: KeyboardEvent, type: "keydown" | "keyup"): void {
    const time = performance.now() - this.startTime;

    if (this.firstKeystrokeTime === undefined && type === "keydown") {
      this.firstKeystrokeTime = time;
    }

    const textLength = this.getTextLength(e.target);

    const event: KeystrokeEvent = {
      time,
      key: e.key,
      code: e.code,
      event: type,
      ...(textLength !== undefined ? { textLength } : {}),
      ...(this.config.includeModifiers ? { modifiers: this.getModifiers(e) } : {}),
    };

    this.events.push(event);
    this.onEvent?.(event);
  }

  private getTextLength(target: EventTarget | null): number | undefined {
    if (target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement) {
      return target.value.length;
    }
    if (target instanceof HTMLElement && target.isContentEditable) {
      return target.textContent?.length;
    }
    return undefined;
  }

  private getModifiers(e: KeyboardEvent): ModifierState {
    return {
      shift: e.shiftKey,
      ctrl: e.ctrlKey,
      alt: e.altKey,
      meta: e.metaKey,
    };
  }
}
