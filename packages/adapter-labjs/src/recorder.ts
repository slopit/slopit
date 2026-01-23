/**
 * Session recorder for lab.js experiments.
 *
 * @module
 */

import { BaseRecorder } from "@slopit/adapter-shared";
import type { PlatformInfo } from "@slopit/core";

/**
 * Adapter version for platform metadata.
 */
const ADAPTER_VERSION = "0.1.0";

/**
 * Session recorder for lab.js experiments.
 *
 * Extends BaseRecorder to provide lab.js-specific platform information
 * and session management.
 *
 * @example
 * ```typescript
 * import { LabjsRecorder } from "@slopit/adapter-labjs";
 *
 * const recorder = new LabjsRecorder({
 *   participantId: "P001",
 *   studyId: "my-study",
 * });
 *
 * // Start recording a trial
 * recorder.startTrial({
 *   trialType: "text-entry",
 *   targetElement: document.querySelector("textarea"),
 * });
 *
 * // ... participant completes the trial ...
 *
 * // End the trial with response data
 * recorder.endTrial({
 *   type: "text",
 *   value: "participant response",
 * });
 *
 * // Export the session
 * const session = recorder.exportSession();
 * ```
 */
export class LabjsRecorder extends BaseRecorder {
  /**
   * Gets platform-specific information for lab.js.
   *
   * Attempts to detect the lab.js version from the global scope.
   * If not available, returns "unknown" for the version.
   *
   * @returns Platform information including lab.js version
   */
  protected getPlatformInfo(): PlatformInfo {
    return {
      name: "lab.js",
      version: this.detectLabjsVersion(),
      adapterVersion: ADAPTER_VERSION,
    };
  }

  /**
   * Detects the lab.js library version from the global scope.
   *
   * @returns The lab.js version string or "unknown"
   */
  private detectLabjsVersion(): string {
    if (typeof window !== "undefined") {
      // lab.js exposes version on the lab global
      const labGlobal = (window as WindowWithLab).lab;
      if (labGlobal?.version !== undefined) {
        return labGlobal.version;
      }
    }
    return "unknown";
  }
}

/**
 * Window interface with optional lab.js global.
 */
interface WindowWithLab extends Window {
  lab?: {
    version?: string;
  };
}
