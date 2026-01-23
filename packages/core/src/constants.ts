/**
 * Current schema version for slopit data format.
 */
export const SCHEMA_VERSION = "1.0" as const;

/**
 * Default configuration values for behavioral capture.
 */
export const DEFAULT_CONFIG = {
  keystroke: {
    enabled: true,
    captureKeyUp: true,
    includeModifiers: true,
  },
  focus: {
    enabled: true,
    useVisibilityAPI: true,
    useBlurFocus: true,
  },
  paste: {
    enabled: true,
    prevent: false,
    capturePreview: true,
    previewLength: 100,
  },
} as const;

/**
 * Severity levels in ascending order.
 */
export const SEVERITY_LEVELS = ["info", "low", "medium", "high"] as const;

/**
 * Known platform identifiers.
 */
export const KNOWN_PLATFORMS = [
  "jspsych",
  "labjs",
  "psychojs",
  "gorilla",
  "qualtrics",
  "custom",
] as const;
