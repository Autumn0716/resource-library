import { useEffect, useState } from "react";
import { normalizeLocale, normalizeTheme, type UiLocale, type UiTheme } from "../lib/client-preferences";
import { uiLabels, type UiLabelKey } from "../lib/i18n";

const LOCALE_KEY = "atlas-locale";
const THEME_KEY = "atlas-theme";

function applyLocale(locale: UiLocale): void {
  document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  for (const element of document.querySelectorAll<HTMLElement>("[data-i18n-key]")) {
    const key = element.dataset.i18nKey as UiLabelKey | undefined;
    if (key) element.textContent = uiLabels[locale][key];
  }
  for (const element of document.querySelectorAll<HTMLInputElement>("[data-i18n-placeholder-key]")) {
    const key = element.dataset.i18nPlaceholderKey as UiLabelKey | undefined;
    if (key) element.placeholder = uiLabels[locale][key];
  }
  window.dispatchEvent(new CustomEvent("atlas:locale-change", { detail: locale }));
}

function applyTheme(theme: UiTheme): void {
  document.documentElement.dataset.theme = theme;
}

export default function SiteControls() {
  const [locale, setLocale] = useState<UiLocale>("zh");
  const [theme, setTheme] = useState<UiTheme>("light");

  useEffect(() => {
    const initialLocale = normalizeLocale(localStorage.getItem(LOCALE_KEY));
    const initialTheme = normalizeTheme(localStorage.getItem(THEME_KEY));
    setLocale(initialLocale);
    setTheme(initialTheme);
    applyLocale(initialLocale);
    applyTheme(initialTheme);
  }, []);

  function toggleLocale(): void {
    const nextLocale = locale === "zh" ? "en" : "zh";
    localStorage.setItem(LOCALE_KEY, nextLocale);
    setLocale(nextLocale);
    applyLocale(nextLocale);
  }

  function toggleTheme(): void {
    const nextTheme = theme === "light" ? "dark" : "light";
    localStorage.setItem(THEME_KEY, nextTheme);
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <div className="site-controls" aria-label="Site controls">
      <button type="button" onClick={toggleLocale} aria-label="Toggle language">
        {locale === "zh" ? "EN" : "中"}
      </button>
      <button type="button" onClick={toggleTheme} aria-label="Toggle theme">
        {theme === "light" ? uiLabels[locale].themeDark : uiLabels[locale].themeLight}
      </button>
    </div>
  );
}
