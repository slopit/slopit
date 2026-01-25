# slopit

[![CI](https://github.com/slopit/slopit/actions/workflows/ci.yml/badge.svg)](https://github.com/slopit/slopit/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@slopit/core)](https://www.npmjs.com/package/@slopit/core)
[![PyPI](https://img.shields.io/pypi/v/slopit)](https://pypi.org/project/slopit/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modular toolkit for detecting AI-assisted responses in crowdsourced behavioral research.

## Overview

slopit provides tools to capture and analyze behavioral signals during text entry tasks, helping researchers identify potentially AI-assisted responses in crowdsourced studies.

**TypeScript packages** for client-side behavioral capture in web experiments:
- Keystroke dynamics (timing, patterns)
- Paste event detection
- Focus/blur tracking
- Platform adapters for jsPsych, lab.js, PsychoJS, Gorilla, JATOS, OSWeb, PCIbex

**Python package** for server-side analysis:
- Behavioral feature extraction
- Stylometric analysis
- Machine learning classifiers

## Documentation

- **[TypeScript Documentation](https://slopit.github.io/slopit/docs/typescript/intro):** Behavioral capture packages
- **[Python Documentation](https://slopit.github.io/slopit/docs/python/):** Analysis toolkit

## Quick Start

### TypeScript (Client-side Capture)

```bash
npm install @slopit/behavioral @slopit/adapter-jspsych
```

```typescript
import { SlopitExtension } from "@slopit/adapter-jspsych";

const jsPsych = initJsPsych({
  extensions: [{ type: SlopitExtension }],
});
```

### Python (Server-side Analysis)

```bash
pip install slopit
```

```python
from slopit import Session

session = Session.from_json(data)
features = session.extract_features()
```

## Packages

### TypeScript

| Package | Description |
|---------|-------------|
| [@slopit/core](./packages/core) | Core types, schemas, and validation |
| [@slopit/behavioral](./packages/behavioral) | Behavioral event capture |
| [@slopit/adapter-jspsych](./packages/adapter-jspsych) | jsPsych integration |
| [@slopit/adapter-labjs](./packages/adapter-labjs) | lab.js integration |
| [@slopit/adapter-psychojs](./packages/adapter-psychojs) | PsychoJS/Pavlovia integration |
| [@slopit/adapter-gorilla](./packages/adapter-gorilla) | Gorilla integration |
| [@slopit/adapter-jatos](./packages/adapter-jatos) | JATOS integration |
| [@slopit/adapter-osweb](./packages/adapter-osweb) | OSWeb/OpenSesame integration |
| [@slopit/adapter-pcibex](./packages/adapter-pcibex) | PCIbex integration |
| [@slopit/adapter-vanilla](./packages/adapter-vanilla) | Framework-agnostic adapter |
| [@slopit/adapter-shared](./packages/adapter-shared) | Shared adapter utilities |

### Python

| Package | Description |
|---------|-------------|
| [slopit](./python) | Analysis toolkit |

## Development

### Prerequisites

- Node.js >= 22
- pnpm >= 9
- Python >= 3.13
- uv (Python package manager)

### Setup

```bash
# Install Node dependencies
pnpm install

# Install Python dependencies
cd python && uv sync --extra dev
```

### Commands

```bash
# Build all packages
pnpm build

# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

[MIT](./LICENSE)

## Acknowledgments

This project was architected and implemented with the help of Claude Code.