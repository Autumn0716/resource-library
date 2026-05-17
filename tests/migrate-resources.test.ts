import { describe, expect, test } from "bun:test";
import { buildMigrationPlan, slugifyResourceName } from "../scripts/migrate-resources";

const groups = [
  { id: "academic", title: "学术创作", description: "Academic resources" },
  { id: "design", title: "设计", description: "Design resources" },
];

const resources = [
  {
    id: "0",
    name: "Humanizer AI",
    url: "https://example.com/humanizer",
    group: "学术创作",
    type: "写作",
    use: "Make writing natural.",
    status: "curated",
  },
  {
    id: "1",
    name: "Broken Group",
    url: "not a url",
    group: "未知分组",
    type: "工具",
    use: "",
    status: "pending",
  },
];

describe("resource migration", () => {
  test("creates deterministic slugs from names", () => {
    expect(slugifyResourceName("Humanizer AI")).toBe("humanizer-ai");
    expect(slugifyResourceName("  A/B_Test 工具  ")).toBe("a-b-test");
  });

  test("maps legacy fields into content frontmatter and reports quality issues", () => {
    const plan = buildMigrationPlan(resources, groups);

    expect(plan.groups.map((group) => group.slug)).toEqual(["academic", "design"]);
    expect(plan.groups[0].data).toMatchObject({
      name: "学术创作",
      slug: "academic",
      featured: true,
    });
    expect(plan.resources[0]).toMatchObject({
      slug: "humanizer-ai",
      data: {
        title: "Humanizer AI",
        slug: "humanizer-ai",
        legacyId: "0",
        group: "academic",
        type: "article",
        originalType: "写作",
        summary: "Make writing natural.",
        status: "active",
        tags: ["写作", "学术创作"],
        language: ["en"],
        featured: false,
        addedAt: "2026-05-17",
        favicon: "/favicons/humanizer-ai.png",
        screenshot: "/screenshots/humanizer-ai.png",
      },
    });
    expect(plan.report.invalidUrls).toEqual(["1"]);
    expect(plan.report.missingGroups).toEqual([{ resourceId: "1", group: "未知分组" }]);
    expect(plan.report.emptySummaries).toEqual(["1"]);
  });
});
