// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import { siteFiles } from "./src/lib/site-files.ts";

/**
 * A weight of a self-hosted font, no font CDN: the subset that npm run font cuts from Fontsource's file.
 * @param {string} file
 * @param {number} weight
 */
const subset = (file, weight) => ({
  weight,
  style: /** @type {const} */ ("normal"),
  src: /** @type {[string]} */ ([`./src/assets/fonts/${file}-${weight}-subset.woff2`]),
});

const local = fontProviders.local();

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
    // Ranch's wordmark and labels.
    {
      provider: local,
      name: "JetBrains Mono",
      cssVariable: "--font-brand",
      fallbacks: ["monospace"],
      options: { variants: [subset("jetbrains-mono", 600)] },
    },
    // The home page, from the Bram van Osta design system: Inter for the text, IBM Plex Mono for the
    // labels, Newsreader for the name in the logo, Inter Tight for the 404 title.
    {
      provider: local,
      name: "Inter",
      cssVariable: "--font-inter",
      fallbacks: ["Helvetica", "Arial", "sans-serif"],
      options: { variants: [subset("inter", 400), subset("inter", 600)] },
    },
    {
      provider: local,
      name: "IBM Plex Mono",
      cssVariable: "--font-plex-mono",
      fallbacks: ["Menlo", "Courier", "monospace"],
      options: { variants: [subset("ibm-plex-mono", 400)] },
    },
    {
      provider: local,
      name: "Newsreader",
      cssVariable: "--font-newsreader",
      fallbacks: ["Georgia", "serif"],
      options: { variants: [subset("newsreader", 500)] },
    },
    {
      provider: local,
      name: "Inter Tight",
      cssVariable: "--font-inter-tight",
      fallbacks: ["Helvetica", "Arial", "sans-serif"],
      options: { variants: [subset("inter-tight", 700)] },
    },
  ],
  integrations: [siteFiles()],
});
