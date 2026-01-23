---
sidebar_position: 1
---

# Behavioral Capture Guide

This guide covers how to use `@slopit/behavioral` for capturing keystroke dynamics, focus events, and paste detection.

## Overview

Behavioral capture collects three types of data:

1. **Keystrokes**: Every keydown and keyup event with timing information
2. **Focus events**: Window blur/focus and page visibility changes
3. **Paste events**: Clipboard paste operations with metadata

This data helps identify AI-assisted responses by analyzing typing patterns.

## Basic Setup

### Creating a Capture Instance

Use `createBehavioralCapture()` to create a capture instance.

```typescript
import { createBehavioralCapture } from "@slopit/behavioral";

const capture = createBehavioralCapture({
  keystroke: { enabled: true },
  focus: { enabled: true },
  paste: { enabled: true },
});
```

### Attaching to Elements

Call `attach()` to start capturing from a DOM element.

```typescript
const textarea = document.getElementById("response") as HTMLTextAreaElement;
capture.attach(textarea);
```

For text input capture, attach to the specific input element. For document-level events (like focus), the capture automatically attaches focus tracking to the document.

### Retrieving Data

Get captured data with `getData()`.

```typescript
const data = capture.getData();

console.log("Keystrokes:", data.keystrokes);
console.log("Focus events:", data.focus);
console.log("Paste events:", data.paste);
console.log("Metrics:", data.metrics);
```

### Cleanup

Always call `detach()` when finished.

```typescript
capture.detach();
```

This removes event listeners and prevents memory leaks.

## Configuration Options

### Keystroke Configuration

```typescript
const capture = createBehavioralCapture({
  keystroke: {
    enabled: true,       // Capture keystrokes
    captureKeyUp: true,  // Include keyup events (not just keydown)
    includeModifiers: true, // Include Shift/Ctrl/Alt/Meta states
  },
});
```

#### When to Disable keyup

If you only need basic typing analysis, disable keyup to reduce data size.

```typescript
keystroke: {
  enabled: true,
  captureKeyUp: false,  // Only keydown events
}
```

#### When to Disable Modifiers

If modifier key analysis is not needed.

```typescript
keystroke: {
  enabled: true,
  includeModifiers: false,  // No modifier state tracking
}
```

### Focus Configuration

```typescript
const capture = createBehavioralCapture({
  focus: {
    enabled: true,
    useVisibilityAPI: true,  // Track page visibility changes
    useBlurFocus: true,      // Track window blur/focus
  },
});
```

#### Visibility API vs Blur/Focus

The **Visibility API** detects when the page becomes hidden (tab switch, minimize). It is more reliable than blur/focus for detecting tab switches.

**Blur/Focus events** detect when the window loses/gains focus. This catches some cases the Visibility API misses (like switching to another window without changing tabs).

For comprehensive tracking, enable both.

### Paste Configuration

```typescript
const capture = createBehavioralCapture({
  paste: {
    enabled: true,
    prevent: false,        // Allow paste (false) or block it (true)
    capturePreview: true,  // Capture first N characters
    previewLength: 100,    // Preview length
    warnMessage: "Pasting is not allowed.",  // Alert when blocked
  },
});
```

#### Preventing Paste

To prevent participants from pasting content.

```typescript
paste: {
  enabled: true,
  prevent: true,
  warnMessage: "Please type your response manually.",
}
```

Note: The paste event is still recorded even when blocked.

#### Privacy Considerations

To capture paste events without storing content.

```typescript
paste: {
  enabled: true,
  capturePreview: false,  // No preview stored
}
```

Only length and hash are recorded.

## Real-Time Event Handling

Subscribe to events as they occur.

```typescript
import type { KeystrokeEvent, FocusEvent, PasteEvent } from "@slopit/core";

capture.on("keystroke", (event: KeystrokeEvent) => {
  console.log(`Key: ${event.key} at ${event.time}ms`);
});

capture.on("focus", (event: FocusEvent) => {
  if (event.event === "blur") {
    console.log("User switched away");
  }
});

capture.on("paste", (event: PasteEvent) => {
  console.log(`Paste detected: ${event.textLength} characters`);
});
```

To unsubscribe:

```typescript
const handler = (event: KeystrokeEvent) => { /* ... */ };
capture.on("keystroke", handler);
// Later...
capture.off("keystroke", handler);
```

## Metrics Computation

### Automatic Metrics

`getData()` includes computed metrics.

```typescript
const data = capture.getData();
const metrics = data.metrics;

// Keystroke metrics
if (metrics?.keystroke) {
  console.log("Total keystrokes:", metrics.keystroke.totalKeystrokes);
  console.log("Mean IKI:", metrics.keystroke.meanIKI, "ms");
  console.log("Pauses (>2s):", metrics.keystroke.pauseCount);
}

// Focus metrics
if (metrics?.focus) {
  console.log("Blur events:", metrics.focus.blurCount);
  console.log("Time away:", metrics.focus.totalBlurDuration, "ms");
}

// Timing metrics
if (metrics?.timing) {
  console.log("First key latency:", metrics.timing.firstKeystrokeLatency, "ms");
  console.log("Typing speed:", metrics.timing.charactersPerMinute, "CPM");
}
```

### Manual Metrics Computation

For custom analysis, use the metrics functions directly.

```typescript
import {
  computeKeystrokeMetrics,
  computeFocusMetrics,
  computeTimingMetrics,
} from "@slopit/behavioral";

// Custom pause threshold (1 second instead of default 2)
const keystrokeMetrics = computeKeystrokeMetrics(keystrokes, 1000);

// Focus metrics
const focusMetrics = computeFocusMetrics(focusEvents);

// Timing metrics
const timingMetrics = computeTimingMetrics(keystrokes, totalTime);
```

## Multi-Trial Capture

For experiments with multiple text responses, reset between trials.

```typescript
// Trial 1
capture.attach(textarea1);
// ... user types ...
const data1 = capture.getData();
capture.detach();

// Trial 2
capture.attach(textarea2);
// ... user types ...
const data2 = capture.getData();
capture.detach();
```

Or reuse the instance with `reset()`:

```typescript
capture.attach(textarea1);
// ... user types ...
const data1 = capture.getData();

// Reset for next trial (stay attached)
capture.reset();
// ... user types ...
const data2 = capture.getData();

capture.detach();
```

## Flags

Capture generates flags for notable events.

```typescript
const flags = capture.getFlags();

for (const flag of flags) {
  console.log(`[${flag.severity}] ${flag.type}: ${flag.message}`);
}
```

### Built-in Flags

| Type | Severity | Condition |
|------|----------|-----------|
| `paste_detected` | medium | Any paste event occurred |
| `excessive_blur` | low | More than 5 blur events |

## InputWrapper

For applications that need detection and intervention in addition to capture, use `InputWrapper`. This higher-level API wraps an existing input element and coordinates capture, periodic detection, and intervention management.

### Basic Usage

```typescript
import { createInputWrapper } from "@slopit/behavioral";

const wrapper = createInputWrapper({
  capture: {
    keystroke: { enabled: true },
    paste: { enabled: true },
  },
});

const textarea = document.getElementById("response") as HTMLTextAreaElement;
wrapper.wrap(textarea);

// Subscribe to events
wrapper.on("detection", (result) => {
  console.log("Detection:", result);
});

// Later, get all captured data
const data = wrapper.getData();
console.log("Keystrokes:", data.keystrokes?.length);
console.log("Flags:", data.flags);
console.log("Detections:", data.detectionResults);

wrapper.unwrap();
```

### With Detectors

Add detectors that run periodically during capture.

```typescript
import {
  createInputWrapper,
  TextAppearanceDetector,
  createExtensionDetector,
} from "@slopit/behavioral";

const textarea = document.getElementById("response") as HTMLTextAreaElement;

const textDetector = new TextAppearanceDetector({
  element: textarea,
  thresholds: {
    minTextIncrease: 20,
    maxKeystrokesForIncrease: 5,
    windowMs: 1000,
  },
});

const extensionDetector = createExtensionDetector({
  checkGrammarly: true,
});

const wrapper = createInputWrapper({
  capture: { keystroke: { enabled: true } },
  detectors: [textDetector, extensionDetector],
  detectionInterval: 3000,  // Run detectors every 3 seconds
});

wrapper.wrap(textarea);
```

### With Intervention Manager

Add an intervention manager to respond to suspicious behavior.

```typescript
import {
  createInputWrapper,
  createInterventionManager,
} from "@slopit/behavioral";

const manager = createInterventionManager({
  triggers: {
    paste: { enabled: true, maxPasteCount: 2 },
    blur: { enabled: true, maxBlurCount: 5 },
  },
  interventions: {
    warning: { enabled: true, message: "Please stay focused on the task." },
    challenge: { enabled: true, type: "typing-test" },
  },
});

const wrapper = createInputWrapper({
  capture: { keystroke: { enabled: true } },
  interventionManager: manager,
});

wrapper.wrap(textarea);

// Listen for interventions
wrapper.on("intervention", (result) => {
  console.log("Intervention triggered:", result);
});
```

### EnhancedBehavioralData

The `getData()` method returns an `EnhancedBehavioralData` object that extends `BehavioralData` with additional fields.

```typescript
interface EnhancedBehavioralData extends BehavioralData {
  flags: CaptureFlag[];
  detectionResults: DetectionResult[];
  interventions: InterventionResult[];
}
```

## Individual Collectors

For fine-grained control, use collectors directly.

```typescript
import { KeystrokeCollector } from "@slopit/behavioral";

const collector = new KeystrokeCollector(
  { enabled: true, captureKeyUp: false, includeModifiers: true },
  performance.now(),
  (event) => {
    // Called for each keystroke
    console.log(event.key);
  }
);

collector.attach(textarea);

// Get recent keystroke count (for paste context)
const recentCount = collector.getRecentCount(2000); // Last 2 seconds

// Get first keystroke time
const firstKeyTime = collector.getFirstKeystrokeTime();

collector.detach();
```

## Best Practices

### 1. Attach Early

Attach capture before the user can start typing to capture all keystrokes.

```typescript
// Good: Attach when element is ready
element.addEventListener("focus", () => {
  capture.attach(element);
});

// Better: Attach immediately when element exists
capture.attach(element);
```

### 2. Use Appropriate Start Time

For accurate first keystroke latency, pass the trial start time.

```typescript
const trialStart = performance.now();
// Show stimulus...
capture.attach(textarea, trialStart);
```

### 3. Handle Errors

Wrap capture operations in try-catch for robustness.

```typescript
try {
  capture.attach(textarea);
} catch (error) {
  console.error("Failed to attach capture:", error);
  // Continue without capture
}
```

### 4. Consider Data Size

Full keystroke capture with keyup events generates substantial data. For long text responses, consider:

- Disabling keyup capture
- Sampling or summarizing events server-side

### 5. Privacy Notice

Inform participants that typing behavior is being recorded. Include this in your consent form.
