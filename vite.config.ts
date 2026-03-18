import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [dts({ rollupTypes: true })],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "TMRGuide",
      formats: ["es", "iife"],
      fileName: (format) => (format === "iife" ? "tmr-guide.iife.js" : "tmr-guide.esm.js"),
    },
    rollupOptions: {
      output: {
        // IIFE global name
        name: "TMRGuide",
      },
    },
    sourcemap: true,
    minify: false,
  },
});
