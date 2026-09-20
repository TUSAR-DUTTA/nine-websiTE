'use client';

import React from 'react';
import { useNine } from '@/context/NineContext';
import { X, Flame, ShieldAlert, CheckCircle, HelpCircle } from 'lucide-react';

export function FumbleExplainerModal() {
  const { fumbleExplainerOpen, setFumbleExplainerOpen } = useNine();

  if (!fumbleExplainerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-mono">
      <div className="relative w-full max-w-xl rounded border border-nine-border bg-nine-surface p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-nine-border pb-3 mb-4">
          <div className="flex items-center gap-2 text-xs text-nine-red font-bold uppercase">
            <Flame className="h-4 w-4" />
            <span>FUMBLE DETECTION ENGINE LOGIC</span>
          </div>
          <button
            onClick={() => setFumbleExplainerOpen(false)}
            className="text-zinc-500 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-zinc-300 leading-relaxed">
          <p>
            The <strong className="text-white">Fumble Detection Engine</strong> is a backend heuristic service that processes decentralized exchange liquidity pool swaps in real-time.
          </p>

          <div className="rounded border border-nine-border bg-black/50 p-3 space-y-2">
            <div className="text-white font-bold text-[11px]">MATHEMATICAL TRIGGER CONDITIONS:</div>
            <ul className="list-disc pl-4 space-y-1 text-zinc-400">
              <li>Wallet sells &gt;40% of its total $NINE balance.</li>
              <li>Price recovers &gt;20% within 48 hours following the transaction.</li>
              <li>Wallet subsequently re-enters at a higher price, OR misses out on a +100%+ run.</li>
            </ul>
          </div>

          <div className="rounded border border-nine-redDark/60 bg-nine-redDark/20 p-3 text-nine-red text-[11px] font-bold">
            COMMUNITY PRINCIPLE:
            <br />
            No doxxing. No harassment. All wallet addresses are abbreviated. Reactions are purely humorous and celebratory of the inevitable comeback.
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setFumbleExplainerOpen(false)}
            className="rounded bg-white px-4 py-1.5 text-xs font-bold text-black hover:bg-zinc-200"
          >
            ACKNOWLEDGE
          </button>
        </div>
      </div>
    </div>
  );
}
