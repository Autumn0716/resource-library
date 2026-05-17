import { useEffect, useState } from "react";
import { uiLabels } from "../lib/i18n";

interface ResourceFilterOption {
  value: string;
  label: string;
}

interface ResourceFiltersProps {
  groups: ResourceFilterOption[];
  types: string[];
  tags: string[];
  pricing: string[];
  languages: string[];
  difficulties: string[];
}

function getInitialParam(name: string): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get(name) ?? "";
}

export default function ResourceFilters({ groups, types, tags, pricing, languages, difficulties }: ResourceFiltersProps) {
  const [query, setQuery] = useState(() => getInitialParam("q"));
  const [group, setGroup] = useState(() => getInitialParam("group"));
  const [type, setType] = useState(() => getInitialParam("type"));
  const [tag, setTag] = useState(() => getInitialParam("tag"));
  const [pricingValue, setPricingValue] = useState(() => getInitialParam("pricing"));
  const [language, setLanguage] = useState(() => getInitialParam("language"));
  const [difficulty, setDifficulty] = useState(() => getInitialParam("difficulty"));
  const [locale, setLocale] = useState<keyof typeof uiLabels>("zh");
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    setLocale(document.documentElement.lang.startsWith("en") ? "en" : "zh");
    const handleLocaleChange = (event: Event) => setLocale((event as CustomEvent<keyof typeof uiLabels>).detail);
    window.addEventListener("atlas:locale-change", handleLocaleChange);
    return () => window.removeEventListener("atlas:locale-change", handleLocaleChange);
  }, []);

  useEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-resource-card]"));
    const normalizedQuery = query.trim().toLowerCase();

    for (const card of cards) {
      const matchesQuery = !normalizedQuery || (card.dataset.search ?? "").toLowerCase().includes(normalizedQuery);
      const matchesGroup = !group || card.dataset.group === group;
      const matchesType = !type || card.dataset.type === type;
      const matchesTag = !tag || (card.dataset.tags ?? "").split(",").includes(tag);
      const matchesPricing = !pricingValue || card.dataset.pricing === pricingValue;
      const matchesLanguage = !language || (card.dataset.languages ?? "").split(",").includes(language);
      const matchesDifficulty = !difficulty || card.dataset.difficulty === difficulty;
      card.hidden = !(matchesQuery && matchesGroup && matchesType && matchesTag && matchesPricing && matchesLanguage && matchesDifficulty);
    }
    setVisibleCount(cards.filter((card) => !card.hidden).length);

    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries({ q: query, group, type, tag, pricing: pricingValue, language, difficulty })) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const nextUrl = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
    window.history.replaceState(null, "", nextUrl);
  }, [query, group, type, tag, pricingValue, language, difficulty]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "/" && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) {
        event.preventDefault();
        document.querySelector<HTMLInputElement>("[data-resource-search]")?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <section className="filter-summary interactive-filter" aria-label="Interactive filters">
      <label>
        <span data-i18n-key="filterSearch">{uiLabels[locale].filterSearch}</span>
        <input
          data-resource-search
          data-i18n-placeholder-key="filterSearchPlaceholder"
          name="q"
          value={query}
          placeholder={uiLabels[locale].filterSearchPlaceholder}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <label>
        <span data-i18n-key="filterGroup">{uiLabels[locale].filterGroup}</span>
        <select name="group" value={group} onChange={(event) => setGroup(event.target.value)}>
          <option value="">{uiLabels[locale].allGroups}</option>
          {groups.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span data-i18n-key="filterType">{uiLabels[locale].filterType}</span>
        <select name="type" value={type} onChange={(event) => setType(event.target.value)}>
          <option value="">{uiLabels[locale].allTypes}</option>
          {types.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span data-i18n-key="filterTag">{uiLabels[locale].filterTag}</span>
        <select name="tag" value={tag} onChange={(event) => setTag(event.target.value)}>
          <option value="">{uiLabels[locale].allTags}</option>
          {tags.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span data-i18n-key="filterPricing">{uiLabels[locale].filterPricing}</span>
        <select name="pricing" value={pricingValue} onChange={(event) => setPricingValue(event.target.value)}>
          <option value="">{uiLabels[locale].allPricing}</option>
          {pricing.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span data-i18n-key="filterLanguage">{uiLabels[locale].filterLanguage}</span>
        <select name="language" value={language} onChange={(event) => setLanguage(event.target.value)}>
          <option value="">{uiLabels[locale].allLanguages}</option>
          {languages.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span data-i18n-key="filterDifficulty">{uiLabels[locale].filterDifficulty}</span>
        <select name="difficulty" value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
          <option value="">{uiLabels[locale].allDifficulties}</option>
          {difficulties.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <p>
        {visibleCount} {uiLabels[locale].visibleResources}. {uiLabels[locale].filterHint}
      </p>
    </section>
  );
}
