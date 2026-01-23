---
sidebar_position: 8
---

# @slopit/adapter-pcibex API Reference

Integration adapter for [PCIbex](https://doc.pcibex.net/) (PennController for IBEX) experiments. Provides both an element-based API that mirrors PCIbex's fluent style and a session recorder for advanced use cases.

## Installation

```bash
pnpm add @slopit/adapter-pcibex
```

## When to Use This Package

Use `@slopit/adapter-pcibex` when:

- Running experiments on the PCIbex Farm
- Using PennController's TextInput or other form elements
- Building linguistics or psycholinguistics studies with IBEX

## Quick Start

### Element-Based API (Recommended)

```javascript
// mirror PCIbex's newX/getX pattern
newSlopit("capture")
  .attach(getTextInput("answer"))
  .keystroke(true)
  .paste(true, false)

// later in the trial
getSlopit("capture").log()

// get all captured data
const data = getAllSlopitData();
```

### Recorder-Based API

```typescript
import { PCIbexRecorder } from "@slopit/adapter-pcibex";

const recorder = new PCIbexRecorder({
  participantId: "P001",
  studyId: "study-123",
});

recorder.startTrial({ trialType: "text-entry" });
// ... participant completes trial ...
recorder.endTrial({ type: "text", value: "response text" });

const session = recorder.exportSession();
```

## Element-Based API

The element-based API provides PCIbex-style functions that create and manage slopit capture elements.

### newSlopit(name)

Creates a new slopit element for behavioral capture.

```typescript
function newSlopit(name: string): SlopitElement
```

```javascript
newSlopit("capture")
  .attach(getTextInput("answer"))
  .keystroke(true)
  .paste(true, false)
```

### getSlopit(name)

Retrieves a previously created slopit element by name.

```typescript
function getSlopit(name: string): SlopitElement | undefined
```

```javascript
getSlopit("capture").log();
```

### SlopitElement Methods

#### attach(element)

Attaches behavioral capture to a PennController element.

```typescript
attach(element: PennElement): SlopitElement
```

```javascript
newSlopit("capture")
  .attach(getTextInput("response"))
```

#### keystroke(enabled)

Enables or disables keystroke capture.

```typescript
keystroke(enabled: boolean): SlopitElement
```

#### paste(enabled, capture?)

Enables or disables paste event capture.

```typescript
paste(enabled: boolean, capture?: boolean): SlopitElement
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `enabled` | boolean | - | Enable paste detection |
| `capture` | boolean | `true` | Capture pasted text content |

```javascript
// capture paste events and their content
.paste(true, true)

// detect paste events without capturing content
.paste(true, false)
```

#### focus(enabled)

Enables or disables focus event capture.

```typescript
focus(enabled: boolean): SlopitElement
```

#### mouse(enabled)

Enables or disables mouse event capture.

```typescript
mouse(enabled: boolean): SlopitElement
```

#### scroll(enabled)

Enables or disables scroll event capture.

```typescript
scroll(enabled: boolean): SlopitElement
```

#### log()

Finalizes capture and stores data. Call this before ending the trial.

```typescript
log(): SlopitElement
```

```javascript
getSlopit("capture").log()
```

### getAllSlopitData()

Gets data from all registered slopit elements.

```typescript
function getAllSlopitData(): Record<string, AdapterData | null>
```

```javascript
const allData = getAllSlopitData();
console.log(allData["capture"]);
// { behavioral: {...}, flags: [...] }
```

### clearSlopitElements()

Clears all slopit elements from the registry. Call this between trials if reusing element names.

```typescript
function clearSlopitElements(): void
```

### getSlopitCount()

Gets the number of registered slopit elements.

```typescript
function getSlopitCount(): number
```

## Complete PCIbex Example

```javascript
// main.js for PCIbex Farm

// import slopit functions (assumes bundled or available globally)
const { newSlopit, getSlopit, getAllSlopitData, clearSlopitElements } = window.slopit;

PennController.ResetPrefix(null);

// instructions trial
newTrial("instructions",
  newHtml("instructions", "instructions.html")
    .print()
  ,
  newButton("continue", "Continue")
    .print()
    .wait()
)

// text entry trial with behavioral capture
newTrial("writing",
  newText("prompt", "Please describe your morning routine:")
    .print()
  ,
  newTextInput("response", "")
    .lines(6)
    .size("100%", "auto")
    .print()
  ,
  // create and configure slopit capture
  newSlopit("capture")
    .attach(getTextInput("response"))
    .keystroke(true)
    .paste(true, true)
    .focus(true)
  ,
  newButton("submit", "Submit")
    .print()
    .wait()
  ,
  // log the captured data
  getSlopit("capture").log()
  ,
  // store the response text
  getTextInput("response")
    .test.text()
    .success(
      getTextInput("response")
        .setVar("response")
    )
  ,
  // store slopit data in results
  newFunction("store-slopit", function() {
    const data = getAllSlopitData();
    PennController.Header().log("slopit", JSON.stringify(data));
  }).call()
  ,
  // clear for next trial
  newFunction("clear-slopit", function() {
    clearSlopitElements();
  }).call()
)
.log("response", getVar("response"))

// debrief
newTrial("debrief",
  newText("thanks", "Thank you for participating!")
    .print()
  ,
  newButton("finish", "Finish")
    .print()
    .wait()
)
```

## PCIbexRecorder

Session recorder for more complex PCIbex experiments requiring session-level management.

### Constructor

```typescript
new PCIbexRecorder(config?: RecorderConfig)
```

```typescript
const recorder = new PCIbexRecorder({
  participantId: GetURLParameter("PROLIFIC_PID"),
  studyId: "linguistics-study",
});
```

### Methods

Inherits all methods from [BaseRecorder](./adapter-shared.md#baserecorder):

- `startTrial(config)` - Start a new trial
- `endTrial(response?, platformData?)` - End the current trial
- `attachCapture(element, startTime?)` - Attach capture to an element
- `detachCapture()` - Detach capture without ending trial
- `exportSession()` - Export session data
- `getCurrentTrial()` - Get current trial state
- `getTrials()` - Get all completed trials
- `isTrialInProgress()` - Check if trial is active
- `getSessionId()` - Get session identifier
- `reset()` - Reset for a new session

### createPCIbexRecorder(config?)

Factory function for creating PCIbexRecorder instances.

```typescript
function createPCIbexRecorder(config?: RecorderConfig): PCIbexRecorder
```

```typescript
const recorder = createPCIbexRecorder({
  participantId: urlParams.get("PROLIFIC_PID"),
  studyId: "my-experiment",
});
```

## Extracting DOM Elements from PennController

PennController elements wrap underlying DOM elements in various ways. The adapter handles these structures:

```typescript
interface PennElement {
  _element?: HTMLElement;           // direct element reference
  jQueryElement?: JQueryLike;       // TextInput elements
  jQueryContainer?: JQueryLike;     // container-based elements
}
```

For TextInput elements, the adapter extracts the element automatically:

```javascript
// both of these work
.attach(getTextInput("response"))
.attach(getTextInput("response")._element)
```

## Types

### PCIbexSlopitConfig

Configuration for slopit capture.

```typescript
interface PCIbexSlopitConfig extends AdapterConfig {
  autoLog?: boolean;  // auto-log when element removed (default: false)
}
```

### SlopitElement

Interface for slopit elements.

```typescript
interface SlopitElement {
  attach(element: PennElement): SlopitElement;
  keystroke(enabled: boolean): SlopitElement;
  paste(enabled: boolean, capture?: boolean): SlopitElement;
  focus(enabled: boolean): SlopitElement;
  mouse(enabled: boolean): SlopitElement;
  scroll(enabled: boolean): SlopitElement;
  log(): SlopitElement;
  _getData(): AdapterData | null;
}
```

### AdapterData

Data collected by the adapter.

```typescript
interface AdapterData {
  behavioral: BehavioralData;
  flags: CaptureFlag[];
}
```

## Platform Notes

- PCIbex/PennController version is detected from `window.PennController.version` if available
- Elements must be printed before attach() can find them
- Use element discovery if the element is created dynamically
- The element-based API uses a global registry; call `clearSlopitElements()` between trials when reusing names
- Data logged with `PennController.Header().log()` appears in the PCIbex Farm results file

## Integration with PCIbex Farm

To use this adapter on the PCIbex Farm:

1. **Bundle the adapter** using a tool like rollup or webpack
2. **Upload the bundle** as a resource file in your PCIbex project
3. **Include via script tag** in your experiment's HTML chunk

```html
<!-- in a Html element or chunk -->
<script src="slopit-bundle.js"></script>
<script>
  window.slopit = {
    newSlopit: window.SloPIt.newSlopit,
    getSlopit: window.SloPIt.getSlopit,
    getAllSlopitData: window.SloPIt.getAllSlopitData,
    clearSlopitElements: window.SloPIt.clearSlopitElements,
  };
</script>
```

Then use `window.slopit.newSlopit()` etc. in your PennController code.
