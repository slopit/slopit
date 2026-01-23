/**
 * lab.js adapter for slopit behavioral capture.
 *
 * This package provides a mixin function to enhance lab.js components with
 * behavioral capture, plus a session recorder for managing experiment data.
 *
 * @module
 */

// Mixin function (primary API)
export { withSlopit } from "./extension.js";

// Recorder
export { LabjsRecorder } from "./recorder.js";

// Types
export type {
  LabjsComponentConstructor,
  LabjsComponentLike,
  LabjsSlopitConfig,
  LabjsTrialData,
} from "./types.js";
