# @slopit/dashboard-ui

React components for the slopit behavioral analytics dashboard. Displays session data, analysis verdicts, and flags from the Python backend. Can be used as React components in a React application or as a standalone Web Component in any HTML page.

## Installation

```bash
pnpm add @slopit/dashboard-ui
```

For React applications, ensure you have React 18 or 19 installed:

```bash
pnpm add react react-dom
```

## Quick Start

### React Application

```tsx
import { Dashboard } from "@slopit/dashboard-ui";
import "@slopit/dashboard-ui/style.css";

function App() {
  return (
    <Dashboard
      config={{
        apiUrl: "http://localhost:8000/api/v1",
        enableWebSocket: true,
        theme: "system",
      }}
    />
  );
}
```

### Web Component (Standalone HTML)

```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="https://unpkg.com/@slopit/dashboard-ui/dist/slopit-dashboard.css" />
    <script type="module" src="https://unpkg.com/@slopit/dashboard-ui/dist/slopit-dashboard.js"></script>
  </head>
  <body>
    <slopit-dashboard
      api-url="http://localhost:8000/api/v1"
      theme="dark"
      enable-websocket="true">
    </slopit-dashboard>
  </body>
</html>
```

## Features

- Session list with filtering and pagination
- Detailed session view with trial timeline
- Verdict badges (clean, suspicious, flagged)
- Flag list with severity indicators
- Analytics charts (flag distribution, confidence histogram)
- Real-time updates via WebSocket
- Light and dark theme support
- Web Component wrapper for non-React applications

## React Components

### Dashboard

The main dashboard component that combines all subcomponents. Provides navigation between session list and analytics views.

```tsx
import { Dashboard } from "@slopit/dashboard-ui";

<Dashboard
  config={{
    apiUrl: "http://localhost:8000/api/v1",
    studyId: "my-study",
    theme: "dark",
    pollingInterval: 30000,
    enableWebSocket: true,
  }}
/>;
```

#### DashboardConfig

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| apiUrl | `string` | required | Base URL for the dashboard API |
| studyId | `string` | `undefined` | Optional study ID to display |
| theme | `"light" \| "dark" \| "system"` | `"system"` | Color theme |
| pollingInterval | `number` | `undefined` | Polling interval in milliseconds |
| enableWebSocket | `boolean` | `true` | Enable real-time WebSocket updates |

### SessionList

Table displaying sessions with verdict badges, pagination, and filtering.

```tsx
import { SessionList, createApiClient } from "@slopit/dashboard-ui";

const client = createApiClient("http://localhost:8000/api/v1");

<SessionList
  apiClient={client}
  onSessionSelect={(sessionId) => console.log("Selected:", sessionId)}
  filters={{ verdict: "suspicious" }}
  pageSize={20}
/>;
```

#### SessionListProps

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| apiClient | `DashboardApiClient` | required | API client instance |
| onSessionSelect | `(sessionId: string) => void` | `undefined` | Callback when a session row is clicked |
| filters | `SessionFilters` | `undefined` | Filter options for the list |
| pageSize | `number` | `20` | Number of sessions per page |

### SessionDetail

Detailed view of a single session with tabs for trials, flags, and raw data.

```tsx
import { SessionDetail, createApiClient } from "@slopit/dashboard-ui";

const client = createApiClient("http://localhost:8000/api/v1");

<SessionDetail
  apiClient={client}
  sessionId="abc123"
  onBack={() => navigate("/sessions")}
/>;
```

#### SessionDetailProps

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| apiClient | `DashboardApiClient` | required | API client instance |
| sessionId | `string` | required | ID of the session to display |
| onBack | `() => void` | `undefined` | Callback for back button |

### TrialTimeline

Timeline view of trials with expandable behavioral data sections.

```tsx
import { TrialTimeline } from "@slopit/dashboard-ui";

<TrialTimeline
  trials={session.trials}
  onTrialSelect={(index) => console.log("Selected trial:", index)}
/>;
```

#### TrialTimelineProps

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| trials | `SlopitTrial[]` | required | Array of trial objects |
| onTrialSelect | `(trialIndex: number) => void` | `undefined` | Callback when a trial is expanded |

### VerdictBadge

Badge displaying the verdict status with optional confidence score.

```tsx
import { VerdictBadge } from "@slopit/dashboard-ui";

<VerdictBadge verdict="suspicious" confidence={0.75} showConfidence />;
```

#### VerdictBadgeProps

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| verdict | `"clean" \| "suspicious" \| "flagged"` | required | Verdict type to display |
| confidence | `number` | `undefined` | Confidence score (0 to 1) |
| showConfidence | `boolean` | `false` | Show confidence percentage |
| className | `string` | `""` | Additional CSS class |

### FlagList

List of analysis flags with severity indicators.

```tsx
import { FlagList } from "@slopit/dashboard-ui";

<FlagList flags={verdict.flags} groupByAnalyzer />;
```

#### FlagListProps

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| flags | `VerdictFlag[]` | required | Array of flag objects |
| groupByAnalyzer | `boolean` | `false` | Group flags by their analyzer |

### FlagDistribution

Horizontal bar chart showing the distribution of flag types.

```tsx
import { FlagDistribution } from "@slopit/dashboard-ui";

<FlagDistribution
  distribution={{
    paste_detected: 15,
    excessive_blur: 8,
    timing_anomaly: 3,
  }}
  title="Flag Distribution"
/>;
```

#### FlagDistributionProps

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| distribution | `Record<string, number>` | required | Map of flag type to count |
| title | `string` | `undefined` | Optional chart title |

### ConfidenceHistogram

Histogram showing the distribution of confidence scores.

```tsx
import { ConfidenceHistogram } from "@slopit/dashboard-ui";

<ConfidenceHistogram
  scores={[0.2, 0.4, 0.6, 0.8, 0.95]}
  bins={10}
  title="Confidence Distribution"
/>;
```

#### ConfidenceHistogramProps

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| scores | `number[]` | required | Array of confidence scores (0 to 1) |
| bins | `number` | `10` | Number of histogram bins |
| title | `string` | `undefined` | Optional chart title |

### ConnectionStatus

Visual indicator for WebSocket connection status.

```tsx
import { ConnectionStatus, useWebSocket } from "@slopit/dashboard-ui";

const { connectionState } = useWebSocket({ url: "ws://localhost:8000/ws" });

<ConnectionStatus state={connectionState} showLabel />;
```

#### ConnectionStatusProps

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| state | `"connecting" \| "connected" \| "disconnected" \| "error"` | required | Connection state |
| showLabel | `boolean` | `true` | Show text label next to indicator |

### AnalysisSummary

Summary cards showing overall analysis statistics.

```tsx
import { AnalysisSummary } from "@slopit/dashboard-ui";

<AnalysisSummary
  summary={{
    totalSessions: 150,
    analyzedSessions: 142,
    verdictDistribution: { clean: 100, suspicious: 30, flagged: 12 },
    flagDistribution: { paste_detected: 25, timing_anomaly: 18 },
    averageConfidence: 0.78,
  }}
/>;
```

#### AnalysisSummaryProps

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| summary | `AnalysisSummary` | required | Analysis summary data object |

## Web Component

The `<slopit-dashboard>` custom element wraps the React Dashboard component for use in non-React applications. It uses Shadow DOM for style isolation.

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| api-url | `string` | `"http://localhost:8000/api/v1"` | Base URL for the dashboard API |
| study-id | `string` | `undefined` | Optional study ID to display |
| theme | `"light" \| "dark" \| "system"` | `"system"` | Color theme |
| polling-interval | `number` | `undefined` | Polling interval in milliseconds |
| enable-websocket | `"true" \| "false"` | `"true"` | Enable real-time WebSocket updates |

### Example

```html
<slopit-dashboard
  api-url="http://localhost:8000/api/v1"
  study-id="experiment-1"
  theme="dark"
  polling-interval="30000"
  enable-websocket="true">
</slopit-dashboard>
```

### Dynamic Attribute Updates

Attributes can be updated dynamically and the component will re-render:

```javascript
const dashboard = document.querySelector("slopit-dashboard");
dashboard.setAttribute("theme", "light");
dashboard.setAttribute("study-id", "new-study");
```

## API Client

The `DashboardApiClient` class provides methods for interacting with the slopit backend REST API.

### Creating a Client

```typescript
import { createApiClient, DashboardApiClient } from "@slopit/dashboard-ui";

// using factory function
const client = createApiClient("http://localhost:8000/api/v1");

// using constructor
const client = new DashboardApiClient({
  baseUrl: "http://localhost:8000/api/v1",
  headers: { Authorization: "Bearer token" },
});
```

### Session Methods

```typescript
// list sessions with pagination and filters
const response = await client.listSessions(1, 20, {
  verdict: "suspicious",
  minConfidence: 0.5,
  startDate: "2024-01-01",
});
// returns: PaginatedResponse<SessionSummary>

// get a single session
const session = await client.getSession("session-id");
// returns: SlopitSession

// get trials for a session
const trials = await client.getSessionTrials("session-id");
// returns: SlopitTrial[]

// get verdict for a session
const verdict = await client.getSessionVerdict("session-id");
// returns: SessionVerdict
```

### Analysis Methods

```typescript
// get summary statistics
const summary = await client.getAnalysisSummary();
// returns: AnalysisSummary

// get flag distribution
const flags = await client.getFlagDistribution();
// returns: Record<string, number>

// get verdict distribution
const verdicts = await client.getVerdictDistribution();
// returns: Record<string, number>

// trigger batch analysis
const task = await client.triggerBatchAnalysis(["session-1", "session-2"]);
// returns: { taskId: string }
```

### Export Methods

```typescript
// export sessions to CSV or JSON
const blob = await client.exportSessions({
  format: "csv",
  includeTrials: true,
  includeMetrics: true,
  filters: { verdict: "flagged" },
});

// download the blob
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = "sessions.csv";
a.click();
```

### JATOS Integration

```typescript
// connect to JATOS
await client.connectJatos("https://jatos.example.com", "api-token");

// list available studies
const studies = await client.listJatosStudies();
// returns: Array<{ id: string; title: string }>

// sync study results
const task = await client.syncJatos("study-id");
// returns: { taskId: string }

// check connection status
const status = await client.getJatosStatus();
// returns: { connected: boolean; url?: string }
```

### Prolific Integration

```typescript
// connect to Prolific
await client.connectProlific("api-token");

// list studies
const studies = await client.listProlificStudies();
// returns: Array<{ id: string; name: string; status: string }>

// get participant recommendations
const recommendations = await client.getProlificRecommendations("study-id");
// returns: Array<{ participantId, sessionId, verdict, recommendation }>
```

## WebSocket Hook

The `useWebSocket` hook manages a WebSocket connection to the backend for real-time updates.

### Basic Usage

```tsx
import { useWebSocket } from "@slopit/dashboard-ui";

function MyComponent() {
  const { connectionState, lastMessage, connect, disconnect } = useWebSocket({
    url: "ws://localhost:8000/ws",
    onSessionNew: (data) => {
      console.log("New session:", data.sessionId);
    },
    onVerdictComputed: (data) => {
      console.log("Verdict computed:", data.verdict, data.confidence);
    },
    onSyncProgress: (data) => {
      console.log(`Sync progress: ${data.progress}/${data.total}`);
    },
  });

  return (
    <div>
      <p>Status: {connectionState}</p>
      <button onClick={disconnect}>Disconnect</button>
    </div>
  );
}
```

### UseWebSocketOptions

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| url | `string` | required | WebSocket server URL |
| reconnect | `boolean` | `true` | Automatically reconnect on disconnect |
| reconnectInterval | `number` | `3000` | Milliseconds between reconnect attempts |
| maxReconnectAttempts | `number` | `5` | Maximum reconnection attempts |
| onSessionNew | `(data: SessionNewEventData) => void` | `undefined` | Callback for new session events |
| onVerdictComputed | `(data: VerdictComputedEventData) => void` | `undefined` | Callback for verdict events |
| onSyncProgress | `(data: SyncProgressEventData) => void` | `undefined` | Callback for sync progress events |
| onError | `(error: Event) => void` | `undefined` | Callback for connection errors |

### UseWebSocketReturn

| Property | Type | Description |
|----------|------|-------------|
| connectionState | `"connecting" \| "connected" \| "disconnected" \| "error"` | Current connection state |
| lastMessage | `WebSocketMessage \| null` | Most recent message received |
| connect | `() => void` | Manually initiate connection |
| disconnect | `() => void` | Close connection and stop reconnection |

## Types

### VerdictType

```typescript
type VerdictType = "clean" | "suspicious" | "flagged";
```

### SessionVerdict

```typescript
interface SessionVerdict {
  sessionId: string;
  verdict: VerdictType;
  confidence: number;
  flags: VerdictFlag[];
  analyzedAt: string;
}
```

### VerdictFlag

```typescript
interface VerdictFlag {
  type: string;
  severity: "low" | "medium" | "high";
  message: string;
  analyzer: string;
  trialIndex?: number;
}
```

### SessionSummary

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
```

### SessionFilters

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

### AnalysisSummary

```typescript
interface AnalysisSummary {
  totalSessions: number;
  analyzedSessions: number;
  verdictDistribution: Record<VerdictType, number>;
  flagDistribution: Record<string, number>;
  averageConfidence: number;
}
```

### PaginatedResponse

```typescript
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
```

## Theming

The dashboard supports light and dark themes via CSS custom properties.

### Theme Selection

Set the theme via the `theme` config option:

```tsx
// react
<Dashboard config={{ apiUrl: "...", theme: "dark" }} />

// web component
<slopit-dashboard api-url="..." theme="dark"></slopit-dashboard>
```

Available values:
- `"light"`: Light theme
- `"dark"`: Dark theme
- `"system"`: Follow system preference (default)

### CSS Custom Properties

Override theme variables for custom styling:

```css
:root {
  /* background colors */
  --slopit-bg: #ffffff;
  --slopit-bg-secondary: #f8f9fa;
  --slopit-bg-tertiary: #e9ecef;

  /* text colors */
  --slopit-text: #212529;
  --slopit-text-secondary: #6c757d;

  /* border */
  --slopit-border: #dee2e6;

  /* verdict colors */
  --slopit-clean: #28a745;
  --slopit-clean-bg: #d4edda;
  --slopit-suspicious: #ffc107;
  --slopit-suspicious-bg: #fff3cd;
  --slopit-flagged: #dc3545;
  --slopit-flagged-bg: #f8d7da;

  /* interactive */
  --slopit-primary: #0d6efd;
  --slopit-primary-hover: #0b5ed7;

  /* spacing */
  --slopit-space-xs: 0.25rem;
  --slopit-space-sm: 0.5rem;
  --slopit-space-md: 1rem;
  --slopit-space-lg: 1.5rem;

  /* border radius */
  --slopit-radius-sm: 0.25rem;
  --slopit-radius-md: 0.375rem;
  --slopit-radius-lg: 0.5rem;
}
```

## Integration with Python Backend

The dashboard is designed to work with the slopit Python FastAPI backend.

### Backend Setup

```python
from slopit.dashboard import create_dashboard_app

app = create_dashboard_app(
    database_url="sqlite:///./slopit.db",
    cors_origins=["http://localhost:3000"],
)

# run with: uvicorn main:app --reload
```

### Serving the Web Component

The Python package includes the built Web Component assets. Serve them from your FastAPI app:

```python
from fastapi.staticfiles import StaticFiles
from slopit.dashboard import get_static_path

app.mount("/static", StaticFiles(directory=get_static_path()), name="static")
```

Then include in your HTML:

```html
<link rel="stylesheet" href="/static/slopit-dashboard.css" />
<script type="module" src="/static/slopit-dashboard.js"></script>

<slopit-dashboard api-url="/api/v1"></slopit-dashboard>
```

### CORS Configuration

If running the frontend on a different port, configure CORS:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### WebSocket Endpoint

The backend exposes a WebSocket endpoint at `/ws` for real-time updates:

```python
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    # send events for new sessions, computed verdicts, sync progress
```

## License

MIT
