import { useEffect, useMemo, useState } from "react";
import { uiLabels, type UiLabelKey } from "../lib/i18n";

interface CommandPaletteResource {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
}

interface CommandPaletteProps {
  resources: CommandPaletteResource[];
}

const fixedCommands = [
  { href: "/resources/", labelKey: "resources" },
  { href: "/groups/", labelKey: "groups" },
  { href: "/search/", labelKey: "search" },
  { href: "/changelog/", labelKey: "changelogTitle" },
] satisfies Array<{ href: string; labelKey: UiLabelKey }>;

function currentLocale(): keyof typeof uiLabels {
  return document.documentElement.lang.startsWith("en") ? "en" : "zh";
}

export default function CommandPalette({ resources }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [locale, setLocale] = useState<keyof typeof uiLabels>("zh");

  useEffect(() => {
    setLocale(currentLocale());
    const handleLocaleChange = (event: Event) => setLocale((event as CustomEvent<keyof typeof uiLabels>).detail);
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("atlas:locale-change", handleLocaleChange);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("atlas:locale-change", handleLocaleChange);
    };
  }, []);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return resources.slice(0, 8);
    return resources
      .filter((resource) => [resource.title, resource.summary, ...resource.tags].join(" ").toLowerCase().includes(normalized))
      .slice(0, 8);
  }, [query, resources]);

  return (
    <>
      <button type="button" className="palette-trigger" onClick={() => setOpen(true)}>
        <span data-i18n-key="openPalette">{uiLabels[locale].openPalette}</span>
        <kbd>⌘K</kbd>
      </button>
      {open && (
        <div className="palette-overlay" role="dialog" aria-modal="true" aria-label={uiLabels[locale].commandPalette}>
          <div className="palette-panel">
            <input
              autoFocus
              value={query}
              placeholder={uiLabels[locale].filterSearchPlaceholder}
              onChange={(event) => setQuery(event.target.value)}
            />
            <nav aria-label="Quick links">
              {fixedCommands.map((command) => (
                <a key={command.href} href={command.href}>
                  {uiLabels[locale][command.labelKey]}
                </a>
              ))}
            </nav>
            <ul>
              {results.map((resource) => (
                <li key={resource.slug}>
                  <a href={`/resources/${resource.slug}/`}>
                    <strong>{resource.title}</strong>
                    <span>{resource.summary}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
