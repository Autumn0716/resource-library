#!/usr/bin/env bun
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const OUT_DIR = join(ROOT, "public", "favicons");

interface ResourceIconTarget {
  slug: string;
  title: string;
  url: string;
  status: "active" | "pending" | "deprecated" | "broken";
  legacyId?: string;
}

interface Options {
  force: boolean;
  only?: string;
}

function parseArgs(): Options {
  const args = process.argv.slice(2);
  let force = false;
  let only: string | undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--force") force = true;
    else if (args[i] === "--only") only = args[++i];
  }
  return { force, only };
}

function getFrontmatterValue(frontmatter: string, key: string): string | undefined {
  const line = frontmatter.split("\n").find((item) => item.startsWith(`${key}: `));
  return line?.slice(key.length + 2).replace(/^"|"$/g, "");
}

function extractFrontmatter(content: string): string {
  const match = /^---\n([\s\S]*?)\n---/.exec(content);
  if (!match) throw new Error("Missing frontmatter");
  return match[1];
}

async function readTargets(): Promise<ResourceIconTarget[]> {
  const dir = join(ROOT, "src/content/resources");
  const files = (await readdir(dir)).filter((file) => file.endsWith(".md"));
  const targets = await Promise.all(
    files.map(async (file) => {
      const frontmatter = extractFrontmatter(await readFile(join(dir, file), "utf8"));
      return {
        slug: getFrontmatterValue(frontmatter, "slug") ?? file.replace(/\.md$/, ""),
        title: getFrontmatterValue(frontmatter, "title") ?? file.replace(/\.md$/, ""),
        url: getFrontmatterValue(frontmatter, "url") ?? "https://example.invalid/",
        status: (getFrontmatterValue(frontmatter, "status") ?? "pending") as ResourceIconTarget["status"],
        legacyId: getFrontmatterValue(frontmatter, "legacyId"),
      };
    }),
  );
  return targets;
}

function hostOf(url: string): string | null {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

function escapeXmlText(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&apos;";
    }
  });
}

function letterAvatar(name: string): string {
  const glyph = escapeXmlText(name.trim().charAt(0).toUpperCase() || "?");
  let h = 0;
  for (const character of name) h = (h * 31 + character.charCodeAt(0)) & 0xffffff;
  const hue = 260 + (h % 40);
  const bg = `hsl(${hue}, 55%, 38%)`;
  const fg = `hsl(${hue}, 85%, 92%)`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="${bg}"/><text x="16" y="21" text-anchor="middle" font-family="Geist, Inter, system-ui, sans-serif" font-size="16" font-weight="600" fill="${fg}">${glyph}</text></svg>`;
}

async function fetchBinary(url: string, timeout = 8000): Promise<Buffer | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36",
      },
    });
    clearTimeout(timer);
    if (!response.ok) return null;
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("image/") && !contentType.includes("application/octet-stream")) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length < 100) return null;
    return buffer;
  } catch {
    return null;
  }
}

async function tryFetch(host: string): Promise<{ buffer: Buffer; ext: "png" | "ico" } | null> {
  const candidates: Array<{ url: string; ext: "png" | "ico" }> = [
    { url: `https://icon.horse/icon/${host}`, ext: "png" },
    { url: `https://www.google.com/s2/favicons?domain=${host}&sz=64`, ext: "png" },
    { url: `https://${host}/favicon.ico`, ext: "ico" },
  ];
  for (const { url, ext } of candidates) {
    const buffer = await fetchBinary(url);
    if (buffer) return { buffer, ext };
  }
  return null;
}

export function findLegacyIconSource(root: string, legacyId: string | undefined): string | null {
  if (!legacyId) return null;
  for (const extension of ["png", "ico", "svg"]) {
    const candidate = join(root, "public", "icons", `${legacyId}.${extension}`);
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

async function processOne(item: ResourceIconTarget, opts: Options): Promise<"png" | "ico" | "svg" | "svg-fallback" | "skip"> {
  const host = hostOf(item.url);
  const pngPath = join(OUT_DIR, `${item.slug}.png`);
  const icoPath = join(OUT_DIR, `${item.slug}.ico`);
  const svgPath = join(OUT_DIR, `${item.slug}.svg`);

  if (!opts.force && (existsSync(pngPath) || existsSync(icoPath) || existsSync(svgPath))) return "skip";

  const legacyIcon = findLegacyIconSource(ROOT, item.legacyId);
  if (legacyIcon) {
    const extension = legacyIcon.split(".").pop() as "png" | "ico" | "svg";
    copyFileSync(legacyIcon, join(OUT_DIR, `${item.slug}.${extension}`));
    return extension;
  }

  if (!host || item.status === "pending" || item.url.includes("example.invalid")) {
    writeFileSync(svgPath, letterAvatar(item.title));
    return "svg";
  }

  const fetched = await tryFetch(host);
  if (fetched) {
    writeFileSync(fetched.ext === "ico" ? icoPath : pngPath, fetched.buffer);
    return fetched.ext;
  }

  writeFileSync(svgPath, letterAvatar(item.title));
  return "svg-fallback";
}

async function run(): Promise<void> {
  const opts = parseArgs();
  mkdirSync(OUT_DIR, { recursive: true });

  const allTargets = await readTargets();
  const targets = opts.only ? allTargets.filter((target) => target.slug === opts.only) : allTargets;
  if (opts.only && targets.length === 0) throw new Error(`No resource with slug "${opts.only}"`);

  const results = { png: 0, ico: 0, svg: 0, "svg-fallback": 0, skip: 0 };
  for (const target of targets) {
    const status = await processOne(target, opts);
    results[status]++;
  }

  process.stdout.write(`${JSON.stringify(results)}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await run();
}
