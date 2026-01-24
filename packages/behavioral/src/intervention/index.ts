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

// Challenge types and implementations
export type {
  ChallengeConfig,
  ChallengeRenderer,
  ChallengeResult,
  ChallengeType,
} from "./challenges.js";
export { createChallenge, MemoryRecallChallenge, TypingTestChallenge } from "./challenges.js";
export { createInterventionManager, InterventionManager } from "./intervention-manager.js";
// Intervention manager types and implementation
export type {
  BehavioralState,
  BlurThreshold,
  IdleThreshold,
  InterventionManagerConfig,
  InterventionResult,
  InterventionType,
  PasteThreshold,
  TimingThreshold,
  TriggerConfig,
} from "./types.js";
