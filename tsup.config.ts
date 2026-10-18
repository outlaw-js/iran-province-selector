import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  // Type declarations are emitted by `tsc` (TypeScript 7 has no JS API for tsup's dts plugin).
  dts: false,
  sourcemap: true,
  clean: false,
  // Rollup tree-shaking would strip the "use client" banner; esbuild output is already lean.
  treeshake: false,
  external: ["react", "react-dom", "react/jsx-runtime"],
  // Lets the component be imported directly from Next.js App Router server components.
  banner: { js: '"use client";' },
});
