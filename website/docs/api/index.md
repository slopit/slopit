---
sidebar_position: 1
---

# API Reference

This section documents the public APIs for all slopit TypeScript packages.

## Core Packages

### [@slopit/core](./core.md)

Shared types, schemas, and utilities.

**Main exports:**

- Type definitions: `SlopitSession`, `SlopitTrial`, `BehavioralData`, etc.
- Zod schemas: `SlopitSessionSchema`, `BehavioralDataSchema`, etc.
- Validation: `validateSession()`, `isValidSession()`
- Utilities: `generateSessionId()`, `hashText()`, `captureEnvironment()`
- Constants: `SCHEMA_VERSION`, `DEFAULT_CONFIG`

### [@slopit/behavioral](./behavioral.md)

DOM-based behavioral capture, detection, and intervention.

**Main exports:**

- `BehavioralCapture`, `createBehavioralCapture()`: Main capture orchestrator
- `InputWrapper`, `createInputWrapper()`: Higher-level wrapper combining capture with detection and intervention
- `KeystrokeCollector`, `FocusCollector`, `PasteCollector`, `ClipboardCollector`: Standalone collectors
- `computeKeystrokeMetrics()`, `computeFocusMetrics()`, `computeTimingMetrics()`: Metrics computation
- `TextAppearanceDetector`, `ExtensionDetector`: Detection modules
- `InterventionManager`, `createInterventionManager()`: Intervention management
- `TypingTestChallenge`, `MemoryRecallChallenge`, `createChallenge()`: Interactive challenges

## Platform Adapters

Platform adapters integrate slopit with experiment frameworks. Each adapter provides session recording, behavioral capture, and data export tailored to the specific platform.

### [@slopit/adapter-shared](./adapter-shared.md)

Shared utilities and base classes for building adapters.

**Main exports:**

- `BaseRecorder`: Abstract base class for session recorders
- `discoverElement()`, `discoverElements()`: DOM element discovery utilities
- `createSessionMetadata()`, `completeSession()`: Session building utilities
- `convertTrialToSlopit()`, `createTextResponse()`: Data conversion helpers
- Type definitions: `AdapterConfig`, `AdapterData`, `TrialConfig`, `CompletedTrial`

### [@slopit/adapter-jspsych](./adapter-jspsych.md)

jsPsych 8.x integration.

**Main exports:**

- `SlopitExtension`: Extension that adds behavioral capture to any jsPsych plugin
- `SlopitExtensionParams`: Configuration type for the extension
- `exportToSlopit()`: Convert jsPsych data to SlopitSession
- `getSlopitDataFromTrial()`: Extract slopit data from a trial

### [@slopit/adapter-labjs](./adapter-labjs.md)

lab.js integration.

**Main exports:**

- `withSlopit()`: Mixin function to add capture to lab.js components
- `LabjsRecorder`: Session recorder for lab.js experiments
- Type definitions: `LabjsSlopitConfig`, `LabjsComponentLike`

### [@slopit/adapter-psychojs](./adapter-psychojs.md)

PsychoJS/Pavlovia integration.

**Main exports:**

- `SlopitRecorder` / `PsychoJSRecorder`: Session recorder with PIXI.js element handling
- `storeInExperiment()`: Store session in PsychoJS experiment handler
- Type definitions: `PsychoJSRecorderConfig`, `PsychoJSTrialConfig`

### [@slopit/adapter-pcibex](./adapter-pcibex.md)

PCIbex/PennController integration.

**Main exports:**

- `newSlopit()`, `getSlopit()`: Element-based API matching PCIbex patterns
- `getAllSlopitData()`, `clearSlopitElements()`: Element registry management
- `PCIbexRecorder`: Session recorder for advanced use cases
- Type definitions: `SlopitElement`, `PennElement`, `PCIbexSlopitConfig`

### [@slopit/adapter-gorilla](./adapter-gorilla.md)

Gorilla Experiment Builder integration.

**Main exports:**

- `SlopitRecorder` / `GorillaRecorder`: Session recorder with Gorilla API integration
- `storeSession()`: Store session via `gorilla.metric()`
- `saveToStore()`: Store session via `gorilla.store()`
- Type definitions: `GorillaRecorderConfig`, `GorillaModule`

### [@slopit/adapter-jatos](./adapter-jatos.md)

JATOS integration.

**Main exports:**

- `SlopitRecorder` / `JatosRecorder`: Session recorder with JATOS API integration
- `submitToJatos()`, `appendToJatos()`: Submit data to JATOS
- `storeInStudySession()`, `loadFromStudySession()`: Multi-component study support
- Type definitions: `JatosRecorderConfig`, `JatosModule`

### [@slopit/adapter-osweb](./adapter-osweb.md)

OSWeb/OpenSesame integration.

**Main exports:**

- `SlopitRecorder` / `OSWebRecorder`: Session recorder for OSWeb's sandbox
- `prepareCapture()`, `attachWhenReady()`: Prepare/run phase pattern
- `getTrialData()`, `getTrialDataJSON()`: Trial data access
- `storeInVars()`: Store session in OSWeb vars
- Type definitions: `OSWebRecorderConfig`, `OSWebVars`

### [@slopit/adapter-vanilla](./adapter-vanilla.md)

Framework-agnostic adapter.

**Main exports:**

- `SlopitRecorder` / `VanillaRecorder`: Reference implementation for custom integrations
- `startTrialWithDiscovery()`: Trial start with element discovery
- `exportSessionJSON()`: Export session as JSON string
- Type definitions: `VanillaRecorderConfig`, `VanillaTrialConfig`, `VanillaTrialResult`

## Import Patterns

### Full Package Import

```typescript
import {
  generateSessionId,
  validateSession,
  type SlopitSession
} from "@slopit/core";
```

### Type-Only Imports

Use `import type` for types that are not needed at runtime.

```typescript
import type {
  BehavioralData,
  KeystrokeEvent
} from "@slopit/core";
```

### Subpath Imports (core only)

The core package exposes subpath exports for more granular imports.

```typescript
// schemas only
import type { SlopitSession } from "@slopit/core/schemas";

// validation only
import { validateSession } from "@slopit/core/validation";
```

## Type Conventions

### Interfaces vs Types

- **Interfaces** define object shapes (e.g., `SlopitSession`, `BehavioralData`)
- **Types** define unions and aliases (e.g., `Severity`, event types)

### Optional Properties

Optional properties use `?` syntax and may be `undefined`.

```typescript
interface SlopitSession {
  participantId?: string;  // may be undefined
}
```

### Branded Types

Some types use string literals for validation.

```typescript
interface SlopitSession {
  schemaVersion: "1.0";  // must be exactly "1.0"
}
```

## Error Handling

### Validation Errors

The `validateSession()` function returns a result object.

```typescript
const result = validateSession(data);
if (!result.success) {
  console.error("Validation errors:", result.errors);
  // errors: Array<{ path: string; message: string }>
}
```

### Runtime Errors

Capture methods throw errors for invalid states.

```typescript
try {
  capture.attach(element);
} catch (error) {
  // handle attachment error
}
```

## Browser vs Node.js

### Browser-Only APIs

Some functions require browser APIs.

| Function | Requires |
|----------|----------|
| `captureEnvironment()` | `window`, `navigator`, `screen` |
| `BehavioralCapture.attach()` | DOM elements |
| `highResTime()` | `performance.now()` |

These functions provide fallbacks or throw errors in non-browser environments.

### Universal APIs

These functions work in any JavaScript environment.

| Function | Notes |
|----------|-------|
| `generateSessionId()` | Uses `crypto.randomUUID()` or fallback |
| `validateSession()` | Uses Zod (no browser APIs) |
| `now()` | Uses `Date.now()` |

## Choosing an Adapter

| Platform | Adapter | Notes |
|----------|---------|-------|
| jsPsych 8.x | `@slopit/adapter-jspsych` | Extension-based API |
| lab.js | `@slopit/adapter-labjs` | Mixin-based API |
| PsychoJS/Pavlovia | `@slopit/adapter-psychojs` | Handles PIXI.js elements |
| PCIbex Farm | `@slopit/adapter-pcibex` | Element-based API |
| Gorilla | `@slopit/adapter-gorilla` | Integrates with Gorilla APIs |
| JATOS | `@slopit/adapter-jatos` | Multi-component study support |
| OSWeb/OpenSesame | `@slopit/adapter-osweb` | Works within OSWeb sandbox |
| Custom/Other | `@slopit/adapter-vanilla` | Framework-agnostic |

For platforms not listed, use `@slopit/adapter-vanilla` or extend `BaseRecorder` from `@slopit/adapter-shared`.

## Dashboard

### [@slopit/dashboard-ui](./dashboard-ui.md)

React components and API client for the analytics dashboard.

**Main exports:**

- Components: `Dashboard`, `SessionList`, `SessionDetail`, `AnalysisSummary`, `VerdictBadge`, `FlagList`, `TrialTimeline`, `ConfidenceHistogram`, `FlagDistribution`, `ConnectionStatus`
- Hooks: `useWebSocket`
- API Client: `DashboardApiClient`, `createApiClient()`
- Web Component: `<slopit-dashboard>` custom element
- Type definitions: `DashboardConfig`, `SessionFilters`, `VerdictType`, `SessionVerdict`, etc.
