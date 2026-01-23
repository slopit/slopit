---
sidebar_position: 9
---

# @slopit/adapter-gorilla API Reference

Integration adapter for [Gorilla Experiment Builder](https://gorilla.sc/). Provides session recording with automatic integration into Gorilla's data storage APIs.

## Installation

```bash
pnpm add @slopit/adapter-gorilla
```

## When to Use This Package

Use `@slopit/adapter-gorilla` when:

- Running experiments on the Gorilla platform
- Using Gorilla's Task Builder or Code Editor
- Deploying studies with Gorilla's participant management

## Quick Start

```typescript
import { SlopitRecorder } from "@slopit/adapter-gorilla";

gorilla.ready(function() {
  const recorder = new SlopitRecorder();

  recorder.startTrial("trial_1", document.querySelector("textarea"));

  // on submit
  recorder.endTrial(response);
  recorder.storeSession();
  gorilla.finish();
});
```

## SlopitRecorder / GorillaRecorder

Session recorder for Gorilla experiments. Integrates with Gorilla's `gorilla.metric()` and `gorilla.store()` APIs.

Both `SlopitRecorder` and `GorillaRecorder` refer to the same class.

### Constructor

```typescript
new SlopitRecorder(config?: GorillaRecorderConfig)
new GorillaRecorder(config?: GorillaRecorderConfig)
```

#### GorillaRecorderConfig

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `participantId` | string | - | Participant identifier |
| `studyId` | string | - | Study identifier |
| `metadata` | `Record<string, unknown>` | - | Session-level metadata |
| `behavioral` | `BehavioralCaptureConfig` | - | Default behavioral capture settings |
| `autoStore` | boolean | `false` | Automatically store data on each `endTrial()` |
| `storeKey` | string | `"slopit"` | Key prefix for `gorilla.store()` calls |

```typescript
const recorder = new SlopitRecorder({
  autoStore: true,
  storeKey: "behavioral",
});
```

### startTrial(trialId, element?, trialConfig?)

Starts capturing behavioral data for a trial.

```typescript
// simple usage
startTrial(trialId: string, element?: HTMLElement, trialConfig?: Partial<TrialConfig>): void

// full configuration
startTrial(config: TrialConfig): void
```

```typescript
// simple usage
recorder.startTrial("trial_1", document.querySelector("textarea"));

// with additional config
recorder.startTrial("trial_1", textarea, {
  trialType: "free-response",
  stimulus: {
    type: "text",
    content: "Describe your experience.",
  },
});

// full config object
recorder.startTrial({
  trialId: "trial_1",
  trialType: "free-response",
  targetElement: textarea,
});
```

### startTrialWithSelector(trialId, selector, container?)

Starts a trial with automatic element discovery. Uses a MutationObserver to wait for the element to appear.

```typescript
startTrialWithSelector(
  trialId: string,
  selector: string,
  container?: HTMLElement | Document
): void
```

```typescript
// start trial and wait for textarea to appear
recorder.startTrialWithSelector("trial_1", "textarea.response");
```

### endTrial(response?)

Ends the current trial. If `autoStore` is enabled, automatically stores trial data via `gorilla.store()`.

```typescript
endTrial(response?: string | ResponseInfo): CompletedTrial
```

```typescript
// with text string
const trial = recorder.endTrial("The participant's response text");

// with ResponseInfo
const trial = recorder.endTrial({
  type: "text",
  value: "Response text",
  characterCount: 13,
  wordCount: 2,
});
```

### storeSession(key?)

Stores the complete session via `gorilla.metric()`. The data appears in the exported metrics.

```typescript
storeSession(key?: string): void
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `key` | string | `"slopit_session"` | Metric key for storage |

```typescript
// at end of experiment
recorder.storeSession();
gorilla.finish();

// with custom key
recorder.storeSession("behavioral_session");
```

### saveToStore(key?)

Stores session data via `gorilla.store()` for retrieval within the experiment. Unlike `storeSession()`, this stores data for access during the experiment rather than in exported metrics.

```typescript
saveToStore(key?: string): void
```

```typescript
recorder.saveToStore("my_session_data");
```

### exportSession()

Exports the session data in SlopitSession format.

```typescript
exportSession(): SlopitSession
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

## Complete Gorilla Example

### Task Builder Integration

For Gorilla Task Builder, use a Code Editor zone with the following structure:

```javascript
import { SlopitRecorder } from "@slopit/adapter-gorilla";

let recorder = null;

gorilla.ready(function() {
  // initialize recorder
  recorder = new SlopitRecorder({
    participantId: gorilla.participant.getID(),
    studyId: "writing-study",
  });

  // set up trial UI
  const container = document.getElementById("gorilla");
  container.innerHTML = `
    <h2>Writing Task</h2>
    <p>Please describe your ideal vacation destination.</p>
    <textarea id="response" rows="6" style="width: 100%;"></textarea>
    <button id="submit">Submit</button>
  `;

  const textarea = document.getElementById("response");
  const submitBtn = document.getElementById("submit");

  // start capture
  recorder.startTrial("writing_1", textarea, {
    stimulus: {
      type: "text",
      content: "Describe your ideal vacation destination.",
    },
  });

  // handle submit
  submitBtn.addEventListener("click", function() {
    const response = textarea.value;

    // end trial
    recorder.endTrial(response);

    // store data
    recorder.storeSession();

    // store response as metric too
    gorilla.metric("response_text", response);
    gorilla.metric("response_length", response.length);

    // finish
    gorilla.finish();
  });
});
```

### Code Editor Zone with Multiple Trials

```javascript
import { SlopitRecorder } from "@slopit/adapter-gorilla";

const trials = [
  { id: "trial_1", prompt: "Describe your morning routine." },
  { id: "trial_2", prompt: "Explain how to make your favorite meal." },
  { id: "trial_3", prompt: "Write about a memorable experience." },
];

let recorder = null;
let currentTrialIndex = 0;

gorilla.ready(function() {
  recorder = new SlopitRecorder({
    studyId: "multi-trial-study",
  });

  showTrial(currentTrialIndex);
});

function showTrial(index) {
  if (index >= trials.length) {
    finishExperiment();
    return;
  }

  const trial = trials[index];
  const container = document.getElementById("gorilla");

  container.innerHTML = `
    <h3>${trial.prompt}</h3>
    <textarea id="response" rows="6"></textarea>
    <button id="next">Next</button>
  `;

  const textarea = document.getElementById("response");
  const nextBtn = document.getElementById("next");

  // start capture for this trial
  recorder.startTrial(trial.id, textarea, {
    trialIndex: index,
    trialType: "writing",
    stimulus: { type: "text", content: trial.prompt },
  });

  nextBtn.addEventListener("click", function() {
    // end the trial
    recorder.endTrial(textarea.value);

    // move to next trial
    currentTrialIndex++;
    showTrial(currentTrialIndex);
  });
}

function finishExperiment() {
  const container = document.getElementById("gorilla");
  container.innerHTML = `
    <h2>Thank You</h2>
    <p>Your responses have been recorded.</p>
  `;

  // store the complete session
  recorder.storeSession();

  // also store individual metrics
  const session = recorder.exportSession();
  gorilla.metric("total_trials", session.trials.length);
  gorilla.metric("session_duration", session.timing.duration);

  // delay finish slightly to ensure metrics are stored
  setTimeout(function() {
    gorilla.finish();
  }, 500);
}
```

### Auto-Store Mode

When `autoStore` is enabled, each trial's data is automatically stored via `gorilla.store()`:

```javascript
const recorder = new SlopitRecorder({
  autoStore: true,
  storeKey: "behavioral",
});

recorder.startTrial("trial_1", textarea);
recorder.endTrial(response);
// automatically calls: gorilla.store("behavioral_trial_0", { behavioral: ..., captureFlags: ... })

recorder.startTrial("trial_2", textarea);
recorder.endTrial(response);
// automatically calls: gorilla.store("behavioral_trial_1", { behavioral: ..., captureFlags: ... })
```

## Types

### GorillaRecorderConfig

Configuration for the Gorilla recorder.

```typescript
interface GorillaRecorderConfig extends RecorderConfig {
  autoStore?: boolean;  // default: false
  storeKey?: string;    // default: "slopit"
}
```

### GorillaModule

Interface for the global Gorilla module (available as `window.gorilla`).

```typescript
interface GorillaModule {
  ready(callback: () => void): void;
  metric(key: string, value: string | number): void;
  store(key: string, value: unknown): void;
  finish(): void;
  stimuliURL(filename: string): string;
}
```

## Platform Notes

- Gorilla does not expose version information, so platform version is reported as "unknown"
- The `gorilla` global object must be available before creating the recorder
- Use `gorilla.metric()` for data that should appear in exports
- Use `gorilla.store()` for data needed within the experiment
- Session data is stored as a JSON string
- Call `gorilla.finish()` after storing data to ensure it is saved

## Data Access in Gorilla

After running your experiment:

1. Go to your project's **Data** tab
2. Download the data file
3. The slopit session will be in the `slopit_session` column (or your custom key)
4. Parse the JSON string to access the behavioral data

```python
import pandas as pd
import json

df = pd.read_csv("gorilla_data.csv")

# parse slopit sessions
df["slopit_parsed"] = df["slopit_session"].apply(json.loads)

# access trial data
for idx, row in df.iterrows():
    session = row["slopit_parsed"]
    for trial in session["trials"]:
        print(f"Trial {trial['trialId']}: {len(trial['behavioral']['keystrokes'])} keystrokes")
```
