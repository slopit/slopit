/**
 * Slopit Dashboard UI
 *
 * React components for the slopit analytics dashboard.
 *
 * @packageDocumentation
 */

// API
export * from "./api/index.js";
// Components
export * from "./components/index.js";
// Hooks
export * from "./hooks/index.js";
// Types - explicitly export to avoid conflicts with component types
// Re-export AnalysisSummary type with a different name to avoid conflict
export type {
  AnalysisSummary as AnalysisSummaryData,
  BehavioralData,
  BehavioralMetrics,
  DashboardConfig,
  ExportOptions,
  PaginatedResponse,
  SessionFilters,
  SessionNewEventData,
  SessionSummary,
  SessionVerdict,
  SlopitSession,
  SlopitTrial,
  SyncProgressEventData,
  VerdictComputedEventData,
  VerdictFlag,
  VerdictType,
  WebSocketEventType,
  WebSocketMessage,
} from "./types/index.js";

// Styles
import "./styles/index.css";
