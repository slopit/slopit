---
sidebar_position: 10
---

# @slopit/adapter-jatos API Reference

Integration adapter for [JATOS](https://www.jatos.org/) (Just Another Tool for Online Studies). Provides session recording with automatic integration into JATOS's data storage and multi-component study support.

## Installation

```bash
pnpm add @slopit/adapter-jatos
```

## When to Use This Package

Use `@slopit/adapter-jatos` when:

- Running experiments on a JATOS server
- Building multi-component studies
- Using JATOS for experiment hosting and data collection

## Quick Start

```typescript
import { SlopitRecorder } from "@slopit/adapter-jatos";

jatos.onLoad(function() {
  const recorder = new SlopitRecorder();

  // run trials
  recorder.beginTrial("trial_1", textarea);
  // ... participant completes trial ...
  recorder.finishTrial(response);

  // submit and end
  await recorder.submitToJatos();
  jatos.endStudy();
});
```

## SlopitRecorder / JatosRecorder

Session recorder for JATOS experiments. Automatically detects JATOS worker and study IDs and integrates with JATOS's result data APIs.

Both `SlopitRecorder` and `JatosRecorder` refer to the same class.

### Constructor

```typescript
new SlopitRecorder(config?: JatosRecorderConfig)
new JatosRecorder(config?: JatosRecorderConfig)
```

The recorder automatically extracts `participantId` from `jatos.workerId` and `studyId` from `jatos.studyId` if not provided in the config.

#### JatosRecorderConfig

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `participantId` | string | `jatos.workerId` | Participant identifier (auto-detected) |
| `studyId` | string | `jatos.studyId` | Study identifier (auto-detected) |
| `metadata` | `Record<string, unknown>` | - | Session-level metadata |
| `behavioral` | `BehavioralCaptureConfig` | - | Default behavioral capture settings |
| `resultKey` | string | `"slopit"` | Key used for slopit data in JATOS results |

```typescript
const recorder = new SlopitRecorder({
  resultKey: "behavioral_data",
  metadata: {
    condition: "experimental",
    batch: "batch_1",
  },
});
```

### beginTrial(trialId, element?, trialConfig?)

Starts capturing behavioral data for a trial.

```typescript
beginTrial(
  trialId: string,
  element?: HTMLElement,
  trialConfig?: Partial<TrialConfig>
): void
```

```typescript
const textarea = document.querySelector("textarea");
recorder.beginTrial("trial_1", textarea, {
  trialType: "free-response",
  stimulus: {
    type: "text",
    content: "Describe your experience.",
  },
});
```

### startTrialWithSelector(trialId, selector, container?)

Starts a trial with automatic element discovery. Uses a MutationObserver to wait for the element to appear in the DOM.

```typescript
startTrialWithSelector(
  trialId: string,
  selector: string,
  container?: HTMLElement | Document
): void
```

```typescript
recorder.startTrialWithSelector(
  "trial_1",
  "textarea.response-input",
  document.getElementById("trial-container")
);
```

### finishTrial(response?)

Ends the current trial and returns captured data.

```typescript
finishTrial(response?: string | ResponseInfo): CompletedTrial
```

```typescript
// with text string
const trial = recorder.finishTrial("The participant's response.");

// with ResponseInfo object
const trial = recorder.finishTrial({
  type: "text",
  value: "Response text",
  characterCount: 13,
  wordCount: 2,
});
```

### submitToJatos()

Submits session data to JATOS. Call this at the end of the component or study.

```typescript
async submitToJatos(): Promise<void>
```

```typescript
await recorder.submitToJatos();
jatos.endStudy();
```

### appendToJatos()

Appends session data to JATOS result. Use this for incremental data submission during long experiments.

```typescript
async appendToJatos(): Promise<void>
```

```typescript
// after each block of trials
await recorder.appendToJatos();
```

### storeInStudySession()

Stores session in JATOS study session data. Use this to share session data across components in a multi-component study.

```typescript
storeInStudySession(): void
```

```typescript
// in component 1
recorder.storeInStudySession();
jatos.startNextComponent();
```

### loadFromStudySession()

Loads previous session data from JATOS study session. Use this in multi-component studies to retrieve data from previous components.

```typescript
loadFromStudySession(): SlopitSession | undefined
```

```typescript
// in component 2
const previousSession = recorder.loadFromStudySession();
if (previousSession !== undefined) {
  console.log(`Previous session had ${previousSession.trials.length} trials`);
}
```

### exportSession()

Exports the session data in SlopitSession format.

```typescript
exportSession(): SlopitSession
```

### getResultKey()

Gets the result key used for JATOS data storage.

```typescript
getResultKey(): string
```

### Other Methods

Inherited from [BaseRecorder](./adapter-shared.md#baserecorder):

- `startTrial(config)` - Start a new trial (use `beginTrial` for convenience)
- `endTrial(response?, platformData?)` - End current trial (use `finishTrial` for convenience)
- `attachCapture(element, startTime?)` - Attach capture to an element
- `detachCapture()` - Detach capture without ending trial
- `getCurrentTrial()` - Get current trial state
- `getTrials()` - Get all completed trials
- `isTrialInProgress()` - Check if trial is active
- `getSessionId()` - Get session identifier
- `reset()` - Reset for a new session

## Complete JATOS Example

### Single Component Study

```html
<!DOCTYPE html>
<html>
<head>
  <script src="jatos.js"></script>
  <script type="module">
    import { SlopitRecorder } from "@slopit/adapter-jatos";

    let recorder = null;

    jatos.onLoad(async function() {
      // initialize recorder (auto-detects participant and study IDs)
      recorder = new SlopitRecorder();

      // create trial UI
      document.body.innerHTML = `
        <h2>Writing Task</h2>
        <p>Please describe your ideal vacation destination.</p>
        <textarea id="response" rows="6" style="width: 100%;"></textarea>
        <button id="submit">Submit</button>
      `;

      const textarea = document.getElementById("response");
      const submitBtn = document.getElementById("submit");

      // start capture
      recorder.beginTrial("writing_1", textarea, {
        trialType: "free-response",
        stimulus: {
          type: "text",
          content: "Describe your ideal vacation destination.",
        },
      });

      // handle submit
      submitBtn.addEventListener("click", async function() {
        // end trial
        recorder.finishTrial(textarea.value);

        // submit to JATOS
        await recorder.submitToJatos();

        // show thank you message
        document.body.innerHTML = `
          <h2>Thank You</h2>
          <p>Your response has been recorded.</p>
        `;

        // end study after a delay
        setTimeout(function() {
          jatos.endStudy();
        }, 2000);
      });
    });
  </script>
</head>
<body>
  <p>Loading...</p>
</body>
</html>
```

### Multi-Component Study

**Component 1: Instructions and First Task**

```javascript
import { SlopitRecorder } from "@slopit/adapter-jatos";

jatos.onLoad(function() {
  const recorder = new SlopitRecorder({
    metadata: { component: 1 },
  });

  // ... run first task ...

  recorder.beginTrial("task1_trial1", textarea);
  // ... participant completes trial ...
  recorder.finishTrial(response);

  // store session for next component
  recorder.storeInStudySession();

  // move to next component
  jatos.startNextComponent();
});
```

**Component 2: Second Task**

```javascript
import { SlopitRecorder } from "@slopit/adapter-jatos";

jatos.onLoad(async function() {
  const recorder = new SlopitRecorder({
    metadata: { component: 2 },
  });

  // load data from previous component
  const previousSession = recorder.loadFromStudySession();
  console.log(`Previous component completed ${previousSession?.trials.length} trials`);

  // ... run second task ...

  recorder.beginTrial("task2_trial1", textarea);
  // ... participant completes trial ...
  recorder.finishTrial(response);

  // submit all data
  await recorder.submitToJatos();

  jatos.endStudy();
});
```

### Long Experiment with Incremental Saves

```javascript
import { SlopitRecorder } from "@slopit/adapter-jatos";

jatos.onLoad(async function() {
  const recorder = new SlopitRecorder();

  const blocks = [
    { trials: ["t1", "t2", "t3"] },
    { trials: ["t4", "t5", "t6"] },
    { trials: ["t7", "t8", "t9"] },
  ];

  for (const block of blocks) {
    for (const trialId of block.trials) {
      // run trial
      await runTrial(recorder, trialId);
    }

    // save after each block
    await recorder.appendToJatos();
    console.log(`Block saved`);
  }

  // final submission
  await recorder.submitToJatos();
  jatos.endStudy();
});

async function runTrial(recorder, trialId) {
  return new Promise((resolve) => {
    const textarea = document.getElementById("response");
    recorder.beginTrial(trialId, textarea);

    document.getElementById("submit").onclick = function() {
      recorder.finishTrial(textarea.value);
      resolve();
    };
  });
}
```

## Types

### JatosRecorderConfig

Configuration for the JATOS recorder.

```typescript
interface JatosRecorderConfig extends RecorderConfig {
  resultKey?: string;  // default: "slopit"
}
```

### JatosModule

Interface for the global JATOS module (available as `window.jatos`).

```typescript
interface JatosModule {
  onLoad(callback: () => void): void;
  submitResultData(data: unknown): Promise<void>;
  appendResultData(data: string): Promise<void>;
  endStudy(successful?: boolean, message?: string): void;
  startNextComponent(message?: string): void;
  studySessionData: Record<string, unknown>;
  componentResultData: unknown;
  studyResultData: unknown;
  workerId: string;
  studyId: string;
  batchId: string;
  componentId: string;
}
```

## Platform Notes

- JATOS does not expose version information client-side; platform version is reported as "unknown"
- The `jatos` global object must be available (load `jatos.js` first)
- `submitToJatos()` replaces existing result data; use `appendToJatos()` for incremental saves
- Study session data persists across components in multi-component studies
- Use `resultKey` to customize the key under which slopit data is stored

## Data Access in JATOS

After running your study:

1. Go to your study in the JATOS GUI
2. Click **Results**
3. Export results as JSON or CSV
4. The slopit session will be under the configured `resultKey` (default: "slopit")

```python
import json
import pandas as pd

# for JSON export
with open("results.json") as f:
    results = json.load(f)

for result in results:
    data = json.loads(result["data"])
    slopit_session = data.get("slopit")
    if slopit_session:
        print(f"Session {slopit_session['sessionId']}")
        for trial in slopit_session["trials"]:
            print(f"  Trial {trial['trialId']}: {len(trial['behavioral']['keystrokes'])} keystrokes")
```
