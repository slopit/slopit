import { hashText, simpleHash } from "@slopit/core";
import type { PasteEvent } from "@slopit/core";
import type { PasteCaptureConfig } from "../types.js";

/**
 * Collects paste events from DOM elements.
 */
export class PasteCollector {
  private events: PasteEvent[] = [];
  private element: HTMLElement | Document | null = null;
  private startTime: number;
  private boundPaste: (e: ClipboardEvent) => void;

  constructor(
    private config: Required<Omit<PasteCaptureConfig, "warnMessage">> & { warnMessage?: string },
    startTime: number,
    private getRecentKeystrokes: () => number,
    private onEvent?: (event: PasteEvent) => void,
  ) {
    this.startTime = startTime;
    this.boundPaste = this.handlePaste.bind(this);
  }

  /**
   * Attach collector to an element.
   */
  attach(element: HTMLElement | Document): void {
    this.element = element;
    element.addEventListener("paste", this.boundPaste as EventListener);
  }

  /**
   * Detach collector from element.
   */
  detach(): void {
    if (this.element) {
      this.element.removeEventListener("paste", this.boundPaste as EventListener);
      this.element = null;
    }
  }

  /**
   * Reset collected data.
   */
  reset(newStartTime?: number): void {
    this.events = [];
    if (newStartTime !== undefined) {
      this.startTime = newStartTime;
    }
  }

  /**
   * Get all collected events.
   */
  getEvents(): PasteEvent[] {
    return [...this.events];
  }

  private handlePaste(e: ClipboardEvent): void {
    const text = e.clipboardData?.getData("text/plain") ?? "";
    const time = performance.now() - this.startTime;
    const precedingKeystrokes = this.getRecentKeystrokes();

    // Optionally prevent paste
    if (this.config.prevent) {
      e.preventDefault();
      if (this.config.warnMessage) {
        alert(this.config.warnMessage);
      }
    }

    const event: PasteEvent = {
      time,
      textLength: text.length,
      precedingKeystrokes,
      blocked: this.config.prevent,
      ...(this.config.capturePreview
        ? { textPreview: text.slice(0, this.config.previewLength) }
        : {}),
      // Hash asynchronously but use sync hash for immediate event
      textHash: simpleHash(text),
    };

    this.events.push(event);
    this.onEvent?.(event);

    // Update with proper SHA-256 hash asynchronously
    if (text.length > 0) {
      hashText(text).then((hash) => {
        event.textHash = hash;
      });
    }
  }
}
