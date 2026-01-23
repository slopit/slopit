---
sidebar_position: 12
---

# @slopit/adapter-vanilla API Reference

Framework-agnostic adapter for slopit behavioral capture. Use this as a reference implementation for custom integrations or when working with platforms not covered by other adapters.

## Installation

```bash
pnpm add @slopit/adapter-vanilla
```

## When to Use This Package

Use `@slopit/adapter-vanilla` when:

- Building a custom experiment system without an existing adapter
- Creating experiments with plain JavaScript/TypeScript
- Prototyping before choosing a specific experiment platform
- Needing a reference implementation for building your own adapter

## Quick Start

```typescript
import { SlopitRecorder } from "@slopit/adapter-vanilla";

const recorder = new SlopitRecorder({
  participantId: "P001",
  studyId: "study_1",
});

// start a trial
recorder.startTrial({
  trialId: "trial_1",
  targetElement: document.querySelector("textarea"),
});

// later, when trial ends
const result = recorder.endTrial("participant response text");

// at experiment end
const session = recorder.exportSession();
```

## SlopitRecorder / VanillaRecorder

Framework-agnostic session recorder that can be used directly or as a template for building custom adapters.

Both `SlopitRecorder` and `VanillaRecorder` refer to the same class.

### Constructor

```typescript
new SlopitRecorder(config?: VanillaRecorderConfig)
new VanillaRecorder(config?: VanillaRecorderConfig)
```

#### VanillaRecorderConfig

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `participantId` | string | - | Participant identifier |
| `studyId` | string | - | Study identifier |
| `metadata` | `Record<string, unknown>` | - | Session-level metadata |
| `behavioral` | `BehavioralCaptureConfig` | - | Default behavioral capture settings |
| `platformName` | string | `"vanilla"` | Platform name for identification |
| `platformVersion` | string | `"1.0.0"` | Platform version string |

```typescript
const recorder = new SlopitRecorder({
  participantId: "P001",
  studyId: "study_1",
  platformName: "my-experiment-system",
  platformVersion: "2.0.0",
});
```

### startTrial(config)

Starts capturing behavioral data for a trial.

```typescript
startTrial(config: VanillaTrialConfig): void
```

#### VanillaTrialConfig

| Property | Type | Description |
|----------|------|-------------|
| `trialId` | string | Unique identifier (auto-generated if not provided) |
| `trialIndex` | number | Zero-indexed position (auto-incremented if not provided) |
| `trialType` | string | Type identifier (e.g., "text-entry", "survey") |
| `targetElement` | HTMLElement | DOM element to capture |
| `targetSelector` | string | CSS selector (alternative to targetElement) |
| `stimulus` | `StimulusInfo \| string` | Stimulus information (strings auto-converted) |

```typescript
recorder.startTrial({
  trialId: "trial_1",
  targetElement: document.querySelector("textarea"),
  stimulus: "Please describe your experience.",  // auto-converts to StimulusInfo
});

// equivalent with explicit stimulus
recorder.startTrial({
  trialId: "trial_1",
  targetElement: document.querySelector("textarea"),
  stimulus: {
    type: "text",
    content: "Please describe your experience.",
  },
});
```

### startTrialWithDiscovery(config, selector, container?, timeout?)

Starts a trial with automatic element discovery. Use this when the target element may not exist yet.

```typescript
startTrialWithDiscovery(
  config: VanillaTrialConfig,
  selector: string,
  container?: HTMLElement | Document,
  timeout?: number
): Promise<void>
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `config` | VanillaTrialConfig | (required) | Trial configuration |
| `selector` | string | (required) | CSS selector for target element |
| `container` | HTMLElement \| Document | `document` | Container to search within |
| `timeout` | number | `5000` | Max time to wait in milliseconds |

**Returns:** Promise that resolves when the trial starts.

**Throws:** Error if element is not found within timeout (trial starts anyway without capture).

```typescript
await recorder.startTrialWithDiscovery(
  { trialId: "trial_1" },
  "textarea.response-input",
  document.body,
  3000
);
```

### endTrial(response?, platformData?)

Ends the current trial and returns captured data.

```typescript
endTrial(response?: string | ResponseInfo, platformData?: Record<string, unknown>): VanillaTrialResult
```

The response parameter accepts either a text string or a full ResponseInfo object. Strings are automatically converted with character and word counts.

```typescript
// with simple text response
const result = recorder.endTrial("The participant's typed response");

// with ResponseInfo object
const result = recorder.endTrial({
  type: "text",
  value: "Response text",
  characterCount: 13,
  wordCount: 2,
});

// with platform-specific data
const result = recorder.endTrial("Response", {
  customField: "custom value",
  timing: performance.now(),
});
```

#### VanillaTrialResult

| Property | Type | Description |
|----------|------|-------------|
| `trialId` | string | Trial identifier |
| `trialIndex` | number | Zero-indexed position |
| `trialType` | string | Type identifier |
| `startTime` | number | Start time (Unix timestamp) |
| `endTime` | number | End time (Unix timestamp) |
| `data` | AdapterData | Behavioral data and flags |
| `rt` | number | Response time in milliseconds |

### isTrialActive()

Checks if a trial is currently in progress.

```typescript
isTrialActive(): boolean
```

```typescript
if (recorder.isTrialActive()) {
  recorder.endTrial(responseText);
}
```

### getCurrentTrialId()

Gets the current trial ID, or null if no trial is active.

```typescript
getCurrentTrialId(): string | null
```

```typescript
const trialId = recorder.getCurrentTrialId();
if (trialId !== null) {
  console.log(`Recording trial: ${trialId}`);
}
```

### getTrialCount()

Gets the number of completed trials.

```typescript
getTrialCount(): number
```

### resetSession()

Resets the recorder for a new session. Clears all trials and generates a new session ID.

```typescript
resetSession(): void
```

```typescript
// after completing a session
const session = recorder.exportSession();
await saveSession(session);

// reset for a new session
recorder.resetSession();
```

### exportSession()

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

### exportSessionJSON()

Exports session data as a JSON string.

```typescript
exportSessionJSON(): string
```

```typescript
const json = recorder.exportSessionJSON();
localStorage.setItem("session", json);
```

### Other Methods

Inherited from [BaseRecorder](./adapter-shared.md#baserecorder):

- `attachCapture(element, startTime?)` - Attach capture to an element
- `detachCapture()` - Detach capture without ending trial
- `getCurrentTrial()` - Get current trial state
- `getTrials()` - Get all completed trials
- `isTrialInProgress()` - Check if trial is active
- `getSessionId()` - Get session identifier
- `reset()` - Reset for a new session

## Complete Example

### Basic Text Entry Experiment

```typescript
import { SlopitRecorder } from "@slopit/adapter-vanilla";

// get participant ID from URL
const urlParams = new URLSearchParams(window.location.search);
const participantId = urlParams.get("PROLIFIC_PID") ?? undefined;

// create recorder
const recorder = new SlopitRecorder({
  participantId,
  studyId: "text-entry-study",
});

// trial prompts
const prompts = [
  "Describe your ideal vacation destination.",
  "Explain how to make your favorite meal.",
  "Write about a memorable experience.",
];

let currentTrial = 0;

function showTrial(index: number) {
  if (index >= prompts.length) {
    finishExperiment();
    return;
  }

  const container = document.getElementById("experiment-container")!;
  container.innerHTML = `
    <div class="trial">
      <h3>${prompts[index]}</h3>
      <textarea id="response" rows="6"></textarea>
      <button id="submit">Submit</button>
    </div>
  `;

  const textarea = document.getElementById("response") as HTMLTextAreaElement;
  const submitBtn = document.getElementById("submit")!;

  // start the trial
  recorder.startTrial({
    trialId: `trial_${index}`,
    trialIndex: index,
    trialType: "writing",
    targetElement: textarea,
    stimulus: prompts[index],
  });

  // handle submit
  submitBtn.addEventListener("click", () => {
    const response = textarea.value;

    // end the trial
    const result = recorder.endTrial(response);

    console.log(`Trial ${index} complete:`, {
      keystrokes: result.data.behavioral.keystrokes.length,
      flags: result.data.flags.length,
      rt: result.rt,
    });

    // move to next trial
    currentTrial++;
    showTrial(currentTrial);
  });
}

async function finishExperiment() {
  const container = document.getElementById("experiment-container")!;
  container.innerHTML = `
    <div class="thank-you">
      <h2>Thank You</h2>
      <p>Submitting your responses...</p>
    </div>
  `;

  // export and send session
  const session = recorder.exportSession();

  await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(session),
  });

  // show completion
  container.innerHTML = `
    <div class="thank-you">
      <h2>Thank You</h2>
      <p>Your responses have been recorded.</p>
      <p>You may now close this window.</p>
    </div>
  `;
}

// start the experiment
document.addEventListener("DOMContentLoaded", () => {
  showTrial(0);
});
```

### Dynamic Element Discovery

```typescript
import { SlopitRecorder } from "@slopit/adapter-vanilla";

const recorder = new SlopitRecorder();

// use discovery when elements are created asynchronously
async function startTrial() {
  try {
    // wait for textarea to appear
    await recorder.startTrialWithDiscovery(
      { trialId: "trial_1", trialType: "survey" },
      "textarea.response",
      document.getElementById("form-container")!,
      5000
    );

    console.log("Capture started");
  } catch (error) {
    console.warn("Element not found, trial started without capture");
  }
}

// dynamically create the form after some delay
setTimeout(() => {
  const container = document.getElementById("form-container")!;
  container.innerHTML = `<textarea class="response"></textarea>`;
}, 2000);

// start trial (will wait for textarea)
startTrial();
```

## Building a Custom Adapter

Use the VanillaRecorder as a starting point for custom adapters:

```typescript
import { VanillaRecorder } from "@slopit/adapter-vanilla";
import type { PlatformInfo } from "@slopit/core";

class MyPlatformRecorder extends VanillaRecorder {
  constructor(config?: MyPlatformConfig) {
    super({
      ...config,
      platformName: "my-platform",
      platformVersion: detectMyPlatformVersion(),
    });
  }

  // add platform-specific methods
  storeInPlatform(): void {
    const session = this.exportSession();
    myPlatform.store("slopit", session);
  }

  // override as needed
  override endTrial(response?: string | ResponseInfo): VanillaTrialResult {
    const result = super.endTrial(response);

    // add platform-specific behavior
    myPlatform.logTrial(result.trialId, result.rt);

    return result;
  }
}
```

## Types

### VanillaTrialConfig

Trial configuration with flexible stimulus type.

```typescript
interface VanillaTrialConfig extends Omit<TrialConfig, "stimulus"> {
  stimulus?: StimulusInfo | string;
}
```

### VanillaTrialResult

Result of a completed trial.

```typescript
interface VanillaTrialResult {
  trialId: string;
  trialIndex: number;
  trialType?: string;
  startTime: number;
  endTime: number;
  data: AdapterData;
  rt: number;
}
```

### Re-exported Types

The package re-exports commonly used types for convenience:

```typescript
export type {
  BehavioralData,
  ResponseInfo,
  SlopitSession,
  SlopitTrial,
  StimulusInfo,
} from "@slopit/core";

export type { AdapterData } from "@slopit/adapter-shared";
```

## Platform Notes

- Platform name and version are configurable for custom integrations
- The adapter reports platform as `"vanilla"` by default
- Use this package when no platform-specific adapter exists
- All methods are designed to work with plain DOM APIs
