/**
 * Detector for AI assistant browser extension signatures.
 *
 * Scans the DOM and global window object for known patterns associated with
 * browser extensions like Grammarly, Copilot, Quillbot, and other AI assistants.
 *
 * @module
 */

import type { DetectionIndicator, DetectionResult, Detector } from "./types.js";

/**
 * Known DOM selectors for AI assistant browser extensions.
 */
const KNOWN_DOM_SELECTORS = [
  "[data-grammarly-shadow-root]",
  '[class*="grammarly"]',
  '[class*="ai-assistant"]',
  '[class*="copilot"]',
  '[class*="chatgpt"]',
  "#quillbot-extension-portal",
] as const;

/**
 * Known global window variables injected by AI assistant extensions.
 */
const KNOWN_GLOBALS = ["__GRAMMARLY__", "__COPILOT__", "__QUILLBOT__"] as const;

/**
 * Monitor configuration for MutationObserver settings.
 */
export interface MonitorConfig {
  /**
   * Whether to observe attribute changes.
   * @default true
   */
  attributes: boolean;

  /**
   * Whether to observe child node additions/removals.
   * @default true
   */
  childList: boolean;

  /**
   * Whether to observe the entire subtree.
   * @default true
   */
  subtree: boolean;
}

/**
 * Configuration for the ExtensionDetector.
 */
export interface ExtensionDetectorConfig {
  /**
   * Additional DOM selectors to scan for extension signatures.
   */
  customSelectors?: string[];

  /**
   * Additional global window properties to check.
   */
  customGlobals?: string[];

  /**
   * Configuration for continuous monitoring via MutationObserver.
   */
  monitor?: Partial<MonitorConfig>;
}

/**
 * Normalized (fully resolved) extension detector configuration.
 */
interface NormalizedExtensionDetectorConfig {
  customSelectors: string[];
  customGlobals: string[];
  monitor: MonitorConfig;
}

/**
 * Detects AI assistant browser extension signatures.
 *
 * Scans for:
 * - Known DOM elements injected by extensions (e.g., Grammarly shadow roots)
 * - Global variables set by extensions
 * - Custom patterns provided via configuration
 *
 * @example
 * ```typescript
 * const detector = new ExtensionDetector();
 * const result = detector.detect();
 *
 * if (result.detected) {
 *   console.log("Extensions found:", result.indicators);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // With continuous monitoring
 * const detector = new ExtensionDetector({
 *   customSelectors: ['[data-my-extension]'],
 * });
 *
 * detector.startMonitoring();
 * // ... later
 * detector.stopMonitoring();
 * ```
 */
export class ExtensionDetector implements Detector {
  readonly name = "extension-detector";

  private readonly config: NormalizedExtensionDetectorConfig;
  private readonly allSelectors: string[];
  private readonly allGlobals: string[];
  private observer: MutationObserver | null = null;
  private monitoredIndicators: DetectionIndicator[] = [];

  constructor(config: ExtensionDetectorConfig = {}) {
    this.config = {
      customSelectors: config.customSelectors ?? [],
      customGlobals: config.customGlobals ?? [],
      monitor: {
        attributes: config.monitor?.attributes ?? true,
        childList: config.monitor?.childList ?? true,
        subtree: config.monitor?.subtree ?? true,
      },
    };

    this.allSelectors = [...KNOWN_DOM_SELECTORS, ...this.config.customSelectors];
    this.allGlobals = [...KNOWN_GLOBALS, ...this.config.customGlobals];
  }

  /**
   * Performs a one-shot detection scan for extension signatures.
   *
   * @returns Detection result with found indicators
   */
  detect(): DetectionResult {
    const startTime = performance.now();
    const indicators: DetectionIndicator[] = [];

    // Scan DOM for known selectors
    for (const selector of this.allSelectors) {
      const elements = this.queryElements(selector);
      if (elements.length > 0) {
        indicators.push({
          type: "dom_element",
          selector,
          details: {
            matchCount: elements.length,
            isKnown: (KNOWN_DOM_SELECTORS as readonly string[]).includes(selector),
          },
        });
      }
    }

    // Check for global variables
    for (const globalName of this.allGlobals) {
      if (this.hasGlobal(globalName)) {
        indicators.push({
          type: "global_variable",
          selector: globalName,
          details: {
            isKnown: (KNOWN_GLOBALS as readonly string[]).includes(globalName),
          },
        });
      }
    }

    const _scanDurationMs = performance.now() - startTime;

    return {
      detected: indicators.length > 0,
      confidence: this.calculateConfidence(indicators),
      message: this.generateMessage(indicators),
      indicators,
    };
  }

  /**
   * Starts continuous monitoring for dynamically injected extension elements.
   *
   * Uses MutationObserver to watch for DOM changes that match extension patterns.
   */
  startMonitoring(): void {
    if (this.observer !== null) {
      return;
    }

    this.observer = new MutationObserver((mutations) => {
      this.handleMutations(mutations);
    });

    this.observer.observe(document.documentElement, {
      attributes: this.config.monitor.attributes,
      childList: this.config.monitor.childList,
      subtree: this.config.monitor.subtree,
      attributeFilter: ["class", "data-grammarly-shadow-root"],
    });
  }

  /**
   * Stops continuous monitoring and disconnects the MutationObserver.
   */
  stopMonitoring(): void {
    if (this.observer !== null) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  /**
   * Gets all indicators detected during monitoring.
   *
   * @returns Array of detection indicators found during monitoring
   */
  getMonitoredIndicators(): DetectionIndicator[] {
    return [...this.monitoredIndicators];
  }

  /**
   * Resets all collected monitoring data.
   */
  reset(): void {
    this.monitoredIndicators = [];
  }

  /**
   * Queries the DOM for elements matching a selector.
   */
  private queryElements(selector: string): Element[] {
    try {
      return Array.from(document.querySelectorAll(selector));
    } catch {
      // Invalid selector, return empty array
      return [];
    }
  }

  /**
   * Checks if a global variable exists on the window object.
   */
  private hasGlobal(name: string): boolean {
    try {
      return name in window;
    } catch {
      return false;
    }
  }

  /**
   * Handles mutation events from the MutationObserver.
   */
  private handleMutations(mutations: MutationRecord[]): void {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        this.handleChildListMutation(mutation);
      } else if (mutation.type === "attributes") {
        this.handleAttributeMutation(mutation);
      }
    }
  }

  /**
   * Handles child list mutations, checking new nodes for extension patterns.
   */
  private handleChildListMutation(mutation: MutationRecord): void {
    for (const node of mutation.addedNodes) {
      if (node.nodeType !== Node.ELEMENT_NODE) {
        continue;
      }

      const element = node as Element;

      // Check if the added element itself matches any selector
      for (const selector of this.allSelectors) {
        if (this.elementMatchesSelector(element, selector)) {
          this.addMonitoredIndicator("dom_element", selector, {
            trigger: "added_node",
            tagName: element.tagName.toLowerCase(),
          });
        }
      }

      // Check descendants of the added element
      for (const selector of this.allSelectors) {
        const matches = this.querySelectorSafe(element, selector);
        if (matches.length > 0) {
          this.addMonitoredIndicator("dom_element", selector, {
            trigger: "added_descendant",
            matchCount: matches.length,
          });
        }
      }
    }
  }

  /**
   * Handles attribute mutations, checking if changes match extension patterns.
   */
  private handleAttributeMutation(mutation: MutationRecord): void {
    const element = mutation.target as Element;

    for (const selector of this.allSelectors) {
      if (this.elementMatchesSelector(element, selector)) {
        this.addMonitoredIndicator("dom_element", selector, {
          trigger: "attribute_change",
          attribute: mutation.attributeName,
          tagName: element.tagName.toLowerCase(),
        });
      }
    }
  }

  /**
   * Safely checks if an element matches a selector.
   */
  private elementMatchesSelector(element: Element, selector: string): boolean {
    try {
      return element.matches(selector);
    } catch {
      return false;
    }
  }

  /**
   * Safely queries for elements within a parent.
   */
  private querySelectorSafe(parent: Element, selector: string): Element[] {
    try {
      return Array.from(parent.querySelectorAll(selector));
    } catch {
      return [];
    }
  }

  /**
   * Adds an indicator to the monitored indicators list.
   */
  private addMonitoredIndicator(
    type: string,
    selector: string,
    details: Record<string, unknown>,
  ): void {
    const indicator: DetectionIndicator = {
      type,
      selector,
      details: {
        ...details,
        timestamp: performance.now(),
        isKnown:
          type === "dom_element"
            ? (KNOWN_DOM_SELECTORS as readonly string[]).includes(selector)
            : (KNOWN_GLOBALS as readonly string[]).includes(selector),
      },
    };
    this.monitoredIndicators.push(indicator);
  }

  /**
   * Calculates a confidence score based on indicators.
   */
  private calculateConfidence(indicators: DetectionIndicator[]): number {
    if (indicators.length === 0) {
      return 0;
    }

    // Higher confidence for multiple indicators or known patterns
    const knownCount = indicators.filter((i) => i.details?.["isKnown"] === true).length;
    const unknownCount = indicators.length - knownCount;

    // Known patterns contribute more to confidence
    const score = Math.min(1, knownCount * 0.3 + unknownCount * 0.15);
    return Math.round(score * 100) / 100;
  }

  /**
   * Generates a human-readable message from indicators.
   */
  private generateMessage(indicators: DetectionIndicator[]): string {
    if (indicators.length === 0) {
      return "No AI assistant browser extensions detected";
    }

    const domCount = indicators.filter((i) => i.type === "dom_element").length;
    const globalCount = indicators.filter((i) => i.type === "global_variable").length;

    const parts: string[] = [];
    if (domCount > 0) {
      parts.push(`${domCount} DOM element${domCount > 1 ? "s" : ""}`);
    }
    if (globalCount > 0) {
      parts.push(`${globalCount} global variable${globalCount > 1 ? "s" : ""}`);
    }

    return `AI assistant extension signatures detected: ${parts.join(", ")}`;
  }
}

/**
 * Creates a new ExtensionDetector instance.
 *
 * @param config - Configuration options
 * @returns New ExtensionDetector instance
 *
 * @example
 * ```typescript
 * const detector = createExtensionDetector({
 *   customSelectors: ['[data-custom-ai]'],
 * });
 * ```
 */
export function createExtensionDetector(config?: ExtensionDetectorConfig): ExtensionDetector {
  return new ExtensionDetector(config);
}
