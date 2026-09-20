import React from 'react';
import { ArrowUp, Heart, Sparkles, Rocket, Terminal } from 'lucide-react';
import { soundFx } from '@/utils/audio';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    soundFx.playBoing();
  };

  return (
    <footer className="relative bg-[#050507] border-t-2 border-black pt-20 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Graphic Grid */}
      <div className="absolute inset-0 bg-halftone opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Giant Footer Mascot Hero Banner */}
        <div className="text-center max-w-4xl mx-auto mb-16 space-y-6">
          <div className="relative inline-block cursor-pointer group" onClick={() => soundFx.playMeow()}>
            <img
              src="/assets/mascot_moonwatcher.webp"
              alt="NINE Cat Looking Up"
              className="w-44 sm:w-60 h-auto mx-auto object-contain filter drop-shadow-[0_0_35px_rgba(255,107,157,0.35)] group-hover:scale-105 transition-transform"
            />
            <div className="absolute -bottom-2 right-0 bg-[#00e676] text-black font-['Titan_One'] text-xs px-3 py-1 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] rotate-[-6deg]">
              LOOKING AT THE MOON 🌕
            </div>
          </div>

          <h2 className="text-4xl sm:text-6xl md:text-7xl font-['Titan_One'] text-white tracking-tight leading-none">
            “STILL GOT <span className="text-[#00e676]">LIVES</span>.”
          </h2>

          <p className="text-base sm:text-xl text-neutral-400 font-['Space_Grotesk'] max-w-xl mx-auto">
            You can ban the buy button. You can publish the obituary. <br />
            <strong className="text-white">This cat isn't going anywhere.</strong>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {/* Enter Community Terminal from Footer */}
            <button
              onClick={(e) => {
                soundFx.playCash();
                window.dispatchEvent(
                  new CustomEvent('nine:break-glass', {
                    detail: { clientX: e.clientX, clientY: e.clientY },
                  })
                );
              }}
              className="px-8 py-3.5 font-['Titan_One'] text-sm tracking-wide text-black bg-[#ffb703] border-3 border-black rounded-2xl shadow-[4px_4px_0px_#00e676] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#00e676] transition flex items-center gap-2 cursor-pointer"
            >
              <Terminal className="w-4 h-4" />
              ENTER COMMUNITY TERMINAL
            </button>

            <a
              href="#token"
              onClick={() => soundFx.playCash()}
              className="px-8 py-3.5 font-['Titan_One'] text-sm tracking-wide text-black bg-[#00e676] border-3 border-black rounded-2xl shadow-[4px_4px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] transition"
            >
              JOIN THE $NINE SQUAD
            </a>

            <button
              onClick={() => window.dispatchEvent(new CustomEvent('nine:launch-cat'))}
              className="px-6 py-3.5 font-['Titan_One'] text-sm tracking-wide text-black bg-[#ff6b9d] border-3 border-black rounded-2xl shadow-[4px_4px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] transition flex items-center gap-2"
            >
              <Rocket className="w-4 h-4" />
              YEET CAT ONE MORE TIME
            </button>
          </div>
        </div>

        {/* Bottom Nav & Legal Line */}
        <div className="pt-12 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-['Space_Grotesk']">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#ff6b9d] border border-black flex items-center justify-center font-['Titan_One'] text-xs text-black">
              9
            </div>
            <span className="font-['Titan_One'] text-sm text-white">$NINE PROTOCOL</span>
            <span className="text-neutral-500">|</span>
            <span className="text-neutral-400 font-['JetBrains_Mono']">
              THE 9-LIVES COMEBACK CAT
            </span>
          </div>

          <div className="flex items-center gap-6 font-bold text-neutral-400">
            <a href="#lore" className="hover:text-white transition">LORE</a>
            <a href="#ninelives" className="hover:text-white transition">9 LIVES</a>
            <a href="#gme-archive" className="hover:text-white transition">ARCHIVE</a>
            <a href="#memes" className="hover:text-white transition">MEMES</a>
            <a href="#token" className="hover:text-white transition">BUY</a>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white hover:border-white transition"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            BACK TO TOP
          </button>

        </div>

        <div className="text-center pt-8 text-[11px] font-['JetBrains_Mono'] text-neutral-600">
          © {new Date().getFullYear()} $NINE Community. Built with 9 lives of relentless meme energy.
        </div>

      </div>
    </footer>
  );
};
