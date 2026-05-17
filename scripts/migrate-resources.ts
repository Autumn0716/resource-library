import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

interface LegacyResource {
  id: string;
  name: string;
  url: string;
  group: string;
  type: string;
  use: string;
  status: "curated" | "pending";
}

interface LegacyGroup {
  id: string;
  title: string;
  description: string;
}

interface MigratedGroup {
  slug: string;
  data: {
    name: string;
    slug: string;
    description: string;
    icon?: string;
    order: number;
    featured: boolean;
    legacyTitle: string;
  };
  body: string;
}

interface MigratedResource {
  slug: string;
  data: {
    title: string;
    slug: string;
    url: string;
    group: string;
    type: "website" | "tool" | "library" | "template" | "article" | "course" | "github" | "community" | "dataset" | "api" | "docs" | "inspiration";
    originalType: string;
    summary: string;
    status: "active" | "pending" | "deprecated" | "broken";
    legacyId: string;
    tags: string[];
    audience: string[];
    useCases: string[];
    alternatives: string[];
    pricing: "free" | "freemium" | "paid" | "open-source" | "unknown";
    language: Array<"zh" | "en" | "multi">;
    difficulty: "beginner" | "intermediate" | "advanced" | "unknown";
    featured: boolean;
    priority?: number;
    addedAt: string;
    updatedAt?: string;
    lastCheckedAt: string;
    favicon: string;
    screenshot: string;
  };
  body: string;
}

interface MigrationReport {
  duplicateSlugs: string[];
  duplicateUrls: string[];
  missingGroups: Array<{ resourceId: string; group: string }>;
  invalidUrls: string[];
  unmappedTypes: string[];
  emptySummaries: string[];
}

export interface MigrationPlan {
  groups: MigratedGroup[];
  resources: MigratedResource[];
  report: MigrationReport;
}

export function slugifyResourceName(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "resource";
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function uniqueSlug(baseSlug: string, seenSlugs: Map<string, number>): string {
  const seen = seenSlugs.get(baseSlug) ?? 0;
  seenSlugs.set(baseSlug, seen + 1);
  return seen === 0 ? baseSlug : `${baseSlug}-${seen + 1}`;
}

function detectLanguage(text: string): Array<"zh" | "en" | "multi"> {
  const hasChinese = /[㐀-鿿]/.test(text);
  const hasLatin = /[a-z]/i.test(text);
  if (hasChinese && hasLatin) return ["multi"];
  if (hasChinese) return ["zh"];
  if (hasLatin) return ["en"];
  return ["multi"];
}

function mapStatus(status: LegacyResource["status"]): "active" | "pending" {
  return status === "curated" ? "active" : "pending";
}

function mapType(type: string): "website" | "tool" | "library" | "template" | "article" | "course" | "github" | "community" | "dataset" | "api" | "docs" | "inspiration" {
  if (/网站|灵感|审美|UX|UI|设计/.test(type)) return "inspiration";
  if (/组件|库|框架|动效|动画|图标|可视化|状态/.test(type)) return "library";
  if (/文档|知识库|指南|规范|速查/.test(type)) return "docs";
  if (/课程|学习/.test(type)) return "course";
  if (/GitHub|开源/.test(type)) return "github";
  if (/API|接口/.test(type)) return "api";
  if (/社区/.test(type)) return "community";
  if (/模板|Template/i.test(type)) return "template";
  if (/文章|写作|学术|科研/.test(type)) return "article";
  return "tool";
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return `\n${value.map((item) => `  - ${JSON.stringify(item)}`).join("\n")}`;
  }

  return JSON.stringify(value);
}

function toMarkdownFile(entry: { data: Record<string, unknown>; body: string }): string {
  const frontmatter = Object.entries(entry.data)
    .map(([key, value]) => `${key}: ${formatValue(value)}`)
    .join("\n");

  return `---\n${frontmatter}\n---\n\n${entry.body}\n`;
}

export function buildMigrationPlan(resources: LegacyResource[], groups: LegacyGroup[]): MigrationPlan {
  const groupByTitle = new Map(groups.map((group) => [group.title, group.id]));
  const seenSlugs = new Map<string, number>();
  const seenUrls = new Map<string, string>();
  const duplicateSlugs: string[] = [];
  const duplicateUrls: string[] = [];
  const missingGroups: Array<{ resourceId: string; group: string }> = [];
  const invalidUrls: string[] = [];
  const emptySummaries: string[] = [];
  const unmappedTypes = new Set<string>();

  const migratedGroups = groups.map((group, index) => ({
    slug: group.id,
    data: {
      name: group.title,
      slug: group.id,
      description: group.description,
      order: index,
      featured: index < 3,
      legacyTitle: group.title,
    },
    body: group.description,
  }));

  const migratedResources = resources.map((resource) => {
    const baseSlug = slugifyResourceName(resource.name);
    const slug = uniqueSlug(baseSlug, seenSlugs);
    if (slug !== baseSlug) duplicateSlugs.push(baseSlug);

    if (!isValidUrl(resource.url)) invalidUrls.push(resource.id);

    const previousUrlOwner = seenUrls.get(resource.url);
    if (previousUrlOwner) duplicateUrls.push(`${previousUrlOwner},${resource.id}`);
    else seenUrls.set(resource.url, resource.id);

    const groupSlug = groupByTitle.get(resource.group) ?? slugifyResourceName(resource.group);
    if (!groupByTitle.has(resource.group)) missingGroups.push({ resourceId: resource.id, group: resource.group });

    const summary = resource.use.trim();
    if (!summary) emptySummaries.push(resource.id);

    const type = mapType(resource.type);
    if (type === "tool" && !/工具|tool/i.test(resource.type)) unmappedTypes.add(resource.type);

    return {
      slug,
      data: {
        title: resource.name,
        slug,
        url: isValidUrl(resource.url) ? resource.url : "https://example.invalid/",
        group: groupSlug,
        type,
        originalType: resource.type,
        summary,
        status: mapStatus(resource.status),
        legacyId: resource.id,
        tags: [...new Set([resource.type, resource.group].filter(Boolean))],
        audience: [],
        useCases: summary ? [summary] : [],
        alternatives: [],
        pricing: "unknown" as const,
        language: detectLanguage(`${resource.name} ${summary}`),
        difficulty: "unknown" as const,
        featured: false,
        addedAt: "2026-05-17",
        lastCheckedAt: "2026-05-17",
        favicon: `/favicons/${slug}.png`,
        screenshot: `/screenshots/${slug}.png`,
      },
      body: summary || `${resource.name} pending resource notes.`,
    };
  });

  return {
    groups: migratedGroups,
    resources: migratedResources,
    report: {
      duplicateSlugs,
      duplicateUrls,
      missingGroups,
      invalidUrls,
      unmappedTypes: [...unmappedTypes],
      emptySummaries,
    },
  };
}

async function readJsonFile<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, "utf8")) as T;
}

function writeEntries(baseDir: string, entries: Array<{ slug: string; data: Record<string, unknown>; body: string }>): void {
  if (!existsSync(baseDir)) mkdirSync(baseDir, { recursive: true });

  for (const entry of entries) {
    writeFileSync(join(baseDir, `${entry.slug}.md`), toMarkdownFile(entry));
  }
}

async function main(): Promise<void> {
  const root = process.cwd();
  const resources = await readJsonFile<LegacyResource[]>(join(root, "src/data/resources.json"));
  const groups = await readJsonFile<LegacyGroup[]>(join(root, "src/data/groups.json"));
  const plan = buildMigrationPlan(resources, groups);

  writeEntries(join(root, "src/content/groups"), plan.groups);
  writeEntries(join(root, "src/content/resources"), plan.resources);
  writeFileSync(join(root, "migration-report.json"), `${JSON.stringify(plan.report, null, 2)}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
