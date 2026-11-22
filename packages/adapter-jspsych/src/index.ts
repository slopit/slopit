/**
 * jsPsych adapter for slopit behavioral capture.
 *
 * This package provides a jsPsych extension that wraps existing plugins to add
 * behavioral capture, plus utilities for exporting session data.
 *
 * @module
 */

// Types
export type { ResponseControlsConfig } from "@slopit/behavioral";
// Extension (primary API)
export { SlopitExtension, type SlopitExtensionParams } from "./extension.js";
export type { SlopitConfig, SlopitData } from "./types.js";
// Export utilities
export { type ExportOptions, exportToSlopit, getSlopitDataFromTrial } from "./utils/index.js";
