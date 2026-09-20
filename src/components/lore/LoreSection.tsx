'use client';

import React from 'react';
import { Terminal, Shield, Zap, Sparkles, Flame } from 'lucide-react';

export function LoreSection() {
  return (
    <section id="lore" className="relative w-full border-b border-nine-border bg-nine-bg py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 font-mono text-center">
        <div className="inline-flex items-center gap-2 text-xs text-nine-green uppercase tracking-widest mb-3 font-bold">
          <Terminal className="h-4 w-4" />
          <span>THE CORE MANIFESTO</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
          $NINE × $GME
          <br />
          <span className="text-nine-green glow-green">THE COMEBACK PHILOSOPHY</span>
        </h2>

        {/* Manifesto Content */}
        <div className="mt-10 rounded border border-nine-border bg-nine-surface/70 p-8 sm:p-12 text-left space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-nine-green/5 blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-nine-border/70 pb-6 mb-6">
            <img
              src="/assets/mascot/mascot_main.webp"
              alt="Mascot Conviction"
              className="h-28 w-28 object-contain drop-shadow-[0_0_25px_rgba(0,255,102,0.3)] shrink-0"
            />
            <div>
              <p className="text-base sm:text-2xl font-black text-white leading-relaxed">
                Every cat has nine lives.
                <br />
                <span className="text-nine-green glow-green">But some cats just refuse to stay dead.</span>
              </p>
              <p className="text-sm sm:text-base text-zinc-300 mt-1 font-bold">
                That’s $NINE.
              </p>
            </div>
          </div>

          <div className="border-y border-nine-border/70 py-6 my-6 space-y-3 text-sm text-zinc-300">
            <div><strong className="text-white">GME</strong> is the comeback.</div>
            <div><strong className="text-nine-green">NINE</strong> is the nine lives.</div>
          </div>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
            The chart can crash.
            <br />
            The timeline can go quiet.
            <br />
            People can call it dead.
          </p>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
            But the cat still has lives left.
          </p>

          <div className="rounded border border-nine-border bg-black/60 p-5 space-y-2 text-xs sm:text-sm text-nine-gold font-bold">
            <div>Every crash is another chapter.</div>
            <div>Every comeback is another chapter.</div>
            <div>The community writes the story.</div>
          </div>

          <div className="pt-4 text-center">
            <span className="text-base sm:text-lg font-black text-white tracking-wider">
              9 LIVES. ONE COMEBACK AT A TIME.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
