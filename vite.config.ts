import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// https://vitejs.dev/config/
export default defineConfig({
  // viteSingleFile inlines all JS/CSS into one index.html so the production
  // build can be opened by double-clicking dist/index.html (file://) — no server.
  plugins: [react(), viteSingleFile()],
  base: "./",
  server: { port: 5180 },
  preview: { port: 4180 },
});
