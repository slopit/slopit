import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/schemas/index.ts", "src/validation/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  target: "es2024",
  outDir: "dist",
});
