/**
 * Intervention module for applying behavioral interventions and challenges.
 *
 * Provides a system for:
 * - Evaluating behavioral triggers and applying interventions
 * - Presenting interactive challenges to participants
 * - Collecting additional behavioral signals during verification
 *
 * @module
 */

// Intervention manager types and implementation
export type {
  InterventionType,
  TriggerConfig,
  InterventionResult,
  InterventionManagerConfig,
  BehavioralState,
  PasteThreshold,
  BlurThreshold,
  IdleThreshold,
  TimingThreshold,
} from "./types.js";

export { InterventionManager, createInterventionManager } from "./intervention-manager.js";

// Challenge types and implementations
export type {
  ChallengeType,
  ChallengeConfig,
  ChallengeResult,
  ChallengeRenderer,
} from "./challenges.js";

export { TypingTestChallenge, MemoryRecallChallenge, createChallenge } from "./challenges.js";
