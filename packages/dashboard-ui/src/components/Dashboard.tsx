/**
 * Main dashboard component combining all subcomponents.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { createApiClient } from "../api/client.js";
import { useWebSocket } from "../hooks/useWebSocket.js";
import type {
  AnalysisSummary as AnalysisSummaryType,
  DashboardConfig,
  SessionFilters,
  VerdictType,
} from "../types/index.js";
import "../styles/index.css";
import { AnalysisSummary } from "./AnalysisSummary.js";
import { ConfidenceHistogram } from "./ConfidenceHistogram.js";
import { ConnectionStatus } from "./ConnectionStatus.js";
import { FlagDistribution } from "./FlagDistribution.js";
import { SessionDetail } from "./SessionDetail.js";
import { SessionList } from "./SessionList.js";

export interface DashboardProps {
  config: DashboardConfig;
}

/**
 * Main dashboard component with session list, details, and analytics.
 *
 * @example
 * ```tsx
 * <Dashboard
 *   config={{
 *     apiUrl: "http://localhost:8000/api/v1",
 *     enableWebSocket: true,
 *   }}
 * />
 * ```
 */
export function Dashboard({ config }: DashboardProps) {
  const { apiUrl, studyId, theme = "system", enableWebSocket = true } = config;

  const apiClient = useMemo(() => createApiClient(apiUrl), [apiUrl]);
  const [activeView, setActiveView] = useState<"list" | "detail" | "analytics">("list");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [filters, setFilters] = useState<SessionFilters>({});
  const [summary, setSummary] = useState<AnalysisSummaryType | null>(null);
  const [flagDistribution, setFlagDistribution] = useState<Record<string, number>>({});
  const [confidenceScores, setConfidenceScores] = useState<number[]>([]);

  // WebSocket connection
  const wsUrl = `${apiUrl.replace(/^http/, "ws").replace(/\/api\/v1$/, "")}/ws`;
  const { connectionState } = useWebSocket({
    url: enableWebSocket ? wsUrl : "",
    onSessionNew: () => {
      // Refresh list when new session arrives
      loadAnalytics();
    },
    onVerdictComputed: (data) => {
      // Update confidence scores with new verdict
      setConfidenceScores((prev) => [...prev, data.confidence]);
    },
  });

  const loadAnalytics = useCallback(async () => {
    try {
      const [summaryData, flagData] = await Promise.all([
        apiClient.getAnalysisSummary(),
        apiClient.getFlagDistribution(),
      ]);
      setSummary(summaryData);
      setFlagDistribution(flagData);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    }
  }, [apiClient]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Theme handling
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.setAttribute("data-theme", prefersDark ? "dark" : "light");
    } else {
      root.setAttribute("data-theme", theme);
    }
  }, [theme]);

  const handleSessionSelect = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setActiveView("detail");
  };

  const handleBackToList = () => {
    setSelectedSessionId(null);
    setActiveView("list");
  };

  const handleFilterChange = (verdict: VerdictType | undefined) => {
    setFilters({ ...filters, verdict });
  };

  return (
    <div className="slopit-dashboard">
      <header className="slopit-dashboard-header">
        <h1 className="slopit-dashboard-title">Slopit Dashboard</h1>
        {studyId && <span className="slopit-study-id">Study: {studyId}</span>}
        {enableWebSocket && <ConnectionStatus state={connectionState} />}
      </header>

      <nav className="slopit-dashboard-nav">
        <button
          type="button"
          className={`slopit-nav-item ${activeView === "list" ? "slopit-nav-item--active" : ""}`}
          onClick={() => setActiveView("list")}
        >
          Sessions
        </button>
        <button
          type="button"
          className={`slopit-nav-item ${activeView === "analytics" ? "slopit-nav-item--active" : ""}`}
          onClick={() => setActiveView("analytics")}
        >
          Analytics
        </button>
      </nav>

      <main className="slopit-dashboard-main">
        {activeView === "list" && (
          <div className="slopit-list-view">
            <div className="slopit-filters">
              <label>
                Filter by verdict:
                <select
                  value={filters.verdict ?? ""}
                  onChange={(e) =>
                    handleFilterChange((e.target.value as VerdictType | undefined) || undefined)
                  }
                >
                  <option value="">All</option>
                  <option value="clean">Clean</option>
                  <option value="suspicious">Suspicious</option>
                  <option value="flagged">Flagged</option>
                </select>
              </label>
            </div>
            <SessionList
              apiClient={apiClient}
              onSessionSelect={handleSessionSelect}
              filters={filters}
            />
          </div>
        )}

        {activeView === "detail" && selectedSessionId && (
          <SessionDetail
            apiClient={apiClient}
            sessionId={selectedSessionId}
            onBack={handleBackToList}
          />
        )}

        {activeView === "analytics" && (
          <div className="slopit-analytics-view">
            {summary && <AnalysisSummary summary={summary} />}
            <div className="slopit-charts-grid">
              <div className="slopit-card">
                <div className="slopit-card-header">Flag Distribution</div>
                <div className="slopit-card-body">
                  <FlagDistribution distribution={flagDistribution} />
                </div>
              </div>
              <div className="slopit-card">
                <div className="slopit-card-header">Confidence Scores</div>
                <div className="slopit-card-body">
                  <ConfidenceHistogram scores={confidenceScores} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
