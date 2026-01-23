/**
 * Verdict badge component for displaying session verdict status.
 */

import type { VerdictType } from "../types/index.js";

export interface VerdictBadgeProps {
  verdict: VerdictType;
  confidence?: number | undefined;
  showConfidence?: boolean;
  className?: string;
}

/**
 * Badge displaying the verdict status with optional confidence score.
 *
 * @example
 * ```tsx
 * <VerdictBadge verdict="suspicious" confidence={0.75} showConfidence />
 * ```
 */
export function VerdictBadge({
  verdict,
  confidence,
  showConfidence = false,
  className = "",
}: VerdictBadgeProps) {
  const baseClass = "slopit-verdict-badge";
  const variantClass = `${baseClass}--${verdict}`;

  return (
    <span className={`${baseClass} ${variantClass} ${className}`.trim()}>
      <VerdictIcon verdict={verdict} />
      <span>{verdict}</span>
      {showConfidence && confidence !== undefined && (
        <span className="slopit-verdict-confidence">({Math.round(confidence * 100)}%)</span>
      )}
    </span>
  );
}

function VerdictIcon({ verdict }: { verdict: VerdictType }) {
  switch (verdict) {
    case "clean":
      return (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          role="img"
          aria-label="Clean"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      );
    case "suspicious":
      return (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          role="img"
          aria-label="Suspicious"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    case "flagged":
      return (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          role="img"
          aria-label="Flagged"
        >
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <line x1="4" y1="22" x2="4" y2="15" />
        </svg>
      );
  }
}
