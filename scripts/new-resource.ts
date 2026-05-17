import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { slugifyResourceName } from "./migrate-resources";

interface ResourceInput {
  title: string;
  url: string;
  group: string;
  type: "website" | "tool" | "library" | "template" | "article" | "course" | "github" | "community" | "dataset" | "api" | "docs" | "inspiration";
  summary: string;
  tags: string[];
  language: Array<"zh" | "en" | "multi">;
}

function getArgument(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find((argument) => argument.startsWith(prefix))?.slice(prefix.length);
}

function splitArgument(value: string | undefined): string[] {
  return value?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];
}

function readInput(): ResourceInput {
  const type = getArgument("type") ?? "tool";
  const summary = getArgument("summary") ?? "Pending resource summary.";
  return {
    title: getArgument("title") ?? "Untitled Resource",
    url: getArgument("url") ?? "https://example.invalid/",
    group: getArgument("group") ?? "tools",
    type: type as ResourceInput["type"],
    summary,
    tags: splitArgument(getArgument("tags")).length > 0 ? splitArgument(getArgument("tags")) : [type],
    language: (splitArgument(getArgument("language")).length > 0 ? splitArgument(getArgument("language")) : ["multi"]) as ResourceInput["language"],
  };
}

function formatArray(items: string[]): string {
  if (items.length === 0) return "[]";
  return `\n${items.map((item) => `  - ${JSON.stringify(item)}`).join("\n")}`;
}

export function buildResourceMarkdown(input: ResourceInput): string {
  const slug = slugifyResourceName(input.title);
  return `---
title: ${JSON.stringify(input.title)}
slug: ${JSON.stringify(slug)}
url: ${JSON.stringify(input.url)}
group: ${JSON.stringify(input.group)}
type: ${JSON.stringify(input.type)}
originalType: ${JSON.stringify(input.type)}
summary: ${JSON.stringify(input.summary)}
status: "pending"
legacyId: ${JSON.stringify(`manual-${slug}`)}
tags: ${formatArray(input.tags)}
audience: []
useCases: ${formatArray([input.summary])}
alternatives: []
pricing: "unknown"
language: ${formatArray(input.language)}
difficulty: "unknown"
featured: false
addedAt: "2026-05-17"
lastCheckedAt: "2026-05-17"
favicon: ${JSON.stringify(`/favicons/${slug}.png`)}
screenshot: ${JSON.stringify(`/screenshots/${slug}.png`)}
---

${input.summary}
`;
}

function main(): void {
  const input = readInput();
  const slug = slugifyResourceName(input.title);
  const target = join(process.cwd(), "src/content/resources", `${slug}.md`);

  if (existsSync(target)) {
    throw new Error(`Resource already exists: ${target}`);
  }

  writeFileSync(target, buildResourceMarkdown(input));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
