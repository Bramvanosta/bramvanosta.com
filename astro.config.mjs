// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import { siteFiles } from "./src/lib/site-files.ts";

// https://astro.build/config
// Fully static: the Worker in worker/ serves dist/ and routes each host to its folder.
export default defineConfig({
  site: "https://bramvanosta.com",
  trailingSlash: "ignore",
  // "preserve" keeps src/pages/ranch/404.astro as ranch/404.html, the file Cloudflare serves for a miss.
  build: { format: "preserve", inlineStylesheets: "always" },
  // The Worker's CSP allows scripts, fonts and images from 'self' only: none may be inlined as a script
  // or a data: URI. Stylesheets are inlined on purpose (inlineStylesheets above, style-src 'unsafe-inline').
  vite: { build: { assetsInlineLimit: 0 } },
  fonts: [
    {
      // Ranch's wordmark and labels: a subset of the Fontsource file (npm run font), self-hosted, no font CDN.
      provider: fontProviders.local(),
      name: "JetBrains Mono",
      cssVariable: "--font-brand",
      fallbacks: ["monospace"],
      options: {
        variants: [
          {
            weight: 600,
            style: "normal",
            src: ["./src/assets/fonts/jetbrains-mono-600-subset.woff2"],
          },
        ],
      },
    },
  ],
  integrations: [siteFiles()],
});
