---
sidebar_position: 3
---

# Writing Custom Adapters

This guide explains how to create adapters for experiment platforms that do not have built-in slopit support.

## Overview

An adapter integrates slopit behavioral capture with an experiment platform. The adapter responsibilities are:

1. Create and configure `BehavioralCapture` instances
2. Attach capture to appropriate DOM elements
3. Collect data when trials complete
4. Export data to the `SlopitSession` format

## Architecture

```
Your Adapter
    │
    ├── Uses @slopit/behavioral for capture
    │       │
    │       └── Uses @slopit/core for types/utils
    │
    └── Integrates with your platform
```

## Basic Adapter Pattern

There are two approaches to integrating slopit with your platform:

1. **BehavioralCapture**: Use directly when you only need data capture
2. **InputWrapper**: Use when you also need detection and intervention

The examples below use `BehavioralCapture` for simplicity. For applications requiring detection and intervention, substitute `createInputWrapper()` and use `wrap()`/`unwrap()` instead of `attach()`/`detach()`.

### Step 1: Create a Capture Wrapper

Wrap `BehavioralCapture` with platform-specific logic.

```typescript
import { createBehavioralCapture, BehavioralCapture } from "@slopit/behavioral";
import type { BehavioralCaptureConfig, BehavioralData, CaptureFlag } from "@slopit/core";

export interface CaptureResult {
  behavioral: BehavioralData;
  flags: CaptureFlag[];
}

export function createTrialCapture(config: BehavioralCaptureConfig): {
  capture: BehavioralCapture;
  attach: (element: HTMLElement, startTime?: number) => void;
  finish: () => CaptureResult;
} {
  const capture = createBehavioralCapture(config);

  return {
    capture,

    attach(element: HTMLElement, startTime?: number): void {
      capture.attach(element, startTime);
    },

    finish(): CaptureResult {
      const result = {
        behavioral: capture.getData(),
        flags: capture.getFlags(),
      };
      capture.detach();
      return result;
    },
  };
}
```

### Step 2: Create an Export Function

Convert platform data to `SlopitSession`.

```typescript
import {
  SCHEMA_VERSION,
  type SlopitSession,
  type SlopitTrial,
  captureEnvironment,
  generateSessionId,
} from "@slopit/core";

export interface ExportConfig {
  participantId?: string;
  studyId?: string;
  platformName: string;
  platformVersion?: string;
  adapterVersion: string;
}

export function exportToSlopitSession(
  trials: Array<{
    trialId: string;
    trialIndex: number;
    trialType?: string;
    startTime: number;
    endTime: number;
    rt?: number;
    response?: unknown;
    behavioral?: BehavioralData;
    flags?: CaptureFlag[];
  }>,
  config: ExportConfig
): SlopitSession {
  const sessionStartTime = trials[0]?.startTime ?? Date.now();
  const sessionEndTime = trials[trials.length - 1]?.endTime ?? Date.now();

  const slopitTrials: SlopitTrial[] = trials.map((trial) => ({
    trialId: trial.trialId,
    trialIndex: trial.trialIndex,
    trialType: trial.trialType,
    startTime: trial.startTime,
    endTime: trial.endTime,
    rt: trial.rt,
    response: trial.response
      ? {
          type: typeof trial.response === "string" ? "text" : "other",
          value: trial.response,
        }
      : undefined,
    behavioral: trial.behavioral,
    captureFlags: trial.flags,
  }));

  return {
    schemaVersion: SCHEMA_VERSION,
    sessionId: generateSessionId(),
    participantId: config.participantId,
    studyId: config.studyId,
    platform: {
      name: config.platformName,
      version: config.platformVersion,
      adapterVersion: config.adapterVersion,
    },
    environment: captureEnvironment(),
    timing: {
      startTime: sessionStartTime,
      endTime: sessionEndTime,
      duration: sessionEndTime - sessionStartTime,
    },
    trials: slopitTrials,
    globalEvents: {
      focus: [],
      errors: [],
    },
  };
}
```

### Step 3: Integrate with Platform

How you integrate depends on your platform. Here is a generic example.

```typescript
// Your platform's trial definition
interface MyPlatformTrial {
  type: string;
  stimulus: string;
  onStart?: (element: HTMLElement) => void;
  onFinish?: (data: unknown) => void;
}

// Trial data collector
const collectedTrials: Array<{
  trialId: string;
  trialIndex: number;
  trialType: string;
  startTime: number;
  endTime: number;
  rt: number;
  response: string;
  behavioral?: BehavioralData;
  flags?: CaptureFlag[];
}> = [];

let trialIndex = 0;

// Create a slopit-enabled trial
function createSlopitTrial(
  baseTrial: MyPlatformTrial,
  captureConfig: BehavioralCaptureConfig
): MyPlatformTrial {
  let trialCapture: ReturnType<typeof createTrialCapture> | null = null;
  let startTime: number;
  const trialId = generateTrialId();

  return {
    ...baseTrial,

    onStart(element: HTMLElement): void {
      startTime = performance.now();
      trialCapture = createTrialCapture(captureConfig);

      // Find the input element within the trial display
      const input = element.querySelector("textarea, input[type='text']");
      if (input) {
        trialCapture.attach(input as HTMLElement, startTime);
      }

      // Call original onStart if present
      baseTrial.onStart?.(element);
    },

    onFinish(data: unknown): void {
      const endTime = performance.now();
      const captureResult = trialCapture?.finish();

      collectedTrials.push({
        trialId,
        trialIndex: trialIndex++,
        trialType: baseTrial.type,
        startTime,
        endTime,
        rt: endTime - startTime,
        response: (data as { response?: string })?.response ?? "",
        behavioral: captureResult?.behavioral,
        flags: captureResult?.flags,
      });

      // Call original onFinish if present
      baseTrial.onFinish?.(data);
    },
  };
}

// Export at experiment end
function finishExperiment(): SlopitSession {
  return exportToSlopitSession(collectedTrials, {
    participantId: getParticipantId(),
    studyId: getStudyId(),
    platformName: "my-platform",
    platformVersion: "1.0.0",
    adapterVersion: "0.1.0",
  });
}
```

## Plugin Pattern (for Plugin-Based Platforms)

For platforms with plugin architectures (like jsPsych), create a plugin.

```typescript
import { createBehavioralCapture } from "@slopit/behavioral";
import type { BehavioralCaptureConfig } from "@slopit/behavioral";

// Plugin definition (platform-specific structure)
export const SlopitTextPlugin = {
  name: "slopit-text",
  version: "0.1.0",

  // Platform-specific parameter definitions
  parameters: {
    prompt: { type: "string", required: true },
    slopit: {
      type: "object",
      default: {
        keystroke: { enabled: true },
        focus: { enabled: true },
        paste: { enabled: true },
      },
    },
  },

  // Trial execution (platform-specific signature)
  async run(params: { prompt: string; slopit: BehavioralCaptureConfig }) {
    const startTime = performance.now();

    // Render UI
    const container = document.getElementById("experiment-container")!;
    container.innerHTML = `
      <div class="prompt">${params.prompt}</div>
      <textarea id="response"></textarea>
      <button id="submit">Submit</button>
    `;

    const textarea = container.querySelector("#response") as HTMLTextAreaElement;
    const button = container.querySelector("#submit") as HTMLButtonElement;

    // Create and attach capture
    const capture = createBehavioralCapture(params.slopit);
    capture.attach(textarea, startTime);

    // Wait for submission
    return new Promise((resolve) => {
      button.addEventListener("click", () => {
        const endTime = performance.now();
        const response = textarea.value;

        // Collect behavioral data
        const behavioral = capture.getData();
        const flags = capture.getFlags();

        // Cleanup
        capture.detach();

        // Return trial data
        resolve({
          response,
          rt: endTime - startTime,
          slopit: { behavioral, flags },
        });
      });
    });
  },
};
```

## Handling Different Input Types

### Text Areas and Inputs

Attach directly to the element.

```typescript
const textarea = document.querySelector("textarea");
capture.attach(textarea);
```

### Content Editable Elements

Same approach works for contenteditable.

```typescript
const editable = document.querySelector("[contenteditable]") as HTMLElement;
capture.attach(editable);
```

### Multiple Inputs

For forms with multiple inputs, attach to the container.

```typescript
const form = document.querySelector("form");
capture.attach(form);  // Captures keystrokes on any input in the form
```

Or create separate captures for each input.

```typescript
const captures = new Map<string, ReturnType<typeof createTrialCapture>>();

document.querySelectorAll("textarea").forEach((textarea, index) => {
  const capture = createTrialCapture(config);
  capture.attach(textarea as HTMLElement);
  captures.set(`input-${index}`, capture);
});
```

## Timing Considerations

### Trial Start Time

Pass the trial start time to `attach()` for accurate metrics.

```typescript
const trialStartTime = performance.now();
// ... show stimulus ...
capture.attach(element, trialStartTime);
```

### Calculating Response Time

```typescript
const endTime = performance.now();
const rt = endTime - trialStartTime;
```

### Handling Async Operations

If there is a delay between stimulus presentation and input availability, use the earlier time.

```typescript
const stimulusShownTime = performance.now();

// Async: wait for input to be ready
await waitForElement("#response");

const inputElement = document.querySelector("#response") as HTMLElement;
capture.attach(inputElement, stimulusShownTime);  // Use stimulus time, not current time
```

## Error Handling

### Graceful Degradation

If capture fails, the experiment should continue.

```typescript
let capture: BehavioralCapture | null = null;

try {
  capture = createBehavioralCapture(config);
  capture.attach(element);
} catch (error) {
  console.error("Behavioral capture failed:", error);
  // Continue without capture
}

// Later, when finishing
const result = capture
  ? { behavioral: capture.getData(), flags: capture.getFlags() }
  : { behavioral: {}, flags: [] };

capture?.detach();
```

### Missing Elements

Handle cases where expected elements do not exist.

```typescript
const textarea = container.querySelector("textarea");

if (textarea) {
  capture.attach(textarea as HTMLElement);
} else {
  console.warn("No textarea found for behavioral capture");
}
```

## Testing Your Adapter

### Unit Tests

Test the export function independently.

```typescript
import { describe, it, expect } from "vitest";
import { exportToSlopitSession } from "./export";

describe("exportToSlopitSession", () => {
  it("creates valid session structure", () => {
    const session = exportToSlopitSession(
      [
        {
          trialId: "trial-1",
          trialIndex: 0,
          startTime: 1000,
          endTime: 2000,
          response: "test response",
        },
      ],
      {
        platformName: "test-platform",
        adapterVersion: "0.1.0",
      }
    );

    expect(session.schemaVersion).toBe("1.0");
    expect(session.trials).toHaveLength(1);
    expect(session.platform.name).toBe("test-platform");
  });
});
```

### Integration Tests

Test with a simulated DOM.

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { JSDOM } from "jsdom";
import { createTrialCapture } from "./capture";

describe("createTrialCapture", () => {
  let dom: JSDOM;
  let document: Document;

  beforeEach(() => {
    dom = new JSDOM("<!DOCTYPE html><textarea id='input'></textarea>");
    document = dom.window.document;
  });

  it("captures keystrokes", () => {
    const { attach, finish } = createTrialCapture({
      keystroke: { enabled: true },
    });

    const input = document.querySelector("#input") as HTMLElement;
    attach(input);

    // Simulate keystrokes
    const event = new dom.window.KeyboardEvent("keydown", { key: "a" });
    input.dispatchEvent(event);

    const result = finish();
    expect(result.behavioral.keystrokes).toHaveLength(1);
  });
});
```

## Publishing Your Adapter

### Package Structure

```
my-slopit-adapter/
├── src/
│   ├── index.ts        # Main exports
│   ├── capture.ts      # Capture wrapper
│   ├── export.ts       # Export function
│   └── plugin.ts       # Platform plugin (if applicable)
├── package.json
├── tsconfig.json
└── README.md
```

### Package.json

```json
{
  "name": "@my-org/slopit-adapter-myplatform",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "peerDependencies": {
    "my-platform": "^1.0.0"
  },
  "dependencies": {
    "@slopit/core": "^0.1.0",
    "@slopit/behavioral": "^0.1.0"
  }
}
```

### Documentation

Include:

- Installation instructions
- Basic usage example
- Configuration options
- Complete experiment example
