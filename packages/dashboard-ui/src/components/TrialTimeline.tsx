/**
 * Trial timeline component showing behavioral events.
 */

import { useState } from "react";
import type { SlopitTrial } from "../types/index.js";

export interface TrialTimelineProps {
  trials: SlopitTrial[];
  onTrialSelect?: (trialIndex: number) => void;
}

/**
 * Timeline view of trials with expandable behavioral data.
 *
 * @example
 * ```tsx
 * <TrialTimeline
 *   trials={session.trials}
 *   onTrialSelect={(i) => console.log("Selected trial", i)}
 * />
 * ```
 */
export function TrialTimeline({ trials, onTrialSelect }: TrialTimelineProps) {
  const [expandedTrial, setExpandedTrial] = useState<number | null>(null);

  const toggleTrial = (index: number) => {
    setExpandedTrial(expandedTrial === index ? null : index);
    onTrialSelect?.(index);
  };

  if (trials.length === 0) {
    return (
      <div className="slopit-empty-state">
        <p>No trials in this session</p>
      </div>
    );
  }

  return (
    <div className="slopit-trial-timeline">
      {trials.map((trial, index) => (
        <TrialItem
          key={trial.trialId}
          trial={trial}
          index={index}
          expanded={expandedTrial === index}
          onToggle={() => toggleTrial(index)}
        />
      ))}
    </div>
  );
}

interface TrialItemProps {
  trial: SlopitTrial;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}

function TrialItem({ trial, index, expanded, onToggle }: TrialItemProps) {
  const behavioral = trial.behavioral;
  const keystrokeCount = behavioral?.keystrokes?.length ?? 0;
  const pasteCount = behavioral?.paste?.length ?? 0;
  const focusCount = behavioral?.focus?.length ?? 0;

  return (
    <div className={`slopit-trial-item ${expanded ? "slopit-trial-item--expanded" : ""}`}>
      <button type="button" className="slopit-trial-header" onClick={onToggle}>
        <span className="slopit-trial-index">Trial {index + 1}</span>
        <span className="slopit-trial-summary">
          {keystrokeCount} keystrokes, {pasteCount} pastes, {focusCount} focus events
        </span>
        <span className="slopit-trial-toggle">{expanded ? "−" : "+"}</span>
      </button>

      {expanded && (
        <div className="slopit-trial-details">
          {trial.stimulus && (
            <div className="slopit-trial-section">
              <h4>Stimulus</h4>
              <p>{trial.stimulus.content ?? trial.stimulus.type}</p>
            </div>
          )}

          {trial.response && (
            <div className="slopit-trial-section">
              <h4>Response</h4>
              <p className="slopit-response-text">{String(trial.response.value)}</p>
              {trial.rt !== undefined && (
                <p className="slopit-response-rt">Response time: {Math.round(trial.rt)}ms</p>
              )}
            </div>
          )}

          {behavioral && (
            <div className="slopit-trial-section">
              <h4>Behavioral Data</h4>
              <BehavioralSummary behavioral={behavioral} />
            </div>
          )}

          {behavioral?.metrics && (
            <div className="slopit-trial-section">
              <h4>Metrics</h4>
              <MetricsSummary metrics={behavioral.metrics} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BehavioralSummary({ behavioral }: { behavioral: SlopitTrial["behavioral"] }) {
  if (!behavioral) return null;

  const stats = [
    { label: "Keystrokes", value: behavioral.keystrokes?.length ?? 0 },
    { label: "Paste Events", value: behavioral.paste?.length ?? 0 },
    { label: "Focus Events", value: behavioral.focus?.length ?? 0 },
    { label: "Mouse Events", value: behavioral.mouse?.length ?? 0 },
    { label: "Scroll Events", value: behavioral.scroll?.length ?? 0 },
  ].filter((s) => s.value > 0);

  return (
    <div className="slopit-behavioral-stats">
      {stats.map((stat) => (
        <div key={stat.label} className="slopit-stat">
          <span className="slopit-stat-value">{stat.value}</span>
          <span className="slopit-stat-label">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}

function MetricsSummary({
  metrics,
}: {
  metrics: NonNullable<SlopitTrial["behavioral"]>["metrics"];
}) {
  if (!metrics) return null;

  const items: Array<{ label: string; value: string }> = [];

  if (metrics.keystroke) {
    items.push({
      label: "Mean IKI",
      value: `${Math.round(metrics.keystroke.meanIKI)}ms`,
    });
    items.push({
      label: "IKI Std Dev",
      value: `${Math.round(metrics.keystroke.stdIKI)}ms`,
    });
  }

  if (metrics.timing) {
    items.push({
      label: "Total Time",
      value: `${Math.round(metrics.timing.totalResponseTime / 1000)}s`,
    });
    if (metrics.timing.charactersPerMinute) {
      items.push({
        label: "Chars/min",
        value: metrics.timing.charactersPerMinute.toFixed(0),
      });
    }
  }

  if (metrics.focus) {
    items.push({
      label: "Blur Count",
      value: String(metrics.focus.blurCount),
    });
  }

  return (
    <div className="slopit-metrics-grid">
      {items.map((item) => (
        <div key={item.label} className="slopit-metric">
          <span className="slopit-metric-label">{item.label}</span>
          <span className="slopit-metric-value">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
