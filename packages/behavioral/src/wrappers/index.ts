/**
 * Wrappers for combining behavioral capture with detection and intervention.
 *
 * @module
 */

export {
  InputWrapper,
  createInputWrapper,
} from "./input-wrapper.js";

export type {
  InputWrapperConfig,
  EnhancedBehavioralData,
  WrapperEvent,
  InterventionManager as WrapperInterventionManager,
  InterventionResult as WrapperInterventionResult,
} from "./input-wrapper.js";
