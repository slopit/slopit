/**
 * Detection module for identifying specific behaviors during capture.
 *
 * @module
 */

export type { ExtensionDetectorConfig } from "./extension.js";
export {
  createExtensionDetector,
  ExtensionDetector,
} from "./extension.js";
export {
  type TextAppearanceCallbacks,
  TextAppearanceDetector,
  type TextAppearanceDetectorConfig,
} from "./text-appearance.js";
export type {
  DetectionIndicator,
  DetectionResult,
  Detector,
} from "./types.js";
