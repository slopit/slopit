---
sidebar_position: 4
---

# @slopit/adapter-jspsych API Reference

The jsPsych adapter provides integration with jsPsych 8.x for behavioral capture during experiments.

## Installation

```bash
pnpm add @slopit/adapter-jspsych jspsych@^8
```

jsPsych 8.x is a peer dependency and must be installed separately.

## SlopitExtension

A jsPsych extension that adds behavioral capture to any jsPsych plugin. The extension attaches to DOM elements matching a CSS selector and records keystrokes, focus events, and paste operations.

### Registration

Register the extension when initializing jsPsych:

```typescript
import { initJsPsych } from "jspsych";
import { SlopitExtension } from "@slopit/adapter-jspsych";

const jsPsych = initJsPsych({
  extensions: [{ type: SlopitExtension }],
});
```

### Usage on Trials

Enable the extension on individual trials:

```typescript
import jsPsychSurveyText from "@jspsych/plugin-survey-text";

const trial = {
  type: jsPsychSurveyText,
  questions: [{ prompt: "Describe your morning routine:", rows: 6 }],
  extensions: [
    {
      type: SlopitExtension,
      params: {
        targetSelector: "textarea",
        keystroke: { enabled: true },
        paste: { enabled: true, prevent: false },
      },
    },
  ],
};

jsPsych.run([trial]);
```

### SlopitExtensionParams

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `targetSelector` | string | (required) | CSS selector for the target element(s) to capture |
| `keystroke` | KeystrokeConfig | `{ enabled: false }` | Keystroke capture configuration |
| `focus` | FocusConfig | `{ enabled: false }` | Focus tracking configuration |
| `paste` | PasteConfig | `{ enabled: false }` | Paste detection configuration |

### KeystrokeConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `false` | Enable keystroke capture |
| `captureKeyUp` | boolean | `true` | Include keyup events |
| `includeModifiers` | boolean | `true` | Include Shift/Ctrl/Alt/Meta states |

### FocusConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `false` | Enable focus tracking |
| `useVisibilityAPI` | boolean | `true` | Track tab visibility changes |
| `useBlurFocus` | boolean | `true` | Track window blur/focus |

### PasteConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `false` | Enable paste detection |
| `prevent` | boolean | `false` | Block paste operations |
| `warnMessage` | string | `""` | Message shown when paste is prevented |
| `capturePreview` | boolean | `true` | Store preview of pasted text |
| `previewLength` | number | `100` | Preview length in characters |

### Trial Data

The extension adds a `slopit` property to trial data:

| Property | Type | Description |
|----------|------|-------------|
| `slopit.behavioral` | BehavioralData | Raw behavioral data |
| `slopit.flags` | CaptureFlag[] | Generated flags |

### Example with All Options

```typescript
const trial = {
  type: jsPsychSurveyText,
  questions: [
    {
      prompt: "<h3>Writing Task</h3><p>Describe your typical morning routine.</p>",
      rows: 8,
    },
  ],
  extensions: [
    {
      type: SlopitExtension,
      params: {
        targetSelector: "textarea",
        keystroke: {
          enabled: true,
          captureKeyUp: true,
          includeModifiers: true,
        },
        focus: {
          enabled: true,
          useVisibilityAPI: true,
          useBlurFocus: true,
        },
        paste: {
          enabled: true,
          prevent: true,
          warnMessage: "Pasting is not allowed in this task.",
        },
      },
    },
  ],
};
```

## exportToSlopit()

Convert jsPsych data to SlopitSession format for server-side analysis.

### Signature

```typescript
function exportToSlopit(jsPsych: JsPsych, options?: ExportOptions): SlopitSession;
```

### ExportOptions

```typescript
interface ExportOptions {
  participantId?: string;
  studyId?: string;
  trialFilter?: (trial: Record<string, unknown>) => boolean;
  includePlatformData?: boolean;  // Default: true
}
```

- **participantId**: Participant ID (e.g., from Prolific PROLIFIC_PID)
- **studyId**: Study identifier
- **trialFilter**: Function to select which trials to include
- **includePlatformData**: Whether to include raw jsPsych trial data

### Basic Example

```typescript
import { initJsPsych } from "jspsych";
import { SlopitExtension, exportToSlopit } from "@slopit/adapter-jspsych";

const jsPsych = initJsPsych({
  extensions: [{ type: SlopitExtension }],
  on_finish: () => {
    const session = exportToSlopit(jsPsych, {
      participantId: jsPsych.data.urlVariables().PROLIFIC_PID,
      studyId: "my-study-001",
    });

    console.log(JSON.stringify(session));
  },
});
```

### With Trial Filtering

```typescript
const session = exportToSlopit(jsPsych, {
  participantId: participantId,
  trialFilter: (trial) => {
    // Only include trials that have slopit data
    return trial["slopit"] !== undefined;
  },
});
```

### Sending to Server

```typescript
const session = exportToSlopit(jsPsych, { participantId, studyId });

await fetch("/api/submit-session", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(session),
});
```

## getSlopitDataFromTrial()

Extract slopit data from a specific trial by index.

### Signature

```typescript
function getSlopitDataFromTrial(
  jsPsych: JsPsych,
  trialIndex: number
): { behavioral: unknown; flags: unknown[] } | undefined;
```

### Example

```typescript
import { getSlopitDataFromTrial } from "@slopit/adapter-jspsych";

// Get slopit data from trial 3
const slopitData = getSlopitDataFromTrial(jsPsych, 3);

if (slopitData) {
  console.log("Behavioral data:", slopitData.behavioral);
  console.log("Flags:", slopitData.flags);
}
```

## Types

### SlopitExtensionParams

Configuration type for the extension params.

```typescript
interface SlopitExtensionParams {
  targetSelector: string;
  keystroke?: KeystrokeConfig;
  focus?: FocusConfig;
  paste?: PasteConfig;
}
```

## Complete Experiment Example

```typescript
import { initJsPsych } from "jspsych";
import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import jsPsychSurveyText from "@jspsych/plugin-survey-text";
import { SlopitExtension, exportToSlopit } from "@slopit/adapter-jspsych";

const jsPsych = initJsPsych({
  extensions: [{ type: SlopitExtension }],
  on_finish: async () => {
    const session = exportToSlopit(jsPsych, {
      participantId: jsPsych.data.urlVariables().PROLIFIC_PID,
      studyId: "writing-study-001",
    });

    await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(session),
    });

    // Redirect to Prolific completion
    window.location.href = "https://app.prolific.co/submissions/complete?cc=ABC123";
  },
});

const timeline = [
  // Instructions
  {
    type: htmlKeyboardResponse,
    stimulus: `
      <h2>Writing Task</h2>
      <p>You will be asked to write about several topics.</p>
      <p>Press any key to continue.</p>
    `,
  },

  // Writing trial 1
  {
    type: jsPsychSurveyText,
    questions: [{ prompt: "Describe your ideal vacation destination.", rows: 6 }],
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

  // Writing trial 2
  {
    type: jsPsychSurveyText,
    questions: [{ prompt: "Explain how to make your favorite meal.", rows: 6 }],
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
      <h2>Thank You</h2>
      <p>Your responses have been recorded.</p>
      <p>Press any key to complete the study.</p>
    `,
  },
];

jsPsych.run(timeline);
```

## Working with Different Plugins

The SlopitExtension works with any jsPsych plugin that renders text inputs. Use the `targetSelector` to specify which element(s) to capture.

### Survey Text

```typescript
import jsPsychSurveyText from "@jspsych/plugin-survey-text";

{
  type: jsPsychSurveyText,
  questions: [{ prompt: "Your response:" }],
  extensions: [
    {
      type: SlopitExtension,
      params: { targetSelector: "textarea", keystroke: { enabled: true } },
    },
  ],
}
```

### Survey HTML Form

```typescript
import jsPsychSurveyHtmlForm from "@jspsych/plugin-survey-html-form";

{
  type: jsPsychSurveyHtmlForm,
  html: `<textarea id="response" rows="6"></textarea>`,
  extensions: [
    {
      type: SlopitExtension,
      params: { targetSelector: "#response", keystroke: { enabled: true } },
    },
  ],
}
```

### HTML Button Response

```typescript
import jsPsychHtmlButtonResponse from "@jspsych/plugin-html-button-response";

{
  type: jsPsychHtmlButtonResponse,
  stimulus: `<textarea id="answer"></textarea>`,
  choices: ["Submit"],
  extensions: [
    {
      type: SlopitExtension,
      params: { targetSelector: "#answer", keystroke: { enabled: true } },
    },
  ],
}
```
