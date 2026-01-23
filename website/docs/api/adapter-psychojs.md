---
sidebar_position: 7
---

# @slopit/adapter-psychojs API Reference

Integration adapter for [PsychoJS](https://psychopy.github.io/psychojs/) experiments deployed on [Pavlovia](https://pavlovia.org/). Provides session recording with automatic handling of PsychoJS/PIXI.js element structures.

## Installation

```bash
pnpm add @slopit/adapter-psychojs
```

## When to Use This Package

Use `@slopit/adapter-psychojs` when:

- Running experiments created with PsychoPy/PsychoJS
- Deploying studies to Pavlovia
- Using PsychoJS TextBox or other form components

## Quick Start

```javascript
// in your experiment's JavaScript
import { SlopitRecorder } from "@slopit/adapter-psychojs";

const recorder = new SlopitRecorder({ psychoJS });

// in routineBegin
recorder.startTrial("trial_1", textBox._pixi);

// in routineEnd
const data = recorder.endTrial(textBox.text);

// at experiment end
const session = recorder.exportSession();
recorder.storeInExperiment(psychoJS);
```

## SlopitRecorder / PsychoJSRecorder

Session recorder for PsychoJS experiments. Handles extraction of DOM elements from PIXI.js wrappers and integrates with the PsychoJS experiment handler.

Both `SlopitRecorder` and `PsychoJSRecorder` refer to the same class. Use whichever name fits your preference.

### Constructor

```typescript
new SlopitRecorder(config?: PsychoJSRecorderConfig)
new PsychoJSRecorder(config?: PsychoJSRecorderConfig)
```

#### PsychoJSRecorderConfig

| Property | Type | Description |
|----------|------|-------------|
| `psychoJS` | unknown | PsychoJS instance for version detection |
| `participantId` | string | Participant identifier |
| `studyId` | string | Study identifier |
| `metadata` | `Record<string, unknown>` | Session-level metadata |
| `behavioral` | `BehavioralCaptureConfig` | Default behavioral capture settings |

```typescript
const recorder = new SlopitRecorder({
  psychoJS,
  participantId: expInfo["participant"],
  studyId: "my-study",
});
```

### startTrial(trialIdOrConfig, element?)

Starts capturing behavioral data for a trial. Call this in `routineBegin` of your PsychoJS experiment.

```typescript
// simple usage with trial ID and element
startTrial(trialId: string, element?: HTMLElement | unknown): void

// full configuration
startTrial(config: PsychoJSTrialConfig, element?: HTMLElement | unknown): void
```

#### PsychoJSTrialConfig

| Property | Type | Description |
|----------|------|-------------|
| `trialId` | string | Unique identifier for the trial |
| `trialIndex` | number | Zero-indexed position in experiment |
| `trialType` | string | Type identifier (e.g., "text_entry", "survey") |
| `stimulus` | `StimulusInfo` | Stimulus information |

```typescript
// simple usage
recorder.startTrial("trial_1", textBox._pixi);

// full configuration
recorder.startTrial({
  trialId: "trial_1",
  trialIndex: 0,
  trialType: "free_response",
  stimulus: {
    type: "text",
    content: "Please describe your experience.",
  },
}, textBox._pixi);
```

### Element Extraction

The recorder automatically extracts DOM elements from PsychoJS/PIXI structures. Pass any of these:

- A plain `HTMLElement` (used directly)
- A TextBox's `_pixi` property
- An object with `_input_div` property
- An object with `htmlInput` property

```typescript
// all of these work
recorder.startTrial("trial", textarea);
recorder.startTrial("trial", textBox._pixi);
recorder.startTrial("trial", textBox);
```

### endTrial(response?)

Ends the current trial and returns captured data. Call this in `routineEnd`.

```typescript
endTrial(response?: string | ResponseInfo): CompletedTrial
```

The response parameter accepts either a text string or a full ResponseInfo object. Strings are automatically converted with character and word counts.

```typescript
// simple usage with text response
const data = recorder.endTrial(textBox.text);

// with full response info
const data = recorder.endTrial({
  type: "text",
  value: textBox.text,
  characterCount: textBox.text.length,
  wordCount: textBox.text.trim().split(/\s+/).length,
});
```

### storeInExperiment(psychoJS, key?)

Stores session data in the PsychoJS experiment handler. Call this at experiment end before uploading to Pavlovia.

```typescript
storeInExperiment(psychoJS: unknown, key?: string): void
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `psychoJS` | unknown | (required) | PsychoJS instance |
| `key` | string | `"slopit_session"` | Key to store the session under |

```typescript
// at experiment end
recorder.storeInExperiment(psychoJS);

// with custom key
recorder.storeInExperiment(psychoJS, "behavioral_data");
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

## Complete PsychoPy/PsychoJS Example

Below is a complete example showing integration with a PsychoJS experiment that has a text entry trial.

### Experiment Structure

```
my_experiment/
  my_experiment.psyexp     # PsychoPy experiment file
  my_experiment.js         # Generated PsychoJS code
  slopit_integration.js    # Slopit integration code
  index.html               # Entry point
```

### Integration Code (slopit_integration.js)

```javascript
import { SlopitRecorder } from "@slopit/adapter-psychojs";

// global recorder instance
let slopitRecorder = null;

// call from experiment begin
export function initSlopit(psychoJS, expInfo) {
  slopitRecorder = new SlopitRecorder({
    psychoJS,
    participantId: expInfo["participant"],
    studyId: "text-entry-study",
    metadata: {
      session: expInfo["session"],
      date: expInfo["date"],
    },
  });
}

// call in each trial's routineBegin
export function startTrialCapture(trialId, textBox, stimulus) {
  if (slopitRecorder === null) return;

  slopitRecorder.startTrial({
    trialId,
    trialType: "text_entry",
    stimulus: {
      type: "text",
      content: stimulus,
    },
  }, textBox._pixi);
}

// call in each trial's routineEnd
export function endTrialCapture(response) {
  if (slopitRecorder === null) return null;
  return slopitRecorder.endTrial(response);
}

// call at experiment end
export function finishSlopit(psychoJS) {
  if (slopitRecorder === null) return;
  slopitRecorder.storeInExperiment(psychoJS);
}

// optional: get session for manual handling
export function getSession() {
  if (slopitRecorder === null) return null;
  return slopitRecorder.exportSession();
}
```

### Usage in Generated PsychoJS Code

Modify the generated `my_experiment.js`:

```javascript
import { initSlopit, startTrialCapture, endTrialCapture, finishSlopit } from "./slopit_integration.js";

// ... generated code ...

// in experiment begin routine
async function experimentBeginRoutineBegin(snapshot) {
  // ... generated code ...
  initSlopit(psychoJS, expInfo);
  // ...
}

// in trial routine begin
async function trialRoutineBegin(snapshot) {
  // ... generated code ...
  startTrialCapture(
    `trial_${trials.thisN}`,
    textBox,
    prompt.text
  );
  // ...
}

// in trial routine end
async function trialRoutineEnd(snapshot) {
  // ... generated code ...
  const trialData = endTrialCapture(textBox.text);
  // optionally use trialData for immediate analysis
  // ...
}

// at experiment end
async function experimentEndRoutineEnd(snapshot) {
  // ... generated code ...
  finishSlopit(psychoJS);
  // ...
}
```

## Pavlovia Deployment Notes

When deploying to Pavlovia:

1. **Bundle the adapter**: Use a bundler (e.g., rollup, webpack) to create a single file including the slopit adapter
2. **Add to resources**: Upload the bundled file as a resource in your Pavlovia project
3. **Import in experiment**: Reference the bundled file in your experiment's HTML

### Alternative: CDN Import

For simpler setups, use a CDN:

```html
<script type="module">
  import { SlopitRecorder } from "https://cdn.jsdelivr.net/npm/@slopit/adapter-psychojs/dist/index.js";
  window.SlopitRecorder = SlopitRecorder;
</script>
```

Then access `window.SlopitRecorder` in your experiment code.

## Types

### PsychoJSTrialConfig

Configuration for starting a trial.

```typescript
interface PsychoJSTrialConfig {
  trialId?: string;
  trialIndex?: number;
  trialType?: string;
  stimulus?: StimulusInfo;
}
```

## Platform Notes

- PsychoJS version is detected from `psychoJS.version` or `window.PsychoJS.VERSION`
- The adapter handles PIXI.js TextInput elements automatically
- Session data is stored as a JSON string in the experiment data file
- The stored session appears in Pavlovia exports under the specified key
