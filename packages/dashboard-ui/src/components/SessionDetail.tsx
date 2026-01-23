/**
 * Session detail component showing full session information.
 */

import { useCallback, useEffect, useState } from "react";
import type { DashboardApiClient } from "../api/client.js";
import type { SessionVerdict, SlopitSession, SlopitTrial } from "../types/index.js";
import { FlagList } from "./FlagList.js";
import { TrialTimeline } from "./TrialTimeline.js";
import { VerdictBadge } from "./VerdictBadge.js";

export interface SessionDetailProps {
  apiClient: DashboardApiClient;
  sessionId: string;
  onBack?: () => void;
}

/**
 * Detailed view of a single session with trials and flags.
 *
 * @example
 * ```tsx
 * <SessionDetail
 *   apiClient={client}
 *   sessionId="abc123"
 *   onBack={() => navigate("/sessions")}
 * />
 * ```
 */
export function SessionDetail({ apiClient, sessionId, onBack }: SessionDetailProps) {
  const [session, setSession] = useState<SlopitSession | null>(null);
  const [trials, setTrials] = useState<SlopitTrial[]>([]);
  const [verdict, setVerdict] = useState<SessionVerdict | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"trials" | "flags" | "raw">("trials");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [sessionData, trialsData, verdictData] = await Promise.all([
        apiClient.getSession(sessionId),
        apiClient.getSessionTrials(sessionId),
        apiClient.getSessionVerdict(sessionId).catch(() => null),
      ]);

      setSession(sessionData);
      setTrials(trialsData);
      setVerdict(verdictData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load session");
    } finally {
      setLoading(false);
    }
  }, [apiClient, sessionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  if (error || !session) {
    return (
      <div className="slopit-error">
        <p>Error: {error ?? "Session not found"}</p>
        <button type="button" className="slopit-button" onClick={loadData}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="slopit-session-detail">
      <div className="slopit-session-header">
        <div>
          {onBack && (
            <button
              type="button"
              className="slopit-button slopit-button--secondary"
              onClick={onBack}
              style={{ marginBottom: "var(--slopit-space-sm)" }}
            >
              Back to List
            </button>
          )}
          <h2 className="slopit-session-title">Session {sessionId.slice(0, 8)}...</h2>
          <div className="slopit-session-meta">
            {session.participantId && <span>Participant: {session.participantId}</span>}
            <span>Started: {formatDate(String(session.timing.startTime))}</span>
            {session.timing.endTime && (
              <span>Ended: {formatDate(String(session.timing.endTime))}</span>
            )}
            <span>Trials: {session.trials.length}</span>
          </div>
        </div>
        {verdict && (
          <div className="slopit-session-verdict">
            <VerdictBadge
              verdict={verdict.verdict}
              confidence={verdict.confidence}
              showConfidence
            />
          </div>
        )}
      </div>

      <div className="slopit-tabs">
        <button
          type="button"
          className={`slopit-tab ${activeTab === "trials" ? "slopit-tab--active" : ""}`}
          onClick={() => setActiveTab("trials")}
        >
          Trials ({trials.length})
        </button>
        <button
          type="button"
          className={`slopit-tab ${activeTab === "flags" ? "slopit-tab--active" : ""}`}
          onClick={() => setActiveTab("flags")}
        >
          Flags ({verdict?.flags.length ?? 0})
        </button>
        <button
          type="button"
          className={`slopit-tab ${activeTab === "raw" ? "slopit-tab--active" : ""}`}
          onClick={() => setActiveTab("raw")}
        >
          Raw Data
        </button>
      </div>

      <div className="slopit-tab-content">
        {activeTab === "trials" && <TrialTimeline trials={trials} />}
        {activeTab === "flags" && verdict && <FlagList flags={verdict.flags} />}
        {activeTab === "raw" && (
          <pre className="slopit-raw-data">{JSON.stringify(session, null, 2)}</pre>
        )}
      </div>
    </div>
  );
}
