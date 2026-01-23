---
sidebar_position: 2
---

# Installation

## Package Manager

Install packages using your preferred package manager.

### pnpm (recommended)

```bash
# Core types and utilities
pnpm add @slopit/core

# Behavioral capture (includes core)
pnpm add @slopit/behavioral

# jsPsych adapter (includes behavioral and core)
pnpm add @slopit/adapter-jspsych
```

### npm

```bash
npm install @slopit/core
npm install @slopit/behavioral
npm install @slopit/adapter-jspsych
```

### yarn

```bash
yarn add @slopit/core
yarn add @slopit/behavioral
yarn add @slopit/adapter-jspsych
```

## Peer Dependencies

### @slopit/adapter-jspsych

The jsPsych adapter requires jsPsych 8.x as a peer dependency.

```bash
pnpm add jspsych@^8.0.0
```

If you use the adapter without jsPsych installed, you will see a peer dependency warning.

## TypeScript Configuration

slopit packages target ES2024 and use ESM. Configure your `tsconfig.json` accordingly.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "verbatimModuleSyntax": true
  }
}
```

Key settings:

- **module/moduleResolution**: Use `NodeNext` for ESM support
- **lib**: Include `DOM` and `DOM.Iterable` for browser APIs
- **verbatimModuleSyntax**: Ensures proper import/export handling

## Browser Compatibility

slopit uses modern browser APIs.

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| ES2022+ | 94+ | 93+ | 15.4+ | 94+ |
| `performance.now()` | 24+ | 15+ | 8+ | 12+ |
| `crypto.randomUUID()` | 92+ | 95+ | 15.4+ | 92+ |
| `crypto.subtle` | 37+ | 34+ | 11+ | 12+ |
| Page Visibility API | 33+ | 18+ | 7+ | 12+ |

For older browsers, slopit includes fallbacks:

- **crypto.randomUUID()**: Falls back to manual UUID generation
- **crypto.subtle**: Falls back to simple (non-cryptographic) hashing
- **performance.now()**: Falls back to `Date.now()`

## Build Tools

### Vite

Vite works out of the box with slopit packages.

```javascript
// vite.config.js
export default {
  // No special configuration needed
};
```

### Webpack

For Webpack, ensure ESM support is configured.

```javascript
// webpack.config.js
module.exports = {
  experiments: {
    outputModule: true,
  },
  resolve: {
    extensionAlias: {
      ".js": [".ts", ".js"],
    },
  },
};
```

### esbuild

esbuild handles slopit packages directly.

```javascript
// build.js
import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/experiment.ts"],
  bundle: true,
  format: "esm",
  outfile: "dist/experiment.js",
});
```

## CDN Usage

For quick prototyping without a build step, use a CDN.

```html
<script type="importmap">
{
  "imports": {
    "@slopit/core": "https://esm.sh/@slopit/core",
    "@slopit/behavioral": "https://esm.sh/@slopit/behavioral",
    "@slopit/adapter-jspsych": "https://esm.sh/@slopit/adapter-jspsych",
    "jspsych": "https://esm.sh/jspsych@8"
  }
}
</script>

<script type="module">
import { createBehavioralCapture } from "@slopit/behavioral";

const capture = createBehavioralCapture({
  keystroke: { enabled: true },
});
</script>
```

Note: CDN usage is suitable for development. For production, bundle your dependencies.

## Verifying Installation

Test that packages are installed correctly.

```typescript
// test-install.ts
import { generateSessionId, SCHEMA_VERSION } from "@slopit/core";
import { createBehavioralCapture } from "@slopit/behavioral";

console.log("Schema version:", SCHEMA_VERSION);
console.log("Session ID:", generateSessionId());

const capture = createBehavioralCapture({
  keystroke: { enabled: true },
});
console.log("Capture created:", capture);
```

Run with your preferred TypeScript runner:

```bash
npx tsx test-install.ts
# or
pnpm dlx ts-node test-install.ts
```
