---
sidebar_position: 3
---

# Quick Start

This guide shows how to capture behavioral data in under 5 minutes.

## Basic Behavioral Capture

The simplest way to capture behavioral data is with `@slopit/behavioral`.

```typescript
import { createBehavioralCapture } from "@slopit/behavioral";

// Create capture instance
const capture = createBehavioralCapture({
  keystroke: { enabled: true },
  focus: { enabled: true },
  paste: { enabled: true, prevent: false },
});

// Attach to a text input
const textarea = document.getElementById("response") as HTMLTextAreaElement;
capture.attach(textarea);

// Later, when the user submits...
const data = capture.getData();
console.log("Keystrokes:", data.keystrokes?.length);
console.log("Metrics:", data.metrics);

// Clean up
capture.detach();
```

## jsPsych Integration

For jsPsych experiments, use the adapter package. The `SlopitExtension` works with ANY jsPsych plugin that includes text inputs.

```typescript
import { initJsPsych } from "jspsych";
import jsPsychSurveyText from "@jspsych/plugin-survey-text";
import { SlopitExtension, exportToSlopit } from "@slopit/adapter-jspsych";

const jsPsych = initJsPsych({
  extensions: [{ type: SlopitExtension }],
  on_finish: () => {
    // Export all data to SlopitSession format
    const session = exportToSlopit(jsPsych, {
      participantId: jsPsych.data.urlVariables().PROLIFIC_PID,
      studyId: "my-study-001",
    });

    // Send to your server
    fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(session),
    });
  },
});

const timeline = [
  {
    type: jsPsychSurveyText,
    questions: [{ prompt: "Describe your morning routine in detail:", rows: 6 }],
    extensions: [
      {
        type: SlopitExtension,
        params: {
          targetSelector: "textarea",
          keystroke: { enabled: true },
          focus: { enabled: true },
          paste: { enabled: true, prevent: false },
        },
      },
    ],
  },
];

jsPsych.run(timeline);
```

## What Gets Captured

### Keystroke Events

Each keystroke records:

- `time`: Milliseconds since trial start
- `key`: The key value (e.g., "a", "Enter", "Backspace")
- `code`: Physical key code (e.g., "KeyA", "Enter")
- `event`: "keydown" or "keyup"
- `textLength`: Current text length in the input
- `modifiers`: Shift, Ctrl, Alt, Meta states

### Focus Events

Focus tracking captures:

- Window blur/focus events (tab switching)
- Visibility changes (minimizing, switching apps)
- Duration of time spent away

### Paste Events

Paste detection records:

- Paste timestamp
- Length of pasted text
- Preview of pasted content (configurable)
- Hash for deduplication
- Preceding keystroke count (to detect copy from external source)

## Computed Metrics

slopit computes metrics from raw events.

### Keystroke Metrics

```typescript
interface KeystrokeMetrics {
  totalKeystrokes: number;      // Total keydown events
  printableKeystrokes: number;  // Single-character keys
  deletions: number;            // Backspace + Delete
  meanIKI: number;              // Mean inter-keystroke interval (ms)
  stdIKI: number;               // Standard deviation of IKI
  medianIKI: number;            // Median IKI
  pauseCount: number;           // Pauses > 2 seconds
  productProcessRatio: number;  // Final length / total keystrokes
}
```

### Focus Metrics

```typescript
interface FocusMetrics {
  blurCount: number;           // Number of blur events
  totalBlurDuration: number;   // Total time blurred (ms)
  hiddenCount: number;         // Number of visibility hidden events
  totalHiddenDuration: number; // Total time hidden (ms)
}
```

### Timing Metrics

```typescript
interface TimingMetrics {
  firstKeystrokeLatency: number;  // Time to first key (ms)
  totalResponseTime: number;      // Total trial time (ms)
  charactersPerMinute: number;    // Typing speed
}
```

## Complete Example

Here is a complete HTML page with behavioral capture.

```html
<!DOCTYPE html>
<html>
<head>
  <title>Slopit Demo</title>
  <script type="importmap">
  {
    "imports": {
      "@slopit/core": "https://esm.sh/@slopit/core",
      "@slopit/behavioral": "https://esm.sh/@slopit/behavioral"
    }
  }
  </script>
</head>
<body>
  <h1>Writing Task</h1>
  <p>Please describe your typical morning routine:</p>
  <textarea id="response" rows="6" cols="50"></textarea>
  <br>
  <button id="submit">Submit</button>
  <pre id="output"></pre>

  <script type="module">
    import { createBehavioralCapture } from "@slopit/behavioral";

    const capture = createBehavioralCapture({
      keystroke: { enabled: true },
      focus: { enabled: true },
      paste: { enabled: true },
    });

    const textarea = document.getElementById("response");
    capture.attach(textarea);

    document.getElementById("submit").addEventListener("click", () => {
      const data = capture.getData();
      capture.detach();

      document.getElementById("output").textContent = JSON.stringify({
        response: textarea.value,
        keystrokeCount: data.keystrokes?.length,
        metrics: data.metrics,
      }, null, 2);
    });
  </script>
</body>
</html>
```

## Next Steps

- [Behavioral Capture Guide](./guides/behavioral-capture.md): Configure capture options
- [jsPsych Integration Guide](./guides/jspsych-integration.md): Full jsPsych setup
- [API Reference](./api/index.md): Complete API documentation
