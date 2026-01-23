---
sidebar_position: 5
---

# @slopit/adapter-shared API Reference

Shared utilities and base classes for building platform adapters. This package provides the foundation that all platform-specific adapters build upon.

## Installation

```bash
pnpm add @slopit/adapter-shared
```

:::note
Most users do not need to install this package directly. It is a dependency of all platform-specific adapters (e.g., `@slopit/adapter-jspsych`, `@slopit/adapter-labjs`).
:::

## When to Use This Package

Install `@slopit/adapter-shared` directly when:

- Building a custom adapter for an unsupported platform
- Creating utilities that work across multiple adapters
- Extending the base recorder with custom functionality

## BaseRecorder

Abstract base class that all platform-specific recorders extend. Manages session state, trial lifecycle, and behavioral capture.

### Creating a Custom Recorder

```typescript
import { BaseRecorder } from "@slopit/adapter-shared";
import type { PlatformInfo } from "@slopit/core";

class MyPlatformRecorder extends BaseRecorder {
  protected getPlatformInfo(): PlatformInfo {
    return {
      name: "my-platform",
      version: "1.0.0",
      adapterVersion: "0.1.0",
    };
  }
}
```

### Constructor

```typescript
constructor(config?: RecorderConfig)
```

#### RecorderConfig

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `participantId` | string | - | Participant identifier from recruitment platform |
| `studyId` | string | - | Study identifier |
| `metadata` | `Record<string, unknown>` | - | Session-level metadata |
| `behavioral` | `BehavioralCaptureConfig` | `{}` | Behavioral capture configuration |

### Methods

#### startTrial(config)

Starts a new trial.

```typescript
startTrial(config: TrialConfig): void
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `config` | `TrialConfig` | Trial configuration |

**Throws:** Error if a trial is already in progress.

```typescript
recorder.startTrial({
  trialId: "trial_1",
  trialType: "survey-text",
  targetElement: document.querySelector("textarea"),
  stimulus: {
    type: "text",
    content: "Describe your experience.",
  },
});
```

#### endTrial(response?, platformData?)

Ends the current trial and returns the completed trial data.

```typescript
endTrial(response?: ResponseInfo, platformData?: Record<string, unknown>): CompletedTrial
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `response` | `ResponseInfo` | Response information |
| `platformData` | `Record<string, unknown>` | Platform-specific trial data |

**Returns:** `CompletedTrial` object with behavioral data.

**Throws:** Error if no trial is in progress.

```typescript
const trial = recorder.endTrial({
  type: "text",
  value: "User response text",
  characterCount: 18,
  wordCount: 3,
});
```

#### attachCapture(element, startTime?)

Attaches behavioral capture to an element for the current trial. Use this when the target element becomes available after `startTrial()` is called.

```typescript
attachCapture(element: HTMLElement, startTime?: number): void
```

**Throws:** Error if no trial is in progress or if capture is already attached.

```typescript
recorder.startTrial({ trialId: "trial_1" });

// later, when element is available
const textarea = document.querySelector("textarea");
recorder.attachCapture(textarea);
```

#### detachCapture()

Detaches behavioral capture without ending the trial.

```typescript
detachCapture(): void
```

#### exportSession()

Exports the session data in SlopitSession format.

```typescript
exportSession(): SlopitSession
```

```typescript
const session = recorder.exportSession();
await fetch("/api/sessions", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(session),
});
```

#### getCurrentTrial()

Gets the current trial state.

```typescript
getCurrentTrial(): TrialState | null
```

#### getTrials()

Gets all completed trials.

```typescript
getTrials(): CompletedTrial[]
```

#### isTrialInProgress()

Checks if a trial is currently in progress.

```typescript
isTrialInProgress(): boolean
```

#### getSessionId()

Gets the session ID.

```typescript
getSessionId(): string
```

#### reset()

Resets the recorder for a new session. Clears all trials and generates a new session ID.

```typescript
reset(): void
```

## Element Discovery

Utilities for finding DOM elements that may not exist yet when capture needs to start.

### discoverElement(options)

Discovers an element in the DOM using a MutationObserver. If the element already exists, the callback is invoked immediately. Otherwise, it watches for DOM changes until the element appears or the timeout is reached.

```typescript
function discoverElement(options: DiscoverElementOptions): () => void
```

**Returns:** Cleanup function to disconnect the observer and cancel the timeout.

#### DiscoverElementOptions

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `selector` | string | (required) | CSS selector for the element to find |
| `container` | `HTMLElement \| Document` | (required) | Container to search within |
| `timeout` | number | `5000` | Timeout in milliseconds |
| `onFound` | `(element: HTMLElement) => void` | (required) | Callback when element is found |
| `onTimeout` | `() => void` | - | Callback if element not found within timeout |

```typescript
import { discoverElement } from "@slopit/adapter-shared";

const cleanup = discoverElement({
  selector: "textarea.response-input",
  container: document.getElementById("trial-container"),
  timeout: 3000,
  onFound: (element) => {
    recorder.attachCapture(element);
  },
  onTimeout: () => {
    console.warn("Target element not found within timeout");
  },
});

// to cancel observation early
cleanup();
```

### discoverElements(options)

Discovers multiple elements in the DOM. Waits until the minimum number of matching elements are present.

```typescript
function discoverElements(options: DiscoverElementsOptions): () => void
```

#### DiscoverElementsOptions

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `selector` | string | (required) | CSS selector for elements to find |
| `container` | `HTMLElement \| Document` | (required) | Container to search within |
| `minCount` | number | `1` | Minimum number of elements required |
| `timeout` | number | `5000` | Timeout in milliseconds |
| `onFound` | `(elements: HTMLElement[]) => void` | (required) | Callback when elements are found |
| `onTimeout` | `(found: HTMLElement[]) => void` | - | Callback with partial results on timeout |

```typescript
import { discoverElements } from "@slopit/adapter-shared";

const cleanup = discoverElements({
  selector: "input[type='text']",
  container: document.body,
  minCount: 3,
  onFound: (inputs) => {
    inputs.forEach((input) => capture.attach(input));
  },
});
```

## Export Utilities

Functions for building SlopitSession data structures.

### createSessionMetadata(platform, options?)

Creates the base structure for a SlopitSession.

```typescript
function createSessionMetadata(
  platform: PlatformInfo,
  options?: CreateSessionMetadataOptions
): SessionMetadataResult
```

```typescript
import { createSessionMetadata } from "@slopit/adapter-shared";

const sessionBase = createSessionMetadata(
  { name: "jspsych", version: "8.0.0", adapterVersion: "0.1.0" },
  { participantId: "P001", studyId: "study-123" }
);
```

### completeSession(sessionBase, trials, options?)

Completes a session by adding timing and global events.

```typescript
function completeSession(
  sessionBase: SessionMetadataResult,
  trials: SlopitTrial[],
  options?: CompleteSessionOptions
): SlopitSession
```

### convertTrialToSlopit(data)

Converts trial data to the SlopitTrial format.

```typescript
function convertTrialToSlopit(data: TrialConversionData): SlopitTrial
```

### createTextResponse(text)

Creates a ResponseInfo object from a text string.

```typescript
function createTextResponse(text: string): ResponseInfo
```

```typescript
import { createTextResponse } from "@slopit/adapter-shared";

const response = createTextResponse("Hello world");
// { type: "text", value: "Hello world", characterCount: 11, wordCount: 2 }
```

## Types

### TrialConfig

Configuration for starting a new trial.

```typescript
interface TrialConfig {
  trialId?: string;
  trialIndex?: number;
  trialType?: string;
  stimulus?: StimulusInfo;
  targetElement?: HTMLElement;
  targetSelector?: string;
}
```

### TrialState

State of a trial currently being recorded.

```typescript
interface TrialState {
  trialId: string;
  trialIndex: number;
  trialType?: string;
  startTime: number;
  stimulus?: StimulusInfo;
  element?: HTMLElement;
}
```

### CompletedTrial

Complete trial data after recording.

```typescript
interface CompletedTrial {
  trialId: string;
  trialIndex: number;
  trialType?: string;
  startTime: number;
  endTime: number;
  stimulus?: StimulusInfo;
  response?: ResponseInfo;
  behavioral?: BehavioralData;
  captureFlags?: CaptureFlag[];
  platformData?: Record<string, unknown>;
}
```

### AdapterConfig

Base configuration for platform adapters.

```typescript
interface AdapterConfig extends BehavioralCaptureConfig {
  enabled?: boolean;
  targetSelector?: string;
}
```

### AdapterData

Data collected by the adapter during a trial.

```typescript
interface AdapterData {
  behavioral: BehavioralData;
  flags: CaptureFlag[];
}
```

## Test Utilities

Helper functions for testing adapters. These are exported for use in adapter test suites.

```typescript
import {
  createMockTextarea,
  createMockInput,
  simulateTyping,
  simulateKeystroke,
  simulatePaste,
  simulateFocus,
  simulateBlur,
  delay,
  waitFor,
} from "@slopit/adapter-shared";
```

### simulateTyping(element, text, options?)

Simulates typing a string character by character.

```typescript
await simulateTyping(textarea, "Hello world", { delay: 50 });
```

### simulateKeystroke(element, key, options?)

Simulates a single keystroke event.

```typescript
simulateKeystroke(textarea, "a", { shiftKey: true });
```

### simulatePaste(element, text, options?)

Simulates a paste event.

```typescript
simulatePaste(textarea, "pasted content", { dispatchInput: true });
```
