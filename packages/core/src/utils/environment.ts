import type { EnvironmentInfo } from "../schemas/index.js";

/**
 * Capture client environment information.
 *
 * Collects browser, screen, and device information for session metadata.
 * Should be called at the start of a session.
 *
 * @returns Environment information object
 *
 * @example
 * ```typescript
 * const environment = captureEnvironment();
 * console.log(environment.userAgent);
 * console.log(environment.screenResolution);
 * ```
 */
export function captureEnvironment(): EnvironmentInfo {
  // Handle server-side rendering or non-browser environments
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {
      userAgent: "unknown",
      screenResolution: [0, 0],
      viewportSize: [0, 0],
      devicePixelRatio: 1,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: "en",
      touchCapable: false,
    };
  }

  const connectionType = getConnectionType();

  return {
    userAgent: navigator.userAgent,
    screenResolution: [screen.width, screen.height],
    viewportSize: [window.innerWidth, window.innerHeight],
    devicePixelRatio: window.devicePixelRatio ?? 1,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    touchCapable: "ontouchstart" in window || navigator.maxTouchPoints > 0,
    ...(connectionType ? { connectionType } : {}),
  };
}

/**
 * Get network connection type if available.
 *
 * Uses the Network Information API when available.
 *
 * @returns Connection type string or undefined
 */
function getConnectionType(): string | undefined {
  if (typeof navigator !== "undefined" && "connection" in navigator) {
    const connection = navigator.connection as NetworkInformation | undefined;
    return connection?.effectiveType;
  }
  return undefined;
}

/**
 * Network Information API types.
 */
interface NetworkInformation {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

declare global {
  interface Navigator {
    connection?: NetworkInformation;
  }
}
