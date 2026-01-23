---
sidebar_position: 11
---

# @slopit/adapter-osweb API Reference

Integration adapter for [OSWeb](https://osdoc.cogsci.nl/3.3/manual/osweb/osweb/) (OpenSesame Web). Provides session recording compatible with OSWeb's inline_javascript items and limited JavaScript sandbox.

## Installation

```bash
pnpm add @slopit/adapter-osweb
```

## When to Use This Package

Use `@slopit/adapter-osweb` when:

- Running OpenSesame experiments online via OSWeb
- Using inline_javascript items for custom functionality
- Deploying OpenSesame studies to JATOS, Pavlovia, or other platforms

## Quick Start

```javascript
// in prepare phase of inline_javascript
const slopit = new SlopitRecorder({ varsObject: vars });
slopit.prepareCapture();

// in run phase
await slopit.attachWhenReady("textarea");

// ... wait for response ...

slopit.endTrial(vars.response);
vars.slopit_data = slopit.getTrialDataJSON();
```

## SlopitRecorder / OSWebRecorder

Session recorder designed for OSWeb's JavaScript sandbox. Uses a prepare/attach pattern that works within inline_javascript items.

Both `SlopitRecorder` and `OSWebRecorder` refer to the same class.

### Constructor

```typescript
new SlopitRecorder(config?: OSWebRecorderConfig)
new OSWebRecorder(config?: OSWebRecorderConfig)
```

The recorder automatically extracts `participantId` from `vars.subject_nr` if a vars object is provided.

#### OSWebRecorderConfig

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `participantId` | string | `vars.subject_nr` | Participant identifier (auto-detected) |
| `studyId` | string | - | Study identifier |
| `metadata` | `Record<string, unknown>` | - | Session-level metadata |
| `behavioral` | `BehavioralCaptureConfig` | - | Default behavioral capture settings |
| `varsObject` | `OSWebVars` | - | OpenSesame vars object for storing data |

```javascript
const recorder = new SlopitRecorder({
  varsObject: vars,
  studyId: "my-study",
});
```

### prepareCapture()

Prepares capture for the next trial. Call this in the **prepare phase** of an inline_javascript item.

```typescript
prepareCapture(): void
```

```javascript
// in prepare phase
slopit.prepareCapture();
```

### attachWhenReady(selector, timeout?)

Attaches to an element when it becomes available. Call this in the **run phase**. Uses a MutationObserver to wait for dynamically created elements.

```typescript
attachWhenReady(selector: string, timeout?: number): Promise<void>
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `selector` | string | (required) | CSS selector for target element |
| `timeout` | number | `10000` | Max time to wait in milliseconds |

**Returns:** Promise that resolves when attached.

**Throws:**
- Error if `prepareCapture()` was not called first
- Error if element not found within timeout

```javascript
// in run phase
await slopit.attachWhenReady("textarea");
```

### startTrial(trialId, element?, trialConfig?)

Alternative to `attachWhenReady()` when you have direct access to the target element.

```typescript
// string-based call
startTrial(trialId: string, element?: HTMLElement, trialConfig?: Partial<TrialConfig>): void

// config-based call
startTrial(config: TrialConfig): void
```

```javascript
const textarea = document.querySelector("textarea");
slopit.startTrial("response-1", textarea);
```

### endTrial(response?)

Ends the current trial and stores data.

```typescript
endTrial(response?: string | ResponseInfo): CompletedTrial
```

```javascript
// with text response
slopit.endTrial(vars.response);

// with ResponseInfo object
slopit.endTrial({
  type: "text",
  value: vars.response,
  characterCount: vars.response.length,
});
```

### getTrialData()

Gets the last trial's behavioral data for storage in OSWeb vars.

```typescript
getTrialData(): AdapterData | null
```

```javascript
const data = slopit.getTrialData();
if (data) {
  vars.keystroke_count = data.behavioral.keystrokes.length;
}
```

### getTrialDataJSON()

Gets the last trial's data as a JSON string.

```typescript
getTrialDataJSON(): string
```

```javascript
vars.slopit_data = slopit.getTrialDataJSON();
```

### storeInVars(key?)

Stores session data in the OSWeb vars object.

```typescript
storeInVars(key?: string): void
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `key` | string | `"slopit_session"` | Variable name for storage |

```javascript
// at end of experiment
slopit.storeInVars("slopit_session");
```

### exportSession()

Exports the session data in SlopitSession format.

```typescript
exportSession(): SlopitSession
```

### exportSessionJSON()

Exports session as a JSON string.

```typescript
exportSessionJSON(): string
```

```javascript
console.log(slopit.exportSessionJSON());
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

## OSWeb Integration Guide

### Setting Up the Recorder

In OpenSesame, create an inline_javascript item at the start of your experiment:

**Prepare phase:**
```javascript
// create recorder (once per experiment)
if (typeof window.slopit === "undefined") {
  window.slopit = new SlopitRecorder({
    varsObject: vars,
    studyId: "my-experiment",
  });
}
```

**Run phase:**
```javascript
// nothing needed here for initialization
```

### Capturing Text Entry

Create an inline_javascript item before your text entry form:

**Prepare phase:**
```javascript
window.slopit.prepareCapture();
```

**Run phase:**
```javascript
// wait for the textarea to appear
await window.slopit.attachWhenReady("textarea");
```

After the text entry form, create another inline_javascript item:

**Prepare phase:**
```javascript
// nothing needed
```

**Run phase:**
```javascript
// end capture and store data
window.slopit.endTrial(vars.response_text);
vars.slopit_trial_data = window.slopit.getTrialDataJSON();
```

### Storing Session Data

At the end of your experiment, create an inline_javascript item:

**Prepare phase:**
```javascript
// nothing needed
```

**Run phase:**
```javascript
// store complete session
window.slopit.storeInVars("slopit_session");

// log completion
console.log("Slopit session stored");
```

## Complete OSWeb Example

### Experiment Structure

```
experiment
├── welcome (sketchpad)
├── slopit_init (inline_javascript)
├── instructions (sketchpad)
├── trial_loop (loop)
│   ├── trial_prepare (inline_javascript)
│   ├── writing_prompt (sketchpad with form_text_input)
│   └── trial_end (inline_javascript)
├── slopit_save (inline_javascript)
└── goodbye (sketchpad)
```

### slopit_init (inline_javascript)

**Prepare phase:**
```javascript
// initialize slopit recorder
window.slopit = new SlopitRecorder({
  varsObject: vars,
  studyId: "text-entry-study",
});
```

**Run phase:**
```javascript
console.log("Slopit initialized for participant:", vars.subject_nr);
```

### trial_prepare (inline_javascript)

**Prepare phase:**
```javascript
// prepare capture for this trial
window.slopit.prepareCapture();
```

**Run phase:**
```javascript
// wait for textarea to appear and attach
try {
  await window.slopit.attachWhenReady("textarea", 5000);
  console.log("Capture attached for trial", vars.trial_count);
} catch (error) {
  console.warn("Could not attach capture:", error.message);
}
```

### trial_end (inline_javascript)

**Prepare phase:**
```javascript
// nothing needed
```

**Run phase:**
```javascript
// end capture with response
const response = vars.response_text || "";
window.slopit.endTrial(response);

// store trial data in experiment variable
vars.slopit_trial = window.slopit.getTrialDataJSON();

// log trial info
const data = window.slopit.getTrialData();
if (data) {
  console.log(`Trial ${vars.trial_count}: ${data.behavioral.keystrokes.length} keystrokes`);
}
```

### slopit_save (inline_javascript)

**Prepare phase:**
```javascript
// nothing needed
```

**Run phase:**
```javascript
// store complete session
window.slopit.storeInVars("slopit_session");

// log summary
const session = window.slopit.exportSession();
console.log(`Session complete: ${session.trials.length} trials`);
```

## Working with form_text_input

OSWeb's `form_text_input` creates a textarea element. The typical selector is:

```javascript
await slopit.attachWhenReady("textarea");
```

If your form has multiple textareas, use a more specific selector:

```javascript
// by class
await slopit.attachWhenReady("textarea.response");

// by id (if you set one in the form)
await slopit.attachWhenReady("#response_textarea");
```

## Types

### OSWebRecorderConfig

Configuration for the OSWeb recorder.

```typescript
interface OSWebRecorderConfig extends RecorderConfig {
  varsObject?: OSWebVars;
}
```

### OSWebVars

OpenSesame vars object interface.

```typescript
interface OSWebVars {
  [key: string]: unknown;
  subject_nr?: number;
  subject_parity?: string;
}
```

### OSWebRunner

OSWeb runner interface.

```typescript
interface OSWebRunner {
  experiment: {
    vars: OSWebVars;
    items: Record<string, unknown>;
  };
}
```

## Platform Notes

- OSWeb version is detected from `window.osweb.version` if available
- The prepare/run phase pattern matches OpenSesame's item execution model
- Use `attachWhenReady()` because form elements are created dynamically
- Store data in `vars` to include it in the experiment's output file
- Large JSON strings in vars may need careful handling in post-processing
- The `varsObject` reference allows the recorder to write directly to experiment variables

## Data Access After Experiment

When you export data from OSWeb (via JATOS or other backends):

```python
import json
import pandas as pd

# load experiment data
df = pd.read_csv("experiment_data.csv")

# parse slopit sessions
df["slopit_parsed"] = df["slopit_session"].apply(
    lambda x: json.loads(x) if pd.notna(x) else None
)

# extract keystroke counts
df["total_keystrokes"] = df["slopit_parsed"].apply(
    lambda s: sum(len(t["behavioral"]["keystrokes"]) for t in s["trials"]) if s else 0
)
```
