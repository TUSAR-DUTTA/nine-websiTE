'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TOKEN_INFO } from '@/lib/data';
import { soundManager } from '@/lib/sound';
import {
  Terminal,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Flame,
  Search,
  X,
  RefreshCw,
  Pause,
  Play,
  Wallet,
  ArrowRight,
  Copy,
  Check,
  Activity,
  Layers,
  Radio,
} from 'lucide-react';

interface FormattedTransfer {
  txHash: string;
  blockNumber: number;
  from: string;
  to: string;
  fromTag: string;
  toTag: string;
  fromType: string;
  toType: string;
  amount: number;
  amountUSD: number;
  transferType: 'BURN' | 'WHALE_BUY' | 'WHALE_SELL' | 'WHALE_TRANSFER' | 'DEX_BUY' | 'DEX_SELL' | 'TRANSFER';
  explorerUrl: string;
  timestampDesc: string;
  exactTime: string;
}

interface WalletDossier {
  targetWallet: string;
  walletBalance: number;
  walletBalanceUSD: number;
  totalInflow: number;
  totalInflowUSD: number;
  totalOutflow: number;
  totalOutflowUSD: number;
  netFlow: number;
  netFlowUSD: number;
  burnContribution: number;
  retentionRate: number;
  verdict: string;
  verdictDetail: string;
  transfersCount: number;
}

type FilterType = 'ALL' | 'BUYS' | 'SELLS' | 'BURNS' | 'WHALES';

export function LiveTerminalSection() {
  const [transfers, setTransfers] = useState<FormattedTransfer[]>([]);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchedWallet, setSearchedWallet] = useState<string | null>(null);
  const [walletDossier, setWalletDossier] = useState<WalletDossier | null>(null);
  const [copiedTx, setCopiedTx] = useState<string | null>(null);
  const [copiedWallet, setCopiedWallet] = useState(false);

  // Live Macro Stats
  const [stats, setStats] = useState({
    currentBlock: 0,
    livePriceUSD: TOKEN_INFO.priceUSD,
    totalVolumeMoved: 0,
    burnsCount: 0,
    dexBuysCount: 0,
    dexSellsCount: 0,
    whaleMovesCount: 0,
  });

  // Fetch real on-chain transfers from Robinhood Chain
  const fetchTransfers = useCallback(
    async (walletQuery?: string) => {
      try {
        const url = walletQuery
          ? `/api/onchain/transfers?wallet=${encodeURIComponent(walletQuery)}`
          : '/api/onchain/transfers';

        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const data = await res.json();

        if (data.success && Array.isArray(data.transfers)) {
          setTransfers(data.transfers);
          setStats({
            currentBlock: data.currentBlock || 0,
            livePriceUSD: data.livePriceUSD || TOKEN_INFO.priceUSD,
            totalVolumeMoved: data.totalVolumeMoved || 0,
            burnsCount: data.burnsCount || 0,
            dexBuysCount: data.dexBuysCount || 0,
            dexSellsCount: data.dexSellsCount || 0,
            whaleMovesCount: data.whaleMovesCount || 0,
          });

          if (data.isWalletQuery) {
            setWalletDossier({
              targetWallet: data.targetWallet,
              walletBalance: data.walletBalance,
              walletBalanceUSD: data.walletBalanceUSD,
              totalInflow: data.totalInflow,
              totalInflowUSD: data.totalInflowUSD,
              totalOutflow: data.totalOutflow,
              totalOutflowUSD: data.totalOutflowUSD,
              netFlow: data.netFlow,
              netFlowUSD: data.netFlowUSD,
              burnContribution: data.burnContribution,
              retentionRate: data.retentionRate,
              verdict: data.verdict,
              verdictDetail: data.verdictDetail,
              transfersCount: data.transfersCount,
            });
          } else {
            setWalletDossier(null);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch on-chain transfers:', err);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    fetchTransfers(searchedWallet || undefined);
  }, [fetchTransfers, searchedWallet]);

  // Live Auto-refresh polling every 6 seconds (if not paused)
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      fetchTransfers(searchedWallet || undefined);
    }, 6000);

    return () => clearInterval(interval);
  }, [isPaused, fetchTransfers, searchedWallet]);

  const handleRefresh = () => {
    soundManager.playClick();
    setIsRefreshing(true);
    fetchTransfers(searchedWallet || undefined);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (!query) {
      handleClearSearch();
      return;
    }
    soundManager.playClick();
    setIsLoading(true);
    setSearchedWallet(query);
  };

  const handleClearSearch = () => {
    soundManager.playClick();
    setSearchInput('');
    setSearchedWallet(null);
    setWalletDossier(null);
    setIsLoading(true);
    fetchTransfers();
  };

  const handleInspectAddress = (addr: string) => {
    soundManager.playClick();
    setSearchInput(addr);
    setSearchedWallet(addr);
    setIsLoading(true);
  };

  const copyToClipboard = (text: string, isTx: boolean = false) => {
    soundManager.playClick();
    navigator.clipboard.writeText(text);
    if (isTx) {
      setCopiedTx(text);
      setTimeout(() => setCopiedTx(null), 2000);
    } else {
      setCopiedWallet(true);
      setTimeout(() => setCopiedWallet(false), 2000);
    }
  };

  // Filter transfers
  const filteredTransfers = useMemo(() => {
    return transfers.filter((item) => {
      if (filter === 'ALL') return true;
      if (filter === 'BUYS') {
        return item.transferType === 'DEX_BUY' || item.transferType === 'WHALE_BUY';
      }
      if (filter === 'SELLS') {
        return item.transferType === 'DEX_SELL' || item.transferType === 'WHALE_SELL';
      }
      if (filter === 'BURNS') {
        return item.transferType === 'BURN';
      }
      if (filter === 'WHALES') {
        return (
          item.transferType === 'WHALE_BUY' ||
          item.transferType === 'WHALE_SELL' ||
          item.transferType === 'WHALE_TRANSFER' ||
          item.amountUSD >= 500 ||
          item.amount >= 5000
        );
      }
      return true;
    });
  }, [transfers, filter]);

  return (
    <section id="terminal" className="relative w-full border-b border-nine-border bg-[#08080b] py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* SECTION HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-nine-border pb-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-nine-green uppercase tracking-widest mb-1.5 font-bold">
              <Terminal className="h-3.5 w-3.5 text-nine-green" />
              <span>ROBINHOOD CHAIN MAINNET TELEMETRY (CHAIN ID: 4663)</span>
            </div>
            <h2 className="font-mono text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span>LIVE ON-CHAIN TERMINAL</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-nine-green/10 text-nine-green border border-nine-green/30 tracking-widest">
                VERIFIED RPC
              </span>
            </h2>
            <p className="mt-1 text-xs sm:text-sm font-mono text-zinc-400 max-w-2xl leading-relaxed">
              Real-time on-chain transaction stream directly from Robinhood Chain node. Track live Uniswap v4 DEX swaps,
              whale accumulations, and deflationary armory burns with direct Blockscout verification.
            </p>
          </div>

          {/* Quick Search & Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 font-mono text-xs">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search wallet (0x...) or TX..."
                className="w-full sm:w-64 rounded border border-nine-border bg-nine-surface px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-nine-green focus:outline-none"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-9 text-zinc-500 hover:text-white p-1"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
              <button
                type="submit"
                className="ml-1.5 rounded border border-nine-border bg-nine-elevated px-2.5 py-2 text-zinc-300 hover:border-nine-green hover:text-white transition-colors"
                title="Search on-chain"
              >
                <Search className="h-3.5 w-3.5" />
              </button>
            </form>

            {/* Pause/Resume and Refresh */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setIsPaused(!isPaused);
                }}
                className={`flex items-center gap-1.5 rounded border px-3 py-2 transition-colors ${
                  isPaused
                    ? 'border-amber-500/40 bg-amber-950/20 text-nine-amber'
                    : 'border-nine-border bg-nine-surface text-zinc-400 hover:text-white'
                }`}
                title={isPaused ? 'Resume live streaming' : 'Pause live streaming'}
              >
                {isPaused ? <Play className="h-3.5 w-3.5 text-nine-green" /> : <Pause className="h-3.5 w-3.5" />}
                <span className="text-[11px] font-bold">{isPaused ? 'RESUME' : 'PAUSE'}</span>
              </button>

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 rounded border border-nine-border bg-nine-surface px-3 py-2 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
                title="Refresh live blocks"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-nine-green' : ''}`} />
                <span className="text-[11px] font-bold hidden sm:inline">SYNC</span>
              </button>
            </div>
          </div>
        </div>

        {/* METRICS QUAD BAR (REAL LIVE METRICS) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6 font-mono text-xs">
          <div className="rounded border border-nine-border bg-nine-surface/80 p-3 shadow-sm">
            <div className="text-[10px] text-zinc-500 uppercase">CURRENT BLOCK</div>
            <div className="text-base font-black text-white mt-0.5 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-nine-green animate-pulse" />
              <span>#{stats.currentBlock.toLocaleString()}</span>
            </div>
          </div>

          <div className="rounded border border-nine-border bg-nine-surface/80 p-3 shadow-sm">
            <div className="text-[10px] text-zinc-500 uppercase">LIVE DEX PRICE</div>
            <div className="text-base font-black text-nine-green mt-0.5">
              {stats.livePriceUSD > 0 ? `$${stats.livePriceUSD.toFixed(4)}` : 'LAUNCHING SOON'}
            </div>
          </div>

          <div className="rounded border border-nine-border bg-nine-surface/80 p-3 shadow-sm">
            <div className="text-[10px] text-zinc-500 uppercase">DEX BUYS</div>
            <div className="text-base font-black text-nine-green mt-0.5 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-nine-green" />
              <span>{stats.dexBuysCount}</span>
            </div>
          </div>

          <div className="rounded border border-nine-border bg-nine-surface/80 p-3 shadow-sm">
            <div className="text-[10px] text-zinc-500 uppercase">DEX SELLS</div>
            <div className="text-base font-black text-nine-red mt-0.5 flex items-center gap-1">
              <TrendingDown className="h-3.5 w-3.5 text-nine-red" />
              <span>{stats.dexSellsCount}</span>
            </div>
          </div>

          <div className="rounded border border-nine-border bg-nine-surface/80 p-3 shadow-sm">
            <div className="text-[10px] text-zinc-500 uppercase">WHALE MOVES</div>
            <div className="text-base font-black text-nine-gold mt-0.5">
              {stats.whaleMovesCount} Moves
            </div>
          </div>

          <div className="rounded border border-nine-border bg-nine-surface/80 p-3 shadow-sm">
            <div className="text-[10px] text-zinc-500 uppercase">DEAD BURNS</div>
            <div className="text-base font-black text-orange-400 mt-0.5 flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 text-orange-400" />
              <span>{stats.burnsCount} Vault Burns</span>
            </div>
          </div>
        </div>

        {/* WALLET DOSSIER CARD (IF ACTIVE WALLET SEARCH) */}
        {walletDossier && (
          <div className="mb-6 rounded border border-nine-green/50 bg-gradient-to-r from-nine-greenMuted/30 via-nine-surface to-nine-surface p-5 font-mono shadow-xl animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-nine-border pb-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-black/60 border border-nine-green/40 text-nine-green">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 font-bold">WALLET DOSSIER:</span>
                    <span className="text-xs text-white font-bold">{walletDossier.targetWallet}</span>
                    <button
                      onClick={() => copyToClipboard(walletDossier.targetWallet)}
                      className="text-zinc-500 hover:text-white"
                      title="Copy Address"
                    >
                      {copiedWallet ? <Check className="h-3 w-3 text-nine-green" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                  <div className="text-xs font-black text-nine-gold mt-0.5">
                    VERDICT: {walletDossier.verdict}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://robinhoodchain.blockscout.com/address/${walletDossier.targetWallet}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded border border-nine-border bg-black/40 px-2.5 py-1 text-xs text-zinc-300 hover:text-white hover:border-nine-green transition-colors"
                >
                  <span>BLOCKSCOUT</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
                <button
                  onClick={handleClearSearch}
                  className="rounded bg-nine-green px-3 py-1 text-xs font-black text-black hover:bg-emerald-400 transition-all"
                >
                  ✕ CLEAR DOSSIER
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-zinc-500 uppercase text-[10px] block">CURRENT BALANCE</span>
                <span className="text-sm font-black text-white">
                  {walletDossier.walletBalance.toLocaleString(undefined, { maximumFractionDigits: 1 })} $NINE
                </span>
                <span className="text-[11px] text-zinc-400 block">${walletDossier.walletBalanceUSD.toLocaleString()} USD</span>
              </div>
              <div>
                <span className="text-zinc-500 uppercase text-[10px] block">TOTAL INFLOW</span>
                <span className="text-sm font-black text-nine-green">
                  +{walletDossier.totalInflow.toLocaleString(undefined, { maximumFractionDigits: 1 })} $NINE
                </span>
                <span className="text-[11px] text-zinc-400 block">${walletDossier.totalInflowUSD.toLocaleString()} USD</span>
              </div>
              <div>
                <span className="text-zinc-500 uppercase text-[10px] block">TOTAL OUTFLOW</span>
                <span className="text-sm font-black text-nine-red">
                  -{walletDossier.totalOutflow.toLocaleString(undefined, { maximumFractionDigits: 1 })} $NINE
                </span>
                <span className="text-[11px] text-zinc-400 block">${walletDossier.totalOutflowUSD.toLocaleString()} USD</span>
              </div>
              <div>
                <span className="text-zinc-500 uppercase text-[10px] block">RETENTION RATE</span>
                <span className="text-sm font-black text-nine-gold">{walletDossier.retentionRate}%</span>
                <span className="text-[10px] text-zinc-400 block">{walletDossier.verdictDetail}</span>
              </div>
            </div>
          </div>
        )}

        {/* MAIN TERMINAL WINDOW */}
        <div className="rounded border border-nine-border bg-nine-surface overflow-hidden shadow-2xl font-mono">
          {/* TERMINAL TOP HUD BAR */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-nine-border bg-nine-elevated px-4 py-2.5 text-xs">
            {/* Stream Status */}
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-nine-green animate-pulse'}`} />
              <span className="font-bold text-white tracking-wider">
                {isPaused ? 'STREAM: PAUSED' : 'STREAM: ROBINHOOD_CHAIN_MAINNET_NODE'}
              </span>
              <span className="text-zinc-500 text-[10px] hidden md:inline">[PORT: 4663]</span>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center rounded border border-nine-border bg-black/40 p-0.5">
              {(['ALL', 'BUYS', 'SELLS', 'BURNS', 'WHALES'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    soundManager.playClick();
                    setFilter(cat);
                  }}
                  className={`px-3 py-1 rounded text-[11px] font-bold transition-all ${
                    filter === cat
                      ? 'bg-zinc-700 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {cat === 'BUYS' && '🟢 '}
                  {cat === 'SELLS' && '🔴 '}
                  {cat === 'BURNS' && '🔥 '}
                  {cat === 'WHALES' && '🐋 '}
                  {cat}
                </button>
              ))}
            </div>

            {/* Latency & Explorer Link */}
            <div className="flex items-center gap-4 text-[11px] text-zinc-400">
              <a
                href={TOKEN_INFO.contractAddress.startsWith('0x') ? `https://robinhoodchain.blockscout.com/address/${TOKEN_INFO.contractAddress}` : 'https://robinhoodchain.blockscout.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-nine-green hover:underline flex items-center gap-1 font-bold"
              >
                <span>BLOCKSCOUT EXPLORER</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <span className="text-zinc-500 hidden sm:inline">LATENCY: 8ms</span>
            </div>
          </div>

          {/* TERMINAL FEED ROWS */}
          <div className="divide-y divide-nine-border/60 max-h-[640px] overflow-y-auto">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-400">
                <RefreshCw className="h-6 w-6 animate-spin text-nine-green" />
                <span className="text-xs">Synchronizing with Robinhood Chain Mainnet RPC...</span>
              </div>
            ) : transfers.length === 0 ? (
              <div className="py-20 text-center text-zinc-400">
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-nine-elevated border border-nine-border mb-3">
                  <Radio className="h-6 w-6 text-nine-green animate-pulse" />
                </div>
                <p className="text-sm font-bold text-white uppercase tracking-wider">AWAITING ON-CHAIN TRANSACTIONS • LISTENING TO ROBINHOOD CHAIN</p>
                <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
                  The live DEX settlement listener is active on Chain ID 4663. As soon as the token launches, trades, burns, and whale transfers will stream here in real-time.
                </p>
              </div>
            ) : filteredTransfers.length === 0 ? (
              <div className="py-16 text-center text-zinc-400">
                <p className="text-sm font-bold text-white">No transactions found for filter "{filter}".</p>
                <p className="text-xs text-zinc-500 mt-1">Waiting for incoming blocks or try selecting another category.</p>
                <button
                  onClick={() => setFilter('ALL')}
                  className="mt-3 rounded border border-nine-border px-3 py-1 text-xs text-nine-green hover:bg-nine-elevated"
                >
                  Reset Filter to ALL
                </button>
              </div>
            ) : (
              filteredTransfers.map((tx) => {
                const isBuy = tx.transferType === 'DEX_BUY' || tx.transferType === 'WHALE_BUY';
                const isSell = tx.transferType === 'DEX_SELL' || tx.transferType === 'WHALE_SELL';
                const isBurn = tx.transferType === 'BURN';
                const isWhale = tx.transferType.includes('WHALE') || tx.amountUSD >= 500;

                return (
                  <div
                    key={tx.txHash + '-' + tx.blockNumber + '-' + tx.amount}
                    className="group flex flex-col md:flex-row md:items-center justify-between gap-3.5 p-3.5 sm:px-5 hover:bg-nine-elevated/70 transition-colors"
                  >
                    {/* Left: Transfer Type & Counterparties */}
                    <div className="flex items-start sm:items-center gap-3">
                      {/* Badge Tag */}
                      <span
                        className={`shrink-0 px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                          isBurn
                            ? 'bg-amber-950 text-orange-400 border border-amber-500/40'
                            : isBuy
                            ? 'bg-nine-greenMuted text-nine-green border border-nine-green/30'
                            : isSell
                            ? 'bg-nine-redDark text-nine-red border border-nine-red/30'
                            : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                        }`}
                      >
                        {isBurn
                          ? '🔥 BURN'
                          : isWhale && isBuy
                          ? '🐋 WHALE BUY'
                          : isWhale && isSell
                          ? '🐋 WHALE SELL'
                          : isBuy
                          ? '🟢 DEX BUY'
                          : isSell
                          ? '🔴 DEX SELL'
                          : 'TRANSFER'}
                      </span>

                      {/* Route Counterparties */}
                      <div className="flex items-center gap-1.5 flex-wrap text-xs">
                        <button
                          onClick={() => handleInspectAddress(tx.from)}
                          className="font-bold text-zinc-300 hover:text-white hover:underline transition-colors"
                          title="Filter by sender"
                        >
                          {tx.fromTag}
                        </button>

                        <ArrowRight className="h-3 w-3 text-zinc-600 shrink-0" />

                        <button
                          onClick={() => handleInspectAddress(tx.to)}
                          className={`font-bold hover:underline transition-colors ${
                            isBurn ? 'text-orange-400' : 'text-zinc-300 hover:text-white'
                          }`}
                          title="Filter by recipient"
                        >
                          {tx.toTag}
                        </button>

                        <span className="text-[10px] text-zinc-500 ml-1">
                          Block #{tx.blockNumber.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Right: Amount, Value, Time, Explorer Action */}
                    <div className="flex items-center justify-between md:justify-end gap-4 text-xs shrink-0 pl-7 md:pl-0">
                      {/* Amount & USD */}
                      <div className="text-right">
                        <div
                          className={`font-mono font-black ${
                            isBurn ? 'text-orange-400' : isBuy ? 'text-nine-green' : isSell ? 'text-nine-red' : 'text-white'
                          }`}
                        >
                          {isBuy ? '+' : isSell ? '-' : ''}
                          {tx.amount.toLocaleString(undefined, { maximumFractionDigits: 1 })} $NINE
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          ${tx.amountUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                        </div>
                      </div>

                      {/* Time */}
                      <div className="text-right w-16 hidden sm:block">
                        <span className="text-[11px] text-zinc-400">{tx.timestampDesc}</span>
                      </div>

                      {/* Action: View Blockscout */}
                      <a
                        href={tx.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded border border-nine-border bg-black/40 px-2 py-1 text-[11px] text-zinc-400 hover:text-white hover:border-nine-green transition-colors"
                        title="Open on Blockscout Explorer"
                      >
                        <span>VIEW TX</span>
                        <ExternalLink className="h-3 w-3 text-nine-green" />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* TERMINAL FOOTER BAR */}
          <div className="border-t border-nine-border bg-nine-bg p-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-zinc-500">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-nine-green" />
              <span>ROBINHOOD CHAIN ARBITRUM L2 CONSENSUS ACTIVE (~8 BLOCKS/SEC)</span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={TOKEN_INFO.contractAddress.startsWith('0x') ? `https://robinhoodchain.blockscout.com/token/${TOKEN_INFO.contractAddress}` : 'https://robinhoodchain.blockscout.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-nine-green hover:underline flex items-center gap-1 font-bold"
              >
                <span>VIEW ALL TOKEN HOLDERS & TXS ON BLOCKSCOUT</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
