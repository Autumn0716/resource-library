import { useEffect, useRef } from "react";
import { Button } from "@heroui/react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import SoftAurora from "./components/ui/SoftAurora";
import GradientText from "./components/ui/GradientText";
import { resources, resourceGroups } from "./data/resources";
import { useLang } from "./i18n/LangContext";

function CountUp({ target, delay = 0 }: { target: number; delay?: number }) {
  const count = useMotionValue(0);
  const spring = useSpring(count, { stiffness: 80, damping: 20 });
  const display = useTransform(spring, (v) => Math.round(v).toString());
  
  useEffect(() => {
    const timeout = setTimeout(() => count.set(target), delay * 1000);
    return () => clearTimeout(timeout);
  }, [target, delay, count]);
  
  return <motion.span>{display}</motion.span>;
}

function MagneticCTA({ onEnter, label }: { onEnter: () => void; label: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const moveX = ((e.clientX - centerX) / (rect.width / 2)) * 4;
    const moveY = ((e.clientY - centerY) / (rect.height / 2)) * 4;
    
    x.set(moveX);
    y.set(moveY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2, duration: 0.5 }}
      style={{ x: springX, y: springY }}
    >
      <motion.div whileTap={{ scale: 0.96 }} transition={{ duration: 0.12 }}>
        <Button
          size="lg"
          variant="primary"
          className="landing-cta font-sans tracking-wide font-semibold px-11 py-6 text-base text-white border-0 transition-all duration-200 hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#c8a96e]"
          style={{
            background: '#c8a96e',
            boxShadow: '0 2px 20px rgba(200, 169, 110, 0.35)',
          }}
          onPress={onEnter}
        >
          {label}
        </Button>
      </motion.div>
    </motion.div>
  );
}

interface LandingProps {
  onEnter: () => void;
}

export function Landing({ onEnter }: LandingProps) {
  const visible = resources.filter(r => r.status !== "pending").length;
  const { lang, toggleLang, t } = useLang();
  const atlasNodes = [
    { label: t("landing.nodeDesign"), value: resourceGroups.length.toString(), x: "12%", y: "16%" },
    { label: t("landing.nodeMotion"), value: visible.toString(), x: "56%", y: "38%" },
    { label: t("landing.nodeWorkflow"), value: resources.length.toString(), x: "24%", y: "70%" },
  ];

  const containerRef = useRef<HTMLDivElement>(null);

  const handleRootMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    containerRef.current.style.setProperty('--mouse-x', x.toString());
    containerRef.current.style.setProperty('--mouse-y', y.toString());
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleRootMouseMove}
      className="relative w-full h-[100dvh] overflow-hidden bg-[#fafafa]"
    >
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
        className="absolute inset-0 z-[2] pointer-events-none opacity-40 mix-blend-multiply transition-transform duration-300 ease-out"
        style={{
          backgroundImage: "radial-gradient(rgba(200, 169, 110, 0.04) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          transform: "translate(calc((var(--mouse-x, 0.5) - 0.5) * -8px), calc((var(--mouse-y, 0.5) - 0.5) * -8px))"
        }}
      />
      <div className="landing-scanline" aria-hidden="true" />

      {/* Floating nav pill */}
      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-2 rounded-full border border-black/6 bg-white/55 backdrop-blur-xl shadow-[0_2px_20px_rgba(180,150,90,0.08)]"
        aria-label="Navigation"
      >
        <span className="font-semibold text-sm tracking-tight text-neutral-800">{t("intro.hero")}</span>
        <span className="hidden sm:inline text-neutral-300 text-xs" aria-hidden="true">·</span>
        <span className="hidden sm:inline text-neutral-400 text-xs font-mono tracking-wide">{t("landing.navMeta")}</span>
        <button
          onClick={toggleLang}
          className="px-2.5 py-0.5 rounded-full border border-black/8 bg-white/50 text-neutral-500 text-xs font-mono tracking-wider hover:bg-white/70 hover:border-black/12 transition-all"
          title={lang === "en" ? "切换中文" : "Switch to English"}
        >
          {lang === "en" ? "中" : "EN"}
        </button>
      </motion.nav>

      {/* Main content — editorial left-offset */}
      <div className="relative z-10 flex h-full items-center">
        <div className="w-full max-w-[620px] pl-[8%] pr-6">
          <p className="text-neutral-400 text-xs tracking-[0.2em] uppercase font-mono mb-6">
            {t("landing.designEngineering")}
          </p>

          <motion.div
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <GradientText
              className="landing-title"
              colors={['#1a1a1a', '#8a7340', '#c8a96e', '#8a7340']}
              animationSpeed={5}
            >
              AI Builder Atlas
            </GradientText>
          </motion.div>

          <motion.p 
            className="text-neutral-700 text-2xl md:text-3xl font-semibold tracking-[-0.025em] mb-4 max-w-xl" 
            style={{ textWrap: "balance" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            {t("landing.hero")}
          </motion.p>

          <motion.p 
            className="text-neutral-500 text-base leading-relaxed max-w-lg mb-9" 
            style={{ textWrap: "pretty" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.8 }}
          >
            {t("landing.subtitle")}
          </motion.p>

          <div className="flex flex-wrap items-center gap-4 mb-9">
            <MagneticCTA onEnter={onEnter} label={t("landing.cta")} />
            
            <motion.span 
              className="text-neutral-400 text-xs font-mono tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <CountUp target={visible} delay={1.5} /> {t("status.curated")} · <CountUp target={resourceGroups.length} delay={1.35} /> {t("meta.groups")}
            </motion.span>
          </div>

          {/* Stats row — inline, not a card */}
          <div className="flex gap-8 text-neutral-400 border-l border-black/8 pl-5">
            <div>
              <span className="block text-2xl font-semibold text-neutral-800 tracking-tight" style={{ fontVariantNumeric: "tabular-nums" }}>
                <CountUp target={resources.length} delay={1.2} />
              </span>
              <span className="text-[11px] tracking-wider">{t("meta.resources")}</span>
            </div>
            <div className="w-px bg-black/8" aria-hidden="true" />
            <div>
              <span className="block text-2xl font-semibold text-neutral-800 tracking-tight" style={{ fontVariantNumeric: "tabular-nums" }}>
                <CountUp target={resourceGroups.length} delay={1.35} />
              </span>
              <span className="text-[11px] tracking-wider">{t("meta.groups")}</span>
            </div>
            <div className="w-px bg-black/8" aria-hidden="true" />
            <div>
              <span className="block text-2xl font-semibold text-neutral-800 tracking-tight" style={{ fontVariantNumeric: "tabular-nums" }}>
                <CountUp target={visible} delay={1.5} />
              </span>
              <span className="text-[11px] tracking-wider">{t("status.curated")}</span>
            </div>
          </div>
        </div>

        {/* Right side — atlas coordinate preview */}
        <div className="hidden lg:flex flex-1 items-center justify-center relative">
          <div className="landing-atlas-stack">
            <div className="landing-atlas-map">
              <div className="landing-atlas-grid" aria-hidden="true" />
              <div className="landing-atlas-sweep" aria-hidden="true" />
              <div className="landing-atlas-orbit landing-atlas-orbit-a" aria-hidden="true" />
              <div className="landing-atlas-orbit landing-atlas-orbit-b" aria-hidden="true" />
              <div className="landing-atlas-label">{t("landing.mapLabel")}</div>

              {atlasNodes.map((node, i) => {
                return (
                  <motion.div
                    key={node.label}
                    className="landing-atlas-node"
                    initial={{ opacity: 0, y: 18, scale: 0.96 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    transition={{
                      delay: 0.4 + i * 0.12,
                      duration: 0.65,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    style={{ left: node.x, top: node.y }}
                  >
                    <span className="landing-atlas-dot" aria-hidden="true" />
                    <span className="landing-atlas-node-value">{node.value}</span>
                    <span className="landing-atlas-node-label">{node.label}</span>
                  </motion.div>
                );
              })}
            </div>

            <div className="landing-atlas-card">
              <span>{t("landing.mapCardEyebrow")}</span>
              <strong>{t("landing.mapCardTitle")}</strong>
              <p>{t("landing.mapCardDesc")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom hint */}
      <motion.div 
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 font-mono text-[11px] text-neutral-400 tracking-wider"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.0, duration: 0.8 }}
      >
        {t("landing.keyboard")}
      </motion.div>
    </div>
  );
}
