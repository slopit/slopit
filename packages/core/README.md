# @slopit/core

Core type definitions, schemas, and utilities for the slopit behavioral capture toolkit.

## Installation

```bash
pnpm add @slopit/core
```

## Quick Start

```typescript
import {
  generateSessionId,
  hashText,
  validateSession,
  captureEnvironment,
} from "@slopit/core";

// generate unique identifiers
const sessionId = generateSessionId();

// hash sensitive text
const hash = await hashText("user input text");

// capture browser environment
const env = captureEnvironment();

// validate session data
const result = validateSession(sessionData);
if (!result.success) {
  console.error("Validation errors:", result.errors);
}
```

## Type Definitions

### Session Types

#### SlopitSession

The top-level container for all data from a research session.

```typescript
interface SlopitSession {
  schemaVersion: string;
  sessionId: string;
  participantId?: string;
  studyId?: string;
  platform: PlatformInfo;
  environment: EnvironmentInfo;
  timing: SessionTiming;
  trials: SlopitTrial[];
  globalEvents: GlobalEvents;
}
```

#### SlopitTrial

Data for a single trial within a session.

```typescript
interface SlopitTrial {
  trialId: string;
  trialIndex: number;
  trialType: string;
  startTime: number;
  endTime: number;
  rt: number;
  stimulus?: StimulusInfo;
  response?: ResponseInfo;
  behavioral?: BehavioralData;
  captureFlags?: CaptureFlag[];
  platformData?: Record<string, unknown>;
}
```

#### PlatformInfo

Information about the experiment platform.

```typescript
interface PlatformInfo {
  name: string;           // e.g., "jspsych"
  version: string;        // platform version
  adapterVersion: string; // slopit adapter version
}
```

#### EnvironmentInfo

Browser and system environment data.

```typescript
interface EnvironmentInfo {
  userAgent: string;
  language: string;
  platform: string;
  screenWidth: number;
  screenHeight: number;
  windowWidth: number;
  windowHeight: number;
  devicePixelRatio: number;
  timezone: string;
  timezoneOffset: number;
}
```

#### SessionTiming

Timing information for the session.

```typescript
interface SessionTiming {
  startTime: number;  // Unix timestamp in milliseconds
  endTime: number;    // Unix timestamp in milliseconds
  duration: number;   // Total duration in milliseconds
}
```

### Behavioral Event Types

#### KeystrokeEvent

A single keystroke event.

| Field | Type | Description |
|-------|------|-------------|
| time | number | Time since trial start in milliseconds |
| key | string | Key value from KeyboardEvent.key (e.g., "a", "Enter", "Backspace") |
| code | string | Physical key code from KeyboardEvent.code (e.g., "KeyA", "Enter") |
| event | "keydown" \| "keyup" | Event type |
| textLength | number? | Current text length at this moment |
| modifiers | ModifierState? | Modifier key states |

#### ModifierState

Modifier key states at time of keystroke.

```typescript
interface ModifierState {
  shift: boolean;
  ctrl: boolean;
  alt: boolean;
  meta: boolean;
}
```

#### FocusEvent

A focus or visibility change event.

| Field | Type | Description |
|-------|------|-------------|
| time | number | Time since trial start in milliseconds |
| event | "focus" \| "blur" \| "visibilitychange" | Event type |
| visibility | "visible" \| "hidden"? | For visibilitychange events, the new state |
| blurDuration | number? | For blur events, duration until refocus (filled retrospectively) |

#### PasteEvent

A paste event.

| Field | Type | Description |
|-------|------|-------------|
| time | number | Time since trial start in milliseconds |
| textLength | number | Length of pasted text in characters |
| textPreview | string? | First N characters of pasted text (default N=100) |
| textHash | string? | SHA-256 hash of full pasted text |
| precedingKeystrokes | number | Number of keystrokes in preceding 2 seconds |
| blocked | boolean | Whether paste was blocked by configuration |

#### MouseEvent

A mouse event.

| Field | Type | Description |
|-------|------|-------------|
| time | number | Time since trial start in milliseconds |
| event | "mousemove" \| "mousedown" \| "mouseup" \| "click" | Event type |
| x | number | X coordinate relative to viewport |
| y | number | Y coordinate relative to viewport |
| velocity | number? | Velocity in pixels per millisecond (for mousemove) |
| distance | number? | Distance traveled since last event in pixels |
| deltaTime | number? | Time since last mouse event in milliseconds |
| isDragging | boolean? | Whether this event is part of a drag operation |

#### ScrollEvent

A scroll event.

| Field | Type | Description |
|-------|------|-------------|
| time | number | Time since trial start in milliseconds |
| direction | "up" \| "down" | Direction of scroll |
| deltaY | number | Scroll delta in pixels |
| scrollTop | number | Current scroll position from top |
| scrollHeight | number | Scrollable element height |
| clientHeight | number | Viewport height |
| velocity | number? | Velocity in pixels per millisecond |

#### ClipboardCopyEvent

A clipboard copy or cut event.

| Field | Type | Description |
|-------|------|-------------|
| time | number | Time since trial start in milliseconds |
| event | "copy" \| "cut" | Event type |
| textLength | number | Length of selected text |
| textPreview | string? | First N characters of copied text |
| textHash | string? | SHA-256 hash of copied text |
| selectionStart | number? | Selection start index in input element |
| selectionEnd | number? | Selection end index in input element |

#### InputDurationEvent

An input duration event tracking focus sessions.

| Field | Type | Description |
|-------|------|-------------|
| focusTime | number | Time since trial start when focus was gained |
| blurTime | number | Time since trial start when focus was lost |
| duration | number | Duration focused in milliseconds |
| elementId | string? | Element identifier (id or name attribute) |
| keystrokesDuringFocus | number? | Number of keystrokes during focus |
| pastesDuringFocus | number? | Number of paste events during focus |

### Behavioral Metrics Types

#### BehavioralData

Container for all behavioral capture data.

```typescript
interface BehavioralData {
  keystrokes?: KeystrokeEvent[];
  focus?: FocusEvent[];
  paste?: PasteEvent[];
  mouse?: MouseEvent[];
  scroll?: ScrollEvent[];
  clipboard?: ClipboardCopyEvent[];
  inputDuration?: InputDurationEvent[];
  metrics?: BehavioralMetrics;
}
```

#### BehavioralMetrics

Computed metrics from behavioral data.

```typescript
interface BehavioralMetrics {
  keystroke?: KeystrokeMetrics;
  focus?: FocusMetrics;
  timing?: TimingMetrics;
  mouse?: MouseMetrics;
  scroll?: ScrollMetrics;
  inputDuration?: InputDurationMetrics;
}
```

#### KeystrokeMetrics

Metrics computed from keystroke data.

| Field | Type | Description |
|-------|------|-------------|
| totalKeystrokes | number | Total number of keystrokes |
| printableKeystrokes | number | Number of printable character keystrokes |
| deletions | number | Number of deletion keystrokes (Backspace, Delete) |
| meanIKI | number | Mean inter-keystroke interval in milliseconds |
| stdIKI | number | Standard deviation of IKI |
| medianIKI | number | Median IKI |
| pauseCount | number | Number of pauses (IKI > threshold) |
| productProcessRatio | number | Ratio of final characters to total keystrokes |

#### FocusMetrics

Metrics computed from focus data.

| Field | Type | Description |
|-------|------|-------------|
| blurCount | number | Number of blur events |
| totalBlurDuration | number | Total time in milliseconds with window blurred |
| hiddenCount | number | Number of visibility hidden events |
| totalHiddenDuration | number | Total time in milliseconds with document hidden |

#### TimingMetrics

Timing metrics.

| Field | Type | Description |
|-------|------|-------------|
| firstKeystrokeLatency | number? | Time from trial start to first keystroke |
| totalResponseTime | number | Time from trial start to response submission |
| charactersPerMinute | number? | Characters per minute (excluding deletions) |

#### MouseMetrics

Metrics computed from mouse data.

| Field | Type | Description |
|-------|------|-------------|
| totalEvents | number | Total number of mouse events |
| clickCount | number | Number of click events |
| meanVelocity | number | Mean mouse velocity in pixels per millisecond |
| totalDistance | number | Total distance traveled by cursor in pixels |
| totalIdleTime | number | Total idle time with no mouse movement |
| idlePeriodCount | number | Number of idle periods exceeding threshold |

#### ScrollMetrics

Metrics computed from scroll data.

| Field | Type | Description |
|-------|------|-------------|
| totalScrollEvents | number | Total number of scroll events |
| totalScrollDistance | number | Total scroll distance in pixels |
| directionChanges | number | Number of scroll direction changes |
| meanScrollVelocity | number | Mean scroll velocity |
| upDownRatio | number | Time spent scrolling up vs down ratio |

#### InputDurationMetrics

Metrics computed from input duration data.

| Field | Type | Description |
|-------|------|-------------|
| totalFocusDuration | number | Total focus duration across all inputs |
| meanFocusDuration | number | Mean focus duration per input session |
| focusSessionCount | number | Number of focus sessions |
| maxFocusDuration | number | Longest single focus session |

### Flag Types

#### CaptureFlag

Flag generated during data capture.

```typescript
interface CaptureFlag {
  type: string;                      // Flag type identifier
  severity: Severity;                // "info" | "low" | "medium" | "high"
  message: string;                   // Human-readable description
  timestamp: number;                 // Timestamp when flag was generated
  details?: Record<string, unknown>; // Additional details
}
```

#### AnalysisFlag

Flag generated during server-side analysis.

```typescript
interface AnalysisFlag {
  type: string;                      // Flag type identifier
  analyzer: string;                  // Analyzer that generated this flag
  severity: Severity;                // "info" | "low" | "medium" | "high"
  message: string;                   // Human-readable description
  confidence?: number;               // Confidence score (0.0 to 1.0)
  evidence?: Record<string, unknown>;// Evidence supporting this flag
  trialIds?: string[];               // Related trial IDs if trial-specific
}
```

#### Severity

Severity level for flags.

```typescript
type Severity = "info" | "low" | "medium" | "high";
```

## Validation

### validateSession

Validates a session object against the schema.

```typescript
import { validateSession } from "@slopit/core";

const result = validateSession(sessionData);

if (result.success) {
  console.log("Session is valid");
} else {
  console.error("Validation errors:", result.errors);
}
```

### isValidSession

Type guard for checking session validity.

```typescript
import { isValidSession } from "@slopit/core";

if (isValidSession(data)) {
  // data is typed as SlopitSession
  console.log(data.sessionId);
}
```

### Zod Schemas

The package exports Zod schemas for all types.

```typescript
import {
  SlopitSessionSchema,
  SlopitTrialSchema,
  BehavioralDataSchema,
  KeystrokeEventSchema,
  FocusEventSchema,
  PasteEventSchema,
  CaptureFlagSchema,
  AnalysisFlagSchema,
} from "@slopit/core";

// parse and validate data
const keystroke = KeystrokeEventSchema.parse(rawData);

// safe parse with error handling
const result = SlopitTrialSchema.safeParse(trialData);
if (!result.success) {
  console.error(result.error.issues);
}
```

## Utility Functions

### ID Generation

#### generateSessionId

Generates a unique session identifier.

```typescript
import { generateSessionId } from "@slopit/core";

const id = generateSessionId();
// Returns: "session_1706123456789_a1b2c3d4"
```

#### generateTrialId

Generates a unique trial identifier.

```typescript
import { generateTrialId } from "@slopit/core";

const id = generateTrialId();
// Returns: "trial_1706123456789_e5f6g7h8"
```

### Hashing

#### hashText

Computes SHA-256 hash of text using Web Crypto API.

```typescript
import { hashText } from "@slopit/core";

const hash = await hashText("Hello, world!");
// Returns: "315f5bdb76d078c43b8ac0064e4a0164612b1fce77c869345bfc94c75894edd3"
```

#### simpleHash

Synchronous simple hash for non-cryptographic purposes.

```typescript
import { simpleHash } from "@slopit/core";

const hash = simpleHash("Hello, world!");
// Returns: "0a1b2c3d" (8-character hex string)
```

### Timing

#### now

Returns current Unix timestamp in milliseconds.

```typescript
import { now } from "@slopit/core";

const timestamp = now();
// Returns: 1706123456789
```

#### highResTime

Returns high-resolution timestamp for performance measurement.

```typescript
import { highResTime } from "@slopit/core";

const start = highResTime();
// ... do work
const elapsed = highResTime() - start;
```

#### duration

Calculates duration between two timestamps.

```typescript
import { duration } from "@slopit/core";

const elapsed = duration(startTime);        // from startTime to now
const elapsed = duration(startTime, endTime); // from startTime to endTime
```

#### formatDuration

Formats a duration in human-readable format.

```typescript
import { formatDuration } from "@slopit/core";

formatDuration(65000);    // "1m 5s"
formatDuration(3661000);  // "1h 1m 1s"
formatDuration(500);      // "500ms"
```

#### toTimestamp / fromTimestamp

Converts between Date objects and Unix timestamps.

```typescript
import { toTimestamp, fromTimestamp } from "@slopit/core";

const timestamp = toTimestamp(new Date());
const date = fromTimestamp(1706123456789);
```

### Environment

#### captureEnvironment

Captures browser and system environment information.

```typescript
import { captureEnvironment } from "@slopit/core";

const env = captureEnvironment();
/*
{
  userAgent: "Mozilla/5.0 ...",
  language: "en-US",
  platform: "MacIntel",
  screenWidth: 2560,
  screenHeight: 1440,
  windowWidth: 1920,
  windowHeight: 1080,
  devicePixelRatio: 2,
  timezone: "America/New_York",
  timezoneOffset: -300
}
*/
```

## Constants

```typescript
import {
  SCHEMA_VERSION,
  DEFAULT_CONFIG,
  SEVERITY_LEVELS,
  KNOWN_PLATFORMS,
} from "@slopit/core";

console.log(SCHEMA_VERSION);    // "1.0.0"
console.log(SEVERITY_LEVELS);   // ["info", "low", "medium", "high"]
console.log(KNOWN_PLATFORMS);   // ["jspsych", "pavlovia", "gorilla", ...]
```

## Package Exports

The package provides multiple entry points:

```typescript
// main entry point with all exports
import { ... } from "@slopit/core";

// schemas only
import { ... } from "@slopit/core/schemas";

// validation only
import { ... } from "@slopit/core/validation";
```

## License

MIT
