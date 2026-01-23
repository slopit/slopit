/**
 * Slopit Dashboard UI
 *
 * React components for the slopit analytics dashboard.
 *
 * @packageDocumentation
 */

// Components
export * from "./components/index.js";

// Hooks
export * from "./hooks/index.js";

// API
export * from "./api/index.js";

// Types - explicitly export to avoid conflicts with component types
export type {
  VerdictType,
  SessionVerdict,
  VerdictFlag,
  SessionSummary,
  DashboardConfig,
  WebSocketEventType,
  WebSocketMessage,
  SessionNewEventData,
  VerdictComputedEventData,
  SyncProgressEventData,
  PaginatedResponse,
  SessionFilters,
  ExportOptions,
  SlopitSession,
  SlopitTrial,
  BehavioralData,
  BehavioralMetrics,
} from "./types/index.js";

// Re-export AnalysisSummary type with a different name to avoid conflict
export type { AnalysisSummary as AnalysisSummaryData } from "./types/index.js";

// Styles
import "./styles/index.css";
