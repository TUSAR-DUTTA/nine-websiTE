'use client';

import React, { useState, useRef } from 'react';
import { useNine } from '@/context/NineContext';
import { soundManager } from '@/lib/sound';
import { PixelCompanionAnimator } from '@/components/arcade/PixelCompanionAnimator';
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Upload,
  Sparkles,
  Shield,
  Award,
  Calendar,
  Wallet,
  Camera,
  Edit3,
  Flame,
  Zap,
  Layers,
  Heart,
  Terminal,
  Activity,
  Radio,
  UserCheck,
  LogOut,
} from 'lucide-react';
import { ROBINHOOD_CONFIG, BURN_ADDRESS } from '@/lib/onchain';

const MASCOT_PFP_PRESETS = [
  { label: 'Legendary Mascot', src: '/assets/mascot/MAIN MASCOT.jpg' },
  { label: 'Pixel Head', src: '/assets/mascot/mascot_head_favicon.webp' },
  { label: 'Stool Sentinel', src: '/assets/mascot/mascot_stool.webp' },
  { label: 'Shocked Duo', src: '/assets/mascot/meme_shocked_duo.webp' },
  { label: 'Moonwatcher', src: '/assets/mascot/mascot_moonwatcher.webp' },
  { label: 'Genesis Closet', src: '/assets/mascot/mascot_closet.webp' },
];

type DossierTab = 'OVERVIEW' | 'LOADOUT' | 'CUSTOMIZE';

export function ProfileSlideOver() {
  const {
    activeProfileModal,
    closeProfileModal,
    userNineBalance,
    setUserNineBalance,
    disconnectWallet,
    setActiveTab: setGlobalActiveTab,
    onChainBurnedTotal,
    connectedProfile,
    updateProfileAvatar,
    updateCustomTitle,
  } = useNine();

  const [activeTab, setActiveTab] = useState<DossierTab>('OVERVIEW');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [tipSuccess, setTipSuccess] = useState(false);
  const [tipAmount, setTipAmount] = useState('1000');

  // Custom PFP state
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [pfpSuccessMsg, setPfpSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom Title edit state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');

  // Companion action preview
  const [companionAction, setCompanionAction] = useState<string>('idle');

  if (!activeProfileModal) return null;

  const profile = activeProfileModal;
  const isOwnProfile =
    Boolean(connectedProfile) &&
    (connectedProfile?.id === profile.id ||
      (Boolean(connectedProfile?.address) &&
        Boolean(profile?.address) &&
        connectedProfile?.address.toLowerCase() === profile.address.toLowerCase()));

  const copyAddress = () => {
    soundManager.playClick();
    navigator.clipboard.writeText(profile.address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleTip = () => {
    const amt = Number(tipAmount);
    if (isNaN(amt) || amt <= 0) return;
    if (amt > userNineBalance) {
      soundManager.playFumbleBuzz();
      alert(`Insufficient $NINE balance. You currently have ${userNineBalance.toLocaleString()} $NINE.`);
      return;
    }
    soundManager.playComebackChime();
    setUserNineBalance((prev) => Math.max(0, prev - amt));
    setTipSuccess(true);
    setTimeout(() => setTipSuccess(false), 3500);
  };

  const handleSelectPresetPfp = (src: string) => {
    soundManager.playComebackChime();
    updateProfileAvatar(src);
    setPfpSuccessMsg('Avatar updated to official mascot preset!');
    setTimeout(() => setPfpSuccessMsg(null), 2500);
  };

  const handleApplyUrlPfp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customImageUrl.trim()) return;
    soundManager.playComebackChime();
    updateProfileAvatar(customImageUrl.trim());
    setCustomImageUrl('');
    setPfpSuccessMsg('Custom URL avatar synchronized!');
    setTimeout(() => setPfpSuccessMsg(null), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      soundManager.playFumbleBuzz();
      alert('Image size must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        soundManager.playComebackChime();
        updateProfileAvatar(dataUrl);
        setPfpSuccessMsg('High-resolution avatar uploaded successfully!');
        setTimeout(() => setPfpSuccessMsg(null), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) return;
    updateCustomTitle(titleInput.trim());
    setIsEditingTitle(false);
  };

  // Determine skin class
  const skinClass =
    profile.equippedSkin === 'CRT_BURNT' ? 'skin-crt-burnt' :
    profile.equippedSkin === 'RED_ALERT' ? 'skin-red-alert' :
    profile.equippedSkin === 'AFTER_THE_CRASH' ? 'skin-after-crash' :
    profile.equippedSkin === 'CAT_IN_THE_DARK' ? 'skin-cat-in-dark' :
    profile.equippedSkin === 'GME_TERMINAL' ? 'skin-gme-terminal' :
    profile.equippedSkin === 'NINE_LIVES' ? 'skin-nine-lives' : '';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/85 backdrop-blur-md transition-opacity font-mono animate-fadeIn">
      {/* Click backdrop to close */}
      <div className="absolute inset-0" onClick={closeProfileModal} />

      {/* Futuristic Command Panel Container */}
      <div className="relative z-10 h-full w-full max-w-xl border-l border-emerald-500/30 bg-[#08090d] shadow-[-20px_0_50px_rgba(0,0,0,0.8)] flex flex-col justify-between overflow-hidden">
        
        {/* Background Cyber Ambient Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#152019_1px,transparent_1px)] [background-size:20px_20px] opacity-25 pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 blur-[100px] pointer-events-none rounded-full" />

        {/* TOP HEADER: Military / Cyber Clearance HUD */}
        <div className="relative z-10 border-b border-nine-border/80 bg-[#0b0c13]/90 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                CLEARANCE LEVEL 9 /// COMMAND OVERLAY
              </span>
            </div>

            <button
              onClick={closeProfileModal}
              className="p-1.5 rounded-lg border border-zinc-700 bg-zinc-900/60 text-zinc-400 hover:text-white hover:border-emerald-500/50 hover:bg-zinc-800 transition-all"
              title="Close Dossier"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 font-bold">DOSSIER ID:</span>
              <span className="text-zinc-200 font-mono">REC-99-{profile.address.slice(2, 8).toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Radio className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-300 font-bold">ROBINHOOD MAINNET (4663)</span>
            </div>
          </div>

          {/* Segmented Navigation Tabs */}
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-zinc-800/80 text-xs">
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('OVERVIEW');
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'OVERVIEW'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>01 // OVERVIEW</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('LOADOUT');
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'LOADOUT'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>02 // LOADOUT</span>
            </button>

            {isOwnProfile && (
              <button
                onClick={() => {
                  soundManager.playClick();
                  setActiveTab('CUSTOMIZE');
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'CUSTOMIZE'
                    ? 'bg-amber-500/20 text-nine-gold border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'
                }`}
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>03 // FORGE</span>
              </button>
            )}
          </div>
        </div>

        {/* SCROLLABLE DOSSIER BODY */}
        <div className="relative z-10 flex-1 overflow-y-auto px-6 py-5 space-y-5">
          
          {/* ===================== TAB 1: OVERVIEW ===================== */}
          {activeTab === 'OVERVIEW' && (
            <>
              {/* Tactical Identity Banner */}
              <div
                className={`relative rounded-2xl border p-5 transition-all overflow-hidden shadow-2xl ${
                  skinClass || 'border-emerald-500/30 bg-gradient-to-b from-[#0f1412] to-[#0a0d0c]'
                }`}
              >
                {/* Background Aura FX Glow */}
                {profile.equippedAura && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30 overflow-hidden mix-blend-screen">
                    <img
                      src={profile.equippedAura}
                      alt="Equipped Aura FX"
                      className="h-full w-full object-cover scale-150 animate-pulse"
                    />
                  </div>
                )}

                <div className="relative z-10 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Holographic Avatar Frame */}
                    <div className="relative group shrink-0">
                      <div className="h-20 w-20 rounded-2xl p-0.5 bg-gradient-to-tr from-emerald-500 via-amber-400 to-sky-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                        <img
                          src={profile.avatarUrl}
                          alt={profile.displayName}
                          className="h-full w-full rounded-[14px] object-cover bg-black"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center shadow-md">
                        <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      </div>

                      {isOwnProfile && (
                        <button
                          onClick={() => setActiveTab('CUSTOMIZE')}
                          className="absolute inset-0 bg-black/70 rounded-2xl flex flex-col items-center justify-center text-[9px] text-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity font-bold"
                          title="Open Identity Forge"
                        >
                          <Camera className="h-4 w-4 mb-0.5" />
                          <span>FORGE</span>
                        </button>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xl font-black text-white tracking-tight">
                          {profile.displayName}
                        </h3>
                        {profile.equippedSymbol && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-950/80 text-nine-gold border border-amber-500/40 font-bold shadow-sm">
                            ★ {profile.equippedSymbol}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-nine-gold">
                          {profile.customTitle}
                        </span>
                        {isOwnProfile && (
                          <button
                            onClick={() => {
                              setTitleInput(profile.customTitle);
                              setIsEditingTitle(!isEditingTitle);
                            }}
                            className="text-zinc-500 hover:text-zinc-300 p-0.5"
                            title="Edit Custom Title"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono mt-1">
                        <Wallet className="h-3 w-3 text-emerald-400 shrink-0" />
                        <span>{profile.shortAddress}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[9px] text-zinc-500 uppercase block font-bold">STATUS</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 mt-0.5">
                      <UserCheck className="h-3 w-3" />
                      <span>ONLINE</span>
                    </span>
                  </div>
                </div>

                {/* Inline Title Quick Edit Form */}
                {isOwnProfile && isEditingTitle && (
                  <form onSubmit={handleSaveTitle} className="relative z-10 mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
                    <input
                      type="text"
                      value={titleInput}
                      onChange={(e) => setTitleInput(e.target.value)}
                      placeholder="Enter custom title..."
                      maxLength={40}
                      className="flex-1 rounded-lg border border-nine-border bg-black/80 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-black hover:bg-emerald-400 transition-colors"
                    >
                      SAVE
                    </button>
                  </form>
                )}

                {/* Bio Block */}
                {profile.bio && (
                  <div className="relative z-10 mt-4 text-xs text-zinc-300 leading-relaxed border-t border-white/10 pt-3">
                    <span className="text-emerald-500 font-bold mr-1">&gt;</span>
                    <span className="italic">{profile.bio}</span>
                  </div>
                )}

                {/* Tactical Wallet Address Strip */}
                <div className="relative z-10 mt-4 flex items-center justify-between rounded-xl bg-black/60 border border-white/10 p-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                      <Wallet className="h-3.5 w-3.5 text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 uppercase block">CONNECTED WALLET</span>
                      <span className="text-zinc-200 font-mono text-xs select-all">{profile.address}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyAddress}
                      className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 px-2.5 py-1.5 text-[11px] text-zinc-300 hover:text-white hover:border-zinc-500 transition-all font-bold"
                      title="Copy Address"
                    >
                      {copiedAddress ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-400">COPIED</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>COPY</span>
                        </>
                      )}
                    </button>

                    <a
                      href={`https://robinhoodchain.blockscout.com/address/${profile.address}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800/80 p-1.5 text-zinc-300 hover:text-white hover:border-zinc-500 transition-all"
                      title="View on Robinhood Blockscout Explorer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Conviction & Holdings Telemetry Grid */}
              <div>
                <div className="flex items-center justify-between text-xs text-zinc-400 uppercase font-bold tracking-wider mb-2.5">
                  <span className="flex items-center gap-1.5 text-zinc-300">
                    <Activity className="h-3.5 w-3.5 text-emerald-400" />
                    <span>ON-CHAIN HOLDINGS & CONVICTION METRICS</span>
                  </span>
                  <span className="text-[10px] text-zinc-500">LIVE SYNC</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-nine-border bg-[#0d0e14] p-3.5 shadow-sm">
                    <div className="text-[10px] text-zinc-500 uppercase font-bold">$NINE HOLDINGS</div>
                    <div className="text-lg font-black text-white mt-0.5 flex items-baseline gap-1">
                      <span>{profile.nineHoldings.toLocaleString()}</span>
                      <span className="text-xs text-emerald-400 font-normal">$NINE</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-1">
                      ≈ ${profile.netPositionUSD.toLocaleString()} USD
                    </div>
                  </div>

                  <div className="rounded-xl border border-nine-border bg-[#0d0e14] p-3.5 shadow-sm">
                    <div className="text-[10px] text-zinc-500 uppercase font-bold">HOLDING DURATION</div>
                    <div className="text-lg font-black text-emerald-400 mt-0.5">
                      {profile.holdingSince}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-1">
                      Since {profile.holdingSinceDate}
                    </div>
                  </div>

                  <div className="rounded-xl border border-nine-border bg-[#0d0e14] p-3.5 shadow-sm">
                    <div className="text-[10px] text-zinc-500 uppercase font-bold">LARGEST BAG HELD</div>
                    <div className="text-base font-black text-white mt-0.5">
                      {profile.largestBag.toLocaleString()} <span className="text-xs text-zinc-500 font-normal">NINE</span>
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">PEAK ALLOCATION</div>
                  </div>

                  <div className="rounded-xl border border-nine-border bg-[#0d0e14] p-3.5 shadow-sm">
                    <div className="text-[10px] text-zinc-500 uppercase font-bold">EXECUTION VOLUME</div>
                    <div className="text-base font-black text-nine-gold mt-0.5">
                      {profile.totalBuysCount} Buys / {profile.totalSellsCount} Sells
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">DIAMOND HAND RATIO</div>
                  </div>
                </div>
              </div>

              {/* Bag Work Activity (Only for external Twitter bag workers) vs On-Chain Arsenal Stats */}
              {!isOwnProfile && profile.twitterHandle && (profile.postsCount ?? 0) > 0 ? (
                <div className="rounded-xl border border-nine-border bg-[#0d0e14] p-4 shadow-sm">
                  <div className="flex items-center justify-between text-xs mb-2.5">
                    <span className="text-zinc-300 uppercase font-bold flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 text-nine-gold" />
                      <span>BAG WORK ACTIVITY INDEX</span>
                    </span>
                    <span className="text-emerald-400 font-black text-sm">{profile.socialActivityLevel} / 100</span>
                  </div>

                  <div className="h-2 w-full rounded-full bg-black border border-zinc-800 overflow-hidden mb-3">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                      style={{ width: `${profile.socialActivityLevel}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-zinc-800/80">
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase font-bold">POSTS</div>
                      <div className="text-white font-black text-sm mt-0.5">{profile.postsCount}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase font-bold">ACTIVE DAYS</div>
                      <div className="text-white font-black text-sm mt-0.5">{profile.activeDaysCount}d</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase font-bold">TOP IMPRESSIONS</div>
                      <div className="text-emerald-400 font-black text-sm mt-0.5">
                        {(profile.topPostImpressions / 1000).toFixed(0)}K
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-500/30 bg-[#0c120f] p-4 shadow-sm">
                  <div className="flex items-center justify-between text-xs mb-2.5">
                    <span className="text-zinc-200 uppercase font-bold flex items-center gap-1.5">
                      <Flame className="h-3.5 w-3.5 text-amber-400" />
                      <span>ON-CHAIN COMBAT & ARSENAL DEPLOYMENT</span>
                    </span>
                    <span className="text-emerald-400 font-black text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40">
                      CHAIN ID 4663
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-zinc-800/80">
                    <div className="rounded-lg bg-black/50 p-2.5 border border-zinc-800">
                      <div className="text-[9px] text-zinc-500 uppercase font-bold">NETWORK BURNED</div>
                      <div className="text-amber-400 font-black text-sm mt-0.5">
                        {onChainBurnedTotal.toLocaleString()} <span className="text-[9px] text-zinc-500">NINE</span>
                      </div>
                      <div className="text-[9px] text-zinc-500 mt-0.5">DEAD VAULT</div>
                    </div>

                    <div className="rounded-lg bg-black/50 p-2.5 border border-zinc-800">
                      <div className="text-[9px] text-zinc-500 uppercase font-bold">EQUIPPED LOADOUT</div>
                      <div className="text-white font-black text-sm mt-0.5 truncate">
                        {profile.equippedPetName ? profile.equippedPetName.split(' ')[0] : 'DEFAULT'}
                      </div>
                      <div className="text-[9px] text-emerald-400 mt-0.5">ACTIVE COMPANION</div>
                    </div>

                    <div className="rounded-lg bg-black/50 p-2.5 border border-zinc-800">
                      <div className="text-[9px] text-zinc-500 uppercase font-bold">CONVICTION STATUS</div>
                      <div className="text-emerald-400 font-black text-sm mt-0.5">
                        DIAMOND
                      </div>
                      <div className="text-[9px] text-zinc-500 mt-0.5">9 LIVES PROTOCOL</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Achievements Badges */}
              <div>
                <div className="text-xs text-zinc-400 uppercase font-bold tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-emerald-400" />
                  <span>COMMUNITY RECOGNITION ACHIEVEMENTS</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.achievements.map((ach) => (
                    <span
                      key={ach}
                      className="rounded-lg border border-emerald-500/40 bg-emerald-950/30 px-3 py-1 text-xs font-bold text-emerald-300 flex items-center gap-1.5 shadow-sm"
                    >
                      <Sparkles className="h-3 w-3 text-emerald-400" />
                      <span>{ach}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Wallet Command Hub (for Own Profile) vs Tip Transmitter (for Other Profiles) */}
              {isOwnProfile ? (
                <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 to-black/70 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-200 font-bold uppercase flex items-center gap-1.5">
                      <Zap className="h-4 w-4 text-emerald-400" />
                      <span>WALLET COMMAND HUB</span>
                    </span>
                    <span className="text-zinc-400 text-[10px]">
                      BALANCE: <strong className="text-emerald-400">{userNineBalance.toLocaleString()} $NINE</strong>
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    This is your authenticated command dossier on Robinhood Chain Mainnet (4663). Burn $NINE in the Armory to unlock exclusive CRT terminal skins and pixel companions, or manage wallet connectivity.
                  </p>

                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      onClick={() => {
                        soundManager.playClick();
                        closeProfileModal();
                        setGlobalActiveTab('ARCADE');
                      }}
                      className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-amber-500/50 bg-amber-950/30 hover:bg-amber-900/50 text-nine-gold font-bold text-xs transition-all shadow-sm"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      <span>ENTER ARMORY / ARCADE</span>
                    </button>

                    <button
                      onClick={() => {
                        soundManager.playClick();
                        closeProfileModal();
                        disconnectWallet();
                      }}
                      className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-red-500/40 bg-red-950/30 hover:bg-red-900/50 text-red-300 font-bold text-xs transition-all shadow-sm"
                    >
                      <LogOut className="h-3.5 w-3.5 text-red-400" />
                      <span>DISCONNECT WALLET</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                    <button
                      onClick={copyAddress}
                      className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors"
                    >
                      {copiedAddress ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedAddress ? 'ADDRESS COPIED' : 'COPY FULL ADDRESS'}</span>
                    </button>

                    <button
                      onClick={() => {
                        soundManager.playClick();
                        closeProfileModal();
                        disconnectWallet();
                      }}
                      className="text-red-400 hover:text-red-300 text-xs font-bold transition-colors"
                    >
                      DISCONNECT WALLET
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-amber-500/30 bg-gradient-to-b from-amber-950/20 to-black/60 p-4">
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="text-zinc-200 font-bold uppercase flex items-center gap-1.5">
                      <Flame className="h-4 w-4 text-amber-400" />
                      <span>TRANSMIT $NINE COMEBACK TIP</span>
                    </span>
                    <span className="text-zinc-500 text-[10px]">
                      YOUR BALANCE: <strong className="text-emerald-400">{userNineBalance.toLocaleString()} $NINE</strong>
                    </span>
                  </div>

                  {tipSuccess ? (
                    <div className="rounded-xl bg-emerald-950/60 p-3 text-xs text-emerald-300 font-bold flex items-center gap-2 border border-emerald-500/50">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Transmitted {Number(tipAmount).toLocaleString()} $NINE to {profile.displayName}!</span>
                    </div>
                  ) : (
                    <div>
                      {/* Quick Amount Chips */}
                      <div className="flex items-center gap-2 mb-3">
                        {['500', '1000', '5000', '25000'].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setTipAmount(amt)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all ${
                              tipAmount === amt
                                ? 'bg-amber-500/30 border-amber-500 text-nine-gold'
                                : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'
                            }`}
                          >
                            +{Number(amt).toLocaleString()}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={tipAmount}
                          onChange={(e) => setTipAmount(e.target.value)}
                          className="w-32 rounded-lg border border-nine-border bg-black/80 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                        />
                        <button
                          onClick={handleTip}
                          className="flex-1 rounded-lg bg-gradient-to-r from-amber-500 to-nine-gold px-4 py-2 text-xs font-bold text-black hover:shadow-[0_0_15px_rgba(255,215,0,0.4)] transition-all flex items-center justify-center gap-1.5"
                        >
                          <Flame className="h-3.5 w-3.5" />
                          <span>SEND TIP TO {profile.displayName.toUpperCase()}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ===================== TAB 2: LOADOUT & ARSENAL ===================== */}
          {activeTab === 'LOADOUT' && (
            <div className="space-y-5">
              {/* Equipped Companion Showcase */}
              <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-[#0e1612] to-[#080a09] p-5 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase">
                      EQUIPPED COMPANION /// {profile.equippedCompanionType || 'CAT'}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-bold">
                    ACTIVE LOADOUT
                  </span>
                </div>

                {profile.equippedPet ? (
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Interactive Animated Stage */}
                    <div className="relative h-36 w-36 rounded-2xl bg-black/80 border border-emerald-500/30 flex flex-col items-center justify-center overflow-hidden shrink-0 shadow-inner">
                      {/* Pedestal Glow */}
                      <div className="absolute bottom-4 w-20 h-4 bg-emerald-400/20 blur-sm rounded-full" />
                      
                      {profile.equippedCompanionType === 'fairy' ? (
                        <PixelCompanionAnimator
                          type="fairy"
                          fairyId={profile.equippedFairyId || 1}
                          size={90}
                          interactive={true}
                        />
                      ) : profile.equippedCompanionType === 'monster' ? (
                        <PixelCompanionAnimator
                          type="monster"
                          monsterId={profile.equippedMonsterId || 'doux'}
                          action={companionAction}
                          size={100}
                          interactive={true}
                        />
                      ) : (
                        <PixelCompanionAnimator
                          type="cat"
                          catId={profile.equippedPetCatId || 1}
                          action={companionAction}
                          size={105}
                          interactive={true}
                        />
                      )}
                    </div>

                    {/* Details & Actions */}
                    <div className="flex-1 text-center sm:text-left space-y-3">
                      <div>
                        <div className="text-base font-black text-white">
                          {profile.equippedPetName || 'Calico Guardian'}
                        </div>
                        <div className="text-xs text-zinc-400 mt-0.5">
                          Synced on Robinhood Chain Armory
                        </div>
                      </div>

                      {/* Action Triggers */}
                      <div className="space-y-1.5">
                        <div className="text-[10px] text-zinc-500 uppercase font-bold">
                          COMPANION DIAGNOSTIC ANIMATIONS:
                        </div>
                        <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                          {(['idle', 'walk', 'run', 'stretch'] as const).map((act) => (
                            <button
                              key={act}
                              onClick={() => {
                                soundManager.playClick();
                                setCompanionAction(act);
                              }}
                              className={`px-2.5 py-1 text-[10px] rounded-md uppercase font-bold transition-all ${
                                companionAction === act
                                  ? 'bg-emerald-500 text-black shadow-sm'
                                  : 'bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white'
                              }`}
                            >
                              {act}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-zinc-500">
                    No companion currently equipped. Visit the Arcade to unlock one!
                  </div>
                )}
              </div>

              {/* Equipped Aura FX */}
              <div className="rounded-xl border border-nine-border bg-[#0d0e14] p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-purple-950/50 border border-purple-500/40 flex items-center justify-center overflow-hidden">
                    {profile.equippedAura ? (
                      <img
                        src={profile.equippedAura}
                        alt="Aura"
                        className="h-10 w-10 object-contain filter drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]"
                      />
                    ) : (
                      <Sparkles className="h-5 w-5 text-purple-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase font-bold">ANIMATED AURA FX</div>
                    <div className="text-xs font-bold text-white">
                      {profile.equippedAura ? 'Active Particle Glow' : 'None Equipped'}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-purple-300 border border-purple-500/30 font-bold">
                  PARTICLE LAYER
                </span>
              </div>

              {/* Equipped Skin */}
              <div className="rounded-xl border border-nine-border bg-[#0d0e14] p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                    <Terminal className="h-5 w-5 text-nine-gold" />
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase font-bold">CRT TERMINAL SKIN</div>
                    <div className="text-xs font-bold text-white">
                      {profile.equippedSkin || 'DEFAULT'}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-nine-gold border border-amber-500/30 font-bold">
                  COLOR MATRIX
                </span>
              </div>
            </div>
          )}

          {/* ===================== TAB 3: CUSTOMIZE / IDENTITY FORGE ===================== */}
          {activeTab === 'CUSTOMIZE' && isOwnProfile && (
            <div className="space-y-5">
              <div className="rounded-xl border border-emerald-500/40 bg-gradient-to-b from-[#0c1410] to-[#080a09] p-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase">
                    <Camera className="h-4 w-4" />
                    <span>WALLET PFP FORGE & AVATAR MATRIX</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">CLIENT SYNCED</span>
                </div>

                {pfpSuccessMsg && (
                  <div className="mb-3 rounded-lg bg-emerald-950/60 p-2.5 text-xs text-emerald-300 font-bold flex items-center gap-2 border border-emerald-500/50">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>{pfpSuccessMsg}</span>
                  </div>
                )}

                {/* Upload Local File */}
                <div className="mb-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-500/60 bg-emerald-950/20 hover:bg-emerald-950/40 hover:border-emerald-400 p-3 text-xs text-emerald-300 font-bold transition-all shadow-sm"
                  >
                    <Upload className="h-4 w-4" />
                    <span>UPLOAD CUSTOM IMAGE FILE (PNG, JPG, WEBP)</span>
                  </button>
                </div>

                {/* URL Input */}
                <form onSubmit={handleApplyUrlPfp} className="flex items-center gap-2 mb-4">
                  <input
                    type="url"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder="Or paste direct image URL..."
                    className="flex-1 rounded-lg border border-nine-border bg-black/80 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-zinc-800 border border-zinc-600 px-4 py-2 text-xs text-white hover:border-emerald-400 hover:text-emerald-300 transition-all font-bold"
                  >
                    APPLY
                  </button>
                </form>

                {/* Meme Mascot Presets */}
                <div>
                  <div className="text-[10px] text-zinc-400 uppercase font-bold mb-2">
                    OFFICIAL MEME MASCOT AVATAR ARCHIVE:
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {MASCOT_PFP_PRESETS.map((preset) => (
                      <button
                        key={preset.src}
                        onClick={() => handleSelectPresetPfp(preset.src)}
                        className={`relative rounded-xl overflow-hidden border p-0.5 transition-all group ${
                          profile.avatarUrl === preset.src
                            ? 'border-emerald-400 ring-2 ring-emerald-500/50 scale-105'
                            : 'border-zinc-800 hover:border-zinc-500'
                        }`}
                        title={preset.label}
                      >
                        <img
                          src={preset.src}
                          alt={preset.label}
                          className="h-12 w-full object-cover rounded-lg"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM FOOTER: Direct Robinhood Chain Link & Close Button */}
        <div className="relative z-10 border-t border-nine-border/80 bg-[#0b0c13]/90 px-6 py-4 backdrop-blur-md flex items-center justify-between gap-3 text-xs">
          <a
            href={`https://robinhoodchain.blockscout.com/address/${profile.address}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-zinc-400 hover:text-emerald-400 transition-colors font-bold"
          >
            <span>ROBINHOOD BLOCKSCOUT</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <button
            onClick={closeProfileModal}
            className="rounded-lg bg-zinc-800 px-5 py-2 text-xs font-bold text-white hover:bg-zinc-700 transition-all border border-zinc-700 shadow-sm"
          >
            CLOSE DOSSIER
          </button>
        </div>
      </div>
    </div>
  );
}
