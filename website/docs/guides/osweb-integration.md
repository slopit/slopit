---
sidebar_position: 8
---

# OSWeb/OpenSesame Integration Guide

This guide covers how to integrate slopit with OSWeb experiments for running OpenSesame studies online.

## Overview

The `@slopit/adapter-osweb` package provides:

- **SlopitRecorder** (also exported as **OSWebRecorder**): A session recorder designed for OSWeb's limited JavaScript sandbox
- **Prepare/attach pattern**: Works within OSWeb's `inline_javascript` item structure
- Integration with OpenSesame's `vars` object for data storage

OSWeb is the browser runtime for OpenSesame experiments. Due to OSWeb's sandboxed JavaScript environment, the slopit adapter uses a specific pattern that aligns with OpenSesame's prepare/run phases.

## Prerequisites

- OpenSesame 4.0+ with OSWeb extension
- Familiarity with OpenSesame experiment structure
- Understanding of `inline_javascript` items in OpenSesame

## Installation

### In OpenSesame

Add slopit by including it in your experiment's resources or loading via CDN in an `inline_javascript` item:

```javascript
// In the prepare phase of an inline_javascript item
const script = document.createElement("script");
script.src = "https://unpkg.com/@slopit/adapter-osweb/dist/index.umd.js";
document.head.appendChild(script);
```

### For JATOS-Hosted OSWeb

When running OSWeb through JATOS, you can also add slopit to your HTML:

```html
<!-- In your experiment's HTML wrapper -->
<script src="https://unpkg.com/@slopit/adapter-osweb/dist/index.umd.js"></script>
```

## Basic Usage

### The Prepare/Attach Pattern

OSWeb uses a prepare/run phase structure. The slopit adapter follows this pattern:

```javascript
// In an inline_javascript item

// PREPARE PHASE
const slopit = new SlopitRecorder({ varsObject: vars });
slopit.prepareCapture();

// RUN PHASE
await slopit.attachWhenReady("textarea");
// ... wait for participant response ...
slopit.endTrial(vars.response);
vars.slopit_data = slopit.getTrialDataJSON();
```

### Creating the Recorder

Initialize the recorder with the OpenSesame vars object:

```javascript
const recorder = new SlopitRecorder({
    varsObject: vars,  // OpenSesame vars object
    studyId: "my-study",
});
```

### Recording Trials

```javascript
// Prepare phase: Get ready for capture
recorder.prepareCapture();

// Run phase: Attach to element and capture
await recorder.attachWhenReady("textarea");

// When trial ends
recorder.endTrial(vars.response);

// Store data in vars
vars.slopit_data = recorder.getTrialDataJSON();
```

## Complete Example

Create an experiment with slopit behavioral capture:

### 1. Setup Item (inline_javascript)

Create an `inline_javascript` item at the start of your experiment:

**Prepare phase:**
```javascript
// Load slopit if not already loaded
if (typeof SlopitRecorder === "undefined") {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/@slopit/adapter-osweb/dist/index.umd.js";
    document.head.appendChild(script);
}
```

**Run phase:**
```javascript
// Initialize global recorder
window.slopitRecorder = new SlopitRecorder({
    varsObject: vars,
    studyId: vars.experiment_name || "opensesame-study",
});
```

### 2. Trial Item (inline_javascript)

Create an `inline_javascript` item within your trial sequence:

**Prepare phase:**
```javascript
// Prepare capture for this trial
window.slopitRecorder.prepareCapture();
```

**Run phase:**
```javascript
// Wait for the text input to appear and attach capture
try {
    await window.slopitRecorder.attachWhenReady("textarea", 5000);
} catch (error) {
    console.warn("Could not attach to textarea:", error);
}
```

### 3. Response Collection Item

Use a `form_text_display` or custom HTML for text input:

```
# In form_text_display item
prompt: Please describe your experience.
```

### 4. End Trial Item (inline_javascript)

Create an `inline_javascript` item after the response:

**Run phase:**
```javascript
// End capture and store data
window.slopitRecorder.endTrial(vars.response);

// Store in vars for logging
vars.slopit_keystroke_count = window.slopitRecorder.getTrialData()?.behavioral?.keystrokes?.length || 0;
vars.slopit_json = window.slopitRecorder.getTrialDataJSON();
```

### 5. End Experiment Item (inline_javascript)

Create a final `inline_javascript` item:

**Run phase:**
```javascript
// Store complete session
window.slopitRecorder.storeInVars("slopit_session");

// Session data is now in vars.slopit_session
console.log("Session complete:", vars.slopit_session);
```

## Configuration Options

### Recorder Configuration

```javascript
const recorder = new SlopitRecorder({
    // OpenSesame vars object (enables auto-detection of subject_nr)
    varsObject: vars,

    // Participant ID (auto-detected from vars.subject_nr if varsObject provided)
    participantId: "P001",

    // Study identifier
    studyId: "my-study",

    // Additional metadata
    metadata: {
        version: "1.0.0",
    },

    // Behavioral capture settings
    behavioral: {
        keystroke: { enabled: true },
        paste: { enabled: true },
        focus: { enabled: true },
    },
});
```

### Trial Configuration

```javascript
recorder.startTrialWithId("trial_1", element, {
    trialType: "free_response",
    stimulus: {
        type: "text",
        content: "Please describe your experience.",
    },
});
```

## Element Discovery

### Using attachWhenReady

The primary method for finding elements in OSWeb:

```javascript
// Prepare
recorder.prepareCapture();

// Run: Wait for element to appear
await recorder.attachWhenReady("textarea");

// With custom timeout (default: 10000ms)
await recorder.attachWhenReady("textarea", 5000);
```

### With CSS Selectors

Target specific elements:

```javascript
// By ID
await recorder.attachWhenReady("#response-field");

// By class
await recorder.attachWhenReady(".text-input");

// By attribute
await recorder.attachWhenReady("input[type='text']");
```

### Direct Element Reference

If you have direct access to the element:

```javascript
const textarea = document.querySelector("textarea");
recorder.startTrial("trial_1", textarea);
```

## Data Storage

### In OpenSesame Vars

Store data in vars for logging:

```javascript
// Store trial data as JSON
vars.slopit_data = recorder.getTrialDataJSON();

// Store specific metrics
const data = recorder.getTrialData();
if (data) {
    vars.keystroke_count = data.behavioral.keystrokes.length;
    vars.paste_count = data.behavioral.paste.length;
}
```

### Complete Session

Store the entire session:

```javascript
// Store in vars
recorder.storeInVars("slopit_session");

// Or get JSON directly
vars.session_json = recorder.exportSessionJSON();
```

### Accessing Trial Data

```javascript
// Get last trial's data
const trialData = recorder.getTrialData();

if (trialData) {
    console.log("Keystrokes:", trialData.behavioral.keystrokes);
    console.log("Flags:", trialData.flags);
    console.log("Metrics:", trialData.behavioral.metrics);
}
```

## Working with OSWeb Elements

### Form Text Display

The `form_text_display` item creates a textarea. Use this selector:

```javascript
await recorder.attachWhenReady("textarea");
```

### Form Text Input

For single-line inputs:

```javascript
await recorder.attachWhenReady("input[type='text']");
```

### Custom HTML Forms

If using custom HTML in a `form_base` item:

```javascript
// Target specific elements
await recorder.attachWhenReady("#my-custom-input");
```

### Sketchpad with JavaScript

When using sketchpad with embedded HTML:

```javascript
// The sketchpad may create elements dynamically
// Use a longer timeout
await recorder.attachWhenReady("textarea", 15000);
```

## JATOS Integration

When running OSWeb through JATOS, combine both adapters:

```javascript
// Initialize OSWeb recorder
const recorder = new SlopitRecorder({ varsObject: vars });

// At experiment end, submit to JATOS
jatos.onLoad(function() {
    // Your experiment runs here

    // At the end:
    const session = recorder.exportSession();
    jatos.submitResultData({ slopit: session })
        .then(() => jatos.endStudy());
});
```

## Data Export

### From OpenSesame

Data stored in vars appears in your log file columns:

| subject_nr | response | slopit_data |
|------------|----------|-------------|
| 1 | My response... | `{"behavioral":{"keystrokes":[...]}}` |

### Processing with Python

```python
import pandas as pd
import json

# Load OpenSesame log file
df = pd.read_csv("experiment_log.csv")

# Parse slopit data
def parse_slopit(json_str):
    try:
        return json.loads(json_str)
    except:
        return None

df["slopit_parsed"] = df["slopit_data"].apply(parse_slopit)

# Extract keystroke counts
df["keystroke_count"] = df["slopit_parsed"].apply(
    lambda x: len(x["behavioral"]["keystrokes"]) if x else 0
)

# Check for paste events
df["has_paste"] = df["slopit_parsed"].apply(
    lambda x: len(x["behavioral"]["paste"]) > 0 if x else False
)
```

## Troubleshooting

### Element Not Found

If `attachWhenReady` times out:

```javascript
try {
    await recorder.attachWhenReady("textarea", 10000);
} catch (error) {
    console.error("Element not found:", error);
    // Continue without behavioral capture
    recorder.startTrial("trial_fallback");
}
```

Check that:
1. The form item displays before the inline_javascript runs
2. The selector matches the actual element
3. The timeout is long enough

### prepareCapture Not Called

Always call `prepareCapture()` before `attachWhenReady()`:

```javascript
// Correct
recorder.prepareCapture();
await recorder.attachWhenReady("textarea");

// Wrong: Will throw error
await recorder.attachWhenReady("textarea");  // Error: Call prepareCapture() first
```

### Data Not in Vars

Ensure you call the storage method:

```javascript
// After endTrial()
recorder.endTrial(vars.response);

// Must explicitly store
vars.slopit_data = recorder.getTrialDataJSON();
```

### Multiple Trials

Reset capture for each trial:

```javascript
// Trial 1
recorder.prepareCapture();
await recorder.attachWhenReady("textarea");
// ... trial runs ...
recorder.endTrial(vars.response_1);
vars.slopit_trial_1 = recorder.getTrialDataJSON();

// Trial 2 (call prepareCapture again)
recorder.prepareCapture();
await recorder.attachWhenReady("textarea");
// ... trial runs ...
recorder.endTrial(vars.response_2);
vars.slopit_trial_2 = recorder.getTrialDataJSON();
```

### OSWeb Sandbox Limitations

OSWeb runs in a limited sandbox. Some operations may not work:

```javascript
// May not work in OSWeb sandbox
localStorage.setItem("data", json);  // Limited storage access

// Use vars instead
vars.slopit_data = json;  // Works in OSWeb
```

### Version Detection

OSWeb version detection may return "unknown":

```javascript
// This is normal - OSWeb doesn't expose version consistently
const recorder = new SlopitRecorder({ varsObject: vars });
// Platform version will be "unknown" but adapter still works
```

### Async/Await Support

OSWeb supports async/await in the run phase:

```javascript
// Prepare phase: synchronous only
recorder.prepareCapture();

// Run phase: async supported
await recorder.attachWhenReady("textarea");
await someOtherAsyncOperation();
```

If async doesn't work, use promises:

```javascript
// Alternative using promises
recorder.attachWhenReady("textarea")
    .then(() => {
        console.log("Attached successfully");
    })
    .catch((error) => {
        console.error("Failed to attach:", error);
    });
```
