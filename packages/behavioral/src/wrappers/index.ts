/**
 * Wrappers for combining behavioral capture with detection and intervention.
 *
 * @module
 */

export type {
  EnhancedBehavioralData,
  InputWrapperConfig,
  InterventionManager as WrapperInterventionManager,
  InterventionResult as WrapperInterventionResult,
  WrapperEvent,
} from "./input-wrapper.js";
export {
  createInputWrapper,
  InputWrapper,
} from "./input-wrapper.js";
