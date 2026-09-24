'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useNine } from '@/context/NineContext';
import { soundManager } from '@/lib/sound';
import {
  Share2,
  ExternalLink,
  TrendingUp,
  MessageSquare,
  Sparkles,
  HelpCircle,
  Award,
  RefreshCw,
  X,
  Radio,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Flame,
  Search,
  Crown,
  Eye,
  Layers,
  Filter,
  BarChart2,
  SlidersHorizontal,
  ChevronDown,
  Info,
} from 'lucide-react';

interface ScoreBreakdown {
  postsPoints: number;
  streakPoints: number;
  reachPoints: number;
  consistencyPoints: number;
}

interface BagWorkerItem {
  rank: number;
  twitterHandle: string;
  displayName: string;
  avatarUrl: string;
  bagWorkerScore: number;
  scoreBreakdown?: ScoreBreakdown;
  postsCount: number;
  activeDays: number;
  topPostImpressions: number;
  totalImpressions?: number;
  totalLikes?: number;
  totalRetweets?: number;
  consistencyScore: number;
  customTitle?: string;
  latestPostQuote: string;
  latestTweetUrl?: string;
  latestTweetTime?: string;
  achievements?: string[];
  profile?: any;
}

interface MacroStats {
  totalTracked: number;
  totalTweets: number;
  cumulativeImpressions: number;
  topViralReach: number;
  topViralHandle: string;
  topVolumeCount: number;
  topVolumeHandle: string;
  engine: string;
  database: string;
}

type FilterCategory = 'ALL' | 'VIRAL' | 'ACTIVE' | 'WHALES';
type SortOption = 'SCORE' | 'REACH' | 'POSTS' | 'DAYS';

export function BagWorkersSection() {
  const { setBagWorkerExplainerOpen } = useNine();
  const [workers, setWorkers] = useState<BagWorkerItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Just now');
  const [source, setSource] = useState<string>('SUPABASE_POSTGRESQL');
  const [macroStats, setMacroStats] = useState<MacroStats>({
    totalTracked: 0,
    totalTweets: 0,
    cumulativeImpressions: 0,
    topViralReach: 0,
    topViralHandle: '—',
    topVolumeCount: 0,
    topVolumeHandle: '—',
    engine: 'Playwright Stealth 6H Automation',
    database: 'Supabase PostgreSQL (Port 6543 Pooler)',
  });

  // Filter & Search & Sort states
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('SCORE');
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  const fetchBagWorkers = async () => {
    setIsLoading(true);
    soundManager.playClick();
    try {
      const res = await fetch('/api/bag-workers');
      const data = await res.json();
      if (data?.success && data?.leaderboard) {
        // Normalize objects
        const normalized: BagWorkerItem[] = data.leaderboard.map((item: any, idx: number) => {
          const postsCount = Number(item.postsCount || 1);
          const activeDays = Number(item.activeDays || 1);
          const topPostImpressions = Number(item.topPostImpressions || 1000);
          const consistencyScore = Number(item.consistencyScore || 60);

          // Calculate or use breakdown
          const breakdown = item.scoreBreakdown || {
            postsPoints: Number(Math.min(30.0, postsCount * 1.5 + 5.0).toFixed(1)),
            streakPoints: Number(Math.min(25.0, activeDays * 5.0).toFixed(1)),
            reachPoints: Number(Math.min(35.0, Math.log10(Math.max(10, topPostImpressions)) * 7.5).toFixed(1)),
            consistencyPoints: Number(Math.min(10.0, consistencyScore * 0.1).toFixed(1)),
          };

          return {
            rank: item.rank || idx + 1,
            twitterHandle: item.twitterHandle || item.profile?.twitterHandle || 'bagworker',
            displayName: item.displayName || item.profile?.displayName || 'Bag Worker',
            avatarUrl: item.avatarUrl || item.profile?.avatarUrl || '/assets/mascot/mascot_head_favicon.webp',
            bagWorkerScore: Number(item.bagWorkerScore || 50),
            scoreBreakdown: breakdown,
            postsCount,
            activeDays,
            topPostImpressions,
            totalImpressions: Number(item.totalImpressions || topPostImpressions),
            totalLikes: item.totalLikes || 0,
            totalRetweets: item.totalRetweets || 0,
            consistencyScore,
            customTitle: item.customTitle || item.profile?.customTitle || '🐱 $NINE BAG WORKER',
            latestPostQuote: item.latestPostQuote || '"Working the $nine bag daily with Nine The Cat on Robinhood Chain."',
            latestTweetUrl: item.latestTweetUrl || `https://x.com/${item.twitterHandle}`,
            latestTweetTime: item.latestTweetTime,
            achievements: item.achievements || item.profile?.achievements || ['$NINE HOLDER', 'NINE THE CAT', 'BAG WORKER'],
            profile: item.profile || {
              displayName: item.displayName,
              twitterHandle: item.twitterHandle,
              avatarUrl: item.avatarUrl,
              nineHoldings: 100000,
              holdingSince: 'Day 1',
              achievements: item.achievements || ['BAG WORKER'],
            },
          };
        });

        setWorkers(normalized);
        if (data.macroStats) {
          setMacroStats(data.macroStats);
        }
        setSource(data.source || 'SUPABASE_POSTGRESQL');
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error('Failed to fetch bag workers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBagWorkers();
    const interval = setInterval(fetchBagWorkers, 30000); // 30s live poll
    return () => clearInterval(interval);
  }, []);

  // Filter and sort logic
  const filteredAndSortedWorkers = useMemo(() => {
    let list = [...workers];

    // Category filter
    if (selectedCategory === 'VIRAL') {
      list = list.filter((w) => w.topPostImpressions >= 1000);
    } else if (selectedCategory === 'ACTIVE') {
      list = list.filter((w) => w.postsCount >= 2);
    } else if (selectedCategory === 'WHALES') {
      list = list.filter(
        (w) =>
          w.customTitle?.toLowerCase().includes('whale') ||
          w.customTitle?.toLowerCase().includes('radar') ||
          w.customTitle?.toLowerCase().includes('alpha') ||
          w.achievements?.some((a) => a.toLowerCase().includes('whale') || a.toLowerCase().includes('alpha'))
      );
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (w) =>
          w.twitterHandle.toLowerCase().includes(q) ||
          w.displayName.toLowerCase().includes(q) ||
          w.customTitle?.toLowerCase().includes(q) ||
          w.latestPostQuote.toLowerCase().includes(q) ||
          w.achievements?.some((a) => a.toLowerCase().includes(q))
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'SCORE') return b.bagWorkerScore - a.bagWorkerScore;
      if (sortBy === 'REACH') return b.topPostImpressions - a.topPostImpressions;
      if (sortBy === 'POSTS') return b.postsCount - a.postsCount;
      if (sortBy === 'DAYS') return b.activeDays - a.activeDays;
      return a.rank - b.rank;
    });

    return list;
  }, [workers, selectedCategory, searchQuery, sortBy]);

  // Top 3 Podium
  const top3 = useMemo(() => {
    return [...workers].sort((a, b) => a.rank - b.rank).slice(0, 3);
  }, [workers]);

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toLocaleString();
  };

  return (
    <section id="bag-workers" className="relative w-full border-b border-nine-border bg-[#07080c] py-14 overflow-hidden">
      {/* Subtle background ambient aura */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-amber-500/5 via-amber-500/0 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-60 w-[400px] h-[400px] bg-nine-green/5 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 font-mono relative z-10">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 border-b border-nine-border/80 pb-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs text-nine-gold uppercase tracking-widest mb-1.5 font-bold">
              <Share2 className="h-4 w-4" />
              <span>ROBINHOOD CHAIN ON-CHAIN SOCIAL RADAR</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white flex items-center gap-3.5 flex-wrap">
              <span>$NINE BAG WORKERS</span>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                SUPABASE LIVE SYNC
              </span>
            </h2>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <a
                href="https://x.com/NineDcat"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-black bg-nine-gold hover:bg-amber-400 px-3 py-1 rounded transition-colors shadow-[0_0_12px_rgba(255,215,0,0.3)]"
              >
                <span>𝕏 TARGET ACCOUNT: @NineDcat</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <span className="text-[11px] text-zinc-300 border border-zinc-800 bg-black/60 px-2.5 py-1 rounded flex items-center gap-1.5">
                <span className="text-zinc-500">TRACKING:</span>
                <strong className="text-nine-gold">$nine</strong>
                <span className="text-zinc-600">•</span>
                <strong className="text-white">nine the cat</strong>
              </span>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-3xl leading-relaxed">
              Automated social telemetry tracking community effort, viral memes, and daily consistency for{' '}
              <strong className="text-white">$nine</strong> and <strong className="text-white">nine the cat</strong>, monitoring mentions and replies for official mascot{' '}
              <a href="https://x.com/NineDcat" target="_blank" rel="noreferrer" className="text-nine-gold hover:underline font-bold">@NineDcat</a>.
              Powered by a 6-hour Playwright stealth daemon and verified PostgreSQL database.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">

            <button
              onClick={fetchBagWorkers}
              disabled={isLoading}
              className="flex items-center gap-1.5 rounded-lg border border-nine-border bg-nine-surface/80 backdrop-blur px-3 py-2 text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
              title="Refresh social workers from Supabase"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-amber-400' : 'text-emerald-400'}`} />
              <span>SYNC LIVE</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setShowFormulaModal(true);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-nine-border bg-nine-surface/80 backdrop-blur px-3 py-2 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
            >
              <HelpCircle className="h-3.5 w-3.5 text-nine-gold" />
              <span>SCORING LOGIC</span>
            </button>
          </div>
        </div>

        {/* Macro Telemetry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
          <div className="rounded-xl border border-nine-border bg-[#0d0e14]/90 p-3.5 backdrop-blur shadow-sm">
            <div className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>TRACKED CREATORS</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              {workers.length || macroStats.totalTracked}
              <span className="text-xs text-zinc-500 font-normal ml-1.5">Accounts</span>
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5 truncate">
              Robinhood Chain $nine & @NineDcat community
            </div>
          </div>

          <div className="rounded-xl border border-nine-border bg-[#0d0e14]/90 p-3.5 backdrop-blur shadow-sm">
            <div className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-sky-400" />
              <span>INDEXED $NINE TWEETS</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              {macroStats.totalTweets}
              <span className="text-xs text-zinc-500 font-normal ml-1.5">Broadcasts</span>
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5">
              Scraped via Stealth ($nine / Nine The Cat)
            </div>
          </div>

          <div className="rounded-xl border border-nine-border bg-[#0d0e14]/90 p-3.5 backdrop-blur shadow-sm">
            <div className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-nine-gold" />
              <span>TOTAL TIMELINE REACH</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-nine-gold mt-1">
              {formatViews(macroStats.cumulativeImpressions || 0)}
              <span className="text-xs text-zinc-500 font-normal ml-1.5">Views</span>
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5">
              Cumulative view impressions
            </div>
          </div>

          <div className="rounded-xl border border-nine-border bg-[#0d0e14]/90 p-3.5 backdrop-blur shadow-sm">
            <div className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              <span>TOP VIRAL CALL</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              {macroStats.topViralReach ? formatViews(macroStats.topViralReach) : '0'}
              <span className="text-xs text-zinc-500 font-normal ml-1.5">Views</span>
            </div>
            <div className="text-[10px] text-amber-300/90 mt-0.5 truncate font-bold">
              {macroStats.topViralHandle !== '—' ? `@${macroStats.topViralHandle}` : 'Awaiting launch'}
            </div>
          </div>

          <div className="col-span-2 sm:col-span-2 lg:col-span-1 rounded-xl border border-nine-border bg-[#0d0e14]/90 p-3.5 backdrop-blur shadow-sm">
            <div className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5 text-emerald-400" />
              <span>SYNC STATUS</span>
            </div>
            <div className="text-sm font-black text-emerald-400 mt-1.5 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>POSTGRESQL 17</span>
            </div>
            <div className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3 text-zinc-500" />
              <span>{lastUpdated}</span>
            </div>
          </div>
        </div>

        {/* TOP 3 PODIUM (HALL OF FAME) */}
        {top3.length === 3 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 text-xs text-nine-gold font-bold uppercase tracking-wider mb-3">
              <Crown className="h-4 w-4" />
              <span>TOP 3 SOCIAL MVP BAG WORKERS</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* #1 Champion */}
              <div className="relative rounded-2xl border-2 border-amber-500/70 bg-gradient-to-b from-amber-950/40 via-[#10111a] to-[#0a0a0f] p-5 shadow-[0_0_30px_rgba(255,215,0,0.15)] flex flex-col justify-between overflow-hidden">
                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 via-amber-400 to-transparent text-black text-[10px] font-black px-3 py-0.5 rounded-bl-lg uppercase tracking-wider flex items-center gap-1 shadow-md">
                  <Crown className="h-3 w-3" />
                  <span>#1 SOCIAL MVP</span>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={top3[0].avatarUrl}
                      alt={top3[0].displayName}
                      className="h-14 w-14 rounded-xl border-2 border-amber-400/80 object-cover shadow-lg"
                    />
                    <div>
                      <div className="text-base font-black text-white flex items-center gap-1.5">
                        <span>{top3[0].displayName}</span>
                        <CheckCircle2 className="h-4 w-4 text-nine-gold shrink-0" />
                      </div>
                      <a
                        href={`https://x.com/${top3[0].twitterHandle}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-amber-300/80 hover:text-nine-gold font-bold transition-colors"
                      >
                        @{top3[0].twitterHandle}
                      </a>
                      <div className="text-[11px] text-amber-300 font-bold mt-0.5">
                        {top3[0].customTitle}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 rounded-lg border border-amber-500/30 bg-black/50 p-2 text-center text-xs mb-3">
                    <div>
                      <div className="text-[9px] text-zinc-400 uppercase">SCORE</div>
                      <div className="text-base font-black text-nine-gold">{top3[0].bagWorkerScore}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-zinc-400 uppercase">POSTS</div>
                      <div className="text-base font-black text-white">{top3[0].postsCount}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-zinc-400 uppercase">PEAK VIEWS</div>
                      <div className="text-base font-black text-emerald-400">{formatViews(top3[0].topPostImpressions)}</div>
                    </div>
                  </div>

                  <a
                    href={top3[0].latestTweetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-lg border border-amber-500/20 bg-black/40 p-2.5 text-xs text-zinc-200 italic hover:border-amber-400/50 hover:bg-black/60 transition-all mb-3 group/t"
                    title="Click to open verified tweet"
                  >
                    <div className="line-clamp-2">{top3[0].latestPostQuote}</div>
                    <div className="text-[10px] text-nine-gold not-italic mt-1.5 font-bold flex items-center gap-1">
                      <span>VERIFIED TWEET ON X</span>
                      <ExternalLink className="h-2.5 w-2.5 group-hover/t:translate-x-0.5 transition-transform" />
                    </div>
                  </a>
                </div>

                <div className="pt-2 border-t border-amber-500/20">
                  <a
                    href={top3[0].latestTweetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full justify-center text-xs text-amber-300 bg-amber-950/80 border border-amber-500/60 px-3 py-2 rounded-lg hover:bg-amber-900 font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <span>OPEN TWEET</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* #2 Silver */}
              <div className="relative rounded-2xl border border-zinc-500/60 bg-gradient-to-b from-zinc-800/30 via-[#10111a] to-[#0a0a0f] p-5 shadow-sm flex flex-col justify-between overflow-hidden">
                <div className="absolute top-0 right-0 bg-zinc-300 text-black text-[10px] font-black px-3 py-0.5 rounded-bl-lg uppercase tracking-wider flex items-center gap-1">
                  <span>🥈 #2 COMMUNITY LEAD</span>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={top3[1].avatarUrl}
                      alt={top3[1].displayName}
                      className="h-14 w-14 rounded-xl border border-zinc-400 object-cover shadow"
                    />
                    <div>
                      <div className="text-base font-black text-white flex items-center gap-1.5">
                        <span>{top3[1].displayName}</span>
                        <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0" />
                      </div>
                      <a
                        href={`https://x.com/${top3[1].twitterHandle}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-zinc-400 hover:text-white font-bold transition-colors"
                      >
                        @{top3[1].twitterHandle}
                      </a>
                      <div className="text-[11px] text-zinc-300 font-bold mt-0.5">
                        {top3[1].customTitle}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 rounded-lg border border-zinc-700/50 bg-black/50 p-2 text-center text-xs mb-3">
                    <div>
                      <div className="text-[9px] text-zinc-400 uppercase">SCORE</div>
                      <div className="text-base font-black text-white">{top3[1].bagWorkerScore}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-zinc-400 uppercase">POSTS</div>
                      <div className="text-base font-black text-white">{top3[1].postsCount}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-zinc-400 uppercase">PEAK VIEWS</div>
                      <div className="text-base font-black text-emerald-400">{formatViews(top3[1].topPostImpressions)}</div>
                    </div>
                  </div>

                  <a
                    href={top3[1].latestTweetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-lg border border-zinc-700/50 bg-black/40 p-2.5 text-xs text-zinc-300 italic hover:border-zinc-500 hover:bg-black/60 transition-all mb-3 group/t"
                    title="Click to open verified tweet"
                  >
                    <div className="line-clamp-2">{top3[1].latestPostQuote}</div>
                    <div className="text-[10px] text-sky-400 not-italic mt-1.5 font-bold flex items-center gap-1">
                      <span>VERIFIED TWEET ON X</span>
                      <ExternalLink className="h-2.5 w-2.5 group-hover/t:translate-x-0.5 transition-transform" />
                    </div>
                  </a>
                </div>

                <div className="pt-2 border-t border-zinc-800">
                  <a
                    href={top3[1].latestTweetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full justify-center text-xs text-zinc-200 bg-zinc-800 border border-zinc-600 px-3 py-2 rounded-lg hover:bg-zinc-700 font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <span>OPEN TWEET</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* #3 Bronze / Viral King */}
              <div className="relative rounded-2xl border border-amber-700/50 bg-gradient-to-b from-amber-950/20 via-[#10111a] to-[#0a0a0f] p-5 shadow-sm flex flex-col justify-between overflow-hidden">
                <div className="absolute top-0 right-0 bg-amber-700 text-amber-100 text-[10px] font-black px-3 py-0.5 rounded-bl-lg uppercase tracking-wider flex items-center gap-1">
                  <span>🥉 #3 VIRAL KING (19K)</span>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={top3[2].avatarUrl}
                      alt={top3[2].displayName}
                      className="h-14 w-14 rounded-xl border border-amber-600/70 object-cover shadow"
                    />
                    <div>
                      <div className="text-base font-black text-white flex items-center gap-1.5">
                        <span>{top3[2].displayName}</span>
                        <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
                      </div>
                      <a
                        href={`https://x.com/${top3[2].twitterHandle}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-amber-400/80 hover:text-amber-300 font-bold transition-colors"
                      >
                        @{top3[2].twitterHandle}
                      </a>
                      <div className="text-[11px] text-amber-400 font-bold mt-0.5">
                        {top3[2].customTitle}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 rounded-lg border border-amber-700/40 bg-black/50 p-2 text-center text-xs mb-3">
                    <div>
                      <div className="text-[9px] text-zinc-400 uppercase">SCORE</div>
                      <div className="text-base font-black text-white">{top3[2].bagWorkerScore}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-zinc-400 uppercase">POSTS</div>
                      <div className="text-base font-black text-white">{top3[2].postsCount}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-zinc-400 uppercase">PEAK VIEWS</div>
                      <div className="text-base font-black text-emerald-400">{formatViews(top3[2].topPostImpressions)}</div>
                    </div>
                  </div>

                  <a
                    href={top3[2].latestTweetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-lg border border-amber-700/30 bg-black/40 p-2.5 text-xs text-zinc-300 italic hover:border-amber-500 hover:bg-black/60 transition-all mb-3 group/t"
                    title="Click to open verified tweet"
                  >
                    <div className="line-clamp-2">{top3[2].latestPostQuote}</div>
                    <div className="text-[10px] text-amber-400 not-italic mt-1.5 font-bold flex items-center gap-1">
                      <span>VERIFIED TWEET ON X</span>
                      <ExternalLink className="h-2.5 w-2.5 group-hover/t:translate-x-0.5 transition-transform" />
                    </div>
                  </a>
                </div>

                <div className="pt-2 border-t border-amber-900/40">
                  <a
                    href={top3[2].latestTweetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full justify-center text-xs text-amber-200 bg-amber-950/70 border border-amber-700/60 px-3 py-2 rounded-lg hover:bg-amber-900 font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <span>OPEN TWEET</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter, Search & Sort Control Bar */}
        <div className="rounded-xl border border-nine-border bg-[#0d0e14]/90 p-4 mb-6 backdrop-blur flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => {
                soundManager.playClick();
                setSelectedCategory('ALL');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-nine-gold text-black shadow-[0_0_10px_rgba(255,215,0,0.3)]'
                  : 'bg-black/50 text-zinc-400 hover:text-white border border-nine-border'
              }`}
            >
              ALL WORKERS ({workers.length})
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setSelectedCategory('VIRAL');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                selectedCategory === 'VIRAL'
                  ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  : 'bg-black/50 text-zinc-400 hover:text-white border border-nine-border'
              }`}
            >
              <Flame className="h-3 w-3" />
              <span>VIRAL REACH (1K+ VIEWS)</span>
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setSelectedCategory('ACTIVE');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                selectedCategory === 'ACTIVE'
                  ? 'bg-sky-500 text-black shadow-[0_0_10px_rgba(14,165,233,0.3)]'
                  : 'bg-black/50 text-zinc-400 hover:text-white border border-nine-border'
              }`}
            >
              <TrendingUp className="h-3 w-3" />
              <span>HEAVY SHILLERS (2+ POSTS)</span>
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setSelectedCategory('WHALES');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                selectedCategory === 'WHALES'
                  ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  : 'bg-black/50 text-zinc-400 hover:text-white border border-nine-border'
              }`}
            >
              <ShieldCheck className="h-3 w-3" />
              <span>WHALES & ALPHAS</span>
            </button>
          </div>

          {/* Search & Sort Input Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search $nine bag workers, @NineDcat, tags..."
                className="w-full rounded-lg border border-nine-border bg-black/60 pl-8 pr-7 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-nine-gold font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => {
                  soundManager.playClick();
                  setSortBy(e.target.value as SortOption);
                }}
                className="rounded-lg border border-nine-border bg-black/60 px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-nine-gold font-mono appearance-none pr-8 cursor-pointer"
              >
                <option value="SCORE">Sort: Highest Score</option>
                <option value="REACH">Sort: Most Views / Reach</option>
                <option value="POSTS">Sort: Most Posts Count</option>
                <option value="DAYS">Sort: Active Days</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-500" />
            </div>
          </div>
        </div>

        {/* Workers Grid */}
        {workers.length === 0 ? (
          <div className="rounded-2xl border border-nine-border bg-gradient-to-b from-[#12131c]/90 via-[#0d0e14]/90 to-[#08080c] p-12 text-center text-zinc-400 font-mono shadow-xl relative overflow-hidden">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 mb-4 text-nine-gold">
              <Crown className="h-8 w-8 text-nine-gold animate-bounce" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
              NO $NINE BAG WORKERS INDEXED YET • AWAITING TOKEN LAUNCH
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-xl mx-auto leading-relaxed">
              The Playwright stealth background daemon is ready to crawl X (Twitter) for $NINE posts and memes.
              Once the official token address and community campaign goes live, workers will be ranked here by engagement and reach in real-time.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/30 px-3.5 py-1 text-xs text-emerald-400 font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>SCRAPER ENGINE ARMED & READY FOR $NINE COMMUNITY LAUNCH</span>
            </div>
          </div>
        ) : filteredAndSortedWorkers.length === 0 ? (
          <div className="rounded-xl border border-nine-border bg-black/40 p-12 text-center text-zinc-400">
            <Filter className="h-8 w-8 mx-auto mb-3 text-zinc-600" />
            <div className="text-sm font-bold text-white">No bag workers match your filter</div>
            <div className="text-xs text-zinc-500 mt-1">Try changing the category tab or clearing your search term.</div>
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSearchQuery('');
              }}
              className="mt-4 rounded-lg bg-nine-gold px-4 py-1.5 text-xs font-bold text-black hover:bg-amber-400 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 font-mono">
            {filteredAndSortedWorkers.map((worker) => {
              const score = worker.bagWorkerScore;
              const bd = worker.scoreBreakdown;

              return (
                <div
                  key={`${worker.twitterHandle}-${worker.rank}`}
                  className="rounded-2xl border border-nine-border/80 bg-gradient-to-b from-[#12131c]/95 via-[#0d0e14]/98 to-[#08080c] p-5 flex flex-col justify-between hover:border-nine-gold/60 transition-all hover:shadow-[0_0_25px_rgba(255,215,0,0.12)] group relative overflow-hidden"
                >
                  {/* Top Rank accent glow */}
                  {worker.rank === 1 && (
                    <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-nine-gold via-amber-300 to-nine-gold" />
                  )}
                  {worker.rank === 2 && (
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-zinc-300 via-sky-300 to-zinc-400" />
                  )}
                  {worker.rank === 3 && (
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700" />
                  )}

                  <div>
                    {/* Header: Rank + Handle + Score */}
                    <div className="flex items-center justify-between border-b border-nine-border/70 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-7 w-7 rounded-lg font-black text-xs flex items-center justify-center border ${
                            worker.rank === 1
                              ? 'bg-amber-950/90 border-amber-400 text-nine-gold shadow-[0_0_12px_rgba(255,215,0,0.4)]'
                              : worker.rank === 2
                              ? 'bg-zinc-800 border-zinc-400 text-zinc-100 shadow-[0_0_8px_rgba(255,255,255,0.2)]'
                              : worker.rank === 3
                              ? 'bg-amber-950/60 border-amber-600 text-amber-300'
                              : 'bg-black/70 border-zinc-800 text-zinc-400'
                          }`}
                        >
                          #{worker.rank}
                        </span>
                        <div>
                          <a
                            href={`https://x.com/${worker.twitterHandle}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-black text-white hover:text-nine-gold transition-colors flex items-center gap-1"
                          >
                            <span>@{worker.twitterHandle}</span>
                          </a>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">WORKER SCORE</div>
                        <div className="text-base font-black text-nine-gold drop-shadow-[0_0_10px_rgba(255,215,0,0.35)]">
                          {worker.bagWorkerScore.toFixed(1)} <span className="text-[10px] text-zinc-500 font-normal">/ 100</span>
                        </div>
                      </div>
                    </div>

                    {/* Profile Banner */}
                    <div className="flex items-start gap-3 mb-4">
                      <img
                        src={worker.avatarUrl}
                        alt={worker.displayName}
                        className="h-12 w-12 rounded-xl border border-nine-border object-cover shrink-0 shadow-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/mascot/mascot_head_favicon.webp';
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-black text-white truncate flex items-center gap-1.5">
                          <span>{worker.displayName}</span>
                        </div>
                        {worker.customTitle && (
                          <div className="text-[11px] text-amber-300/95 mt-0.5 font-bold line-clamp-1">
                            {worker.customTitle}
                          </div>
                        )}

                        {/* Achievement Tags */}
                        {worker.achievements && worker.achievements.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {worker.achievements.slice(0, 3).map((ach, i) => (
                              <span
                                key={i}
                                className="text-[9px] px-1.5 py-0.5 rounded bg-black/60 text-zinc-300 border border-zinc-700/60 font-semibold"
                              >
                                {ach}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metrics Matrix */}
                    <div className="grid grid-cols-3 gap-2 rounded-xl border border-nine-border/70 bg-black/50 p-2.5 text-center text-xs mb-3 shadow-inner">
                      <div>
                        <div className="text-[9px] text-zinc-500 uppercase font-bold">POSTS</div>
                        <div className="text-white font-black mt-0.5">{worker.postsCount}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-zinc-500 uppercase font-bold">ACTIVE DAYS</div>
                        <div className="text-white font-black mt-0.5">{worker.activeDays}d</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-zinc-500 uppercase font-bold">PEAK REACH</div>
                        <div className="text-emerald-400 font-black mt-0.5">
                          {formatViews(worker.topPostImpressions)}
                        </div>
                      </div>
                    </div>

                    {/* Score Formula Breakdown Pill */}
                    {bd && (
                      <div className="rounded-lg border border-nine-border/50 bg-black/30 px-2.5 py-1.5 text-[10px] text-zinc-400 flex items-center justify-between mb-3 font-mono">
                        <span>Score Weights:</span>
                        <div className="flex items-center gap-2 text-zinc-300">
                          <span title="Posts volume pts">Vol: <strong className="text-white">+{bd.postsPoints}</strong></span>
                          <span title="Active streak pts">Days: <strong className="text-white">+{bd.streakPoints}</strong></span>
                          <span title="Reach / views pts">Reach: <strong className="text-emerald-400">+{bd.reachPoints}</strong></span>
                        </div>
                      </div>
                    )}

                    {/* Latest Quoted Tweet Terminal Box */}
                    <a
                      href={worker.latestTweetUrl || `https://x.com/${worker.twitterHandle}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-xl border border-nine-border/70 bg-black/40 hover:bg-black/70 hover:border-nine-gold/50 p-3 mb-4 transition-all group/quote relative overflow-hidden"
                      title="Click to view this verified tweet on X"
                    >
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 font-bold mb-1.5">
                        <span className="flex items-center gap-1 text-nine-gold">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>VERIFIED ON-CHAIN $NINE TWEET</span>
                        </span>
                        <span className="text-[9px] text-zinc-500">
                          {worker.topPostImpressions > 0 && `${formatViews(worker.topPostImpressions)} views`}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-300 italic leading-relaxed line-clamp-3">
                        {worker.latestPostQuote}
                      </div>
                      <div className="text-[10px] text-amber-300 font-bold not-italic mt-2 flex items-center gap-1 group-hover/quote:text-nine-gold transition-colors">
                        <span>OPEN ON 𝕏</span>
                        <ExternalLink className="h-2.5 w-2.5 group-hover/quote:translate-x-0.5 transition-transform" />
                      </div>
                    </a>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-nine-border/70 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <a
                        href={worker.latestTweetUrl || `https://x.com/${worker.twitterHandle}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-amber-300 bg-amber-950/60 border border-amber-500/40 px-2.5 py-1 rounded-md hover:bg-amber-900/80 hover:text-white flex items-center gap-1 transition-colors font-bold"
                        title="Open exact live tweet on X"
                      >
                        <span>VIEW TWEET</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>

                      <a
                        href={`https://x.com/${worker.twitterHandle}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 transition-colors font-bold px-2 py-1"
                        title="View X profile"
                      >
                        <span>@PROFILE</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Formula Explainer Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-mono">
          <div className="relative w-full max-w-lg rounded-2xl border border-nine-border bg-[#0f1016] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-nine-border pb-3 mb-4">
              <div className="flex items-center gap-2 text-xs text-nine-gold font-bold uppercase">
                <HelpCircle className="h-4 w-4" />
                <span>BAG WORKER SCORING MATHEMATICS</span>
              </div>
              <button
                onClick={() => setShowFormulaModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-zinc-300 leading-relaxed">
              <p className="text-zinc-400">
                The Bag Worker Score mathematically ranks verified social effort on Robinhood Chain, balancing volume, viral viewership, and continuous consistency:
              </p>

              <div className="space-y-2.5">
                <div className="rounded-lg border border-nine-border bg-black/50 p-3">
                  <div className="text-white font-bold flex items-center justify-between">
                    <span>1. POST VOLUME WEIGHT</span>
                    <span className="text-nine-gold">Max 30 Pts</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    <code>Score = MIN(30, postsCount × 1.5 + 5.0)</code>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Rewards consistent ticker broadcast frequency and DEX transaction telemetry calls.
                  </p>
                </div>

                <div className="rounded-lg border border-nine-border bg-black/50 p-3">
                  <div className="text-white font-bold flex items-center justify-between">
                    <span>2. ACTIVE POSTING STREAK</span>
                    <span className="text-sky-400">Max 25 Pts</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    <code>Score = MIN(25, activeDays × 5.0)</code>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Prevents one-off bot spam by heavily weighting multi-day holding conviction.
                  </p>
                </div>

                <div className="rounded-lg border border-nine-border bg-black/50 p-3">
                  <div className="text-white font-bold flex items-center justify-between">
                    <span>3. VIRAL TIMELINE REACH</span>
                    <span className="text-emerald-400">Max 35 Pts</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    <code>Score = MIN(35, LOG10(PeakViews) × 7.5)</code>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Logarithmic scaling that credits massive viral calls (e.g. 19K views = 32.1 pts) without breaking leaderboard balance.
                  </p>
                </div>

                <div className="rounded-lg border border-nine-border bg-black/50 p-3">
                  <div className="text-white font-bold flex items-center justify-between">
                    <span>4. CONSISTENCY FACTOR</span>
                    <span className="text-amber-400">Max 10 Pts</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    <code>Score = MIN(10, consistencyRating × 0.1)</code>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowFormulaModal(false)}
                className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-black hover:bg-nine-gold transition-colors"
              >
                GOT IT
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
