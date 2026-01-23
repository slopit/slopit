/**
 * MutationObserver-based element discovery utilities.
 *
 * @module
 */

/**
 * Options for discovering an element in the DOM.
 */
export interface DiscoverElementOptions {
  /**
   * CSS selector for the element to find.
   */
  selector: string;

  /**
   * Container element or document to search within.
   */
  container: HTMLElement | Document;

  /**
   * Timeout in milliseconds before giving up.
   *
   * @default 5000
   */
  timeout?: number;

  /**
   * Callback invoked when the element is found.
   *
   * @param element - The discovered element
   */
  onFound: (element: HTMLElement) => void;

  /**
   * Optional callback invoked if the element is not found within the timeout.
   */
  onTimeout?: () => void;
}

/**
 * Discovers an element in the DOM using a MutationObserver.
 *
 * If the element already exists, the callback is invoked immediately.
 * Otherwise, a MutationObserver watches for DOM changes until the element
 * appears or the timeout is reached.
 *
 * @param options - Discovery options
 * @returns Cleanup function to disconnect the observer and cancel the timeout
 *
 * @example
 * ```typescript
 * const cleanup = discoverElement({
 *   selector: "textarea.response-input",
 *   container: document.getElementById("trial-container")!,
 *   timeout: 3000,
 *   onFound: (element) => {
 *     capture.attach(element);
 *   },
 *   onTimeout: () => {
 *     console.warn("Target element not found within timeout");
 *   },
 * });
 *
 * // Later, to cancel observation:
 * cleanup();
 * ```
 */
export function discoverElement(options: DiscoverElementOptions): () => void {
  const { selector, container, timeout = 5000, onFound, onTimeout } = options;

  let observer: MutationObserver | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let found = false;

  const cleanup = (): void => {
    if (observer !== null) {
      observer.disconnect();
      observer = null;
    }
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  // Get the root element for querying
  const root = container instanceof Document ? container : container;

  // Try to find the element immediately
  const existing = root.querySelector<HTMLElement>(selector);
  if (existing !== null) {
    found = true;
    onFound(existing);
    return cleanup;
  }

  // Set up timeout
  if (timeout > 0) {
    timeoutId = setTimeout(() => {
      cleanup();
      if (!found && onTimeout !== undefined) {
        onTimeout();
      }
    }, timeout);
  }

  // Set up MutationObserver
  observer = new MutationObserver(() => {
    if (found) return;

    const target = root.querySelector<HTMLElement>(selector);
    if (target !== null) {
      found = true;
      cleanup();
      onFound(target);
    }
  });

  // Observe the container for changes
  const observeTarget = container instanceof Document ? container.body : container;
  observer.observe(observeTarget, {
    childList: true,
    subtree: true,
  });

  return cleanup;
}

/**
 * Options for discovering multiple elements in the DOM.
 */
export interface DiscoverElementsOptions {
  /**
   * CSS selector for elements to find.
   */
  selector: string;

  /**
   * Container element or document to search within.
   */
  container: HTMLElement | Document;

  /**
   * Minimum number of elements required.
   *
   * @default 1
   */
  minCount?: number;

  /**
   * Timeout in milliseconds before giving up.
   *
   * @default 5000
   */
  timeout?: number;

  /**
   * Callback invoked when the required number of elements are found.
   *
   * @param elements - The discovered elements
   */
  onFound: (elements: HTMLElement[]) => void;

  /**
   * Optional callback invoked if the required elements are not found within the timeout.
   *
   * @param found - Elements that were found before timeout
   */
  onTimeout?: (found: HTMLElement[]) => void;
}

/**
 * Discovers multiple elements in the DOM using a MutationObserver.
 *
 * Waits until the minimum number of matching elements are present.
 *
 * @param options - Discovery options
 * @returns Cleanup function to disconnect the observer and cancel the timeout
 *
 * @example
 * ```typescript
 * const cleanup = discoverElements({
 *   selector: "input[type='text']",
 *   container: document.body,
 *   minCount: 3,
 *   onFound: (inputs) => {
 *     inputs.forEach((input) => capture.attach(input));
 *   },
 * });
 * ```
 */
export function discoverElements(options: DiscoverElementsOptions): () => void {
  const { selector, container, minCount = 1, timeout = 5000, onFound, onTimeout } = options;

  let observer: MutationObserver | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let found = false;

  const cleanup = (): void => {
    if (observer !== null) {
      observer.disconnect();
      observer = null;
    }
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const root = container instanceof Document ? container : container;

  // Try to find elements immediately
  const existing = Array.from(root.querySelectorAll<HTMLElement>(selector));
  if (existing.length >= minCount) {
    found = true;
    onFound(existing);
    return cleanup;
  }

  // Set up timeout
  if (timeout > 0) {
    timeoutId = setTimeout(() => {
      cleanup();
      if (!found) {
        const partial = Array.from(root.querySelectorAll<HTMLElement>(selector));
        if (onTimeout !== undefined) {
          onTimeout(partial);
        }
      }
    }, timeout);
  }

  // Set up MutationObserver
  observer = new MutationObserver(() => {
    if (found) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>(selector));
    if (targets.length >= minCount) {
      found = true;
      cleanup();
      onFound(targets);
    }
  });

  const observeTarget = container instanceof Document ? container.body : container;
  observer.observe(observeTarget, {
    childList: true,
    subtree: true,
  });

  return cleanup;
}
