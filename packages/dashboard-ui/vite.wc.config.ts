import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Web Component build configuration
// This bundles React and ReactDOM for standalone use
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/web-component.ts"),
      name: "SlopitDashboardWC",
      fileName: "slopit-dashboard-wc",
      formats: ["es", "iife"],
    },
    outDir: "dist",
    emptyDir: false,
    sourcemap: true,
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});
