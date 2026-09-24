'use client';

import React from 'react';
import { BAG_LEADERS } from '@/lib/data';
import { useNine } from '@/context/NineContext';
import { soundManager } from '@/lib/sound';
import { Trophy, ArrowUpRight, ShieldCheck, Flame, Zap, Award } from 'lucide-react';

export function BagBoardSection() {
  const { openProfileModal } = useNine();

  return (
    <section id="bag-board" className="relative w-full border-b border-nine-border bg-nine-bg py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-nine-border pb-6 mb-8">
          <div className="flex items-start gap-4">
            <img
              src="/assets/mascot/meme_shocked_duo.webp"
              alt="Mascot Shocked Duo"
              className="h-20 w-auto object-contain drop-shadow-[0_0_15px_rgba(0,255,102,0.25)] hidden sm:block"
            />
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-nine-green uppercase tracking-widest mb-1 font-bold">
                <Trophy className="h-4 w-4" />
                <span>DYNAMIC ON-CHAIN RECOGNITION</span>
              </div>
              <h2 className="font-mono text-3xl sm:text-4xl font-black tracking-tight text-white">
                THE BAG BOARD
              </h2>
              <p className="mt-1 text-xs sm:text-sm font-mono text-zinc-400 max-w-xl">
                Honoring the titans, the relentless accumulators, the chaos engines, and the survivors who refused to let the cat die.
                Not levels — purely calculated behavioral titles.
              </p>
            </div>
          </div>

          <div className="text-xs font-mono text-zinc-500">
            METRICS RECALCULATED EVERY 100 BLOCKS
          </div>
        </div>

        {/* Leaders Grid / Launch-ready empty state */}
        {BAG_LEADERS.length === 0 ? (
          <div className="rounded-2xl border border-nine-border bg-gradient-to-b from-[#12131c]/90 via-[#0d0e14]/90 to-[#08080c] p-12 text-center text-zinc-400 font-mono shadow-xl relative overflow-hidden">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 mb-4 text-nine-gold">
              <Trophy className="h-8 w-8 text-nine-gold animate-bounce" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
              TOKEN OFFICIALLY LAUNCHED • INDEXING ON-CHAIN HOLDERS
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-xl mx-auto leading-relaxed">
              $NINE is officially live on Pons Family Launchpad! On-chain bag holders, accumulator titans, and top conviction wallets are being automatically indexed here as blocks are mined on Robinhood Chain Mainnet.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://www.ponsfamily.com/launchpad/0x697518845e7c5DEE323720871D8bE03F9D3Fc901"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded bg-nine-green px-4 py-2 text-xs text-black font-black hover:bg-emerald-400 transition-all uppercase shadow-md"
              >
                <Zap className="h-3.5 w-3.5 fill-black" />
                <span>BUY ON LAUNCHPAD</span>
              </a>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/30 px-3.5 py-1 text-xs text-emerald-400 font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>LISTENING FOR ON-CHAIN ACCUMULATION</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 font-mono">
            {BAG_LEADERS.map((item) => (
              <div
                key={item.id}
                onClick={() => openProfileModal(item.profile)}
                className="group cursor-pointer rounded border border-nine-border bg-nine-surface p-5 hover:border-nine-green transition-all hover:shadow-[0_0_20px_rgba(0,255,102,0.12)] flex flex-col justify-between"
              >
                <div>
                  {/* Category Header */}
                  <div className="flex items-center justify-between border-b border-nine-border/70 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-nine-gold px-2 py-0.5 rounded bg-amber-950/40 border border-amber-500/30">
                        {item.category}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500">RANK #{item.rank}</span>
                  </div>

                  <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-4">
                    {item.categoryTagline}
                  </div>

                  {/* Profile Snapshot */}
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={item.profile.avatarUrl}
                      alt={item.profile.displayName}
                      className="h-12 w-12 rounded border border-nine-border group-hover:border-nine-green transition-colors object-cover"
                    />
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-nine-green transition-colors flex items-center gap-1.5">
                        <span>{item.profile.displayName}</span>
                        {item.profile.isVerifiedX && (
                          <span className="text-blue-400 text-[10px]">✓</span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        @{item.profile.twitterHandle}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {item.profile.shortAddress}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stat Highlight Box */}
                <div className="mt-4 pt-3 border-t border-nine-border/70 flex items-center justify-between">
                  <div>
                    <div className="text-base font-black text-white group-hover:text-nine-green transition-colors">
                      {item.highlightStat}
                    </div>
                    <div className="text-[10px] text-zinc-400 font-medium">
                      {item.highlightLabel}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-zinc-400 group-hover:text-white transition-colors">
                    <span>VIEW DOSSIER</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
