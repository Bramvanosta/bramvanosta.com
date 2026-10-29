// Writes robots.txt and sitemap.xml for each host after the build: each site lists only its own
// pages, at their public URLs (dist/ranch/sitemap.xml is served as https://ranch.bramvanosta.com/sitemap.xml).

import { mkdir, writeFile } from "node:fs/promises";
import type { AstroIntegration } from "astro";
import { publicUrl, subsiteOfPath, type Subsite } from "./sites.ts";

/** The public URLs of the built pages, by subsite ("" for the apex), sorted. 404 pages are left out. */
export function sitemapUrls(pathnames: string[]): Map<Subsite | "", string[]> {
  const sites = new Map<Subsite | "", string[]>();
  for (const pathname of pathnames) {
    const path = `/${pathname}`;
    if (/^\/(?:[^/]+\/)?404\/?$/.test(path)) continue;
    const subsite = subsiteOfPath(path) ?? "";
    sites.set(subsite, [...(sites.get(subsite) ?? []), publicUrl(path).href].sort());
  }
  return sites;
}

export function siteFiles(): AstroIntegration {
  return {
    name: "site-files",
    hooks: {
      "astro:build:done": async ({ pages, dir, logger }) => {
        for (const [subsite, urls] of sitemapUrls(pages.map((page) => page.pathname))) {
          const out = new URL(subsite ? `${subsite}/` : "./", dir);
          const origin = publicUrl(subsite ? `/${subsite}/` : "/").origin;
          const sitemap = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            ...urls.map((url) => `  <url><loc>${url}</loc></url>`),
            "</urlset>",
            "",
          ].join("\n");
          await mkdir(out, { recursive: true });
          await writeFile(new URL("sitemap.xml", out), sitemap);
          await writeFile(new URL("robots.txt", out), `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
          logger.info(`${origin}: ${urls.length} page(s) in sitemap.xml`);
        }
      },
    },
  };
}
