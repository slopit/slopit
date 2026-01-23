import type { FocusEvent as SlopitFocusEvent } from "@slopit/core";
import type { FocusCaptureConfig } from "../types.js";

/**
 * Collects focus and visibility events.
 */
export class FocusCollector {
  private events: SlopitFocusEvent[] = [];
  private startTime: number;
  private lastBlurTime: number | undefined;
  private lastHiddenTime: number | undefined;
  private boundFocus: () => void;
  private boundBlur: () => void;
  private boundVisibility: () => void;
  private attached = false;

  constructor(
    private config: Required<FocusCaptureConfig>,
    startTime: number,
    private onEvent?: (event: SlopitFocusEvent) => void,
  ) {
    this.startTime = startTime;
    this.boundFocus = this.handleFocus.bind(this);
    this.boundBlur = this.handleBlur.bind(this);
    this.boundVisibility = this.handleVisibilityChange.bind(this);
  }

  /**
   * Attach collector to document.
   */
  attach(_element: Document): void {
    if (this.attached) return;

    if (this.config.useBlurFocus) {
      window.addEventListener("focus", this.boundFocus);
      window.addEventListener("blur", this.boundBlur);
    }

    if (this.config.useVisibilityAPI) {
      document.addEventListener("visibilitychange", this.boundVisibility);
    }

    this.attached = true;
  }

  /**
   * Detach collector.
   */
  detach(): void {
    if (!this.attached) return;

    window.removeEventListener("focus", this.boundFocus);
    window.removeEventListener("blur", this.boundBlur);
    document.removeEventListener("visibilitychange", this.boundVisibility);

    // Calculate final blur duration if still blurred
    if (this.lastBlurTime !== undefined) {
      this.updateLastBlurDuration();
    }

    this.attached = false;
  }

  /**
   * Reset collected data.
   */
  reset(newStartTime?: number): void {
    this.events = [];
    this.lastBlurTime = undefined;
    this.lastHiddenTime = undefined;
    if (newStartTime !== undefined) {
      this.startTime = newStartTime;
    }
  }

  /**
   * Get all collected events.
   */
  getEvents(): SlopitFocusEvent[] {
    return [...this.events];
  }

  private handleFocus(): void {
    const time = performance.now() - this.startTime;

    // Update blur duration of previous blur event
    this.updateLastBlurDuration();

    const event: SlopitFocusEvent = {
      time,
      event: "focus",
    };

    this.events.push(event);
    this.onEvent?.(event);
  }

  private handleBlur(): void {
    const time = performance.now() - this.startTime;
    this.lastBlurTime = time;

    const event: SlopitFocusEvent = {
      time,
      event: "blur",
    };

    this.events.push(event);
    this.onEvent?.(event);
  }

  private handleVisibilityChange(): void {
    const time = performance.now() - this.startTime;
    const visibility = document.visibilityState as "visible" | "hidden";

    if (visibility === "hidden") {
      this.lastHiddenTime = time;
    }

    const event: SlopitFocusEvent = {
      time,
      event: "visibilitychange",
      visibility,
    };

    this.events.push(event);
    this.onEvent?.(event);
  }

  private updateLastBlurDuration(): void {
    if (this.lastBlurTime === undefined) return;

    const currentTime = performance.now() - this.startTime;
    const blurDuration = currentTime - this.lastBlurTime;

    // Find the last blur event and update its duration
    for (let i = this.events.length - 1; i >= 0; i--) {
      const evt = this.events[i];
      if (evt?.event === "blur" && evt.blurDuration === undefined) {
        evt.blurDuration = blurDuration;
        break;
      }
    }

    this.lastBlurTime = undefined;
  }
}
