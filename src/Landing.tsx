import { Button } from "@heroui/react";
import SoftAurora from "./components/ui/SoftAurora";
import LiquidEther from "./components/ui/LiquidEther";
import GradientText from "./components/ui/GradientText";
import { useState } from "react";
import { resources, resourceGroups } from "./data/resources";

interface LandingProps {
  onEnter: () => void;
}

export function Landing({ onEnter }: LandingProps) {
  const [bgType, setBgType] = useState<"aurora" | "liquid">("aurora");

  const visible = resources.filter(r => r.status !== "pending").length;

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden flex flex-col items-center justify-center bg-black">
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

      <div className="absolute top-4 right-4 z-20 flex gap-2">
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

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl">
        <GradientText 
          className="text-6xl md:text-8xl font-bold tracking-tighter mb-6"
          colors={['#f8fafc', '#a855f7', '#d946ef', '#f8fafc']}
          animationSpeed={5}
        >
          AI Builder Atlas
        </GradientText>
        
        <p className="text-zinc-200 text-xl md:text-2xl mx-auto mb-8 font-medium tracking-tight">
          The Ultimate Design-Engineering Resource Library
        </p>

        <p className="text-zinc-400 text-base md:text-lg mx-auto mb-12 leading-relaxed font-mono max-w-2xl">
          A meticulously curated collection of world-class UI components, advanced engineering foundations, and cutting-edge AI workflow tools designed for the modern builder.
        </p>

        <div className="flex flex-col md:flex-row gap-6 items-stretch justify-center mb-12 w-full">
          <div className="flex flex-col items-start bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex-1 text-left">
            <span className="text-xs tracking-widest text-purple-400 font-bold mb-3 uppercase">MISSION</span>
            <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Refine Your Aesthetic System</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              We bridge the gap between extreme aesthetics and solid engineering, providing {resources.length} hand-picked entry points to elevate your product's taste and quality.
            </p>
          </div>

          <div className="flex flex-col gap-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 w-full md:w-64 text-left">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <strong className="text-white text-xl">{resources.length}</strong>
              <span className="text-zinc-400 text-xs tracking-wider uppercase">Resources</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <strong className="text-white text-xl">{resourceGroups.length}</strong>
              <span className="text-zinc-400 text-xs tracking-wider uppercase">Categories</span>
            </div>
            <div className="flex justify-between items-center">
              <strong className="text-white text-xl">{visible}</strong>
              <span className="text-zinc-400 text-xs tracking-wider uppercase">Curated</span>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 text-[10px] text-zinc-500 font-mono text-center uppercase tracking-widest">
              Keyboard Driven Interface
            </div>
          </div>
        </div>
        
        <Button 
          size="lg" 
          variant="primary"
          className="font-mono tracking-widest font-bold px-12 py-7 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-[0_0_20px_rgba(168,85,247,0.5)] border-0"
          onPress={onEnter}
        >
          ENTER LIBRARY
        </Button>
      </div>

      {/* Decorative dot overlay */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen"
        style={{
          backgroundImage: 'radial-gradient(rgba(180, 151, 207, 0.4) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }}
      />
    </div>
  );
}
