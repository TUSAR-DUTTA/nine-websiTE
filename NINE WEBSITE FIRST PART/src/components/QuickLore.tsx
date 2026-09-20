import React from 'react';
import { ArrowDown, Flame, Skull, RefreshCw, Zap, Sparkles } from 'lucide-react';
import { soundFx } from '../utils/audio';

export const QuickLore: React.FC = () => {
  return (
    <section id="lore" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#0a0a0e] border-y-2 border-black">
      {/* Background Graphic Grid */}
      <div className="absolute inset-0 bg-halftone opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffb703]/15 border border-[#ffb703]/30 text-[#ffb703] text-xs font-['JetBrains_Mono'] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            UNDERSTAND THE LORE IN 5 SECONDS
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-['Titan_One'] tracking-tight text-white leading-tight">
            GME WAS THE <span className="text-[#00e676]">COMEBACK</span>.<br />
            NINE IS THE <span className="text-[#ff6b9d]">NINE LIVES</span>.
          </h2>

          <p className="text-base sm:text-lg text-neutral-300 font-['Space_Grotesk'] leading-relaxed">
            GameStop ($GME) became the greatest comeback story in market history. 
            $NINE turned that exact phenomenon into a pink drooling cat that simply refuses to stay buried.
          </p>
        </div>

        {/* The 5-Step Visual Lore Flow */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative mb-16">
          
          {/* Step 1: The Rise */}
          <div className="bg-[#12121a] border-3 border-black rounded-2xl p-5 shadow-[5px_5px_0px_#000] relative flex flex-col justify-between hover:translate-y-[-4px] transition-transform">
            <div className="flex items-center justify-between mb-4">
              <span className="font-['Titan_One'] text-xl text-[#00e676]">01</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-[#00e676] text-[10px] font-['JetBrains_Mono'] font-bold uppercase">
                THE SQUEEZE
              </span>
            </div>
            <div>
              <h3 className="font-['Titan_One'] text-lg text-white mb-2">GME SURGE</h3>
              <p className="text-xs text-neutral-400 font-['Space_Grotesk'] leading-relaxed">
                Retail band of degenerates breaks Wall Street. +1,600% green candle sends ripples across the world.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-800 text-[11px] font-['JetBrains_Mono'] text-neutral-500">
              STATUS: EUPHORIA
            </div>
          </div>

          {/* Step 2: The Downfall */}
          <div className="bg-[#140e10] border-3 border-black rounded-2xl p-5 shadow-[5px_5px_0px_#ff3344] relative flex flex-col justify-between hover:translate-y-[-4px] transition-transform">
            <div className="flex items-center justify-between mb-4">
              <span className="font-['Titan_One'] text-xl text-red-500">02</span>
              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-['JetBrains_Mono'] font-bold uppercase">
                BUY PAUSED
              </span>
            </div>
            <div>
              <h3 className="font-['Titan_One'] text-lg text-white mb-2">THE FALL</h3>
              <p className="text-xs text-neutral-400 font-['Space_Grotesk'] leading-relaxed">
                Brokers shut off the buy button. The chart cascades -80%. Red needles drop like rain.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-800 text-[11px] font-['JetBrains_Mono'] text-red-400">
              STATUS: CHAOS & CRASH
            </div>
          </div>

          {/* Step 3: Counted Out */}
          <div className="bg-[#0e0e14] border-3 border-black rounded-2xl p-5 shadow-[5px_5px_0px_#000] relative flex flex-col justify-between hover:translate-y-[-4px] transition-transform">
            <div className="flex items-center justify-between mb-4">
              <span className="font-['Titan_One'] text-xl text-neutral-400">03</span>
              <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 text-[10px] font-['JetBrains_Mono'] font-bold uppercase">
                OBITUARY
              </span>
            </div>
            <div>
              <h3 className="font-['Titan_One'] text-lg text-white mb-2">“IT’S DEAD”</h3>
              <p className="text-xs text-neutral-400 font-['Space_Grotesk'] leading-relaxed">
                Pundits write the tombstone: <br />
                <span className="italic text-neutral-300">“The meme stock era is officially extinct.”</span>
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-800 text-[11px] font-['JetBrains_Mono'] text-neutral-500">
              STATUS: COUNTED OUT
            </div>
          </div>

          {/* Step 4: The Comeback */}
          <div className="bg-[#121812] border-3 border-black rounded-2xl p-5 shadow-[5px_5px_0px_#00e676] relative flex flex-col justify-between hover:translate-y-[-4px] transition-transform">
            <div className="flex items-center justify-between mb-4">
              <span className="font-['Titan_One'] text-xl text-[#00e676]">04</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-[#00e676] text-[10px] font-['JetBrains_Mono'] font-bold uppercase">
                RESURRECTION
              </span>
            </div>
            <div>
              <h3 className="font-['Titan_One'] text-lg text-white mb-2">THE RETURN</h3>
              <p className="text-xs text-neutral-400 font-['Space_Grotesk'] leading-relaxed">
                A single gamer tweet wakes up the universe. Millions rush back in. The dead cat bounces to orbit.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-800 text-[11px] font-['JetBrains_Mono'] text-[#00e676]">
              STATUS: WE ARE SO BACK
            </div>
          </div>

          {/* Step 5: $NINE Mascot */}
          <div className="bg-[#1a1016] border-3 border-black rounded-2xl p-5 shadow-[5px_5px_0px_#ff6b9d] relative flex flex-col justify-between hover:translate-y-[-4px] transition-transform">
            <div className="flex items-center justify-between mb-4">
              <span className="font-['Titan_One'] text-xl text-[#ff6b9d]">05</span>
              <span className="px-2 py-0.5 rounded bg-[#ff6b9d]/20 text-[#ff6b9d] text-[10px] font-['JetBrains_Mono'] font-bold uppercase">
                $NINE BORN
              </span>
            </div>
            <div>
              <h3 className="font-['Titan_One'] text-lg text-[#ff6b9d] mb-2">9 LIVES</h3>
              <p className="text-xs text-neutral-300 font-['Space_Grotesk'] leading-relaxed">
                The entire cycle immortalized into one unhinged cat. Each dump is just life #8 burning for life #9.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-800 text-[11px] font-['JetBrains_Mono'] text-[#ff6b9d] font-bold">
              STATUS: UNKILLABLE
            </div>
          </div>

        </div>

        {/* Feature Spotlight Card */}
        <div className="bg-gradient-to-r from-[#14141e] via-[#1a121c] to-[#14141e] border-3 border-black rounded-3xl p-6 sm:p-10 shadow-[8px_8px_0px_#000] relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4 text-left">
              <div className="inline-block px-3 py-1 bg-[#ff6b9d] text-black font-['Titan_One'] text-xs rounded-full border-2 border-black shadow-[2px_2px_0px_#000]">
                THE CORE LORE DECREE
              </div>

              <h3 className="text-2xl sm:text-4xl font-['Titan_One'] text-white leading-tight">
                “THIS CAT DIDN'T READ THE OBITUARY.”
              </h3>

              <p className="text-neutral-300 font-['Space_Grotesk'] text-sm sm:text-base leading-relaxed">
                Every other crypto project panics when charts drop. $NINE looks at a -70% candle and says: 
                <span className="text-[#ffb703] font-bold"> “Sweet, that was only Life 3. I still have six more in the chamber.”</span> 
                This isn't another generic cat meme. It's the physical embodiment of the greatest retail comeback cult on earth.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#ninelives"
                  onClick={() => soundFx.playBoing()}
                  className="px-5 py-2.5 font-['Titan_One'] text-xs uppercase text-black bg-[#ffb703] border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#000] transition"
                >
                  EXPLORE THE 9 LIVES COMIC ➔
                </a>
                <span className="text-xs font-['JetBrains_Mono'] text-neutral-400">
                  LORE DIFFICULTY: 5 SECONDS TO LEARN
                </span>
              </div>
            </div>

            {/* Mascot in closet / drawing preview */}
            <div className="lg:col-span-4 flex justify-center relative">
              <div className="relative group cursor-pointer" onClick={() => soundFx.playMeow()}>
                <img
                  src="/assets/mascot_closet.webp"
                  alt="NINE Undercover Mascot"
                  className="w-48 sm:w-60 h-auto object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform"
                />
                <div className="absolute -bottom-2 -left-4 bg-[#ff6b9d] text-black font-['Titan_One'] text-[11px] px-2.5 py-1 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] rotate-[-6deg]">
                  SECRET LIFE #6 🎨
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
