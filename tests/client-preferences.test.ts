import { describe, expect, test } from "bun:test";
import { normalizeLocale, normalizeTheme, toggleFavoriteSlug } from "../src/lib/client-preferences";

describe("client preferences", () => {
  test("normalizes locale and theme values", () => {
    expect(normalizeLocale("zh")).toBe("zh");
    expect(normalizeLocale("en")).toBe("en");
    expect(normalizeLocale("fr")).toBe("zh");
    expect(normalizeTheme("dark")).toBe("dark");
    expect(normalizeTheme("light")).toBe("light");
    expect(normalizeTheme("system")).toBe("light");
  });

  test("toggles favorite slugs without duplicates", () => {
    expect(toggleFavoriteSlug([], "alpha")).toEqual(["alpha"]);
    expect(toggleFavoriteSlug(["alpha"], "alpha")).toEqual([]);
    expect(toggleFavoriteSlug(["alpha"], "beta")).toEqual(["alpha", "beta"]);
  });
});
