#!/usr/bin/env bun
/**
 * Fetch favicons for every resource, cache into public/icons/<id>.png
 *
 * Source priority:
 *   1. icon.horse (clean high-quality icons, no CORS/rate limits)
 *   2. Google s2/favicons (fallback, always reachable)
 *   3. <host>/favicon.ico direct (last-ditch)
 *   4. Generate a letter SVG tile (never fails)
 *
 * Re-run anytime; existing files are skipped unless --force.
 * Single-id: bun scripts/fetch-favicons.ts --only <id>
 */

import { resources, type Resource } from "../src/data/resources";
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const OUT_DIR = join(ROOT, "public", "icons");

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

function hostOf(url: string): string | null {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

function letterAvatar(name: string): string {
  // Grab first meaningful glyph (skip spaces)
  const glyph = name.trim().charAt(0).toUpperCase() || "?";
  // Deterministic purple tone from name
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffff;
  const hue = 260 + (h % 40); // 260–299: purples
  const bg = `hsl(${hue}, 55%, 38%)`;
  const fg = `hsl(${hue}, 85%, 92%)`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="${bg}"/><text x="16" y="21" text-anchor="middle" font-family="Geist, Inter, system-ui, sans-serif" font-size="16" font-weight="600" fill="${fg}">${glyph}</text></svg>`;
}

async function fetchBinary(url: string, timeout = 8000): Promise<Buffer | null> {
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), timeout);
    const resp = await fetch(url, {
      signal: ctl.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36",
      },
    });
    clearTimeout(timer);
    if (!resp.ok) return null;
    const contentType = resp.headers.get("content-type") ?? "";
    if (
      !contentType.includes("image/") &&
      !contentType.includes("application/octet-stream")
    ) {
      return null;
    }
    const buf = Buffer.from(await resp.arrayBuffer());
    // Reject obviously broken (1x1 transparent tracker, < 100 bytes)
    if (buf.length < 100) return null;
    return buf;
  } catch {
    return null;
  }
}

async function tryFetch(host: string): Promise<{ buf: Buffer; ext: "png" | "ico" } | null> {
  const candidates: Array<{ url: string; ext: "png" | "ico" }> = [
    { url: `https://icon.horse/icon/${host}`, ext: "png" },
    { url: `https://www.google.com/s2/favicons?domain=${host}&sz=64`, ext: "png" },
    { url: `https://${host}/favicon.ico`, ext: "ico" },
  ];
  for (const { url, ext } of candidates) {
    const buf = await fetchBinary(url);
    if (buf) return { buf, ext };
  }
  return null;
}

async function processOne(item: Resource, opts: Options) {
  const host = hostOf(item.url);
  const pngPath = join(OUT_DIR, `${item.id}.png`);
  const icoPath = join(OUT_DIR, `${item.id}.ico`);
  const svgPath = join(OUT_DIR, `${item.id}.svg`);

  if (
    !opts.force &&
    (existsSync(pngPath) || existsSync(icoPath) || existsSync(svgPath))
  ) {
    return { id: item.id, status: "skip" };
  }

  // Pending items or bad URLs → letter avatar
  if (!host || item.status === "pending") {
    writeFileSync(svgPath, letterAvatar(item.name));
    return { id: item.id, status: "svg" };
  }

  const fetched = await tryFetch(host);
  if (fetched) {
    const target = fetched.ext === "ico" ? icoPath : pngPath;
    writeFileSync(target, fetched.buf);
    return { id: item.id, status: fetched.ext };
  }

  // All network sources failed → letter fallback
  writeFileSync(svgPath, letterAvatar(item.name));
  return { id: item.id, status: "svg-fallback" };
}

async function run() {
  const opts = parseArgs();
  mkdirSync(OUT_DIR, { recursive: true });

  const targets = opts.only
    ? resources.filter((r) => r.id === opts.only)
    : resources;
  if (opts.only && targets.length === 0) {
    console.error(`No resource with id "${opts.only}"`);
    process.exit(1);
  }

  console.log(`Fetching favicons for ${targets.length} resources → ${OUT_DIR}`);
  const results = { png: 0, ico: 0, svg: 0, "svg-fallback": 0, skip: 0 };

  // Limited concurrency
  const concurrency = 6;
  let idx = 0;
  async function worker() {
    while (idx < targets.length) {
      const i = idx++;
      const item = targets[i];
      const r = await processOne(item, opts);
      results[r.status as keyof typeof results]++;
      if (r.status !== "skip") {
        console.log(`  [${i + 1}/${targets.length}] ${r.status.padEnd(12)} ${item.id}`);
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));

  console.log();
  console.log("Summary:");
  for (const [k, v] of Object.entries(results)) console.log(`  ${k}: ${v}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
