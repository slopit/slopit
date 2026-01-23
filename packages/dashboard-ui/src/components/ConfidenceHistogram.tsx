/**
 * Confidence score histogram component.
 */

export interface ConfidenceHistogramProps {
  scores: number[];
  bins?: number;
  title?: string;
}

/**
 * Histogram showing distribution of confidence scores.
 *
 * @example
 * ```tsx
 * <ConfidenceHistogram
 *   scores={[0.2, 0.4, 0.6, 0.8, 0.95]}
 *   bins={10}
 *   title="Confidence Distribution"
 * />
 * ```
 */
export function ConfidenceHistogram({ scores, bins = 10, title }: ConfidenceHistogramProps) {
  const histogram = computeHistogram(scores, bins);
  const maxCount = Math.max(...histogram.map((b) => b.count), 1);

  if (scores.length === 0) {
    return (
      <div className="slopit-confidence-histogram">
        {title && <h3 className="slopit-chart-title">{title}</h3>}
        <div className="slopit-empty-state">
          <p>No data to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="slopit-confidence-histogram">
      {title && <h3 className="slopit-chart-title">{title}</h3>}
      <div className="slopit-histogram">
        {histogram.map((bin) => (
          <div
            key={bin.min}
            className="slopit-histogram-bar"
            style={{ height: `${(bin.count / maxCount) * 100}%` }}
            title={`${bin.min.toFixed(1)}-${bin.max.toFixed(1)}: ${bin.count}`}
          />
        ))}
      </div>
      <div className="slopit-histogram-axis">
        <span>0</span>
        <span>0.5</span>
        <span>1.0</span>
      </div>
    </div>
  );
}

interface HistogramBin {
  min: number;
  max: number;
  count: number;
}

function computeHistogram(scores: number[], bins: number): HistogramBin[] {
  const binWidth = 1 / bins;
  const result: HistogramBin[] = [];

  for (let i = 0; i < bins; i++) {
    const min = i * binWidth;
    const max = (i + 1) * binWidth;
    const count = scores.filter((s) => s >= min && (i === bins - 1 ? s <= max : s < max)).length;
    result.push({ min, max, count });
  }

  return result;
}
