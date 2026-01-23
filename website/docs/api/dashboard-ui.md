---
sidebar_position: 11
---

# @slopit/dashboard-ui API Reference

React components and utilities for the slopit analytics dashboard. This package provides a complete UI for viewing and analyzing behavioral data collected by the slopit TypeScript adapters and processed by the Python backend.

## Installation

```bash
pnpm add @slopit/dashboard-ui
```

### Peer Dependencies

The React components require React 18 or 19:

```bash
pnpm add react react-dom
```

### Web Component Usage

The package also exports a web component that can be used without React:

```html
<script type="module" src="https://unpkg.com/@slopit/dashboard-ui/dist/slopit-dashboard-wc.js"></script>
<link rel="stylesheet" href="https://unpkg.com/@slopit/dashboard-ui/style.css">

<slopit-dashboard
  api-url="http://localhost:8000/api/v1"
  study-id="my-study"
  theme="dark">
</slopit-dashboard>
```

## Quick Start

```tsx
import { Dashboard } from "@slopit/dashboard-ui";
import "@slopit/dashboard-ui/style.css";

function App() {
  return (
    <Dashboard
      config={{
        apiUrl: "http://localhost:8000/api/v1",
        studyId: "my-study",
        enableWebSocket: true,
        theme: "system",
      }}
    />
  );
}
```

## Components

### Dashboard

Main dashboard component combining session list, detail view, and analytics panels.

```typescript
interface DashboardProps {
  config: DashboardConfig;
}

interface DashboardConfig {
  apiUrl: string;
  studyId?: string;
  theme?: "light" | "dark" | "system";
  pollingInterval?: number;
  enableWebSocket?: boolean;
}
```

**Props:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `config.apiUrl` | string | (required) | Base URL for the slopit API |
| `config.studyId` | string | - | Study identifier to display in header |
| `config.theme` | `"light" \| "dark" \| "system"` | `"system"` | Color theme |
| `config.pollingInterval` | number | - | Polling interval in milliseconds (if WebSocket disabled) |
| `config.enableWebSocket` | boolean | `true` | Enable real-time updates via WebSocket |

```tsx
<Dashboard
  config={{
    apiUrl: "http://localhost:8000/api/v1",
    studyId: "experiment-001",
    enableWebSocket: true,
    theme: "dark",
  }}
/>
```

### SessionList

Table displaying sessions with verdict badges and pagination.

```typescript
interface SessionListProps {
  apiClient: DashboardApiClient;
  onSessionSelect?: (sessionId: string) => void;
  filters?: SessionFilters;
  pageSize?: number;
}
```

**Props:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `apiClient` | DashboardApiClient | (required) | API client instance |
| `onSessionSelect` | `(sessionId: string) => void` | - | Callback when a session row is clicked |
| `filters` | SessionFilters | - | Filter options for the list |
| `pageSize` | number | `20` | Number of sessions per page |

```tsx
import { SessionList, createApiClient } from "@slopit/dashboard-ui";

const client = createApiClient("http://localhost:8000/api/v1");

<SessionList
  apiClient={client}
  onSessionSelect={(id) => navigate(`/sessions/${id}`)}
  filters={{ verdict: "suspicious" }}
  pageSize={25}
/>
```

### SessionDetail

Detailed view of a single session with trials and flags.

```typescript
interface SessionDetailProps {
  apiClient: DashboardApiClient;
  sessionId: string;
  onBack?: () => void;
}
```

**Props:**

| Property | Type | Description |
|----------|------|-------------|
| `apiClient` | DashboardApiClient | API client instance |
| `sessionId` | string | Session ID to display |
| `onBack` | `() => void` | Callback for back navigation |

```tsx
<SessionDetail
  apiClient={client}
  sessionId="abc123def456"
  onBack={() => navigate("/sessions")}
/>
```

### AnalysisSummary

Summary cards showing overall analysis statistics.

```typescript
interface AnalysisSummaryProps {
  summary: AnalysisSummaryData;
}

interface AnalysisSummaryData {
  totalSessions: number;
  analyzedSessions: number;
  verdictDistribution: Record<VerdictType, number>;
  flagDistribution: Record<string, number>;
  averageConfidence: number;
}
```

```tsx
<AnalysisSummary
  summary={{
    totalSessions: 150,
    analyzedSessions: 142,
    verdictDistribution: { clean: 100, suspicious: 32, flagged: 10 },
    flagDistribution: { paste_detected: 25, timing_anomaly: 15 },
    averageConfidence: 0.82,
  }}
/>
```

### VerdictBadge

Badge displaying the verdict status with optional confidence score.

```typescript
interface VerdictBadgeProps {
  verdict: VerdictType;
  confidence?: number;
  showConfidence?: boolean;
  className?: string;
}

type VerdictType = "clean" | "suspicious" | "flagged";
```

**Props:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `verdict` | VerdictType | (required) | Verdict status to display |
| `confidence` | number | - | Confidence score (0 to 1) |
| `showConfidence` | boolean | `false` | Show confidence as percentage |
| `className` | string | - | Additional CSS class |

```tsx
<VerdictBadge verdict="suspicious" confidence={0.75} showConfidence />
```

### FlagList

List of flags with severity indicators.

```typescript
interface FlagListProps {
  flags: VerdictFlag[];
  groupByAnalyzer?: boolean;
}

interface VerdictFlag {
  type: string;
  severity: "low" | "medium" | "high";
  message: string;
  analyzer: string;
  trialIndex?: number;
}
```

**Props:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `flags` | VerdictFlag[] | (required) | Array of flags to display |
| `groupByAnalyzer` | boolean | `false` | Group flags by analyzer name |

```tsx
<FlagList
  flags={verdict.flags}
  groupByAnalyzer
/>
```

### TrialTimeline

Timeline view of trials with expandable behavioral data.

```typescript
interface TrialTimelineProps {
  trials: SlopitTrial[];
  onTrialSelect?: (trialIndex: number) => void;
}
```

**Props:**

| Property | Type | Description |
|----------|------|-------------|
| `trials` | SlopitTrial[] | Array of trials to display |
| `onTrialSelect` | `(trialIndex: number) => void` | Callback when a trial is expanded |

```tsx
<TrialTimeline
  trials={session.trials}
  onTrialSelect={(i) => console.log("Selected trial", i)}
/>
```

### ConfidenceHistogram

Histogram showing distribution of confidence scores.

```typescript
interface ConfidenceHistogramProps {
  scores: number[];
  bins?: number;
  title?: string;
}
```

**Props:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `scores` | number[] | (required) | Array of confidence scores (0 to 1) |
| `bins` | number | `10` | Number of histogram bins |
| `title` | string | - | Chart title |

```tsx
<ConfidenceHistogram
  scores={[0.2, 0.4, 0.6, 0.8, 0.95]}
  bins={10}
  title="Confidence Distribution"
/>
```

### FlagDistribution

Horizontal bar chart showing flag type distribution.

```typescript
interface FlagDistributionProps {
  distribution: Record<string, number>;
  title?: string;
}
```

```tsx
<FlagDistribution
  distribution={{
    paste_detected: 15,
    excessive_blur: 8,
    timing_anomaly: 3,
  }}
  title="Flag Distribution"
/>
```

### ConnectionStatus

Visual indicator for WebSocket connection status.

```typescript
interface ConnectionStatusProps {
  state: ConnectionState;
  showLabel?: boolean;
}

type ConnectionState = "connecting" | "connected" | "disconnected" | "error";
```

```tsx
const { connectionState } = useWebSocket({ url: "ws://localhost:8000/ws" });

<ConnectionStatus state={connectionState} showLabel />
```

## Hooks

### useWebSocket

Hook for managing WebSocket connection to the dashboard backend.

```typescript
function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn;

interface UseWebSocketOptions {
  url: string;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onSessionNew?: (data: SessionNewEventData) => void;
  onVerdictComputed?: (data: VerdictComputedEventData) => void;
  onSyncProgress?: (data: SyncProgressEventData) => void;
  onError?: (error: Event) => void;
}

interface UseWebSocketReturn {
  connectionState: ConnectionState;
  lastMessage: WebSocketMessage | null;
  connect: () => void;
  disconnect: () => void;
}
```

**Options:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `url` | string | (required) | WebSocket server URL |
| `reconnect` | boolean | `true` | Auto-reconnect on disconnect |
| `reconnectInterval` | number | `3000` | Milliseconds between reconnect attempts |
| `maxReconnectAttempts` | number | `5` | Maximum reconnect attempts |
| `onSessionNew` | function | - | Callback for new session events |
| `onVerdictComputed` | function | - | Callback for verdict computed events |
| `onSyncProgress` | function | - | Callback for sync progress events |
| `onError` | function | - | Callback for connection errors |

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `connectionState` | ConnectionState | Current connection state |
| `lastMessage` | WebSocketMessage \| null | Most recent message received |
| `connect` | `() => void` | Manually connect |
| `disconnect` | `() => void` | Manually disconnect |

```tsx
const { connectionState, lastMessage } = useWebSocket({
  url: "ws://localhost:8000/ws",
  onSessionNew: (data) => {
    console.log("New session:", data.sessionId);
    refreshSessionList();
  },
  onVerdictComputed: (data) => {
    console.log("Verdict for", data.sessionId, ":", data.verdict);
  },
});
```

## API Client

### DashboardApiClient

API client for dashboard REST endpoints.

```typescript
class DashboardApiClient {
  constructor(config: ApiClientConfig);

  // Session endpoints
  listSessions(page?: number, pageSize?: number, filters?: SessionFilters): Promise<PaginatedResponse<SessionSummary>>;
  getSession(sessionId: string): Promise<SlopitSession>;
  getSessionTrials(sessionId: string): Promise<SlopitTrial[]>;
  getSessionVerdict(sessionId: string): Promise<SessionVerdict>;

  // Analysis endpoints
  getAnalysisSummary(): Promise<AnalysisSummary>;
  getFlagDistribution(): Promise<Record<string, number>>;
  getVerdictDistribution(): Promise<Record<string, number>>;
  triggerBatchAnalysis(sessionIds?: string[]): Promise<{ taskId: string }>;

  // Export endpoints
  exportSessions(options: ExportOptions): Promise<Blob>;

  // JATOS integration
  connectJatos(url: string, token: string): Promise<{ status: string }>;
  listJatosStudies(): Promise<Array<{ id: string; title: string }>>;
  syncJatos(studyId: string): Promise<{ taskId: string }>;
  getJatosStatus(): Promise<{ connected: boolean; url?: string }>;

  // Prolific integration
  connectProlific(token: string): Promise<{ status: string }>;
  listProlificStudies(): Promise<Array<{ id: string; name: string; status: string }>>;
  getProlificRecommendations(studyId: string): Promise<Array<{
    participantId: string;
    sessionId: string;
    verdict: string;
    recommendation: "approve" | "reject" | "review";
  }>>;
}

interface ApiClientConfig {
  baseUrl: string;
  headers?: Record<string, string>;
}
```

### createApiClient

Factory function for creating an API client instance.

```typescript
function createApiClient(baseUrl: string): DashboardApiClient;
```

```typescript
import { createApiClient } from "@slopit/dashboard-ui";

const client = createApiClient("http://localhost:8000/api/v1");

// List sessions with filtering
const sessions = await client.listSessions(1, 20, { verdict: "flagged" });

// Get session details
const session = await client.getSession("abc123");
const trials = await client.getSessionTrials("abc123");
const verdict = await client.getSessionVerdict("abc123");

// Export data
const blob = await client.exportSessions({
  format: "csv",
  includeTrials: true,
  filters: { verdict: "flagged" },
});
```

## Types

### Session Types

```typescript
interface SessionSummary {
  sessionId: string;
  participantId?: string;
  startTime: string;
  endTime?: string;
  trialCount: number;
  verdict?: VerdictType;
  confidence?: number;
  flagCount: number;
}

interface SessionVerdict {
  sessionId: string;
  verdict: VerdictType;
  confidence: number;
  flags: VerdictFlag[];
  analyzedAt: string;
}

type VerdictType = "clean" | "suspicious" | "flagged";
```

### Filter Types

```typescript
interface SessionFilters {
  verdict?: VerdictType;
  minConfidence?: number;
  maxConfidence?: number;
  startDate?: string;
  endDate?: string;
  participantId?: string;
}
```

### Response Types

```typescript
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
```

### Export Types

```typescript
interface ExportOptions {
  format: "csv" | "json";
  includeTrials?: boolean;
  includeMetrics?: boolean;
  filters?: SessionFilters;
}
```

### WebSocket Event Types

```typescript
type WebSocketEventType = "session.new" | "verdict.computed" | "sync.progress";

interface WebSocketMessage<T = unknown> {
  type: WebSocketEventType;
  data: T;
}

interface SessionNewEventData {
  sessionId: string;
  participantId?: string;
  timestamp: string;
}

interface VerdictComputedEventData {
  sessionId: string;
  verdict: VerdictType;
  confidence: number;
  flagCount: number;
}

interface SyncProgressEventData {
  source: "jatos" | "prolific";
  progress: number;
  total: number;
  status: "in_progress" | "completed" | "error";
  message?: string;
}
```

## Web Component

The package exports a custom element `<slopit-dashboard>` for use without React.

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `api-url` | string | `"http://localhost:8000/api/v1"` | Base URL for the API |
| `study-id` | string | - | Study identifier |
| `theme` | `"light" \| "dark" \| "system"` | `"system"` | Color theme |
| `polling-interval` | number | - | Polling interval in milliseconds |
| `enable-websocket` | `"true" \| "false"` | `"true"` | Enable WebSocket updates |

### Usage

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import "@slopit/dashboard-ui/web-component";
  </script>
  <link rel="stylesheet" href="@slopit/dashboard-ui/style.css">
</head>
<body>
  <slopit-dashboard
    api-url="http://localhost:8000/api/v1"
    study-id="my-study"
    theme="dark"
    enable-websocket="true">
  </slopit-dashboard>
</body>
</html>
```

### Shadow DOM

The web component uses Shadow DOM for style isolation. The component injects its own styles into the shadow root, so external stylesheets do not affect the dashboard appearance.

## Integration with Python Backend

The dashboard UI connects to the slopit Python backend API. See the Python package documentation for backend setup.

### Backend Requirements

The dashboard expects the following API endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/sessions` | GET | List sessions with pagination |
| `/sessions/:id` | GET | Get session details |
| `/sessions/:id/trials` | GET | Get session trials |
| `/sessions/:id/verdict` | GET | Get session verdict |
| `/analysis/summary` | GET | Get analysis summary |
| `/analysis/flags` | GET | Get flag distribution |
| `/ws` | WebSocket | Real-time updates |

### CORS Configuration

When running the dashboard on a different origin than the API, configure CORS on the backend:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Example: Custom Dashboard Page

```tsx
import { useState, useEffect } from "react";
import {
  createApiClient,
  useWebSocket,
  SessionList,
  SessionDetail,
  AnalysisSummary,
  ConnectionStatus,
  type AnalysisSummaryData,
} from "@slopit/dashboard-ui";
import "@slopit/dashboard-ui/style.css";

const API_URL = "http://localhost:8000/api/v1";

function CustomDashboard() {
  const client = createApiClient(API_URL);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [summary, setSummary] = useState<AnalysisSummaryData | null>(null);

  const { connectionState } = useWebSocket({
    url: "ws://localhost:8000/ws",
    onSessionNew: () => loadSummary(),
    onVerdictComputed: () => loadSummary(),
  });

  const loadSummary = async () => {
    const data = await client.getAnalysisSummary();
    setSummary(data);
  };

  useEffect(() => {
    loadSummary();
  }, []);

  return (
    <div>
      <header>
        <h1>My Study Dashboard</h1>
        <ConnectionStatus state={connectionState} />
      </header>

      {summary && <AnalysisSummary summary={summary} />}

      {selectedSession ? (
        <SessionDetail
          apiClient={client}
          sessionId={selectedSession}
          onBack={() => setSelectedSession(null)}
        />
      ) : (
        <SessionList
          apiClient={client}
          onSessionSelect={setSelectedSession}
        />
      )}
    </div>
  );
}
```

## CSS Customization

The dashboard uses CSS custom properties for theming. Override these in your stylesheet:

```css
.slopit-dashboard-root {
  --slopit-bg: #ffffff;
  --slopit-bg-secondary: #f8f9fa;
  --slopit-text: #212529;
  --slopit-text-secondary: #6c757d;
  --slopit-border: #dee2e6;
  --slopit-primary: #0d6efd;
  --slopit-clean: #28a745;
  --slopit-suspicious: #ffc107;
  --slopit-flagged: #dc3545;
  --slopit-space-sm: 0.5rem;
  --slopit-space-md: 1rem;
  --slopit-radius-sm: 0.25rem;
  --slopit-radius-md: 0.375rem;
}

/* Dark theme overrides */
[data-theme="dark"] .slopit-dashboard-root {
  --slopit-bg: #1a1a1a;
  --slopit-bg-secondary: #2d2d2d;
  --slopit-text: #f8f9fa;
  --slopit-border: #495057;
}
```

## Exports Summary

### Components

- `Dashboard`: Main dashboard with all features
- `SessionList`: Paginated session table
- `SessionDetail`: Single session view
- `AnalysisSummary`: Statistics cards
- `VerdictBadge`: Verdict status badge
- `FlagList`: Flag listing with severity
- `TrialTimeline`: Trial visualization
- `ConfidenceHistogram`: Confidence distribution chart
- `FlagDistribution`: Flag type bar chart
- `ConnectionStatus`: WebSocket status indicator

### Hooks

- `useWebSocket`: WebSocket connection management

### API Client

- `DashboardApiClient`: REST API client class
- `createApiClient()`: Factory function

### Types

All component props types are exported:

- `DashboardProps`, `DashboardConfig`
- `SessionListProps`, `SessionDetailProps`
- `AnalysisSummaryProps`, `VerdictBadgeProps`
- `FlagListProps`, `TrialTimelineProps`
- `ConfidenceHistogramProps`, `FlagDistributionProps`
- `ConnectionStatusProps`
- `UseWebSocketOptions`, `UseWebSocketReturn`, `ConnectionState`
- `ApiClientConfig`
- `VerdictType`, `SessionVerdict`, `VerdictFlag`
- `SessionSummary`, `SessionFilters`
- `PaginatedResponse`, `ExportOptions`
- `WebSocketEventType`, `WebSocketMessage`
- `SessionNewEventData`, `VerdictComputedEventData`, `SyncProgressEventData`
- `AnalysisSummaryData` (renamed from `AnalysisSummary` to avoid component name conflict)
