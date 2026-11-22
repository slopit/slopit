import type { ResponseControl, ResponseControlEvent, ResponseControlsData } from "@slopit/core";

const EVENT_TYPES = [
  "keydown",
  "keyup",
  "focusin",
  "focusout",
  "input",
  "change",
  "click",
  "submit",
  "paste",
  "copy",
  "cut",
  "pointerdown",
  "pointerup",
  "pointermove",
] as const;

const NAVIGATION_KEYS = [
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "Backspace",
  "Delete",
  "End",
  "Enter",
  "Escape",
  "Home",
  "PageDown",
  "PageUp",
  "Tab",
] as const;

type NavigationKey = (typeof NAVIGATION_KEYS)[number];

/** A study must grant consent before response-control listeners are attached. */
export interface ResponseControlsConfig {
  targetSelector: string;
  hasConsent: () => boolean;
  /** Optional lifetime signal, for instance when a participant withdraws. */
  signal?: AbortSignal;
}

function keyCategory(key: string): NavigationKey | "redacted" {
  return NAVIGATION_KEYS.find((candidate) => candidate === key) ?? "redacted";
}

function controlType(element: Element): ResponseControl | undefined {
  if (element instanceof HTMLSelectElement) return "select";
  if (element instanceof HTMLButtonElement) return "button";
  if (element instanceof HTMLTextAreaElement) return "text";
  if (!(element instanceof HTMLInputElement)) return undefined;
  switch (element.type) {
    case "radio":
    case "checkbox":
    case "range":
      return element.type;
    case "button":
    case "submit":
    case "reset":
      return "button";
    case "text":
    case "search":
    case "number":
      return "text";
    default:
      return undefined;
  }
}

/**
 * Capture timing and provenance inside selected controls.
 *
 * Event payloads never include field values, raw text keys, key codes, or clipboard data.
 */
export function captureResponseControls(
  container: HTMLElement,
  config: ResponseControlsConfig,
  trialStart: number,
): { finish: () => ResponseControlsData | null } | null {
  if (!config.hasConsent() || config.signal?.aborted) return null;
  const listeners = new AbortController();
  const events: ResponseControlEvent[] = [];
  let lastMove = -Infinity;
  const detach = () => listeners.abort();
  config.signal?.addEventListener("abort", detach, { once: true });

  for (const type of EVENT_TYPES) {
    container.addEventListener(
      type,
      (event) => {
        if (!config.hasConsent()) {
          detach();
          return;
        }
        const target =
          typeof SubmitEvent !== "undefined" && event instanceof SubmitEvent
            ? event.submitter
            : event.target;
        if (!(target instanceof Element)) return;
        const element = target.closest(config.targetSelector);
        if (!element || !container.contains(element)) return;
        const control = controlType(element);
        if (control === undefined) return;

        const time = performance.now() - trialStart;
        const record: ResponseControlEvent = {
          time,
          event: type,
          control,
          trusted: event.isTrusted,
        };
        if (event instanceof KeyboardEvent) record.key = keyCategory(event.key);
        if (typeof PointerEvent !== "undefined" && event instanceof PointerEvent) {
          const bounds = element.getBoundingClientRect();
          const x = event.clientX - bounds.left;
          const y = event.clientY - bounds.top;
          if (x >= 0 && x <= bounds.width && y >= 0 && y <= bounds.height) {
            record.x = x;
            record.y = y;
          }
          if (type === "pointermove") {
            if (record.x === undefined || time - lastMove < 16) return;
            lastMove = time;
          }
        }
        events.push(record);
      },
      { capture: true, signal: listeners.signal },
    );
  }

  return {
    finish() {
      config.signal?.removeEventListener("abort", detach);
      const revoked = listeners.signal.aborted || !config.hasConsent();
      detach();
      return revoked ? null : { schemaVersion: "1.0", events };
    },
  };
}
