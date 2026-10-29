import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { SUBSITES } from "./lib/sites.ts";

// One file per project, listed on the home page in `order`. A project lives either on its own
// subsite in this repository (src/pages/<subsite>/) or at an outside url.
const project = z.object({
  name: z.string(),
  summary: z.string(),
  order: z.number(),
  /** Not listed on the home page. The file is public in this repository, so add it only once the name can be. */
  draft: z.boolean().default(false),
  repo: z.url().optional(),
  stack: z.array(z.string()).default([]),
});

const projects = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/projects" }),
  schema: z.union([project.extend({ subsite: z.enum(SUBSITES) }), project.extend({ url: z.url() })]),
});

export const collections = { projects };
