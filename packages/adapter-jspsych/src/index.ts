/**
 * jsPsych adapter for slopit behavioral capture.
 *
 * This package provides a jsPsych extension that wraps existing plugins to add
 * behavioral capture, plus utilities for exporting session data.
 *
 * @module
 */

// Extension (primary API)
export { SlopitExtension, type SlopitExtensionParams } from "./extension.js";
// Types
export type { SlopitConfig, SlopitData } from "./types.js";
// Export utilities
export { type ExportOptions, exportToSlopit, getSlopitDataFromTrial } from "./utils/index.js";
