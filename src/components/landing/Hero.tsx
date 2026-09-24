import React, { useState } from 'react';
import { Copy, Check, TrendingUp, TrendingDown, ArrowUpRight, ShieldCheck, Flame, Zap, Terminal } from 'lucide-react';
import { soundFx } from '@/utils/audio';

export const Hero: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);
  const [mascotBoings, setMascotBoings] = useState<number>(0);

  // Official Contract Address & Launchpad
  const CONTRACT_ADDRESS = "0x697518845e7c5DEE323720871D8bE03F9D3Fc901";
  const LAUNCHPAD_URL = "https://www.ponsfamily.com/launchpad/0x697518845e7c5DEE323720871D8bE03F9D3Fc901";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    soundFx.playCash();
    setTimeout(() => setCopied(false), 2200);
  };

  const handleMascotClick = () => {
    setMascotBoings((prev) => prev + 1);
    soundFx.playMeow();
    window.dispatchEvent(new CustomEvent('nine:launch-cat'));
  };

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-8 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Background Graphic Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-halftone opacity-30 pointer-events-none" />

      {/* Giant "9" Motif Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[38vw] md:text-[32vw] font-['Titan_One'] text-[#ff6b9d]/[0.035] select-none pointer-events-none leading-none z-0">
        9
      </div>

      {/* Red Falling Candlesticks (Left Flank) */}
      <div className="hidden lg:flex flex-col items-center gap-3 absolute left-6 top-24 pointer-events-none opacity-40 z-0">
        <div className="w-4 h-24 bg-red-600 rounded-sm border border-black shadow-[2px_2px_0px_#000] relative">
          <div className="w-0.5 h-36 bg-red-400 absolute left-1/2 -translate-x-1/2 -top-6 -z-10" />
        </div>
        <div className="w-4 h-16 bg-red-700 rounded-sm border border-black shadow-[2px_2px_0px_#000] relative">
          <div className="w-0.5 h-28 bg-red-400 absolute left-1/2 -translate-x-1/2 -top-6 -z-10" />
        </div>
        <div className="bg-red-950/80 border border-red-700/60 rounded px-2 py-1 text-[11px] font-['JetBrains_Mono'] text-red-300 rotate-[-6deg]">
          DOWN -84% [“IT'S OVER”]
        </div>
      </div>

      {/* Green Rising Candlesticks (Right Flank) */}
      <div className="hidden lg:flex flex-col items-center gap-3 absolute right-6 bottom-20 pointer-events-none opacity-50 z-0">
        <div className="bg-[#00e676]/20 border border-[#00e676]/60 rounded px-2 py-1 text-[11px] font-['JetBrains_Mono'] text-[#00e676] rotate-[6deg]">
          COMEBACK: +999% [STILL ALIVE]
        </div>
        <div className="w-4 h-32 bg-[#00e676] rounded-sm border border-black shadow-[2px_2px_0px_#000] relative">
          <div className="w-0.5 h-44 bg-emerald-400 absolute left-1/2 -translate-x-1/2 -top-6 -z-10" />
        </div>
        <div className="w-4 h-20 bg-emerald-400 rounded-sm border border-black shadow-[2px_2px_0px_#000] relative">
          <div className="w-0.5 h-32 bg-emerald-300 absolute left-1/2 -translate-x-1/2 -top-6 -z-10" />
        </div>
      </div>

      {/* Main Hero Container */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* Left Column: Hero Narrative & CTA (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
          
          {/* Tag Badges */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff6b9d]/15 border border-[#ff6b9d]/40 text-[#ff6b9d] text-xs font-['JetBrains_Mono'] font-bold uppercase tracking-wider shadow-sm">
              <Zap className="w-3.5 h-3.5 animate-pulse text-[#ffb703]" />
              THE NINE-LIVES MEMECOIN
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[#00e676] text-xs font-['JetBrains_Mono'] font-bold uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" />
              LIVES LEFT: 9/9
            </div>
          </div>

          {/* Primary Headline */}
          <h1 className="text-4xl sm:text-6xl xl:text-7xl font-['Titan_One'] tracking-tight text-white leading-[1.05] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
            THE CAT THAT <br className="hidden sm:inline" />
            <span className="text-[#ff6b9d] drop-shadow-[2px_2px_0px_#000]">HASN’T USED</span> <br className="hidden sm:inline" />
            ITS LAST LIFE.
          </h1>

          {/* Core Lore Subhead */}
          <div className="max-w-xl text-lg sm:text-xl text-neutral-300 font-['Space_Grotesk'] leading-relaxed font-medium">
            <p className="border-l-4 border-[#ffb703] pl-4 py-1 bg-[#121218]/60 rounded-r-lg">
              <strong className="text-white font-bold">GME is the comeback. NINE is the nine lives.</strong> Every time the market writes the obituary, <strong className="text-[#ffb703]">Nine the Cat</strong> finds another life and sends it anyway.
            </p>
          </div>

          {/* Degen Cycle Micro Bar */}
          <div className="flex items-center flex-wrap gap-2 text-xs font-['JetBrains_Mono'] font-bold text-neutral-400 py-1 select-none">
            <span className="text-white">RISE</span>
            <span>➔</span>
            <span className="text-[#ffb703]">CHAOS</span>
            <span>➔</span>
            <span className="text-red-400">DOWNFALL</span>
            <span>➔</span>
            <span className="text-neutral-500 line-through">“IT’S DEAD”</span>
            <span>➔</span>
            <span className="text-[#00e676] bg-[#00e676]/10 px-1.5 py-0.5 rounded border border-[#00e676]/30">COMEBACK</span>
            <span>➔</span>
            <span className="text-[#ff6b9d]">REPEAT</span>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 w-full sm:w-auto">
            {/* ENTER COMMUNITY TERMINAL (Primary Shatter CTA) */}
            <button
              onClick={(e) => {
                soundFx.playCash();
                window.dispatchEvent(
                  new CustomEvent('nine:break-glass', {
                    detail: { clientX: e.clientX, clientY: e.clientY },
                  })
                );
              }}
              className="px-6 sm:px-7 py-3.5 font-['Titan_One'] text-base tracking-wide text-black bg-[#ffb703] border-3 border-black rounded-2xl shadow-[5px_5px_0px_#00e676] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_#00e676] hover:bg-[#ffc83b] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0px_#00e676] transition flex items-center gap-2.5 cursor-pointer group"
              title="Click to shatter screen and enter the Community Terminal"
            >
              <Terminal className="w-5 h-5 text-black group-hover:scale-110 transition-transform" />
              <span>ENTER COMMUNITY TERMINAL</span>
              <span className="flex h-2.5 w-2.5 relative ml-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-600 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </span>
            </button>

            <a
              href={LAUNCHPAD_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundFx.playCash()}
              className="px-7 py-3.5 font-['Titan_One'] text-base tracking-wide text-black bg-[#00e676] border-3 border-black rounded-2xl shadow-[5px_5px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_#000] hover:bg-[#2bff95] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0px_#000] transition flex items-center gap-2"
            >
              <TrendingUp className="w-5 h-5 text-black" />
              BUY ON LAUNCHPAD
            </a>

            <a
              href={`https://robinhoodchain.blockscout.com/token/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 font-['Space_Grotesk'] font-bold text-sm tracking-wide text-white bg-[#15151e] border-3 border-black rounded-2xl shadow-[5px_5px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_#000] hover:border-neutral-500 active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0px_#000] transition flex items-center gap-2"
            >
              VIEW ON EXPLORER
              <ArrowUpRight className="w-4 h-4 text-neutral-400" />
            </a>

            <a
              href="https://x.com/NineDcat"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3.5 font-['Space_Grotesk'] font-bold text-sm tracking-wide text-white bg-[#0e0e14] border-2 border-neutral-700 rounded-2xl hover:border-white transition flex items-center gap-2"
            >
              <span className="font-['Titan_One']">𝕏</span> COMMUNITY
            </a>
          </div>

          {/* Quick Contract Copy Bar */}
          <div className="w-full max-w-lg pt-1">
            <div className="flex items-center justify-between bg-[#12121a] border-2 border-neutral-800 rounded-xl px-3.5 py-2 text-xs font-['JetBrains_Mono'] shadow-inner">
              <div className="flex items-center gap-2 text-neutral-400 truncate mr-2">
                <span className="text-[#ffb703] font-bold">CA:</span>
                <span className="text-neutral-200 truncate select-all">{CONTRACT_ADDRESS}</span>
              </div>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-3 py-1 bg-neutral-800 hover:bg-[#ff6b9d] text-neutral-200 hover:text-black font-bold rounded-lg transition border border-neutral-700 text-xs shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-black" />
                    COPIED
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    COPY
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px] text-neutral-500 font-['JetBrains_Mono'] px-1 mt-1.5">
              <span>*VERIFY CONTRACT BEFORE SWAPPING</span>
              <span>NO TAX • LP BURNED</span>
            </div>
          </div>

        </div>

        {/* Right Column: Dominant Mascot Visual (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          
          {/* Comic Action Background Burst */}
          <div className="absolute w-[280px] h-[280px] sm:w-[420px] sm:h-[420px] rounded-full bg-gradient-to-tr from-[#ff6b9d]/30 via-[#ffb703]/20 to-[#00e676]/20 blur-2xl -z-10 animate-pulse" />

          {/* Interactive Dominant Mascot Cutout */}
          <div
            onClick={handleMascotClick}
            className="relative cursor-pointer group select-none transition-transform active:scale-95"
            title="Click the mascot to meow and launch!"
          >
            {/* Mascot Image with floating animation */}
            <div className="animate-float">
              <img
                src="/assets/mascot_main.webp"
                alt="Nine the Cat - Official Mascot"
                className="w-[280px] sm:w-[380px] md:w-[440px] xl:w-[480px] h-auto object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)] hover:scale-105 transition-transform duration-300"
                loading="eager"
              />
            </div>

            {/* Playful Comic Speech Bubble */}
            <div className="absolute -top-3 -right-2 sm:-right-6 bg-white text-black font-['Titan_One'] text-xs sm:text-sm px-3.5 py-1.5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_#000] rotate-[8deg] group-hover:rotate-[14deg] transition-transform animate-bounce">
              NINE THE CAT HAS 9 LIVES! 👅
              <div className="absolute -bottom-2 left-4 w-3 h-3 bg-white border-r-3 border-b-3 border-black rotate-45" />
            </div>

            {/* Click Count Badge */}
            {mascotBoings > 0 && (
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#ffb703] text-black font-['Titan_One'] text-xs px-3 py-0.5 rounded-full border-2 border-black shadow-[2px_2px_0px_#000] whitespace-nowrap animate-bounce">
                BOINGS: {mascotBoings} 🐾
              </div>
            )}
          </div>

          {/* Small Trading Screen Terminal Pill under Mascot */}
          <div className="mt-6 bg-[#12121a]/90 border-2 border-black rounded-xl px-4 py-2 shadow-[4px_4px_0px_#000] flex items-center gap-3 font-['JetBrains_Mono'] text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00e676] animate-pulse" />
              <span className="text-white font-bold">STATE:</span>
            </div>
            <span className="text-[#00e676] font-bold">UNSTOPPABLE</span>
            <span className="text-neutral-500">|</span>
            <span className="text-neutral-400">RESISTED ZERO: 8 TIMES</span>
          </div>

        </div>

      </div>
    </section>
  );
};
