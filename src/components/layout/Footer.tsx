'use client';

import React, { useState } from 'react';
import { TOKEN_INFO } from '@/lib/data';
import { useNine } from '@/context/NineContext';
import { Terminal, Shield, Copy, Check, ExternalLink, Activity } from 'lucide-react';

export function Footer() {
  const { setActiveTab } = useNine();
  const [copied, setCopied] = useState(false);

  const copyCA = () => {
    navigator.clipboard.writeText(TOKEN_INFO.contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="w-full border-t border-nine-border bg-black text-xs font-mono text-nine-muted py-12 pb-24 md:pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Top Status Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border border-nine-border/70 bg-nine-surface/40 p-4 mb-8">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase">SYS_NODE</div>
            <div className="text-white font-bold flex items-center gap-1.5 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-nine-green" />
              ONLINE [14ms]
            </div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase">EMBODIMENT</div>
            <div className="text-nine-gold font-bold mt-0.5">$GME RETAIL SPIRIT</div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase">NETWORK</div>
            <div className="text-nine-green font-bold mt-0.5">ROBINHOOD (4663)</div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase">TOTAL_SUPPLY</div>
            <div className="text-white font-bold mt-0.5">1,000,000,000 NINE</div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-8 items-start md:items-center">
          <div className="flex items-start gap-4">
            <img
              src="/assets/mascot/mascot_moonwatcher.webp"
              alt="Mascot Moonwatcher"
              className="h-16 w-auto object-contain rounded-lg border border-nine-border hidden sm:block drop-shadow-[0_0_15px_rgba(0,255,102,0.2)]"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base tracking-wider">$NINE</span>
                <span className="text-nine-green">×</span>
                <span className="font-bold text-white text-base tracking-wider">$GME</span>
              </div>
              <p className="mt-1 text-zinc-400 text-xs max-w-md leading-relaxed">
                Every cat has nine lives. But some cats just refuse to stay dead.
                That is $NINE. The on-chain monument to the GameStop retail uprising.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-zinc-600">CONTRACT:</span>
                <span className="text-zinc-300 text-[11px] select-all bg-nine-surface px-2 py-0.5 rounded border border-nine-border font-mono">
                  {TOKEN_INFO.contractAddress}
                </span>
                <button
                  onClick={copyCA}
                  className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  title="Copy Contract Address"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-nine-green" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
                <a
                  href="https://www.ponsfamily.com/launchpad/0x697518845e7c5DEE323720871D8bE03F9D3Fc901"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-nine-green hover:underline text-[11px] font-bold ml-1"
                >
                  Pons Family Launchpad ↗
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">TERMINAL</span>
              <button
                onClick={() => setActiveTab('TERMINAL')}
                className="text-zinc-300 hover:text-nine-green text-left transition-colors"
              >
                OVERVIEW
              </button>
              <button
                onClick={() => setActiveTab('GME_SAGA')}
                className="text-zinc-300 hover:text-nine-gold text-left transition-colors"
              >
                GME CHRONICLE
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">COMMUNITY</span>
              <button
                onClick={() => setActiveTab('FUMBLES')}
                className="text-zinc-300 hover:text-nine-red text-left transition-colors"
              >
                FUMBLE BOARD
              </button>
              <button
                onClick={() => setActiveTab('BAGS')}
                className="text-zinc-300 hover:text-nine-green text-left transition-colors"
              >
                BAGS & WORKERS
              </button>
            </div>
          </div>
        </div>

        {/* Disclaimer & Transparency Note */}
        <div className="mt-8 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row justify-between gap-4 text-[10px] text-zinc-600">
          <p>
            $NINE is a decentralized community memecoin honoring GameStop retail resilience history. Not financial advice. Always conduct your own research.
          </p>
          <div className="flex items-center gap-4">
            <span>VERSION 2.0.0-PROD</span>
            <span>BUILD: GME_UPRISING</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
