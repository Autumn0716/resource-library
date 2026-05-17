import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

interface LinkCheckResult {
  resource: string;
  url: string;
  status: "ok" | "broken" | "timeout" | "skipped";
  statusCode?: number;
  finalUrl?: string;
  error?: string;
}

interface BrokenLinksReport {
  checkedAt: string;
  results: LinkCheckResult[];
}

export function classifyLinkCheck(resource: string, url: string, statusCode: number, finalUrl = url): LinkCheckResult {
  if (statusCode === 401 || statusCode === 403 || statusCode === 429) {
    return { resource, url, status: "ok", statusCode, finalUrl };
  }

  return {
    resource,
    url,
    status: statusCode >= 200 && statusCode < 400 ? "ok" : "broken",
    statusCode,
    finalUrl,
  };
}

function extractFrontmatter(content: string): string {
  const match = /^---\n([\s\S]*?)\n---/.exec(content);
  if (!match) throw new Error("Missing frontmatter");
  return match[1];
}

function getFrontmatterValue(frontmatter: string, key: string): string | undefined {
  const line = frontmatter.split("\n").find((item) => item.startsWith(`${key}: `));
  return line?.slice(key.length + 2).replace(/^"|"$/g, "");
}

async function listResourceFiles(root: string): Promise<string[]> {
  const dir = join(root, "src/content/resources");
  const entries = await readdir(dir, { withFileTypes: true });
  return entries.filter((entry) => entry.isFile() && entry.name.endsWith(".md")).map((entry) => join(dir, entry.name));
}

async function checkUrl(resource: string, url: string, timeout = 8000): Promise<LinkCheckResult> {
  if (url.includes("example.invalid")) return { resource, url, status: "skipped" };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { method: "HEAD", redirect: "follow", signal: controller.signal });
    clearTimeout(timer);
    if (response.status === 405) {
      const fallback = await fetch(url, { method: "GET", redirect: "follow", signal: controller.signal });
      return classifyLinkCheck(resource, url, fallback.status, fallback.url);
    }
    return classifyLinkCheck(resource, url, response.status, response.url);
  } catch (error) {
    clearTimeout(timer);
    if (error instanceof DOMException && error.name === "AbortError") return { resource, url, status: "timeout" };
    return { resource, url, status: "broken", error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function checkLinks(root: string): Promise<BrokenLinksReport> {
  const files = await listResourceFiles(root);
  const results: LinkCheckResult[] = [];

  for (const file of files) {
    const frontmatter = extractFrontmatter(await readFile(file, "utf8"));
    const resource = getFrontmatterValue(frontmatter, "slug") ?? file;
    const url = getFrontmatterValue(frontmatter, "url");
    if (url) results.push(await checkUrl(resource, url));
  }

  return { checkedAt: new Date().toISOString(), results };
}

async function main(): Promise<void> {
  const root = process.cwd();
  const report = await checkLinks(root);
  await writeFile(join(root, "broken-links-report.json"), `${JSON.stringify(report, null, 2)}\n`);
  const broken = report.results.filter((result) => result.status === "broken" || result.status === "timeout");
  if (broken.length > 0) {
    throw new Error(`${broken.length} broken links found. See broken-links-report.json.`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
