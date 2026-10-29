// Links between pages, written with the built path ("/ranch/docs/"). In production a subsite
// lives on its own host, so a link becomes a path on the same host or a full URL to the other
// one (publicHref); `astro dev` serves every site from one origin and keeps the built path.

import { publicHref } from "./sites.ts";

export function link(to: string, from: string): string {
  return import.meta.env.DEV ? to : publicHref(to, from);
}
