import { z } from "astro/zod";
import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => !Number.isNaN(Date.parse(value)), {
  message: "Expected a valid ISO date",
});

const resourceSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  url: z.string().pipe(z.url()),
  group: z.string().min(1),
  type: z.enum([
    "website",
    "tool",
    "library",
    "template",
    "article",
    "course",
    "github",
    "community",
    "dataset",
    "api",
    "docs",
    "inspiration",
  ]),
  originalType: z.string().min(1),
  summary: z.string().min(1),
  status: z.enum(["active", "pending", "deprecated", "broken"]),
  legacyId: z.string().optional(),
  tags: z.array(z.string().min(1)).default([]),
  audience: z.array(z.string().min(1)).default([]),
  useCases: z.array(z.string().min(1)).default([]),
  alternatives: z.array(z.string().min(1)).default([]),
  pricing: z.enum(["free", "freemium", "paid", "open-source", "unknown"]).default("unknown"),
  language: z.array(z.enum(["zh", "en", "multi"])).default(["multi"]),
  difficulty: z.enum(["beginner", "intermediate", "advanced", "unknown"]).default("unknown"),
  featured: z.boolean().default(false),
  priority: z.number().int().optional(),
  addedAt: dateSchema,
  updatedAt: dateSchema.optional(),
  lastCheckedAt: dateSchema,
  favicon: z.string().min(1),
  screenshot: z.string().min(1),
});

const groupSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().optional(),
  order: z.number().int().nonnegative().default(999),
  featured: z.boolean().default(false),
  legacyTitle: z.string().optional(),
});

const resources = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/resources" }),
  schema: resourceSchema,
});

const groups = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/groups" }),
  schema: groupSchema,
});

export const collections = { resources, groups };
