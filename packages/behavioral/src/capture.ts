import type { BehavioralData, BehavioralMetrics, CaptureFlag } from "@slopit/core";
import { ClipboardCollector } from "./collectors/clipboard.js";
import { FocusCollector } from "./collectors/focus.js";
import { InputDurationCollector } from "./collectors/input-duration.js";
import { KeystrokeCollector } from "./collectors/keystroke.js";
import { MouseCollector } from "./collectors/mouse.js";
import { ScrollCollector } from "./collectors/scroll.js";
import { computeFocusMetrics } from "./metrics/focus-metrics.js";
import { computeInputDurationMetrics } from "./metrics/input-duration-metrics.js";
import { computeKeystrokeMetrics } from "./metrics/keystroke-metrics.js";
import { computeMouseMetrics } from "./metrics/mouse-metrics.js";
import { computeScrollMetrics } from "./metrics/scroll-metrics.js";
import { computeTimingMetrics } from "./metrics/timing-metrics.js";
import type {
  BehavioralCaptureConfig,
  BehavioralCaptureEvents,
  NormalizedConfig,
} from "./types.js";

/**
 * Platform-agnostic behavioral data capture.
 *
 * Captures keystroke dynamics, focus events, and paste events
 * from DOM elements. Works with any experiment framework or
 * custom implementation.
 *
 * @example
 * ```typescript
 * const capture = createBehavioralCapture({
 *   keystroke: { enabled: true },
 *   focus: { enabled: true },
 *   paste: { enabled: true, prevent: false },
 * });
 *
 * const textarea = document.getElementById("response");
 * capture.attach(textarea);
 *
 * // Later, retrieve data
 * const data = capture.getData();
 * const metrics = capture.getMetrics();
 *
 * // Cleanup
 * capture.detach();
 * ```
 */
export class BehavioralCapture {
  private config: NormalizedConfig;
  private keystrokeCollector: KeystrokeCollector | null = null;
  private focusCollector: FocusCollector | null = null;
  private clipboardCollector: ClipboardCollector | null = null;
  private mouseCollector: MouseCollector | null = null;
  private scrollCollector: ScrollCollector | null = null;
  private inputDurationCollector: InputDurationCollector | null = null;
  private trialStartTime = 0;
  private attachedElement: HTMLElement | null = null;
  private listeners: Map<
    keyof BehavioralCaptureEvents,
    Set<BehavioralCaptureEvents[keyof BehavioralCaptureEvents]>
  > = new Map();

  constructor(config: BehavioralCaptureConfig) {
    this.config = this.normalizeConfig(config);
  }

  /**
   * Attach capture to a DOM element.
   *
   * For text input capture, attach to the input or textarea element.
   * For document-level focus tracking, attach to document.
   *
   * @param element - The element to attach to
   * @param startTime - Optional trial start time (defaults to now)
   */
  attach(element: HTMLElement | Document, startTime?: number): void {
    this.trialStartTime = startTime ?? performance.now();
    this.attachedElement = element instanceof Document ? document.body : element;

    // Initialize input duration collector first (needs to receive events from others)
    if (this.config.inputDuration.enabled) {
      this.inputDurationCollector = new InputDurationCollector(
        this.config.inputDuration,
        this.trialStartTime,
        (event) => this.emit("inputDuration", event),
      );
      this.inputDurationCollector.attach(element);
    }

    if (this.config.keystroke.enabled) {
      this.keystrokeCollector = new KeystrokeCollector(
        this.config.keystroke,
        this.trialStartTime,
        (event) => {
          this.emit("keystroke", event);
          // Notify input duration collector of keystroke
          this.inputDurationCollector?.incrementKeystrokes();
        },
      );
      this.keystrokeCollector.attach(element);
    }

    if (this.config.focus.enabled) {
      this.focusCollector = new FocusCollector(this.config.focus, this.trialStartTime, (event) =>
        this.emit("focus", event),
      );
      this.focusCollector.attach(document);
    }

    if (this.config.clipboard.enabled) {
      this.clipboardCollector = new ClipboardCollector(
        this.config.clipboard,
        this.trialStartTime,
        () => this.keystrokeCollector?.getRecentCount(2000) ?? 0,
        (event) => {
          this.emit("paste", event);
          // Notify input duration collector of paste
          this.inputDurationCollector?.incrementPastes();
        },
        (event) => this.emit("clipboard", event),
      );
      this.clipboardCollector.attach(element);
    }

    if (this.config.mouse.enabled) {
      this.mouseCollector = new MouseCollector(this.config.mouse, this.trialStartTime, (event) =>
        this.emit("mouse", event),
      );
      this.mouseCollector.attach(element);
    }

    if (this.config.scroll.enabled) {
      this.scrollCollector = new ScrollCollector(this.config.scroll, this.trialStartTime, (event) =>
        this.emit("scroll", event),
      );
      this.scrollCollector.attach(element);
    }
  }

  /**
   * Detach capture and clean up event listeners.
   */
  detach(): void {
    this.keystrokeCollector?.detach();
    this.focusCollector?.detach();
    this.clipboardCollector?.detach();
    this.mouseCollector?.detach();
    this.scrollCollector?.detach();
    this.inputDurationCollector?.detach();

    this.keystrokeCollector = null;
    this.focusCollector = null;
    this.clipboardCollector = null;
    this.mouseCollector = null;
    this.scrollCollector = null;
    this.inputDurationCollector = null;
    this.attachedElement = null;
  }

  /**
   * Reset all collected data without detaching.
   *
   * @param newStartTime - Optional new start time
   */
  reset(newStartTime?: number): void {
    this.trialStartTime = newStartTime ?? performance.now();
    this.keystrokeCollector?.reset(this.trialStartTime);
    this.focusCollector?.reset(this.trialStartTime);
    this.clipboardCollector?.reset(this.trialStartTime);
    this.mouseCollector?.reset(this.trialStartTime);
    this.scrollCollector?.reset(this.trialStartTime);
    this.inputDurationCollector?.reset(this.trialStartTime);
  }

  /**
   * Get all collected behavioral data.
   */
  getData(): BehavioralData {
    return {
      keystrokes: this.keystrokeCollector?.getEvents() ?? [],
      focus: this.focusCollector?.getEvents() ?? [],
      paste: this.clipboardCollector?.getPasteEvents() ?? [],
      mouse: this.mouseCollector?.getEvents() ?? [],
      scroll: this.scrollCollector?.getEvents() ?? [],
      clipboard: this.clipboardCollector?.getCopyEvents() ?? [],
      inputDuration: this.inputDurationCollector?.getEvents() ?? [],
      metrics: this.getMetrics(),
    };
  }

  /**
   * Get computed metrics from collected data.
   */
  getMetrics(): BehavioralMetrics {
    const keystrokes = this.keystrokeCollector?.getEvents() ?? [];
    const focusEvents = this.focusCollector?.getEvents() ?? [];
    const mouseEvents = this.mouseCollector?.getEvents() ?? [];
    const mouseIdlePeriods = this.mouseCollector?.getIdlePeriods() ?? [];
    const scrollEvents = this.scrollCollector?.getEvents() ?? [];
    const scrollDirectionChanges = this.scrollCollector?.getDirectionChanges() ?? 0;
    const inputDurationEvents = this.inputDurationCollector?.getEvents() ?? [];
    const currentTime = performance.now();
    const totalResponseTime = currentTime - this.trialStartTime;

    const keystrokeMetrics = keystrokes.length > 0 ? computeKeystrokeMetrics(keystrokes) : null;
    const focusMetrics = focusEvents.length > 0 ? computeFocusMetrics(focusEvents) : null;
    const mouseMetrics =
      mouseEvents.length > 0 ? computeMouseMetrics(mouseEvents, mouseIdlePeriods) : null;
    const scrollMetrics =
      scrollEvents.length > 0 ? computeScrollMetrics(scrollEvents, scrollDirectionChanges) : null;
    const inputDurationMetrics =
      inputDurationEvents.length > 0 ? computeInputDurationMetrics(inputDurationEvents) : null;

    return {
      ...(keystrokeMetrics !== null ? { keystroke: keystrokeMetrics } : {}),
      ...(focusMetrics !== null ? { focus: focusMetrics } : {}),
      timing: computeTimingMetrics(keystrokes, totalResponseTime),
      ...(mouseMetrics !== null ? { mouse: mouseMetrics } : {}),
      ...(scrollMetrics !== null ? { scroll: scrollMetrics } : {}),
      ...(inputDurationMetrics !== null ? { inputDuration: inputDurationMetrics } : {}),
    };
  }

  /**
   * Get flags generated during capture.
   */
  getFlags(): CaptureFlag[] {
    const flags: CaptureFlag[] = [];

    // Check for paste events
    const pasteEvents = this.clipboardCollector?.getPasteEvents() ?? [];
    if (pasteEvents.length > 0) {
      flags.push({
        type: "paste_detected",
        severity: "medium",
        message: `${pasteEvents.length} paste event(s) detected`,
        timestamp: Date.now(),
        details: { count: pasteEvents.length },
      });
    }

    // Check for excessive blur events
    const focusEvents = this.focusCollector?.getEvents() ?? [];
    const blurCount = focusEvents.filter((e) => e.event === "blur").length;
    if (blurCount > 5) {
      flags.push({
        type: "excessive_blur",
        severity: "low",
        message: `${blurCount} window blur events detected`,
        timestamp: Date.now(),
        details: { count: blurCount },
      });
    }

    // Check for mouse idle anomalies (long periods without mouse activity)
    const mouseIdlePeriods = this.mouseCollector?.getIdlePeriods() ?? [];
    const longIdlePeriods = mouseIdlePeriods.filter((p) => p.duration > 30000); // 30 seconds
    if (longIdlePeriods.length > 0) {
      const totalIdleTime = longIdlePeriods.reduce((sum, p) => sum + p.duration, 0);
      flags.push({
        type: "mouse_idle_anomaly",
        severity: "low",
        message: `${longIdlePeriods.length} long mouse idle period(s) detected (${Math.round(totalIdleTime / 1000)}s total)`,
        timestamp: Date.now(),
        details: {
          count: longIdlePeriods.length,
          totalIdleMs: totalIdleTime,
          periods: longIdlePeriods,
        },
      });
    }

    // Check for sudden text appearance (copy events followed by paste without keystrokes)
    const copyEvents = this.clipboardCollector?.getCopyEvents() ?? [];
    for (const paste of pasteEvents) {
      // Find copy events that happened within 5 seconds before the paste
      const recentCopies = copyEvents.filter(
        (c) => c.time < paste.time && paste.time - c.time < 5000,
      );

      // If there was a recent copy and the paste had few preceding keystrokes,
      // this might indicate copy-paste from the same document (not external source)
      if (recentCopies.length > 0 && paste.precedingKeystrokes < 5) {
        flags.push({
          type: "sudden_text_appearance",
          severity: "medium",
          message:
            "Text pasted shortly after internal copy with minimal typing, potential pre-composed content",
          timestamp: Date.now(),
          details: {
            pasteTime: paste.time,
            pasteLength: paste.textLength,
            precedingKeystrokes: paste.precedingKeystrokes,
            recentCopyCount: recentCopies.length,
          },
        });
      }
    }

    return flags;
  }

  /**
   * Subscribe to capture events.
   */
  on<K extends keyof BehavioralCaptureEvents>(event: K, handler: BehavioralCaptureEvents[K]): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(handler);
  }

  /**
   * Unsubscribe from capture events.
   */
  off<K extends keyof BehavioralCaptureEvents>(
    event: K,
    handler: BehavioralCaptureEvents[K],
  ): void {
    this.listeners.get(event)?.delete(handler);
  }

  private emit<K extends keyof BehavioralCaptureEvents>(
    event: K,
    data: Parameters<BehavioralCaptureEvents[K]>[0],
  ): void {
    for (const handler of this.listeners.get(event) ?? []) {
      (handler as (data: unknown) => void)(data);
    }
  }

  private normalizeConfig(config: BehavioralCaptureConfig): NormalizedConfig {
    const pasteWarnMessage = config.paste?.warnMessage;
    const clipboardWarnMessage = config.clipboard?.warnMessage;

    return {
      keystroke: {
        enabled: config.keystroke?.enabled ?? true,
        captureKeyUp: config.keystroke?.captureKeyUp ?? true,
        includeModifiers: config.keystroke?.includeModifiers ?? true,
      },
      focus: {
        enabled: config.focus?.enabled ?? true,
        useVisibilityAPI: config.focus?.useVisibilityAPI ?? true,
        useBlurFocus: config.focus?.useBlurFocus ?? true,
      },
      paste: {
        enabled: config.paste?.enabled ?? true,
        prevent: config.paste?.prevent ?? false,
        capturePreview: config.paste?.capturePreview ?? true,
        previewLength: config.paste?.previewLength ?? 100,
        ...(pasteWarnMessage !== undefined ? { warnMessage: pasteWarnMessage } : {}),
      },
      inputDuration: {
        enabled: config.inputDuration?.enabled ?? true,
        trackKeystrokes: config.inputDuration?.trackKeystrokes ?? true,
        trackPastes: config.inputDuration?.trackPastes ?? true,
      },
      clipboard: {
        enabled: config.clipboard?.enabled ?? true,
        capturePaste: config.clipboard?.capturePaste ?? true,
        captureCopyCut: config.clipboard?.captureCopyCut ?? true,
        prevent: config.clipboard?.prevent ?? false,
        capturePreview: config.clipboard?.capturePreview ?? true,
        previewLength: config.clipboard?.previewLength ?? 100,
        ...(clipboardWarnMessage !== undefined ? { warnMessage: clipboardWarnMessage } : {}),
      },
      mouse: {
        enabled: config.mouse?.enabled ?? true,
        captureClicks: config.mouse?.captureClicks ?? true,
        captureMovement: config.mouse?.captureMovement ?? true,
        throttleMs: config.mouse?.throttleMs ?? 50,
        idleThresholdMs: config.mouse?.idleThresholdMs ?? 5000,
      },
      scroll: {
        enabled: config.scroll?.enabled ?? true,
        throttleMs: config.scroll?.throttleMs ?? 100,
        captureDirection: config.scroll?.captureDirection ?? true,
      },
    };
  }
}

/**
 * Factory function to create a BehavioralCapture instance.
 */
export function createBehavioralCapture(config: BehavioralCaptureConfig): BehavioralCapture {
  return new BehavioralCapture(config);
}
