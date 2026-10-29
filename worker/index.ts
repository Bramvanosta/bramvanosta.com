// Serves every site from the one build in dist/: the apex as built, and each subsite,
// <subsite>.bramvanosta.com, from dist/<subsite>/. Runs before the static assets
// (run_worker_first) because the same path means a different file per host.

import { isSubsite, ROOT_DOMAIN, subsiteOfPath, type Subsite } from "../src/lib/sites.ts";

export interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

export type Route = { kind: "redirect"; location: string } | { kind: "asset"; pathname: string; subsite?: Subsite };

/** Built files every host shares (Astro's hashed CSS, JS, fonts and images). */
const SHARED_PREFIX = "/_astro/";

/** Files with a stable name that change rarely: cached for a day, refreshed in the background. */
const ICONS = /^\/(?:[^/]+\/)?(?:favicon\.(?:ico|svg)|apple-touch-icon\.png|og\.png)$/;

/** A built 404 page, which must answer with a 404 even when asked for by its own path. */
const NOT_FOUND_PAGE = /^\/(?:[^/]+\/)?404(?:\.html)?$/;

/** The domain a host belongs to: production, or *.localhost under `wrangler dev`. */
function baseDomain(hostname: string): string | undefined {
  for (const base of [ROOT_DOMAIN, "localhost"]) {
    if (hostname === base || hostname.endsWith(`.${base}`)) return base;
  }
  return undefined;
}

/**
 * Where a request is served from, or the one address it redirects to: production is
 * HTTPS only, `www.` and unknown subdomains go to the apex, and a subsite's pages on
 * the apex go to the subsite's host. One redirect at most, whatever the URL.
 */
export function route(url: URL): Route {
  const base = baseDomain(url.hostname);
  if (!base) return { kind: "asset", pathname: url.pathname };

  const label = url.hostname === base ? "" : url.hostname.slice(0, -(base.length + 1));
  let subsite = isSubsite(label) ? label : undefined;
  let pathname = label && !subsite && label !== "www" ? "/" : url.pathname;
  const fromPath = subsite ? undefined : subsiteOfPath(pathname);
  if (fromPath) {
    subsite = fromPath;
    pathname = pathname.slice(fromPath.length + 1) || "/";
  }

  const target = new URL(url);
  if (base === ROOT_DOMAIN) target.protocol = "https:";
  target.hostname = subsite ? `${subsite}.${base}` : base;
  target.pathname = pathname;
  if (target.href !== url.href) return { kind: "redirect", location: target.href };

  if (!subsite || pathname.startsWith(SHARED_PREFIX)) return { kind: "asset", pathname };
  return { kind: "asset", pathname: `/${subsite}${pathname}`, subsite };
}

const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
    "require-trusted-types-for 'script'",
    "trusted-types 'none'",
  ].join("; "),
  "Cross-Origin-Opener-Policy": "same-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

function withSecurityHeaders(response: Response): Response {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) response.headers.set(name, value);
  return response;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const target = route(url);
    if (target.kind === "redirect") {
      return withSecurityHeaders(new Response(null, { status: 301, headers: { Location: target.location } }));
    }

    const assetUrl = new URL(url);
    assetUrl.pathname = target.pathname;
    const asset = await env.ASSETS.fetch(new Request(assetUrl, request));

    const status = NOT_FOUND_PAGE.test(target.pathname) && asset.ok ? 404 : asset.status;
    const response = withSecurityHeaders(new Response(asset.body, { status, headers: asset.headers }));
    if (asset.ok && target.pathname.startsWith(SHARED_PREFIX)) {
      response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
    } else if (asset.ok && ICONS.test(target.pathname)) {
      response.headers.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
    }

    // The assets layer adds or drops trailing slashes with a temporary redirect to the built
    // path: make it permanent, at the path the visitor sees on this host.
    const location = response.headers.get("Location");
    if (location && asset.status === 307) {
      const prefix = target.subsite ? `/${target.subsite}` : "";
      if (prefix && location.startsWith(`${prefix}/`)) response.headers.set("Location", location.slice(prefix.length));
      return new Response(null, { status: 301, headers: response.headers });
    }
    return response;
  },
};
