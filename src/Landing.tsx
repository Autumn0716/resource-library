import { Button } from "@heroui/react";
import SoftAurora from "./components/ui/SoftAurora";
import GradientText from "./components/ui/GradientText";
import { MagicCard } from "./components/ui/MagicCard";
import { resources, resourceGroups } from "./data/resources";
import { useLang } from "./i18n/LangContext";

interface LandingProps {
  onEnter: () => void;
}

export function Landing({ onEnter }: LandingProps) {
  const visible = resources.filter(r => r.status !== "pending").length;
  const { lang, toggleLang, t } = useLang();

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-[#fafafa]">
      {/* Full-bleed atmospheric background */}
      <div className="absolute inset-0 z-0">
        <SoftAurora
          color1="#e8dcc8"
          color2="#c8a96e"
          speed={0.5}
          scale={1.2}
          brightness={0.5}
        />
      </div>

      {/* Radial dark wash for text contrast */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 25% 50%, rgba(250,250,250,0.55) 0%, rgba(250,250,250,0.3) 40%, transparent 70%)",
        }}
      />

      {/* Dot field pattern */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none opacity-40 mix-blend-multiply"
        style={{
          backgroundImage: "radial-gradient(rgba(200, 169, 110, 0.04) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />

      {/* Floating nav pill */}
      <nav
        className="absolute top-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 px-5 py-2 rounded-full border border-black/6 bg-white/50 backdrop-blur-xl shadow-[0_2px_20px_rgba(180,150,90,0.08)]"
        aria-label="Navigation"
      >
        <span className="font-semibold text-sm tracking-tight text-neutral-800">{t("intro.hero")}</span>
        <span className="w-px h-4 bg-black/8" aria-hidden="true" />
        <span className="text-neutral-400 text-xs font-mono">{t("rail.press")} <kbd className="px-1.5 py-0.5 rounded bg-black/5 text-neutral-500 text-[10px]">/</kbd> {t("rail.toFocusSearch")}</span>
        <button
          onClick={toggleLang}
          className="px-2.5 py-0.5 rounded-full border border-black/8 bg-white/40 text-neutral-500 text-xs font-mono tracking-wider hover:bg-white/60 hover:border-black/12 transition-all"
          title={lang === "en" ? "切换中文" : "Switch to English"}
        >
          {lang === "en" ? "中" : "EN"}
        </button>
      </nav>

      {/* Main content — editorial left-offset */}
      <div className="relative z-10 flex h-full items-center">
        <div className="w-full max-w-[680px] pl-[8%] pr-6">
          <p className="text-neutral-400 text-xs tracking-[0.2em] uppercase font-mono mb-6">
            {t("landing.designEngineering")}
          </p>

          <GradientText
            className="text-6xl md:text-8xl font-bold tracking-[-0.04em] mb-5"
            colors={['#1a1a1a', '#8a7340', '#c8a96e', '#8a7340']}
            animationSpeed={5}
          >
            AI Builder Atlas
          </GradientText>

          <p className="text-neutral-600 text-2xl md:text-3xl font-medium tracking-[-0.02em] mb-4" style={{ textWrap: "balance" }}>
            {t("landing.hero")}
          </p>

          <p className="text-neutral-500 text-base leading-relaxed max-w-md mb-10" style={{ textWrap: "pretty" }}>
            {t("landing.subtitle")}
          </p>

          <div className="flex items-center gap-4 mb-10">
            <Button
              size="lg"
              variant="primary"
              className="font-sans tracking-wide font-semibold px-10 py-6 text-base text-white border-0 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#c8a96e]"
              style={{
                background: '#c8a96e',
                boxShadow: '0 2px 20px rgba(200, 169, 110, 0.35)',
              }}
              onPress={onEnter}
            >
              {t("landing.cta")}
            </Button>
            <span className="text-neutral-400 text-sm font-mono">
              {visible} {t("status.curated")} · {resourceGroups.length} {t("meta.groups")}
            </span>
          </div>

          {/* Stats row — inline, not a card */}
          <div className="flex gap-8 text-neutral-400">
            <div>
              <span className="block text-2xl font-semibold text-neutral-800 tracking-tight" style={{ fontVariantNumeric: "tabular-nums" }}>{resources.length}</span>
              <span className="text-[11px] tracking-wider">{t("meta.resources")}</span>
            </div>
            <div className="w-px bg-black/8" aria-hidden="true" />
            <div>
              <span className="block text-2xl font-semibold text-neutral-800 tracking-tight" style={{ fontVariantNumeric: "tabular-nums" }}>{resourceGroups.length}</span>
              <span className="text-[11px] tracking-wider">{t("meta.groups")}</span>
            </div>
            <div className="w-px bg-black/8" aria-hidden="true" />
            <div>
              <span className="block text-2xl font-semibold text-neutral-800 tracking-tight" style={{ fontVariantNumeric: "tabular-nums" }}>{visible}</span>
              <span className="text-[11px] tracking-wider">{t("status.curated")}</span>
            </div>
          </div>
        </div>

        {/* Right side — atmospheric, stats card floating */}
        <div className="hidden lg:flex flex-1 items-center justify-center">
          <MagicCard
            className="rounded-3xl max-w-xs"
            gradientSize={340}
            gradientFrom="#333333"
            gradientTo="#e5e5e5"
            gradientColor="#1a1a1a"
            gradientOpacity={0.08}
          >
            <div className="p-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-2 tracking-tight" style={{ textWrap: "balance" }}>
                {t("landing.refineAesthetic")}
              </h2>
              <p className="text-sm text-neutral-500 leading-relaxed mb-6">
                {t("landing.refineDesc")}
              </p>
              <div className="flex gap-2">
                <kbd className="px-2 py-1 rounded-md bg-black/4 text-neutral-500 text-[10px] font-mono tracking-wider">J/K</kbd>
                <span className="text-neutral-400 text-xs self-center">Navigate</span>
                <span className="text-neutral-300 self-center mx-1">·</span>
                <kbd className="px-2 py-1 rounded-md bg-black/4 text-neutral-500 text-[10px] font-mono tracking-wider">R</kbd>
                <span className="text-neutral-400 text-xs self-center">Surprise</span>
              </div>
            </div>
          </MagicCard>
        </div>
      </div>

      {/* Bottom hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 font-mono text-[11px] text-neutral-400 tracking-wider">
        {t("landing.keyboard")}
      </div>
    </div>
  );
}
