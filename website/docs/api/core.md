---
sidebar_position: 2
---

# @slopit/core API Reference

The core package provides shared types, schemas, validation, and utilities used by all slopit packages.

## Installation

```bash
pnpm add @slopit/core
```

## Types

### Session Types

#### SlopitSession

Root container for a participant session. Contains all behavioral data, responses, and metadata collected during a single study session.

```typescript
interface SlopitSession {
  schemaVersion: "1.0";
  sessionId: string;
  participantId?: string;
  studyId?: string;
  platform: PlatformInfo;
  environment: EnvironmentInfo;
  timing: SessionTiming;
  trials: SlopitTrial[];
  globalEvents: GlobalEvents;
  metadata?: Record<string, unknown>;
}
```

#### SlopitTrial

Data for a single trial.

```typescript
interface SlopitTrial {
  trialId: string;
  trialIndex: number;
  trialType?: string;
  startTime: number;
  endTime: number;
  rt?: number;
  stimulus?: StimulusInfo;
  response?: ResponseInfo;
  behavioral?: BehavioralData;
  platformData?: Record<string, unknown>;
  captureFlags?: CaptureFlag[];
}
```

#### PlatformInfo

Information about the experiment platform.

```typescript
interface PlatformInfo {
  name: string;      // "jspsych", "labjs", "psychojs", "gorilla", "qualtrics", "custom"
  version?: string;
  adapterVersion?: string;
}
```

#### EnvironmentInfo

Client environment information captured at session start.

```typescript
interface EnvironmentInfo {
  userAgent: string;
  screenResolution: [width: number, height: number];
  viewportSize: [width: number, height: number];
  devicePixelRatio: number;
  timezone: string;         // IANA identifier, e.g., "America/New_York"
  language: string;         // e.g., "en-US"
  touchCapable: boolean;
  connectionType?: string;  // From Navigator.connection API
}
```

#### SessionTiming

Session-level timing information.

```typescript
interface SessionTiming {
  startTime: number;   // Unix timestamp in milliseconds
  endTime?: number;    // Undefined if session incomplete
  duration?: number;   // Computed as endTime - startTime
}
```

### Behavioral Types

#### BehavioralData

Container for all behavioral capture data.

```typescript
interface BehavioralData {
  keystrokes?: KeystrokeEvent[];
  focus?: FocusEvent[];
  paste?: PasteEvent[];
  mouse?: MouseEvent[];
  metrics?: BehavioralMetrics;
}
```

#### KeystrokeEvent

A single keystroke event.

```typescript
interface KeystrokeEvent {
  time: number;           // Time since trial start (ms)
  key: string;            // KeyboardEvent.key (e.g., "a", "Enter")
  code: string;           // KeyboardEvent.code (e.g., "KeyA", "Enter")
  event: "keydown" | "keyup";
  textLength?: number;    // Current text length
  modifiers?: ModifierState;
}

interface ModifierState {
  shift: boolean;
  ctrl: boolean;
  alt: boolean;
  meta: boolean;
}
```

#### FocusEvent

A focus or visibility change event.

```typescript
interface FocusEvent {
  time: number;
  event: "focus" | "blur" | "visibilitychange";
  visibility?: "visible" | "hidden";
  blurDuration?: number;  // Filled when focus returns
}
```

#### PasteEvent

A paste event.

```typescript
interface PasteEvent {
  time: number;
  textLength: number;
  textPreview?: string;      // First N characters
  textHash?: string;         // SHA-256 hash
  precedingKeystrokes: number;
  blocked: boolean;
}
```

#### BehavioralMetrics

Computed metrics from behavioral data.

```typescript
interface BehavioralMetrics {
  keystroke?: KeystrokeMetrics;
  focus?: FocusMetrics;
  timing?: TimingMetrics;
}

interface KeystrokeMetrics {
  totalKeystrokes: number;
  printableKeystrokes: number;
  deletions: number;
  meanIKI: number;
  stdIKI: number;
  medianIKI: number;
  pauseCount: number;
  productProcessRatio: number;
}

interface FocusMetrics {
  blurCount: number;
  totalBlurDuration: number;
  hiddenCount: number;
  totalHiddenDuration: number;
}

interface TimingMetrics {
  firstKeystrokeLatency?: number;
  totalResponseTime: number;
  charactersPerMinute?: number;
}
```

### Flag Types

#### CaptureFlag

Flag generated during data capture.

```typescript
interface CaptureFlag {
  type: string;
  severity: Severity;
  message: string;
  timestamp: number;
  details?: Record<string, unknown>;
}

type Severity = "info" | "low" | "medium" | "high";
```

#### AnalysisFlag

Flag generated during server-side analysis.

```typescript
interface AnalysisFlag {
  type: string;
  analyzer: string;
  severity: Severity;
  message: string;
  confidence?: number;  // 0.0 to 1.0
  evidence?: Record<string, unknown>;
  trialIds?: string[];
}
```

## Validation

### Zod Schemas

All type definitions have corresponding Zod schemas for runtime validation.

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
```

### validateSession()

Validate a session object against the schema.

```typescript
function validateSession(data: unknown): ValidationResult;

interface ValidationResult {
  success: boolean;
  data?: SlopitSession;
  errors?: Array<{ path: string; message: string }>;
}
```

**Example:**

```typescript
import { validateSession } from "@slopit/core";

const result = validateSession(rawData);
if (result.success) {
  console.log("Valid session:", result.data.sessionId);
} else {
  console.error("Validation errors:", result.errors);
}
```

### isValidSession()

Type guard to check if a value is a valid SlopitSession.

```typescript
function isValidSession(data: unknown): data is SlopitSession;
```

**Example:**

```typescript
import { isValidSession } from "@slopit/core";

if (isValidSession(data)) {
  // TypeScript knows data is SlopitSession
  console.log(data.sessionId);
}
```

## Utilities

### ID Generation

#### generateSessionId()

Generate a unique session ID using UUID v4.

```typescript
function generateSessionId(): string;
```

**Example:**

```typescript
import { generateSessionId } from "@slopit/core";

const sessionId = generateSessionId();
// "f47ac10b-58cc-4372-a567-0e02b2c3d479"
```

#### generateTrialId()

Generate a unique trial ID with optional prefix.

```typescript
function generateTrialId(prefix?: string): string;
```

**Example:**

```typescript
import { generateTrialId } from "@slopit/core";

const trialId = generateTrialId("survey");
// "survey-f47ac10b-58cc"
```

### Hashing

#### hashText()

Compute SHA-256 hash of text (async).

```typescript
function hashText(text: string): Promise<string>;
```

**Example:**

```typescript
import { hashText } from "@slopit/core";

const hash = await hashText("Hello, world!");
// "315f5bdb76d078c43b8ac0064e4a0164612b1fce77c869345bfc94c75894edd3"
```

#### simpleHash()

Synchronous simple hash for non-cryptographic purposes.

```typescript
function simpleHash(text: string): string;
```

**Example:**

```typescript
import { simpleHash } from "@slopit/core";

const hash = simpleHash("Hello, world!");
// "a6d56e28"
```

### Time Utilities

#### now()

Get current Unix timestamp in milliseconds.

```typescript
function now(): number;
```

#### highResTime()

Get high-resolution timestamp for performance measurement.

```typescript
function highResTime(): number;
```

Uses `performance.now()` when available, falls back to `Date.now()`.

#### duration()

Calculate duration between two timestamps.

```typescript
function duration(start: number, end?: number): number;
```

#### formatDuration()

Format a duration in human-readable format.

```typescript
function formatDuration(ms: number): string;
```

**Example:**

```typescript
import { formatDuration } from "@slopit/core";

formatDuration(65000);   // "1m 5s"
formatDuration(3661000); // "1h 1m 1s"
```

#### toTimestamp() / fromTimestamp()

Convert between Date objects and Unix timestamps.

```typescript
function toTimestamp(date: Date): number;
function fromTimestamp(timestamp: number): Date;
```

### Environment

#### captureEnvironment()

Capture client environment information.

```typescript
function captureEnvironment(): EnvironmentInfo;
```

Collects browser, screen, and device information. Should be called at session start.

**Example:**

```typescript
import { captureEnvironment } from "@slopit/core";

const environment = captureEnvironment();
console.log(environment.userAgent);
console.log(environment.screenResolution);
```

## Constants

### SCHEMA_VERSION

Current schema version for slopit data format.

```typescript
const SCHEMA_VERSION = "1.0" as const;
```

### DEFAULT_CONFIG

Default configuration values for behavioral capture.

```typescript
const DEFAULT_CONFIG = {
  keystroke: {
    enabled: true,
    captureKeyUp: true,
    includeModifiers: true,
  },
  focus: {
    enabled: true,
    useVisibilityAPI: true,
    useBlurFocus: true,
  },
  paste: {
    enabled: true,
    prevent: false,
    capturePreview: true,
    previewLength: 100,
  },
} as const;
```

### SEVERITY_LEVELS

Severity levels in ascending order.

```typescript
const SEVERITY_LEVELS = ["info", "low", "medium", "high"] as const;
```

### KNOWN_PLATFORMS

Known platform identifiers.

```typescript
const KNOWN_PLATFORMS = [
  "jspsych",
  "labjs",
  "psychojs",
  "gorilla",
  "qualtrics",
  "custom",
] as const;
```
