# @slopit/adapter-jspsych

jsPsych 8.x adapter for slopit behavioral capture.

## Installation

```bash
pnpm add @slopit/adapter-jspsych
```

**Peer Dependencies:**

- `jspsych` ^8.0.0

## Quick Start

```typescript
import { initJsPsych } from "jspsych";
import { SlopitSurveyTextPlugin, exportToSlopit } from "@slopit/adapter-jspsych";

const jsPsych = initJsPsych({
  on_finish: () => {
    // export all data in slopit format
    const session = exportToSlopit(jsPsych, {
      participantId: jsPsych.data.urlVariables().PROLIFIC_PID,
      studyId: "my-study-001",
    });

    // send to server
    fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(session),
    });
  },
});

const timeline = [
  {
    type: SlopitSurveyTextPlugin,
    prompt: "Describe your morning routine in detail:",
    rows: 6,
    minLength: 50,
    slopit: {
      keystroke: { enabled: true },
      focus: { enabled: true },
      paste: { enabled: true, prevent: false },
    },
  },
];

jsPsych.run(timeline);
```

## API

### SlopitSurveyTextPlugin

A jsPsych plugin for text responses with integrated behavioral capture.

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| prompt | string | required | The prompt or question to display (supports HTML) |
| placeholder | string | "" | Placeholder text for the textarea |
| rows | number | 5 | Number of rows for the textarea |
| columns | number | 40 | Number of columns for the textarea |
| required | boolean | true | Whether a response is required |
| minLength | number | 0 | Minimum character count (0 for no minimum) |
| maxLength | number | 0 | Maximum character count (0 for no maximum) |
| buttonLabel | string | "Continue" | Text for the submit button |
| slopit | SlopitConfig | default config | Behavioral capture configuration |

#### Data Generated

| Field | Type | Description |
|-------|------|-------------|
| response | string | The participant's text response |
| rt | number | Response time in milliseconds |
| characterCount | number | Character count of response |
| wordCount | number | Word count of response |
| slopit | object | Behavioral capture data and flags |

#### Basic Usage

```typescript
import { SlopitSurveyTextPlugin } from "@slopit/adapter-jspsych";

const trial = {
  type: SlopitSurveyTextPlugin,
  prompt: "What are your thoughts on this topic?",
};
```

#### With All Options

```typescript
const trial = {
  type: SlopitSurveyTextPlugin,
  prompt: `
    <h3>Essay Question</h3>
    <p>Please write a detailed response about your experience.</p>
  `,
  placeholder: "Type your response here...",
  rows: 8,
  columns: 60,
  required: true,
  minLength: 100,
  maxLength: 2000,
  buttonLabel: "Submit Response",
  slopit: {
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
      prevent: false,
      capturePreview: true,
      previewLength: 200,
    },
    clipboard: {
      enabled: true,
      capturePaste: true,
      captureCopyCut: true,
    },
    mouse: {
      enabled: true,
      captureClicks: true,
      captureMovement: true,
      throttleMs: 50,
    },
    scroll: {
      enabled: true,
      throttleMs: 100,
    },
    inputDuration: {
      enabled: true,
      trackKeystrokes: true,
      trackPastes: true,
    },
  },
};
```

#### Preventing Paste

```typescript
const trial = {
  type: SlopitSurveyTextPlugin,
  prompt: "Write your response without copying from other sources:",
  slopit: {
    paste: {
      enabled: true,
      prevent: true,
      warnMessage: "Pasting is not allowed for this question.",
    },
  },
};
```

### exportToSlopit

Exports jsPsych data to the SlopitSession format for server-side analysis.

```typescript
import { exportToSlopit } from "@slopit/adapter-jspsych";

const session = exportToSlopit(jsPsych, options);
```

#### ExportOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| participantId | string | undefined | Participant ID (e.g., from Prolific) |
| studyId | string | undefined | Study ID for grouping sessions |
| trialFilter | function | undefined | Filter function to select trials |
| includePlatformData | boolean | true | Whether to include raw jsPsych trial data |

#### Basic Export

```typescript
const session = exportToSlopit(jsPsych);
console.log(JSON.stringify(session, null, 2));
```

#### With Participant Metadata

```typescript
const urlParams = jsPsych.data.urlVariables();

const session = exportToSlopit(jsPsych, {
  participantId: urlParams.PROLIFIC_PID,
  studyId: "attention-check-study-v2",
});
```

#### Filtering Trials

```typescript
// only export trials with slopit data
const session = exportToSlopit(jsPsych, {
  trialFilter: (trial) => trial.slopit !== undefined,
});

// only export specific trial types
const session = exportToSlopit(jsPsych, {
  trialFilter: (trial) => trial.trial_type === "slopit-survey-text",
});
```

#### Excluding Platform Data

```typescript
// minimize payload size by excluding raw jsPsych data
const session = exportToSlopit(jsPsych, {
  includePlatformData: false,
});
```

### getSlopitDataFromTrial

Retrieves slopit data from a specific trial.

```typescript
import { getSlopitDataFromTrial } from "@slopit/adapter-jspsych";

const data = getSlopitDataFromTrial(jsPsych, trialIndex);
if (data) {
  console.log("Behavioral data:", data.behavioral);
  console.log("Flags:", data.flags);
}
```

## Configuration

### SlopitConfig

The `slopit` parameter accepts the same configuration as `BehavioralCaptureConfig` from `@slopit/behavioral`, plus an optional `enabled` flag.

```typescript
interface SlopitConfig {
  enabled?: boolean;          // enable/disable slopit for this trial (default: true)
  keystroke?: KeystrokeCaptureConfig;
  focus?: FocusCaptureConfig;
  paste?: PasteCaptureConfig;
  clipboard?: ClipboardCaptureConfig;
  mouse?: MouseCaptureConfig;
  scroll?: ScrollCaptureConfig;
  inputDuration?: InputDurationCaptureConfig;
}
```

### Default Configuration

When no `slopit` parameter is provided, the plugin uses these defaults:

```typescript
{
  keystroke: { enabled: true },
  focus: { enabled: true },
  paste: { enabled: true, prevent: false },
}
```

## Examples

### Complete Experiment

```typescript
import { initJsPsych } from "jspsych";
import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import { SlopitSurveyTextPlugin, exportToSlopit } from "@slopit/adapter-jspsych";

const jsPsych = initJsPsych({
  on_finish: async () => {
    const session = exportToSlopit(jsPsych, {
      participantId: jsPsych.data.urlVariables().PROLIFIC_PID,
      studyId: "writing-study-v1",
    });

    await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(session),
    });

    // redirect to completion page
    window.location.href = "https://example.com/complete";
  },
});

const timeline = [];

// instructions
timeline.push({
  type: htmlKeyboardResponse,
  stimulus: `
    <h2>Writing Task</h2>
    <p>You will be asked to write several short responses.</p>
    <p>Please type your responses yourself without using AI assistance.</p>
    <p>Press any key to continue.</p>
  `,
});

// writing trials
const prompts = [
  "Describe a memorable experience from your childhood.",
  "Explain your opinion on a current social issue.",
  "Write about a goal you hope to achieve in the next year.",
];

for (const prompt of prompts) {
  timeline.push({
    type: SlopitSurveyTextPlugin,
    prompt: `<p>${prompt}</p>`,
    rows: 6,
    minLength: 100,
    slopit: {
      keystroke: { enabled: true, captureKeyUp: true },
      focus: { enabled: true },
      paste: { enabled: true },
      mouse: { enabled: true, throttleMs: 100 },
    },
  });
}

// debrief
timeline.push({
  type: htmlKeyboardResponse,
  stimulus: `
    <h2>Thank you!</h2>
    <p>Your responses have been recorded.</p>
    <p>Press any key to complete the study.</p>
  `,
});

jsPsych.run(timeline);
```

### With Intervention Warnings

```typescript
import { initJsPsych } from "jspsych";
import { SlopitSurveyTextPlugin, getSlopitDataFromTrial } from "@slopit/adapter-jspsych";

const jsPsych = initJsPsych();

const writingTrial = {
  type: SlopitSurveyTextPlugin,
  prompt: "Write a short paragraph about your hobbies:",
  rows: 5,
  minLength: 50,
  slopit: {
    keystroke: { enabled: true },
    paste: { enabled: true },
  },
};

// check for suspicious behavior after trial
const checkTrial = {
  type: "call-function",
  func: () => {
    const lastTrialIndex = jsPsych.data.get().count() - 1;
    const data = getSlopitDataFromTrial(jsPsych, lastTrialIndex);

    if (data?.flags && data.flags.length > 0) {
      const pasteFlags = data.flags.filter(f => f.type === "paste_detected");
      if (pasteFlags.length > 0) {
        console.log("Warning: Paste detected in response");
      }
    }
  },
};

const timeline = [writingTrial, checkTrial];
jsPsych.run(timeline);
```

### Multiple Response Types

```typescript
import { initJsPsych } from "jspsych";
import surveyMultiChoice from "@jspsych/plugin-survey-multi-choice";
import { SlopitSurveyTextPlugin, exportToSlopit } from "@slopit/adapter-jspsych";

const jsPsych = initJsPsych();

const timeline = [
  // multiple choice (no slopit capture)
  {
    type: surveyMultiChoice,
    questions: [
      {
        prompt: "What is your age range?",
        options: ["18-24", "25-34", "35-44", "45+"],
        required: true,
      },
    ],
  },

  // text response with slopit
  {
    type: SlopitSurveyTextPlugin,
    prompt: "Please describe your educational background:",
    rows: 4,
    slopit: {
      keystroke: { enabled: true },
      focus: { enabled: true },
    },
  },

  // longer essay with full capture
  {
    type: SlopitSurveyTextPlugin,
    prompt: "Write about a challenge you overcame:",
    rows: 8,
    minLength: 200,
    slopit: {
      keystroke: { enabled: true, captureKeyUp: true },
      focus: { enabled: true },
      paste: { enabled: true },
      mouse: { enabled: true },
      scroll: { enabled: true },
      inputDuration: { enabled: true },
    },
  },
];

jsPsych.run(timeline);
```

### Accessing Data During Experiment

```typescript
import { initJsPsych } from "jspsych";
import htmlButtonResponse from "@jspsych/plugin-html-button-response";
import { SlopitSurveyTextPlugin, getSlopitDataFromTrial } from "@slopit/adapter-jspsych";

const jsPsych = initJsPsych();

const timeline = [
  {
    type: SlopitSurveyTextPlugin,
    prompt: "Write about your day:",
    rows: 5,
  },
  {
    type: htmlButtonResponse,
    stimulus: () => {
      const lastIndex = jsPsych.data.get().count() - 1;
      const data = getSlopitDataFromTrial(jsPsych, lastIndex);

      if (!data) return "<p>No behavioral data captured.</p>";

      const metrics = data.behavioral?.metrics?.keystroke;
      const timing = data.behavioral?.metrics?.timing;

      return `
        <h3>Your Writing Statistics</h3>
        <p>Keystrokes: ${metrics?.totalKeystrokes ?? 0}</p>
        <p>Mean typing interval: ${Math.round(metrics?.meanIKI ?? 0)}ms</p>
        <p>Characters per minute: ${Math.round(timing?.charactersPerMinute ?? 0)}</p>
      `;
    },
    choices: ["Continue"],
  },
];

jsPsych.run(timeline);
```

## Data Structure

### Trial Data Output

Each SlopitSurveyTextPlugin trial generates data in this structure:

```typescript
{
  response: "The participant's typed response...",
  rt: 45230,
  characterCount: 234,
  wordCount: 42,
  slopit: {
    behavioral: {
      keystrokes: [
        { time: 1234, key: "T", code: "KeyT", event: "keydown", textLength: 1 },
        { time: 1300, key: "T", code: "KeyT", event: "keyup" },
        // ... more keystrokes
      ],
      focus: [
        { time: 15000, event: "blur" },
        { time: 18500, event: "focus", blurDuration: 3500 },
      ],
      paste: [
        { time: 25000, textLength: 50, precedingKeystrokes: 3, blocked: false },
      ],
      metrics: {
        keystroke: {
          totalKeystrokes: 280,
          printableKeystrokes: 250,
          deletions: 15,
          meanIKI: 152.3,
          stdIKI: 45.2,
          medianIKI: 140,
          pauseCount: 5,
          productProcessRatio: 0.84,
        },
        focus: {
          blurCount: 1,
          totalBlurDuration: 3500,
          hiddenCount: 0,
          totalHiddenDuration: 0,
        },
        timing: {
          firstKeystrokeLatency: 1234,
          totalResponseTime: 45230,
          charactersPerMinute: 310,
        },
      },
    },
    flags: [
      {
        type: "paste_detected",
        severity: "medium",
        message: "1 paste event(s) detected",
        timestamp: 1706123456789,
        details: { count: 1 },
      },
    ],
  },
  trial_type: "slopit-survey-text",
  trial_index: 2,
  time_elapsed: 48500,
}
```

### Exported Session Structure

The `exportToSlopit` function produces a `SlopitSession` object:

```typescript
{
  schemaVersion: "1.0.0",
  sessionId: "session_1706123456789_a1b2c3d4",
  participantId: "P12345",
  studyId: "writing-study-v1",
  platform: {
    name: "jspsych",
    version: "8.0.0",
    adapterVersion: "0.1.0",
  },
  environment: {
    userAgent: "Mozilla/5.0 ...",
    language: "en-US",
    platform: "MacIntel",
    screenWidth: 2560,
    screenHeight: 1440,
    // ... more environment data
  },
  timing: {
    startTime: 1706123400000,
    endTime: 1706123856789,
    duration: 456789,
  },
  trials: [
    {
      trialId: "trial-0",
      trialIndex: 0,
      trialType: "slopit-survey-text",
      startTime: 3270,
      endTime: 48500,
      rt: 45230,
      response: {
        type: "text",
        value: "The participant's typed response...",
        characterCount: 234,
        wordCount: 42,
      },
      behavioral: { /* BehavioralData */ },
      captureFlags: [ /* CaptureFlag[] */ ],
      platformData: { /* raw jsPsych trial data */ },
    },
    // ... more trials
  ],
  globalEvents: {
    focus: [],
    errors: [],
  },
}
```

## Styling

The plugin generates HTML with CSS classes you can style:

```css
/* container */
.slopit-survey-text {
  max-width: 800px;
  margin: 0 auto;
}

/* prompt area */
.slopit-prompt {
  margin-bottom: 1rem;
  font-size: 1.1em;
}

/* textarea container */
.slopit-input-container {
  margin-bottom: 1rem;
}

/* the textarea itself */
#slopit-response {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  font-family: inherit;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* character counter */
.slopit-char-counter {
  text-align: right;
  font-size: 0.9em;
  color: #666;
  margin-top: 0.25rem;
}

/* submit button container */
.slopit-button-container {
  text-align: center;
}

/* validation error message */
.slopit-validation-error {
  color: red;
  margin-top: 10px;
  text-align: center;
}
```

## Keyboard Shortcuts

- **Ctrl+Enter** or **Cmd+Enter**: Submit the response

## License

MIT
