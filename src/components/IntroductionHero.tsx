import SoftAurora from "./ui/SoftAurora";
import GradientText from "./ui/GradientText";
import { useLang } from "../i18n/LangContext";

export function IntroductionHero() {
  const { t } = useLang();
  return (
    <div className="intro-hero">
      <div className="intro-hero-bg">
        <SoftAurora
          color1="#e8dcc8"
          color2="#c8a96e"
          speed={0.5}
          scale={1.2}
          brightness={0.5}
        />
      </div>

      <div className="intro-hero-content">
        <GradientText
          className="text-5xl md:text-7xl font-bold tracking-tighter mb-6"
          colors={['#1a1a1a', '#8a7340', '#c8a96e', '#8a7340']}
          animationSpeed={5}
        >
          {t("intro.hero")}
        </GradientText>

        <p className="intro-hero-desc">
          {t("intro.desc")}
        </p>
      </div>
    </div>
  );
}
