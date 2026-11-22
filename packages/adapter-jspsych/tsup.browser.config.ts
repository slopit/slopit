import { defineConfig } from "tsup";

export default defineConfig({
  entry: { browser: "src/browser.ts" },
  format: ["iife"],
  globalName: "SlopitJsPsych",
  dts: false,
  target: "es2020",
  outDir: "dist",
  noExternal: [/^@slopit\//, /^jspsych$/],
  minify: true,
});
