import assert from "node:assert/strict";
import { test } from "node:test";
import worker, { languageRedirect, route, type Env } from "./index.ts";

const at = (href: string) => route(new URL(href));

/** Runs the Worker against an assets layer that always answers `asset`, and records what it was asked for. */
async function serve(href: string, asset = new Response("ok"), headers: HeadersInit = {}) {
  const requested: string[] = [];
  const env: Env = {
    ASSETS: {
      fetch: async (request) => {
        requested.push(new URL(request.url).pathname);
        return asset;
      },
    },
  };
  const response = await worker.fetch(new Request(href, { headers }), env);
  return { response, requested };
}

const SECURITY_HEADERS = [
  "Content-Security-Policy",
  "Cross-Origin-Opener-Policy",
  "Permissions-Policy",
  "Referrer-Policy",
  "Strict-Transport-Security",
  "X-Content-Type-Options",
  "X-Frame-Options",
];

test("the apex serves its own pages", () => {
  assert.deepEqual(at("https://bramvanosta.com/"), { kind: "asset", pathname: "/" });
  assert.deepEqual(at("https://bramvanosta.com/404"), { kind: "asset", pathname: "/404" });
});

test("a subsite's host serves its folder of the build", () => {
  assert.deepEqual(at("https://ranch.bramvanosta.com/"), { kind: "asset", pathname: "/ranch/", subsite: "ranch" });
  assert.deepEqual(at("https://ranch.bramvanosta.com/docs/?q=1"), {
    kind: "asset",
    pathname: "/ranch/docs/",
    subsite: "ranch",
  });
});

test("a subsite's host shares the hashed build files", () => {
  assert.deepEqual(at("https://ranch.bramvanosta.com/_astro/base.css"), {
    kind: "asset",
    pathname: "/_astro/base.css",
  });
});

test("a subsite's page on the apex moves to the subsite's host", () => {
  assert.deepEqual(at("https://bramvanosta.com/ranch/docs/?q=1"), {
    kind: "redirect",
    location: "https://ranch.bramvanosta.com/docs/?q=1",
  });
  assert.deepEqual(at("https://bramvanosta.com/ranch"), {
    kind: "redirect",
    location: "https://ranch.bramvanosta.com/",
  });
  assert.deepEqual(at("https://bramvanosta.com/ranchers"), { kind: "asset", pathname: "/ranchers" });
});

test("www and unknown hosts go to the apex", () => {
  assert.deepEqual(at("https://www.bramvanosta.com/x?y"), {
    kind: "redirect",
    location: "https://bramvanosta.com/x?y",
  });
  assert.deepEqual(at("https://nope.bramvanosta.com/x"), { kind: "redirect", location: "https://bramvanosta.com/" });
});

test("production is HTTPS only, and any URL gets there in one redirect", () => {
  assert.deepEqual(at("http://bramvanosta.com/"), { kind: "redirect", location: "https://bramvanosta.com/" });
  assert.deepEqual(at("http://ranch.bramvanosta.com/docs/"), {
    kind: "redirect",
    location: "https://ranch.bramvanosta.com/docs/",
  });
  assert.deepEqual(at("http://www.bramvanosta.com/ranch/x?y"), {
    kind: "redirect",
    location: "https://ranch.bramvanosta.com/x?y",
  });
});

test("wrangler dev routes *.localhost the same way, over HTTP", () => {
  assert.deepEqual(at("http://ranch.localhost:8787/"), { kind: "asset", pathname: "/ranch/", subsite: "ranch" });
  assert.deepEqual(at("http://localhost:8787/ranch/"), { kind: "redirect", location: "http://ranch.localhost:8787/" });
  assert.deepEqual(at("http://www.localhost:8787/ranch/"), {
    kind: "redirect",
    location: "http://ranch.localhost:8787/",
  });
  assert.deepEqual(at("http://127.0.0.1:8787/ranch/"), { kind: "asset", pathname: "/ranch/" });
});

test("a page comes from the host's folder, with every security header", async () => {
  const { response, requested } = await serve("https://ranch.bramvanosta.com/");
  assert.deepEqual(requested, ["/ranch/"]);
  for (const name of SECURITY_HEADERS) assert.ok(response.headers.get(name), `${name} is missing`);
  assert.match(response.headers.get("Content-Security-Policy") ?? "", /script-src 'self'; object-src 'none'/);
  assert.equal(response.headers.get("Cache-Control"), null);
});

test("hashed build files are cached for a year, icons for a day, misses not at all", async () => {
  const hashed = await serve("https://ranch.bramvanosta.com/_astro/base.css");
  assert.equal(hashed.response.headers.get("Cache-Control"), "public, max-age=31536000, immutable");
  const icon = await serve("https://ranch.bramvanosta.com/favicon.svg");
  assert.equal(icon.response.headers.get("Cache-Control"), "public, max-age=86400, stale-while-revalidate=604800");
  const miss = await serve("https://ranch.bramvanosta.com/_astro/gone.css", new Response("", { status: 404 }));
  assert.equal(miss.response.headers.get("Cache-Control"), null);
});

test("a 404 page answers with a 404, even at its own path", async () => {
  const { response } = await serve("https://ranch.bramvanosta.com/404");
  assert.equal(response.status, 404);
});

test("a trailing-slash redirect becomes permanent and stays on the subsite's host", async () => {
  const { response } = await serve(
    "https://ranch.bramvanosta.com/docs",
    new Response(null, { status: 307, headers: { Location: "/ranch/docs/" } }),
  );
  assert.equal(response.status, 301);
  assert.equal(response.headers.get("Location"), "/docs/");
});

test("a redirect never reaches the assets, and carries the security headers", async () => {
  const { response, requested } = await serve("https://bramvanosta.com/ranch/");
  assert.equal(response.status, 301);
  assert.equal(response.headers.get("Location"), "https://ranch.bramvanosta.com/");
  assert.ok(response.headers.get("Strict-Transport-Security"));
  assert.deepEqual(requested, []);
});

const language = (href: string, headers: HeadersInit = {}) => languageRedirect(new URL(href), new Headers(headers));

test("the English home page sends a browser that prefers French to /fr/", () => {
  assert.deepEqual(language("https://bramvanosta.com/", { "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8" }), {
    location: "https://bramvanosta.com/fr/",
  });
  assert.equal(language("https://bramvanosta.com/", { "Accept-Language": "en-GB,fr;q=0.8" }), undefined);
  assert.equal(language("https://bramvanosta.com/", { "Accept-Language": "nl-NL,de" }), undefined);
  assert.equal(language("https://bramvanosta.com/"), undefined);
});

test("a language picked with the switch beats the browser's, and other pages stay as asked for", () => {
  const french = { "Accept-Language": "fr-FR" };
  assert.equal(language("https://bramvanosta.com/", { ...french, Cookie: "a=1; lang=en" }), undefined);
  assert.deepEqual(language("https://bramvanosta.com/", { Cookie: "lang=fr" }), {
    location: "https://bramvanosta.com/fr/",
  });
  assert.equal(language("https://bramvanosta.com/fr/", { Cookie: "lang=en" }), undefined);
  assert.equal(language("https://bramvanosta.com/404", french), undefined);
});

test("a link of the switch keeps the language in a cookie and drops its parameter", () => {
  const picked = language("https://bramvanosta.com/fr/?lang=fr&utm_source=x");
  assert.equal(picked?.location, "https://bramvanosta.com/fr/?utm_source=x");
  assert.match(picked?.cookie ?? "", /^lang=fr; Path=\/; Max-Age=31536000; SameSite=Lax; Secure$/);
  assert.equal(
    language("https://bramvanosta.com/?lang=en", { "Accept-Language": "fr" })?.location,
    "https://bramvanosta.com/",
  );
  assert.equal(language("https://bramvanosta.com/?lang=nl"), undefined);
});

test("the language redirect is temporary, uncached, and the home page varies with the language", async () => {
  const redirect = await serve("https://bramvanosta.com/?lang=fr");
  assert.equal(redirect.response.status, 302);
  assert.equal(redirect.response.headers.get("Location"), "https://bramvanosta.com/fr/");
  assert.match(redirect.response.headers.get("Set-Cookie") ?? "", /^lang=fr;/);
  assert.equal(redirect.response.headers.get("Cache-Control"), "no-store");
  assert.ok(redirect.response.headers.get("Strict-Transport-Security"));
  assert.deepEqual(redirect.requested, []);

  const home = await serve("https://bramvanosta.com/", undefined, { "Accept-Language": "en" });
  assert.deepEqual(home.requested, ["/"]);
  assert.equal(home.response.headers.get("Vary"), "Accept-Language, Cookie");
  const ranch = await serve("https://ranch.bramvanosta.com/", undefined, { "Accept-Language": "fr" });
  assert.deepEqual(ranch.requested, ["/ranch/"]);
  assert.equal(ranch.response.headers.get("Vary"), null);
});
