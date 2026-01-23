import type { ScrollEvent } from "@slopit/core";
import type { ScrollCaptureConfig } from "../types.js";

/**
 * Collects scroll events from DOM elements.
 *
 * Tracks scroll direction, position, and velocity to help distinguish
 * between composing and reading/reviewing behavior patterns.
 */
export class ScrollCollector {
  private events: ScrollEvent[] = [];
  private element: HTMLElement | Document | null = null;
  private startTime: number;
  private lastScrollTime: number | undefined;
  private lastScrollTop: number | undefined;
  private lastDirection: "up" | "down" | undefined;
  private directionChanges = 0;
  private throttleTimer: ReturnType<typeof setTimeout> | null = null;
  private boundScroll: (e: Event) => void;

  constructor(
    private config: Required<ScrollCaptureConfig>,
    startTime: number,
    private onEvent?: (event: ScrollEvent) => void,
  ) {
    this.startTime = startTime;
    this.boundScroll = this.handleScroll.bind(this);
  }

  /**
   * Attach collector to an element.
   *
   * @param element - The element to attach scroll listeners to.
   */
  attach(element: HTMLElement | Document): void {
    this.element = element;
    element.addEventListener("scroll", this.boundScroll, { passive: true });
  }

  /**
   * Detach collector from element.
   */
  detach(): void {
    if (this.element) {
      this.element.removeEventListener("scroll", this.boundScroll);
      this.element = null;
    }
    if (this.throttleTimer !== null) {
      clearTimeout(this.throttleTimer);
      this.throttleTimer = null;
    }
  }

  /**
   * Reset collected data.
   *
   * @param newStartTime - Optional new start time for timing calculations.
   */
  reset(newStartTime?: number): void {
    this.events = [];
    this.lastScrollTime = undefined;
    this.lastScrollTop = undefined;
    this.lastDirection = undefined;
    this.directionChanges = 0;
    if (newStartTime !== undefined) {
      this.startTime = newStartTime;
    }
  }

  /**
   * Get all collected events.
   *
   * @returns A copy of the collected scroll events.
   */
  getEvents(): ScrollEvent[] {
    return [...this.events];
  }

  /**
   * Get the number of scroll direction changes.
   *
   * Direction changes may indicate review behavior (scrolling up and down
   * to read previously written content) rather than linear composition.
   *
   * @returns The count of direction changes.
   */
  getDirectionChanges(): number {
    return this.directionChanges;
  }

  private handleScroll(e: Event): void {
    if (!this.config.enabled) {
      return;
    }

    // Throttle scroll events
    if (this.throttleTimer !== null) {
      return;
    }

    this.throttleTimer = setTimeout(() => {
      this.throttleTimer = null;
    }, this.config.throttleMs);

    this.recordEvent(e);
  }

  private recordEvent(e: Event): void {
    const time = performance.now() - this.startTime;
    const target = this.getScrollTarget(e);

    if (!target) {
      return;
    }

    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;

    // Calculate delta and direction
    const deltaY = this.lastScrollTop !== undefined ? scrollTop - this.lastScrollTop : 0;
    const direction: "up" | "down" = deltaY >= 0 ? "down" : "up";

    // Track direction changes
    if (this.config.captureDirection && this.lastDirection !== undefined) {
      if (direction !== this.lastDirection) {
        this.directionChanges++;
      }
    }

    // Calculate velocity (pixels per millisecond)
    let velocity: number | undefined;
    if (this.lastScrollTime !== undefined && this.lastScrollTop !== undefined) {
      const timeDelta = time - this.lastScrollTime;
      if (timeDelta > 0) {
        velocity = Math.abs(deltaY) / timeDelta;
      }
    }

    const event: ScrollEvent = {
      time,
      direction,
      deltaY,
      scrollTop,
      scrollHeight,
      clientHeight,
      ...(velocity !== undefined ? { velocity } : {}),
    };

    this.events.push(event);
    this.onEvent?.(event);

    // Update state for next event
    this.lastScrollTime = time;
    this.lastScrollTop = scrollTop;
    this.lastDirection = direction;
  }

  private getScrollTarget(e: Event): {
    scrollTop: number;
    scrollHeight: number;
    clientHeight: number;
  } | null {
    const target = e.target;

    if (target instanceof Document) {
      const docEl = target.documentElement;
      return {
        scrollTop: docEl.scrollTop,
        scrollHeight: docEl.scrollHeight,
        clientHeight: docEl.clientHeight,
      };
    }

    if (target instanceof HTMLElement) {
      return {
        scrollTop: target.scrollTop,
        scrollHeight: target.scrollHeight,
        clientHeight: target.clientHeight,
      };
    }

    return null;
  }
}
