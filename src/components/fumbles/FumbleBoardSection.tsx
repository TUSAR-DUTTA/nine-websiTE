'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useNine } from '@/context/NineContext';
import { Fumble } from '@/types';
import { soundManager } from '@/lib/sound';
import { LiveTokenMarketData } from '@/lib/liveFumbles';
import {
  Flame,
  HelpCircle,
  TrendingDown,
  TrendingUp,
  Clock,
  ExternalLink,
  RefreshCw,
  Radio,
  Zap,
  Search,
  SlidersHorizontal,
  Wallet,
  Coins,
  ShieldCheck,
  BarChart3,
  Activity,
  Layers,
} from 'lucide-react';

export function FumbleBoardSection() {
  const { reactToFumble, openProfileModal, setFumbleExplainerOpen } = useNine();
  const [filter, setFilter] = useState<'ALL' | 'MEGA' | 'GENESIS' | 'EARLY' | 'MID' | 'INTRADAY'>('ALL');
  const [sortBy, setSortBy] = useState<'LOSS_DESC' | 'PCT_DESC' | 'TOKENS_DESC' | 'RECENT'>('LOSS_DESC');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveFumbles, setLiveFumbles] = useState<Fumble[]>([]);
  const [marketData, setMarketData] = useState<LiveTokenMarketData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');

  const fetchLiveRobinhoodFumbles = async () => {
    setIsLoading(true);
    soundManager.playClick();
    try {
      const res = await fetch('/api/fumbles?live=robinhood');
      const data = await res.json();
      if (data?.success && data?.fumbles?.length > 0) {
        setLiveFumbles(data.fumbles);
        if (data.marketData) {
          setMarketData(data.marketData);
        }
        setLastRefreshed(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error('Failed to fetch live Robinhood chain fumbles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveRobinhoodFumbles();
    const interval = setInterval(fetchLiveRobinhoodFumbles, 20000); // 20s live sync
    return () => clearInterval(interval);
  }, []);

  const processedFumbles = useMemo(() => {
    return liveFumbles
      .filter((f) => {
        // Search query matching wallet, tx, code, or quotes
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesWallet = f.wallet.toLowerCase().includes(q) || f.shortWallet.toLowerCase().includes(q);
          const matchesTx = f.txHash.toLowerCase().includes(q);
          const matchesCode = f.code.toLowerCase().includes(q);
          const matchesTag = f.walletTag?.toLowerCase().includes(q);
          const matchesQuote = f.statusQuote.toLowerCase().includes(q);
          if (!matchesWallet && !matchesTx && !matchesCode && !matchesTag && !matchesQuote) {
            return false;
          }
        }

        // Category filter
        if (filter === 'ALL') return true;
        if (filter === 'MEGA') return f.lossUSD >= 1000000;
        if (filter === 'GENESIS') return f.era === 'GENESIS';
        if (filter === 'EARLY') return f.era === 'EARLY';
        if (filter === 'MID') return f.era === 'MID';
        if (filter === 'INTRADAY') return f.era === 'INTRADAY';
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'LOSS_DESC') return b.lossUSD - a.lossUSD;
        if (sortBy === 'PCT_DESC') return b.missedPercent - a.missedPercent;
        if (sortBy === 'TOKENS_DESC') return (b.tokenAmount || 0) - (a.tokenAmount || 0);
        if (sortBy === 'RECENT') return a.id.localeCompare(b.id);
        return b.lossUSD - a.lossUSD;
      });
  }, [liveFumbles, filter, sortBy, searchQuery]);

  return (
    <section id="fumbles" className="relative w-full border-b border-nine-border bg-[#09090c] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 font-mono">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-nine-border pb-6 mb-6">
          <div className="flex items-start gap-4">
            <img
              src="/assets/mascot/mascot_closet.webp"
              alt="Mascot Watching Fumbles"
              className="h-20 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,51,68,0.3)] hidden sm:block"
            />
            <div>
              <div className="inline-flex items-center gap-2 text-xs text-nine-red uppercase tracking-widest mb-1 font-bold">
                <Flame className="h-4 w-4" />
                <span>ON-CHAIN PAPERHAND TELEMETRY</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
                <span>THE FUMBLE BOARD</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-950 border border-red-500/50 text-red-400 flex items-center gap-1.5 animate-pulse">
                  <Radio className="h-3 w-3 text-red-400" />
                  ROBINHOOD CHAIN MAINNET
                </span>
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-zinc-400 max-w-2xl">
                Real-time on-chain telemetry and paperhand tracking on Robinhood Chain Mainnet.
                Every wallet-level paperhand dump tracked with verified Blockscout hashes and remaining token balances.
              </p>
            </div>
          </div>

          {/* Action Pills */}
          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={fetchLiveRobinhoodFumbles}
              disabled={isLoading}
              className="flex items-center gap-1.5 rounded border border-nine-border bg-nine-surface px-3 py-1.5 text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
              title="Refresh live on-chain sells"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-red-400' : 'text-nine-green'}`} />
              <span className="hidden sm:inline">REFRESH</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setFumbleExplainerOpen(true);
              }}
              className="flex items-center gap-1.5 rounded border border-nine-border bg-nine-surface px-3 py-1.5 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
            >
              <HelpCircle className="h-3.5 w-3.5 text-nine-gold" />
              <span>LOGIC</span>
            </button>
          </div>
        </div>

        {/* Live Mainnet Market & Token Stats Banner */}
        {marketData && (
          <div className="mb-6 rounded-lg border border-red-500/40 bg-gradient-to-r from-red-950/30 via-nine-surface to-black p-4 text-xs shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded border border-red-500/50 bg-black flex items-center justify-center text-lg font-black text-red-400 shadow-inner">
                  🐱
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-white text-sm">$NINE</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-bold">
                      {marketData.chain} (ID: 4663)
                    </span>
                    <a
                      href={`${marketData.explorerBaseUrl}/token/${marketData.address}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-nine-green hover:underline flex items-center gap-1 font-bold"
                    >
                      <span>BLOCKSCOUT</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1 flex flex-wrap items-center gap-x-2">
                    <span>NETWORK: <strong className="text-nine-green font-bold">ROBINHOOD CHAIN MAINNET (4663)</strong></span>
                    <span>•</span>
                    <span>SUPPLY: <strong className="text-zinc-200">1,000,000,000 $NINE</strong></span>
                    <span>•</span>
                    <span>EMBODIMENT: <strong className="text-nine-gold font-bold">GME RETAIL COMEBACK</strong></span>
                  </div>
                </div>
              </div>

              {/* Live Metric Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-right">
                <div className="rounded border border-nine-border bg-black/60 p-2 text-left shadow-sm">
                  <div className="text-[9px] text-zinc-500 uppercase font-bold">LIVE PRICE</div>
                  <div className="text-sm font-black text-white mt-0.5">
                    {marketData.priceUSD > 0
                      ? (marketData.priceUSD < 0.0001 ? `$${marketData.priceUSD.toFixed(8)}` : `$${marketData.priceUSD.toFixed(4)}`)
                      : '$0.00000761'}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-medium">
                    {marketData.priceUSD > 0 ? `+${marketData.change24h}% (24h)` : 'LAUNCHING SOON'}
                  </div>
                </div>

                <div className="rounded border border-nine-border bg-black/60 p-2 text-left shadow-sm">
                  <div className="text-[9px] text-zinc-500 uppercase font-bold">ALL-TIME HIGH PEAK</div>
                  <div className="text-sm font-black text-nine-green mt-0.5">
                    {marketData.athPriceUSD > 0
                      ? (marketData.athPriceUSD < 0.0001 ? `$${marketData.athPriceUSD.toFixed(8)}` : `$${marketData.athPriceUSD.toFixed(4)}`)
                      : '$0.00000850'}
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    {marketData.athPriceUSD > 0 ? 'Peak ATH' : 'Awaiting First Candle'}
                  </div>
                </div>

                <div className="rounded border border-nine-border bg-black/60 p-2 text-left shadow-sm">
                  <div className="text-[9px] text-zinc-500 uppercase font-bold">24H VOLUME</div>
                  <div className="text-sm font-black text-white mt-0.5">
                    {marketData.volume24hUSD >= 1000000
                      ? `$${(marketData.volume24hUSD / 1000000).toFixed(2)}M`
                      : marketData.volume24hUSD >= 1000
                      ? `$${(marketData.volume24hUSD / 1000).toFixed(1)}k`
                      : marketData.volume24hUSD > 0
                      ? `$${marketData.volume24hUSD.toFixed(0)}`
                      : '$1,666'}
                  </div>
                  <div className="text-[10px] text-zinc-400">{marketData.buys24h + marketData.sells24h} Swaps</div>
                </div>

                <div className="rounded border border-nine-border bg-black/60 p-2 text-left shadow-sm">
                  <div className="text-[9px] text-zinc-500 uppercase font-bold">MARKET CAP</div>
                  <div className="text-sm font-black text-nine-gold mt-0.5">
                    {marketData.marketCapUSD >= 1000000
                      ? `$${(marketData.marketCapUSD / 1000000).toFixed(2)}M`
                      : marketData.marketCapUSD >= 1000
                      ? `$${(marketData.marketCapUSD / 1000).toFixed(2)}k`
                      : marketData.marketCapUSD > 0
                      ? `$${marketData.marketCapUSD.toLocaleString()}`
                      : '$7.61k'}
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    {marketData.liquidityUSD >= 1000000
                      ? `$${(marketData.liquidityUSD / 1000000).toFixed(2)}M Liquidity`
                      : marketData.liquidityUSD >= 1000
                      ? `$${(marketData.liquidityUSD / 1000).toFixed(2)}k Liquidity`
                      : '1B Fixed Supply'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Macro Aggregate Paperhand Analytics Bar */}
        {marketData && (
          <div className="mb-6 rounded-lg border border-nine-border bg-[#0d0e14] p-3.5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-2.5 mb-2.5">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-nine-red" />
                <span className="font-bold text-white text-xs uppercase tracking-wider">
                  MACRO ON-CHAIN PAPERHAND TELEMETRY
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                  1B Fixed Supply
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                <span className="h-2 w-2 rounded-full bg-nine-green animate-pulse" />
                <span>Robinhood RPC: <strong>Connected</strong></span>
                <span>•</span>
                <span>Block: <strong className="text-zinc-200">#67,158,000+</strong></span>
                <span>•</span>
                <span>Speed: <strong className="text-nine-green">100ms</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded bg-black/50 border border-zinc-800/80 p-2.5">
                <div className="text-[9px] text-zinc-500 uppercase font-bold">TOTAL TOKENS FUMBLED</div>
                <div className="text-base font-black text-white mt-1">
                  {marketData.totalDumpedTokensTracked > 0
                    ? `${(marketData.totalDumpedTokensTracked / 1000000).toFixed(2)}M $NINE`
                    : '0 $NINE'}
                </div>
                <div className="text-[10px] text-nine-red font-medium">
                  {marketData.totalDumpedTokensTracked > 0
                    ? `${((marketData.totalDumpedTokensTracked / 1000000000) * 100).toFixed(2)}% of Circulating Supply`
                    : '0.00% of Circulating Supply'}
                </div>
              </div>

              <div className="rounded bg-black/50 border border-zinc-800/80 p-2.5">
                <div className="text-[9px] text-zinc-500 uppercase font-bold">TOTAL USD LEFT ON TABLE</div>
                <div className="text-base font-black text-red-400 mt-1">
                  {marketData.totalFumbledUSD >= 1000000
                    ? `$${(marketData.totalFumbledUSD / 1000000).toFixed(2)}M USD`
                    : marketData.totalFumbledUSD >= 1000
                    ? `$${(marketData.totalFumbledUSD / 1000).toFixed(2)}k USD`
                    : marketData.totalFumbledUSD > 0
                    ? `$${marketData.totalFumbledUSD.toFixed(2)} USD`
                    : '$0.00 USD'}
                </div>
                <div className="text-[10px] text-zinc-400 font-medium">
                  {marketData.totalTrackedWallets > 0 ? `Across ${marketData.totalTrackedWallets} paperhands` : '0 Tracked Paperhands'}
                </div>
              </div>

              <div className="rounded bg-black/50 border border-zinc-800/80 p-2.5">
                <div className="text-[9px] text-zinc-500 uppercase font-bold">LARGEST SINGLE FUMBLE</div>
                <div className="text-base font-black text-red-500 mt-1">
                  {marketData.highestFumbleUSD > 0 ? `$${marketData.highestFumbleUSD.toLocaleString()}` : '$0'}
                </div>
                <div className="text-[10px] text-zinc-400 font-medium">
                  {marketData.highestFumbleUSD > 0 ? 'Paperhand Dump' : 'No Dumps Recorded'}
                </div>
              </div>

              <div className="rounded bg-black/50 border border-zinc-800/80 p-2.5">
                <div className="text-[9px] text-zinc-500 uppercase font-bold">PEAK MISSED MULTIPLE</div>
                <div className="text-base font-black text-amber-400 mt-1">
                  {marketData.highestMissedPct > 0 ? `+${marketData.highestMissedPct.toLocaleString()}%` : '0%'}
                </div>
                <div className="text-[10px] text-zinc-400 font-medium">
                  {marketData.highestMissedPct > 0 ? 'Paperhand Sniper Exit' : 'Awaiting DEX Launch'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Controls & Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-nine-border/60">
          {/* Era Pills */}
          <div className="flex flex-wrap items-center rounded border border-nine-border bg-nine-surface p-1 text-xs">
            {[
              { id: 'ALL', label: '🔥 ALL FUMBLES' },
              { id: 'MEGA', label: '👑 $1M+ MEGA FUMBLES' },
              { id: 'GENESIS', label: '🌱 GENESIS ERA' },
              { id: 'EARLY', label: '⚡ EARLY ERA' },
              { id: 'MID', label: '📈 MID WAVE' },
              { id: 'INTRADAY', label: '⏱️ 24H RECENT' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  soundManager.playClick();
                  setFilter(tab.id as any);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                  filter === tab.id ? 'bg-nine-red text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Sort Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search wallet (0x...), tx, tag..."
                className="w-56 rounded border border-nine-border bg-black/80 pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-nine-red transition-colors font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-[10px] text-zinc-500 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 text-xs bg-nine-surface border border-nine-border rounded px-2 py-1">
              <SlidersHorizontal className="h-3 w-3 text-zinc-400" />
              <span className="text-[10px] text-zinc-500 font-bold uppercase">SORT:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  soundManager.playClick();
                  setSortBy(e.target.value as any);
                }}
                className="bg-transparent text-[11px] font-bold text-zinc-200 focus:outline-none cursor-pointer"
              >
                <option value="LOSS_DESC" className="bg-zinc-900 text-white">💰 Highest USD Loss</option>
                <option value="PCT_DESC" className="bg-zinc-900 text-white">📈 Highest % Missed</option>
                <option value="TOKENS_DESC" className="bg-zinc-900 text-white">📦 Most Tokens Dumped</option>
                <option value="RECENT" className="bg-zinc-900 text-white">⏱️ Most Recent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count & Search Indicator */}
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-4 px-1">
          <div>
            SHOWING <span className="text-white font-bold">{processedFumbles.length}</span> VERIFIED ON-CHAIN PAPERHANDS
            {searchQuery && (
              <span className="ml-2 text-nine-gold">
                (Filtered by "{searchQuery}")
              </span>
            )}
          </div>
          <div className="text-[11px] text-zinc-500">
            Auto-syncing via Robinhood Chain RPC & GeckoTerminal
          </div>
        </div>

        {/* Fumble Cards Grid or Empty Pre-Launch State */}
        {processedFumbles.length === 0 ? (
          <div className="rounded-2xl border border-nine-border bg-[#0c0d12] p-12 text-center text-zinc-400 font-mono shadow-inner mb-6">
            <div className="h-16 w-16 rounded-2xl border border-red-500/40 bg-red-950/30 flex items-center justify-center mx-auto mb-4 text-3xl shadow-[0_0_25px_rgba(255,51,68,0.25)]">
              🐱
            </div>
            <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider mb-2">
              NO ON-CHAIN PAPERHAND DUMPS DETECTED YET
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed mb-5">
              Telemetry engine is connected and listening to Robinhood Chain Mainnet (Chain ID: 4663).
              As soon as $NINE token trading goes live on DEX liquidity, every wallet-level sell below subsequent peaks will be mathematically detected and logged here in real time.
            </p>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 text-emerald-400 text-xs font-bold shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ROBINHOOD RPC & BLOCKSCOUT TELEMETRY ACTIVE</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono">
            {processedFumbles.map((fumble) => {
            const isMegaFumble = fumble.lossUSD >= 1000000;
            const isGenesis = fumble.era === 'GENESIS';
            const isEarly = fumble.era === 'EARLY';
            const isMid = fumble.era === 'MID';
            const isIntraday = fumble.era === 'INTRADAY';

            // Distinct era accent styling
            const cardBorderClass = isMegaFumble
              ? 'border-red-500/80 hover:border-red-400 shadow-[0_4px_30px_rgba(255,51,68,0.25)] hover:shadow-[0_8px_45px_rgba(255,51,68,0.4)] ring-1 ring-red-500/30'
              : isGenesis
              ? 'border-amber-500/40 hover:border-amber-400 shadow-[0_4px_25px_rgba(245,158,11,0.08)] hover:shadow-[0_8px_35px_rgba(245,158,11,0.2)]'
              : isMid
              ? 'border-blue-500/40 hover:border-blue-400 shadow-[0_4px_25px_rgba(59,130,246,0.08)] hover:shadow-[0_8px_35px_rgba(59,130,246,0.2)]'
              : isEarly
              ? 'border-emerald-500/40 hover:border-emerald-400 shadow-[0_4px_25px_rgba(16,185,129,0.08)] hover:shadow-[0_8px_35px_rgba(16,185,129,0.2)]'
              : 'border-nine-red/40 hover:border-nine-red shadow-[0_4px_25px_rgba(255,51,68,0.08)] hover:shadow-[0_8px_35px_rgba(255,51,68,0.2)]';

            const topGlowGradient = isMegaFumble
              ? 'from-red-500 via-rose-400 to-amber-500'
              : isGenesis
              ? 'from-amber-500 via-orange-400 to-transparent'
              : isMid
              ? 'from-blue-500 via-indigo-400 to-transparent'
              : isEarly
              ? 'from-emerald-500 via-teal-400 to-transparent'
              : 'from-nine-red via-rose-500 to-transparent';

            const soldPercentOfPeak = Math.min(
              100,
              Math.max(0.01, (fumble.soldAmountUSD / Math.max(1, fumble.boughtAmountUSD)) * 100)
            );

            return (
              <div
                key={fumble.id}
                className={`relative rounded-xl border bg-gradient-to-b from-[#13141c]/95 via-[#0d0e14]/98 to-[#08080c] p-5 flex flex-col justify-between transition-all duration-300 group overflow-hidden ${cardBorderClass}`}
              >
                {/* Top glowing neon accent line */}
                <div
                  className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${topGlowGradient} opacity-75 group-hover:opacity-100 transition-opacity`}
                />

                {/* Card Top Section */}
                <div>
                  {/* Row 1: Code + Era Pill + Timestamp */}
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-zinc-800/80">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-black text-white px-2 py-0.5 rounded bg-black/80 border border-zinc-700/80 tracking-wider">
                        {fumble.code}
                      </span>

                      {fumble.eraLabel && (
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider border ${
                            isGenesis
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                              : isMid
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.25)]'
                              : isEarly
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.25)]'
                          }`}
                        >
                          {fumble.eraLabel}
                        </span>
                      )}

                      {fumble.walletTag && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-red-950/80 border border-red-500/60 text-red-300 tracking-tight">
                          {fumble.walletTag}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-zinc-400 shrink-0 font-medium">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isIntraday ? 'bg-nine-red animate-ping' : 'bg-nine-green'
                        }`}
                      />
                      <Clock className="h-3 w-3 text-zinc-500" />
                      <span>{fumble.timestamp}</span>
                    </div>
                  </div>

                  {/* Row 2: Seller Wallet & Direct Verification Buttons */}
                  <div className="flex items-center justify-between gap-2 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs overflow-hidden shrink-0 shadow-inner">
                        {isMegaFumble ? '👑' : isGenesis ? '🌱' : isMid ? '🐋' : isEarly ? '⚡' : '🐈'}
                      </div>
                      <div>
                        <div className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">SELLER WALLET</div>
                        <span
                          onClick={() => openProfileModal(fumble.shortWallet)}
                          className="text-xs font-bold text-zinc-200 hover:text-nine-green cursor-pointer select-all tracking-wider transition-colors"
                        >
                          {fumble.shortWallet}
                        </span>
                      </div>
                    </div>

                    {/* Dual Verification Links: Wallet & Tx */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {fumble.walletExplorerUrl && (
                        <a
                          href={fumble.walletExplorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-blue-400 hover:text-white hover:bg-blue-600/30 font-bold bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded transition-all shadow-sm"
                          title="View wallet address on Blockscout"
                        >
                          <Wallet className="h-2.5 w-2.5" />
                          <span>WALLET</span>
                        </a>
                      )}

                      {fumble.explorerUrl ? (
                        <a
                          href={fumble.explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-nine-green hover:text-white hover:bg-nine-green/30 font-bold bg-nine-green/10 border border-nine-green/40 px-2 py-0.5 rounded transition-all shadow-sm group/btn"
                          title={`Verify transaction on Blockscout: ${fumble.txHash}`}
                        >
                          <ExternalLink className="h-2.5 w-2.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                          <span>TX</span>
                        </a>
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-semibold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                          VERIFIED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* On-Chain Bag Status & Activity Pill */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5 mb-3 px-2 py-1.5 rounded bg-black/60 border border-zinc-800 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                      <span className="text-zinc-400 uppercase font-bold">REMAINING BAG:</span>
                      <strong className="text-red-400 font-black">
                        {fumble.remainingTokens !== undefined
                          ? fumble.remainingTokens === 0
                            ? '0 $NINE (100% EXITED)'
                            : `${(fumble.remainingTokens / 1000).toFixed(1)}K $NINE (${fumble.percentExited?.toFixed(1)}% EXITED)`
                          : '0 $NINE (100% EXITED)'}
                      </strong>
                    </div>

                    {fumble.totalSwapsCount && (
                      <div className="text-zinc-400 font-medium">
                        <strong className="text-zinc-200">{fumble.totalSwapsCount}</strong>
                      </div>
                    )}
                  </div>

                  {/* Hero Left On Table Banner */}
                  <div className="rounded-lg border border-red-500/40 bg-gradient-to-br from-red-950/60 via-[#18090d] to-black p-3.5 mb-3.5 shadow-[inset_0_1px_12px_rgba(255,51,68,0.2)]">
                    <div className="flex items-center justify-between text-[10px] uppercase font-bold text-zinc-400 mb-1">
                      <span className="flex items-center gap-1 text-red-400 font-black tracking-wider">
                        <Flame className="h-3.5 w-3.5 text-red-500 animate-pulse" />
                        LEFT ON THE TABLE
                      </span>
                      <span className="text-amber-300 bg-amber-950/70 border border-amber-500/50 px-2 py-0.5 rounded font-black text-[9px] tracking-wide shadow-sm">
                        +{fumble.missedPercent.toLocaleString()}% MISSED
                      </span>
                    </div>

                    <div className="text-2xl sm:text-3xl font-black text-red-500 tracking-tight drop-shadow-[0_0_15px_rgba(255,51,68,0.6)]">
                      ${fumble.lossUSD ? fumble.lossUSD.toLocaleString() : '0'}
                    </div>

                    {/* Progress Visualizer: Sold Amount vs Peak Worth */}
                    <div className="mt-2.5 pt-2 border-t border-red-500/20">
                      <div className="flex items-center justify-between text-[9px] font-mono mb-1">
                        <span className="text-zinc-400 font-bold">
                          REALIZED: <strong className="text-white">${fumble.soldAmountUSD.toLocaleString()}</strong>
                        </span>
                        <span className="text-nine-green font-bold">
                          PEAK ATH: <strong className="text-emerald-300">${fumble.boughtAmountUSD.toLocaleString()}</strong>
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-zinc-800/80 overflow-hidden flex shadow-inner">
                        <div
                          className="h-full bg-zinc-400/90"
                          style={{ width: `${Math.max(0.5, soldPercentOfPeak)}%` }}
                          title={`Sold fraction: ${soldPercentOfPeak.toFixed(3)}%`}
                        />
                        <div className="h-full bg-gradient-to-r from-nine-green via-emerald-400 to-green-300 flex-1 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                      </div>
                    </div>
                  </div>

                  {/* Status Quote & Story Box */}
                  <div className="relative rounded-lg border border-nine-border/90 bg-black/60 p-3 mb-3 overflow-hidden">
                    <div className="flex items-start gap-2.5">
                      <div className="shrink-0 mt-0.5">
                        {isMegaFumble ? (
                          <img
                            src="/assets/mascot/meme_shocked_duo.webp"
                            alt="Shocked Mascot"
                            className="h-7 w-auto object-contain drop-shadow-[0_0_8px_rgba(255,51,68,0.5)]"
                          />
                        ) : (
                          <img
                            src="/assets/mascot/mascot_head_favicon.webp"
                            alt="Cat Reaction"
                            className="h-6 w-6 object-contain"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-black text-nine-red tracking-wide leading-snug">
                          {fumble.statusQuote}
                        </div>
                        <p className="mt-1.5 text-[11px] text-zinc-400 leading-relaxed font-sans">
                          {fumble.contextStory}
                        </p>
                      </div>
                    </div>

                    {/* Token & MC Quick Badges */}
                    {fumble.tokenAmount && (
                      <div className="mt-2.5 pt-2 border-t border-zinc-800 flex flex-wrap items-center gap-1.5 text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700/80 text-zinc-300 font-bold">
                          📦 {fumble.tokenAmount.toLocaleString()} ${fumble.tokenSymbol || 'NINE'}
                        </span>
                        {fumble.marketCapAtSale && (
                          <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700/80 text-zinc-400 font-bold">
                            🏷️ Sold At {fumble.marketCapAtSale}
                          </span>
                        )}
                        {fumble.strategyClassification && (
                          <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700/80 text-zinc-400 font-semibold">
                            🎯 {fumble.strategyClassification}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Community Reactions */}
                <div className="pt-2 border-t border-zinc-800/80">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between font-bold">
                    <span>COMMUNITY VERDICT</span>
                    <span className="text-[9px] text-zinc-500 font-mono">NON-TOXIC SIGNALS</span>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5 text-xs">
                    {[
                      {
                        type: 'lol',
                        emoji: '😂',
                        label: 'LOL',
                        count: fumble.reactions.lol,
                        activeClass:
                          'border-yellow-500/80 bg-yellow-950/60 text-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.3)]',
                      },
                      {
                        type: 'pain',
                        emoji: '💀',
                        label: 'PAIN',
                        count: fumble.reactions.pain,
                        activeClass:
                          'border-red-500/80 bg-red-950/60 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.3)]',
                      },
                      {
                        type: 'respect',
                        emoji: '🫡',
                        label: 'RESPECT',
                        count: fumble.reactions.respect,
                        activeClass:
                          'border-blue-500/80 bg-blue-950/60 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.3)]',
                      },
                      {
                        type: 'cooked',
                        emoji: '🍳',
                        label: 'COOKED',
                        count: fumble.reactions.cooked,
                        activeClass:
                          'border-orange-500/80 bg-orange-950/60 text-orange-300 shadow-[0_0_10px_rgba(249,115,22,0.3)]',
                      },
                      {
                        type: 'comeback',
                        emoji: '🐈',
                        label: 'COMEBACK',
                        count: fumble.reactions.comeback,
                        activeClass:
                          'border-emerald-500/80 bg-emerald-950/60 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]',
                      },
                    ].map((r) => (
                      <button
                        key={r.type}
                        onClick={() => reactToFumble(fumble.id, r.type as any)}
                        className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                          fumble.userReaction === r.type
                            ? r.activeClass
                            : 'border-zinc-800/90 bg-[#12131b] text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-[#181a24]'
                        }`}
                        title={r.label}
                      >
                        <span className="text-base select-none">{r.emoji}</span>
                        <span className="text-[10px] font-black mt-0.5">{r.count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </section>
  );
}
