// Who the sites are by, and where to reach him. Public facts only: this repository is public.
import { publicUrl } from "./sites.ts";

export const PROFILE = {
  name: "Bram van Osta",
  role: "Freelance full-stack developer",
  location: "South-west France",
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
