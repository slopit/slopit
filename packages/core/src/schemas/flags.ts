/**
 * Severity level for flags.
 */
export type Severity = "info" | "low" | "medium" | "high";

/**
 * Flag generated during data capture.
 */
export interface CaptureFlag {
  /**
   * Flag type identifier.
   */
  type: string;

  /**
   * Severity level.
   */
  severity: Severity;

  /**
   * Human-readable description.
   */
  message: string;

  /**
   * Timestamp when flag was generated.
   */
  timestamp: number;

  /**
   * Additional details.
   */
  details?: Record<string, unknown>;
}

/**
 * Flag generated during server-side analysis.
 */
export interface AnalysisFlag {
  /**
   * Flag type identifier.
   */
  type: string;

  /**
   * Analyzer that generated this flag.
   */
  analyzer: string;

  /**
   * Severity level.
   */
  severity: Severity;

  /**
   * Human-readable description.
   */
  message: string;

  /**
   * Confidence score if applicable (0.0 to 1.0).
   */
  confidence?: number;

  /**
   * Evidence supporting this flag.
   */
  evidence?: Record<string, unknown>;

  /**
   * Related trial IDs if trial-specific.
   */
  trialIds?: string[];
}
