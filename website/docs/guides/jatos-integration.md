---
sidebar_position: 7
---

# JATOS Integration Guide

This guide covers how to integrate slopit with JATOS (Just Another Tool for Online Studies).

## Overview

The `@slopit/adapter-jatos` package provides:

- **SlopitRecorder** (also exported as **JatosRecorder**): A session recorder with JATOS-specific data submission methods
- Automatic participant and study ID detection from JATOS
- Support for multi-component studies via study session data
- Integration with JATOS result data submission

JATOS is an open-source platform for running online behavioral studies. The slopit adapter integrates with JATOS's JavaScript API to store behavioral data in your study results.

## Prerequisites

- A JATOS server (local or hosted)
- Familiarity with JATOS study and component structure
- Basic understanding of jatos.js API

## Installation

### In Your Component HTML

Add slopit via CDN in your component's HTML file:

```html
<!DOCTYPE html>
<html>
<head>
    <script src="jatos.js"></script>
    <script src="https://unpkg.com/@slopit/adapter-jatos/dist/index.umd.js"></script>
</head>
<body>
    <!-- Your experiment content -->
    <script src="experiment.js"></script>
</body>
</html>
```

### Bundled with Your Experiment

If you bundle your experiment code:

```bash
pnpm add @slopit/adapter-jatos
```

```javascript
import { SlopitRecorder } from "@slopit/adapter-jatos";
```

## Basic Usage

### Creating the Recorder

Initialize the recorder when JATOS loads:

```javascript
jatos.onLoad(function() {
    // Recorder auto-detects participantId and studyId from JATOS
    const recorder = new SlopitRecorder();

    // Or provide explicit configuration
    const recorder = new SlopitRecorder({
        participantId: jatos.workerId,
        studyId: jatos.studyId,
    });

    // Continue with experiment setup
});
```

### Recording Trials

```javascript
// Start a trial with behavioral capture
const textarea = document.getElementById("response");
recorder.beginTrial("trial_1", textarea, {
    trialType: "free_response",
});

// When the participant submits
const response = textarea.value;
recorder.finishTrial(response);
```

### Submitting Data

```javascript
// At experiment end
await recorder.submitToJatos();
jatos.endStudy();
```

## Complete Example

```javascript
jatos.onLoad(function() {
    // Initialize recorder (auto-detects JATOS IDs)
    const recorder = new SlopitRecorder({
        studyId: "writing-study-001",
        metadata: {
            version: "1.0.0",
        },
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
        recorder.beginTrial(`trial_${currentTrial}`, textarea, {
            trialType: "free_response",
            stimulus: {
                type: "text",
                content: prompts[currentTrial],
            },
        });

        // Handle submission
        submitBtn.addEventListener("click", function() {
            // End trial with response
            recorder.finishTrial(textarea.value);

            // Move to next trial
            currentTrial++;
            showTrial();
        });
    }

    // End experiment and submit data
    async function endExperiment() {
        // Show completion message
        document.getElementById("content").innerHTML = `
            <h2>Thank You!</h2>
            <p>Submitting your data...</p>
        `;

        try {
            // Submit slopit data to JATOS
            await recorder.submitToJatos();

            // Update message
            document.getElementById("content").innerHTML = `
                <h2>Thank You!</h2>
                <p>Your responses have been recorded.</p>
            `;

            // End the study
            setTimeout(() => {
                jatos.endStudy();
            }, 2000);
        } catch (error) {
            console.error("Submission failed:", error);
            document.getElementById("content").innerHTML = `
                <h2>Error</h2>
                <p>Failed to submit data. Please contact the researcher.</p>
            `;
        }
    }

    // Start first trial
    showTrial();
});
```

## Configuration Options

### Recorder Configuration

```javascript
const recorder = new SlopitRecorder({
    // Participant identifier (auto-detected from jatos.workerId if not provided)
    participantId: "P001",

    // Study identifier (auto-detected from jatos.studyId if not provided)
    studyId: "my-study",

    // Key for slopit data in JATOS results
    resultKey: "slopit",  // default: "slopit"

    // Additional metadata
    metadata: {
        version: "1.0.0",
        condition: "experimental",
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
recorder.beginTrial("trial_1", textarea, {
    // Trial type identifier
    trialType: "free_response",

    // Trial index (auto-incremented if not provided)
    trialIndex: 0,

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
recorder.beginTrial("trial_1", textarea);
```

### Using CSS Selectors

For dynamically created elements:

```javascript
recorder.startTrialWithSelector(
    "trial_1",
    "textarea.response-input",
    document.getElementById("trial-container")
);
```

### Deferred Attachment

Start the trial before the element exists:

```javascript
// Start trial without element
recorder.beginTrial("trial_1");

// Later, when element is available
const textarea = document.querySelector("textarea");
recorder.attachCapture(textarea);
```

## Data Submission

### Submit Session Data

Submit the complete session to JATOS result data:

```javascript
// Submits to jatos result data with key "slopit"
await recorder.submitToJatos();
```

### Append Data

For long experiments, append data incrementally:

```javascript
// After each block of trials
await recorder.appendToJatos();
```

### Custom Result Key

```javascript
const recorder = new SlopitRecorder({
    resultKey: "behavioral_data",  // Custom key
});

// Data appears under "behavioral_data" in results
await recorder.submitToJatos();
```

### Get the Result Key

```javascript
const key = recorder.getResultKey();
console.log(`Data stored under: ${key}`);
```

## Multi-Component Studies

### Sharing Data Across Components

Use study session data to share slopit data between components:

```javascript
// In Component 1
jatos.onLoad(function() {
    const recorder = new SlopitRecorder();

    // Run trials...

    // Store in study session before moving on
    recorder.storeInStudySession();
    jatos.startNextComponent();
});
```

```javascript
// In Component 2
jatos.onLoad(function() {
    const recorder = new SlopitRecorder();

    // Load previous session data
    const previousSession = recorder.loadFromStudySession();
    if (previousSession) {
        console.log(`Previous session had ${previousSession.trials.length} trials`);
    }

    // Continue with more trials...

    // Submit all data at the end
    await recorder.submitToJatos();
    jatos.endStudy();
});
```

### Study Session Storage

```javascript
// Store current session in study session data
recorder.storeInStudySession();
// Data stored under the resultKey in jatos.studySessionData

// Retrieve later
const session = recorder.loadFromStudySession();
```

## Working with JATOS Features

### Batch Session

Access batch session data:

```javascript
jatos.onLoad(function() {
    // Get batch data
    const batchData = jatos.batchSession.get("shared_config");

    const recorder = new SlopitRecorder({
        metadata: {
            batchId: jatos.batchId,
            condition: batchData?.condition,
        },
    });

    // ...
});
```

### Worker Types

Handle different JATOS worker types:

```javascript
jatos.onLoad(function() {
    const recorder = new SlopitRecorder({
        participantId: jatos.workerId,
        metadata: {
            workerType: jatos.workerType,
            isPreview: jatos.workerType === "Jatos",
        },
    });

    // Skip data submission for preview workers
    if (jatos.workerType === "Jatos") {
        console.log("Preview mode - data will not be saved");
    }
});
```

### Component Results

Access component-specific results:

```javascript
// Get previous component results
const prevResults = jatos.componentResultData;

// Your experiment code...

// Store with component result
await recorder.submitToJatos();
```

## Data Export

### Accessing Results

Slopit data is stored in JATOS result data. Access it through:

1. **JATOS GUI**: Study Results > Export Results
2. **JATOS API**: `GET /api/v1/study/{id}/results`

### Result Format

```json
{
  "slopit": {
    "sessionId": "abc123...",
    "participantId": "P001",
    "studyId": "my-study",
    "platform": {
      "name": "JATOS",
      "version": "unknown",
      "adapterVersion": "0.1.0"
    },
    "trials": [
      {
        "trialId": "trial_0",
        "trialIndex": 0,
        "behavioral": {
          "keystrokes": [...],
          "metrics": {...}
        },
        "captureFlags": [...]
      }
    ]
  }
}
```

### Processing with Python

```python
import json
import pandas as pd
from pathlib import Path

# Load JATOS results
results_dir = Path("jatos_results")

sessions = []
for file in results_dir.glob("*.txt"):
    with open(file) as f:
        for line in f:
            data = json.loads(line)
            if "slopit" in data:
                sessions.append(data["slopit"])

# Extract trial data
trials_data = []
for session in sessions:
    for trial in session["trials"]:
        trials_data.append({
            "participant": session["participantId"],
            "trial_id": trial["trialId"],
            "keystroke_count": len(trial["behavioral"]["keystrokes"]),
            "paste_detected": any(
                f["type"] == "paste_detected"
                for f in trial.get("captureFlags", [])
            ),
        })

df = pd.DataFrame(trials_data)
print(df.describe())
```

## Troubleshooting

### JATOS Not Available

Ensure jatos.js is loaded before your experiment:

```html
<script src="jatos.js"></script>
<script src="your-experiment.js"></script>
```

### Data Not Submitted

Verify `submitToJatos()` is awaited before ending:

```javascript
// Correct
await recorder.submitToJatos();
jatos.endStudy();

// Wrong: May not complete before ending
recorder.submitToJatos();  // Not awaited!
jatos.endStudy();
```

### Participant ID Missing

JATOS provides `workerId` automatically. If it's missing:

```javascript
jatos.onLoad(function() {
    console.log("Worker ID:", jatos.workerId);
    console.log("Study ID:", jatos.studyId);

    // Provide fallback if needed
    const recorder = new SlopitRecorder({
        participantId: jatos.workerId || "unknown",
    });
});
```

### Component Navigation

When using `jatos.startNextComponent()`, store data first:

```javascript
// Store in study session for next component
recorder.storeInStudySession();

// Then navigate
jatos.startNextComponent();
```

### Large Result Data

If data exceeds JATOS limits, consider:

1. Reducing captured data (disable unnecessary capture types)
2. Submitting incrementally with `appendToJatos()`
3. Using external storage for raw data

```javascript
// Reduce data size
const recorder = new SlopitRecorder({
    behavioral: {
        keystroke: { enabled: true, captureKeyUp: false },
        mouse: { enabled: false },
        scroll: { enabled: false },
    },
});
```

### Connection Issues

Handle network errors gracefully:

```javascript
async function endExperiment() {
    try {
        await recorder.submitToJatos();
        jatos.endStudy();
    } catch (error) {
        console.error("Submission failed:", error);

        // Show error and retry option
        document.getElementById("content").innerHTML = `
            <h2>Connection Error</h2>
            <p>Failed to submit data. Please check your connection.</p>
            <button id="retry">Retry</button>
        `;

        document.getElementById("retry").addEventListener("click", endExperiment);
    }
}
```
