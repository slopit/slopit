---
sidebar_position: 4
---

# PsychoJS/Pavlovia Integration Guide

This guide covers how to integrate slopit with PsychoJS experiments for deployment on Pavlovia.

## Overview

The `@slopit/adapter-psychojs` package provides:

- **SlopitRecorder** (also exported as **PsychoJSRecorder**): A session recorder that handles PIXI.js element extraction and PsychoJS experiment handler integration
- Automatic DOM element extraction from PsychoJS TextBox components
- Direct integration with PsychoJS experiment data storage

PsychoJS is the JavaScript implementation of PsychoPy, designed for running experiments on Pavlovia. The slopit adapter handles the complexity of extracting DOM elements from PsychoJS's PIXI.js-based rendering system.

## Prerequisites

- A PsychoJS experiment (PsychoPy 2021.2+ recommended)
- Pavlovia account for online deployment
- Familiarity with PsychoJS code components (inline code)

## Installation

### For Bundled Experiments

If you bundle your experiment with a build tool:

```bash
pnpm add @slopit/adapter-psychojs
```

### For Pavlovia Direct Deployment

Add the slopit library to your experiment's `index.html`:

```html
<script src="https://unpkg.com/@slopit/adapter-psychojs/dist/index.umd.js"></script>
```

Or import in your experiment's code component:

```javascript
// In Begin Experiment
import { SlopitRecorder } from "@slopit/adapter-psychojs";
```

## Basic Usage

### Creating the Recorder

Initialize the recorder at experiment start:

```javascript
// In Begin Experiment
const recorder = new SlopitRecorder({
  psychoJS: psychoJS,
  participantId: expInfo["participant"],
  studyId: expInfo["study_id"] || "my-study",
});
```

### Recording a Trial

In your routine's code components:

```javascript
// In Begin Routine (for a routine with a TextBox named "textBox")
recorder.startTrial("trial_" + trials.thisN, textBox._pixi);
```

```javascript
// In End Routine
const trialData = recorder.endTrial(textBox.text);
```

### Storing Session Data

```javascript
// In End Experiment
recorder.storeInExperiment(psychoJS);
```

## Complete Example

This example shows a full PsychoJS experiment with slopit integration.

### Begin Experiment

```javascript
// Initialize slopit recorder
const slopitRecorder = new SlopitRecorder({
  psychoJS: psychoJS,
  participantId: expInfo["participant"],
  studyId: "writing-study-001",
});

// Track trial index for naming
let trialIndex = 0;
```

### Begin Routine (for each text entry routine)

```javascript
// Start behavioral capture
// textBox is your PsychoJS TextBox component
slopitRecorder.startTrial({
  trialId: `trial_${trialIndex}`,
  trialIndex: trialIndex,
  trialType: "free_response",
  stimulus: {
    type: "text",
    content: currentPrompt,  // Your trial's prompt variable
  },
}, textBox._pixi);
```

### End Routine

```javascript
// End the trial and collect data
const trialResult = slopitRecorder.endTrial(textBox.text);

// Optionally log trial-level data
psychoJS.experiment.addData("slopit_keystroke_count",
  trialResult.behavioral?.keystrokes?.length || 0);
psychoJS.experiment.addData("slopit_paste_detected",
  trialResult.captureFlags?.some(f => f.type === "paste_detected") || false);

trialIndex++;
```

### End Experiment

```javascript
// Store complete session in experiment data
slopitRecorder.storeInExperiment(psychoJS);

// The session data will be saved with your experiment results
```

## Configuration Options

### Recorder Configuration

```javascript
const recorder = new SlopitRecorder({
  // PsychoJS instance for version detection
  psychoJS: psychoJS,

  // Participant identifier (from expInfo dialog)
  participantId: expInfo["participant"],

  // Study identifier
  studyId: "my-study",

  // Session-level metadata
  metadata: {
    condition: expInfo["condition"],
    version: "1.2.0",
  },

  // Behavioral capture settings (applied to all trials)
  behavioral: {
    keystroke: { enabled: true, captureKeyUp: true },
    paste: { enabled: true, capturePreview: true },
    focus: { enabled: true, useVisibilityAPI: true },
  },
});
```

### Trial Configuration

```javascript
recorder.startTrial({
  // Unique trial identifier
  trialId: "trial_1",

  // Trial position (auto-incremented if not provided)
  trialIndex: 0,

  // Trial type for categorization
  trialType: "free_response",

  // Stimulus information
  stimulus: {
    type: "text",
    content: "Please describe your experience.",
  },
}, element);
```

## Working with PsychoJS Components

### TextBox Component

PsychoJS TextBox components render an HTML input element inside a PIXI container. The adapter extracts the DOM element automatically:

```javascript
// The _pixi property contains the PIXI representation
// which internally holds the HTML input element
recorder.startTrial("trial_1", textBox._pixi);
```

### Manual Element Access

If automatic extraction fails, access the element directly:

```javascript
// Some versions use _input_div
const element = textBox._pixi?._input_div;

// Or search for the input in the document
const element = document.querySelector("input[type='text']");

recorder.startTrial("trial_1", element);
```

### TextStim with Editable Content

For editable TextStim components:

```javascript
// TextStim may expose element differently
const element = textStim._pixi?.htmlInput;
recorder.startTrial("trial_1", element);
```

## Data Export

### Automatic Storage

The `storeInExperiment()` method stores the complete session as a JSON string in your experiment data:

```javascript
recorder.storeInExperiment(psychoJS);
// Data appears in the "slopit_session" column
```

### Custom Storage Key

```javascript
recorder.storeInExperiment(psychoJS, "behavioral_data");
// Data appears in the "behavioral_data" column
```

### Manual Export

Export the session object directly:

```javascript
const session = recorder.exportSession();

// Store as multiple columns
psychoJS.experiment.addData("slopit_participant", session.participantId);
psychoJS.experiment.addData("slopit_trials", JSON.stringify(session.trials));
```

### Server Submission

Submit data to your own server before Pavlovia upload:

```javascript
// In End Experiment
const session = recorder.exportSession();

try {
  await fetch("https://your-server.com/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(session),
  });
} catch (error) {
  console.error("Server submission failed:", error);
  // Data will still be saved to Pavlovia
}

// Always store in experiment for Pavlovia backup
recorder.storeInExperiment(psychoJS);
```

## Pavlovia Deployment

### Project Setup

1. Export your PsychoPy experiment for online use
2. Add the slopit script to `index.html` or bundle it with your code
3. Push to Pavlovia

### Data Access

After running participants:

1. Download your data from Pavlovia
2. The `slopit_session` column contains JSON data
3. Parse the JSON to access behavioral metrics:

```python
import pandas as pd
import json

df = pd.read_csv("data.csv")

# Parse slopit sessions
df["slopit_parsed"] = df["slopit_session"].apply(
    lambda x: json.loads(x) if pd.notna(x) else None
)

# Extract keystroke counts per trial
def get_keystroke_count(session, trial_idx):
    if session is None:
        return None
    trial = session["trials"][trial_idx]
    return len(trial.get("behavioral", {}).get("keystrokes", []))

df["trial_0_keystrokes"] = df["slopit_parsed"].apply(
    lambda s: get_keystroke_count(s, 0)
)
```

## Troubleshooting

### Element Not Found

If the recorder cannot find the DOM element from the PIXI component:

```javascript
// Check if _pixi exists
console.log("TextBox _pixi:", textBox._pixi);

// Try manual element discovery
const inputElement = document.querySelector("input, textarea");
if (inputElement) {
  recorder.startTrial("trial_1", inputElement);
} else {
  // Start trial without element (no behavioral capture)
  recorder.startTrial("trial_1");
  console.warn("No input element found for behavioral capture");
}
```

### Capture Not Working

Verify the element is correctly passed:

```javascript
// Log element extraction
recorder.startTrial({
  trialId: "trial_1",
  trialType: "debug",
}, textBox._pixi);

// Check if capture is active
console.log("Trial started, element attached");
```

### Session Data Empty

Ensure `endTrial()` is called for each trial:

```javascript
// In End Routine
const result = recorder.endTrial(textBox.text);
console.log("Trial result:", result);  // Should contain behavioral data
```

### PsychoJS Version Issues

The adapter attempts to detect PsychoJS version automatically. If detection fails:

```javascript
// Version will show as "unknown" in session metadata
// This does not affect functionality
const recorder = new SlopitRecorder({
  psychoJS: psychoJS,  // Pass instance for version detection
  // ...
});
```

### Pavlovia Data Size Limits

Large behavioral datasets may approach Pavlovia's data limits. Consider:

```javascript
// Reduce data by disabling unnecessary capture
const recorder = new SlopitRecorder({
  psychoJS,
  participantId: expInfo["participant"],
  behavioral: {
    keystroke: { enabled: true, captureKeyUp: false },  // Skip keyup events
    mouse: { enabled: false },  // Disable mouse tracking
    scroll: { enabled: false },  // Disable scroll tracking
  },
});
```

### Concurrent Experiments

If running multiple experiments or conditions:

```javascript
// Use unique study IDs
const recorder = new SlopitRecorder({
  psychoJS,
  participantId: expInfo["participant"],
  studyId: `study-${expInfo["condition"]}-v1`,
});
```
