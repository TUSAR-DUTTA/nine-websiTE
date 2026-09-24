'use client';

import React, { useState } from 'react';
import { TOKEN_INFO } from '@/lib/data';
import { useNine } from '@/context/NineContext';
import { soundManager } from '@/lib/sound';
import {
  TrendingUp,
  Activity,
  Flame,
  ArrowRight,
  ShieldCheck,
  Zap,
  Terminal,
  Copy,
  Check,
  BookOpen,
  Trophy,
  Volume2,
  Radio,
} from 'lucide-react';

interface MascotEntry {
  quote: string;
  image: string;
  label: string;
  badge: string;
  status: string;
}

const MASCOT_ENTRIES: MascotEntry[] = [
  {
    quote: "What's an exit strategy? Nine the Cat's 9th life is eternal.",
    image: "/assets/mascot/meme_nine_standing.webp",
    label: "NINE THE CAT (CANON)",
    badge: "OFFICIAL MASCOT",
    status: "SOVEREIGN COMEBACK",
  },
  {
    quote: "WE ARE GOING TO PARALLEL UNIVERSES! UNHINGED VICTORY!",
    image: "/assets/mascot/mascot_main.webp",
    label: "NINE THE CAT (VICTORY)",
    badge: "SHORT SQUEEZE",
    status: "SURVIVED: 140% SHORT",
  },
  {
    quote: "You panic-sell on red candles. I adjust my tie and accumulate. We are not the same.",
    image: "/assets/mascot/meme_wallstreet_suit.webp",
    label: "NINE THE CAT (CEO MODE)",
    badge: "$3B WAR CHEST",
    status: "LIQUIDITY: FORTRESS",
  },
  {
    quote: "A toast to the shorts who thought Life 8 was our last one.",
    image: "/assets/mascot/meme_gatsby_toast.webp",
    label: "NINE THE CAT (GATSBY)",
    badge: "COMEBACK UNLOCKED",
    status: "PROFIT: PARABOLIC",
  },
  {
    quote: "As foretold in the sacred scrolls: The ninth life never runs out.",
    image: "/assets/mascot/meme_ancient_sage.webp",
    label: "NINE THE CAT (ANCIENT SAGE)",
    badge: "SACRED SCROLL",
    status: "PROPHECY: FULFILLED",
  },
  {
    quote: "Red candles everywhere? Oblivious. Unbothered. Just enjoying my giant strawberry.",
    image: "/assets/mascot/meme_strawberry_zen.webp",
    label: "NINE THE CAT (ZEN BERRY)",
    badge: "ZEN HODLER",
    status: "ZEN MODE: 100%",
  },
  {
    quote: "Hi! Are you here to declare me dead or join the comeback?",
    image: "/assets/mascot/meme_baby_hi.webp",
    label: "NINE THE CAT (BABY HI)",
    badge: "HE SAYS HI",
    status: "LIVES: 9 / 9 INTACT",
  },
];

export function HeroSection() {
  const { setActiveTab } = useNine();
  const [copiedCA, setCopiedCA] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<'CHART' | 'MASCOT'>('MASCOT');
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  const currentMascot = MASCOT_ENTRIES[currentQuoteIndex % MASCOT_ENTRIES.length];

  const copyContract = () => {
    soundManager.playClick();
    navigator.clipboard.writeText(TOKEN_INFO.contractAddress);
    setCopiedCA(true);
    setTimeout(() => setCopiedCA(false), 2000);
  };

  const cycleQuote = () => {
    soundManager.playClick();
    setCurrentQuoteIndex((prev) => (prev + 1) % MASCOT_ENTRIES.length);
  };

  return (
    <section className="relative w-full border-b border-nine-border bg-nine-bg pt-8 pb-14 overflow-hidden">
      {/* Background CRT & Subtle Gradients */}
      <div className="absolute inset-0 crt-scanlines opacity-30 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-nine-green/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Top Status Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-nine-border/60 pb-3.5 mb-7 font-mono">
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1.5 rounded bg-nine-surface px-2.5 py-1 text-xs font-bold border shadow-sm ${
              TOKEN_INFO.isLive
                ? 'text-nine-green border-nine-borderHighlight shadow-[0_0_12px_rgba(0,255,102,0.15)]'
                : 'text-nine-gold border-amber-500/40 shadow-[0_0_12px_rgba(255,215,0,0.15)]'
            }`}>
              <span className={`h-2 w-2 rounded-full ${TOKEN_INFO.isLive ? 'bg-nine-green animate-ping' : 'bg-nine-gold animate-pulse'}`} />
              STATUS: {TOKEN_INFO.status} (CHAIN ID: 4663)
            </span>
            <span className="text-xs text-zinc-400 hidden sm:inline">
              ROBINHOOD CHAIN MAINNET /// EMBODIMENT OF $GME UPRISING
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500">CHAIN:</span>
            <span className="text-nine-gold font-bold">ROBINHOOD (4663)</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-500">LAUNCHPAD:</span>
            <a
              href="https://www.ponsfamily.com/launchpad/0x697518845e7c5DEE323720871D8bE03F9D3Fc901"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-nine-gold font-bold underline transition-colors"
            >
              PONS FAMILY ↗
            </a>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400 font-mono">SUPPLY: 1,000,000,000</span>
          </div>
        </div>

        {/* Core Hero Grid: Left Content, Right Interactive Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT 7 COLS: Typography, Manifesto & Quick Action Buttons */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-nine-gold uppercase tracking-widest mb-3 font-bold">
              <Zap className="h-3.5 w-3.5 text-nine-gold" />
              <span>THE GAMESTOP FALL & UPRISING SAGA</span>
            </div>

            <h1 className="font-mono text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-white leading-[0.95]">
              $NINE × $GME
              <br />
              <span className="text-nine-green glow-green">9 LIVES.</span>
              <br />
              ONE MORE COMEBACK.
            </h1>

            <div className="mt-5 border-l-2 border-nine-green/60 pl-4 py-1 font-mono">
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl">
                Wall Street shorted GameStop 140% and declared it dead.
                They turned off the buy button. They flooded media with "Forget GameStop".
                Yet retail held with diamond paws, rising from $2.50 to $483+.
              </p>
              <p className="mt-2 text-xs sm:text-sm text-nine-gold font-bold">
                $NINE is the on-chain monument to that eternal retail uprising.
                A cat has nine lives — no hedge fund or dark pool can ever extinguish the ninth life.
              </p>
            </div>

            {/* Live Metrics Quad (100% Real Token Parameters) */}
            <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="rounded border border-nine-border bg-nine-surface/90 p-3 shadow-inner">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">TOTAL SUPPLY</div>
                <div className="text-lg font-black text-white mt-0.5">1 BILLION</div>
                <div className="text-[11px] text-nine-green font-bold flex items-center mt-0.5">
                  1,000,000,000 $NINE
                </div>
              </div>

              <div className="rounded border border-nine-border bg-nine-surface/90 p-3 shadow-inner">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">CHAIN</div>
                <div className="text-lg font-black text-nine-gold mt-0.5">MAINNET</div>
                <div className="text-[10px] text-zinc-400 mt-0.5">CHAIN ID: 4663</div>
              </div>

              <div className="rounded border border-nine-border bg-nine-surface/90 p-3 shadow-inner">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">ECOSYSTEM</div>
                <div className="text-lg font-black text-white mt-0.5">ROBINHOOD</div>
                <div className="text-[10px] text-nine-green font-bold mt-0.5">ARBITRUM L2</div>
              </div>

              <div className="rounded border border-nine-border bg-nine-surface/90 p-3 shadow-inner">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">STATUS</div>
                <div className={`text-lg font-black mt-0.5 ${TOKEN_INFO.isLive ? 'text-nine-green' : 'text-nine-gold'}`}>
                  {TOKEN_INFO.status}
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">ROBINHOOD MAINNET</div>
              </div>
            </div>

            {/* Action Buttons to Switch Tabs */}
            <div className="mt-7 flex flex-wrap items-center gap-3 font-mono text-xs">
              <a
                href="https://www.ponsfamily.com/launchpad/0x697518845e7c5DEE323720871D8bE03F9D3Fc901"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => soundManager.playClick()}
                className="flex items-center gap-2 rounded bg-nine-green px-5 py-3 font-black text-black hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(0,255,102,0.4)] transition-all uppercase tracking-wider shadow-lg"
              >
                <Zap className="h-4 w-4 fill-black" />
                <span>BUY ON LAUNCHPAD</span>
              </a>

              <button
                onClick={() => {
                  soundManager.playClick();
                  const el = document.getElementById('gme-saga');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else setActiveTab('GME_SAGA');
                }}
                className="flex items-center gap-2 rounded border border-nine-borderHighlight bg-nine-surface px-5 py-3 font-bold text-white hover:border-nine-green hover:text-nine-green transition-all uppercase"
              >
                <BookOpen className="h-4 w-4" />
                <span>EXPLORE GME SAGA</span>
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  setActiveTab('FUMBLES');
                }}
                className="flex items-center gap-2 rounded border border-nine-borderHighlight bg-nine-surface px-5 py-3 font-bold text-nine-red hover:bg-red-950/30 transition-all uppercase"
              >
                <Flame className="h-4 w-4 text-nine-red" />
                <span>FUMBLE BOARD</span>
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  setActiveTab('BAGS');
                }}
                className="flex items-center gap-2 rounded border border-nine-borderHighlight bg-nine-surface px-4 py-3 font-bold text-white hover:border-nine-green hover:text-nine-green transition-all uppercase"
              >
                <Trophy className="h-4 w-4 text-nine-gold" />
                <span>BAG WORKERS</span>
              </button>
            </div>
          </div>

          {/* RIGHT 5 COLS: Interactive Panel (Mascot Recon or GME Saga Anatomy) */}
          <div className="lg:col-span-5 flex flex-col gap-3 font-mono">
            <div className="rounded-xl border border-nine-border bg-nine-surface overflow-hidden shadow-2xl">
              {/* Header Bar with View Toggle */}
              <div className="flex items-center justify-between border-b border-nine-border bg-nine-elevated px-3 py-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                  <span className="text-zinc-400 text-[11px] ml-1">TERMINAL_HUD.SYS</span>
                </div>

                <div className="flex items-center gap-1 text-[10px]">
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setRightPanelTab('MASCOT');
                    }}
                    className={`px-2 py-0.5 rounded font-bold transition-all ${
                      rightPanelTab === 'MASCOT'
                        ? 'bg-nine-green text-black'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    NINE THE CAT
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setRightPanelTab('CHART');
                    }}
                    className={`px-2 py-0.5 rounded font-bold transition-all ${
                      rightPanelTab === 'CHART'
                        ? 'bg-nine-green text-black'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    GME SAGA CHART
                  </button>
                </div>
              </div>

              {/* VIEW 1: OFFICIAL MEME MASCOT DOSSIER */}
              {rightPanelTab === 'MASCOT' && (
                <div className="relative p-5 bg-[#08080c] flex flex-col">
                  {/* Mascot Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-nine-border/70 mb-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-2 w-2 rounded-full bg-nine-green animate-ping shrink-0" />
                      <span className="text-xs font-bold text-white tracking-wider truncate">
                        {currentMascot.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-nine-gold font-bold px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 shrink-0">
                      {currentMascot.badge}
                    </span>
                  </div>

                  {/* Mascot Frame with Ambient Lighting */}
                  <div className="relative h-64 w-full rounded-lg border border-nine-green/30 bg-gradient-to-b from-black via-zinc-950 to-black flex items-center justify-center overflow-hidden group shadow-inner">
                    {/* Glowing circular aura backdrop */}
                    <div className="absolute w-48 h-48 rounded-full bg-nine-green/10 blur-2xl pointer-events-none group-hover:bg-nine-green/20 transition-all" />

                    {/* Scanline CRT overlay */}
                    <div className="absolute inset-0 crt-scanlines opacity-20 pointer-events-none" />

                    {/* Mascot Visual */}
                    <img
                      key={currentMascot.image}
                      src={currentMascot.image}
                      alt={currentMascot.label}
                      className="relative z-10 h-56 w-auto object-contain filter drop-shadow-[0_0_20px_rgba(0,255,102,0.25)] group-hover:scale-105 transition-transform duration-300 animate-in fade-in zoom-in-95 duration-200"
                    />

                    {/* HUD Scanner Badges */}
                    <div className="absolute top-2 left-2 z-20 text-[9px] bg-black/80 px-2 py-0.5 rounded text-nine-green font-mono border border-nine-green/40">
                      {currentMascot.status}
                    </div>
                    <div className="absolute bottom-2 left-2 z-20 text-[9px] bg-black/80 px-2 py-0.5 rounded text-zinc-400 font-mono border border-zinc-800">
                      VARIANT {((currentQuoteIndex % MASCOT_ENTRIES.length) + 1)} / {MASCOT_ENTRIES.length}
                    </div>
                  </div>

                  {/* Mascot Transmission Speech Box */}
                  <div
                    onClick={cycleQuote}
                    className="mt-4 rounded border border-nine-border bg-nine-surface/90 p-3 relative cursor-pointer hover:border-nine-green/60 transition-colors group"
                  >
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
                      <span className="flex items-center gap-1 text-nine-green font-bold">
                        <Radio className="h-3 w-3" />
                        <span>MASCOT TRANSMISSION</span>
                      </span>
                      <span className="group-hover:text-nine-green transition-colors">CLICK TO CYCLE</span>
                    </div>

                    <p className="text-xs text-white font-bold italic leading-relaxed">
                      "{currentMascot.quote}"
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-nine-border flex items-center justify-between gap-3">
                    <button
                      onClick={cycleQuote}
                      className="w-full flex items-center justify-center gap-2 rounded bg-nine-green py-2 px-3 text-xs font-black text-black hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(0,255,102,0.25)] uppercase tracking-wider"
                    >
                      <Radio className="h-4 w-4" />
                      <span>NEXT TRANSMISSION</span>
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW 2: HISTORIC GME SAGA CHART */}
              {rightPanelTab === 'CHART' && (
                <div className="p-4 bg-[#0a0a0e]">
                  {/* Header */}
                  <div className="p-2 border-b border-nine-border/60 bg-black/40 flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="relative h-9 w-9 rounded border border-nine-green/60 bg-nine-bg overflow-hidden flex items-center justify-center shadow">
                        <img
                          src="/assets/mascot/mascot_head_favicon.webp"
                          alt="Cat Head"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">THE GAMESTOP SAGA ANATOMY</div>
                        <div className="text-[10px] text-zinc-400">2020 to Present Day On-Chain</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('GME_SAGA')}
                      className="text-[10px] text-nine-green hover:underline font-bold"
                    >
                      FULL SAGA →
                    </button>
                  </div>

                  <div className="h-48 w-full relative">
                    <svg viewBox="0 0 500 200" className="h-full w-full overflow-visible">
                      <line x1="0" y1="40" x2="500" y2="40" stroke="#1c1c28" strokeDasharray="3 3" />
                      <line x1="0" y1="90" x2="500" y2="90" stroke="#1c1c28" strokeDasharray="3 3" />
                      <line x1="0" y1="140" x2="500" y2="140" stroke="#1c1c28" strokeDasharray="3 3" />

                      <defs>
                        <linearGradient id="heroGmeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00ff66" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#00ff66" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      <path
                        d="
                          M 10 170 
                          L 50 170 
                          L 90 160 
                          L 140 130 
                          L 180 20 
                          L 210 160 
                          L 250 50 
                          L 300 120 
                          L 370 130 
                          L 420 60 
                          L 490 35
                        "
                        fill="none"
                        stroke="#00ff66"
                        strokeWidth="2.5"
                      />

                      <path
                        d="
                          M 10 170 
                          L 50 170 
                          L 90 160 
                          L 140 130 
                          L 180 20 
                          L 210 160 
                          L 250 50 
                          L 300 120 
                          L 370 130 
                          L 420 60 
                          L 490 35 
                          L 490 200 
                          L 10 200 Z
                        "
                        fill="url(#heroGmeGradient)"
                      />

                      {/* Peak Point: $483 Short Squeeze */}
                      <circle cx="180" cy="20" r="4" fill="#00ff66" />
                      <text x="135" y="14" fill="#00ff66" fontSize="9" fontWeight="bold">
                        $483 PEAK SQUEEZE
                      </text>

                      {/* Crash Point: Buy button turned off */}
                      <circle cx="210" cy="160" r="4" fill="#ff3344" />
                      <text x="155" y="180" fill="#ff3344" fontSize="8.5" fontWeight="bold">
                        BUY BUTTON HALT ($40)
                      </text>

                      {/* Second Peak: Hearings & Kitty double down */}
                      <circle cx="250" cy="50" r="4" fill="#ffd700" />
                      <text x="255" y="48" fill="#ffd700" fontSize="8.5" fontWeight="bold">
                        "I LIKE THE STOCK" ($348)
                      </text>

                      {/* Present point: The On-Chain Immortality */}
                      <circle cx="490" cy="35" r="5" fill="#00ff66" className="animate-ping" />
                      <circle cx="490" cy="35" r="4" fill="#00ff66" />
                      <text x="390" y="30" fill="#00ff66" fontSize="9" fontWeight="bold">
                        $NINE ON-CHAIN ▲
                      </text>
                    </svg>
                  </div>

                  {/* Milestone labels */}
                  <div className="mt-2 grid grid-cols-3 gap-2 pt-2 border-t border-nine-border/70 text-[10px]">
                    <div>
                      <span className="text-zinc-500">2020:</span> <span className="text-zinc-300">140% Shorted</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">2021:</span> <span className="text-nine-green font-bold">+18,000% Run</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">NOW:</span> <span className="text-nine-gold font-bold">Immortal Lore</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Telemetry Bar */}
              <div className="border-t border-nine-border bg-nine-elevated p-2.5 px-3 flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">STATUS: NO EXIT STRATEGY</span>
                <span className="text-nine-green font-bold">RETAIL IMMORTAL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
