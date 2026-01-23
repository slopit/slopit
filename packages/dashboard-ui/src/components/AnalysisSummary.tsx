/**
 * Analysis summary component showing aggregate statistics.
 */

import type { AnalysisSummary as AnalysisSummaryType, VerdictType } from "../types/index.js";
import { VerdictBadge } from "./VerdictBadge.js";

export interface AnalysisSummaryProps {
  summary: AnalysisSummaryType;
}

/**
 * Summary cards showing overall analysis statistics.
 *
 * @example
 * ```tsx
 * <AnalysisSummary summary={analysisData} />
 * ```
 */
export function AnalysisSummary({ summary }: AnalysisSummaryProps) {
  const verdictTypes: VerdictType[] = ["clean", "suspicious", "flagged"];

  return (
    <div className="slopit-analysis-summary">
      <div className="slopit-summary-cards">
        <div className="slopit-card">
          <div className="slopit-card-body">
            <div className="slopit-stat-large">{summary.totalSessions}</div>
            <div className="slopit-stat-label">Total Sessions</div>
          </div>
        </div>

        <div className="slopit-card">
          <div className="slopit-card-body">
            <div className="slopit-stat-large">{summary.analyzedSessions}</div>
            <div className="slopit-stat-label">Analyzed</div>
          </div>
        </div>

        <div className="slopit-card">
          <div className="slopit-card-body">
            <div className="slopit-stat-large">{(summary.averageConfidence * 100).toFixed(0)}%</div>
            <div className="slopit-stat-label">Avg Confidence</div>
          </div>
        </div>
      </div>

      <div className="slopit-verdict-summary">
        <h4>Verdict Distribution</h4>
        <div className="slopit-verdict-bars">
          {verdictTypes.map((verdict) => {
            const count = summary.verdictDistribution[verdict] ?? 0;
            const percentage =
              summary.analyzedSessions > 0 ? (count / summary.analyzedSessions) * 100 : 0;

            return (
              <div key={verdict} className="slopit-verdict-bar-row">
                <VerdictBadge verdict={verdict} />
                <div className="slopit-verdict-bar-track">
                  <div
                    className={`slopit-verdict-bar-fill slopit-verdict-bar-fill--${verdict}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="slopit-verdict-count">
                  {count} ({percentage.toFixed(0)}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
