import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Rocket, Menu, X, ExternalLink, Sparkles, Terminal } from 'lucide-react';
import { soundFx } from '@/utils/audio';

export const Navbar: React.FC = () => {
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    soundFx.enabled = next;
    if (next) soundFx.playCash();
  };

  const handleLaunchCat = () => {
    window.dispatchEvent(new CustomEvent('nine:launch-cat'));
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top Degen Ticker Marquee */}
      <div className="bg-[#ffb703] text-black border-b-2 border-black overflow-hidden py-1 select-none font-['JetBrains_Mono'] text-xs font-black tracking-wider uppercase">
        <div className="animate-marquee flex items-center whitespace-nowrap">
          <span className="mx-4 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            LIVE FEED: $NINE NINE-LIVES PROTOCOL
          </span>
          <span className="mx-4">●</span>
          <span className="mx-4 font-extrabold text-[#990022]">GME = THE COMEBACK // NINE = THE NINE LIVES</span>
          <span className="mx-4">●</span>
          <span className="mx-4 text-emerald-950 font-black">LIVES REMAINING: 9/9 [IMMORTAL MODE]</span>
          <span className="mx-4">●</span>
          <span className="mx-4">OBITUARY STATUS: REJECTED BY CAT</span>
          <span className="mx-4">●</span>
          <span className="mx-4 font-extrabold">“HE'S STILL GOT LIVES”</span>
          <span className="mx-4">●</span>
          <span className="mx-4 text-purple-900 font-bold">ROARING VOLATILITY INBOUND</span>
          <span className="mx-4">●</span>
          {/* Repeat loop for seamless scroll */}
          <span className="mx-4 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            LIVE FEED: $NINE NINE-LIVES PROTOCOL
          </span>
          <span className="mx-4">●</span>
          <span className="mx-4 font-extrabold text-[#990022]">GME = THE COMEBACK // NINE = THE NINE LIVES</span>
          <span className="mx-4">●</span>
          <span className="mx-4 text-emerald-950 font-black">LIVES REMAINING: 9/9 [IMMORTAL MODE]</span>
          <span className="mx-4">●</span>
          <span className="mx-4">OBITUARY STATUS: REJECTED BY CAT</span>
          <span className="mx-4">●</span>
          <span className="mx-4 font-extrabold">“HE'S STILL GOT LIVES”</span>
        </div>
      </div>

      {/* Main Navbar */}
      <nav
        className={`transition-all duration-200 border-b ${
          scrolled
            ? 'bg-[#08080a]/95 backdrop-blur-md border-[#23232e] py-2.5 shadow-2xl'
            : 'bg-[#08080a]/80 backdrop-blur-sm border-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <a
            href="#"
            className="flex items-center gap-3 group"
            onClick={() => soundFx.playMeow()}
          >
            <div className="relative w-11 h-11 rounded-2xl bg-[#ff6b9d] border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_#000] group-hover:scale-105 group-hover:rotate-[-4deg] transition-transform">
              <img
                src="/assets/mascot_head_favicon.webp"
                alt="NINE Cat Logo"
                className="w-10 h-10 object-contain drop-shadow-sm"
              />
              <span className="absolute -bottom-1 -right-1 bg-[#ffb703] text-black text-[9px] font-['Titan_One'] px-1 rounded-sm border border-black leading-none">
                9
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-['Titan_One'] text-2xl tracking-tight text-white group-hover:text-[#ff6b9d] transition-colors">
                  NINE
                </span>
                <span className="bg-[#00e676]/20 text-[#00e676] text-[10px] font-['JetBrains_Mono'] font-bold px-1.5 py-0.5 rounded border border-[#00e676]/30">
                  $NINE
                </span>
              </div>
              <span className="text-[10px] font-['JetBrains_Mono'] text-neutral-400 tracking-wider">
                THE 9-LIVES COMEBACK
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6 font-['Space_Grotesk'] text-sm font-bold tracking-wide">
            <a
              href="#lore"
              className="text-neutral-300 hover:text-[#ff6b9d] transition-colors flex items-center gap-1"
            >
              LORE
            </a>
            <a
              href="#ninelives"
              className="text-neutral-300 hover:text-[#ff6b9d] transition-colors flex items-center gap-1"
            >
              9 LIVES
            </a>
            <a
              href="#comeback"
              className="text-neutral-300 hover:text-[#00e676] transition-colors flex items-center gap-1"
            >
              COMEBACK
            </a>
            <a
              href="#gme-archive"
              className="text-neutral-300 hover:text-[#ffb703] transition-colors flex items-center gap-1"
            >
              GME ARCHIVE
            </a>
            <a
              href="#memes"
              className="text-neutral-300 hover:text-[#ff6b9d] transition-colors flex items-center gap-1"
            >
              MEME VAULT
            </a>
            <a
              href="#token"
              className="text-neutral-300 hover:text-white transition-colors"
            >
              TOKEN
            </a>
          </div>

          {/* Controls & Actions */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* Audio Toggle */}
            <button
              onClick={toggleAudio}
              className="p-2 rounded-lg border border-neutral-700/60 bg-[#12121a] text-neutral-400 hover:text-white hover:border-neutral-500 transition"
              title={audioEnabled ? 'Mute 8-bit Audio' : 'Unmute 8-bit Audio'}
            >
              {audioEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-[#00e676]" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-neutral-500" />
              )}
            </button>

            {/* Launch Cat – icon-only compact */}
            <button
              onClick={handleLaunchCat}
              className="p-2 rounded-lg border border-neutral-700/60 bg-[#12121a] text-[#ffb703] hover:text-[#ffd454] hover:border-[#ffb703]/50 transition"
              title="Launch the flying cat mascot projectile!"
            >
              <Rocket className="w-3.5 h-3.5" />
            </button>

            {/* Separator dot */}
            <span className="w-1 h-1 rounded-full bg-neutral-700" />

            {/* Enter Community Terminal – primary CTA */}
            <button
              onClick={(e) => {
                soundFx.playCash();
                window.dispatchEvent(
                  new CustomEvent('nine:break-glass', {
                    detail: { clientX: e.clientX, clientY: e.clientY },
                  })
                );
              }}
              className="relative inline-flex items-center gap-2 pl-3.5 pr-4 py-2 font-['Space_Grotesk'] text-xs font-bold tracking-wider uppercase text-[#00e676] bg-[#00e676]/10 hover:bg-[#00e676]/20 border border-[#00e676]/40 hover:border-[#00e676]/70 rounded-lg transition-all group cursor-pointer"
              title="Enter the Community Terminal"
            >
              <Terminal className="w-3.5 h-3.5 text-[#00e676] group-hover:scale-110 transition-transform" />
              <span>TERMINAL</span>
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e676] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00e676]"></span>
              </span>
            </button>

            {/* Buy CTA */}
            <a
              href="#token"
              onClick={() => soundFx.playCash()}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 font-['Titan_One'] text-xs tracking-wide text-black bg-[#00e676] border-2 border-black rounded-lg shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000] hover:bg-[#33ff99] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_#000] transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              BUY $NINE
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleAudio}
              className="p-2 rounded-lg border border-neutral-700 bg-[#16161f] text-neutral-300"
            >
              {audioEnabled ? <Volume2 className="w-4 h-4 text-[#00e676]" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg border-2 border-black bg-[#ff6b9d] text-black shadow-[2px_2px_0px_#000]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t-2 border-black bg-[#0e0e14] px-4 pt-3 pb-6 space-y-3 font-['Space_Grotesk'] text-base font-bold shadow-2xl">
            <div className="flex flex-col space-y-2">
              <a
                href="#lore"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-neutral-800 text-neutral-200"
              >
                LORE
              </a>
              <a
                href="#ninelives"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-neutral-800 text-neutral-200"
              >
                9 LIVES COMIC
              </a>
              <a
                href="#comeback"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-neutral-800 text-[#00e676]"
              >
                COMEBACK VISUAL
              </a>
              <a
                href="#gme-archive"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-neutral-800 text-[#ffb703]"
              >
                GME NEWS ARCHIVE
              </a>
              <a
                href="#memes"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-neutral-800 text-[#ff6b9d]"
              >
                MEME VAULT
              </a>
              <a
                href="#token"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-neutral-800 text-white"
              >
                TOKEN & CONTRACT
              </a>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  soundFx.playCash();
                  window.dispatchEvent(
                    new CustomEvent('nine:break-glass', {
                      detail: { clientX: e.clientX, clientY: e.clientY },
                    })
                  );
                }}
                className="w-full flex items-center justify-center gap-2 py-3 font-['Titan_One'] text-black bg-[#ffb703] border-2 border-black rounded-xl shadow-[4px_4px_0px_#000] active:translate-y-0.5 transition cursor-pointer text-sm"
              >
                <Terminal className="w-4 h-4" />
                ENTER COMMUNITY TERMINAL
              </button>

              <button
                onClick={() => {
                  handleLaunchCat();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 font-['Titan_One'] text-black bg-[#ff6b9d] border-2 border-black rounded-xl shadow-[3px_3px_0px_#000]"
              >
                <Rocket className="w-4 h-4" />
                YEET CAT PROJECTILE
              </button>
              <a
                href="#token"
                onClick={() => {
                  soundFx.playCash();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 font-['Titan_One'] text-black bg-[#00e676] border-2 border-black rounded-xl shadow-[4px_4px_0px_#000]"
              >
                <Sparkles className="w-4 h-4" />
                BUY $NINE
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
