import assert from "node:assert/strict";
import { test } from "node:test";
import { sitemapUrls } from "./site-files.ts";
import { publicHref, publicUrl, subsiteOfPath } from "./sites.ts";

test("a built path belongs to its subsite", () => {
  assert.equal(subsiteOfPath("/ranch/docs/"), "ranch");
  assert.equal(subsiteOfPath("/ranchers/"), undefined);
  assert.equal(subsiteOfPath("/"), undefined);
});

test("a built path maps to its public URL", () => {
  assert.equal(publicUrl("/").href, "https://bramvanosta.com/");
  assert.equal(publicUrl("/ranch/").href, "https://ranch.bramvanosta.com/");
  assert.equal(publicUrl("/ranch/docs/").href, "https://ranch.bramvanosta.com/docs/");
});

test("a link stays a path on its own host and becomes a URL across hosts", () => {
  assert.equal(publicHref("/ranch/?ref=home#install", "/ranch/"), "/?ref=home#install");
  assert.equal(publicHref("/ranch/docs/?q=1#a", "/ranch/404"), "/docs/?q=1#a");
  assert.equal(publicHref("/ranch/", "/"), "https://ranch.bramvanosta.com/");
  assert.equal(publicHref("/", "/ranch/"), "https://bramvanosta.com/");
});

test("each host's sitemap lists its own pages, without the 404s", () => {
  assert.deepEqual(
    sitemapUrls(["", "404", "ranch/docs/", "ranch/", "ranch/404"]),
    new Map([
      ["", ["https://bramvanosta.com/"]],
      ["ranch", ["https://ranch.bramvanosta.com/", "https://ranch.bramvanosta.com/docs/"]],
    ]),
  );
});
