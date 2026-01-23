import type { MouseEvent } from "@slopit/core";
import type { MouseCaptureConfig } from "../types.js";

/**
 * Represents a period of mouse inactivity.
 */
export interface IdlePeriod {
  /**
   * Start time relative to startTime in milliseconds.
   */
  start: number;

  /**
   * End time relative to startTime in milliseconds.
   */
  end: number;

  /**
   * Duration of idle period in milliseconds.
   */
  duration: number;
}

/**
 * Collects mouse events from DOM elements.
 *
 * Tracks mouse movement with configurable throttling, click events,
 * drag operations, and idle periods. Computes velocity and distance
 * for movement events.
 */
export class MouseCollector {
  private events: MouseEvent[] = [];
  private element: HTMLElement | Document | null = null;
  private startTime: number;
  private lastMoveTime: number | null = null;
  private lastX: number | null = null;
  private lastY: number | null = null;
  private isDragging = false;
  private idlePeriods: IdlePeriod[] = [];
  private idleStart: number | null = null;
  private idleCheckInterval: ReturnType<typeof setInterval> | null = null;

  private boundMousemove: (e: globalThis.MouseEvent) => void;
  private boundMousedown: (e: globalThis.MouseEvent) => void;
  private boundMouseup: (e: globalThis.MouseEvent) => void;
  private boundClick: (e: globalThis.MouseEvent) => void;

  private throttledMoveHandler: ((e: globalThis.MouseEvent) => void) | null = null;
  private lastThrottledCall = 0;

  constructor(
    private config: Required<MouseCaptureConfig>,
    startTime: number,
    private onEvent?: (event: MouseEvent) => void,
  ) {
    this.startTime = startTime;
    this.boundMousemove = this.handleMousemove.bind(this);
    this.boundMousedown = this.handleMousedown.bind(this);
    this.boundMouseup = this.handleMouseup.bind(this);
    this.boundClick = this.handleClick.bind(this);
  }

  /**
   * Attach collector to an element.
   *
   * @param element - The DOM element or document to attach listeners to
   */
  attach(element: HTMLElement | Document): void {
    this.element = element;

    if (this.config.captureMovement) {
      this.throttledMoveHandler = this.createThrottledHandler(
        this.boundMousemove,
        this.config.throttleMs,
      );
      element.addEventListener("mousemove", this.throttledMoveHandler as EventListener);
    }

    if (this.config.captureClicks) {
      element.addEventListener("mousedown", this.boundMousedown as EventListener);
      element.addEventListener("mouseup", this.boundMouseup as EventListener);
      element.addEventListener("click", this.boundClick as EventListener);
    }

    // Start idle detection
    this.startIdleDetection();
  }

  /**
   * Detach collector from element.
   */
  detach(): void {
    if (this.element) {
      if (this.throttledMoveHandler) {
        this.element.removeEventListener("mousemove", this.throttledMoveHandler as EventListener);
      }
      this.element.removeEventListener("mousedown", this.boundMousedown as EventListener);
      this.element.removeEventListener("mouseup", this.boundMouseup as EventListener);
      this.element.removeEventListener("click", this.boundClick as EventListener);
      this.element = null;
    }

    this.stopIdleDetection();

    // Close any open idle period
    if (this.idleStart !== null) {
      const now = performance.now() - this.startTime;
      this.idlePeriods.push({
        start: this.idleStart,
        end: now,
        duration: now - this.idleStart,
      });
      this.idleStart = null;
    }
  }

  /**
   * Reset collected data.
   *
   * @param newStartTime - Optional new start time to use for relative timestamps
   */
  reset(newStartTime?: number): void {
    this.events = [];
    this.idlePeriods = [];
    this.lastMoveTime = null;
    this.lastX = null;
    this.lastY = null;
    this.isDragging = false;
    this.idleStart = null;
    this.lastThrottledCall = 0;

    if (newStartTime !== undefined) {
      this.startTime = newStartTime;
    }
  }

  /**
   * Get all collected events.
   *
   * @returns A copy of the collected mouse events array
   */
  getEvents(): MouseEvent[] {
    return [...this.events];
  }

  /**
   * Get all detected idle periods.
   *
   * @returns A copy of the idle periods array
   */
  getIdlePeriods(): IdlePeriod[] {
    return [...this.idlePeriods];
  }

  /**
   * Get total idle time in milliseconds.
   *
   * @returns Sum of all idle period durations
   */
  getTotalIdleTime(): number {
    return this.idlePeriods.reduce((sum, period) => sum + period.duration, 0);
  }

  /**
   * Get total distance traveled by the cursor in pixels.
   *
   * @returns Sum of all distance values from mousemove events
   */
  getTotalDistance(): number {
    return this.events
      .filter((e) => e.event === "mousemove" && e.distance !== undefined)
      .reduce((sum, e) => sum + (e.distance ?? 0), 0);
  }

  private createThrottledHandler(
    handler: (e: globalThis.MouseEvent) => void,
    throttleMs: number,
  ): (e: globalThis.MouseEvent) => void {
    return (e: globalThis.MouseEvent) => {
      const now = performance.now();
      if (now - this.lastThrottledCall >= throttleMs) {
        this.lastThrottledCall = now;
        handler(e);
      }
    };
  }

  private handleMousemove(e: globalThis.MouseEvent): void {
    const time = performance.now() - this.startTime;
    const x = e.clientX;
    const y = e.clientY;

    let velocity: number | undefined;
    let distance: number | undefined;
    let deltaTime: number | undefined;

    if (this.lastX !== null && this.lastY !== null && this.lastMoveTime !== null) {
      const dx = x - this.lastX;
      const dy = y - this.lastY;
      distance = Math.sqrt(dx * dx + dy * dy);
      deltaTime = time - this.lastMoveTime;

      if (deltaTime > 0) {
        velocity = distance / deltaTime;
      }
    }

    const event: MouseEvent = {
      time,
      event: "mousemove",
      x,
      y,
      ...(velocity !== undefined ? { velocity } : {}),
      ...(distance !== undefined ? { distance } : {}),
      ...(deltaTime !== undefined ? { deltaTime } : {}),
      ...(this.isDragging ? { isDragging: true } : {}),
    };

    this.events.push(event);
    this.onEvent?.(event);

    this.lastX = x;
    this.lastY = y;
    this.lastMoveTime = time;

    // Reset idle tracking on movement
    this.recordActivity(time);
  }

  private handleMousedown(e: globalThis.MouseEvent): void {
    const time = performance.now() - this.startTime;
    this.isDragging = true;

    const event: MouseEvent = {
      time,
      event: "mousedown",
      x: e.clientX,
      y: e.clientY,
    };

    this.events.push(event);
    this.onEvent?.(event);

    this.recordActivity(time);
  }

  private handleMouseup(e: globalThis.MouseEvent): void {
    const time = performance.now() - this.startTime;
    const wasDragging = this.isDragging;
    this.isDragging = false;

    const event: MouseEvent = {
      time,
      event: "mouseup",
      x: e.clientX,
      y: e.clientY,
      ...(wasDragging ? { isDragging: true } : {}),
    };

    this.events.push(event);
    this.onEvent?.(event);

    this.recordActivity(time);
  }

  private handleClick(e: globalThis.MouseEvent): void {
    const time = performance.now() - this.startTime;

    const event: MouseEvent = {
      time,
      event: "click",
      x: e.clientX,
      y: e.clientY,
    };

    this.events.push(event);
    this.onEvent?.(event);

    this.recordActivity(time);
  }

  private recordActivity(time: number): void {
    // If we were idle, close the idle period
    if (this.idleStart !== null) {
      this.idlePeriods.push({
        start: this.idleStart,
        end: time,
        duration: time - this.idleStart,
      });
      this.idleStart = null;
    }
  }

  private startIdleDetection(): void {
    // Check for idle every second
    this.idleCheckInterval = setInterval(() => {
      const now = performance.now() - this.startTime;
      const lastEventTime = this.getLastEventTime();

      if (lastEventTime !== null) {
        const timeSinceLastEvent = now - lastEventTime;

        // Start idle period if threshold exceeded and not already idle
        if (timeSinceLastEvent >= this.config.idleThresholdMs && this.idleStart === null) {
          // Idle started at the last event time + threshold
          this.idleStart = lastEventTime + this.config.idleThresholdMs;
        }
      }
    }, 1000);
  }

  private stopIdleDetection(): void {
    if (this.idleCheckInterval !== null) {
      clearInterval(this.idleCheckInterval);
      this.idleCheckInterval = null;
    }
  }

  private getLastEventTime(): number | null {
    if (this.events.length === 0) {
      return null;
    }
    const lastEvent = this.events[this.events.length - 1];
    return lastEvent?.time ?? null;
  }
}
