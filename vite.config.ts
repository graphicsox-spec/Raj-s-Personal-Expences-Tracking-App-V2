import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/Raj-s-Personal-Expences-Tracking-App-V2/",
  server: { port: 5180 },
  preview: { port: 4180 },
});
