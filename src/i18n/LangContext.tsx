import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { type Lang, t } from "./translations";

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (key: string) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem("lang");
      if (saved === "en" || saved === "zh") return saved;
    } catch {}
    return navigator.language.startsWith("zh") ? "zh" : "en";
  });

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === "en" ? "zh" : "en";
      try { localStorage.setItem("lang", next); } catch {}
      return next;
    });
  }, []);

  const value: LangContextValue = {
    lang,
    setLang: (next) => {
      setLang(next);
      try { localStorage.setItem("lang", next); } catch {}
    },
    toggleLang,
    t: (key) => t(lang, key as any),
  };

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
