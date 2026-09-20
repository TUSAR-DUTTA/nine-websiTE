'use client';

import React, { useState } from 'react';
import { useNine } from '@/context/NineContext';
import { ArcadeItem, ArcadeCategory } from '@/types';
import { soundManager } from '@/lib/sound';
import { PixelCompanionAnimator } from './PixelCompanionAnimator';
import confetti from 'canvas-confetti';
import { BURN_ADDRESS, ROBINHOOD_CONFIG } from '@/lib/onchain';
import {
  Sparkles,
  Check,
  CheckCircle2,
  Eye,
  Zap,
  Heart,
  Palette,
  Layers,
  Flame,
  Shield,
  ExternalLink,
  Radio,
  RefreshCw,
  X,
  AlertTriangle,
  Terminal,
  Activity,
  Cpu,
} from 'lucide-react';

const CAT_DESCRIPTIONS: Record<number, { name: string; specialty: string; trait: string }> = {
  1: { name: 'Calico Guardian', specialty: 'Balanced & loyal companion', trait: 'Protects key accumulation zones' },
  2: { name: 'Void Stalker', specialty: 'Dark pool liquidator', trait: 'Stalks support floor wicks in the dark' },
  3: { name: 'Ginger Rebounder', specialty: 'Single braincell dip bouncer', trait: 'Relentless momentum buyer' },
  4: { name: 'Siamese Sniper', specialty: 'Precision wick sniper', trait: 'Identifies institutional short traps' },
  5: { name: 'Spectral Guardian', specialty: 'Liquidated short haunter', trait: 'Phantom resilience against sell pressure' },
  6: { name: 'Diamond Titan', specialty: 'Immortal diamond paws', trait: 'Permanent conviction regardless of volatility' },
};

const MONSTER_DESCRIPTIONS: Record<string, { specialty: string; trait: string }> = {
  doux: { specialty: 'High-frequency dip kicker', trait: 'Swift counter-attacks on panic sellers' },
  mort: { specialty: 'Bears devourer', trait: 'Absorbs liquidation volume at support' },
  tard: { specialty: 'Unstoppable bull titan', trait: 'Heavy defensive wall against shorts' },
  vita: { specialty: 'Short liquidation freezer', trait: 'Locks in reversal breakouts' },
  loki: { specialty: 'Dark liquidity stalker', trait: 'OTC order book navigator' },
  kira: { specialty: 'Counter-trend striker', trait: 'Exploits high-volatility spikes' },
};

export function NineArcadeSection() {
  const {
    arcadeCatalog,
    buyArcadeItem,
    buyArcadeItemOnChain,
    onChainBurnedTotal,
    equipArcadeItem,
    unequipCategory,
    ownedItemIds,
    ownedSkins,
    connectedProfile,
    userNineBalance,
    openProfileModal,
    isConnected,
    setWalletModalOpen,
  } = useNine();

  const [selectedCategory, setSelectedCategory] = useState<'ALL' | ArcadeCategory>('ALL');
  const [activePreviewItem, setActivePreviewItem] = useState<ArcadeItem>(arcadeCatalog[0] || {} as ArcadeItem);
  const [purchaseNotification, setPurchaseNotification] = useState<string | null>(null);

  // On-Chain Burn Purchase State
  const [burnModalItem, setBurnModalItem] = useState<ArcadeItem | null>(null);
  const [isBurning, setIsBurning] = useState(false);
  const [burnResult, setBurnResult] = useState<{ success: boolean; txHash?: string; error?: string } | null>(null);

  // Card companion actions
  const [cardCompanionActions, setCardCompanionActions] = useState<Record<string, string>>({});
  // Preview chamber companion action
  const [chamberAction, setChamberAction] = useState<string>('idle');

  // Filter items
  const filteredItems = selectedCategory === 'ALL'
    ? arcadeCatalog
    : arcadeCatalog.filter((item) => item.category === selectedCategory);

  const categoryCounts = {
    ALL: arcadeCatalog.length,
    PET_CAT: arcadeCatalog.filter((i) => i.category === 'PET_CAT').length,
    MONSTER: arcadeCatalog.filter((i) => i.category === 'MONSTER').length,
    AURA_FX: arcadeCatalog.filter((i) => i.category === 'AURA_FX').length,
    SKIN: arcadeCatalog.filter((i) => i.category === 'SKIN').length,
  };

  // Determine currently equipped item
  const isItemEquipped = (item: ArcadeItem): boolean => {
    if (!connectedProfile) return false;
    if (item.category === 'SKIN') {
      return connectedProfile.equippedSkin === item.effectType;
    }
    if (item.category === 'AURA_FX') {
      return connectedProfile.equippedAura === item.imageSrc;
    }
    if (item.category === 'PET_CAT') {
      return (
        connectedProfile.equippedCompanionType === 'cat' &&
        (connectedProfile.equippedPetCatId === item.petCatId || connectedProfile.equippedPetName === item.name)
      );
    }
    if (item.category === 'MONSTER') {
      if (item.companionType === 'fairy') {
        return (
          connectedProfile.equippedCompanionType === 'fairy' &&
          connectedProfile.equippedFairyId === item.fairyId
        );
      }
      return (
        connectedProfile.equippedCompanionType === 'monster' &&
        connectedProfile.equippedMonsterId === item.monsterId
      );
    }
    return false;
  };

  // Check if item is owned (1-item-per-wallet rule: already owned items cannot be purchased again)
  const isItemOwned = (item: ArcadeItem): boolean => {
    return (
      ownedItemIds.includes(item.id) ||
      (item.category === 'SKIN' && (item.effectType === 'DEFAULT' || ownedSkins.includes(item.effectType || ''))) ||
      (item.category === 'PET_CAT' && (connectedProfile?.equippedPetCatId === item.petCatId || connectedProfile?.equippedPetName === item.name)) ||
      (item.category === 'MONSTER' && item.companionType === 'monster' && connectedProfile?.equippedMonsterId === item.monsterId) ||
      (item.category === 'MONSTER' && item.companionType === 'fairy' && connectedProfile?.equippedFairyId === item.fairyId) ||
      (item.category === 'AURA_FX' && connectedProfile?.equippedAura === item.imageSrc) ||
      item.priceInNine === 0
    );
  };

  const handleSelectPreview = (item: ArcadeItem) => {
    soundManager.playClick();
    setActivePreviewItem(item);
    setChamberAction('idle');
  };

  const handlePurchase = (item: ArcadeItem) => {
    if (!isConnected) {
      setWalletModalOpen(true);
      return;
    }

    // 1-item-per-wallet rule: Prevent duplicate purchase
    if (isItemOwned(item)) {
      soundManager.playFumbleBuzz();
      setPurchaseNotification(`"${item.name}" is already owned! You cannot purchase the same item twice.`);
      setTimeout(() => setPurchaseNotification(null), 4000);
      return;
    }

    soundManager.playClick();
    setBurnModalItem(item);
    setBurnResult(null);
  };

  const handleConfirmOnChainBurn = async () => {
    if (!burnModalItem) return;

    // 1-item-per-wallet rule: Prevent duplicate purchase
    if (isItemOwned(burnModalItem)) {
      soundManager.playFumbleBuzz();
      setBurnResult({
        success: false,
        error: `Item "${burnModalItem.name}" is already owned by this wallet. Duplicate purchases are prohibited.`,
      });
      return;
    }

    setIsBurning(true);
    setBurnResult(null);

    const res = await buyArcadeItemOnChain(burnModalItem);
    setIsBurning(false);
    setBurnResult(res);

    if (res.success) {
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#00FF66', '#FFD700', '#FF4500'],
        });
      } catch (e) {}
      setPurchaseNotification(`100% Burn Executed! Destroyed ${burnModalItem.priceInNine.toLocaleString()} $NINE to 0x...dEaD. Unlocked "${burnModalItem.name}"`);
      setTimeout(() => setPurchaseNotification(null), 5000);
    }
  };

  const handleEquip = (item: ArcadeItem) => {
    equipArcadeItem(item);
    setPurchaseNotification(`Equipped "${item.name}" to identity loadout!`);
    setTimeout(() => setPurchaseNotification(null), 3000);
  };

  const handleCardCompanionAction = (itemId: string, item: ArcadeItem, action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playClick();
    setCardCompanionActions((prev) => ({ ...prev, [itemId]: action }));
  };

  return (
    <section id="arcade" className="relative w-full border-b border-nine-border bg-[#06070a] py-14 overflow-hidden">
      {/* Background Cyber Ambient Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#16221c_1px,transparent_1px)] [background-size:24px_24px] opacity-35 pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-purple-600/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        
        {/* TOP SECTION HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 border-b border-nine-border/80 pb-6 mb-6 font-mono">
          <div>
            <div className="inline-flex items-center gap-2 text-xs text-amber-400 uppercase tracking-widest mb-1.5 font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span>ROBINHOOD CHAIN MAINNET ON-CHAIN ARMORY /// 100% BURN ENGINE</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3 flex-wrap">
              <span>NINE ARCADE PROTOCOL</span>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-950 to-red-950 text-amber-300 border border-amber-500/50 flex items-center gap-1.5 font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <Flame className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                <span>ALL TOKENS BURNED TO 0x...dEaD</span>
              </span>
            </h2>
            
            <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Equip your on-chain identity across Robinhood Chain.
              Every single token paid for pixel companion pets, monsters, fairies, animated auras, and terminal skins is transferred directly on-chain to the permanent dead burn address.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Balance Pill */}
            <div className="rounded-xl border border-emerald-500/30 bg-[#0c130f]/90 px-4 py-2.5 shadow-md flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <span className="text-zinc-500 text-[9px] uppercase font-bold block">YOUR $NINE BALANCE</span>
                <span className="font-black text-emerald-400 text-sm font-mono">
                  {userNineBalance.toLocaleString()} $NINE
                </span>
              </div>
            </div>

            {/* Live Mainnet Action Button */}
            {!isConnected ? (
              <button
                onClick={() => setWalletModalOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-emerald-500/60 bg-emerald-950/60 px-4 py-2.5 text-emerald-300 hover:text-white hover:border-emerald-400 font-bold transition-all shadow-sm"
              >
                <Zap className="h-4 w-4 text-emerald-400" />
                <span>CONNECT TO BURN</span>
              </button>
            ) : (
              <a
                href={`https://robinhoodchain.blockscout.com/address/${BURN_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-xl border border-amber-500/60 bg-gradient-to-r from-amber-950/80 to-amber-900/50 px-4 py-2.5 text-amber-300 hover:text-white hover:border-amber-400 font-bold transition-all shadow-sm"
                title="View verified Dead Address burns on Blockscout"
              >
                <Flame className="h-4 w-4 text-nine-gold animate-pulse" />
                <span>VIEW DEAD VAULT</span>
              </a>
            )}
          </div>
        </div>

        {/* UNIFIED ON-CHAIN DEFLATIONARY REACTOR HUD (Macro Burn Telemetry) */}
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-[#0f1118]/90 to-[#090a0f] p-4 sm:p-5 shadow-2xl mb-8 font-mono relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3 mb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <Flame className="h-4 w-4 text-amber-400 animate-pulse" />
              <span className="tracking-wider uppercase">GLOBAL ON-CHAIN BURN TELEMETRY /// ROBINHOOD CHAIN MAINNET (4663)</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-zinc-300 font-bold">SMART CONTRACT VERIFIED</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* Total Burned */}
            <div className="rounded-xl border border-amber-500/20 bg-black/50 p-3.5 shadow-sm">
              <div className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-amber-400" />
                <span>TOTAL $NINE BURNED</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1 flex items-baseline gap-1">
                <span>{onChainBurnedTotal.toLocaleString()}</span>
                <span className="text-xs text-zinc-500 font-normal">$NINE</span>
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5">
                Permanently incinerated tokens
              </div>
            </div>

            {/* Burn Destination */}
            <div className="rounded-xl border border-zinc-800 bg-black/50 p-3.5 shadow-sm">
              <div className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-400" />
                <span>BURN DESTINATION</span>
              </div>
              <a
                href={`https://robinhoodchain.blockscout.com/address/${BURN_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-black text-white hover:text-amber-400 mt-1.5 flex items-center gap-1 transition-colors truncate"
              >
                <span className="font-mono">0x000...dEaD</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
              <div className="text-[10px] text-zinc-400 mt-0.5">
                Standard EVM Dead Address
              </div>
            </div>

            {/* Network Deployment */}
            <div className="rounded-xl border border-zinc-800 bg-black/50 p-3.5 shadow-sm">
              <div className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5 text-emerald-400" />
                <span>NETWORK DEPLOYMENT</span>
              </div>
              <div className="text-xs sm:text-sm font-black text-emerald-400 mt-1.5 truncate">
                ROBINHOOD MAINNET
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5">
                Chain ID: 4663 (Arbitrum L2)
              </div>
            </div>

            {/* Protocol Split */}
            <div className="rounded-xl border border-zinc-800 bg-black/50 p-3.5 shadow-sm">
              <div className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-nine-gold" />
                <span>PROTOCOL SPLIT</span>
              </div>
              <div className="text-xs sm:text-sm font-black text-emerald-400 mt-1.5">
                100% BURN / 0% TAX
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5">
                Zero team or dev cut retained
              </div>
            </div>
          </div>
        </div>

        {/* FEEDBACK BANNER */}
        {purchaseNotification && (
          <div className="mb-6 rounded-xl border border-emerald-500/60 bg-emerald-950/40 p-3.5 text-xs font-mono text-emerald-300 font-bold flex items-center justify-between shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{purchaseNotification}</span>
            </div>
            <span className="text-[10px] text-zinc-400 uppercase hidden sm:inline">SYNCHRONIZED ON-CHAIN</span>
          </div>
        )}

        {/* CATEGORY NAVIGATION PILLS */}
        <div className="flex flex-wrap items-center gap-2 mb-8 font-mono text-xs border-b border-zinc-800 pb-4">
          <button
            onClick={() => {
              soundManager.playClick();
              setSelectedCategory('ALL');
            }}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 font-bold ${
              selectedCategory === 'ALL'
                ? 'bg-white text-black shadow-md'
                : 'bg-[#0d0f15] text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>ALL ASSETS ({categoryCounts.ALL})</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setSelectedCategory('PET_CAT');
            }}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 font-bold ${
              selectedCategory === 'PET_CAT'
                ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                : 'bg-[#0d0f15] text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <Heart className="h-3.5 w-3.5" />
            <span>PIXEL PET CATS ({categoryCounts.PET_CAT})</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setSelectedCategory('MONSTER');
            }}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 font-bold ${
              selectedCategory === 'MONSTER'
                ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                : 'bg-[#0d0f15] text-zinc-400 hover:text-red-400 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            <span>MONSTERS & FAIRIES ({categoryCounts.MONSTER})</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setSelectedCategory('AURA_FX');
            }}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 font-bold ${
              selectedCategory === 'AURA_FX'
                ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'bg-[#0d0f15] text-zinc-400 hover:text-purple-400 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>ANIMATED AURAS ({categoryCounts.AURA_FX})</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setSelectedCategory('SKIN');
            }}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 font-bold ${
              selectedCategory === 'SKIN'
                ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                : 'bg-[#0d0f15] text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <Palette className="h-3.5 w-3.5" />
            <span>TERMINAL SKINS ({categoryCounts.SKIN})</span>
          </button>
        </div>

        {/* 2-COLUMN LAYOUT: Catalog Grid (7 cols) + Dynamic Diagnostic Chamber (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-mono items-start">
          
          {/* LEFT 7 COLS: Catalog Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredItems.map((item) => {
              const isOwned = isItemOwned(item);
              const isEquipped = isItemEquipped(item);
              const isSelectedForPreview = activePreviewItem.id === item.id;
              const canAfford = userNineBalance >= item.priceInNine;
              const currentAction = cardCompanionActions[item.id] || 'idle';

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectPreview(item)}
                  className={`cursor-pointer rounded-2xl border p-4 flex flex-col justify-between transition-all bg-[#0d0e15]/90 relative overflow-hidden group shadow-lg ${
                    isSelectedForPreview
                      ? 'border-emerald-500/80 ring-2 ring-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.2)] bg-[#10141b]'
                      : 'border-zinc-800 hover:border-zinc-600 hover:bg-[#12141c]'
                  }`}
                >
                  {/* Top Glowing Color Accent */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: item.previewColor || (item.category === 'PET_CAT' ? '#10b981' : item.category === 'MONSTER' ? '#ef4444' : '#a855f7') }}
                  />

                  <div>
                    {/* Header: Title and Rarity Badge */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-white leading-tight group-hover:text-emerald-300 transition-colors">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isOwned && (
                          <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-emerald-950/90 text-emerald-400 border border-emerald-500/50 shadow-sm flex items-center gap-0.5">
                            <Check className="h-2.5 w-2.5" />
                            OWNED
                          </span>
                        )}
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase shrink-0 ${
                            item.rarity === 'MYTHIC'
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                              : item.rarity === 'ARTIFACT'
                              ? 'bg-purple-950/80 text-purple-300 border border-purple-500/50 shadow-[0_0_8px_rgba(168,85,247,0.2)]'
                              : item.rarity === 'LEGENDARY'
                              ? 'bg-blue-950/80 text-blue-300 border border-blue-500/50'
                              : item.rarity === 'DEGEN'
                              ? 'bg-red-950/80 text-red-300 border border-red-500/50'
                              : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                          }`}
                        >
                          {item.rarity}
                        </span>
                      </div>
                    </div>

                    {/* Media / Animation Preview Tile */}
                    <div className="relative my-3 h-44 w-full rounded-xl border border-zinc-800/80 bg-black/80 flex flex-col items-center justify-center overflow-hidden shadow-inner">
                      {item.category === 'PET_CAT' ? (
                        <div className="relative h-full w-full flex flex-col items-center justify-center pb-8">
                          {/* Circular Holographic Pedestal */}
                          <div className="absolute bottom-8 w-24 h-5 bg-emerald-500/20 blur-sm rounded-full" />
                          
                          <PixelCompanionAnimator
                            type="cat"
                            catId={item.petCatId || 1}
                            action={currentAction}
                            size={105}
                            interactive={true}
                          />

                          {/* Action Switcher Bar */}
                          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {(['idle', 'walk', 'run', 'stretch'] as const).map((act) => (
                                <button
                                  key={act}
                                  onClick={(e) => handleCardCompanionAction(item.id, item, act, e)}
                                  className={`px-1.5 py-0.5 text-[8px] rounded uppercase font-bold transition-all ${
                                    currentAction === act
                                      ? 'bg-emerald-500 text-black'
                                      : 'bg-zinc-800/90 text-zinc-400 hover:text-white'
                                  }`}
                                  title={`Animate ${act}`}
                                >
                                  {act}
                                </button>
                              ))}
                            </div>

                            <button
                              onClick={(e) => handleCardCompanionAction(item.id, item, 'laying', e)}
                              className={`px-1.5 py-0.5 text-[8px] rounded uppercase font-bold transition-all ${
                                currentAction === 'laying'
                                  ? 'bg-emerald-500 text-black'
                                  : 'bg-zinc-800/90 text-zinc-400 hover:text-white'
                              }`}
                            >
                              LAYING
                            </button>
                          </div>
                        </div>
                      ) : item.category === 'MONSTER' ? (
                        <div className="relative h-full w-full flex flex-col items-center justify-center pb-8">
                          {/* Pedestal Glow */}
                          <div
                            className="absolute bottom-8 w-24 h-5 blur-sm rounded-full"
                            style={{ backgroundColor: item.previewColor ? `${item.previewColor}40` : 'rgba(255, 68, 68, 0.25)' }}
                          />

                          {item.companionType === 'fairy' ? (
                            <PixelCompanionAnimator
                              type="fairy"
                              fairyId={item.fairyId || 1}
                              size={85}
                              interactive={true}
                            />
                          ) : (
                            <PixelCompanionAnimator
                              type="monster"
                              monsterId={item.monsterId || 'doux'}
                              action={currentAction}
                              size={95}
                              interactive={true}
                            />
                          )}

                          {/* Monster Action Switcher Bar */}
                          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                            {item.companionType === 'fairy' ? (
                              <div className="flex items-center gap-1">
                                <span className="text-[8px] text-purple-300 font-bold uppercase px-2 py-0.5 bg-purple-950/80 rounded border border-purple-800/50">
                                  HOVERING CELESTIAL
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                {(['idle', 'move', 'kick', 'bite', 'jump'] as const).map((act) => (
                                  <button
                                    key={act}
                                    onClick={(e) => handleCardCompanionAction(item.id, item, act, e)}
                                    className={`px-1.5 py-0.5 text-[8px] rounded uppercase font-bold transition-all ${
                                      currentAction === act
                                        ? 'bg-red-500 text-white'
                                        : 'bg-zinc-800/90 text-zinc-400 hover:text-white'
                                    }`}
                                    title={`Animate ${act}`}
                                  >
                                    {act}
                                  </button>
                                ))}
                              </div>
                            )}

                            {item.companionType !== 'fairy' && (
                              <button
                                onClick={(e) => handleCardCompanionAction(item.id, item, 'dash', e)}
                                className={`px-1.5 py-0.5 text-[8px] rounded uppercase font-bold transition-all ${
                                  currentAction === 'dash'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-zinc-800/90 text-zinc-400 hover:text-white'
                                }`}
                                title="Animate dash"
                              >
                                DASH
                              </button>
                            )}
                          </div>
                        </div>
                      ) : item.category === 'AURA_FX' && item.imageSrc ? (
                        <div className="relative h-full w-full flex items-center justify-center p-2">
                          <img
                            src={item.imageSrc}
                            alt={item.name}
                            className="h-28 w-28 object-contain filter drop-shadow-[0_0_16px_rgba(168,85,247,0.6)]"
                          />
                          <div className="absolute bottom-2 right-2 text-[8px] bg-black/80 px-2 py-0.5 rounded text-purple-300 border border-purple-500/40">
                            ANIMATED PARTICLE FX
                          </div>
                        </div>
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center p-3 text-center">
                          <div
                            className="h-10 w-28 rounded-lg border border-white/20 mb-2 shadow-inner"
                            style={{ backgroundColor: item.previewColor || '#222' }}
                          />
                          <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
                            TERMINAL CRT SKIN
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-zinc-400 leading-relaxed min-h-[34px] line-clamp-2">
                      {item.description}
                    </p>

                    {item.category === 'PET_CAT' && item.petCatId && (
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-zinc-500">
                        <Sparkles className="h-3 w-3 text-emerald-400 shrink-0" />
                        <span className="truncate">{CAT_DESCRIPTIONS[item.petCatId]?.specialty}</span>
                      </div>
                    )}

                    {item.category === 'MONSTER' && item.monsterId && (
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-zinc-500">
                        <Flame className="h-3 w-3 text-red-400 shrink-0" />
                        <span className="truncate">{MONSTER_DESCRIPTIONS[item.monsterId]?.specialty || 'Battle Companion'}</span>
                      </div>
                    )}
                  </div>

                  {/* Pricing and Action Bar */}
                  <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-[9px] text-zinc-500 uppercase font-bold">PRICE</div>
                      <div className="text-xs font-black text-emerald-400">
                        {item.priceInNine === 0 ? 'FREE / DEFAULT' : `${item.priceInNine.toLocaleString()} $NINE`}
                      </div>
                    </div>

                    {isEquipped ? (
                      <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-lg flex items-center gap-1.5 border border-emerald-500/40 shadow-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        EQUIPPED
                      </span>
                    ) : isOwned ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEquip(item);
                        }}
                        className="rounded-lg border border-emerald-500/60 bg-emerald-950/60 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-900 hover:border-emerald-400 transition-all font-bold flex items-center gap-1 shadow-sm"
                        title="Already owned by your wallet. Click to equip."
                      >
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span>EQUIP</span>
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePurchase(item);
                        }}
                        disabled={!canAfford}
                        className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                          canAfford
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 hover:shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                            : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                        }`}
                        title="Purchase item and permanently burn 100% of tokens to 0x...dEaD"
                      >
                        <Flame className="h-3.5 w-3.5 shrink-0 text-black" />
                        <span>{canAfford ? 'BURN & BUY' : 'NEED $NINE'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT 5 COLS: Dynamic Identity Diagnostic & Preview Chamber */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="rounded-2xl border border-emerald-500/30 bg-[#0b0c13]/95 p-5 shadow-2xl relative overflow-hidden backdrop-blur-md">
              {/* Subtle CRT Scanline */}
              <div className="absolute inset-0 crt-scanlines opacity-10 pointer-events-none" />

              {/* Chamber Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4 text-xs">
                <span className="text-zinc-200 font-bold uppercase flex items-center gap-2">
                  <Eye className="h-4 w-4 text-emerald-400" />
                  <span>IDENTITY PREVIEW CHAMBER</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-amber-400 font-bold border border-zinc-700">
                  {activePreviewItem.category}
                </span>
              </div>

              {/* Simulated Identity Card Display */}
              <div
                className={`relative rounded-xl border p-5 transition-all overflow-hidden shadow-inner ${
                  activePreviewItem.category === 'SKIN'
                    ? activePreviewItem.previewClass || 'border-zinc-700 bg-black/60'
                    : 'border-zinc-800 bg-[#0c0d14]'
                }`}
              >
                {/* Background Aura FX preview */}
                {(activePreviewItem.category === 'AURA_FX' ? activePreviewItem.imageSrc : connectedProfile?.equippedAura) && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30 overflow-hidden mix-blend-screen">
                    <img
                      src={
                        activePreviewItem.category === 'AURA_FX'
                          ? activePreviewItem.imageSrc
                          : connectedProfile?.equippedAura
                      }
                      alt="Aura FX"
                      className="h-full w-full object-cover scale-150 animate-pulse"
                    />
                  </div>
                )}

                {/* User Identity Details */}
                <div className="relative z-10 flex items-start justify-between gap-4 border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center gap-3.5">
                    {/* User Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={connectedProfile?.avatarUrl || '/assets/mascot/mascot_head_favicon.webp'}
                        alt="Avatar"
                        className="h-16 w-16 rounded-xl border border-emerald-500/50 object-cover shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                      />
                      <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-black animate-pulse" />
                    </div>

                    <div>
                      <div className="text-base font-black text-white flex items-center gap-1.5">
                        <span>{connectedProfile?.displayName || 'ANONYMOUS OPERATIVE'}</span>
                      </div>

                      <div className="text-xs text-nine-gold font-bold mt-0.5">
                        {connectedProfile?.customTitle || '🐈 GME RESILIENCE BELIEVER'}
                      </div>

                      <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                        {connectedProfile?.shortAddress || 'NOT CONNECTED'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[9px] text-zinc-500 uppercase font-bold">HOLDING</div>
                    <div className="text-xs font-black text-emerald-400">
                      {userNineBalance.toLocaleString()} $NINE
                    </div>
                    <div className="text-[9px] text-zinc-500 mt-0.5">9 LIVES ACTIVE</div>
                  </div>
                </div>

                {/* Dynamic Chamber Display for Previewed Item */}
                <div className="relative z-10 rounded-xl border border-white/10 bg-black/70 p-4 mb-4">
                  {/* CASE 1: PET CAT */}
                  {activePreviewItem.category === 'PET_CAT' ? (
                    <div>
                      <div className="flex items-center justify-between text-xs mb-3">
                        <span className="text-zinc-400 font-bold uppercase flex items-center gap-1.5 text-[11px]">
                          <Heart className="h-3.5 w-3.5 text-emerald-400" />
                          <span>PREVIEWING FELINE:</span>
                          <span className="text-white">{activePreviewItem.name}</span>
                        </span>

                        <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 font-bold">
                          PIXEL FELINE
                        </span>
                      </div>

                      <div className="relative h-40 w-full rounded-xl bg-gradient-to-b from-black/80 to-zinc-950 flex flex-col items-center justify-center overflow-hidden border border-zinc-800/80">
                        {/* Pedestal Glow */}
                        <div className="absolute bottom-6 w-32 h-6 bg-emerald-500/20 blur-md rounded-full" />

                        <PixelCompanionAnimator
                          type="cat"
                          catId={activePreviewItem.petCatId || 1}
                          action={chamberAction}
                          size={135}
                          interactive={true}
                        />
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {(['idle', 'walk', 'run', 'stretch'] as const).map((act) => (
                            <button
                              key={act}
                              onClick={() => {
                                soundManager.playClick();
                                setChamberAction(act);
                              }}
                              className={`px-2 py-1 text-[9px] rounded uppercase font-bold transition-all ${
                                chamberAction === act
                                  ? 'bg-emerald-500 text-black'
                                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
                              }`}
                            >
                              {act}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : activePreviewItem.category === 'MONSTER' ? (
                    <div>
                      <div className="flex items-center justify-between text-xs mb-3">
                        <span className="text-zinc-400 font-bold uppercase flex items-center gap-1.5 text-[11px]">
                          <Flame className="h-3.5 w-3.5 text-red-400" />
                          <span>PREVIEWING COMPANION:</span>
                          <span className="text-white">{activePreviewItem.name}</span>
                        </span>

                        <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-red-400 font-bold">
                          {activePreviewItem.companionType === 'fairy' ? 'MYTHIC FAIRY' : 'BATTLE COMPANION'}
                        </span>
                      </div>

                      <div className="relative h-40 w-full rounded-xl bg-gradient-to-b from-black/80 to-zinc-950 flex flex-col items-center justify-center overflow-hidden border border-zinc-800/80">
                        {/* Pedestal Glow */}
                        <div
                          className="absolute bottom-6 w-32 h-6 blur-md rounded-full"
                          style={{ backgroundColor: activePreviewItem.previewColor ? `${activePreviewItem.previewColor}40` : 'rgba(255,68,68,0.25)' }}
                        />

                        {activePreviewItem.companionType === 'fairy' ? (
                          <PixelCompanionAnimator
                            type="fairy"
                            fairyId={activePreviewItem.fairyId || 1}
                            size={110}
                            interactive={true}
                          />
                        ) : (
                          <PixelCompanionAnimator
                            type="monster"
                            monsterId={activePreviewItem.monsterId || 'doux'}
                            action={chamberAction}
                            size={120}
                            interactive={true}
                          />
                        )}
                      </div>

                      {activePreviewItem.companionType !== 'fairy' && (
                        <div className="mt-3 flex items-center gap-1">
                          {(['idle', 'move', 'kick', 'bite', 'jump', 'dash'] as const).map((act) => (
                            <button
                              key={act}
                              onClick={() => {
                                soundManager.playClick();
                                setChamberAction(act);
                              }}
                              className={`px-2 py-1 text-[9px] rounded uppercase font-bold transition-all ${
                                chamberAction === act
                                  ? 'bg-red-500 text-white'
                                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
                              }`}
                            >
                              {act}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : activePreviewItem.category === 'AURA_FX' ? (
                    <div className="text-center py-4">
                      <div className="text-xs font-bold text-purple-300 uppercase mb-2">
                        ANIMATED AURA FX ACTIVE IN CHAMBER
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Particle aura projected into your background profile card and avatar HUD.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-xs font-bold text-nine-gold uppercase mb-2">
                        TERMINAL CRT SKIN COLOR MATRIX
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Transform your command overlay and profile card into this high-contrast retro cyber aesthetic.
                      </p>
                    </div>
                  )}
                </div>

                {/* Chamber Execution Controls */}
                <div className="relative z-10 flex items-center justify-between gap-3 pt-2">
                  <div>
                    <span className="text-[9px] text-zinc-500 uppercase font-bold block">PROTOCOL PRICE</span>
                    <span className="text-sm font-black text-emerald-400">
                      {activePreviewItem.priceInNine === 0 ? 'FREE' : `${activePreviewItem.priceInNine.toLocaleString()} $NINE`}
                    </span>
                  </div>

                  {isItemEquipped(activePreviewItem) ? (
                    <span className="text-xs font-bold text-emerald-300 bg-emerald-950 px-4 py-2 rounded-xl border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>EQUIPPED IN LOADOUT</span>
                    </span>
                  ) : isItemOwned(activePreviewItem) ? (
                    <button
                      onClick={() => handleEquip(activePreviewItem)}
                      className="rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-black hover:bg-emerald-400 transition-all shadow-md flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>ALREADY OWNED · EQUIP NOW</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePurchase(activePreviewItem)}
                      disabled={userNineBalance < activePreviewItem.priceInNine}
                      className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2 text-xs font-bold text-black hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Flame className="h-4 w-4" />
                      <span>EXECUTE 100% BURN PURCHASE</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ON-CHAIN BURN EXECUTION MODAL */}
      {burnModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-mono animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl border border-amber-500/50 bg-[#0d0f17] p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <div className="flex items-center gap-2 text-xs text-amber-400 font-bold uppercase">
                <Flame className="h-4 w-4 text-amber-500" />
                <span>ON-CHAIN ARMORY BURN // ROBINHOOD MAINNET (4663)</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setBurnModalItem(null);
                  setBurnResult(null);
                }}
                disabled={isBurning}
                className="text-zinc-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Target Item Details */}
            <div className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-black/60 p-3.5 mb-4">
              <div className="h-14 w-14 rounded-xl bg-zinc-950 border border-zinc-700 flex items-center justify-center shrink-0 overflow-hidden">
                {burnModalItem.category === 'PET_CAT' ? (
                  <PixelCompanionAnimator
                    type="cat"
                    catId={burnModalItem.petCatId || 1}
                    size={52}
                    interactive={false}
                  />
                ) : burnModalItem.category === 'MONSTER' ? (
                  burnModalItem.companionType === 'fairy' ? (
                    <PixelCompanionAnimator
                      type="fairy"
                      fairyId={burnModalItem.fairyId || 1}
                      size={44}
                      interactive={false}
                    />
                  ) : (
                    <PixelCompanionAnimator
                      type="monster"
                      monsterId={burnModalItem.monsterId || 'doux'}
                      size={48}
                      interactive={false}
                    />
                  )
                ) : burnModalItem.imageSrc ? (
                  <img src={burnModalItem.imageSrc} alt="" className="h-10 w-10 object-contain" />
                ) : (
                  <Sparkles className="h-6 w-6 text-amber-400" />
                )}
              </div>

              <div>
                <div className="text-sm font-black text-white">{burnModalItem.name}</div>
                <div className="text-xs text-zinc-400 mt-0.5">{burnModalItem.rarity} {burnModalItem.category}</div>
              </div>
            </div>

            {/* Burn Telemetry Breakdown */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-2 mb-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Tokens Burned:</span>
                <span className="text-base font-black text-amber-400">
                  {burnModalItem.priceInNine.toLocaleString()} $NINE
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Protocol Fee / Cut:</span>
                <span className="text-emerald-400 font-bold">0 $NINE (0% Retained)</span>
              </div>

              <div className="flex items-center justify-between border-t border-amber-500/20 pt-2">
                <span className="text-zinc-400">Burn Destination:</span>
                <a
                  href={`https://robinhoodchain.blockscout.com/address/${BURN_ADDRESS}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-300 font-mono text-[11px] hover:underline flex items-center gap-1"
                >
                  <span>0x000...dEaD</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Network:</span>
                <span className="text-emerald-400 font-mono text-[11px]">Robinhood Chain Mainnet (4663)</span>
              </div>
            </div>

            {/* Result Display */}
            {burnResult && (
              <div
                className={`mb-4 rounded-xl border p-3.5 text-xs ${
                  burnResult.success
                    ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300'
                    : 'border-red-500/60 bg-red-950/40 text-red-300'
                }`}
              >
                {burnResult.success ? (
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>ON-CHAIN BURN MINED & CONFIRMED!</span>
                    </div>
                    <div className="text-[11px] text-zinc-300 mt-1">
                      100% of tokens were permanently destroyed on Robinhood Chain Mainnet.
                    </div>
                    {burnResult.txHash && (
                      <a
                        href={`https://robinhoodchain.blockscout.com/tx/${burnResult.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 font-mono text-amber-300 hover:underline mt-2 text-[10px] break-all font-bold"
                      >
                        <span>Tx: {burnResult.txHash}</span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                    <span>{burnResult.error || 'Transaction failed.'}</span>
                  </div>
                )}
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setBurnModalItem(null);
                  setBurnResult(null);
                }}
                disabled={isBurning}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-xs text-zinc-400 hover:text-white disabled:opacity-40 font-bold"
              >
                {burnResult?.success ? 'CLOSE' : 'CANCEL'}
              </button>

              {burnResult?.success ? (
                <button
                  type="button"
                  onClick={() => {
                    handleEquip(burnModalItem);
                    setBurnModalItem(null);
                    setBurnResult(null);
                  }}
                  className="rounded-lg bg-emerald-500 px-5 py-2 text-xs font-bold text-black hover:bg-emerald-400 transition-colors shadow-md"
                >
                  EQUIP TO PROFILE NOW
                </button>
              ) : isItemOwned(burnModalItem) ? (
                <button
                  type="button"
                  disabled
                  className="rounded-lg bg-zinc-800 border border-zinc-700 px-5 py-2 text-xs font-bold text-zinc-400 cursor-not-allowed flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>ALREADY OWNED BY WALLET</span>
                </button>
              ) : userNineBalance < burnModalItem.priceInNine ? (
                <div className="rounded-lg bg-red-950/70 border border-red-500/50 px-4 py-2 text-xs font-bold text-red-300 flex items-center gap-2">
                  <Flame className="h-4 w-4 text-red-400" />
                  <span>INSUFFICIENT $NINE ({userNineBalance.toLocaleString()} / {burnModalItem.priceInNine.toLocaleString()})</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmOnChainBurn}
                  disabled={isBurning}
                  className="rounded-lg bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-5 py-2 text-xs font-bold text-black hover:shadow-[0_0_20px_rgba(255,215,0,0.5)] transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isBurning ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>BURNING ON-CHAIN...</span>
                    </>
                  ) : (
                    <>
                      <Flame className="h-4 w-4" />
                      <span>CONFIRM 100% BURN PURCHASE</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
