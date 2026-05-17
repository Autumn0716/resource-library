export type UiLocale = "zh" | "en";
export type UiTheme = "light" | "dark";

export function normalizeLocale(value: string | null | undefined): UiLocale {
  return value === "en" ? "en" : "zh";
}

export function normalizeTheme(value: string | null | undefined): UiTheme {
  return value === "dark" ? "dark" : "light";
}

export function toggleFavoriteSlug(favorites: readonly string[], slug: string): string[] {
  return favorites.includes(slug) ? favorites.filter((favorite) => favorite !== slug) : [...favorites, slug];
}
