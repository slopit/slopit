/**
 * API client for the slopit dashboard backend.
 */

import type {
  AnalysisSummary,
  ExportOptions,
  PaginatedResponse,
  SessionFilters,
  SessionSummary,
  SessionVerdict,
  SlopitSession,
  SlopitTrial,
} from "../types/index.js";

/**
 * Dashboard API client configuration.
 */
export interface ApiClientConfig {
  baseUrl: string;
  headers?: Record<string, string>;
}

/**
 * API client for dashboard REST endpoints.
 */
export class DashboardApiClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.headers = {
      "Content-Type": "application/json",
      ...config.headers,
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error ${response.status}: ${error}`);
    }

    return response.json();
  }

  // Session endpoints

  /**
   * List sessions with pagination and filtering.
   */
  async listSessions(
    page = 1,
    pageSize = 20,
    filters?: SessionFilters,
  ): Promise<PaginatedResponse<SessionSummary>> {
    const params = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
    });

    if (filters?.verdict) params.set("verdict", filters.verdict);
    if (filters?.minConfidence !== undefined)
      params.set("min_confidence", String(filters.minConfidence));
    if (filters?.maxConfidence !== undefined)
      params.set("max_confidence", String(filters.maxConfidence));
    if (filters?.startDate) params.set("start_date", filters.startDate);
    if (filters?.endDate) params.set("end_date", filters.endDate);
    if (filters?.participantId) params.set("participant_id", filters.participantId);

    return this.request(`/sessions?${params}`);
  }

  /**
   * Get a single session by ID.
   */
  async getSession(sessionId: string): Promise<SlopitSession> {
    return this.request(`/sessions/${sessionId}`);
  }

  /**
   * Get trials for a session.
   */
  async getSessionTrials(sessionId: string): Promise<SlopitTrial[]> {
    return this.request(`/sessions/${sessionId}/trials`);
  }

  /**
   * Get verdict for a session.
   */
  async getSessionVerdict(sessionId: string): Promise<SessionVerdict> {
    return this.request(`/sessions/${sessionId}/verdict`);
  }

  // Analysis endpoints

  /**
   * Get analysis summary statistics.
   */
  async getAnalysisSummary(): Promise<AnalysisSummary> {
    return this.request("/analysis/summary");
  }

  /**
   * Get flag distribution.
   */
  async getFlagDistribution(): Promise<Record<string, number>> {
    return this.request("/analysis/flags");
  }

  /**
   * Get verdict distribution.
   */
  async getVerdictDistribution(): Promise<Record<string, number>> {
    return this.request("/analysis/verdicts");
  }

  /**
   * Trigger batch analysis.
   */
  async triggerBatchAnalysis(sessionIds?: string[]): Promise<{ taskId: string }> {
    return this.request("/analysis/batch", {
      method: "POST",
      body: JSON.stringify({ session_ids: sessionIds }),
    });
  }

  // Export endpoints

  /**
   * Export sessions to CSV or JSON.
   */
  async exportSessions(options: ExportOptions): Promise<Blob> {
    const params = new URLSearchParams({
      format: options.format,
    });

    if (options.includeTrials) params.set("include_trials", "true");
    if (options.includeMetrics) params.set("include_metrics", "true");
    if (options.filters?.verdict) params.set("verdict", options.filters.verdict);

    const url = `${this.baseUrl}/export?${params}`;
    const response = await fetch(url, { headers: this.headers });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }

    return response.blob();
  }

  // JATOS endpoints

  /**
   * Connect to JATOS instance.
   */
  async connectJatos(url: string, token: string): Promise<{ status: string }> {
    return this.request("/jatos/connect", {
      method: "POST",
      body: JSON.stringify({ url, token }),
    });
  }

  /**
   * List JATOS studies.
   */
  async listJatosStudies(): Promise<Array<{ id: string; title: string }>> {
    return this.request("/jatos/studies");
  }

  /**
   * Sync JATOS study results.
   */
  async syncJatos(studyId: string): Promise<{ taskId: string }> {
    return this.request("/jatos/sync", {
      method: "POST",
      body: JSON.stringify({ study_id: studyId }),
    });
  }

  /**
   * Get JATOS connection status.
   */
  async getJatosStatus(): Promise<{ connected: boolean; url?: string }> {
    return this.request("/jatos/status");
  }

  // Prolific endpoints

  /**
   * Connect to Prolific.
   */
  async connectProlific(token: string): Promise<{ status: string }> {
    return this.request("/prolific/connect", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  }

  /**
   * List Prolific studies.
   */
  async listProlificStudies(): Promise<Array<{ id: string; name: string; status: string }>> {
    return this.request("/prolific/studies");
  }

  /**
   * Get recommendations for participant actions.
   */
  async getProlificRecommendations(studyId: string): Promise<
    Array<{
      participantId: string;
      sessionId: string;
      verdict: string;
      recommendation: "approve" | "reject" | "review";
    }>
  > {
    return this.request(`/prolific/studies/${studyId}/recommendations`);
  }
}

/**
 * Create a new API client instance.
 */
export function createApiClient(baseUrl: string): DashboardApiClient {
  return new DashboardApiClient({ baseUrl });
}
