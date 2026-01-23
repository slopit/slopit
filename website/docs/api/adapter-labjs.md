---
sidebar_position: 6
---

# @slopit/adapter-labjs API Reference

Integration adapter for [lab.js](https://lab.js.org/) experiments. Provides a mixin function to add behavioral capture to lab.js components and a session recorder for managing experiment data.

## Installation

```bash
pnpm add @slopit/adapter-labjs
```

lab.js is a peer dependency (version 21.0.0 or higher). It is typically loaded as a global script in lab.js experiments rather than installed via npm.

## When to Use This Package

Use `@slopit/adapter-labjs` when:

- Running experiments built with the lab.js builder
- Using lab.js as a library for custom experiment code
- Deploying lab.js studies to any hosting platform

## Quick Start

```typescript
import { withSlopit, LabjsRecorder } from "@slopit/adapter-labjs";

// enhance a lab.js component class with behavioral capture
const SlopitScreen = withSlopit(lab.html.Screen);

// create a recording session
const recorder = new LabjsRecorder({
  participantId: "P001",
  studyId: "my-study",
});

// use the enhanced component
const trial = new SlopitScreen({
  content: `<textarea id="response"></textarea>`,
  slopit: {
    targetSelector: "#response",
    keystroke: { enabled: true },
    paste: { enabled: true },
  },
});

// run the trial and collect data
```

## withSlopit(Component)

Mixin function that adds slopit behavioral capture to any lab.js component class. Returns an enhanced class that automatically attaches capture during the component's run lifecycle.

```typescript
function withSlopit<T extends LabjsComponentConstructor>(Component: T): T
```

### Usage

```typescript
import { withSlopit } from "@slopit/adapter-labjs";

// assuming lab.js is loaded globally
declare const lab: {
  html: { Screen: new (...args: unknown[]) => unknown };
};

// create enhanced component class
const SlopitScreen = withSlopit(lab.html.Screen as LabjsComponentConstructor);

// use the enhanced component with slopit configuration
const screen = new SlopitScreen({
  content: `
    <h2>Writing Task</h2>
    <textarea id="response" rows="6"></textarea>
  `,
  slopit: {
    targetSelector: "#response",
    keystroke: { enabled: true },
    paste: { enabled: true, prevent: false },
  },
});
```

### LabjsSlopitConfig

Configuration passed via the `slopit` property on component options.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enabled` | boolean | `true` | Enable or disable capture |
| `targetSelector` | string | `"textarea, input[type='text']"` | CSS selector for the target element |
| `containerSelector` | string | `".lab-content"` | Container to search within |
| `keystroke` | `KeystrokeConfig` | `{ enabled: false }` | Keystroke capture settings |
| `paste` | `PasteConfig` | `{ enabled: false }` | Paste detection settings |
| `focus` | `FocusConfig` | `{ enabled: false }` | Focus tracking settings |
| `mouse` | `MouseConfig` | `{ enabled: false }` | Mouse tracking settings |
| `scroll` | `ScrollConfig` | `{ enabled: false }` | Scroll tracking settings |

### Accessing Captured Data

The enhanced component stores captured data in the component's `data` property:

```typescript
// after component ends
const slopitData = screen.data.slopit;
// { behavioral: BehavioralData, flags: CaptureFlag[] }
```

Or use the `getSlopitData()` method:

```typescript
const data = screen.getSlopitData();
if (data !== null) {
  console.log("Keystrokes:", data.behavioral.keystrokes.length);
  console.log("Flags:", data.flags);
}
```

## LabjsRecorder

Session recorder for lab.js experiments. Extends the base recorder with lab.js-specific platform detection.

### Constructor

```typescript
new LabjsRecorder(config?: RecorderConfig)
```

#### RecorderConfig

| Property | Type | Description |
|----------|------|-------------|
| `participantId` | string | Participant identifier |
| `studyId` | string | Study identifier |
| `metadata` | `Record<string, unknown>` | Session-level metadata |
| `behavioral` | `BehavioralCaptureConfig` | Default behavioral capture settings |

### Example

```typescript
import { LabjsRecorder } from "@slopit/adapter-labjs";

const recorder = new LabjsRecorder({
  participantId: "P001",
  studyId: "my-study",
});

// start a trial
recorder.startTrial({
  trialType: "text-entry",
  targetElement: document.querySelector("textarea"),
});

// participant completes the trial...

// end the trial with response data
recorder.endTrial({
  type: "text",
  value: "participant response",
  characterCount: 20,
  wordCount: 2,
});

// export the session
const session = recorder.exportSession();
```

### Methods

The LabjsRecorder inherits all methods from [BaseRecorder](./adapter-shared.md#baserecorder):

- `startTrial(config)` - Start a new trial
- `endTrial(response?, platformData?)` - End the current trial
- `attachCapture(element, startTime?)` - Attach capture to an element
- `detachCapture()` - Detach capture without ending trial
- `exportSession()` - Export session data
- `getCurrentTrial()` - Get current trial state
- `getTrials()` - Get all completed trials
- `isTrialInProgress()` - Check if trial is active
- `getSessionId()` - Get session identifier
- `reset()` - Reset for a new session

## Complete Experiment Example

```typescript
import { withSlopit, LabjsRecorder } from "@slopit/adapter-labjs";

// assuming lab.js is loaded globally
declare const lab: {
  html: { Screen: LabjsComponentConstructor };
  flow: { Sequence: LabjsComponentConstructor };
};

// create enhanced component
const SlopitScreen = withSlopit(lab.html.Screen);

// create recorder
const recorder = new LabjsRecorder({
  participantId: new URL(location.href).searchParams.get("PROLIFIC_PID") ?? undefined,
  studyId: "writing-study-001",
});

// instructions screen
const instructions = new lab.html.Screen({
  content: `
    <h2>Writing Task</h2>
    <p>You will be asked to write about several topics.</p>
    <p>Press <strong>Continue</strong> when ready.</p>
    <button id="continue">Continue</button>
  `,
  responses: {
    "click button#continue": "continue",
  },
});

// writing trial with behavioral capture
const writingTrial = new SlopitScreen({
  content: `
    <h3>Please describe your ideal vacation destination.</h3>
    <textarea id="response" rows="6" style="width: 100%;"></textarea>
    <button id="submit">Submit</button>
  `,
  responses: {
    "click button#submit": "submit",
  },
  slopit: {
    targetSelector: "#response",
    keystroke: { enabled: true },
    paste: { enabled: true, prevent: true },
    focus: { enabled: true },
  },
});

// debrief screen
const debrief = new lab.html.Screen({
  content: `
    <h2>Thank You</h2>
    <p>Your responses have been recorded.</p>
  `,
});

// build experiment sequence
const experiment = new lab.flow.Sequence({
  content: [instructions, writingTrial, debrief],
});

// handle experiment end
experiment.on("end", async () => {
  // collect data from the writing trial
  const slopitData = writingTrial.getSlopitData();

  if (slopitData !== null) {
    recorder.startTrial({
      trialType: "writing",
      stimulus: {
        type: "text",
        content: "Describe your ideal vacation destination.",
      },
    });

    // get the response text
    const responseText = writingTrial.data.response || "";

    recorder.endTrial({
      type: "text",
      value: responseText,
    });
  }

  // export and send session
  const session = recorder.exportSession();

  await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(session),
  });

  // redirect to completion page
  window.location.href = "https://app.prolific.co/submissions/complete?cc=ABC123";
});

// run the experiment
experiment.run();
```

## Using with the lab.js Builder

When using the lab.js Builder, you can add slopit capture to components via inline JavaScript:

1. Export your study from the Builder
2. Add the slopit adapter to your study's HTML or via a bundler
3. Modify the generated code to wrap target components with `withSlopit()`

```javascript
// in your study's main script
import { withSlopit } from "@slopit/adapter-labjs";

// wrap the target component class before it's used
const originalScreen = lab.html.Screen;
lab.html.Screen = withSlopit(originalScreen);
```

## Types

### LabjsComponentLike

Minimal interface for lab.js component lifecycle hooks.

```typescript
interface LabjsComponentLike {
  options: Record<string, unknown>;
  data: Record<string, unknown>;
  on(event: string, handler: (...args: unknown[]) => void): void;
}
```

### LabjsComponentConstructor

Constructor type for lab.js components.

```typescript
type LabjsComponentConstructor<T extends LabjsComponentLike = LabjsComponentLike> =
  new (...args: unknown[]) => T;
```

### LabjsTrialData

Trial data structure with optional slopit capture data.

```typescript
interface LabjsTrialData {
  slopit?: AdapterData;
  [key: string]: unknown;
}
```

## Platform Notes

- lab.js version is detected from `window.lab.version` when available
- The default container selector `.lab-content` works with standard lab.js layouts
- Element discovery uses MutationObserver with a 5-second timeout
- If the target element is not found, capture silently skips (no error thrown)
