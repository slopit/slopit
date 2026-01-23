---
sidebar_position: 6
---

# Gorilla Integration Guide

This guide covers how to integrate slopit with Gorilla experiments.

## Overview

The `@slopit/adapter-gorilla` package provides:

- **SlopitRecorder** (also exported as **GorillaRecorder**): A session recorder integrated with Gorilla's data storage APIs
- **Auto-store mode**: Automatically store trial data via `gorilla.store()` after each trial
- **Session storage**: Store complete sessions via `gorilla.metric()` for export

Gorilla is a cloud-based experiment builder for behavioral research. The slopit adapter integrates with Gorilla's JavaScript API to capture and store behavioral data alongside your experiment results.

## Prerequisites

- A Gorilla account with experiment builder access
- Familiarity with Gorilla's Code Editor zone
- Understanding of Gorilla's data storage (metrics and stores)

## Installation

### In Gorilla Code Editor

Add slopit via CDN in your Code Editor zone:

```html
<!-- In the HTML panel -->
<script src="https://unpkg.com/@slopit/adapter-gorilla/dist/index.umd.js"></script>
```

Or load it dynamically in JavaScript:

```javascript
// In the JS panel
const script = document.createElement("script");
script.src = "https://unpkg.com/@slopit/adapter-gorilla/dist/index.umd.js";
script.onload = () => {
    // Initialize slopit after loading
    initializeExperiment();
};
document.head.appendChild(script);
```

### Using the Resource Library

1. Download the slopit UMD bundle
2. Upload to Gorilla's Resource Library
3. Reference in your experiment using `gorilla.stimuliURL()`

```javascript
const script = document.createElement("script");
script.src = gorilla.stimuliURL("slopit-adapter-gorilla.umd.js");
document.head.appendChild(script);
```

## Basic Usage

### Creating the Recorder

Initialize the recorder when Gorilla is ready:

```javascript
gorilla.ready(function() {
    const recorder = new SlopitRecorder({
        participantId: gorilla.retrieve("participantId"),
        studyId: "my-study",
    });

    // Continue with experiment setup
});
```

### Recording Trials

```javascript
// When a text entry trial begins
const textarea = document.getElementById("response");
recorder.startTrial("trial_1", textarea);

// When the participant submits
const response = textarea.value;
recorder.endTrial(response);
```

### Storing the Session

```javascript
// At experiment end
recorder.storeSession();
gorilla.finish();
```

## Complete Example

```javascript
gorilla.ready(function() {
    // Initialize recorder
    const recorder = new SlopitRecorder({
        participantId: gorilla.retrieve("participantId"),
        studyId: "writing-study-001",
    });

    // Trial prompts
    const prompts = [
        "Describe your typical morning routine.",
        "Explain how to prepare your favorite meal.",
        "Describe a memorable travel experience.",
    ];

    let currentTrial = 0;

    // Display trial
    function showTrial() {
        if (currentTrial >= prompts.length) {
            endExperiment();
            return;
        }

        // Build trial UI
        document.getElementById("content").innerHTML = `
            <h2>Task ${currentTrial + 1} of ${prompts.length}</h2>
            <p>${prompts[currentTrial]}</p>
            <textarea id="response" rows="6" style="width: 100%;"></textarea>
            <br><br>
            <button id="submit">Continue</button>
        `;

        const textarea = document.getElementById("response");
        const submitBtn = document.getElementById("submit");

        // Start behavioral capture
        recorder.startTrial(`trial_${currentTrial}`, textarea, {
            trialType: "free_response",
            stimulus: {
                type: "text",
                content: prompts[currentTrial],
            },
        });

        // Handle submission
        submitBtn.addEventListener("click", function() {
            const response = textarea.value;

            // End trial and store data
            const trialData = recorder.endTrial(response);

            // Store response in Gorilla
            gorilla.store(`response_${currentTrial}`, response);

            // Move to next trial
            currentTrial++;
            showTrial();
        });
    }

    // End experiment
    function endExperiment() {
        // Store complete session as metric
        recorder.storeSession();

        // Show completion
        document.getElementById("content").innerHTML = `
            <h2>Thank You!</h2>
            <p>Your responses have been recorded.</p>
        `;

        // Finish Gorilla
        setTimeout(() => {
            gorilla.finish();
        }, 2000);
    }

    // Start first trial
    showTrial();
});
```

## Configuration Options

### Recorder Configuration

```javascript
const recorder = new SlopitRecorder({
    // Participant identifier
    participantId: gorilla.retrieve("participantId"),

    // Study identifier
    studyId: "my-study",

    // Auto-store trial data after each endTrial()
    autoStore: false,  // default: false

    // Key prefix for gorilla.store() calls
    storeKey: "slopit",  // default: "slopit"

    // Additional metadata
    metadata: {
        version: "1.0.0",
        condition: gorilla.retrieve("condition"),
    },

    // Behavioral capture settings
    behavioral: {
        keystroke: { enabled: true },
        paste: { enabled: true },
        focus: { enabled: true },
    },
});
```

### Auto-Store Mode

Enable automatic storage of trial data:

```javascript
const recorder = new SlopitRecorder({
    autoStore: true,
    storeKey: "behavioral",
});

// Each endTrial() automatically calls:
// gorilla.store("behavioral_trial_0", { behavioral: ..., captureFlags: ... });
// gorilla.store("behavioral_trial_1", { behavioral: ..., captureFlags: ... });
// etc.
```

### Trial Configuration

```javascript
recorder.startTrial("trial_1", textarea, {
    // Trial type identifier
    trialType: "free_response",

    // Stimulus information
    stimulus: {
        type: "text",
        content: "Please describe your experience.",
    },
});
```

## Element Discovery

### Direct Element Reference

```javascript
const textarea = document.getElementById("response");
recorder.startTrial("trial_1", textarea);
```

### Using CSS Selectors

For dynamically created elements, use `startTrialWithSelector()`:

```javascript
// Start trial and wait for element to appear
recorder.startTrialWithSelector("trial_1", "textarea.response-input");

// Or with a specific container
const container = document.getElementById("trial-container");
recorder.startTrialWithSelector("trial_1", "textarea", container);
```

### Deferred Attachment

Start the trial first, then attach capture when the element is available:

```javascript
// Start trial without element
recorder.startTrial({ trialId: "trial_1" });

// Later, when element is created
const textarea = document.querySelector("textarea");
recorder.attachCapture(textarea);
```

## Data Storage

### Session Storage (Recommended)

Store the complete session as a metric:

```javascript
// Stores as "slopit_session" metric
recorder.storeSession();

// Or with a custom key
recorder.storeSession("behavioral_session");
```

The session data appears in Gorilla's exported metrics.

### Store for In-Experiment Access

Use `saveToStore()` to store data accessible within the experiment:

```javascript
// Store session for later retrieval
recorder.saveToStore("my_session");

// Retrieve later in the experiment
const savedSession = gorilla.retrieve("my_session");
```

### Individual Trial Storage

With `autoStore: true`, each trial is stored separately:

```javascript
// After experiment, data is in:
// gorilla.retrieve("slopit_trial_0")
// gorilla.retrieve("slopit_trial_1")
// etc.
```

### Manual Storage

Store specific data manually:

```javascript
const trial = recorder.endTrial(response);

// Store specific metrics
gorilla.metric("keystroke_count", trial.behavioral?.keystrokes?.length || 0);
gorilla.metric("paste_detected", trial.captureFlags?.some(f => f.type === "paste_detected") || false);
```

## Working with Gorilla Zones

### In Code Editor Zone

```javascript
gorilla.ready(function() {
    const recorder = new SlopitRecorder({ ... });

    // Your experiment logic here
});
```

### In Questionnaire Zone

For embedded code in questionnaire zones:

```javascript
// In the zone's custom JavaScript
(function() {
    const recorder = new SlopitRecorder({ autoStore: true });

    // Find the text input
    const inputs = document.querySelectorAll("input[type='text'], textarea");

    inputs.forEach((input, index) => {
        recorder.startTrialWithSelector(`input_${index}`, `#${input.id}`);

        input.addEventListener("blur", () => {
            recorder.endTrial(input.value);
        });
    });
})();
```

### Multiple Zones

Share recorder state across zones using Gorilla store:

```javascript
// In Zone 1
const recorder = new SlopitRecorder({ ... });
// ... run trials ...
recorder.saveToStore("slopit_progress");
gorilla.finish();

// In Zone 2
gorilla.ready(function() {
    const previousData = gorilla.retrieve("slopit_progress");

    // Create new recorder or continue session
    const recorder = new SlopitRecorder({ ... });
    // ... continue ...
});
```

## Data Export

### Accessing Metrics

Session data stored via `storeSession()` appears in Gorilla's metric export:

| participant_id | metric_name | metric_value |
|----------------|-------------|--------------|
| P001 | slopit_session | `{"sessionId":"...","trials":[...]}` |

### Processing Exported Data

```python
import pandas as pd
import json

# Load Gorilla metrics export
df = pd.read_csv("metrics.csv")

# Filter slopit sessions
slopit_rows = df[df["metric_name"] == "slopit_session"]

# Parse JSON
sessions = slopit_rows["metric_value"].apply(json.loads)

# Extract trial data
for session in sessions:
    for trial in session["trials"]:
        print(f"Trial {trial['trialIndex']}: {len(trial['behavioral']['keystrokes'])} keystrokes")
```

## Troubleshooting

### Recorder Not Initialized

Ensure Gorilla is ready before creating the recorder:

```javascript
// Correct
gorilla.ready(function() {
    const recorder = new SlopitRecorder({ ... });
});

// Wrong: May execute before Gorilla is ready
const recorder = new SlopitRecorder({ ... });
gorilla.ready(function() { ... });
```

### Data Not Appearing in Export

Verify `storeSession()` is called before `gorilla.finish()`:

```javascript
// Correct order
recorder.storeSession();  // Store data first
gorilla.finish();         // Then finish

// Wrong: Data may not be stored
gorilla.finish();
recorder.storeSession();  // Too late!
```

### Element Not Found

Check that the element exists when starting the trial:

```javascript
// Use setTimeout if element is created dynamically
setTimeout(() => {
    const textarea = document.getElementById("response");
    if (textarea) {
        recorder.startTrial("trial_1", textarea);
    } else {
        console.error("Textarea not found");
    }
}, 100);
```

Or use the selector-based approach:

```javascript
recorder.startTrialWithSelector("trial_1", "#response");
```

### Auto-Store Filling Storage

If auto-store creates too many entries, disable it and use session storage:

```javascript
// Instead of autoStore: true
const recorder = new SlopitRecorder({ autoStore: false });

// Store only the final session
recorder.storeSession();
```

### Large Session Data

If session data exceeds Gorilla's metric size limit, split it:

```javascript
const session = recorder.exportSession();

// Store trials separately
session.trials.forEach((trial, index) => {
    gorilla.metric(`slopit_trial_${index}`, JSON.stringify(trial));
});

// Store session metadata
gorilla.metric("slopit_metadata", JSON.stringify({
    sessionId: session.sessionId,
    participantId: session.participantId,
    platform: session.platform,
    trialCount: session.trials.length,
}));
```
