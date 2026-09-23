'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useNine } from '@/context/NineContext';
import { TOKEN_INFO } from '@/lib/data';
import { TabType } from '@/types';
import { soundManager } from '@/lib/sound';
import { PixelCatAnimator } from '@/components/mascot/PixelCatAnimator';
import {
  Volume2,
  VolumeX,
  Wallet,
  Shield,
  ExternalLink,
  TrendingUp,
  Activity,
  Terminal,
  BookOpen,
  Flame,
  Trophy,
  Copy,
  Check,
} from 'lucide-react';

export function Header() {
  const {
    activeTab,
    setActiveTab,
    setViewLayer,
    isConnected,
    connectedProfile,
    setWalletModalOpen,
    openProfileModal,
    isSoundMuted,
    toggleSound,
    liveFeed,
    setAdminModalOpen,
  } = useNine();

  const [copiedContract, setCopiedContract] = useState(false);

  const copyContract = () => {
    soundManager.playClick();
    navigator.clipboard.writeText(TOKEN_INFO.contractAddress);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  const navTabs: { id: TabType; label: string; icon: React.ReactNode; tag?: string }[] = [
    { id: 'TERMINAL', label: 'TERMINAL', icon: <Terminal className="h-3.5 w-3.5" /> },
    { id: 'FUMBLES', label: 'FUMBLES', icon: <Flame className="h-3.5 w-3.5 text-nine-red" /> },
    { id: 'BAGS', label: 'BAG WORKERS', icon: <Trophy className="h-3.5 w-3.5 text-nine-gold" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-nine-border bg-nine-bg/95 backdrop-blur-md">
      {/* 1. TOP LIVE ROLLING MARQUEE TICKER */}
      <div className="relative flex h-8 w-full items-center overflow-hidden border-b border-nine-border/60 bg-black/70 px-4 text-xs font-mono text-nine-muted">
        <div className="flex items-center gap-2 pr-4 text-nine-green shrink-0 font-semibold border-r border-nine-border/80">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-nine-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-nine-green"></span>
          </span>
          <span className="tracking-wider text-[11px]">$NINE LIVE FEED</span>
        </div>

        <div className="flex overflow-x-hidden whitespace-nowrap py-1">
          <div className="inline-flex animate-marquee gap-8 items-center text-xs">
            {liveFeed.concat(liveFeed).map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="inline-flex items-center gap-2 cursor-pointer hover:text-nine-text transition-colors"
                onClick={() => item.profileId && openProfileModal(item.profileId)}
              >
                <span className={`px-1.5 py-0.5 text-[10px] uppercase font-bold rounded ${
                  item.type === 'BUY' ? 'bg-nine-greenMuted text-nine-green border border-nine-green/30' :
                  item.type === 'FUMBLE' ? 'bg-nine-redDark text-nine-red border border-nine-red/30' :
                  item.type === 'COMEBACK' ? 'bg-amber-950/80 text-nine-amber border border-amber-500/30' :
                  'bg-zinc-800 text-zinc-300 border border-zinc-700'
                }`}>
                  {item.type}
                </span>
                <span className="font-semibold text-nine-text">{item.title}:</span>
                <span className="text-zinc-400">{item.detail}</span>
                {item.value && (
                  <span className={`font-bold ${item.type === 'FUMBLE' ? 'text-nine-red' : 'text-nine-green'}`}>
                    {item.value}
                  </span>
                )}
                <span className="text-[10px] text-zinc-600">[{item.timestamp}]</span>
                <span className="text-zinc-700">{"///"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER BAR */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand & Market Snapshot */}
        <div className="flex items-center gap-5">
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('TERMINAL');
            }}
            className="flex items-center gap-3 group text-left"
            title="Return to Terminal"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-sm border border-nine-green/60 bg-nine-surface group-hover:border-nine-green transition-all shadow-[0_0_15px_rgba(0,255,102,0.2)] overflow-hidden">
              <img
                src="/assets/mascot/mascot_head_favicon.webp"
                alt="$NINE Mascot"
                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-nine-green rounded-full ring-2 ring-black animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-lg font-black tracking-tight text-white group-hover:text-nine-green transition-colors">
                  $NINE
                </span>
                <span className="text-[10px] font-mono text-zinc-500 font-bold">×</span>
                <span className="font-mono text-xs font-bold text-nine-green">
                  $GME
                </span>
              </div>
              <p className="text-[10px] font-mono text-zinc-400 tracking-wide hidden sm:block">
                EMBODIMENT OF GAMESTOP RESILIENCE
              </p>
            </div>
          </button>

          {/* Quick Contract Copy */}
          <button
            onClick={copyContract}
            className="hidden lg:flex items-center gap-1.5 rounded border border-nine-border bg-nine-surface/70 px-2 py-1 text-[11px] font-mono text-nine-muted hover:border-zinc-500 hover:text-white transition-all"
            title="Click to copy contract address"
          >
            <span className="text-zinc-500">CA:</span>
            <span>
              {TOKEN_INFO.contractAddress.startsWith('0x')
                ? `${TOKEN_INFO.contractAddress.slice(0, 6)}...${TOKEN_INFO.contractAddress.slice(-4)}`
                : 'LAUNCHING SOON'}
            </span>
            <span className="text-[9px] text-nine-green ml-1 font-bold">
              {copiedContract ? 'COPIED!' : 'COPY'}
            </span>
          </button>
        </div>

        {/* Live Market Chips (Desktop) */}
        <div className="hidden xl:flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 rounded border border-nine-border bg-nine-surface/80 px-2.5 py-1">
            <span className="text-zinc-500 text-[10px]">PRICE</span>
            <span className="font-bold text-white">
              {TOKEN_INFO.priceUSD > 0 ? `$${TOKEN_INFO.priceUSD.toFixed(5)}` : 'LAUNCHING SOON'}
            </span>
            {TOKEN_INFO.change24h > 0 && (
              <span className="flex items-center text-nine-green font-bold text-[10px]">
                <TrendingUp className="h-3 w-3 mr-0.5" />
                +{TOKEN_INFO.change24h}%
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 rounded border border-nine-border bg-nine-surface/80 px-2.5 py-1">
            <span className="text-zinc-500 text-[10px]">MCAP</span>
            <span className="font-bold text-white">
              {TOKEN_INFO.marketCapUSD > 0 ? `$${(TOKEN_INFO.marketCapUSD / 1000000).toFixed(2)}M` : 'TBA'}
            </span>
          </div>

          <div className="flex items-center gap-2 rounded border border-nine-border bg-nine-surface/80 px-2.5 py-1">
            <span className="text-zinc-500 text-[10px]">HOLDERS</span>
            <span className="font-bold text-nine-green">{TOKEN_INFO.holdersCount.toLocaleString()}</span>
          </div>
        </div>

        {/* Right Actions: Audio, Admin, Wallet */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSound}
            className={`p-2 rounded border transition-all ${
              isSoundMuted
                ? 'border-nine-border text-zinc-500 hover:text-zinc-300'
                : 'border-nine-green text-nine-green bg-nine-greenMuted/40 shadow-[0_0_10px_rgba(0,255,102,0.2)]'
            }`}
            title={isSoundMuted ? 'Unmute Terminal Audio' : 'Mute Terminal Audio'}
          >
            {isSoundMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <button
            onClick={() => setAdminModalOpen(true)}
            className="p-2 rounded border border-nine-border text-zinc-500 hover:text-zinc-300 hover:border-zinc-400 transition-all"
            title="Admin Protocol Gateway"
          >
            <Shield className="h-4 w-4" />
          </button>

          {isConnected && connectedProfile ? (
            <button
              onClick={() => openProfileModal(connectedProfile)}
              className="flex items-center gap-2 rounded border border-nine-green/60 bg-nine-greenMuted/20 px-3 py-1.5 text-xs font-mono text-white hover:border-nine-green hover:bg-nine-greenMuted/40 transition-all shadow-[0_0_12px_rgba(0,255,102,0.15)]"
            >
              {connectedProfile.equippedPet ? (
                <div className="h-6 w-6 overflow-hidden flex items-center justify-center">
                  <PixelCatAnimator
                    catId={connectedProfile.equippedPetCatId || 1}
                    action="idle"
                    size={24}
                    interactiveMeowOnClick={false}
                  />
                </div>
              ) : (
                <div className="h-2 w-2 rounded-full bg-nine-green animate-pulse" />
              )}
              <div className="flex flex-col text-left">
                <span className="font-bold text-nine-green leading-none">{connectedProfile.displayName}</span>
                <span className="text-[10px] text-zinc-400 leading-none mt-0.5">{connectedProfile.shortAddress}</span>
              </div>
            </button>
          ) : (
            <button
              onClick={() => setWalletModalOpen(true)}
              className="flex items-center gap-2 rounded border border-nine-borderHighlight bg-white px-3.5 py-1.5 text-xs font-mono font-bold text-black hover:bg-nine-green hover:border-nine-green transition-all shadow-sm"
            >
              <Wallet className="h-3.5 w-3.5" />
              <span>CONNECT</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. MULTI-TAB COMMAND NAVIGATION STRIP (Fixes page clutter) */}
      <div className="hidden md:flex w-full border-t border-nine-border/70 bg-[#0a0a0e] px-4 sm:px-6 overflow-x-auto">
        <div className="mx-auto flex max-w-7xl w-full items-center gap-1 font-mono text-xs py-1">
          {/* Back to First Layer / Landing Page */}
          <button
            onClick={() => {
              soundManager.playClick();
              setViewLayer('LANDING');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs font-bold text-black bg-[#ffb703] hover:bg-[#ffd454] transition shadow-[0_0_10px_rgba(255,183,3,0.3)] mr-2 cursor-pointer shrink-0"
            title="Return to $NINE Landing Page & Lore"
          >
            <span>🐱 LANDING LOBBY</span>
          </button>

          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-t font-bold transition-all relative select-none ${
                  isActive
                    ? 'bg-nine-surface text-white border-t-2 border-nine-green shadow-[0_-2px_10px_rgba(0,255,102,0.15)]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.tag && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-950 text-nine-gold border border-amber-500/40">
                    {tab.tag}
                  </span>
                )}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-nine-green" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
