---
sidebar_position: 2
---

# jsPsych Integration Guide

This guide covers how to integrate slopit with jsPsych 8.x experiments.

## Overview

The `@slopit/adapter-jspsych` package provides:

- **SlopitExtension**: A jsPsych extension that adds behavioral capture to ANY plugin
- **exportToSlopit()**: Converts jsPsych data to the standardized SlopitSession format
- **getSlopitDataFromTrial()**: Extracts behavioral data from individual trials

## Installation

```bash
pnpm add @slopit/adapter-jspsych jspsych@^8 @jspsych/plugin-survey-text
```

## Basic Usage

### Using SlopitExtension

The `SlopitExtension` wraps any jsPsych plugin to add behavioral capture. Register the extension when initializing jsPsych, then enable it on specific trials.

```typescript
import { initJsPsych } from "jspsych";
import jsPsychSurveyText from "@jspsych/plugin-survey-text";
import { SlopitExtension } from "@slopit/adapter-jspsych";

const jsPsych = initJsPsych({
  extensions: [{ type: SlopitExtension }],
});

const trial = {
  type: jsPsychSurveyText,
  questions: [{ prompt: "Describe your morning routine:", rows: 6 }],
  extensions: [
    {
      type: SlopitExtension,
      params: {
        targetSelector: "textarea",
        keystroke: { enabled: true },
        focus: { enabled: true },
        paste: { enabled: true },
      },
    },
  ],
};

jsPsych.run([trial]);
```

### Exporting Session Data

Use `exportToSlopit()` at experiment completion.

```typescript
import { initJsPsych } from "jspsych";
import jsPsychSurveyText from "@jspsych/plugin-survey-text";
import { SlopitExtension, exportToSlopit } from "@slopit/adapter-jspsych";

const jsPsych = initJsPsych({
  extensions: [{ type: SlopitExtension }],
  on_finish: () => {
    const session = exportToSlopit(jsPsych, {
      participantId: jsPsych.data.urlVariables().PROLIFIC_PID,
      studyId: "my-study-001",
    });

    // Log or send to server
    console.log(JSON.stringify(session, null, 2));
  },
});
```

## Extension Configuration

### Target Selector

The `targetSelector` parameter specifies which DOM element(s) to capture from.

```typescript
{
  type: jsPsychSurveyText,
  questions: [{ prompt: "Your response:", rows: 6 }],
  extensions: [
    {
      type: SlopitExtension,
      params: {
        targetSelector: "textarea",  // CSS selector for target element
        keystroke: { enabled: true },
      },
    },
  ],
}
```

For plugins with multiple inputs, you can target specific ones:

```typescript
{
  targetSelector: "#response-field",  // By ID
}

{
  targetSelector: ".main-input",  // By class
}

{
  targetSelector: "input[type='text']",  // By attribute
}
```

### Behavioral Capture Options

Configure what behavioral data to collect.

```typescript
{
  type: jsPsychSurveyText,
  questions: [{ prompt: "Your response:" }],
  extensions: [
    {
      type: SlopitExtension,
      params: {
        targetSelector: "textarea",
        keystroke: {
          enabled: true,
          captureKeyUp: true,      // Include keyup events
          includeModifiers: true,  // Include Shift/Ctrl/Alt/Meta
        },
        focus: {
          enabled: true,
          useVisibilityAPI: true,  // Track tab visibility
          useBlurFocus: true,      // Track window focus
        },
        paste: {
          enabled: true,
          prevent: false,          // Allow paste
          capturePreview: true,    // Store preview of pasted text
          previewLength: 100,      // Preview length in characters
        },
      },
    },
  ],
}
```

### Preventing Paste

Block paste operations and show a warning.

```typescript
{
  type: jsPsychSurveyText,
  questions: [{ prompt: "Type your response (no pasting):" }],
  extensions: [
    {
      type: SlopitExtension,
      params: {
        targetSelector: "textarea",
        paste: {
          enabled: true,
          prevent: true,
          warnMessage: "Please type your response manually. Pasting is not allowed.",
        },
      },
    },
  ],
}
```

## Working with Different Plugins

### Survey Text Plugin

```typescript
import jsPsychSurveyText from "@jspsych/plugin-survey-text";

{
  type: jsPsychSurveyText,
  questions: [
    { prompt: "Question 1:", rows: 4 },
    { prompt: "Question 2:", rows: 4 },
  ],
  extensions: [
    {
      type: SlopitExtension,
      params: {
        targetSelector: "textarea",  // Captures all textareas
        keystroke: { enabled: true },
      },
    },
  ],
}
```

### Survey HTML Form Plugin

```typescript
import jsPsychSurveyHtmlForm from "@jspsych/plugin-survey-html-form";

{
  type: jsPsychSurveyHtmlForm,
  html: `
    <p>Describe your experience:</p>
    <textarea id="experience" rows="6"></textarea>
  `,
  extensions: [
    {
      type: SlopitExtension,
      params: {
        targetSelector: "#experience",
        keystroke: { enabled: true },
      },
    },
  ],
}
```

### HTML Button Response with Text Input

```typescript
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";

{
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <p>Write your answer below:</p>
    <textarea id="answer" rows="4" style="width: 100%;"></textarea>
  `,
  choices: ["Submit"],
  extensions: [
    {
      type: SlopitExtension,
      params: {
        targetSelector: "#answer",
        keystroke: { enabled: true },
        paste: { enabled: true, prevent: true },
      },
    },
  ],
}
```

## Accessing Trial Data

### Within jsPsych

Access behavioral data after a trial completes.

```typescript
{
  type: jsPsychSurveyText,
  questions: [{ prompt: "Your response:" }],
  extensions: [
    {
      type: SlopitExtension,
      params: {
        targetSelector: "textarea",
        keystroke: { enabled: true },
      },
    },
  ],
  on_finish: (data) => {
    console.log("Response:", data.response);
    console.log("RT:", data.rt);
    console.log("Keystrokes:", data.slopit.behavioral.keystrokes.length);
    console.log("Flags:", data.slopit.flags);
  },
}
```

### Using getSlopitDataFromTrial()

Get slopit data from a specific trial index.

```typescript
import { getSlopitDataFromTrial } from "@slopit/adapter-jspsych";

// After experiment completes
const trialData = getSlopitDataFromTrial(jsPsych, 2);

if (trialData) {
  console.log("Behavioral data:", trialData.behavioral);
  console.log("Flags:", trialData.flags);
}
```

## Export Options

### Participant and Study IDs

Include identifiers for data organization.

```typescript
const session = exportToSlopit(jsPsych, {
  participantId: jsPsych.data.urlVariables().PROLIFIC_PID,
  studyId: "experiment-v2",
});
```

### Filtering Trials

Export only specific trial types.

```typescript
const session = exportToSlopit(jsPsych, {
  trialFilter: (trial) => {
    // Only include trials that have slopit data
    return trial["slopit"] !== undefined;
  },
});
```

### Excluding Platform Data

Reduce export size by excluding raw jsPsych data.

```typescript
const session = exportToSlopit(jsPsych, {
  includePlatformData: false,  // Exclude raw trial data
});
```

## Sending Data to Server

### Using fetch

```typescript
const jsPsych = initJsPsych({
  extensions: [{ type: SlopitExtension }],
  on_finish: async () => {
    const session = exportToSlopit(jsPsych, { participantId, studyId });

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(session),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      // Redirect to completion
      window.location.href = completionUrl;
    } catch (error) {
      console.error("Failed to submit:", error);
      // Show error message to participant
    }
  },
});
```

### With JATOS

```typescript
const jsPsych = initJsPsych({
  extensions: [{ type: SlopitExtension }],
  on_finish: () => {
    const session = exportToSlopit(jsPsych, {
      participantId: jatos.workerId,
      studyId: jatos.studyId,
    });

    jatos.submitResultData(JSON.stringify(session))
      .then(() => jatos.endStudy())
      .catch((error) => console.error("JATOS error:", error));
  },
});
```

### With Prolific

```typescript
const jsPsych = initJsPsych({
  extensions: [{ type: SlopitExtension }],
  on_finish: async () => {
    const urlParams = jsPsych.data.urlVariables();
    const session = exportToSlopit(jsPsych, {
      participantId: urlParams.PROLIFIC_PID,
      studyId: urlParams.STUDY_ID,
    });

    await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(session),
    });

    // Redirect to Prolific completion URL
    window.location.href = `https://app.prolific.co/submissions/complete?cc=${completionCode}`;
  },
});
```

## Complete Example

```typescript
import { initJsPsych } from "jspsych";
import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import jsPsychSurveyText from "@jspsych/plugin-survey-text";
import { SlopitExtension, exportToSlopit } from "@slopit/adapter-jspsych";

// Get participant info from URL
const urlParams = new URLSearchParams(window.location.search);
const participantId = urlParams.get("PROLIFIC_PID") || "test-participant";
const studyId = "writing-study-001";
const completionCode = "ABC123XYZ";

const jsPsych = initJsPsych({
  extensions: [{ type: SlopitExtension }],
  on_finish: async () => {
    // Export to slopit format
    const session = exportToSlopit(jsPsych, {
      participantId,
      studyId,
      trialFilter: (trial) => trial["slopit"] !== undefined,
    });

    // Send to server
    try {
      await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(session),
      });

      // Redirect to Prolific
      window.location.href =
        `https://app.prolific.co/submissions/complete?cc=${completionCode}`;
    } catch (error) {
      // Show manual completion code
      document.body.innerHTML = `
        <h2>Submission Error</h2>
        <p>Please copy this code and return to Prolific: <strong>${completionCode}</strong></p>
      `;
    }
  },
});

const timeline = [
  // Welcome
  {
    type: htmlKeyboardResponse,
    stimulus: `
      <h1>Writing Study</h1>
      <p>You will complete 3 short writing tasks.</p>
      <p>Press any key to begin.</p>
    `,
  },

  // Task 1
  {
    type: jsPsychSurveyText,
    questions: [
      {
        prompt: "<h3>Task 1 of 3</h3><p>Describe your typical morning routine.</p>",
        rows: 6,
      },
    ],
    extensions: [
      {
        type: SlopitExtension,
        params: {
          targetSelector: "textarea",
          keystroke: { enabled: true },
          paste: { enabled: true, prevent: true, warnMessage: "Please type manually." },
        },
      },
    ],
  },

  // Task 2
  {
    type: jsPsychSurveyText,
    questions: [
      {
        prompt: "<h3>Task 2 of 3</h3><p>Explain how to prepare your favorite meal.</p>",
        rows: 6,
      },
    ],
    extensions: [
      {
        type: SlopitExtension,
        params: {
          targetSelector: "textarea",
          keystroke: { enabled: true },
          paste: { enabled: true, prevent: true },
        },
      },
    ],
  },

  // Task 3
  {
    type: jsPsychSurveyText,
    questions: [
      {
        prompt: "<h3>Task 3 of 3</h3><p>Describe a memorable travel experience.</p>",
        rows: 6,
      },
    ],
    extensions: [
      {
        type: SlopitExtension,
        params: {
          targetSelector: "textarea",
          keystroke: { enabled: true },
          paste: { enabled: true, prevent: true },
        },
      },
    ],
  },

  // Debrief
  {
    type: htmlKeyboardResponse,
    stimulus: `
      <h2>Thank You!</h2>
      <p>Your responses have been recorded.</p>
      <p>Press any key to complete the study.</p>
    `,
  },
];

jsPsych.run(timeline);
```

## Troubleshooting

### Extension Not Found

Ensure you are importing from the correct package and registering the extension.

```typescript
// Correct
import { SlopitExtension } from "@slopit/adapter-jspsych";

const jsPsych = initJsPsych({
  extensions: [{ type: SlopitExtension }],  // Register here
});

// Then use on trials
{
  type: jsPsychSurveyText,
  extensions: [{ type: SlopitExtension, params: { ... } }],
}
```

### Missing Behavioral Data

Check that the extension is enabled on the trial and the targetSelector matches an element.

```typescript
{
  type: jsPsychSurveyText,
  questions: [{ prompt: "Test:" }],
  extensions: [
    {
      type: SlopitExtension,
      params: {
        targetSelector: "textarea",  // Must match an element in the trial
        keystroke: { enabled: true },  // Must be true
      },
    },
  ],
}
```

### jsPsych Version Error

The adapter requires jsPsych 8.x.

```bash
pnpm add jspsych@^8
```

### Data Not Exported

Ensure `on_finish` is configured on the jsPsych instance, not individual trials.

```typescript
// Correct: on jsPsych instance
const jsPsych = initJsPsych({
  extensions: [{ type: SlopitExtension }],
  on_finish: () => {
    const session = exportToSlopit(jsPsych);
  },
});

// Wrong: on_finish on trial only runs after that trial
{
  type: jsPsychSurveyText,
  on_finish: () => {
    // This runs after THIS trial, not at experiment end
  },
}
```
