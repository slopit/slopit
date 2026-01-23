/**
 * Session list component with filtering and pagination.
 */

import { useCallback, useEffect, useState } from "react";
import type { DashboardApiClient } from "../api/client.js";
import type { PaginatedResponse, SessionFilters, SessionSummary } from "../types/index.js";
import { VerdictBadge } from "./VerdictBadge.js";

export interface SessionListProps {
  apiClient: DashboardApiClient;
  onSessionSelect?: (sessionId: string) => void;
  filters?: SessionFilters;
  pageSize?: number;
}

/**
 * Table displaying sessions with verdict badges and pagination.
 *
 * @example
 * ```tsx
 * <SessionList
 *   apiClient={client}
 *   onSessionSelect={(id) => navigate(`/sessions/${id}`)}
 *   filters={{ verdict: "suspicious" }}
 * />
 * ```
 */
export function SessionList({
  apiClient,
  onSessionSelect,
  filters,
  pageSize = 20,
}: SessionListProps) {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response: PaginatedResponse<SessionSummary> = await apiClient.listSessions(
        page,
        pageSize,
        filters,
      );
      setSessions(response.items);
      setTotalPages(Math.ceil(response.total / pageSize));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }, [apiClient, page, pageSize, filters]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleRowClick = (sessionId: string) => {
    onSessionSelect?.(sessionId);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  if (loading) {
    return (
      <div className="slopit-loading">
        <div className="slopit-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="slopit-error">
        <p>Error: {error}</p>
        <button type="button" className="slopit-button" onClick={loadSessions}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="slopit-session-list">
      <table className="slopit-session-table">
        <thead>
          <tr>
            <th>Session ID</th>
            <th>Participant</th>
            <th>Start Time</th>
            <th>Trials</th>
            <th>Verdict</th>
            <th>Flags</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr
              key={session.sessionId}
              onClick={() => handleRowClick(session.sessionId)}
              onKeyDown={(e) => e.key === "Enter" && handleRowClick(session.sessionId)}
              tabIndex={0}
            >
              <td className="slopit-session-id">{session.sessionId.slice(0, 8)}...</td>
              <td>{session.participantId ?? "-"}</td>
              <td>{formatDate(session.startTime)}</td>
              <td>{session.trialCount}</td>
              <td>
                {session.verdict ? (
                  <VerdictBadge
                    verdict={session.verdict}
                    confidence={session.confidence}
                    showConfidence
                  />
                ) : (
                  <span className="slopit-text-secondary">Pending</span>
                )}
              </td>
              <td>{session.flagCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {sessions.length === 0 && (
        <div className="slopit-empty-state">
          <p>No sessions found</p>
        </div>
      )}

      <div className="slopit-pagination">
        <button
          type="button"
          className="slopit-button slopit-button--secondary"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </button>
        <span className="slopit-pagination-info">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          className="slopit-button slopit-button--secondary"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
