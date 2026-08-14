import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import { viteSingleFile } from "vite-plugin-singlefile";

/* Two fixes the single-file build needs to survive being opened from disk:

   1. Vite stamps type="module" on the entry script. The bundle is IIFE, and
      the module type re-imposes the CORS rules that stop file:// pages
      loading at all — so the attribute is stripped.
   2. A classic script runs the moment it is parsed, and Vite puts it in
      <head> — before <body> exists, so getElementById("root") returns null
      and React throws "target container is not a DOM element". Module
      scripts are deferred and never hit this, so the script has to be moved
      to the end of <body> by hand. */
function fileSystemSafeHtml() {
  return {
    name: "file-system-safe-html",
    closeBundle() {
      const file = path.resolve(__dirname, "preview/index.html");
      if (!fs.existsSync(file)) return;

      let html = fs
        .readFileSync(file, "utf8")
        .replace(/<script type="module" crossorigin>/g, "<script>")
        .replace(/<style rel="stylesheet" crossorigin>/g, "<style>");

      const scripts: string[] = [];
      html = html.replace(/<script>[\s\S]*?<\/script>/g, (match) => {
        scripts.push(match);
        return "";
      });
      html = html.replace("</body>", scripts.join("\n") + "\n</body>");

      fs.writeFileSync(file, html);
    },
  };
}

/* Builds ONE self-contained index.html — JS, CSS and images all inlined —
   that opens by double-clicking, with no server. Pair with
   VITE_STATIC_PREVIEW=1 so the app switches to hash routing. */
export default defineConfig({
  plugins: [react(), viteSingleFile(), fileSystemSafeHtml()],
  resolve: {
    alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
  },
  build: {
    outDir: "preview",
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000,
    chunkSizeWarningLimit: 100_000,
    // IIFE instead of ESM: a classic <script> carries no module semantics.
    rollupOptions: {
      output: { format: "iife", inlineDynamicImports: true },
    },
  },
});
