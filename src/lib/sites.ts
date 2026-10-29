// The sites this repository serves, shared by the Astro pages and the Worker.
// The apex is the personal site; each subsite is a project's own site, built under
// src/pages/<subsite>/ and served on <subsite>.bramvanosta.com. Adding one: see the README.

export const ROOT_DOMAIN = "bramvanosta.com";

export const SUBSITES = ["ranch"] as const;

export type Subsite = (typeof SUBSITES)[number];

export function isSubsite(value: string): value is Subsite {
  return (SUBSITES as readonly string[]).includes(value);
}

/** The subsite a built path belongs to: "/ranch/docs/" → "ranch", "/" → undefined. */
export function subsiteOfPath(pathname: string): Subsite | undefined {
  const first = pathname.split("/")[1] ?? "";
  return isSubsite(first) ? first : undefined;
}

/** The public URL of a built path: "/ranch/docs/" → https://ranch.bramvanosta.com/docs/. */
export function publicUrl(pathname: string): URL {
  const subsite = subsiteOfPath(pathname);
  if (!subsite) return new URL(pathname, `https://${ROOT_DOMAIN}`);
  return new URL(pathname.slice(subsite.length + 1) || "/", `https://${subsite}.${ROOT_DOMAIN}`);
}

/** A link from one built page to another, once published: a path on the same host, a full URL across hosts. */
export function publicHref(to: string, from: string): string {
  const target = publicUrl(to);
  if (target.origin !== publicUrl(from).origin) return target.href;
  return `${target.pathname}${target.search}${target.hash}`;
}
