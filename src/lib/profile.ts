// Who makes the sites, and how to get in touch. Public facts only: this repository is public.
// The role and the location are words, translated with the rest of the home page in home-copy.ts.
import { publicUrl } from "./sites.ts";

export const PROFILE = {
  name: "Bram van Osta",
  email: "pro@bramvanosta.com",
  github: "https://github.com/Bramvanosta",
  linkedin: "https://www.linkedin.com/in/bramvanosta/",
} as const;

/** The schema.org Person, with the id that the structured data of every site points to. */
export const PERSON = {
  "@type": "Person",
  "@id": `${publicUrl("/").href}#person`,
  name: PROFILE.name,
  url: publicUrl("/").href,
} as const;
