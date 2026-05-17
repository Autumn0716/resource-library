import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import ResourceFilters from "../src/components/ResourceFilters";

describe("ResourceFilters", () => {
  test("renders every faceted filter required by the migration brief", () => {
    const html = renderToStaticMarkup(
      <ResourceFilters
        groups={[{ value: "design", label: "Design" }]}
        types={["tool"]}
        tags={["ui"]}
        pricing={["free", "paid"]}
        languages={["en", "zh"]}
        difficulties={["beginner", "advanced"]}
      />,
    );

    expect(html).toContain('name="group"');
    expect(html).toContain('name="type"');
    expect(html).toContain('name="tag"');
    expect(html).toContain('name="pricing"');
    expect(html).toContain('name="language"');
    expect(html).toContain('name="difficulty"');
  });
});
