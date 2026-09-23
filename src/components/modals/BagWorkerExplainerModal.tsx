'use client';

import React from 'react';
import { useNine } from '@/context/NineContext';
import { X, Award, HelpCircle } from 'lucide-react';

export function BagWorkerExplainerModal() {
  const { bagWorkerExplainerOpen, setBagWorkerExplainerOpen } = useNine();

  if (!bagWorkerExplainerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-mono">
      <div className="relative w-full max-w-xl rounded border border-nine-border bg-nine-surface p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-nine-border pb-3 mb-4">
          <div className="flex items-center gap-2 text-xs text-nine-gold font-bold uppercase">
            <Award className="h-4 w-4" />
            <span>BAG WORKER SCORING METHODOLOGY</span>
          </div>
          <button
            onClick={() => setBagWorkerExplainerOpen(false)}
            className="text-zinc-500 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-zinc-300 leading-relaxed">
          <p>
            The <strong className="text-white">Bag Worker Score</strong> answers one simple question:
            <br />
            <em className="text-nine-gold">"Who is actually putting in the work for Nine The Cat & $nine?"</em>
          </p>

          {/* Official Target Account Callout */}
          <div className="rounded border border-amber-500/40 bg-gradient-to-r from-amber-950/40 to-black/60 p-3 text-[11px]">
            <div className="text-nine-gold font-bold flex items-center justify-between">
              <span>TARGET ACCOUNT & TICKER SPECIFICATION:</span>
              <a
                href="https://x.com/NineDcat"
                target="_blank"
                rel="noreferrer"
                className="text-white underline hover:text-nine-gold font-bold"
              >
                @NineDcat ↗
              </a>
            </div>
            <p className="text-zinc-300 mt-1 leading-normal">
              The bag worker engine monitors the official account <a href="https://x.com/NineDcat" target="_blank" rel="noreferrer" className="text-nine-gold font-bold hover:underline">https://x.com/NineDcat</a>, targeting the sole ticker <strong className="text-white">$nine</strong> and queries for <strong className="text-white">nine the cat</strong>.
            </p>
          </div>

          <div className="rounded border border-nine-border bg-black/50 p-4 space-y-2">
            <div className="text-white font-bold text-[11px]">THE 4-FACTOR BALANCED FORMULA:</div>
            <div className="font-mono text-nine-gold bg-black p-2.5 rounded text-[11px] select-all border border-amber-500/30">
              Score = Posts(max 30) + ActiveStreak(max 25) + ViralReach(max 35) + Consistency(max 10)
            </div>
            <ul className="list-disc pl-4 space-y-1.5 text-zinc-400 mt-2 text-[11px]">
              <li><strong className="text-white">Post Volume (30 pts max):</strong> Original posts, alpha calls, and telemetry mentions for $nine, "nine the cat", and interactions with @NineDcat on Robinhood Chain.</li>
              <li><strong className="text-white">Active Days & Streak (25 pts max):</strong> Consistent daily presence, rewarding ongoing conviction over bot burst spam.</li>
              <li><strong className="text-white">Viral Timeline Reach (35 pts max):</strong> Logarithmic scaling on impressions (e.g. 19,000 views = 32.1 pts) to reward massive cultural impact without breaking parity.</li>
              <li><strong className="text-white">Consistency (10 pts max):</strong> Unbroken daily engagement and narrative alignment.</li>
            </ul>
          </div>

          <p className="text-[11px] text-zinc-400">
            Automated every 6 hours via Playwright stealth scraper and synced directly to Supabase PostgreSQL. Follower count is decoupled to reward real bag work over passive audience size.
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setBagWorkerExplainerOpen(false)}
            className="rounded bg-white px-4 py-1.5 text-xs font-bold text-black hover:bg-zinc-200"
          >
            ACKNOWLEDGE
          </button>
        </div>
      </div>
    </div>
  );
}
