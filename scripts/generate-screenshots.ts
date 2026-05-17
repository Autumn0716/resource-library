import { mkdir, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

function extractFrontmatter(content: string): string {
  const match = /^---\n([\s\S]*?)\n---/.exec(content);
  if (!match) throw new Error("Missing frontmatter");
  return match[1];
}

function getFrontmatterValue(frontmatter: string, key: string): string | undefined {
  const line = frontmatter.split("\n").find((item) => item.startsWith(`${key}: `));
  return line?.slice(key.length + 2).replace(/^"|"$/g, "");
}

const MACOS_CHROME_EXECUTABLE_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

function getChromeExecutablePath(): string {
  if (process.env.PLAYWRIGHT_CHROME_EXECUTABLE_PATH) {
    return process.env.PLAYWRIGHT_CHROME_EXECUTABLE_PATH;
  }

  if (process.platform === "darwin") {
    return MACOS_CHROME_EXECUTABLE_PATH;
  }

  throw new Error("Set PLAYWRIGHT_CHROME_EXECUTABLE_PATH to a local Chrome executable path.");
}

async function readResourceTargets(root: string): Promise<Array<{ slug: string; url: string }>> {
  const dir = join(root, "src/content/resources");
  const files = (await readdir(dir)).filter((file) => file.endsWith(".md"));
  return Promise.all(
    files.map(async (file) => {
      const frontmatter = extractFrontmatter(await readFile(join(dir, file), "utf8"));
      return {
        slug: getFrontmatterValue(frontmatter, "slug") ?? file.replace(/\.md$/, ""),
        url: getFrontmatterValue(frontmatter, "url") ?? "https://example.invalid/",
      };
    }),
  );
}

function screenshotHtml(title: string, url: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;width:1200px;height:630px;display:grid;place-items:center;background:linear-gradient(135deg,#14111f,#31245c);color:white;font-family:Inter,system-ui,sans-serif}.card{width:980px;padding:64px;border:1px solid rgba(255,255,255,.18);border-radius:36px;background:rgba(255,255,255,.08);box-shadow:0 32px 120px rgba(0,0,0,.35)}p{color:#d8d1ff;font-size:28px}h1{font-size:76px;letter-spacing:-.06em;line-height:.95;margin:0 0 24px}</style></head><body><main class="card"><h1>${title}</h1><p>${url}</p></main></body></html>`;
}

export async function generateScreenshots(root: string): Promise<number> {
  const { chromium } = await import("playwright");
  const targets = await readResourceTargets(root);
  await mkdir(join(root, "public/screenshots"), { recursive: true });
  const browser = await chromium.launch({ executablePath: getChromeExecutablePath() });

  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });

    for (const target of targets) {
      await page.setContent(screenshotHtml(target.slug, target.url));
      await page.screenshot({ path: join(root, "public/screenshots", `${target.slug}.png`) });
    }
  } finally {
    await browser.close();
  }
  return targets.length;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const count = await generateScreenshots(process.cwd());
  process.stdout.write(`Generated ${count} screenshots\n`);
}
