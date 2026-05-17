import { describe, expect, test } from "bun:test";
import { buildResourceJsonLd, buildSiteJsonLd } from "../src/lib/seo";

describe("seo helpers", () => {
  test("builds homepage WebSite JSON-LD with search target", () => {
    const jsonLd = JSON.parse(buildSiteJsonLd());

    expect(jsonLd).toMatchObject({
      "@type": "WebSite",
      name: "AI Builder Atlas",
    });
    expect(jsonLd.potentialAction.target).toContain("/search?q={search_term_string}");
  });

  test("builds resource JSON-LD with breadcrumb and creative work metadata", () => {
    const jsonLd = JSON.parse(
      buildResourceJsonLd({
        id: "alpha",
        data: {
          title: "Alpha",
          summary: "Alpha summary",
          url: "https://example.com/alpha",
          type: "article",
          tags: ["ui"],
          screenshot: "/screenshots/alpha.png",
        },
      }),
    );

    expect(jsonLd["@graph"]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ "@type": "BreadcrumbList" }),
        expect.objectContaining({ "@type": "CreativeWork", name: "Alpha" }),
      ]),
    );
  });
});
