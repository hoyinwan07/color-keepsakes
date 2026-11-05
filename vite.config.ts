import { defineConfig } from "vite";

export default defineConfig({
  build: {
    // Small thumbnails would otherwise be inlined as data: URIs, which the CSP (img-src 'self') blocks.
    assetsInlineLimit: 0,
  },
});
