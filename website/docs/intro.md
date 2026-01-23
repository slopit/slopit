---
sidebar_position: 1
---

# slopit TypeScript Documentation

slopit is a modular toolkit for detecting AI-assisted responses in crowdsourced behavioral research. The TypeScript packages provide client-side behavioral capture that works with any experiment platform.

## Package Overview

| Package | Description | Dependencies |
|---------|-------------|--------------|
| `@slopit/core` | Shared types, schemas, and utilities | Zod |
| `@slopit/behavioral` | DOM-based behavioral capture | `@slopit/core` |
| `@slopit/adapter-jspsych` | jsPsych 8.x integration | `@slopit/core`, `@slopit/behavioral`, jsPsych |

## Architecture

slopit uses a layered architecture that separates concerns.

```
┌─────────────────────────────────────────┐
│         Framework Adapters              │
│  (adapter-jspsych, adapter-labjs, ...)  │
└────────────────────┬────────────────────┘
                     │
┌────────────────────▼────────────────────┐
│           @slopit/behavioral            │
│     (DOM capture, event collection)     │
└────────────────────┬────────────────────┘
                     │
┌────────────────────▼────────────────────┐
│             @slopit/core                │
│   (types, schemas, validation, utils)   │
└─────────────────────────────────────────┘
```

### @slopit/core

The core package provides:

- **Type definitions** for sessions, trials, behavioral data, and flags
- **Zod schemas** for runtime validation
- **Utility functions** for ID generation, hashing, and timing

This package has no DOM dependencies and can run in any JavaScript environment.

### @slopit/behavioral

The behavioral package provides:

- **BehavioralCapture** class for coordinating data collection
- **InputWrapper** for wrapping existing input elements with capture, detection, and intervention
- **Collectors** for keystrokes, focus events, paste events, and clipboard copy events
- **Detectors** for identifying behaviors like text appearance without keystrokes or browser extensions
- **Interventions** for presenting challenges when suspicious behavior is detected
- **Metrics computation** for analyzing captured data

This package requires DOM APIs (window, document) but has no framework dependencies.

### @slopit/adapter-jspsych

The jsPsych adapter provides:

- **SlopitExtension** for adding behavioral capture to ANY jsPsych plugin
- **exportToSlopit()** for converting jsPsych data to SlopitSession format
- **getSlopitDataFromTrial()** for accessing behavioral data from trials

## Data Flow

1. During an experiment, the adapter attaches behavioral capture to input elements
2. Keystrokes, focus changes, and paste events are recorded with precise timing
3. When a trial completes, captured data is included in the trial results
4. At experiment end, all data exports to the standardized SlopitSession format
5. The session can be sent to a server for analysis

## Next Steps

- [Installation](./installation.md): Set up slopit in your project
- [Quick Start](./quickstart.md): Get capturing in 5 minutes
- [API Reference](./api/index.md): Detailed API documentation
- [Guides](./guides/behavioral-capture.md): In-depth usage guides
