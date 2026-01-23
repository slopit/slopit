/**
 * Dashboard-specific types for the slopit analytics UI.
 */

import type { BehavioralData, BehavioralMetrics, SlopitSession, SlopitTrial } from "@slopit/core";

/**
 * Verdict indicating the overall assessment of a session.
 */
export type VerdictType = "clean" | "suspicious" | "flagged";

/**
 * Session verdict with confidence and flag breakdown.
 */
export interface SessionVerdict {
  sessionId: string;
  verdict: VerdictType;
  confidence: number;
  flags: VerdictFlag[];
  analyzedAt: string;
}

/**
 * Individual flag from an analyzer.
 */
export interface VerdictFlag {
  type: string;
  severity: "low" | "medium" | "high";
  message: string;
  analyzer: string;
  trialIndex?: number;
}

/**
 * Session summary for list views.
 */
export interface SessionSummary {
  sessionId: string;
  participantId?: string;
  startTime: string;
  endTime?: string;
  trialCount: number;
  verdict?: VerdictType;
  confidence?: number;
  flagCount: number;
}

/**
 * Dashboard configuration for the root component.
 */
export interface DashboardConfig {
  apiUrl: string;
  studyId?: string | undefined;
  theme?: "light" | "dark" | "system";
  pollingInterval?: number | undefined;
  enableWebSocket?: boolean;
}

/**
 * WebSocket event types.
 */
export type WebSocketEventType = "session.new" | "verdict.computed" | "sync.progress";

/**
 * WebSocket message structure.
 */
export interface WebSocketMessage<T = unknown> {
  type: WebSocketEventType;
  data: T;
}

/**
 * Session new event data.
 */
export interface SessionNewEventData {
  sessionId: string;
  participantId?: string;
  timestamp: string;
}

/**
 * Verdict computed event data.
 */
export interface VerdictComputedEventData {
  sessionId: string;
  verdict: VerdictType;
  confidence: number;
  flagCount: number;
}

/**
 * Sync progress event data.
 */
export interface SyncProgressEventData {
  source: "jatos" | "prolific";
  progress: number;
  total: number;
  status: "in_progress" | "completed" | "error";
  message?: string;
}

/**
 * API response for paginated lists.
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Filter options for session list.
 */
export interface SessionFilters {
  verdict?: VerdictType | undefined;
  minConfidence?: number | undefined;
  maxConfidence?: number | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
  participantId?: string | undefined;
}

/**
 * Analysis summary statistics.
 */
export interface AnalysisSummary {
  totalSessions: number;
  analyzedSessions: number;
  verdictDistribution: Record<VerdictType, number>;
  flagDistribution: Record<string, number>;
  averageConfidence: number;
}

/**
 * Export options.
 */
export interface ExportOptions {
  format: "csv" | "json";
  includeTrials?: boolean;
  includeMetrics?: boolean;
  filters?: SessionFilters;
}

// Re-export core types for convenience
export type { SlopitSession, SlopitTrial, BehavioralData, BehavioralMetrics };
