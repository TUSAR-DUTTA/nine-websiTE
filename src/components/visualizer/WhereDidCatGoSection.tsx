'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useNine } from '@/context/NineContext';
import { soundManager } from '@/lib/sound';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Flame,
  ExternalLink,
  ChevronRight,
  Copy,
  Check,
  Search,
  Radio,
  RefreshCw,
  Zap,
  Terminal,
  Activity,
  Layers,
  Sparkles,
  AlertTriangle,
  User,
  Cpu,
  TrendingUp,
  TrendingDown,
  Crosshair,
  ArrowUpRight,
  ArrowDownLeft,
  Navigation,
  Globe,
  SlidersHorizontal,
  DollarSign,
  PieChart,
  Repeat,
  Target,
} from 'lucide-react';
import {
  ROBINHOOD_CONFIG,
  DEFAULT_TOKEN_ADDRESS,
  DEFAULT_ARCADE_ADDRESS,
  BURN_ADDRESS,
} from '@/lib/onchain';

export type TransferCategory =
  | 'BURN'
  | 'WHALE_BUY'
  | 'WHALE_SELL'
  | 'WHALE_TRANSFER'
  | 'DEX_BUY'
  | 'DEX_SELL'
  | 'TRANSFER';

export interface FormattedTransfer {
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
  transferType: TransferCategory;
  explorerUrl: string;
  timestampDesc: string;
  exactTime: string;
}

export interface CounterpartySummary {
  address: string;
  tag: string;
  type: string;
  totalAmount: number;
  totalUSD: number;
  count: number;
  percentage?: number;
}

export interface TopActiveMover {
  address: string;
  tag: string;
  type: string;
  volume: number;
  volumeUSD: number;
  txCount: number;
}

interface WalletPathAnalysis {
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
  topSenders: CounterpartySummary[];
  topReceivers: CounterpartySummary[];
  transfersCount: number;
  transfers: FormattedTransfer[];
}

interface RadarTrailStep {
  step: number;
  label: string;
  address: string;
  amount: number;
  type: 'MINT' | 'TRANSFER' | 'BURN' | 'HOLD' | 'GATEWAY' | 'FAUCET';
  actionDesc: string;
}

interface RadarTrail {
  id: string;
  catId: string;
  totalMoved: number;
  story: string;
  timestamp: string;
  verdict: string;
  steps: RadarTrailStep[];
}

const RADAR_TRAILS: Record<string, RadarTrail> = {
  genesis: {
    id: 'genesis',
    catId: 'TRAIL 01 // MAINNET GENESIS & SUPPLY ARCHITECTURE',
    totalMoved: 1000000000,
    timestamp: 'Block #53,315,760 (Robinhood Mainnet 4663)',
    story:
      'Architectural tracking of 1,000,000,000 $NINE fixed total supply on Robinhood Chain Mainnet, circulating across Uniswap v4 liquidity, ecosystem holders, and the Dead Vault.',
    verdict: 'SUPPLY INTEGRITY VERIFIED: 1,000,000,000 $NINE ON ROBINHOOD CHAIN (CHAIN ID: 4663)',
    steps: [
      {
        step: 1,
        label: '$NINE TOKEN CONTRACT DEPLOYMENT',
        address: DEFAULT_TOKEN_ADDRESS,
        amount: 1000000000,
        type: 'MINT',
        actionDesc: '1,000,000,000 $NINE fixed supply deployed on Robinhood Chain Mainnet (4663)',
      },
      {
        step: 2,
        label: 'UNISWAP V4 LIQUIDITY POOL',
        address: '0xUniswapV4...RobinhoodPool',
        amount: 420000000,
        type: 'GATEWAY',
        actionDesc: 'Primary Uniswap v4 liquidity pair on Robinhood Chain for decentralized trading',
      },
      {
        step: 3,
        label: 'ECOSYSTEM HOLDERS & ARSENAL',
        address: '0xCommunity...Vault',
        amount: 577953267,
        type: 'HOLD',
        actionDesc: 'Verified on-chain holders and bag workers trading and holding on mainnet',
      },
      {
        step: 4,
        label: 'PERMANENT DEAD VAULT INCINERATOR',
        address: BURN_ADDRESS,
        amount: 2046733,
        type: 'BURN',
        actionDesc: 'Permanent incineration destination (0x...dEaD). Tokens sent here are verifiably destroyed on-chain forever.',
      },
    ],
  },
  arcade_burn: {
    id: 'arcade_burn',
    catId: 'TRAIL 02 // REAL-TIME DEAD VAULT BURN STREAM',
    totalMoved: 0,
    timestamp: 'Live On-Chain Dead Vault',
    story:
      'Tracking real-time burn transactions from user wallets into the permanent Dead Vault (0x...dEaD). Every item purchased or incinerated sends $NINE directly to the dead address.',
    verdict: 'DEFLATION ENGINE: 100% OF ARMORY TOKENS DESTROYED IN DEAD VAULT',
    steps: [
      {
        step: 1,
        label: 'OPERATIVE WALLET DISPATCH',
        address: '0xOperative...DeadVault',
        amount: 25000,
        type: 'TRANSFER',
        actionDesc: 'Operative signs purchase transaction on Robinhood Chain Mainnet (4663)',
      },
      {
        step: 2,
        label: 'ERC-20 TOKEN TRANSFER ROUTING',
        address: DEFAULT_TOKEN_ADDRESS,
        amount: 25000,
        type: 'TRANSFER',
        actionDesc: 'Token transfer validates balance and routes directly to burn address',
      },
      {
        step: 3,
        label: 'ARMORY ARSENAL UNLOCK GATEWAY',
        address: DEFAULT_ARCADE_ADDRESS,
        amount: 25000,
        type: 'GATEWAY',
        actionDesc: 'Custom companions, CRT terminal skins, and pixel particle auras unlocked',
      },
      {
        step: 4,
        label: 'DEAD ADDRESS PERMANENT INCINERATION',
        address: BURN_ADDRESS,
        amount: 25000,
        type: 'BURN',
        actionDesc: 'Tokens permanently transferred to 0x000000000000000000000000000000000000dEaD',
      },
    ],
  },
  whale_flow: {
    id: 'whale_flow',
    catId: 'TRAIL 03 // WHALE LIQUIDITY & ACCUMULATION FLOW',
    totalMoved: 15400000,
    timestamp: 'Intraday Telemetry Stream',
    story:
      'Tracking high-conviction liquidity movements and diamond hand accumulators on Robinhood Chain Mainnet.',
    verdict: 'MARKET RESILIENCE: LIQUIDITY EXPANDING ACROSS ROBINHOOD ECOSYSTEM',
    steps: [
      {
        step: 1,
        label: 'COMMUNITY ACCUMULATOR DISPATCH',
        address: '0xDiamondHolder...Vault',
        amount: 5000000,
        type: 'TRANSFER',
        actionDesc: 'High-conviction market participant swaps ETH for $NINE on Uniswap v4',
      },
      {
        step: 2,
        label: 'UNISWAP V4 ROUTING ENGINE',
        address: '0xUniswapV4...RoutingEngine',
        amount: 5000000,
        type: 'GATEWAY',
        actionDesc: 'Automated market maker executes low-slippage trade on Robinhood Chain',
      },
      {
        step: 3,
        label: 'COLD STORAGE VAULT CONVICTION',
        address: '0xDiamondHolder...Vault',
        amount: 5000000,
        type: 'HOLD',
        actionDesc: 'Tokens deposited into long-term bag holding vault',
      },
      {
        step: 4,
        label: 'DEFLATIONARY MILESTONE BURN',
        address: BURN_ADDRESS,
        amount: 50000,
        type: 'BURN',
        actionDesc: 'Community tribute burned directly to Dead Vault on Robinhood Chain',
      },
    ],
  },
};

export function WhereDidCatGoSection() {
  const { connectedProfile } = useNine();

  // Top Section Navigation
  const [activeMainView, setActiveMainView] = useState<'STREAM' | 'PATH_TRACER' | 'BLUEPRINT'>('STREAM');

  // Live Transfers State
  const [transfers, setTransfers] = useState<FormattedTransfer[]>([]);
  const [transferFilter, setTransferFilter] = useState<'ALL' | 'WHALES' | 'BUYS' | 'SELLS' | 'BURNS'>('ALL');
  const [isLoadingTransfers, setIsLoadingTransfers] = useState<boolean>(false);
  const [isAutoPoll, setIsAutoPoll] = useState<boolean>(true);

  // Live Market & Radar Metrics
  const [livePriceUSD, setLivePriceUSD] = useState<number>(0);
  const [blockHeight, setBlockHeight] = useState<number>(0);
  const [deadBalance, setDeadBalance] = useState<number>(0);
  const [totalVolumeMoved, setTotalVolumeMoved] = useState<number>(0);
  const [whaleMovesCount, setWhaleMovesCount] = useState<number>(0);
  const [burnsCount, setBurnsCount] = useState<number>(0);
  const [dexBuysCount, setDexBuysCount] = useState<number>(0);
  const [dexSellsCount, setDexSellsCount] = useState<number>(0);
  const [topActiveMovers, setTopActiveMovers] = useState<TopActiveMover[]>([]);

  // Path Tracer State
  const [targetWallet, setTargetWallet] = useState<string>('');
  const [pathResult, setPathResult] = useState<WalletPathAnalysis | null>(null);
  const [isTracingPath, setIsTracingPath] = useState<boolean>(false);
  const [pathError, setPathError] = useState<string | null>(null);

  // Radar Scope Blip Hover / Selection
  const [hoveredRadarBlip, setHoveredRadarBlip] = useState<FormattedTransfer | null>(null);
  const [selectedRadarBlip, setSelectedRadarBlip] = useState<FormattedTransfer | null>(null);

  // Blueprint Trail Tab
  const [activeTrailKey, setActiveTrailKey] = useState<string>('genesis');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const activeTrail = RADAR_TRAILS[activeTrailKey] || RADAR_TRAILS.genesis;

  // 1. Fetch Real Live Transfers Stream
  const fetchLiveTransfers = async () => {
    try {
      setIsLoadingTransfers(true);
      const res = await fetch('/api/onchain/transfers');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.transfers?.length > 0) {
          setTransfers(data.transfers);
          if (data.currentBlock) setBlockHeight(data.currentBlock);
          if (data.livePriceUSD) setLivePriceUSD(data.livePriceUSD);
          if (typeof data.totalVolumeMoved === 'number') setTotalVolumeMoved(Math.round(data.totalVolumeMoved));
          if (typeof data.whaleMovesCount === 'number') setWhaleMovesCount(data.whaleMovesCount);
          if (typeof data.burnsCount === 'number') setBurnsCount(data.burnsCount);
          if (typeof data.dexBuysCount === 'number') setDexBuysCount(data.dexBuysCount);
          if (typeof data.dexSellsCount === 'number') setDexSellsCount(data.dexSellsCount);
          if (data.topActiveMovers) setTopActiveMovers(data.topActiveMovers);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch live onchain transfers:', err);
    } finally {
      setIsLoadingTransfers(false);
    }
  };

  // 2. Fetch Macro Stats (Dead Vault)
  const fetchMacroStats = async () => {
    try {
      const res = await fetch('/api/onchain/stats');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (data.blockNumber) setBlockHeight(data.blockNumber);
          if (typeof data.deadBalance === 'number') setDeadBalance(data.deadBalance);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch macro stats:', err);
    }
  };

  // 3. Trace a Specific Wallet's Token Flow ("Where Did The Cat Go?")
  const traceWalletMovement = async (walletAddr?: string) => {
    const target = (walletAddr || targetWallet).trim();
    if (!target) return;

    soundManager.playClick();
    setIsTracingPath(true);
    setPathError(null);

    try {
      const res = await fetch(`/api/onchain/transfers?wallet=${encodeURIComponent(target)}`);
      const data = await res.json();
      if (data.success) {
        setPathResult(data);
        setActiveMainView('PATH_TRACER');
        soundManager.playComebackChime();
      } else {
        setPathError(data.error || 'Could not trace wallet movements.');
        soundManager.playFumbleBuzz();
      }
    } catch (err: any) {
      setPathError(err.message || 'Failed to trace wallet movement.');
      soundManager.playFumbleBuzz();
    } finally {
      setIsTracingPath(false);
    }
  };

  // Initial load and periodic polling
  useEffect(() => {
    fetchLiveTransfers();
    fetchMacroStats();

    // Auto-trace initial active bag worker
    traceWalletMovement('0xd246c518244A6E41f71d89D3f6AeB81B837565CC');

    const interval = setInterval(() => {
      if (isAutoPoll) {
        fetchLiveTransfers();
        fetchMacroStats();
      }
    }, 9000);

    return () => clearInterval(interval);
  }, [isAutoPoll]);

  const handleCopy = (text: string) => {
    soundManager.playClick();
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Filtered Transfers
  const filteredTransfers = useMemo(() => {
    if (transferFilter === 'WHALES') {
      return transfers.filter((t) => t.amount >= 5000 || t.transferType.startsWith('WHALE'));
    }
    if (transferFilter === 'BUYS') {
      return transfers.filter((t) => t.transferType === 'WHALE_BUY' || t.transferType === 'DEX_BUY');
    }
    if (transferFilter === 'SELLS') {
      return transfers.filter((t) => t.transferType === 'WHALE_SELL' || t.transferType === 'DEX_SELL');
    }
    if (transferFilter === 'BURNS') {
      return transfers.filter((t) => t.transferType === 'BURN' || t.to.toLowerCase() === BURN_ADDRESS.toLowerCase());
    }
    return transfers;
  }, [transfers, transferFilter]);

  // Dynamically map real transfers to circular radar coordinates
  const radarBlips = useMemo(() => {
    const subset = transfers.slice(0, 20);
    return subset.map((tx, idx) => {
      const angle = (idx * (360 / Math.max(subset.length, 1)) + 15) * (Math.PI / 180);
      // Normalized radius based on logarithmic scale of transfer size:
      // small tx (<100 $NINE) -> 16% - 24% radius
      // mid tx (100 - 5k $NINE) -> 25% - 36% radius
      // whale tx (>5k $NINE) -> 37% - 44% radius
      const normalizedRadius = Math.min(42, Math.max(15, Math.log10(tx.amount + 1) * 8.5));
      const x = 50 + normalizedRadius * Math.cos(angle);
      const y = 50 + normalizedRadius * Math.sin(angle);
      const isWhale = tx.amount >= 5000 || tx.transferType.startsWith('WHALE');
      const isBurn = tx.transferType === 'BURN';
      const isBuy = tx.transferType === 'WHALE_BUY' || tx.transferType === 'DEX_BUY';
      const isSell = tx.transferType === 'WHALE_SELL' || tx.transferType === 'DEX_SELL';

      return {
        ...tx,
        x,
        y,
        isWhale,
        isBurn,
        isBuy,
        isSell,
      };
    });
  }, [transfers]);

  return (
    <section className="relative w-full border-b border-nine-border bg-[#08090d] py-10 font-mono text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        
        {/* ======================================================== */}
        {/* 1. HUD RADAR HEADER WITH INTERACTIVE 360° SCOPE          */}
        {/* ======================================================== */}
        <div className="relative rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-[#0e1411] via-[#090d0b] to-[#07090b] p-6 shadow-2xl mb-8 overflow-hidden">
          {/* Cyber Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b9810a_1px,transparent_1px),linear-gradient(to_bottom,#10b9810a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-emerald-500/20 pb-6">
            
            {/* Left: Interactive Circular Tactical Radar Scope + Title */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              
              {/* Tactical Cyber Circular Radar Scope */}
              <div className="relative flex flex-col items-center">
                <div
                  className="relative h-32 w-32 sm:h-36 sm:w-36 rounded-full border-2 border-emerald-500/50 bg-[#030906] shadow-[0_0_40px_rgba(16,185,129,0.35)] flex items-center justify-center overflow-hidden shrink-0 group cursor-crosshair"
                  title="Robinhood Mainnet Tactical Scope: Click any transfer blip to trace its movement path"
                >
                  {/* Distance Range rings */}
                  <div className="absolute inset-3 rounded-full border border-emerald-500/15" />
                  <div className="absolute inset-8 rounded-full border border-emerald-500/25" />
                  <div className="absolute inset-13 rounded-full border border-emerald-500/35" />
                  
                  {/* Axis Crosshairs */}
                  <div className="absolute inset-x-0 top-1/2 h-[1px] bg-emerald-500/30" />
                  <div className="absolute inset-y-0 left-1/2 w-[1px] bg-emerald-500/30" />

                  {/* Range Labels */}
                  <span className="absolute top-1 text-[8px] font-bold text-emerald-500/50">WHALE ZONE</span>
                  <span className="absolute bottom-1 text-[8px] font-bold text-emerald-500/50">ROBINHOOD (4663)</span>

                  {/* Rotating Radar Sweep Beam */}
                  <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,rgba(16,185,129,0.45)_0deg,transparent_75deg)] animate-[spin_3.2s_linear_infinite]" />

                  {/* Center Token Core ($NINE) */}
                  <div className="relative z-20 h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399] flex items-center justify-center text-[7px] font-black text-black">
                    9
                  </div>

                  {/* Live Real Plotted Blips from Mainnet Transfers */}
                  {radarBlips.map((blip, i) => {
                    const isSelected = selectedRadarBlip?.txHash === blip.txHash;
                    return (
                      <button
                        key={blip.txHash + '-' + i}
                        onMouseEnter={() => setHoveredRadarBlip(blip)}
                        onMouseLeave={() => setHoveredRadarBlip(null)}
                        onClick={() => {
                          soundManager.playClick();
                          setSelectedRadarBlip(blip);
                          const target = blip.toType === 'OPERATIVE' ? blip.to : blip.from;
                          setTargetWallet(target);
                          traceWalletMovement(target);
                        }}
                        style={{ left: `${blip.x}%`, top: `${blip.y}%` }}
                        className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform hover:scale-150 focus:outline-none ${
                          isSelected
                            ? 'h-4 w-4 ring-2 ring-white bg-emerald-300 shadow-[0_0_12px_#ffffff] z-40'
                            : blip.isBurn
                            ? 'h-3 w-3 bg-red-500 shadow-[0_0_10px_#ef4444] animate-pulse'
                            : blip.isWhale
                            ? 'h-2.5 w-2.5 bg-amber-400 shadow-[0_0_10px_#fbbf24] animate-ping'
                            : blip.isBuy
                            ? 'h-2 w-2 bg-emerald-400 shadow-[0_0_6px_#34d399]'
                            : 'h-2 w-2 bg-sky-400 shadow-[0_0_6px_#38bdf8]'
                        }`}
                        title={`${blip.amount.toLocaleString()} $NINE (${blip.transferType}) - Click to trace path`}
                      />
                    );
                  })}
                </div>

                <div className="mt-2 text-[10px] text-emerald-400/80 font-mono tracking-wider flex items-center gap-1 font-bold">
                  <Crosshair className="h-3 w-3" />
                  <span>360° SCOPE LOCK</span>
                </div>
              </div>

              {/* Title & Telemetry info */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <span>ROBINHOOD CHAIN MAINNET (4663) /// LIVE ON-CHAIN RADAR</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex flex-wrap items-center gap-3">
                  <span>ON-CHAIN RADAR</span>
                  <span className="text-xs px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                    WHERE DID THE CAT GO?
                  </span>
                </h2>

                <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
                  Real-time blockchain radar tracking $NINE token flows, whale rotations, and burn incinerations on Robinhood Chain Mainnet. Live price: <strong className="text-emerald-400 font-mono">${livePriceUSD.toFixed(4)} USD</strong>.
                </p>

                {/* Scope Hover Detail readout */}
                {hoveredRadarBlip && (
                  <div className="rounded-lg border border-emerald-500/40 bg-black/80 px-3 py-1.5 text-[11px] text-emerald-300 flex items-center gap-2 animate-fadeIn">
                    <Target className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>
                      <strong>{hoveredRadarBlip.amount.toLocaleString()} $NINE</strong> (~${hoveredRadarBlip.amountUSD.toLocaleString()}) • {hoveredRadarBlip.fromTag} ──▶ {hoveredRadarBlip.toTag} • {hoveredRadarBlip.timestampDesc}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Macro Telemetry Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full lg:w-auto shrink-0">
              <div className="rounded-xl border border-emerald-500/30 bg-black/60 p-3 shadow-inner">
                <div className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1">
                  <Activity className="h-3 w-3 text-emerald-400" />
                  <span>BLOCK HEIGHT</span>
                </div>
                <div className="text-sm font-black text-emerald-400 mt-0.5">
                  #{blockHeight.toLocaleString()}
                </div>
                <div className="text-[9px] text-zinc-500">~0.12s block time</div>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-black/60 p-3 shadow-inner">
                <div className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1">
                  <Flame className="h-3 w-3 text-amber-400" />
                  <span>DEAD VAULT</span>
                </div>
                <div className="text-sm font-black text-amber-400 mt-0.5">
                  {Math.round(deadBalance).toLocaleString()} <span className="text-[10px] text-zinc-500">NINE</span>
                </div>
                <div className="text-[9px] text-zinc-500">0x...dEaD Incinerator</div>
              </div>

              <div className="rounded-xl border border-sky-500/30 bg-black/60 p-3 shadow-inner">
                <div className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-sky-400" />
                  <span>TRACKED VOLUME</span>
                </div>
                <div className="text-sm font-black text-sky-300 mt-0.5">
                  {totalVolumeMoved.toLocaleString()} <span className="text-[10px] text-zinc-500">NINE</span>
                </div>
                <div className="text-[9px] text-zinc-500">Last 3,500 blocks</div>
              </div>

              <div className="rounded-xl border border-purple-500/30 bg-black/60 p-3 shadow-inner">
                <div className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1">
                  <Crosshair className="h-3 w-3 text-purple-400" />
                  <span>WHALE ROTATIONS</span>
                </div>
                <div className="text-sm font-black text-purple-300 mt-0.5">
                  {whaleMovesCount} MOVES
                </div>
                <div className="text-[9px] text-zinc-500">&gt; 5,000 $NINE each</div>
              </div>
            </div>
          </div>

          {/* Quick Target Address Search & Active Movers Bar */}
          <div className="relative z-10 pt-5">
            <div className="flex flex-col sm:flex-row items-center gap-2 mb-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  value={targetWallet}
                  onChange={(e) => setTargetWallet(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && traceWalletMovement()}
                  placeholder="Enter any Robinhood wallet address to trace where tokens came from & went next (0x...)"
                  className="w-full rounded-xl border border-nine-border bg-black/80 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <button
                onClick={() => traceWalletMovement()}
                disabled={isTracingPath || !targetWallet.trim()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-6 py-2.5 text-xs font-bold text-black hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all disabled:opacity-50 shrink-0"
              >
                {isTracingPath ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>TRACING PATHWAY...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="h-4 w-4" />
                    <span>TRACE WALLET MOVEMENT</span>
                  </>
                )}
              </button>
            </div>

            {/* Detected Live Movers Chips */}
            <div className="flex flex-wrap items-center gap-2 text-[10px]">
              <span className="text-zinc-500 font-bold uppercase flex items-center gap-1">
                <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
                <span>ACTIVE RADAR TARGETS:</span>
              </span>

              {connectedProfile && (
                <button
                  onClick={() => {
                    setTargetWallet(connectedProfile.address);
                    traceWalletMovement(connectedProfile.address);
                  }}
                  className="rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-2.5 py-1 text-emerald-300 font-bold hover:bg-emerald-900/60 transition-colors flex items-center gap-1"
                >
                  <User className="h-3 w-3" />
                  <span>MY WALLET ({connectedProfile.shortAddress})</span>
                </button>
              )}

              {topActiveMovers.length > 0 && (
                topActiveMovers.map((mover) => (
                  <button
                    key={mover.address}
                    onClick={() => {
                      setTargetWallet(mover.address);
                      traceWalletMovement(mover.address);
                    }}
                    className={`rounded-lg border px-2.5 py-1 font-bold transition-all flex items-center gap-1.5 ${
                      targetWallet.toLowerCase() === mover.address.toLowerCase()
                        ? 'border-emerald-400 bg-emerald-500 text-black shadow-sm'
                        : mover.type === 'WHALE'
                        ? 'border-purple-500/40 bg-purple-950/40 text-purple-300 hover:bg-purple-900/60'
                        : mover.type === 'DEX' || mover.type === 'ROUTER'
                        ? 'border-sky-500/40 bg-sky-950/40 text-sky-300 hover:bg-sky-900/60'
                        : 'border-zinc-700 bg-zinc-900/70 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <span>{mover.tag}</span>
                    <span className="text-[9px] opacity-75">
                      ({mover.volume.toLocaleString()} NINE)
                    </span>
                  </button>
                ))
              )}

              <button
                onClick={() => {
                  setTargetWallet(BURN_ADDRESS);
                  traceWalletMovement(BURN_ADDRESS);
                }}
                className="rounded-lg border border-amber-500/40 bg-amber-950/30 px-2.5 py-1 text-nine-gold font-bold hover:bg-amber-900/40 transition-colors flex items-center gap-1"
              >
                <Flame className="h-3 w-3" />
                <span>DEAD VAULT (0x...dEaD)</span>
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. THREE CORE RADAR TABS                                 */}
        {/* ======================================================== */}
        <div className="flex items-center justify-between border-b border-nine-border pb-3 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveMainView('STREAM');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeMainView === 'STREAM'
                  ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Radio className={`h-4 w-4 ${activeMainView === 'STREAM' ? 'animate-pulse' : ''}`} />
              <span>LIVE MOVEMENT STREAM</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 font-mono">
                {filteredTransfers.length}
              </span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setActiveMainView('PATH_TRACER');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeMainView === 'PATH_TRACER'
                  ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Navigation className="h-4 w-4" />
              <span>WHERE DID THE CAT GO? (PATH TRACER)</span>
              {pathResult && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 font-mono">
                  {pathResult.transfersCount} MOVES
                </span>
              )}
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setActiveMainView('BLUEPRINT');
              }}
              className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeMainView === 'BLUEPRINT'
                  ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>SUPPLY BLUEPRINT</span>
            </button>
          </div>

          {/* Auto poll toggle & scan trigger */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAutoPoll((p) => !p)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                isAutoPoll
                  ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
                  : 'border-zinc-700 bg-zinc-900 text-zinc-500'
              }`}
              title="Continuous background refresh every 9s"
            >
              AUTO-POLL: {isAutoPoll ? 'ON (9s)' : 'PAUSED'}
            </button>

            <button
              onClick={fetchLiveTransfers}
              disabled={isLoadingTransfers}
              className="p-2 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white hover:border-emerald-500 transition-all disabled:opacity-50"
              title="Manual scan"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingTransfers ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* VIEW 1: LIVE MOVEMENT STREAM & RADAR SWEEP               */}
        {/* ======================================================== */}
        {activeMainView === 'STREAM' && (
          <div className="space-y-6">
            {/* Filter Bar & Visual Metrics */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d0e15] border border-nine-border/70 p-4 rounded-xl">
              <div className="flex flex-wrap items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase">FILTER MOVEMENTS:</span>
                <div className="flex flex-wrap items-center gap-1.5 ml-1">
                  {(
                    [
                      { key: 'ALL', label: `ALL (${transfers.length})` },
                      { key: 'WHALES', label: `🐋 WHALES (${whaleMovesCount})` },
                      { key: 'BUYS', label: `🟢 BUYS (${dexBuysCount})` },
                      { key: 'SELLS', label: `🔴 SELLS (${dexSellsCount})` },
                      { key: 'BURNS', label: `🔥 BURNS (${burnsCount})` },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.key}
                      onClick={() => {
                        soundManager.playClick();
                        setTransferFilter(f.key);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        transferFilter === f.key
                          ? 'bg-emerald-500 text-black shadow-sm'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-[11px] text-zinc-400 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Showing {filteredTransfers.length} verified on-chain transfers</span>
              </div>
            </div>

            {/* Transfers Feed List */}
            {filteredTransfers.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800/80 bg-[#0c0e14]/90 p-12 text-center">
                <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-700 mx-auto flex items-center justify-center mb-3 text-emerald-400">
                  <Activity className="h-6 w-6 animate-pulse" />
                </div>
                <div className="text-sm font-bold text-white uppercase tracking-wider">
                  RADAR SCANNING ROBINHOOD CHAIN MAINNET (4663)
                </div>
                <div className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  Awaiting official token launch transactions. Sensors are live and polling blocks in real time.
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTransfers.map((tx) => (
                <div
                  key={tx.txHash + '-' + tx.blockNumber + '-' + tx.amount}
                  className="rounded-xl border border-nine-border bg-[#0d0f14] p-4 hover:border-emerald-500/50 hover:bg-[#0f1412] transition-all shadow-md group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    
                    {/* Left: Type Badge, Amount & Time */}
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shrink-0 ${
                          tx.transferType === 'BURN'
                            ? 'bg-red-950 text-red-300 border border-red-500/50 animate-pulse'
                            : tx.transferType === 'WHALE_BUY'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                            : tx.transferType === 'DEX_BUY'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-600/40'
                            : tx.transferType === 'WHALE_SELL'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                            : tx.transferType === 'DEX_SELL'
                            ? 'bg-amber-950/60 text-amber-400 border border-amber-600/40'
                            : tx.transferType === 'WHALE_TRANSFER'
                            ? 'bg-purple-950 text-purple-300 border border-purple-500/50'
                            : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                        }`}
                      >
                        {tx.transferType === 'BURN'
                          ? '🔥 BURN TO DEAD'
                          : tx.transferType === 'WHALE_BUY'
                          ? '🐋 WHALE BUY'
                          : tx.transferType === 'DEX_BUY'
                          ? '🟢 DEX BUY'
                          : tx.transferType === 'WHALE_SELL'
                          ? '📉 WHALE SELL'
                          : tx.transferType === 'DEX_SELL'
                          ? '🔴 DEX SELL'
                          : tx.transferType === 'WHALE_TRANSFER'
                          ? '🐋 WHALE MOVE'
                          : '⚡ TOKEN MOVE'}
                      </span>

                      <div>
                        <div className="text-sm font-black text-white flex items-center gap-2">
                          <span className="text-emerald-400">{tx.amount.toLocaleString()} $NINE</span>
                          <span className="text-xs text-zinc-500 font-normal">
                            (~${tx.amountUSD.toLocaleString()})
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5 flex items-center gap-2">
                          <span>Block #{tx.blockNumber.toLocaleString()}</span>
                          <span>•</span>
                          <span>{tx.timestampDesc}</span>
                          <span className="text-zinc-600 font-mono">({tx.exactTime})</span>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Movement Direction Flow (From -> To) */}
                    <div className="flex items-center gap-2 text-xs font-mono bg-black/50 px-3.5 py-2 rounded-lg border border-zinc-800 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-500 text-[10px]">FROM:</span>
                        <span className="text-zinc-200 font-bold hover:text-emerald-400 transition-colors">
                          {tx.fromTag}
                        </span>
                        <button
                          onClick={() => handleCopy(tx.from)}
                          className="p-0.5 text-zinc-600 hover:text-white"
                          title="Copy address"
                        >
                          {copiedText === tx.from ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>

                      <ArrowRight className="h-3.5 w-3.5 text-emerald-400 shrink-0" />

                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-500 text-[10px]">TO:</span>
                        <span
                          className={`font-bold transition-colors ${
                            tx.transferType === 'BURN'
                              ? 'text-amber-400'
                              : 'text-zinc-200 hover:text-emerald-400'
                          }`}
                        >
                          {tx.toTag}
                        </span>
                        <button
                          onClick={() => handleCopy(tx.to)}
                          className="p-0.5 text-zinc-600 hover:text-white"
                          title="Copy address"
                        >
                          {copiedText === tx.to ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Right Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Interactive Path Trace Trigger */}
                      <button
                        onClick={() => {
                          const target = tx.toType === 'OPERATIVE' ? tx.to : tx.from;
                          setTargetWallet(target);
                          traceWalletMovement(target);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-emerald-500/50 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 transition-all text-xs font-bold shadow-sm"
                        title="Trace where tokens came from and went next"
                      >
                        <Navigation className="h-3.5 w-3.5" />
                        <span>FOLLOW THE CAT</span>
                      </button>

                      {/* Blockscout Link */}
                      <a
                        href={tx.explorerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 p-2 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-500 transition-all"
                        title="View verified tx on Robinhood Blockscout"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>

                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: WHERE DID THE CAT GO? (INTERACTIVE PATH TRACER) */}
        {/* ======================================================== */}
        {activeMainView === 'PATH_TRACER' && (
          <div className="space-y-6 animate-fadeIn">
            {pathError && (
              <div className="rounded-xl border border-red-500/50 bg-red-950/40 p-4 text-xs text-red-300 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{pathError}</span>
              </div>
            )}

            {pathResult ? (
              <div className="rounded-2xl border border-emerald-500/40 bg-[#0d0e15] p-6 shadow-2xl space-y-6">
                
                {/* 1. Tracer Header Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-950 border border-emerald-500/50 flex items-center justify-center shrink-0">
                      <Compass className="h-5 w-5 text-emerald-400 animate-spin [animation-duration:15s]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500 font-bold uppercase">TARGET PATH TRACED:</span>
                        <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                          {pathResult.verdict}
                        </span>
                      </div>
                      <div className="text-sm sm:text-base font-mono font-bold text-white mt-0.5 flex items-center gap-2 select-all">
                        <span>{pathResult.targetWallet}</span>
                        <button
                          onClick={() => handleCopy(pathResult.targetWallet)}
                          className="text-zinc-500 hover:text-white"
                        >
                          {copiedText === pathResult.targetWallet ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <a
                          href={`${ROBINHOOD_CONFIG.blockExplorerUrl}/address/${pathResult.targetWallet}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-zinc-500 hover:text-emerald-400"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Wallet Net Metrics */}
                  <div className="grid grid-cols-3 gap-3 text-center text-xs">
                    <div className="rounded-xl bg-black/60 p-2.5 border border-zinc-800">
                      <div className="text-[10px] text-zinc-500 uppercase font-bold">CURRENT BAG</div>
                      <div className="text-sm font-black text-emerald-400 mt-0.5">
                        {Math.round(pathResult.walletBalance).toLocaleString()} $NINE
                      </div>
                      <div className="text-[9px] text-zinc-500 mt-0.5">
                        ~${pathResult.walletBalanceUSD.toLocaleString()} USD
                      </div>
                    </div>

                    <div className="rounded-xl bg-black/60 p-2.5 border border-zinc-800">
                      <div className="text-[10px] text-zinc-500 uppercase font-bold flex items-center justify-center gap-1 text-emerald-400">
                        <ArrowDownLeft className="h-3 w-3" />
                        <span>TOTAL INFLOW</span>
                      </div>
                      <div className="text-sm font-black text-white mt-0.5">
                        +{Math.round(pathResult.totalInflow).toLocaleString()}
                      </div>
                      <div className="text-[9px] text-zinc-500 mt-0.5">
                        ~${pathResult.totalInflowUSD.toLocaleString()} USD
                      </div>
                    </div>

                    <div className="rounded-xl bg-black/60 p-2.5 border border-zinc-800">
                      <div className="text-[10px] text-zinc-500 uppercase font-bold flex items-center justify-center gap-1 text-amber-400">
                        <ArrowUpRight className="h-3 w-3" />
                        <span>TOTAL OUTFLOW</span>
                      </div>
                      <div className="text-sm font-black text-amber-400 mt-0.5">
                        -{Math.round(pathResult.totalOutflow).toLocaleString()}
                      </div>
                      <div className="text-[9px] text-zinc-500 mt-0.5">
                        ~${pathResult.totalOutflowUSD.toLocaleString()} USD
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Cat Retention Gauge Bar */}
                <div className="rounded-xl border border-zinc-800/80 bg-black/50 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 text-xs">
                    <span className="font-bold uppercase text-zinc-300 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-emerald-400" />
                      <span>CAT RETENTION INDEX (DIAMOND PAWS METRIC)</span>
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {pathResult.retentionRate}% RETAINED IN CURRENT BAG
                    </span>
                  </div>

                  {/* Progress track */}
                  <div className="relative h-2.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 transition-all duration-700"
                      style={{ width: `${pathResult.retentionRate}%` }}
                    />
                  </div>

                  <div className="mt-2 text-[11px] text-zinc-400 flex items-center justify-between">
                    <span>{pathResult.verdictDetail}</span>
                    {pathResult.burnContribution > 0 && (
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Flame className="h-3 w-3" />
                        <span>Burned {pathResult.burnContribution.toLocaleString()} $NINE</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. VISUAL FLOW GRAPH: Inflow Sources -> Current Bag -> Outflow Destinations */}
                <div className="rounded-xl border border-zinc-800/80 bg-black/50 p-5">
                  <div className="text-xs font-bold uppercase text-zinc-400 mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Navigation className="h-4 w-4 text-emerald-400" />
                      <span>VISUAL TOKEN FLOW PATHWAY ("WHERE DID THE CAT GO?")</span>
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      Net Flow: <strong className={pathResult.netFlow >= 0 ? 'text-emerald-400' : 'text-amber-400'}>
                        {pathResult.netFlow >= 0 ? '+' : ''}{pathResult.netFlow.toLocaleString()} $NINE
                      </strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                    
                    {/* Stage 1: Inflow Sources */}
                    <div className="rounded-xl border border-emerald-500/30 bg-[#07100b] p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-emerald-400 font-bold uppercase flex items-center gap-1">
                            <ArrowDownLeft className="h-4 w-4" />
                            <span>1. INFLOW SOURCES</span>
                          </span>
                          <span className="text-[10px] text-zinc-500">+{pathResult.totalInflow.toLocaleString()} $NINE</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mb-3">
                          Counterparties who dispatched tokens into this wallet:
                        </p>

                        <div className="space-y-1.5">
                          {pathResult.topSenders.length === 0 ? (
                            <div className="text-[11px] text-zinc-500 italic p-2 bg-black/40 rounded-lg">
                              No recent inbound transfers in scan window
                            </div>
                          ) : (
                            pathResult.topSenders.map((s) => (
                              <div
                                key={s.address}
                                className="flex items-center justify-between p-2 rounded-lg bg-black/60 border border-zinc-800/80 text-[11px] hover:border-emerald-500/40 transition-colors"
                              >
                                <div className="truncate max-w-[130px]">
                                  <div className="font-bold text-zinc-200 truncate" title={s.address}>
                                    {s.tag}
                                  </div>
                                  <div className="text-[9px] text-zinc-500">
                                    {s.count} txs {s.percentage ? `• ${s.percentage}%` : ''}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-emerald-400 font-bold">
                                    +{s.totalAmount.toLocaleString()} AI
                                  </span>
                                  <button
                                    onClick={() => {
                                      setTargetWallet(s.address);
                                      traceWalletMovement(s.address);
                                    }}
                                    className="p-1 rounded bg-zinc-800 hover:bg-emerald-500 hover:text-black text-zinc-400 text-[9px] transition-colors"
                                    title="Jump and trace this sender"
                                  >
                                    <ChevronRight className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-zinc-800 text-[10px] text-zinc-500">
                        Click arrow to trace any sender counterparty
                      </div>
                    </div>

                    {/* Stage 2: Target Current Bag */}
                    <div className="rounded-xl border-2 border-emerald-500/50 bg-gradient-to-b from-[#0f1712] via-[#09100c] to-black p-4 flex flex-col justify-between shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-white font-bold uppercase flex items-center gap-1">
                            <Lock className="h-4 w-4 text-emerald-400" />
                            <span>2. RETAINED BAG</span>
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/40">
                            ON-CHAIN
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mb-3">
                          Verified tokens actively held inside this wallet right now.
                        </p>

                        <div className="rounded-xl bg-black/70 p-3 border border-emerald-500/30 text-center mb-2">
                          <div className="text-2xl font-black text-emerald-400">
                            {Math.round(pathResult.walletBalance).toLocaleString()} $NINE
                          </div>
                          <div className="text-xs text-zinc-400 mt-0.5">
                            ~${pathResult.walletBalanceUSD.toLocaleString()} USD
                          </div>
                        </div>

                        <div className="text-center text-[10px] text-zinc-500 mt-2">
                          Where is the cat? Rested in wallet.
                        </div>
                      </div>

                      <div className="pt-3 border-t border-zinc-800 text-[11px] flex items-center justify-between">
                        <span className="text-zinc-500">Classification:</span>
                        <span className="text-emerald-400 font-bold">{pathResult.verdict}</span>
                      </div>
                    </div>

                    {/* Stage 3: Outflow Destinations */}
                    <div className="rounded-xl border border-amber-500/30 bg-[#120f09] p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-amber-400 font-bold uppercase flex items-center gap-1">
                            <ArrowUpRight className="h-4 w-4" />
                            <span>3. WHERE TOKENS WENT</span>
                          </span>
                          <span className="text-[10px] text-zinc-500">-{pathResult.totalOutflow.toLocaleString()} $NINE</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mb-3">
                          Destination entities where bags moved next:
                        </p>

                        <div className="space-y-1.5">
                          {pathResult.topReceivers.length === 0 ? (
                            <div className="p-3 rounded-lg bg-black/60 border border-zinc-800 text-[11px] text-emerald-300 text-center font-bold">
                              ✨ 0 Outflow: Diamond Paws! Wallet has never sold or transferred out.
                            </div>
                          ) : (
                            pathResult.topReceivers.map((r) => (
                              <div
                                key={r.address}
                                className="flex items-center justify-between p-2 rounded-lg bg-black/60 border border-zinc-800/80 text-[11px] hover:border-amber-500/40 transition-colors"
                              >
                                <div className="truncate max-w-[130px]">
                                  <div
                                    className={`font-bold truncate ${
                                      r.type === 'BURN' ? 'text-amber-400' : 'text-zinc-200'
                                    }`}
                                    title={r.address}
                                  >
                                    {r.tag}
                                  </div>
                                  <div className="text-[9px] text-zinc-500">
                                    {r.count} txs {r.percentage ? `• ${r.percentage}%` : ''}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-amber-400 font-bold">
                                    -{r.totalAmount.toLocaleString()} AI
                                  </span>
                                  <button
                                    onClick={() => {
                                      setTargetWallet(r.address);
                                      traceWalletMovement(r.address);
                                    }}
                                    className="p-1 rounded bg-zinc-800 hover:bg-amber-500 hover:text-black text-zinc-400 text-[9px] transition-colors"
                                    title="Jump and follow the cat to this recipient"
                                  >
                                    <ChevronRight className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-zinc-800 text-[10px] text-zinc-500">
                        Click arrow to follow the cat to the next wallet
                      </div>
                    </div>

                  </div>
                </div>

                {/* 4. Individual Movement History List */}
                <div>
                  <div className="text-xs font-bold uppercase text-zinc-400 mb-3 flex items-center justify-between">
                    <span>CHRONOLOGICAL ON-CHAIN MOVEMENTS ({pathResult.transfers.length})</span>
                    <span className="text-[11px] text-zinc-500">Scanned last 18,000 blocks</span>
                  </div>

                  {pathResult.transfers.length === 0 ? (
                    <div className="rounded-xl border border-zinc-800 bg-black/40 p-6 text-center text-xs text-zinc-400">
                      No transfer events detected in the scan window for this address.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {pathResult.transfers.map((tx) => {
                        const isIncoming = tx.to.toLowerCase() === pathResult.targetWallet.toLowerCase();
                        const isBurn = tx.transferType === 'BURN';
                        return (
                          <div
                            key={tx.txHash + '-' + tx.blockNumber + '-' + tx.amount}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-black/40 p-3 text-xs hover:border-zinc-700 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                  isBurn
                                    ? 'bg-red-950 text-red-300 border border-red-500/40 animate-pulse'
                                    : isIncoming
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                    : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                                }`}
                              >
                                {isBurn ? '🔥 BURNED' : isIncoming ? '+ RECEIVED' : '- SENT OUT'}
                              </span>

                              <div className="font-bold text-white">
                                <span className={isIncoming ? 'text-emerald-400' : 'text-amber-400'}>
                                  {isIncoming ? '+' : '-'}
                                  {tx.amount.toLocaleString()} $NINE
                                </span>
                                <span className="text-zinc-500 font-normal ml-2">
                                  (~${tx.amountUSD.toLocaleString()})
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-zinc-400 text-[11px]">
                              <span>
                                {isIncoming ? `From: ${tx.fromTag}` : `To: ${tx.toTag}`}
                              </span>
                              <span>•</span>
                              <span>{tx.timestampDesc}</span>
                              <span className="text-zinc-600 font-mono">({tx.exactTime})</span>
                              <a
                                href={tx.explorerUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                              >
                                <span>TX</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-800 bg-black/40 p-12 text-center text-xs text-zinc-400">
                <Compass className="h-8 w-8 text-emerald-400 mx-auto mb-3 animate-spin [animation-duration:10s]" />
                <p className="text-sm font-bold text-white mb-1">ENTER A WALLET TO TRACE WHERE TOKENS WENT</p>
                <p>Click any transfer from the Live Stream or select a preset above to inspect its real movement path.</p>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: SUPPLY BLUEPRINT & ARCHITECTURAL TRAILS         */}
        {/* ======================================================== */}
        {activeMainView === 'BLUEPRINT' && (
          <div className="rounded-2xl border border-nine-border bg-nine-surface p-6 font-mono shadow-2xl animate-fadeIn">
            {/* Trail Navigation Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-nine-border/70 pb-4 mb-6">
              <div>
                <div className="text-sm font-black text-white flex items-center gap-2">
                  <span>{activeTrail.catId}</span>
                  <span className="text-zinc-500">—</span>
                  <span className="text-nine-green">
                    FLOW VOLUME: {activeTrail.totalMoved.toLocaleString()} $NINE
                  </span>
                </div>
                <div className="text-xs text-zinc-400 mt-1">{activeTrail.story}</div>
              </div>

              {/* Segmented Trail Selector */}
              <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-zinc-800 shrink-0">
                {(
                  [
                    { key: 'genesis', label: '01 // GENESIS & SUPPLY' },
                    { key: 'arcade_burn', label: '02 // DEAD VAULT BURNS' },
                    { key: 'whale_flow', label: '03 // WHALE FLOW' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      soundManager.playClick();
                      setActiveTrailKey(tab.key);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTrailKey === tab.key
                        ? 'bg-emerald-500 text-black shadow-sm'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stepper Node Visualizer Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {activeTrail.steps.map((step) => (
                <div
                  key={step.step}
                  className="relative rounded-xl border border-nine-border bg-nine-bg p-4 flex flex-col justify-between hover:border-emerald-500/60 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="h-6 w-6 rounded-full bg-zinc-800 border border-zinc-700 text-white font-bold text-xs flex items-center justify-center group-hover:border-emerald-400 group-hover:text-emerald-300 transition-colors">
                        0{step.step}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          step.type === 'BURN'
                            ? 'bg-red-950 text-red-300 border border-red-500/40 animate-pulse'
                            : step.type === 'MINT'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : step.type === 'GATEWAY'
                            ? 'bg-purple-950 text-purple-300 border border-purple-500/40'
                            : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                        }`}
                      >
                        {step.type}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">
                      {step.label}
                    </div>
                    <div className="text-[10px] text-nine-gold font-bold mb-2">
                      {step.amount.toLocaleString()} $NINE
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed mb-4">
                      {step.actionDesc}
                    </p>
                  </div>

                  {/* Footer Address Strip */}
                  <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px]">
                    <a
                      href={`${ROBINHOOD_CONFIG.blockExplorerUrl}/address/${step.address}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-400 hover:text-emerald-400 font-mono text-[10px] truncate max-w-[130px] flex items-center gap-1 transition-colors"
                      title={`View ${step.address} on Robinhood Explorer`}
                    >
                      <span>
                        {step.address.slice(0, 6)}...{step.address.slice(-4)}
                      </span>
                      <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-60" />
                    </a>

                    <button
                      onClick={() => handleCopy(step.address)}
                      className="p-1 text-zinc-500 hover:text-white transition-colors"
                      title="Copy full address"
                    >
                      {copiedText === step.address ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Trail Conclusion & Block Explorer Redirect */}
            <div className="mt-6 rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>{activeTrail.verdict}</span>
              </div>
              
              <a
                href={`${ROBINHOOD_CONFIG.blockExplorerUrl}/token/${DEFAULT_TOKEN_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-emerald-500/50 bg-emerald-900/40 hover:bg-emerald-800/60 px-3 py-1.5 text-xs text-white font-bold transition-all shadow-sm"
              >
                <span>VIEW $NINE CONTRACT ON ROBINHOOD BLOCKSCOUT</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
