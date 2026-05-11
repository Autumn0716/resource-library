import { useState } from "react";
import SoftAurora from "./ui/SoftAurora";
import LiquidEther from "./ui/LiquidEther";
import GradientText from "./ui/GradientText";

export function IntroductionHero() {
  const [bgType, setBgType] = useState<"aurora" | "liquid">("aurora");

  return (
    <div className="relative w-full rounded-3xl overflow-hidden mb-12 border border-white/10 shadow-2xl bg-black" style={{ minHeight: "380px" }}>
      {/* Background WebGL Animation */}
      <div className="absolute inset-0 z-0">
        {bgType === "aurora" ? (
          <SoftAurora 
            color1="#a855f7" 
            color2="#d946ef" 
            speed={0.5} 
            scale={1.2} 
            brightness={0.8}
          />
        ) : (
          <LiquidEther 
            colors={['#1e1b4b', '#a855f7', '#d946ef']}
            mouseForce={20}
            autoDemo={true}
            resolution={0.6}
          />
        )}
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 py-16 bg-black/10 backdrop-blur-[1px]">
        <div className="absolute top-4 right-4 flex gap-2">
          <button 
            type="button"
            onClick={() => setBgType("aurora")}
            className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-mono transition-colors ${bgType === "aurora" ? "bg-purple-500/20 text-purple-300 border border-purple-500/40" : "bg-white/5 text-white/40 border border-transparent hover:bg-white/10 hover:text-white/80"}`}
          >
            Aurora
          </button>
          <button 
            type="button"
            onClick={() => setBgType("liquid")}
            className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-mono transition-colors ${bgType === "liquid" ? "bg-purple-500/20 text-purple-300 border border-purple-500/40" : "bg-white/5 text-white/40 border border-transparent hover:bg-white/10 hover:text-white/80"}`}
          >
            Liquid
          </button>
        </div>

        <GradientText 
          className="text-4xl md:text-6xl font-bold tracking-tighter mb-5"
          colors={['#f8fafc', '#d946ef', '#a855f7', '#f8fafc']}
          animationSpeed={5}
        >
          AI Builder Atlas
        </GradientText>
        
        <p className="text-zinc-300 text-sm md:text-[15px] max-w-lg mx-auto leading-relaxed font-mono drop-shadow-sm">
          Explore the curated resources library for high-end UI components, engineering foundations, and AI workflow tools.
        </p>
      </div>
    </div>
  );
}
