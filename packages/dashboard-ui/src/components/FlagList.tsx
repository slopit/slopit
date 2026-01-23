/**
 * Flag list component for displaying analysis flags.
 */

import type { VerdictFlag } from "../types/index.js";

export interface FlagListProps {
  flags: VerdictFlag[];
  groupByAnalyzer?: boolean;
}

/**
 * List of flags with severity indicators.
 *
 * @example
 * ```tsx
 * <FlagList flags={verdict.flags} groupByAnalyzer />
 * ```
 */
export function FlagList({ flags, groupByAnalyzer = false }: FlagListProps) {
  if (flags.length === 0) {
    return (
      <div className="slopit-empty-state">
        <p>No flags detected</p>
      </div>
    );
  }

  if (groupByAnalyzer) {
    const grouped = flags.reduce(
      (acc, flag) => {
        const key = flag.analyzer;
        if (!acc[key]) acc[key] = [];
        acc[key].push(flag);
        return acc;
      },
      {} as Record<string, VerdictFlag[]>,
    );

    return (
      <div className="slopit-flag-list slopit-flag-list--grouped">
        {Object.entries(grouped).map(([analyzer, analyzerFlags]) => (
          <div key={analyzer} className="slopit-flag-group">
            <h4 className="slopit-flag-group-title">{analyzer}</h4>
            <div className="slopit-flag-group-items">
              {analyzerFlags.map((flag, i) => (
                <FlagItem key={`${flag.type}-${i}`} flag={flag} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="slopit-flag-list">
      {flags.map((flag, i) => (
        <FlagItem key={`${flag.type}-${i}`} flag={flag} showAnalyzer />
      ))}
    </div>
  );
}

interface FlagItemProps {
  flag: VerdictFlag;
  showAnalyzer?: boolean;
}

function FlagItem({ flag, showAnalyzer = false }: FlagItemProps) {
  return (
    <div className={`slopit-flag-item slopit-flag-item--${flag.severity}`}>
      <div className="slopit-flag-indicator">
        <SeverityIcon severity={flag.severity} />
      </div>
      <div className="slopit-flag-content">
        <div className="slopit-flag-type">{formatFlagType(flag.type)}</div>
        <div className="slopit-flag-message">{flag.message}</div>
        {showAnalyzer && <div className="slopit-flag-analyzer">Analyzer: {flag.analyzer}</div>}
        {flag.trialIndex !== undefined && (
          <div className="slopit-flag-trial">Trial: {flag.trialIndex + 1}</div>
        )}
      </div>
      <div className="slopit-flag-severity">
        <span className={`slopit-severity-badge slopit-severity-badge--${flag.severity}`}>
          {flag.severity}
        </span>
      </div>
    </div>
  );
}

function formatFlagType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function SeverityIcon({ severity }: { severity: VerdictFlag["severity"] }) {
  switch (severity) {
    case "high":
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          role="img"
          aria-label="High severity"
        >
          <path d="M12 2L2 22h20L12 2zm0 4l7.53 14H4.47L12 6zm-1 5v4h2v-4h-2zm0 6v2h2v-2h-2z" />
        </svg>
      );
    case "medium":
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          role="img"
          aria-label="Medium severity"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 5h2v6h-2V7zm0 8h2v2h-2v-2z" />
        </svg>
      );
    case "low":
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          role="img"
          aria-label="Low severity"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 5h2v2h-2V7zm0 4h2v6h-2v-6z" />
        </svg>
      );
  }
}
