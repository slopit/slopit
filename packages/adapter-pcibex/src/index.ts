/**
 * PCIbex adapter for slopit behavioral capture.
 *
 * Integrates slopit with PCIbex (PennController for IBEX) experiments
 * to capture behavioral data during text entry tasks.
 *
 * @module
 *
 * @example
 * ```javascript
 * // Element-based API (recommended for most use cases):
 * newSlopit("capture")
 *   .attach(getTextInput("answer"))
 *   .keystroke(true)
 *   .paste(true, false)
 *
 * // ... later in the trial ...
 * getSlopit("capture").log()
 *
 * // Get all captured data:
 * const data = getAllSlopitData();
 * ```
 *
 * @example
 * ```typescript
 * // Recorder-based API (for advanced session management):
 * import { PCIbexRecorder } from "@slopit/adapter-pcibex";
 *
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

// Element-based API
export {
  clearSlopitElements,
  getAllSlopitData,
  getSlopit,
  getSlopitCount,
  newSlopit,
} from "./element.js";

// Recorder-based API
export { createPCIbexRecorder, PCIbexRecorder } from "./recorder.js";

// Types
export type {
  AdapterData,
  PCIbexSlopitConfig,
  PennElement,
  SlopitElement,
} from "./types.js";
