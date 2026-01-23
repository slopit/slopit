---
sidebar_position: 3
---

# lab.js Integration Guide

This guide covers how to integrate slopit with lab.js experiments.

## Overview

The `@slopit/adapter-labjs` package provides:

- **withSlopit()**: A mixin function that adds behavioral capture to any lab.js component
- **LabjsRecorder**: A session recorder for managing experiment-wide data collection

lab.js is a browser-based experiment builder for behavioral research. The slopit adapter hooks into lab.js component lifecycle events to capture keystroke and focus data during text entry tasks.

## Prerequisites

- A working lab.js experiment
- Node.js 18+ for bundled builds, or CDN access for direct browser use
- Basic familiarity with lab.js component structure

## Installation

### Using a Package Manager

```bash
pnpm add @slopit/adapter-labjs
```

### Using CDN (for lab.js Builder)

For experiments built in the lab.js Builder, add slopit via the HTML header:

```html
<script src="https://unpkg.com/@slopit/adapter-labjs/dist/index.umd.js"></script>
```

## Basic Usage

### Using the withSlopit Mixin

The `withSlopit()` function wraps any lab.js component class to add behavioral capture. The enhanced component automatically starts capture when the component runs and collects data when it ends.

```javascript
// Import the mixin
import { withSlopit } from "@slopit/adapter-labjs";

// Create enhanced component class
const SlopitScreen = withSlopit(lab.html.Screen);

// Use the enhanced component
const textEntryScreen = new SlopitScreen({
  content: `
    <main>
      <p>Please describe your morning routine:</p>
      <textarea id="response" rows="6"></textarea>
    </main>
  `,
  slopit: {
    targetSelector: "#response",
    keystroke: { enabled: true },
    paste: { enabled: true },
  },
});
```

### Using the LabjsRecorder

For session-level management across multiple components, use `LabjsRecorder`:

```javascript
import { LabjsRecorder } from "@slopit/adapter-labjs";

const recorder = new LabjsRecorder({
  participantId: "P001",
  studyId: "my-study",
});

// Start a trial manually
recorder.startTrial({
  trialType: "text-entry",
  targetElement: document.querySelector("textarea"),
});

// When the trial ends
recorder.endTrial({
  type: "text",
  value: "participant response",
});

// Export session data
const session = recorder.exportSession();
```

## Complete Example

```javascript
// Full experiment with slopit integration
import { withSlopit, LabjsRecorder } from "@slopit/adapter-labjs";

// Create enhanced component classes
const SlopitScreen = withSlopit(lab.html.Screen);

// Initialize session recorder
const recorder = new LabjsRecorder({
  participantId: new URLSearchParams(window.location.search).get("PROLIFIC_PID"),
  studyId: "writing-study-001",
});

// Build the experiment
const experiment = new lab.flow.Sequence({
  content: [
    // Instructions
    new lab.html.Screen({
      content: `
        <main>
          <h1>Writing Study</h1>
          <p>You will complete 3 short writing tasks.</p>
          <p>Press any key to begin.</p>
        </main>
      `,
      responses: { keypress: "continue" },
    }),

    // Task 1: Text entry with behavioral capture
    new SlopitScreen({
      content: `
        <main>
          <h2>Task 1 of 3</h2>
          <p>Describe your typical morning routine.</p>
          <textarea id="response" rows="6" style="width: 100%;"></textarea>
          <button id="submit">Continue</button>
        </main>
      `,
      responses: { "click #submit": "submit" },
      slopit: {
        targetSelector: "#response",
        keystroke: { enabled: true },
        paste: { enabled: true, prevent: true },
        focus: { enabled: true },
      },
    }),

    // Task 2
    new SlopitScreen({
      content: `
        <main>
          <h2>Task 2 of 3</h2>
          <p>Explain how to prepare your favorite meal.</p>
          <textarea id="response" rows="6" style="width: 100%;"></textarea>
          <button id="submit">Continue</button>
        </main>
      `,
      responses: { "click #submit": "submit" },
      slopit: {
        targetSelector: "#response",
        keystroke: { enabled: true },
        paste: { enabled: true, prevent: true },
      },
    }),

    // Task 3
    new SlopitScreen({
      content: `
        <main>
          <h2>Task 3 of 3</h2>
          <p>Describe a memorable travel experience.</p>
          <textarea id="response" rows="6" style="width: 100%;"></textarea>
          <button id="submit">Continue</button>
        </main>
      `,
      responses: { "click #submit": "submit" },
      slopit: {
        targetSelector: "#response",
        keystroke: { enabled: true },
        paste: { enabled: true, prevent: true },
      },
    }),

    // Thank you
    new lab.html.Screen({
      content: `
        <main>
          <h2>Thank You!</h2>
          <p>Your responses have been recorded.</p>
        </main>
      `,
    }),
  ],
});

// Handle experiment end
experiment.on("end", async () => {
  // Collect all slopit data from trials
  const allData = experiment.options.datastore.data;

  // Send data to server
  try {
    await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session: recorder.exportSession(),
        trials: allData,
      }),
    });
  } catch (error) {
    console.error("Failed to submit data:", error);
  }
});

// Run the experiment
experiment.run();
```

## Configuration Options

### Slopit Configuration

The `slopit` property on enhanced components accepts these options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable or disable capture |
| `targetSelector` | `string` | `"textarea, input[type='text']"` | CSS selector for target element |
| `containerSelector` | `string` | `".lab-content"` | Container to search within |
| `keystroke` | `object` | `{ enabled: false }` | Keystroke capture settings |
| `focus` | `object` | `{ enabled: true }` | Focus/blur capture settings |
| `paste` | `object` | `{ enabled: false }` | Paste event capture settings |
| `mouse` | `object` | `{ enabled: false }` | Mouse event capture settings |
| `scroll` | `object` | `{ enabled: false }` | Scroll event capture settings |

### Keystroke Options

```javascript
{
  keystroke: {
    enabled: true,
    captureKeyUp: true,      // Include keyup events
    includeModifiers: true,  // Track Shift/Ctrl/Alt/Meta
  }
}
```

### Paste Options

```javascript
{
  paste: {
    enabled: true,
    prevent: false,          // Set true to block pasting
    capturePreview: true,    // Store preview of pasted content
    previewLength: 100,      // Characters to capture in preview
    warnMessage: "Please type your response manually.",
  }
}
```

### Focus Options

```javascript
{
  focus: {
    enabled: true,
    useVisibilityAPI: true,  // Track tab/window visibility
    useBlurFocus: true,      // Track element focus/blur
  }
}
```

## Accessing Trial Data

### Within Component Handlers

Access slopit data in component event handlers:

```javascript
const screen = new SlopitScreen({
  content: "...",
  slopit: { ... },
});

screen.on("end", () => {
  // Access slopit data from the component's data store
  const slopitData = screen.data.slopit;

  if (slopitData) {
    console.log("Keystrokes:", slopitData.behavioral.keystrokes.length);
    console.log("Flags:", slopitData.flags);
  }
});
```

### Using getSlopitData()

Enhanced components provide a `getSlopitData()` method:

```javascript
const screen = new SlopitScreen({ ... });

// After the component ends
const data = screen.getSlopitData();
if (data !== null) {
  console.log("Behavioral metrics:", data.behavioral.metrics);
}
```

## Data Export

### Exporting with lab.js Datastore

lab.js stores trial data in a datastore. Slopit data is automatically added to each trial's data object:

```javascript
experiment.on("end", () => {
  const datastore = experiment.options.datastore;

  // Export as CSV (slopit data will be JSON-stringified in the column)
  const csv = datastore.exportCsv();

  // Export as JSON
  const json = datastore.exportJson();

  // Access raw data array
  const trials = datastore.data;
  trials.forEach((trial) => {
    if (trial.slopit) {
      console.log("Trial slopit data:", trial.slopit);
    }
  });
});
```

### Sending to Server

```javascript
experiment.on("end", async () => {
  const datastore = experiment.options.datastore;

  try {
    const response = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participantId: urlParams.get("PROLIFIC_PID"),
        studyId: "my-study",
        trials: datastore.data,
      }),
    });

    if (response.ok) {
      // Redirect to completion
      window.location.href = completionUrl;
    }
  } catch (error) {
    console.error("Submission failed:", error);
  }
});
```

## Troubleshooting

### Slopit Data is Missing

Verify that the `slopit` configuration is present on the component:

```javascript
// Check that slopit is configured
const screen = new SlopitScreen({
  content: "...",
  slopit: {
    targetSelector: "#response",  // Must match an element
    keystroke: { enabled: true }, // Must enable at least one capture type
  },
});
```

### Target Element Not Found

The adapter searches for elements using the `targetSelector` within the `containerSelector`. If your element has a different container:

```javascript
{
  slopit: {
    containerSelector: "#my-custom-container",
    targetSelector: "textarea",
  }
}
```

### Capture Not Starting

Ensure the withSlopit mixin is applied correctly:

```javascript
// Correct: Apply mixin to component class
const SlopitScreen = withSlopit(lab.html.Screen);
const screen = new SlopitScreen({ ... });

// Wrong: Using original class
const screen = new lab.html.Screen({ ... });  // No slopit support
```

### Dynamic Elements

If your target element is created after the component runs (e.g., via JavaScript), the adapter uses a MutationObserver with a 5-second timeout. For longer delays, consider using the LabjsRecorder directly:

```javascript
const screen = new lab.html.Screen({
  content: "...",
});

screen.on("run", () => {
  // Create element dynamically
  const textarea = document.createElement("textarea");
  document.querySelector(".lab-content").appendChild(textarea);

  // Start capture manually
  recorder.startTrial({
    trialId: "dynamic-trial",
    targetElement: textarea,
  });
});

screen.on("end", () => {
  const response = document.querySelector("textarea").value;
  recorder.endTrial({ type: "text", value: response });
});
```
