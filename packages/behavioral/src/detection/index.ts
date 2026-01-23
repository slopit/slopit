/**
 * Detection module for identifying specific behaviors during capture.
 *
 * @module
 */

export type {
  DetectionIndicator,
  DetectionResult,
  Detector,
} from "./types.js";

export {
  TextAppearanceDetector,
  type TextAppearanceDetectorConfig,
  type TextAppearanceCallbacks,
} from "./text-appearance.js";

export {
  ExtensionDetector,
  createExtensionDetector,
} from "./extension.js";
export type { ExtensionDetectorConfig } from "./extension.js";
