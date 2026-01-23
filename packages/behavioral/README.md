# @slopit/behavioral

Client-side behavioral data capture for detecting AI-assisted responses in crowdsourced research.

## Installation

```bash
pnpm add @slopit/behavioral
```

## Quick Start

```typescript
import { createBehavioralCapture } from "@slopit/behavioral";

// create capture instance with default configuration
const capture = createBehavioralCapture({
  keystroke: { enabled: true },
  focus: { enabled: true },
  paste: { enabled: true },
});

// attach to a text input element
const textarea = document.getElementById("response") as HTMLTextAreaElement;
capture.attach(textarea);

// later, retrieve captured data and computed metrics
const data = capture.getData();
const flags = capture.getFlags();

// cleanup when done
capture.detach();
```

## API

### BehavioralCapture

The main class for capturing behavioral data from DOM elements.

#### Constructor

```typescript
new BehavioralCapture(config: BehavioralCaptureConfig)
```

#### Methods

##### attach(element: HTMLElement | Document, startTime?: number): void

Attaches behavioral capture to a DOM element. For text input capture, attach to the input or textarea element. For document-level focus tracking, attach to document.

```typescript
capture.attach(textarea);
capture.attach(textarea, performance.now());
```

##### detach(): void

Detaches capture and cleans up all event listeners.

```typescript
capture.detach();
```

##### reset(newStartTime?: number): void

Resets all collected data without detaching from the element.

```typescript
capture.reset();
capture.reset(performance.now());
```

##### getData(): BehavioralData

Returns all collected behavioral data including keystrokes, focus events, paste events, mouse events, scroll events, and computed metrics.

```typescript
const data = capture.getData();
console.log(data.keystrokes?.length);
console.log(data.metrics?.keystroke?.meanIKI);
```

##### getMetrics(): BehavioralMetrics

Returns computed metrics from the captured data.

```typescript
const metrics = capture.getMetrics();
if (metrics.keystroke) {
  console.log("Mean IKI:", metrics.keystroke.meanIKI);
  console.log("Pause count:", metrics.keystroke.pauseCount);
}
```

##### getFlags(): CaptureFlag[]

Returns flags generated during capture (paste detection, excessive blur, etc.).

```typescript
const flags = capture.getFlags();
for (const flag of flags) {
  console.log(flag.type, flag.severity, flag.message);
}
```

##### on(event, handler): void

Subscribes to capture events for real-time monitoring.

```typescript
capture.on("keystroke", (event) => {
  console.log("Key pressed:", event.key);
});

capture.on("paste", (event) => {
  console.log("Paste detected:", event.textLength, "characters");
});
```

##### off(event, handler): void

Unsubscribes from capture events.

```typescript
capture.off("keystroke", myHandler);
```

## Configuration

### BehavioralCaptureConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| keystroke | KeystrokeCaptureConfig | enabled | Keystroke capture settings |
| focus | FocusCaptureConfig | enabled | Focus/visibility tracking settings |
| paste | PasteCaptureConfig | enabled | Paste event capture settings |
| clipboard | ClipboardCaptureConfig | enabled | Full clipboard (paste, copy, cut) settings |
| mouse | MouseCaptureConfig | enabled | Mouse event capture settings |
| scroll | ScrollCaptureConfig | enabled | Scroll event capture settings |
| inputDuration | InputDurationCaptureConfig | enabled | Input focus duration tracking |

### KeystrokeCaptureConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| enabled | boolean | true | Whether to capture keystrokes |
| captureKeyUp | boolean | true | Whether to capture keyup events in addition to keydown |
| includeModifiers | boolean | true | Whether to include modifier key states (shift, ctrl, alt, meta) |

### FocusCaptureConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| enabled | boolean | true | Whether to capture focus events |
| useVisibilityAPI | boolean | true | Whether to use the Page Visibility API |
| useBlurFocus | boolean | true | Whether to use window blur/focus events |

### PasteCaptureConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| enabled | boolean | true | Whether to capture paste events |
| prevent | boolean | false | Whether to prevent paste operations |
| warnMessage | string | undefined | Message to show when paste is prevented |
| capturePreview | boolean | true | Whether to capture a preview of pasted text |
| previewLength | number | 100 | Length of text preview to capture |

### ClipboardCaptureConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| enabled | boolean | true | Whether clipboard capture is enabled |
| capturePaste | boolean | true | Whether to capture paste events |
| captureCopyCut | boolean | true | Whether to capture copy and cut events |
| prevent | boolean | false | Whether to prevent paste operations |
| warnMessage | string | undefined | Message to show when paste is prevented |
| capturePreview | boolean | true | Whether to capture a preview of clipboard text |
| previewLength | number | 100 | Length of text preview to capture |

### MouseCaptureConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| enabled | boolean | true | Whether mouse capture is enabled |
| captureClicks | boolean | true | Whether to capture click events |
| captureMovement | boolean | true | Whether to capture mousemove events |
| throttleMs | number | 50 | Throttle interval for mousemove events |
| idleThresholdMs | number | 5000 | Threshold for detecting idle periods |

### ScrollCaptureConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| enabled | boolean | true | Whether to capture scroll events |
| throttleMs | number | 100 | Throttle interval for scroll events |
| captureDirection | boolean | true | Whether to capture scroll direction changes |

### InputDurationCaptureConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| enabled | boolean | true | Whether to capture input duration events |
| trackKeystrokes | boolean | true | Whether to count keystrokes during focus periods |
| trackPastes | boolean | true | Whether to count paste events during focus periods |

## Individual Collectors

For advanced use cases, you can use the individual collectors directly.

### KeystrokeCollector

```typescript
import { KeystrokeCollector } from "@slopit/behavioral";

const collector = new KeystrokeCollector(
  { enabled: true, captureKeyUp: true, includeModifiers: true },
  performance.now(),
  (event) => console.log("Keystroke:", event.key)
);

collector.attach(textarea);
// ... capture keystrokes
const events = collector.getEvents();
const firstKeystrokeTime = collector.getFirstKeystrokeTime();
collector.detach();
```

### FocusCollector

```typescript
import { FocusCollector } from "@slopit/behavioral";

const collector = new FocusCollector(
  { enabled: true, useVisibilityAPI: true, useBlurFocus: true },
  performance.now(),
  (event) => console.log("Focus event:", event.event)
);

collector.attach(document);
// ... capture focus events
const events = collector.getEvents();
collector.detach();
```

### PasteCollector

```typescript
import { PasteCollector } from "@slopit/behavioral";

const collector = new PasteCollector(
  { enabled: true, prevent: false, capturePreview: true, previewLength: 100 },
  performance.now(),
  () => keystrokeCollector.getRecentCount(2000),
  (event) => console.log("Paste:", event.textLength, "chars")
);

collector.attach(textarea);
// ... capture paste events
const events = collector.getEvents();
collector.detach();
```

### ClipboardCollector

```typescript
import { ClipboardCollector } from "@slopit/behavioral";

const collector = new ClipboardCollector(
  {
    enabled: true,
    capturePaste: true,
    captureCopyCut: true,
    prevent: false,
    capturePreview: true,
    previewLength: 100,
  },
  performance.now(),
  () => keystrokeCollector.getRecentCount(2000),
  (pasteEvent) => console.log("Paste:", pasteEvent.textLength),
  (copyEvent) => console.log("Copy:", copyEvent.event, copyEvent.textLength)
);

collector.attach(document);
// ... capture clipboard events
const pasteEvents = collector.getPasteEvents();
const copyEvents = collector.getCopyEvents();
collector.detach();
```

### MouseCollector

```typescript
import { MouseCollector } from "@slopit/behavioral";

const collector = new MouseCollector(
  {
    enabled: true,
    captureClicks: true,
    captureMovement: true,
    throttleMs: 50,
    idleThresholdMs: 5000,
  },
  performance.now(),
  (event) => console.log("Mouse:", event.event, event.x, event.y)
);

collector.attach(document);
// ... capture mouse events
const events = collector.getEvents();
const idlePeriods = collector.getIdlePeriods();
const totalDistance = collector.getTotalDistance();
collector.detach();
```

### ScrollCollector

```typescript
import { ScrollCollector } from "@slopit/behavioral";

const collector = new ScrollCollector(
  { enabled: true, throttleMs: 100, captureDirection: true },
  performance.now(),
  (event) => console.log("Scroll:", event.direction, event.deltaY)
);

collector.attach(document);
// ... capture scroll events
const events = collector.getEvents();
const directionChanges = collector.getDirectionChanges();
collector.detach();
```

### InputDurationCollector

```typescript
import { InputDurationCollector } from "@slopit/behavioral";

const collector = new InputDurationCollector(
  { enabled: true, trackKeystrokes: true, trackPastes: true },
  performance.now(),
  (event) => console.log("Focus session:", event.duration, "ms")
);

collector.attach(textarea);
// ... track focus duration
const events = collector.getEvents();
collector.detach();
```

## Detection Module

The detection module identifies potential AI assistance signatures.

### ExtensionDetector

Detects AI assistant browser extensions (Grammarly, Copilot, Quillbot, etc.).

```typescript
import { ExtensionDetector, createExtensionDetector } from "@slopit/behavioral";

// one-shot detection
const detector = new ExtensionDetector();
const result = detector.detect();

if (result.detected) {
  console.log("Extensions found:", result.indicators);
  console.log("Confidence:", result.confidence);
}

// continuous monitoring
const monitoringDetector = createExtensionDetector({
  customSelectors: ["[data-custom-ai-extension]"],
  customGlobals: ["__MY_AI_TOOL__"],
});

monitoringDetector.startMonitoring();
// ... extension elements may be injected dynamically
const indicators = monitoringDetector.getMonitoredIndicators();
monitoringDetector.stopMonitoring();
```

#### ExtensionDetectorConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| customSelectors | string[] | [] | Additional DOM selectors to scan |
| customGlobals | string[] | [] | Additional global window properties to check |
| monitor | MonitorConfig | all enabled | MutationObserver settings |

### TextAppearanceDetector

Detects sudden text appearance without corresponding keystroke or paste events.

```typescript
import { TextAppearanceDetector } from "@slopit/behavioral";

const detector = new TextAppearanceDetector(
  { minTextLength: 50, timeWindowMs: 2000 },
  {
    getRecentKeystrokes: () => keystrokeCollector.getRecentCount(2000),
    hadRecentPaste: () => pasteEvents.some(p => Date.now() - p.time < 2000),
  }
);

detector.startMonitoring(textarea);
// ... user interaction
const result = detector.detect();
if (result.detected) {
  console.log("Suspicious text appearance:", result.indicators);
}
detector.stopMonitoring();
```

#### TextAppearanceDetectorConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| minTextLength | number | 50 | Minimum character count to flag as suspicious |
| timeWindowMs | number | 2000 | Time window for checking keystroke activity |

### DetectionResult

All detectors return a `DetectionResult`:

| Field | Type | Description |
|-------|------|-------------|
| detected | boolean | Whether the detector found evidence |
| confidence | number | Confidence score from 0 to 1 |
| message | string | Human-readable result description |
| indicators | DetectionIndicator[] | Specific indicators found |

## Intervention Module

The intervention module triggers responses when suspicious behavior is detected.

### InterventionManager

```typescript
import { InterventionManager, createInterventionManager } from "@slopit/behavioral";

const manager = createInterventionManager({
  triggers: [
    {
      type: "paste",
      threshold: { paste: { minLength: 100, maxPrecedingKeystrokes: 5 } },
      intervention: "warning",
    },
    {
      type: "blur",
      threshold: { blur: { countThreshold: 5, durationThreshold: 30000 } },
      intervention: "friction",
    },
    {
      type: "timing",
      threshold: { timing: { maxCharactersPerSecond: 15 } },
      intervention: "challenge",
    },
  ],
  escalate: true, // escalate on repeated triggers
});

// register callbacks for each intervention type
manager.onIntervention("warning", (result) => {
  alert(result.reason);
});

manager.onIntervention("challenge", (result) => {
  showChallengeDialog();
});

manager.onIntervention("block", (result) => {
  disableSubmitButton();
});

// evaluate behavioral state
const result = manager.evaluate({
  pasteEvents: [{ textLength: 500, precedingKeystrokes: 2 }],
  blurCount: 3,
  totalBlurDuration: 15000,
  charactersPerSecond: 8.5,
});

if (result) {
  console.log("Intervention triggered:", result.type, result.reason);
}

// get intervention history
const history = manager.getHistory();

// reset for new trial
manager.reset();
```

#### TriggerConfig

| Field | Type | Description |
|-------|------|-------------|
| type | "paste" \| "blur" \| "idle" \| "timing" \| "composite" | Trigger type |
| threshold | object | Threshold values for the trigger type |
| intervention | "warning" \| "friction" \| "challenge" \| "block" | Intervention to apply |

#### Threshold Types

**PasteThreshold:**
| Field | Type | Description |
|-------|------|-------------|
| minLength | number | Minimum text length to trigger |
| maxPrecedingKeystrokes | number | Maximum keystrokes before paste |

**BlurThreshold:**
| Field | Type | Description |
|-------|------|-------------|
| countThreshold | number | Number of blur events to trigger |
| durationThreshold | number | Total blur duration (ms) to trigger |

**IdleThreshold:**
| Field | Type | Description |
|-------|------|-------------|
| durationMs | number | Idle duration to trigger |

**TimingThreshold:**
| Field | Type | Description |
|-------|------|-------------|
| maxCharactersPerSecond | number | Maximum typing speed |

### Challenges

Built-in challenge implementations for verifying human presence.

#### TypingTestChallenge

```typescript
import { TypingTestChallenge, createChallenge } from "@slopit/behavioral";

const challenge = new TypingTestChallenge();
// or: const challenge = createChallenge("typing_test");

const result = await challenge.render(
  {
    type: "typing_test",
    prompt: "Please type the following text exactly as shown:",
    data: { text: "The quick brown fox jumps over the lazy dog." },
    timeLimit: 60000,
  },
  document.getElementById("challenge-container")!
);

console.log("Passed:", result.passed);
console.log("Accuracy:", result.behavioralData?.accuracy);
console.log("Keystrokes captured:", result.behavioralData?.keystrokes.length);

challenge.cleanup();
```

#### MemoryRecallChallenge

```typescript
import { MemoryRecallChallenge } from "@slopit/behavioral";

const challenge = new MemoryRecallChallenge();

const result = await challenge.render(
  {
    type: "memory_recall",
    prompt: "What color was the car in the image you saw earlier?",
    expectedKeywords: ["red", "sedan"],
    timeLimit: 30000,
  },
  document.getElementById("challenge-container")!
);

console.log("Passed:", result.passed);
console.log("Matched keywords:", result.behavioralData?.matchedKeywords);

challenge.cleanup();
```

#### Custom Challenges

Implement the `ChallengeRenderer` interface for custom challenges:

```typescript
import type { ChallengeRenderer, ChallengeConfig, ChallengeResult } from "@slopit/behavioral";

class AudioTranscriptionChallenge implements ChallengeRenderer {
  private container: HTMLElement | null = null;

  async render(config: ChallengeConfig, container: HTMLElement): Promise<ChallengeResult> {
    this.container = container;
    const audioUrl = config.data?.audioUrl as string;

    // render audio player and text input
    // capture behavioral data during transcription
    // return result when submitted

    return {
      passed: true,
      response: "transcribed text",
      completionTime: 15000,
      behavioralData: { /* captured data */ },
    };
  }

  cleanup(): void {
    if (this.container) {
      this.container.innerHTML = "";
      this.container = null;
    }
  }
}
```

## InputWrapper

A higher-level wrapper that combines capture, detection, and intervention.

```typescript
import { InputWrapper, createInputWrapper, ExtensionDetector } from "@slopit/behavioral";

const wrapper = createInputWrapper({
  capture: {
    keystroke: { enabled: true },
    focus: { enabled: true },
    paste: { enabled: true },
  },
  detectors: [new ExtensionDetector()],
  detectionInterval: 5000,
});

// wrap an input element
const textarea = document.getElementById("response") as HTMLTextAreaElement;
wrapper.wrap(textarea);

// subscribe to events
wrapper.on("detection", (result) => {
  if (result.detected) {
    console.log("Detection:", result.message);
  }
});

wrapper.on("flag", (flag) => {
  console.log("Flag:", flag.type, flag.severity);
});

// manually trigger detection
const results = wrapper.runDetection();

// get all captured data
const data = wrapper.getData();
console.log("Keystrokes:", data.keystrokes?.length);
console.log("Flags:", data.flags.length);
console.log("Detections:", data.detectionResults.length);

// cleanup
wrapper.unwrap();
```

### InputWrapperConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| capture | BehavioralCaptureConfig | {} | Configuration for behavioral capture |
| interventionManager | InterventionManager | undefined | Optional intervention manager |
| detectors | Detector[] | [] | Array of detectors to run periodically |
| detectionInterval | number | 5000 | Interval between detector runs (ms) |

## Metrics Computation

### computeKeystrokeMetrics

```typescript
import { computeKeystrokeMetrics } from "@slopit/behavioral";

const metrics = computeKeystrokeMetrics(keystrokeEvents, 2000);

console.log("Total keystrokes:", metrics.totalKeystrokes);
console.log("Printable keystrokes:", metrics.printableKeystrokes);
console.log("Deletions:", metrics.deletions);
console.log("Mean IKI:", metrics.meanIKI);
console.log("Std IKI:", metrics.stdIKI);
console.log("Median IKI:", metrics.medianIKI);
console.log("Pause count:", metrics.pauseCount);
console.log("Product-process ratio:", metrics.productProcessRatio);
```

### computeFocusMetrics

```typescript
import { computeFocusMetrics } from "@slopit/behavioral";

const metrics = computeFocusMetrics(focusEvents);

console.log("Blur count:", metrics.blurCount);
console.log("Total blur duration:", metrics.totalBlurDuration);
console.log("Hidden count:", metrics.hiddenCount);
console.log("Total hidden duration:", metrics.totalHiddenDuration);
```

### computeTimingMetrics

```typescript
import { computeTimingMetrics } from "@slopit/behavioral";

const metrics = computeTimingMetrics(keystrokeEvents, totalResponseTime);

console.log("First keystroke latency:", metrics.firstKeystrokeLatency);
console.log("Total response time:", metrics.totalResponseTime);
console.log("Characters per minute:", metrics.charactersPerMinute);
```

## Examples

### Basic Capture

Minimal setup for text input monitoring:

```typescript
import { createBehavioralCapture } from "@slopit/behavioral";

const capture = createBehavioralCapture({});
capture.attach(document.querySelector("textarea")!);

document.querySelector("form")?.addEventListener("submit", () => {
  const data = capture.getData();
  // send data with form submission
  capture.detach();
});
```

### Full Configuration

All options enabled with custom thresholds:

```typescript
import { createBehavioralCapture } from "@slopit/behavioral";

const capture = createBehavioralCapture({
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
    capturePreview: true,
    previewLength: 200,
  },
  mouse: {
    enabled: true,
    captureClicks: true,
    captureMovement: true,
    throttleMs: 100,
    idleThresholdMs: 10000,
  },
  scroll: {
    enabled: true,
    throttleMs: 150,
    captureDirection: true,
  },
  inputDuration: {
    enabled: true,
    trackKeystrokes: true,
    trackPastes: true,
  },
});

capture.attach(document.querySelector("textarea")!);
```

### Real-time Monitoring

Event subscriptions and live metrics:

```typescript
import { createBehavioralCapture } from "@slopit/behavioral";

const capture = createBehavioralCapture({});
const textarea = document.querySelector("textarea")!;
capture.attach(textarea);

// real-time keystroke monitoring
capture.on("keystroke", (event) => {
  const metrics = capture.getMetrics();
  updateTypingSpeedDisplay(metrics.timing?.charactersPerMinute ?? 0);
});

// paste detection
capture.on("paste", (event) => {
  if (event.textLength > 100 && event.precedingKeystrokes < 5) {
    showPasteWarning();
  }
});

// focus tracking
capture.on("focus", (event) => {
  if (event.event === "blur") {
    console.log("User left the page");
  }
});
```

### Detection Integration

Using ExtensionDetector and TextAppearanceDetector:

```typescript
import {
  createBehavioralCapture,
  ExtensionDetector,
  TextAppearanceDetector,
} from "@slopit/behavioral";

const capture = createBehavioralCapture({});
const textarea = document.querySelector("textarea")!;
capture.attach(textarea);

// check for extensions on page load
const extensionDetector = new ExtensionDetector();
const extensionResult = extensionDetector.detect();
if (extensionResult.detected) {
  console.log("AI extensions detected:", extensionResult.message);
}

// monitor for text appearance anomalies
const textDetector = new TextAppearanceDetector(
  { minTextLength: 50 },
  {
    getRecentKeystrokes: () => {
      const data = capture.getData();
      const now = performance.now();
      return data.keystrokes?.filter(k => now - k.time < 2000).length ?? 0;
    },
  }
);
textDetector.startMonitoring(textarea);

// check before submission
document.querySelector("form")?.addEventListener("submit", (e) => {
  const textResult = textDetector.detect();
  if (textResult.detected) {
    e.preventDefault();
    showSuspiciousTextWarning(textResult.indicators);
  }
  textDetector.stopMonitoring();
});
```

### Intervention Setup

Configuring triggers and challenges:

```typescript
import {
  createBehavioralCapture,
  createInterventionManager,
  TypingTestChallenge,
} from "@slopit/behavioral";

const capture = createBehavioralCapture({});
capture.attach(document.querySelector("textarea")!);

const manager = createInterventionManager({
  triggers: [
    {
      type: "paste",
      threshold: { paste: { minLength: 100, maxPrecedingKeystrokes: 5 } },
      intervention: "warning",
    },
    {
      type: "composite",
      threshold: {
        paste: { minLength: 50, maxPrecedingKeystrokes: 10 },
        blur: { countThreshold: 3, durationThreshold: 10000 },
      },
      intervention: "challenge",
    },
  ],
  escalate: true,
});

manager.onIntervention("warning", (result) => {
  showWarningModal(result.reason);
});

manager.onIntervention("challenge", async (result) => {
  const challenge = new TypingTestChallenge();
  const challengeResult = await challenge.render(
    {
      type: "typing_test",
      prompt: "Please type this sentence to continue:",
      data: { text: "I am completing this survey myself without AI assistance." },
      timeLimit: 30000,
    },
    document.getElementById("challenge-container")!
  );
  challenge.cleanup();

  if (!challengeResult.passed) {
    disableSubmission();
  }
});

// evaluate periodically
capture.on("paste", () => {
  const data = capture.getData();
  const state = {
    pasteEvents: data.paste?.map(p => ({
      textLength: p.textLength,
      precedingKeystrokes: p.precedingKeystrokes,
    })),
  };
  manager.evaluate(state);
});
```

## Event Types

### BehavioralCaptureEvents

| Event | Payload | Description |
|-------|---------|-------------|
| keystroke | KeystrokeEvent | Fired for each keydown/keyup event |
| focus | FocusEvent | Fired for blur, focus, and visibility changes |
| paste | PasteEvent | Fired when text is pasted |
| clipboard | ClipboardCopyEvent | Fired for copy/cut events |
| mouse | MouseEvent | Fired for mouse events |
| scroll | ScrollEvent | Fired for scroll events |
| inputDuration | InputDurationEvent | Fired when input focus sessions end |

## License

MIT
