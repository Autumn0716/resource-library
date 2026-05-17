import { describe, expect, test } from "bun:test";
import type { ResourceEntry } from "../src/lib/resources";
import { filterResources, getResourceTags, sortResources, sortResourcesByRecency } from "../src/lib/resources";
import { deriveTagCounts } from "../src/lib/tags";
import { getRelatedResources } from "../src/lib/related";

const resources: ResourceEntry[] = [
  {
    id: "alpha",
    data: {
      title: "Alpha",
      slug: "alpha",
      url: "https://example.com/alpha",
      group: "design",
      type: "tool",
      originalType: "工具",
      summary: "Alpha summary",
      status: "active",
      tags: ["ui", "design"],
      audience: [],
      useCases: ["Alpha summary"],
      alternatives: [],
      pricing: "free",
      language: ["en"],
      difficulty: "beginner",
      featured: false,
      addedAt: "2026-05-17",
      lastCheckedAt: "2026-05-17",
      favicon: "/favicons/alpha.png",
      screenshot: "/screenshots/alpha.png",
    },
  },
  {
    id: "beta",
    data: {
      title: "Beta",
      slug: "beta",
      url: "https://example.com/beta",
      group: "design",
      type: "library",
      originalType: "组件库",
      summary: "Beta summary",
      status: "pending",
      tags: ["ui"],
      audience: [],
      useCases: ["Beta summary"],
      alternatives: [],
      pricing: "paid",
      language: ["zh"],
      difficulty: "advanced",
      featured: false,
      addedAt: "2026-05-17",
      lastCheckedAt: "2026-05-17",
      favicon: "/favicons/beta.png",
      screenshot: "/screenshots/beta.png",
    },
  },
  {
    id: "gamma",
    data: {
      title: "Gamma",
      slug: "gamma",
      url: "https://example.com/gamma",
      group: "docs",
      type: "tool",
      originalType: "工具",
      summary: "Gamma summary",
      status: "active",
      tags: ["writing"],
      audience: [],
      useCases: ["Gamma summary"],
      alternatives: [],
      pricing: "freemium",
      language: ["en"],
      difficulty: "intermediate",
      featured: false,
      addedAt: "2026-05-17",
      lastCheckedAt: "2026-05-17",
      favicon: "/favicons/gamma.png",
      screenshot: "/screenshots/gamma.png",
    },
  },
];

describe("resource helpers", () => {
  test("sorts curated resources before pending resources and then by title", () => {
    expect(sortResources(resources).map((resource) => resource.id)).toEqual(["alpha", "gamma", "beta"]);
  });

  test("sorts changelog entries by updated date, then added date", () => {
    const datedResources: ResourceEntry[] = [
      resources[0],
      { ...resources[1], data: { ...resources[1].data, addedAt: "2026-05-18" } },
      { ...resources[2], data: { ...resources[2].data, updatedAt: "2026-05-19" } },
    ];

    expect(sortResourcesByRecency(datedResources).map((resource) => resource.id)).toEqual(["gamma", "beta", "alpha"]);
  });

  test("filters resources with AND logic across facets", () => {
    expect(
      filterResources(resources, {
        group: "design",
        tag: "ui",
        pricing: "paid",
        language: "zh",
        difficulty: "advanced",
      }).map((resource) => resource.id),
    ).toEqual(["beta"]);
  });

  test("derives sorted unique tags from resources", () => {
    expect(getResourceTags(resources)).toEqual(["design", "ui", "writing"]);
    expect(deriveTagCounts(resources)).toEqual([
      ["ui", 2],
      ["design", 1],
      ["writing", 1],
    ]);
  });

  test("scores related resources by group, type, and shared tags", () => {
    expect(getRelatedResources(resources[0], resources).map((resource) => resource.id)).toEqual(["beta", "gamma"]);
  });
});
