---
sidebar_position: 5
---

# PCIbex Integration Guide

This guide covers how to integrate slopit with PCIbex (PennController for IBEX) experiments.

## Overview

The `@slopit/adapter-pcibex` package provides two APIs:

- **Element-based API**: Functions like `newSlopit()` and `getSlopit()` that mirror PennController's element pattern
- **Recorder-based API**: `PCIbexRecorder` for advanced session management across trials

PCIbex (also known as PennController or IBEX Farm) is a platform for running web-based experiments in linguistics and cognitive science. The slopit adapter integrates with PCIbex's element system to capture behavioral data during text entry tasks.

## Prerequisites

- A working PCIbex experiment (on PCIbex Farm or self-hosted)
- Familiarity with PennController syntax
- Understanding of PCIbex trial structure

## Installation

### PCIbex Farm

Add slopit to your experiment by including it in the `chunk_includes` folder or loading via CDN in your main script:

```javascript
// At the top of your main.js
PennController.ResetPrefix(null);

// Include slopit from CDN
const slopitScript = document.createElement("script");
slopitScript.src = "https://unpkg.com/@slopit/adapter-pcibex/dist/index.umd.js";
document.head.appendChild(slopitScript);
```

### Self-Hosted IBEX

Add the script to your server's `js_includes` directory:

```javascript
// In your experiment script
import { newSlopit, getSlopit, getAllSlopitData } from "@slopit/adapter-pcibex";
```

## Basic Usage

### Element-Based API

The element-based API uses a fluent interface that matches PennController's style:

```javascript
PennController("trial",
    newTextInput("answer", "")
        .size(400, 200)
        .print()
    ,
    // Create slopit capture element
    newSlopit("capture")
        .attach(getTextInput("answer"))
        .keystroke(true)
        .paste(true, false)  // enabled, but don't capture content
    ,
    newButton("submit", "Submit")
        .print()
        .wait()
    ,
    // Log the captured data before ending
    getSlopit("capture").log()
    ,
    getTextInput("answer").setVar("response")
);
```

### Recorder-Based API

For more control over session management:

```javascript
import { PCIbexRecorder } from "@slopit/adapter-pcibex";

const recorder = new PCIbexRecorder({
    participantId: GetURLParameter("PROLIFIC_PID"),
    studyId: "my-experiment",
});

PennController("trial",
    newTextInput("answer", "")
        .size(400, 200)
        .print()
        .callback(() => {
            // Start capture when element is printed
            const element = document.querySelector("textarea");
            recorder.startTrial({ trialType: "text-entry", targetElement: element });
        })
    ,
    newButton("submit", "Submit")
        .print()
        .wait()
    ,
    getTextInput("answer")
        .setVar("response")
        .callback((value) => {
            recorder.endTrial({ type: "text", value: value });
        })
);
```

## Complete Example

```javascript
// Configure PennController
PennController.ResetPrefix(null);
PennController.DebugOff();

// Define trial sequence
Sequence("intro", randomize("writing_task"), "send_results");

// Introduction
PennController("intro",
    newHtml("instructions", "instructions.html")
        .print()
    ,
    newButton("start", "Begin Experiment")
        .center()
        .print()
        .wait()
);

// Writing task with slopit capture
Template("stimuli.csv", row =>
    PennController("writing_task",
        // Display the prompt
        newText("prompt", row.prompt)
            .css("font-size", "1.2em")
            .print()
        ,
        // Create text input
        newTextInput("response", "")
            .size(500, 250)
            .css("font-size", "1em")
            .print()
        ,
        // Attach slopit behavioral capture
        newSlopit("capture")
            .attach(getTextInput("response"))
            .keystroke(true)
            .paste(true, false)
            .focus(true)
        ,
        // Submit button
        newButton("submit", "Continue")
            .center()
            .print()
            .wait()
        ,
        // Log slopit data before ending
        getSlopit("capture").log()
        ,
        // Store response in results
        getTextInput("response").setVar("typed_response")
    )
    .log("item", row.item)
    .log("condition", row.condition)
    .log("prompt", row.prompt)
);

// Send results
PennController.SendResults("send_results");

// Final screen
PennController("final",
    newText("thanks", "Thank you for participating!")
        .center()
        .print()
    ,
    newText("code", "Your completion code: ABC123XYZ")
        .center()
        .print()
);
```

## Configuration Options

### Element Configuration

Configure capture using fluent methods:

```javascript
newSlopit("capture")
    .attach(getTextInput("answer"))    // Attach to a PennController element
    .keystroke(true)                    // Enable keystroke capture
    .paste(true, false)                 // Enable paste detection, don't capture content
    .focus(true)                        // Track focus/blur events
    .mouse(false)                       // Disable mouse tracking
    .scroll(false)                      // Disable scroll tracking
```

### Method Reference

| Method | Parameters | Description |
|--------|------------|-------------|
| `attach(element)` | PennController element | Attach to an input element |
| `keystroke(enabled)` | boolean | Enable/disable keystroke capture |
| `paste(enabled, capture)` | boolean, boolean | Enable paste detection, optionally capture content |
| `focus(enabled)` | boolean | Enable/disable focus event capture |
| `mouse(enabled)` | boolean | Enable/disable mouse event capture |
| `scroll(enabled)` | boolean | Enable/disable scroll event capture |
| `log()` | none | Finalize and log captured data |

### Recorder Configuration

```javascript
const recorder = new PCIbexRecorder({
    // Participant identifier
    participantId: GetURLParameter("PROLIFIC_PID"),

    // Study identifier
    studyId: "my-experiment",

    // Additional metadata
    metadata: {
        version: "1.0.0",
        condition: GetURLParameter("condition"),
    },

    // Behavioral capture defaults
    behavioral: {
        keystroke: { enabled: true },
        paste: { enabled: true },
        focus: { enabled: true },
    },
});
```

## Accessing Captured Data

### Within Trials

Use `getSlopit()` to access the element and its data:

```javascript
// Get data for logging
getSlopit("capture").log()

// Access data in a callback
PennController("trial",
    // ... elements ...
    ,
    newFunction("getData", () => {
        const data = getAllSlopitData();
        console.log("Captured data:", data["capture"]);
    }).call()
);
```

### After Experiment

Use `getAllSlopitData()` to retrieve all captured data:

```javascript
// Before sending results
newFunction("collectSlopit", () => {
    const allData = getAllSlopitData();
    // Store in a global variable for later access
    window.slopitSessionData = allData;
}).call()
```

### In Results

Slopit data is logged with the trial results. Access it in your results file:

```
# Results format
# Column: slopit
# Contains: JSON-encoded behavioral data
```

## Data Export

### Logging to Results

Call `log()` to finalize capture and include data in PCIbex results:

```javascript
// At end of trial, before any setVar calls
getSlopit("capture").log()
```

### Manual Server Submission

Submit data to your own server:

```javascript
PennController("send_data",
    newFunction("submit", async () => {
        const allData = getAllSlopitData();

        await fetch("https://your-server.com/api/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                participantId: GetURLParameter("PROLIFIC_PID"),
                data: allData,
            }),
        });
    }).call()
    ,
    newText("submitting", "Submitting data...")
        .print()
    ,
    newTimer("wait", 2000).start().wait()
);
```

### Using the Recorder

Export the complete session:

```javascript
// In final trial
newFunction("export", () => {
    const session = recorder.exportSession();

    // Log as JSON string
    console.log("Session:", JSON.stringify(session));

    // Or send to server
    fetch("/api/sessions", {
        method: "POST",
        body: JSON.stringify(session),
    });
}).call()
```

## Troubleshooting

### Element Not Attaching

Verify the TextInput is printed before attaching:

```javascript
// Correct order
newTextInput("answer", "")
    .print()  // Must be printed first
,
newSlopit("capture")
    .attach(getTextInput("answer"))  // Now the element exists

// Wrong order
newSlopit("capture")
    .attach(getTextInput("answer"))  // Element doesn't exist yet!
,
newTextInput("answer", "")
    .print()
```

### Missing Keystroke Data

Ensure `keystroke(true)` is called:

```javascript
newSlopit("capture")
    .attach(getTextInput("answer"))
    .keystroke(true)  // Must explicitly enable
```

### Data Not Appearing in Results

Call `log()` before the trial ends:

```javascript
// Must call log() before ending
getSlopit("capture").log()
,
newButton("submit", "Continue")
    .wait()
```

### Multiple Input Elements

Create separate slopit elements for each input:

```javascript
newTextInput("name", "")
    .print()
,
newSlopit("name_capture")
    .attach(getTextInput("name"))
    .keystroke(true)
,
newTextInput("response", "")
    .print()
,
newSlopit("response_capture")
    .attach(getTextInput("response"))
    .keystroke(true)
,
// Log both before ending
getSlopit("name_capture").log()
,
getSlopit("response_capture").log()
```

### Element Reuse Across Trials

Clear elements between trials:

```javascript
import { clearSlopitElements } from "@slopit/adapter-pcibex";

// At the start of each trial
newFunction("clearPrevious", () => {
    clearSlopitElements();
}).call()
```

### PCIbex Farm Compatibility

If using PCIbex Farm, ensure the script loads before your experiment code:

```javascript
// Use a synchronous script load
document.write('<script src="https://unpkg.com/@slopit/adapter-pcibex/dist/index.umd.js"></script>');

// Or wait for the script to load
const loadSlopit = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/@slopit/adapter-pcibex/dist/index.umd.js";
    script.onload = resolve;
    document.head.appendChild(script);
});

// Then in your experiment:
loadSlopit.then(() => {
    // Define your PennController trials here
});
```
