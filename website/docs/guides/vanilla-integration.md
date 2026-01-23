---
sidebar_position: 9
---

# Custom/Vanilla Integration Guide

This guide covers how to integrate slopit with custom experiments or frameworks not covered by the platform-specific adapters.

## Overview

The `@slopit/adapter-vanilla` package provides:

- **SlopitRecorder** (also exported as **VanillaRecorder**): A framework-agnostic session recorder
- Full control over trial lifecycle
- Reference implementation for building custom adapters
- Re-exports of common types from `@slopit/core`

Use this adapter when building experiments with vanilla JavaScript, custom frameworks, or platforms without a dedicated slopit adapter.

## Prerequisites

- Basic JavaScript/TypeScript knowledge
- A web-based experiment with text input elements
- Access to DOM elements during text entry

## Installation

### Using a Package Manager

```bash
pnpm add @slopit/adapter-vanilla
```

### Using CDN

```html
<script src="https://unpkg.com/@slopit/adapter-vanilla/dist/index.umd.js"></script>
```

### ES Module Import

```javascript
import { SlopitRecorder } from "@slopit/adapter-vanilla";
```

## Basic Usage

### Creating the Recorder

```javascript
const recorder = new SlopitRecorder({
    participantId: "P001",
    studyId: "my-study",
});
```

### Recording a Trial

```javascript
// Start capturing when the trial begins
recorder.startTrial({
    trialId: "trial_1",
    targetElement: document.getElementById("response"),
});

// End the trial when participant submits
const result = recorder.endTrial("The participant's response text");

console.log("Behavioral data:", result.data);
console.log("Response time:", result.rt);
```

### Exporting Session Data

```javascript
const session = recorder.exportSession();

// Send to server
fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(session),
});
```

## Complete Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>Writing Study</title>
    <script src="https://unpkg.com/@slopit/adapter-vanilla/dist/index.umd.js"></script>
    <style>
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        textarea { width: 100%; padding: 10px; }
        button { margin-top: 10px; padding: 10px 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div id="content"></div>
    </div>

    <script>
        // Get participant info from URL
        const urlParams = new URLSearchParams(window.location.search);
        const participantId = urlParams.get("PROLIFIC_PID") || "test";
        const studyId = "writing-study-001";

        // Initialize recorder
        const recorder = new SlopitRecorder({
            participantId,
            studyId,
            platformName: "custom-experiment",
            platformVersion: "1.0.0",
        });

        // Trial prompts
        const prompts = [
            "Describe your typical morning routine.",
            "Explain how to prepare your favorite meal.",
            "Describe a memorable travel experience.",
        ];

        let currentTrial = 0;

        function showTrial() {
            if (currentTrial >= prompts.length) {
                endExperiment();
                return;
            }

            // Render trial
            document.getElementById("content").innerHTML = `
                <h2>Task ${currentTrial + 1} of ${prompts.length}</h2>
                <p>${prompts[currentTrial]}</p>
                <textarea id="response" rows="6" placeholder="Type your response here..."></textarea>
                <br>
                <button id="submit">Continue</button>
            `;

            const textarea = document.getElementById("response");
            const submitBtn = document.getElementById("submit");

            // Start behavioral capture
            recorder.startTrial({
                trialId: `trial_${currentTrial}`,
                trialIndex: currentTrial,
                trialType: "free_response",
                targetElement: textarea,
                stimulus: prompts[currentTrial],  // String converted to StimulusInfo
            });

            // Handle submission
            submitBtn.addEventListener("click", () => {
                const response = textarea.value;

                if (response.trim().length === 0) {
                    alert("Please enter a response.");
                    return;
                }

                // End trial
                const result = recorder.endTrial(response);
                console.log(`Trial ${currentTrial} complete:`, result);

                // Next trial
                currentTrial++;
                showTrial();
            });
        }

        async function endExperiment() {
            document.getElementById("content").innerHTML = `
                <h2>Thank You!</h2>
                <p>Submitting your data...</p>
            `;

            try {
                const session = recorder.exportSession();

                await fetch("/api/sessions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(session),
                });

                document.getElementById("content").innerHTML = `
                    <h2>Thank You!</h2>
                    <p>Your responses have been recorded.</p>
                    <p>You may close this window.</p>
                `;
            } catch (error) {
                console.error("Submission failed:", error);
                document.getElementById("content").innerHTML = `
                    <h2>Error</h2>
                    <p>Failed to submit data. Please contact the researcher.</p>
                    <pre>${error.message}</pre>
                `;
            }
        }

        // Start experiment
        showTrial();
    </script>
</body>
</html>
```

## Configuration Options

### Recorder Configuration

```javascript
const recorder = new SlopitRecorder({
    // Participant identifier
    participantId: "P001",

    // Study identifier
    studyId: "my-study",

    // Custom platform name (default: "vanilla")
    platformName: "my-custom-platform",

    // Custom platform version (default: "1.0.0")
    platformVersion: "2.0.0",

    // Session-level metadata
    metadata: {
        condition: "experimental",
        version: "1.0.0",
        source: "prolific",
    },

    // Behavioral capture configuration (applied to all trials)
    behavioral: {
        keystroke: {
            enabled: true,
            captureKeyUp: true,
            includeModifiers: true,
        },
        paste: {
            enabled: true,
            capturePreview: true,
            previewLength: 100,
        },
        focus: {
            enabled: true,
            useVisibilityAPI: true,
            useBlurFocus: true,
        },
        mouse: { enabled: false },
        scroll: { enabled: false },
    },
});
```

### Trial Configuration

```javascript
recorder.startTrial({
    // Unique trial identifier (auto-generated if not provided)
    trialId: "trial_1",

    // Trial position (auto-incremented if not provided)
    trialIndex: 0,

    // Trial type for categorization
    trialType: "free_response",

    // DOM element to capture from
    targetElement: document.getElementById("response"),

    // CSS selector (alternative to targetElement)
    targetSelector: "#response",

    // Stimulus information (string or StimulusInfo object)
    stimulus: "Please describe your experience.",

    // Or as full StimulusInfo
    stimulus: {
        type: "text",
        content: "Please describe your experience.",
        metadata: { wordCount: 5 },
    },
});
```

## Element Discovery

### Direct Element Reference

```javascript
const textarea = document.getElementById("response");
recorder.startTrial({
    trialId: "trial_1",
    targetElement: textarea,
});
```

### Using CSS Selectors

```javascript
recorder.startTrial({
    trialId: "trial_1",
    targetSelector: "#response",  // Element found at trial start
});
```

### Async Discovery

For dynamically created elements:

```javascript
await recorder.startTrialWithDiscovery(
    { trialId: "trial_1", trialType: "survey" },
    "textarea.response-input",  // CSS selector
    document.body,              // Container to search
    5000                        // Timeout in milliseconds
);
```

### Manual Attachment

Start the trial first, then attach later:

```javascript
// Start trial without element
recorder.startTrial({ trialId: "trial_1" });

// Later, when element is available
const textarea = document.querySelector("textarea");
recorder.attachCapture(textarea);
```

## Trial Lifecycle

### Starting Trials

```javascript
// With element
recorder.startTrial({
    trialId: "trial_1",
    targetElement: document.getElementById("response"),
});

// Without element (attach later)
recorder.startTrial({
    trialId: "trial_1",
    trialType: "deferred",
});
```

### Ending Trials

```javascript
// With text response (auto-converts to ResponseInfo)
const result = recorder.endTrial("The participant's response");

// With ResponseInfo object
const result = recorder.endTrial({
    type: "text",
    value: "The participant's response",
    characterCount: 27,
    wordCount: 4,
});

// With platform-specific data
const result = recorder.endTrial("Response", {
    rt: 5432,
    correct: true,
    customField: "value",
});
```

### Result Structure

```javascript
const result = recorder.endTrial(response);

console.log(result.trialId);      // "trial_1"
console.log(result.trialIndex);   // 0
console.log(result.trialType);    // "free_response"
console.log(result.startTime);    // Unix timestamp
console.log(result.endTime);      // Unix timestamp
console.log(result.rt);           // Response time in ms
console.log(result.data);         // { behavioral: {...}, flags: [...] }
```

## Session Management

### Checking State

```javascript
// Is a trial active?
if (recorder.isTrialActive()) {
    console.log("Trial in progress");
}

// Get current trial ID
const trialId = recorder.getCurrentTrialId();

// Get completed trial count
const count = recorder.getTrialCount();
```

### Resetting the Session

```javascript
// After completing a session
const session = recorder.exportSession();
await saveSession(session);

// Reset for a new session (same participant)
recorder.resetSession();

// Start fresh
recorder.startTrial({ trialId: "new_trial_1" });
```

### Exporting Data

```javascript
// Get session object
const session = recorder.exportSession();

// Get as JSON string
const json = recorder.exportSessionJSON();

// Session structure
{
    sessionId: "abc123...",
    participantId: "P001",
    studyId: "my-study",
    startTime: 1234567890000,
    endTime: 1234567899000,
    platform: {
        name: "custom-experiment",
        version: "1.0.0",
        adapterVersion: "0.1.0",
    },
    trials: [
        {
            trialId: "trial_1",
            trialIndex: 0,
            trialType: "free_response",
            startTime: 1234567890000,
            endTime: 1234567895000,
            stimulus: { type: "text", content: "..." },
            response: { type: "text", value: "..." },
            behavioral: { keystrokes: [...], metrics: {...} },
            captureFlags: [...],
        },
    ],
}
```

## Data Handling

### Storing Locally

```javascript
// Save to localStorage
const session = recorder.exportSession();
localStorage.setItem("slopit_session", JSON.stringify(session));

// Retrieve later
const saved = JSON.parse(localStorage.getItem("slopit_session"));
```

### Sending to Server

```javascript
async function submitSession() {
    const session = recorder.exportSession();

    const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(session),
    });

    if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
    }

    return response.json();
}
```

### Incremental Storage

For long experiments, save after each trial:

```javascript
function saveTrial(trial) {
    const trials = JSON.parse(localStorage.getItem("trials") || "[]");
    trials.push(trial);
    localStorage.setItem("trials", JSON.stringify(trials));
}

// After each trial
const result = recorder.endTrial(response);
saveTrial(result);
```

## Building Custom Adapters

Use the vanilla adapter as a base for custom platform adapters:

```typescript
import { SlopitRecorder } from "@slopit/adapter-vanilla";
import type { VanillaRecorderConfig } from "@slopit/adapter-vanilla";

interface MyPlatformConfig extends VanillaRecorderConfig {
    myPlatformOption?: string;
}

class MyPlatformRecorder extends SlopitRecorder {
    private myOption: string;

    constructor(config?: MyPlatformConfig) {
        super({
            ...config,
            platformName: "my-platform",
            platformVersion: detectMyPlatformVersion(),
        });
        this.myOption = config?.myPlatformOption ?? "default";
    }

    // Add platform-specific methods
    async submitToMyPlatform(): Promise<void> {
        const session = this.exportSession();
        await myPlatformAPI.submit(session);
    }
}
```

## Troubleshooting

### Trial Already in Progress

```javascript
// Check before starting
if (!recorder.isTrialActive()) {
    recorder.startTrial({ ... });
} else {
    console.warn("Trial already in progress");
}

// Or end the current trial first
if (recorder.isTrialActive()) {
    recorder.endTrial();  // End without response
}
recorder.startTrial({ ... });
```

### Element Not Found

```javascript
const element = document.getElementById("response");

if (!element) {
    console.error("Element not found");
    // Start trial without capture
    recorder.startTrial({ trialId: "trial_fallback" });
} else {
    recorder.startTrial({ trialId: "trial_1", targetElement: element });
}
```

### Missing Behavioral Data

Ensure the element is attached before the participant starts typing:

```javascript
// Wrong: Element may not exist yet
recorder.startTrial({ trialId: "trial_1", targetSelector: "#response" });
renderTrialUI();  // Creates the element

// Correct: Render first, then start
renderTrialUI();
recorder.startTrial({ trialId: "trial_1", targetElement: document.getElementById("response") });
```

### Discovery Timeout

Increase timeout or check element creation:

```javascript
try {
    await recorder.startTrialWithDiscovery(
        { trialId: "trial_1" },
        "textarea",
        document.body,
        10000  // Increase timeout
    );
} catch (error) {
    console.error("Element not found:", error);
    // Handle gracefully
}
```

### Large Data Size

Reduce captured data for storage-constrained environments:

```javascript
const recorder = new SlopitRecorder({
    behavioral: {
        keystroke: { enabled: true, captureKeyUp: false },  // Reduce events
        mouse: { enabled: false },  // Disable if not needed
        scroll: { enabled: false },
    },
});
```

### Cross-Origin Issues

When submitting to a different domain:

```javascript
await fetch("https://api.example.com/sessions", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    mode: "cors",  // Enable CORS
    credentials: "include",  // Include cookies if needed
    body: JSON.stringify(session),
});
```
