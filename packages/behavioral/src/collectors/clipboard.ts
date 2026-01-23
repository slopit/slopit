/**
 * Clipboard collector for paste and copy/cut events.
 *
 * @module
 */

import { hashText, simpleHash } from "@slopit/core";
import type { ClipboardCopyEvent, PasteEvent } from "@slopit/core";

import type { ClipboardCaptureConfig } from "../types.js";

/**
 * Collects clipboard events (paste, copy, cut) from DOM elements.
 *
 * This collector unifies paste event tracking with copy/cut event tracking,
 * capturing selection context for copy/cut operations.
 *
 * @example
 * ```typescript
 * const collector = new ClipboardCollector(
 *   {
 *     enabled: true,
 *     capturePaste: true,
 *     captureCopyCut: true,
 *     prevent: false,
 *     capturePreview: true,
 *     previewLength: 100,
 *   },
 *   performance.now(),
 *   () => keystrokeCollector.getRecentCount(2000),
 * );
 *
 * collector.attach(document);
 * // ... capture events
 * const pasteEvents = collector.getPasteEvents();
 * const copyEvents = collector.getCopyEvents();
 * collector.detach();
 * ```
 */
export class ClipboardCollector {
  private pasteEvents: PasteEvent[] = [];
  private copyEvents: ClipboardCopyEvent[] = [];
  private element: HTMLElement | Document | null = null;
  private startTime: number;
  private boundPaste: (e: ClipboardEvent) => void;
  private boundCopy: (e: ClipboardEvent) => void;
  private boundCut: (e: ClipboardEvent) => void;

  /**
   * Creates a new ClipboardCollector.
   *
   * @param config - Configuration options for clipboard capture
   * @param startTime - Reference time for event timestamps (typically performance.now())
   * @param getRecentKeystrokes - Function returning keystroke count in recent window
   * @param onPasteEvent - Optional callback invoked for each paste event
   * @param onCopyEvent - Optional callback invoked for each copy/cut event
   */
  constructor(
    private config: Required<Omit<ClipboardCaptureConfig, "warnMessage">> & {
      warnMessage?: string;
    },
    startTime: number,
    private getRecentKeystrokes: () => number,
    private onPasteEvent?: (event: PasteEvent) => void,
    private onCopyEvent?: (event: ClipboardCopyEvent) => void,
  ) {
    this.startTime = startTime;
    this.boundPaste = this.handlePaste.bind(this);
    this.boundCopy = this.handleCopy.bind(this);
    this.boundCut = this.handleCut.bind(this);
  }

  /**
   * Attach collector to an element.
   *
   * @param element - The DOM element or document to attach listeners to
   */
  attach(element: HTMLElement | Document): void {
    this.element = element;

    if (this.config.capturePaste) {
      element.addEventListener("paste", this.boundPaste as EventListener);
    }

    if (this.config.captureCopyCut) {
      element.addEventListener("copy", this.boundCopy as EventListener);
      element.addEventListener("cut", this.boundCut as EventListener);
    }
  }

  /**
   * Detach collector from element.
   */
  detach(): void {
    if (this.element) {
      this.element.removeEventListener("paste", this.boundPaste as EventListener);
      this.element.removeEventListener("copy", this.boundCopy as EventListener);
      this.element.removeEventListener("cut", this.boundCut as EventListener);
      this.element = null;
    }
  }

  /**
   * Reset collected data.
   *
   * @param newStartTime - Optional new reference time for timestamps
   */
  reset(newStartTime?: number): void {
    this.pasteEvents = [];
    this.copyEvents = [];
    if (newStartTime !== undefined) {
      this.startTime = newStartTime;
    }
  }

  /**
   * Get all collected paste events.
   *
   * @returns Copy of paste events array
   */
  getPasteEvents(): PasteEvent[] {
    return [...this.pasteEvents];
  }

  /**
   * Get all collected copy/cut events.
   *
   * @returns Copy of copy/cut events array
   */
  getCopyEvents(): ClipboardCopyEvent[] {
    return [...this.copyEvents];
  }

  /**
   * Get all clipboard events combined.
   *
   * @returns Array of all paste and copy/cut events, sorted by time
   */
  getAllEvents(): Array<PasteEvent | ClipboardCopyEvent> {
    const all: Array<PasteEvent | ClipboardCopyEvent> = [...this.pasteEvents, ...this.copyEvents];
    return all.sort((a, b) => a.time - b.time);
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

    this.pasteEvents.push(event);
    this.onPasteEvent?.(event);

    // Update with proper SHA-256 hash asynchronously
    if (text.length > 0) {
      hashText(text).then((hash) => {
        event.textHash = hash;
      });
    }
  }

  private handleCopy(e: ClipboardEvent): void {
    this.handleCopyCut(e, "copy");
  }

  private handleCut(e: ClipboardEvent): void {
    this.handleCopyCut(e, "cut");
  }

  private handleCopyCut(_e: ClipboardEvent, eventType: "copy" | "cut"): void {
    const time = performance.now() - this.startTime;
    const selection = window.getSelection();
    const text = selection?.toString() ?? "";

    // Get selection indices from active element if it's an input or textarea
    let selectionStart: number | undefined;
    let selectionEnd: number | undefined;
    const activeElement = document.activeElement;

    if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
      selectionStart = activeElement.selectionStart ?? undefined;
      selectionEnd = activeElement.selectionEnd ?? undefined;
    }

    const event: ClipboardCopyEvent = {
      time,
      event: eventType,
      textLength: text.length,
      ...(this.config.capturePreview
        ? { textPreview: text.slice(0, this.config.previewLength) }
        : {}),
      textHash: simpleHash(text),
      ...(selectionStart !== undefined ? { selectionStart } : {}),
      ...(selectionEnd !== undefined ? { selectionEnd } : {}),
    };

    this.copyEvents.push(event);
    this.onCopyEvent?.(event);

    // Update with proper SHA-256 hash asynchronously
    if (text.length > 0) {
      hashText(text).then((hash) => {
        event.textHash = hash;
      });
    }
  }
}
