---
sidebar_position: 2
---

# jsPsych Experiment Example

A complete jsPsych experiment with behavioral capture and data export.

## Project Structure

```
experiment/
├── index.html
├── src/
│   └── experiment.ts
├── package.json
├── tsconfig.json
└── vite.config.js
```

## package.json

```json
{
  "name": "slopit-jspsych-experiment",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@slopit/adapter-jspsych": "^0.1.0",
    "jspsych": "^8.0.0",
    "@jspsych/plugin-html-keyboard-response": "^2.0.0",
    "@jspsych/plugin-survey-text": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "vite": "^6.0.0"
  }
}
```

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "verbatimModuleSyntax": true,
    "outDir": "dist",
    "declaration": true
  },
  "include": ["src"]
}
```

## vite.config.js

```javascript
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
  },
});
```

## index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Writing Study</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f0f0f0;
    }

    .jspsych-content {
      max-width: 800px;
    }

    .jspsych-survey-text {
      text-align: left;
    }

    .jspsych-survey-text textarea {
      width: 100%;
      padding: 12px;
      font-size: 16px;
      border: 2px solid #ccc;
      border-radius: 4px;
      resize: vertical;
      box-sizing: border-box;
    }

    .jspsych-survey-text textarea:focus {
      outline: none;
      border-color: #0066cc;
    }

    .instructions {
      background: white;
      padding: 30px;
      border-radius: 8px;
      max-width: 600px;
      margin: 0 auto;
    }

    .instructions h2 {
      margin-top: 0;
    }

    .instructions ul {
      text-align: left;
      margin: 20px 0;
    }

    .instructions li {
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <script type="module" src="/src/experiment.ts"></script>
</body>
</html>
```

## src/experiment.ts

```typescript
import { initJsPsych } from "jspsych";
import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import jsPsychSurveyText from "@jspsych/plugin-survey-text";
import { SlopitExtension, exportToSlopit } from "@slopit/adapter-jspsych";

// Configuration
const CONFIG = {
  minResponseLength: 50,
  maxResponseLength: 1000,
  apiEndpoint: "/api/sessions",
  // For Prolific, get from URL params
  completionUrl: "https://app.prolific.co/submissions/complete?cc=COMPLETION_CODE",
};

// Get URL parameters
function getUrlParams(): Record<string, string> {
  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(window.location.search);
  for (const [key, value] of searchParams) {
    params[key] = value;
  }
  return params;
}

const urlParams = getUrlParams();
const participantId = urlParams["PROLIFIC_PID"] || urlParams["participant_id"] || "test-participant";
const studyId = urlParams["STUDY_ID"] || "writing-study-001";
const sessionId = urlParams["SESSION_ID"];

// Initialize jsPsych with SlopitExtension
const jsPsych = initJsPsych({
  extensions: [{ type: SlopitExtension }],
  on_finish: async () => {
    // Show loading message
    document.body.innerHTML = `
      <div style="text-align: center; padding: 50px;">
        <h2>Submitting your responses...</h2>
        <p>Please wait.</p>
      </div>
    `;

    // Export to slopit format
    const session = exportToSlopit(jsPsych, {
      participantId,
      studyId,
      trialFilter: (trial) => trial["slopit"] !== undefined,
    });

    // Add session ID from URL if available
    if (sessionId) {
      session.metadata = { ...session.metadata, prolificSessionId: sessionId };
    }

    try {
      // Send to server
      const response = await fetch(CONFIG.apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(session),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      // Redirect to completion
      window.location.href = CONFIG.completionUrl;
    } catch (error) {
      console.error("Submission error:", error);

      // Show error with manual completion option
      document.body.innerHTML = `
        <div style="text-align: center; padding: 50px;">
          <h2>Submission Error</h2>
          <p>We encountered an error submitting your responses.</p>
          <p>Your data has been saved locally. Please copy the code below and return to Prolific:</p>
          <p style="font-size: 1.5em; font-weight: bold; margin: 20px 0;">COMPLETION_CODE</p>
          <p>If the problem persists, please contact the researcher.</p>
        </div>
      `;

      // Also save data locally as backup
      localStorage.setItem(`slopit-session-${session.sessionId}`, JSON.stringify(session));
    }
  },
});

// Writing prompts
const writingPrompts = [
  {
    id: "morning-routine",
    prompt: `
      <h3>Task 1 of 3: Morning Routine</h3>
      <p>Describe your typical morning routine in detail. What do you do from the moment you wake up until you leave for work or start your day?</p>
    `,
  },
  {
    id: "favorite-meal",
    prompt: `
      <h3>Task 2 of 3: Cooking Instructions</h3>
      <p>Explain how to prepare your favorite meal. Include the ingredients needed and step-by-step instructions.</p>
    `,
  },
  {
    id: "travel-memory",
    prompt: `
      <h3>Task 3 of 3: Travel Experience</h3>
      <p>Describe a memorable travel experience. Where did you go? What made it memorable?</p>
    `,
  },
];

// Build timeline
const timeline: unknown[] = [];

// Welcome screen
timeline.push({
  type: htmlKeyboardResponse,
  stimulus: `
    <div class="instructions">
      <h2>Welcome to the Writing Study</h2>
      <p>Thank you for participating in this research study.</p>
      <p>In this study, you will complete <strong>3 short writing tasks</strong>.</p>
      <ul>
        <li>Each task asks you to write about a different topic</li>
        <li>Please write at least ${CONFIG.minResponseLength} characters for each response</li>
        <li>Write in your own words without copying from other sources</li>
        <li>The study takes approximately 10-15 minutes</li>
      </ul>
      <p><strong>Press any key to continue.</strong></p>
    </div>
  `,
});

// Instructions screen
timeline.push({
  type: htmlKeyboardResponse,
  stimulus: `
    <div class="instructions">
      <h2>Before You Begin</h2>
      <p>A few important notes:</p>
      <ul>
        <li>Please <strong>type your responses</strong> rather than copying and pasting</li>
        <li>Try to stay focused on the task without switching to other tabs</li>
        <li>There are no right or wrong answers; we are interested in your experiences</li>
      </ul>
      <p><strong>Press any key to begin the first task.</strong></p>
    </div>
  `,
});

// Writing tasks
for (const writingPrompt of writingPrompts) {
  timeline.push({
    type: jsPsychSurveyText,
    questions: [
      {
        prompt: writingPrompt.prompt,
        rows: 8,
        columns: 60,
        required: true,
      },
    ],
    button_label: "Submit Response",
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
            warnMessage: "Please type your response. Pasting is not allowed in this study.",
            capturePreview: true,
          },
        },
      },
    ],
    data: {
      task_id: writingPrompt.id,
    },
  });
}

// Debrief screen
timeline.push({
  type: htmlKeyboardResponse,
  stimulus: `
    <div class="instructions">
      <h2>Thank You!</h2>
      <p>You have completed all writing tasks.</p>
      <p>Your responses have been recorded and will be used for research purposes only.</p>
      <p><strong>Press any key to submit your responses and complete the study.</strong></p>
    </div>
  `,
});

// Run experiment
jsPsych.run(timeline);
```

## Running the Experiment

### Development

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Production Build

```bash
npm run build
```

The built files are in the `dist/` directory.

## Key Features Demonstrated

### 1. SlopitExtension Registration

The extension is registered when initializing jsPsych:

```typescript
const jsPsych = initJsPsych({
  extensions: [{ type: SlopitExtension }],
});
```

### 2. Behavioral Capture Configuration

Each writing task enables the extension with specific configuration:

- Keystrokes (keydown and keyup events with modifier states)
- Focus events (tab switches and window blur)
- Paste events (blocked with warning message)

```typescript
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
```

### 3. Data Export

At experiment completion:

- Filters to only include trials with slopit data
- Includes participant ID from URL parameters
- Sends to server API endpoint
- Handles errors gracefully with local backup

### 4. Prolific Integration

- Reads PROLIFIC_PID, STUDY_ID, SESSION_ID from URL
- Redirects to Prolific completion URL
- Shows completion code if submission fails

## Customization

### Changing Writing Prompts

Edit the `writingPrompts` array.

```typescript
const writingPrompts = [
  {
    id: "custom-task",
    prompt: "<h3>Your Custom Task</h3><p>Instructions here...</p>",
  },
];
```

### Adjusting Capture Settings

Modify the extension params in each trial.

```typescript
extensions: [
  {
    type: SlopitExtension,
    params: {
      targetSelector: "textarea",
      keystroke: { enabled: true },
      paste: { enabled: true, prevent: false },  // Allow paste
    },
  },
],
```

### Using Different Plugins

The SlopitExtension works with any plugin that has text inputs:

```typescript
import jsPsychSurveyHtmlForm from "@jspsych/plugin-survey-html-form";

{
  type: jsPsychSurveyHtmlForm,
  html: `<textarea id="response"></textarea>`,
  extensions: [
    {
      type: SlopitExtension,
      params: {
        targetSelector: "#response",
        keystroke: { enabled: true },
      },
    },
  ],
}
```

### Different API Endpoint

```typescript
const CONFIG = {
  apiEndpoint: "https://your-server.com/api/sessions",
};
```

## Server Requirements

Your server endpoint should:

1. Accept POST requests with JSON body
2. Validate the `SlopitSession` schema
3. Return 200 OK on success
4. Store the session data for analysis

Example server validation using Zod:

```typescript
import { SlopitSessionSchema } from "@slopit/core";

app.post("/api/sessions", (req, res) => {
  const result = SlopitSessionSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: "Invalid session data" });
  }

  // Store session
  await db.sessions.insert(result.data);

  res.json({ success: true });
});
```

## Testing Locally

Test without Prolific by visiting:

```
http://localhost:5173?participant_id=test123&STUDY_ID=dev
```

The experiment will use these as fallback identifiers.

For button, select, or slider experiments, use the [consent-gated response-control profile](../guides/jspsych-integration.md#collect-response-control-events-after-consent).
