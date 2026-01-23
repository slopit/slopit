---
sidebar_position: 3
---

# @slopit/behavioral API Reference

The behavioral package provides DOM-based behavioral capture including keystroke dynamics, focus tracking, paste detection, and tools for detection and intervention.

## Installation

```bash
pnpm add @slopit/behavioral
```

This package depends on `@slopit/core`, which is installed automatically.

## BehavioralCapture

The main class for coordinating behavioral data capture.

### Constructor

```typescript
class BehavioralCapture {
  constructor(config: BehavioralCaptureConfig);
}
```

### Factory Function

```typescript
function createBehavioralCapture(config: BehavioralCaptureConfig): BehavioralCapture;
```

**Example:**

```typescript
import { createBehavioralCapture } from "@slopit/behavioral";

const capture = createBehavioralCapture({
  keystroke: { enabled: true },
  focus: { enabled: true },
  paste: { enabled: true, prevent: false },
});
```

### Methods

#### attach()

Attach capture to a DOM element.

```typescript
attach(element: HTMLElement | Document, startTime?: number): void;
```

- **element**: The element to attach to. For text input capture, attach to the input or textarea. For document-level focus tracking, attach to document.
- **startTime**: Optional trial start time (defaults to `performance.now()`)

**Example:**

```typescript
const textarea = document.getElementById("response") as HTMLTextAreaElement;
capture.attach(textarea);
```

#### detach()

Detach capture and clean up event listeners.

```typescript
detach(): void;
```

Always call `detach()` when capture is no longer needed to prevent memory leaks.

#### reset()

Reset all collected data without detaching.

```typescript
reset(newStartTime?: number): void;
```

Useful when reusing the same capture instance for multiple trials.

#### getData()

Get all collected behavioral data.

```typescript
getData(): BehavioralData;
```

Returns an object containing:

- `keystrokes`: Array of keystroke events
- `focus`: Array of focus events
- `paste`: Array of paste events
- `metrics`: Computed metrics from the data

**Example:**

```typescript
const data = capture.getData();
console.log("Keystrokes:", data.keystrokes?.length);
console.log("Mean IKI:", data.metrics?.keystroke?.meanIKI);
```

#### getMetrics()

Get computed metrics from collected data.

```typescript
getMetrics(): BehavioralMetrics;
```

**Example:**

```typescript
const metrics = capture.getMetrics();
if (metrics.keystroke) {
  console.log("Total keystrokes:", metrics.keystroke.totalKeystrokes);
  console.log("Deletions:", metrics.keystroke.deletions);
}
```

#### getFlags()

Get flags generated during capture.

```typescript
getFlags(): CaptureFlag[];
```

Flags indicate potential issues like paste events or excessive window switching.

**Example:**

```typescript
const flags = capture.getFlags();
for (const flag of flags) {
  console.log(`${flag.severity}: ${flag.message}`);
}
```

#### on() / off()

Subscribe to and unsubscribe from capture events.

```typescript
on<K extends keyof BehavioralCaptureEvents>(
  event: K,
  handler: BehavioralCaptureEvents[K]
): void;

off<K extends keyof BehavioralCaptureEvents>(
  event: K,
  handler: BehavioralCaptureEvents[K]
): void;
```

**Example:**

```typescript
const handleKeystroke = (event: KeystrokeEvent) => {
  console.log("Key pressed:", event.key);
};

capture.on("keystroke", handleKeystroke);
// Later...
capture.off("keystroke", handleKeystroke);
```

## Configuration

### BehavioralCaptureConfig

```typescript
interface BehavioralCaptureConfig {
  keystroke?: KeystrokeCaptureConfig;
  focus?: FocusCaptureConfig;
  paste?: PasteCaptureConfig;
  clipboard?: ClipboardCaptureConfig;
}
```

### KeystrokeCaptureConfig

```typescript
interface KeystrokeCaptureConfig {
  enabled?: boolean;         // Default: true
  captureKeyUp?: boolean;    // Default: true
  includeModifiers?: boolean; // Default: true
}
```

- **enabled**: Whether to capture keystrokes
- **captureKeyUp**: Whether to capture keyup events in addition to keydown
- **includeModifiers**: Whether to include modifier key states (Shift, Ctrl, Alt, Meta)

### FocusCaptureConfig

```typescript
interface FocusCaptureConfig {
  enabled?: boolean;         // Default: true
  useVisibilityAPI?: boolean; // Default: true
  useBlurFocus?: boolean;    // Default: true
}
```

- **enabled**: Whether to capture focus events
- **useVisibilityAPI**: Whether to use the Page Visibility API
- **useBlurFocus**: Whether to use window blur/focus events

### PasteCaptureConfig

```typescript
interface PasteCaptureConfig {
  enabled?: boolean;         // Default: true
  prevent?: boolean;         // Default: false
  warnMessage?: string;      // Message shown when paste is prevented
  capturePreview?: boolean;  // Default: true
  previewLength?: number;    // Default: 100
}
```

- **enabled**: Whether to capture paste events
- **prevent**: Whether to prevent paste operations from completing
- **warnMessage**: Alert message shown when paste is prevented
- **capturePreview**: Whether to capture a preview of pasted text
- **previewLength**: Length of text preview to capture

### ClipboardCaptureConfig

```typescript
interface ClipboardCaptureConfig {
  enabled?: boolean;         // Default: false
}
```

- **enabled**: Whether to capture clipboard copy events

## InputWrapper

A higher-level wrapper that combines behavioral capture with detection and intervention. Use `InputWrapper` when you need more than basic capture, for example when you want to run periodic detectors or trigger interventions based on behavioral patterns.

### Factory Function

```typescript
function createInputWrapper(config?: InputWrapperConfig): InputWrapper;
```

### InputWrapperConfig

```typescript
interface InputWrapperConfig {
  capture?: BehavioralCaptureConfig;
  interventionManager?: InterventionManager;
  detectors?: Detector[];
  detectionInterval?: number;  // Default: 5000ms
}
```

### Methods

#### wrap()

Wrap an input element with behavioral capture.

```typescript
wrap(element: HTMLTextAreaElement | HTMLInputElement): void;
```

**Example:**

```typescript
import { createInputWrapper } from "@slopit/behavioral";

const wrapper = createInputWrapper({
  capture: { keystroke: { enabled: true } },
  detectionInterval: 3000,
});

const textarea = document.getElementById("response") as HTMLTextAreaElement;
wrapper.wrap(textarea);
```

#### unwrap()

Unwrap the element and clean up all resources.

```typescript
unwrap(): void;
```

#### reset()

Reset all collected data without unwrapping.

```typescript
reset(newStartTime?: number): void;
```

#### getData()

Get all captured data including flags, detection results, and interventions.

```typescript
getData(): EnhancedBehavioralData;
```

Returns an `EnhancedBehavioralData` object:

```typescript
interface EnhancedBehavioralData extends BehavioralData {
  flags: CaptureFlag[];
  detectionResults: DetectionResult[];
  interventions: InterventionResult[];
}
```

#### getFlags()

Get flags generated during capture.

```typescript
getFlags(): CaptureFlag[];
```

#### getDetectionResults()

Get all detection results from detector runs.

```typescript
getDetectionResults(): DetectionResult[];
```

#### getInterventionResults()

Get all intervention results.

```typescript
getInterventionResults(): InterventionResult[];
```

#### runDetection()

Manually trigger all detectors immediately.

```typescript
runDetection(): DetectionResult[];
```

#### on() / off()

Subscribe to wrapper events.

```typescript
on(event: WrapperEvent, handler: WrapperEventHandler<unknown>): void;
off(event: WrapperEvent, handler: WrapperEventHandler<unknown>): void;
```

Event types: `"data"`, `"flag"`, `"intervention"`, `"detection"`

**Example:**

```typescript
wrapper.on("detection", (result) => {
  if (result.detected) {
    console.log("Detected:", result.message);
  }
});
```

## Detection

Detection modules identify specific behaviors during capture.

### Detector Interface

```typescript
interface Detector {
  readonly name: string;
  detect(): DetectionResult;
  startMonitoring?(element: HTMLElement): void;
  stopMonitoring?(): void;
}

interface DetectionResult {
  detectorName: string;
  detected: boolean;
  confidence: number;  // 0.0 to 1.0
  message: string;
  indicators: DetectionIndicator[];
  timestamp: number;
}

interface DetectionIndicator {
  name: string;
  value: unknown;
  weight: number;
}
```

### TextAppearanceDetector

Detects text that appears without corresponding keystroke activity (e.g., from AI assistants or text expansion).

```typescript
import { TextAppearanceDetector } from "@slopit/behavioral";

const detector = new TextAppearanceDetector({
  element: textarea,
  thresholds: {
    minTextIncrease: 20,           // Minimum character increase to flag
    maxKeystrokesForIncrease: 5,   // Maximum keystrokes for that increase
    windowMs: 1000,                // Time window for measurement
  },
  callbacks: {
    onTextAppearance: (info) => {
      console.log("Suspicious text appearance:", info);
    },
  },
});

detector.startMonitoring(textarea);
```

### ExtensionDetector

Detects browser extensions that may affect input behavior.

```typescript
import { createExtensionDetector } from "@slopit/behavioral";

const detector = createExtensionDetector({
  checkGrammarly: true,
  checkGoogleDocs: true,
  customSelectors: [".my-extension-class"],
});

const result = detector.detect();
if (result.detected) {
  console.log("Extensions detected:", result.indicators);
}
```

## Intervention

Intervention modules apply behavioral interventions and challenges.

### InterventionManager

Evaluates behavioral state and triggers interventions based on configurable thresholds.

```typescript
import { createInterventionManager } from "@slopit/behavioral";

const manager = createInterventionManager({
  triggers: {
    paste: {
      enabled: true,
      maxPasteLength: 50,
      maxPasteCount: 2,
    },
    blur: {
      enabled: true,
      maxBlurCount: 5,
      maxBlurDuration: 30000,
    },
    idle: {
      enabled: true,
      idleThresholdMs: 60000,
    },
  },
  interventions: {
    warning: { enabled: true },
    challenge: { enabled: true, type: "typing-test" },
  },
});
```

### InterventionManagerConfig

```typescript
interface InterventionManagerConfig {
  triggers: TriggerConfig;
  interventions: {
    warning?: { enabled: boolean; message?: string };
    challenge?: { enabled: boolean; type: ChallengeType };
    block?: { enabled: boolean };
  };
}

interface TriggerConfig {
  paste?: PasteThreshold;
  blur?: BlurThreshold;
  idle?: IdleThreshold;
  timing?: TimingThreshold;
}
```

### Challenges

Interactive challenges for participant verification.

#### TypingTestChallenge

Presents a phrase for the participant to type.

```typescript
import { TypingTestChallenge } from "@slopit/behavioral";

const challenge = new TypingTestChallenge({
  phrase: "The quick brown fox jumps over the lazy dog.",
  container: document.getElementById("challenge-container"),
  timeout: 60000,
});

const result = await challenge.present();
console.log("Passed:", result.passed);
console.log("Accuracy:", result.accuracy);
```

#### MemoryRecallChallenge

Presents a series of items for the participant to recall.

```typescript
import { MemoryRecallChallenge } from "@slopit/behavioral";

const challenge = new MemoryRecallChallenge({
  items: ["apple", "banana", "cherry"],
  displayTimeMs: 3000,
  container: document.getElementById("challenge-container"),
});

const result = await challenge.present();
console.log("Recalled:", result.recalledItems);
```

#### Factory Function

```typescript
import { createChallenge } from "@slopit/behavioral";

const challenge = createChallenge("typing-test", {
  phrase: "Type this phrase.",
  container: element,
});
```

## Individual Collectors

For advanced use cases, you can use collectors directly.

### KeystrokeCollector

Collects keystroke events from DOM elements.

```typescript
class KeystrokeCollector {
  constructor(
    config: Required<KeystrokeCaptureConfig>,
    startTime: number,
    onEvent?: (event: KeystrokeEvent) => void
  );

  attach(element: HTMLElement | Document): void;
  detach(): void;
  reset(newStartTime?: number): void;
  getEvents(): KeystrokeEvent[];
  getFirstKeystrokeTime(): number | undefined;
  getRecentCount(windowMs: number): number;
}
```

**Example:**

```typescript
import { KeystrokeCollector } from "@slopit/behavioral";

const collector = new KeystrokeCollector(
  { enabled: true, captureKeyUp: true, includeModifiers: true },
  performance.now(),
  (event) => console.log("Keystroke:", event.key)
);

collector.attach(document.getElementById("input")!);
```

### FocusCollector

Collects focus and visibility events.

```typescript
class FocusCollector {
  constructor(
    config: Required<FocusCaptureConfig>,
    startTime: number,
    onEvent?: (event: FocusEvent) => void
  );

  attach(element: Document): void;
  detach(): void;
  reset(newStartTime?: number): void;
  getEvents(): FocusEvent[];
}
```

### PasteCollector

Collects paste events from DOM elements.

```typescript
class PasteCollector {
  constructor(
    config: Required<Omit<PasteCaptureConfig, "warnMessage">> & { warnMessage?: string },
    startTime: number,
    getRecentKeystrokes: () => number,
    onEvent?: (event: PasteEvent) => void
  );

  attach(element: HTMLElement | Document): void;
  detach(): void;
  reset(newStartTime?: number): void;
  getEvents(): PasteEvent[];
}
```

### ClipboardCollector

Collects clipboard copy events.

```typescript
class ClipboardCollector {
  constructor(
    config: { enabled: boolean },
    startTime: number,
    onEvent?: (event: ClipboardCopyEvent) => void
  );

  attach(element: HTMLElement | Document): void;
  detach(): void;
  reset(newStartTime?: number): void;
  getEvents(): ClipboardCopyEvent[];
}
```

## Metrics Functions

### computeKeystrokeMetrics()

Compute metrics from keystroke events.

```typescript
function computeKeystrokeMetrics(
  keystrokes: KeystrokeEvent[],
  pauseThreshold?: number  // Default: 2000ms
): KeystrokeMetrics;
```

**Example:**

```typescript
import { computeKeystrokeMetrics } from "@slopit/behavioral";

const metrics = computeKeystrokeMetrics(keystrokes);
console.log("Mean IKI:", metrics.meanIKI);
console.log("Pauses:", metrics.pauseCount);
```

### computeFocusMetrics()

Compute metrics from focus events.

```typescript
function computeFocusMetrics(focusEvents: FocusEvent[]): FocusMetrics;
```

**Example:**

```typescript
import { computeFocusMetrics } from "@slopit/behavioral";

const metrics = computeFocusMetrics(focusEvents);
console.log("Blur count:", metrics.blurCount);
console.log("Total blur duration:", metrics.totalBlurDuration);
```

### computeTimingMetrics()

Compute timing metrics from keystroke events.

```typescript
function computeTimingMetrics(
  keystrokes: KeystrokeEvent[],
  totalResponseTime: number
): TimingMetrics;
```

**Example:**

```typescript
import { computeTimingMetrics } from "@slopit/behavioral";

const metrics = computeTimingMetrics(keystrokes, 30000);
console.log("First keystroke latency:", metrics.firstKeystrokeLatency);
console.log("Characters per minute:", metrics.charactersPerMinute);
```

## Event Types

### BehavioralCaptureEvents

```typescript
interface BehavioralCaptureEvents {
  keystroke: (event: KeystrokeEvent) => void;
  focus: (event: FocusEvent) => void;
  paste: (event: PasteEvent) => void;
}
```

Use these with the `on()` and `off()` methods of `BehavioralCapture`.
