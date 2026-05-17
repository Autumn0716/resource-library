import { useEffect, useState } from "react";
import { toggleFavoriteSlug } from "../lib/client-preferences";
import { uiLabels, type UiLabelKey } from "../lib/i18n";

const FAVORITES_KEY = "atlas-favorites";

function readFavorites(): string[] {
  try {
    const stored = JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "[]");
    return Array.isArray(stored) ? stored.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function currentLocale(): keyof typeof uiLabels {
  return document.documentElement.lang.startsWith("en") ? "en" : "zh";
}

interface FavoriteButtonProps {
  slug: string;
}

export default function FavoriteButton({ slug }: FavoriteButtonProps) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [locale, setLocale] = useState<keyof typeof uiLabels>("zh");

  useEffect(() => {
    setFavorites(readFavorites());
    setLocale(currentLocale());
    const handleLocaleChange = (event: Event) => setLocale((event as CustomEvent<keyof typeof uiLabels>).detail);
    window.addEventListener("atlas:locale-change", handleLocaleChange);
    return () => window.removeEventListener("atlas:locale-change", handleLocaleChange);
  }, []);

  const isFavorite = favorites.includes(slug);
  const labelKey: UiLabelKey = isFavorite ? "favorited" : "favorite";

  function onToggle(): void {
    const nextFavorites = toggleFavoriteSlug(favorites, slug);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(nextFavorites));
    setFavorites(nextFavorites);
  }

  return (
    <button type="button" className="favorite-button" aria-pressed={isFavorite} onClick={onToggle}>
      {isFavorite ? "★" : "☆"} {uiLabels[locale][labelKey]}
    </button>
  );
}
