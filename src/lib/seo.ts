const siteUrl = "https://resource-library-wheat.vercel.app";
const defaultShareImage = "/brand/logo.svg";

export function buildTitle(title: string): string {
  return title === "AI Builder Atlas" ? title : `${title} · AI Builder Atlas`;
}

export function buildDescription(description: string): string {
  return description.length > 160 ? `${description.slice(0, 157)}...` : description;
}

export function buildCanonicalUrl(pathname: string): string {
  return new URL(pathname, siteUrl).toString();
}

export function buildShareImageUrl(pathname = defaultShareImage): string {
  return buildCanonicalUrl(pathname);
}

export function buildSiteJsonLd(): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AI Builder Atlas",
    url: buildCanonicalUrl("/"),
    potentialAction: {
      "@type": "SearchAction",
      target: `${buildCanonicalUrl("/search")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  });
}

export function buildResourceJsonLd(resource: {
  id: string;
  data: { title: string; summary: string; url: string; type: string; tags: string[]; screenshot?: string };
}): string {
  const resourceUrl = buildCanonicalUrl(`/resources/${resource.id}/`);
  const schemaType = ["tool", "library", "api"].includes(resource.data.type) ? "SoftwareApplication" : "CreativeWork";

  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: buildCanonicalUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Resources",
            item: buildCanonicalUrl("/resources/"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: resource.data.title,
            item: resourceUrl,
          },
        ],
      },
      {
        "@type": schemaType,
        name: resource.data.title,
        description: resource.data.summary,
        url: resource.data.url,
        applicationCategory: resource.data.type,
        keywords: resource.data.tags.join(", "),
        image: buildShareImageUrl(resource.data.screenshot),
        mainEntityOfPage: resourceUrl,
        isPartOf: {
          "@type": "WebSite",
          name: "AI Builder Atlas",
          url: buildCanonicalUrl("/"),
        },
      },
    ],
  });
}
