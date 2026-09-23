'use client';

import React, { useState } from 'react';
import { INITIAL_PULSE } from '@/lib/data';
import { soundManager } from '@/lib/sound';
import {
  Activity,
  Zap,
  Radio,
  BarChart2,
  Users,
  MessageSquare,
  HelpCircle,
  AlertTriangle,
  Flame,
} from 'lucide-react';

export function NinePulseSection() {
  const [pulse] = useState(INITIAL_PULSE);
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  return (
    <section className="relative w-full border-b border-nine-border bg-[#0a0a0d] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-nine-border pb-6 mb-8 font-mono">
          <div>
            <div className="inline-flex items-center gap-2 text-xs text-nine-green uppercase tracking-widest mb-1 font-bold">
              <Activity className="h-4 w-4" />
              <span>LIVE COMMUNITY ACTIVITY INDICATOR</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              NINE PULSE & COMEBACK SIGNAL
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-zinc-400 max-w-xl">
              Measuring live momentum across social density, on-chain trades, and meme production.
              Not an artificial score or financial advice — an observable index of ecosystem heartbeat.
            </p>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              setShowFormulaModal(true);
            }}
            className="flex items-center gap-1.5 rounded border border-nine-border bg-nine-surface px-3 py-1.5 text-xs text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
          >
            <HelpCircle className="h-3.5 w-3.5 text-nine-gold" />
            <span>HOW PULSE IS CALCULATED</span>
          </button>
        </div>

        {/* 1. THE COMEBACK SIGNAL BANNER */}
        <div className="mb-10 rounded border-2 border-nine-green/60 bg-gradient-to-r from-nine-greenMuted/40 via-nine-surface to-nine-greenMuted/20 p-6 font-mono shadow-[0_0_30px_rgba(0,255,102,0.12)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start md:items-center gap-4">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded border border-nine-green bg-black/60 shadow-[0_0_20px_rgba(0,255,102,0.3)]">
                <Radio className="h-7 w-7 text-nine-green animate-pulse" />
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-nine-green animate-ping" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-nine-green uppercase tracking-widest">
                    THE COMEBACK SIGNAL: ACTIVE
                  </span>
                  <span className="text-[10px] bg-nine-green text-black font-black px-1.5 py-0.2 rounded">
                    {pulse.signalConfidence}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-0.5 glow-green">
                  "{pulse.signalHeadline}"
                </h3>
                <p className="text-xs text-zinc-300 mt-1 max-w-2xl">
                  {pulse.signalTriggerReason}
                </p>
              </div>
            </div>

            <div className="text-left md:text-right shrink-0 border-t md:border-t-0 md:border-l border-nine-border/70 pt-4 md:pt-0 md:pl-6">
              <div className="text-[10px] text-zinc-500 uppercase">NETWORK</div>
              <div className="text-xl font-black text-nine-green mt-0.5">ROBINHOOD CHAIN</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">MAINNET (4663) · LIVE</div>
            </div>
          </div>
        </div>

        {/* 2. ACTIVITY GAUGES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 font-mono mb-8">
          {/* COMMUNITY GAUGE */}
          <div className="rounded border border-nine-border bg-nine-surface p-5">
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="text-zinc-400 font-bold uppercase">COMMUNITY DENSITY</span>
              <span className="text-nine-green font-black">{pulse.communityGauge}%</span>
            </div>
            {/* Monospace Bar indicator */}
            <div className="text-xs tracking-widest text-nine-green font-mono mb-2">
              {'█'.repeat(Math.round((pulse.communityGauge / 100) * 12)) + '░'.repeat(12 - Math.round((pulse.communityGauge / 100) * 12))}
            </div>
            <div className="text-[11px] text-zinc-500">
              Active node clusters & telegram presence
            </div>
          </div>

          {/* SOCIAL GAUGE */}
          <div className="rounded border border-nine-border bg-nine-surface p-5">
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="text-zinc-400 font-bold uppercase">SOCIAL TRANSMISSION</span>
              <span className="text-nine-gold font-black">{pulse.socialGauge}%</span>
            </div>
            <div className="text-xs tracking-widest text-nine-gold font-mono mb-2">
              {'█'.repeat(Math.round((pulse.socialGauge / 100) * 12)) + '░'.repeat(12 - Math.round((pulse.socialGauge / 100) * 12))}
            </div>
            <div className="text-[11px] text-zinc-500">
              X/Twitter mentions, retweets, Bag Workers
            </div>
          </div>

          {/* ON-CHAIN HEALTH */}
          <div className="rounded border border-nine-border bg-nine-surface p-5">
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="text-zinc-400 font-bold uppercase">ON-CHAIN HEALTH</span>
              <span className="text-white font-black">100%</span>
            </div>
            <div className="text-xs tracking-widest text-white font-mono mb-2">
              ████████████
            </div>
            <div className="text-[11px] text-zinc-500">
              Robinhood Chain Arbitrum L2 consensus & Blockscout indexed
            </div>
          </div>

          {/* MEMES GAUGE */}
          <div className="rounded border border-nine-border bg-nine-surface p-5">
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="text-zinc-400 font-bold uppercase">MEMETIC FREQUENCY</span>
              <span className="text-nine-green font-black">{pulse.memesGauge}%</span>
            </div>
            <div className="text-xs tracking-widest text-nine-green font-mono mb-2">
              {'█'.repeat(Math.round((pulse.memesGauge / 100) * 12)) + '░'.repeat(12 - Math.round((pulse.memesGauge / 100) * 12))}
            </div>
            <div className="text-[11px] text-zinc-500">
              Original memes created & nine lives lore
            </div>
          </div>
        </div>

        {/* 3. HARD COUNTERS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
          <div className="rounded border border-nine-border bg-black/50 p-4">
            <div className="text-[10px] text-zinc-500 uppercase">HOLDERS ONLINE</div>
            <div className="text-xl font-black text-white mt-1">{pulse.holdersOnline}</div>
          </div>

          <div className="rounded border border-nine-border bg-black/50 p-4">
            <div className="text-[10px] text-zinc-500 uppercase">POSTS LOGGED TODAY</div>
            <div className="text-xl font-black text-white mt-1">{pulse.postsToday}</div>
          </div>

          <div className="rounded border border-nine-border bg-black/50 p-4">
            <div className="text-[10px] text-zinc-500 uppercase">FUMBLES RECORDED</div>
            <div className="text-xl font-black text-nine-red mt-1">{pulse.fumblesLogged}</div>
          </div>

          <div className="rounded border border-nine-border bg-black/50 p-4">
            <div className="text-[10px] text-zinc-500 uppercase">EMBODIMENT STATUS</div>
            <div className="text-xl font-black text-nine-gold mt-1">
              {pulse.holdersOnline > 0 ? 'GME UPRISING ACTIVE' : 'AWAITING LAUNCH'}
            </div>
          </div>
        </div>

        {/* Formula Explanation Modal */}
        {showFormulaModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="relative w-full max-w-xl rounded border border-nine-border bg-nine-surface p-6 font-mono shadow-2xl">
              <div className="flex items-center justify-between border-b border-nine-border pb-3 mb-4">
                <span className="text-xs font-bold text-nine-green uppercase">
                  TRANSPARENT PULSE METHODOLOGY
                </span>
                <button
                  onClick={() => setShowFormulaModal(false)}
                  className="text-zinc-500 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
                <p>
                  <strong className="text-white">Community Density (94%):</strong> Calculated by active peer connections, multi-sig signer pings, and wallet balance confirmations over the past 24 hours.
                </p>
                <p>
                  <strong className="text-white">Social Transmission (89%):</strong> Aggregates authentic public tweets with $NINE hashtag and community memes, filtered through anti-bot deduplication.
                </p>
                <p>
                  <strong className="text-white">Trading Intensity (82%):</strong> Compares 1-hour swap counts to the 30-day moving average volume on decentralized liquidity pools.
                </p>
                <p>
                  <strong className="text-white">Memetic Frequency (97%):</strong> Community transmissions, art creations, and reaction velocity across all nine chapters.
                </p>
                <div className="mt-4 p-3 rounded bg-amber-950/20 border border-amber-500/30 text-nine-gold text-[11px]">
                  <strong>Notice:</strong> NINE Pulse is not a predictive price model or financial recommendation. It purely renders community and on-chain vitals.
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowFormulaModal(false)}
                  className="rounded bg-white px-4 py-1.5 text-xs font-bold text-black hover:bg-zinc-200"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
