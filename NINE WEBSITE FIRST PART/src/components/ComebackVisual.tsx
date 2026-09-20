import React, { useState } from 'react';
import { ArrowRight, Flame, Skull, Zap, Shield, Sparkles } from 'lucide-react';
import { soundFx } from '../utils/audio';

export const ComebackVisual: React.FC = () => {
  const [phase, setPhase] = useState<'down' | 'void' | 'up'>('up');

  const handleSelectPhase = (p: 'down' | 'void' | 'up') => {
    setPhase(p);
    if (p === 'down') soundFx.playGlitch();
    if (p === 'void') soundFx.playMeow();
    if (p === 'up') soundFx.playRevive();
  };

  return (
    <section id="comeback" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#07070a] border-t-2 border-black">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00e676]/15 border border-[#00e676]/30 text-[#00e676] text-xs font-['JetBrains_Mono'] font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            THE METAMORPHOSIS OF A MEME
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-['Titan_One'] text-white leading-tight">
            THE JOURNEY: <br />
            <span className="text-red-500">DOWNFALL</span> ➔ <span className="text-neutral-400">VOID</span> ➔ <span className="text-[#00e676]">COMEBACK</span>
          </h2>

          <p className="text-sm sm:text-base text-neutral-300 font-['Space_Grotesk']">
            Toggle between the three realities of the NINE legend.
          </p>

          {/* Interactive Phase Toggle Tabs */}
          <div className="inline-flex p-1.5 rounded-2xl bg-[#14141c] border-2 border-black shadow-[4px_4px_0px_#000] gap-1.5 mt-4">
            <button
              onClick={() => handleSelectPhase('down')}
              className={`px-4 sm:px-6 py-2 rounded-xl font-['Titan_One'] text-xs sm:text-sm transition ${
                phase === 'down'
                  ? 'bg-red-600 text-white shadow-[2px_2px_0px_#000]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              1. RED / DOWN
            </button>
            <button
              onClick={() => handleSelectPhase('void')}
              className={`px-4 sm:px-6 py-2 rounded-xl font-['Titan_One'] text-xs sm:text-sm transition ${
                phase === 'void'
                  ? 'bg-neutral-700 text-white shadow-[2px_2px_0px_#000]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              2. THE VOID
            </button>
            <button
              onClick={() => handleSelectPhase('up')}
              className={`px-4 sm:px-6 py-2 rounded-xl font-['Titan_One'] text-xs sm:text-sm transition ${
                phase === 'up'
                  ? 'bg-[#00e676] text-black shadow-[2px_2px_0px_#000]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              3. GREEN / UP
            </button>
          </div>
        </div>

        {/* Dynamic Visual Stage Canvas */}
        <div
          className={`relative rounded-3xl border-4 border-black p-6 sm:p-12 transition-all duration-500 shadow-[12px_12px_0px_#000] overflow-hidden min-h-[500px] flex items-center ${
            phase === 'down'
              ? 'bg-gradient-to-b from-[#2a0c10] via-[#1a080a] to-[#0d0406]'
              : phase === 'void'
              ? 'bg-gradient-to-b from-[#121216] via-[#09090c] to-[#040405]'
              : 'bg-gradient-to-b from-[#0c2e17] via-[#081d0f] to-[#040d07]'
          }`}
        >
          {/* Ambient Lighting FX */}
          {phase === 'down' && (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-600/20 via-transparent to-transparent pointer-events-none" />
          )}
          {phase === 'up' && (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#00e676]/25 via-transparent to-transparent pointer-events-none" />
          )}

          {/* Grid lines */}
          <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

          {/* Content Layout */}
          <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Mascot Centerpiece */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center relative order-2 lg:order-1">
              {phase === 'down' && (
                <div className="relative animate-bounce">
                  <img
                    src="/assets/meme_shocked_duo.webp"
                    alt="Shocked Cat Duo"
                    className="w-80 max-w-full h-auto rounded-2xl border-3 border-black shadow-[6px_6px_0px_#000] rotate-[-4deg]"
                  />
                  <div className="absolute -top-3 -left-3 bg-red-600 text-white font-['Titan_One'] text-xs px-3 py-1 rounded-lg border-2 border-black rotate-[-8deg]">
                    BRO IT BROKE THE SUPPORT! 📉
                  </div>
                </div>
              )}

              {phase === 'void' && (
                <div className="relative">
                  <img
                    src="/assets/mascot_stool.webp"
                    alt="Cat Sitting on Stool"
                    className="w-72 sm:w-80 h-auto object-contain filter drop-shadow-[0_0_25px_rgba(255,255,255,0.15)]"
                  />
                  <div className="absolute -top-2 right-0 bg-[#ffb703] text-black font-['Titan_One'] text-xs px-3 py-1 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000]">
                    STILL HERE. WAITING. ⏳
                  </div>
                </div>
              )}

              {phase === 'up' && (
                <div className="relative animate-float">
                  <img
                    src="/assets/mascot_main.webp"
                    alt="Cat Victorious"
                    className="w-80 sm:w-96 h-auto object-contain filter drop-shadow-[0_0_35px_rgba(0,230,118,0.4)]"
                  />
                  <div className="absolute -top-3 -right-2 bg-[#00e676] text-black font-['Titan_One'] text-xs sm:text-sm px-3 py-1 rounded-xl border-2 border-black shadow-[4px_4px_0px_#000] rotate-[8deg]">
                    FULL REVERSAL UNLOCKED! 🚀
                  </div>
                </div>
              )}
            </div>

            {/* Narrative Details */}
            <div className="lg:col-span-6 space-y-6 text-left order-1 lg:order-2">
              
              {phase === 'down' && (
                <>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 font-['JetBrains_Mono'] text-xs font-bold border border-red-500/30">
                    <Skull className="w-3.5 h-3.5" />
                    PHASE 1: THE DISASTER
                  </div>
                  <h3 className="text-3xl sm:text-5xl font-['Titan_One'] text-white">
                    “IT'S OVER. <br />
                    <span className="text-red-500">GOING TO ZERO.”</span>
                  </h3>
                  <p className="text-neutral-300 font-['Space_Grotesk'] text-base sm:text-lg leading-relaxed">
                    The brokers halt trades. The chart bleeds red. Every talking head on TV declares the movement finished. 
                    Weak hands fold. But they forgot one fundamental biological fact about this cat:
                  </p>
                  <div className="p-4 bg-red-950/60 border-2 border-red-800 rounded-xl font-['JetBrains_Mono'] text-xs text-red-300">
                    <span className="font-bold">STATUS:</span> LIVES BURNED: 1 / REMAINING: 8. <br />
                    CAT OPINION: “Just a healthy dip.”
                  </div>
                </>
              )}

              {phase === 'void' && (
                <>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-700/40 text-neutral-300 font-['JetBrains_Mono'] text-xs font-bold border border-neutral-600">
                    <Shield className="w-3.5 h-3.5" />
                    PHASE 2: THE SHADOWS
                  </div>
                  <h3 className="text-3xl sm:text-5xl font-['Titan_One'] text-white">
                    “SILENCE IN <br />
                    <span className="text-[#ffb703]">THE BUNKER.”</span>
                  </h3>
                  <p className="text-neutral-300 font-['Space_Grotesk'] text-base sm:text-lg leading-relaxed">
                    Three years of sideways noise. The tourist traders left. The true believers held. 
                    Quietly, in the darkness, the setup formed for the most ridiculous rerun in history.
                  </p>
                  <div className="p-4 bg-neutral-900 border-2 border-neutral-700 rounded-xl font-['JetBrains_Mono'] text-xs text-neutral-300">
                    <span className="font-bold text-[#ffb703]">STATUS:</span> HEARTBEAT DETECTED. <br />
                    ENERGY: CHARGING UP THE 9TH LIFE.
                  </div>
                </>
              )}

              {phase === 'up' && (
                <>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00e676]/20 text-[#00e676] font-['JetBrains_Mono'] text-xs font-bold border border-[#00e676]/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    PHASE 3: THE GLORY
                  </div>
                  <h3 className="text-3xl sm:text-5xl font-['Titan_One'] text-white">
                    “THE CAT <br />
                    <span className="text-[#00e676]">REFUSED TO DIE.”</span>
                  </h3>
                  <p className="text-neutral-300 font-['Space_Grotesk'] text-base sm:text-lg leading-relaxed">
                    The chart flips green. +110%. Short sellers choke on their morning coffee. 
                    The obituary is shredded into ticker tape. The cat is back, louder and stupider than ever before.
                  </p>
                  <div className="p-4 bg-emerald-950/60 border-2 border-emerald-700 rounded-xl font-['JetBrains_Mono'] text-xs text-[#00e676]">
                    <span className="font-bold">STATUS:</span> IMMORTALITY CONFIRMED. <br />
                    VERDICT: NEVER BET AGAINST THE 9-LIVES MASCOT.
                  </div>
                </>
              )}

              <div className="pt-2">
                <a
                  href="#token"
                  onClick={() => soundFx.playCash()}
                  className="inline-flex items-center gap-2 px-6 py-3 font-['Titan_One'] text-xs uppercase text-black bg-[#00e676] border-2 border-black rounded-xl shadow-[4px_4px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[6px_6px_0px_#000] transition"
                >
                  JOIN THE COMEBACK ➔
                </a>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
