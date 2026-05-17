import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, test } from "bun:test";
import { buildResourceMarkdown } from "../scripts/new-resource";
import { classifyLinkCheck } from "../scripts/check-links";
import { validateContent } from "../scripts/validate-content";

async function writeContent(root: string, path: string, content: string): Promise<void> {
  await writeFile(join(root, path), content, "utf8");
}

describe("maintenance scripts", () => {
  test("builds new resource markdown with normalized frontmatter", async () => {
    const markdown = buildResourceMarkdown({
      title: "Raycast",
      url: "https://raycast.com",
      group: "ai-tools",
      type: "tool",
      summary: "Launcher for focused workflows.",
      tags: ["productivity"],
      language: ["en"],
    });

    expect(markdown).toContain('slug: "raycast"');
    expect(markdown).toContain('status: "pending"');
    expect(markdown).toContain('favicon: "/favicons/raycast.png"');
    expect(markdown).toContain('screenshot: "/screenshots/raycast.png"');
  });

  test("treats bot protection and rate limits as reachable link checks", () => {
    expect(classifyLinkCheck("blocked", "https://example.com", 403)).toMatchObject({ status: "ok", statusCode: 403 });
    expect(classifyLinkCheck("limited", "https://example.com", 429)).toMatchObject({ status: "ok", statusCode: 429 });
  });

  test("records redirect destinations in link-check reports", () => {
    expect(classifyLinkCheck("redirected", "https://example.com", 200, "https://www.example.com")).toMatchObject({
      status: "ok",
      finalUrl: "https://www.example.com",
    });
  });

  test("reports duplicate URLs, filename mismatches, unknown groups, and thin metadata", async () => {
    const root = await mkdtemp(join(tmpdir(), "resource-library-"));
    await Bun.$`mkdir -p ${join(root, "src/content/resources")} ${join(root, "src/content/groups")}`;
    await writeContent(
      root,
      "src/content/groups/known.md",
      `---\nname: "Known"\nslug: "known"\ndescription: "Known group"\norder: 0\nfeatured: true\n---\nKnown group\n`,
    );
    await writeContent(
      root,
      "src/content/resources/alpha.md",
      `---\ntitle: "Alpha"\nslug: "wrong"\nurl: "https://example.com"\ngroup: "missing"\ntype: "tool"\noriginalType: "工具"\nsummary: "short"\nstatus: "pending"\ntags: []\naudience: []\nuseCases: []\nalternatives: []\npricing: "unknown"\nlanguage:\n  - "en"\ndifficulty: "unknown"\nfeatured: false\naddedAt: "not-a-date"\nupdatedAt: "still-not-a-date"\nlastCheckedAt: "bad-date"\nfavicon: "/favicons/wrong.png"\nscreenshot: "/screenshots/wrong.png"\n---\nshort\n`,
    );
    await writeContent(
      root,
      "src/content/resources/beta.md",
      `---\ntitle: "Beta"\nslug: "beta"\nurl: "https://example.com"\ngroup: "known"\ntype: "tool"\noriginalType: "工具"\nsummary: "This summary is long enough."\nstatus: "active"\ntags:\n  - "工具"\naudience: []\nuseCases:\n  - "This summary is long enough."\nalternatives: []\npricing: "unknown"\nlanguage:\n  - "en"\ndifficulty: "unknown"\nfeatured: false\naddedAt: "2026-05-17"\nlastCheckedAt: "2026-05-17"\nfavicon: "/favicons/beta.png"\nscreenshot: "/screenshots/beta.png"\n---\nThis summary is long enough.\n`,
    );

    const result = await validateContent(root);

    expect(result.valid).toBe(false);
    expect(result.failures).toEqual(
      expect.arrayContaining([
        expect.stringContaining("filename must match slug"),
        expect.stringContaining("unknown group missing"),
        expect.stringContaining("duplicate url"),
        expect.stringContaining("tags must not be empty"),
        expect.stringContaining("summary is too short"),
        expect.stringContaining("invalid addedAt date"),
        expect.stringContaining("invalid updatedAt date"),
        expect.stringContaining("invalid lastCheckedAt date"),
      ]),
    );
  });
});
