import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

function extractFrontmatter(content: string): string {
  const match = /^---\n([\s\S]*?)\n---/.exec(content);
  if (!match) throw new Error("Missing frontmatter");
  return match[1];
}

function getMultilineValue(frontmatter: string, key: string): string | undefined {
  const lines = frontmatter.split("\n");
  const index = lines.findIndex((line) => line.startsWith(`${key}:`));
  if (index === -1) return undefined;
  const value = lines[index].slice(key.length + 1).trimStart();
  if (value !== "") return value.replace(/^"|"$/g, "");

  const next = lines[index + 1];
  return next?.trim().startsWith("-") ? "[]" : undefined;
}

async function listMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return listMarkdownFiles(path);
      return entry.name.endsWith(".md") || entry.name.endsWith(".mdx") ? [path] : [];
    }),
  );

  return files.flat();
}

function hasArrayItems(frontmatter: string, key: string): boolean {
  const lines = frontmatter.split("\n");
  const index = lines.findIndex((line) => line.trim() === `${key}:` || line.startsWith(`${key}: `));
  if (index === -1) return false;
  const inline = lines[index].slice(key.length + 1).trim();
  if (inline === "[]") return false;
  if (inline !== "") return true;

  for (const line of lines.slice(index + 1)) {
    if (line.startsWith("  - ")) return true;
    if (/^[A-Za-z][A-Za-z0-9]*:/.test(line)) return false;
  }

  return false;
}

function isValidIsoDate(value: string | undefined): boolean {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return !Number.isNaN(Date.parse(value));
}

export interface ValidationResult {
  valid: boolean;
  failures: string[];
}

export async function validateContent(root: string): Promise<ValidationResult> {
  const resourceFiles = await listMarkdownFiles(join(root, "src/content/resources"));
  const groupFiles = await listMarkdownFiles(join(root, "src/content/groups"));
  const groupSlugs = new Set(groupFiles.map((file) => file.split("/").pop()?.replace(/\.mdx?$/, "") ?? ""));
  const failures: string[] = [];
  const urls = new Map<string, string>();

  for (const file of resourceFiles) {
    const content = await readFile(file, "utf8");
    const frontmatter = extractFrontmatter(content);
    const fileSlug = file.split("/").pop()?.replace(/\.mdx?$/, "") ?? "";
    const slug = getMultilineValue(frontmatter, "slug") ?? fileSlug;
    const title = getMultilineValue(frontmatter, "title");
    const url = getMultilineValue(frontmatter, "url");
    const group = getMultilineValue(frontmatter, "group");
    const hasTags = hasArrayItems(frontmatter, "tags");
    const summary = getMultilineValue(frontmatter, "summary") ?? "";
    const status = getMultilineValue(frontmatter, "status") ?? "";
    const legacyId = getMultilineValue(frontmatter, "legacyId");
    const addedAt = getMultilineValue(frontmatter, "addedAt");
    const updatedAt = getMultilineValue(frontmatter, "updatedAt");
    const lastCheckedAt = getMultilineValue(frontmatter, "lastCheckedAt");

    if (fileSlug !== slug) failures.push(`${file}: filename must match slug ${slug}`);
    if (!title) failures.push(`${file}: missing title`);
    if (!url) failures.push(`${file}: missing url`);
    if (url) {
      try {
        new URL(url);
      } catch {
        failures.push(`${file}: invalid url`);
      }
      const previous = urls.get(url);
      if (url.includes("example.invalid") || legacyId) {
        urls.set(`${url}:${fileSlug}`, file);
      } else if (previous && previous !== file) {
        failures.push(`${file}: duplicate url ${url} (also in ${previous})`);
      } else {
        urls.set(url, file);
      }
    }
    if (group && !groupSlugs.has(group)) failures.push(`${file}: unknown group ${group}`);
    if (!hasTags) failures.push(`${file}: tags must not be empty`);
    if (summary.trim().length < 10 && status !== "active") failures.push(`${file}: summary is too short`);
    if (!legacyId) failures.push(`${file}: missing legacyId`);
    if (!isValidIsoDate(addedAt)) failures.push(`${file}: invalid addedAt date`);
    if (updatedAt && !isValidIsoDate(updatedAt)) failures.push(`${file}: invalid updatedAt date`);
    if (!isValidIsoDate(lastCheckedAt)) failures.push(`${file}: invalid lastCheckedAt date`);
    if (status === "deprecated" || status === "broken") {
      const body = content.split("---").slice(2).join("---").trim();
      if (body.length < 10) failures.push(`${file}: deprecated/broken entries need explanation`);
    }
  }

  return { valid: failures.length === 0, failures };
}

async function main(): Promise<void> {
  const result = await validateContent(process.cwd());
  if (!result.valid) {
    throw new Error(result.failures.join("\n"));
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
