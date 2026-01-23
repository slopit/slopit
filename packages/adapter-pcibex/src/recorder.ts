/**
 * Session recorder for PCIbex experiments.
 *
 * @module
 */

import { BaseRecorder } from "@slopit/adapter-shared";
import type { PlatformInfo } from "@slopit/core";

/**
 * Adapter version for platform info.
 */
const ADAPTER_VERSION = "0.1.0";

/**
 * Session recorder for PCIbex experiments.
 *
 * Extends BaseRecorder to provide PCIbex-specific session management.
 * Use this for session-level management across multiple trials when
 * you need more control than the element-based API provides.
 *
 * @example
 * ```typescript
 * const recorder = new PCIbexRecorder({
 *   participantId: "P001",
 *   studyId: "study-123",
 * });
 *
 * recorder.startTrial({ trialType: "text-entry" });
 * // ... participant completes trial ...
 * recorder.endTrial({ type: "text", value: "response text" });
 *
 * const session = recorder.exportSession();
 * ```
 */
export class PCIbexRecorder extends BaseRecorder {
  /**
   * Get platform information for PCIbex.
   *
   * @returns Platform info including name, version, and adapter version
   */
  protected getPlatformInfo(): PlatformInfo {
    return {
      name: "PCIbex",
      version: this.detectPCIbexVersion(),
      adapterVersion: ADAPTER_VERSION,
    };
  }

  /**
   * Detect the PCIbex/PennController version if available.
   *
   * PCIbex does not expose version information in a standard way,
   * so this attempts to detect it from global variables.
   *
   * @returns The detected version string, or "unknown"
   */
  private detectPCIbexVersion(): string {
    if (typeof window === "undefined") {
      return "unknown";
    }

    // Check for PennController version using bracket notation for index access
    const win = window as unknown as Record<string, unknown>;
    const pennController = win["PennController"];
    if (
      typeof pennController === "object" &&
      pennController !== null &&
      "version" in pennController
    ) {
      const version = (pennController as Record<string, unknown>)["version"];
      if (typeof version === "string") {
        return version;
      }
    }

    return "unknown";
  }
}

/**
 * Create a new PCIbex session recorder.
 *
 * Factory function for creating PCIbexRecorder instances.
 *
 * @param config - Recorder configuration
 * @returns A new PCIbexRecorder instance
 *
 * @example
 * ```typescript
 * const recorder = createPCIbexRecorder({
 *   participantId: urlParams.get("PROLIFIC_PID"),
 *   studyId: "my-experiment",
 * });
 * ```
 */
export function createPCIbexRecorder(
  config?: ConstructorParameters<typeof PCIbexRecorder>[0],
): PCIbexRecorder {
  return new PCIbexRecorder(config);
}
