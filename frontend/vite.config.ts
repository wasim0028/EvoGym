import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
  },
  server: {
    // No `host` on purpose. Vite then binds "localhost", which resolves
    // correctly on every OS. Forcing "0.0.0.0" binds IPv4 ONLY, and Windows
    // resolves "localhost" to ::1 (IPv6) first — so Edge/Brave/Chrome get
    // ECONNREFUSED on http://localhost:5173 even though the server is up.
    // For LAN/phone testing use `npm run dev:host` and the Network URL.
    port: 5173,
    // The app calls the API at the relative path /api. In production the ALB
    // routes that to the backend; in development this proxy does the same job.
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
