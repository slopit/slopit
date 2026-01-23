/**
 * Flag distribution chart component.
 */

export interface FlagDistributionProps {
  distribution: Record<string, number>;
  title?: string;
}

/**
 * Horizontal bar chart showing flag type distribution.
 *
 * @example
 * ```tsx
 * <FlagDistribution
 *   distribution={{
 *     paste_detected: 15,
 *     excessive_blur: 8,
 *     timing_anomaly: 3,
 *   }}
 *   title="Flag Distribution"
 * />
 * ```
 */
export function FlagDistribution({ distribution, title }: FlagDistributionProps) {
  const entries = Object.entries(distribution).sort((a, b) => b[1] - a[1]);
  const maxValue = Math.max(...entries.map(([_, v]) => v), 1);

  if (entries.length === 0) {
    return (
      <div className="slopit-flag-distribution">
        {title && <h3 className="slopit-chart-title">{title}</h3>}
        <div className="slopit-empty-state">
          <p>No flags to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="slopit-flag-distribution">
      {title && <h3 className="slopit-chart-title">{title}</h3>}
      <div className="slopit-flag-bars">
        {entries.map(([type, count]) => (
          <div key={type} className="slopit-flag-bar">
            <span className="slopit-flag-label">{formatFlagType(type)}</span>
            <div className="slopit-flag-bar-track">
              <div
                className="slopit-flag-bar-fill"
                style={{ width: `${(count / maxValue) * 100}%` }}
              />
            </div>
            <span className="slopit-flag-count">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatFlagType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
