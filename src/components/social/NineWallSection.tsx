'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNine } from '@/context/NineContext';
import { WallPost, ArcadeShowcase, ArcadeItem } from '@/types';
import { TOKEN_INFO } from '@/lib/data';
import { soundManager } from '@/lib/sound';
import { validateWallContent } from '@/lib/wallValidation';
import { PixelCompanionAnimator } from '@/components/arcade/PixelCompanionAnimator';
import {
  MessageSquare,
  Send,
  Sparkles,
  Flame,
  AlertCircle,
  Pin,
  Tag,
  Shield,
  ShieldAlert,
  Image as ImageIcon,
  UploadCloud,
  X,
  Gamepad2,
  Trophy,
  ExternalLink,
  ChevronDown,
  Check,
  Eye,
  Maximize2,
  Lock,
  Unlock,
  Wallet,
  ShieldCheck,
  AlertTriangle,
  Zap,
} from 'lucide-react';

export function NineWallSection() {
  const {
    wallPosts,
    addWallPost,
    reactToWallPost,
    openProfileModal,
    isConnected,
    connectedProfile,
    userNineBalance,
    setWalletModalOpen,
    ownedItemIds,
    arcadeCatalog,
    setActiveTab,
  } = useNine();

  const [selectedCategory, setSelectedCategory] = useState<
    'ALL' | 'HOT' | 'NEW' | 'GME LORE' | 'FUMBLES' | 'ART' | 'BAG WORK' | 'MEMES'
  >('ALL');

  // Post creation state
  const [newContent, setNewContent] = useState('');
  const [postCategory, setPostCategory] = useState<WallPost['category']>('HOT');
  const [postTag, setPostTag] = useState('#NINE');
  const [customAlias, setCustomAlias] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImageName, setUploadedImageName] = useState<string | null>(null);
  const [selectedArcadeGear, setSelectedArcadeGear] = useState<ArcadeShowcase | null>(null);
  const [isGearMenuOpen, setIsGearMenuOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Lightbox Modal state
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const MIN_NINE_REQUIRED = 9;
  const isHolderVerified = isConnected && userNineBalance >= MIN_NINE_REQUIRED;

  // Auto-attach the user's equipped companion/pet as arcade gear when profile changes
  useEffect(() => {
    if (connectedProfile?.equippedPet) {
      const equippedItem = arcadeCatalog.find(
        (item) =>
          (item.category === 'PET_CAT' && item.petCatId === connectedProfile.equippedPetCatId) ||
          (item.category === 'MONSTER' && item.monsterId === connectedProfile.equippedMonsterId) ||
          item.imageSrc === connectedProfile.equippedPet
      );
      if (equippedItem) {
        setSelectedArcadeGear({
          itemId: equippedItem.id,
          name: equippedItem.name,
          category: equippedItem.category,
          rarity: equippedItem.rarity,
          imageSrc: equippedItem.imageSrc,
          previewColor: equippedItem.previewColor,
          effectType: equippedItem.effectType,
          petCatId: equippedItem.petCatId,
          companionType: equippedItem.companionType,
          monsterId: equippedItem.monsterId,
          fairyId: equippedItem.fairyId,
        });
      }
    }
  }, [connectedProfile?.equippedPet, arcadeCatalog]);

  // Real-time ticker and CA content analysis
  const validationStatus = useMemo(() => {
    if (!newContent.trim()) {
      return { isValid: true, error: undefined, bannedTickers: [], bannedCAs: [] };
    }
    return validateWallContent(newContent);
  }, [newContent]);

  // List of available arcade items to showcase (prioritize user's owned items)
  const availableShowcaseItems = useMemo(() => {
    // If user has owned items, map them from catalog
    const owned = arcadeCatalog.filter((item) => ownedItemIds.includes(item.id));
    if (owned.length > 0) return owned;
    // Fallback: showcase items available in catalog to celebrate ecosystem items
    return arcadeCatalog.slice(0, 8);
  }, [arcadeCatalog, ownedItemIds]);

  // Handle local image upload via FileReader
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (.png, .jpg, .webp, .gif).');
      soundManager.playFumbleBuzz();
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 5MB limit.');
      soundManager.playFumbleBuzz();
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setUploadedImage(result);
        setUploadedImageName(file.name);
        setErrorMsg(null);
        soundManager.playClick();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      soundManager.playClick();
      setWalletModalOpen(true);
      setErrorMsg('🔒 Connect your wallet holding at least 9 $NINE to broadcast transmissions.');
      soundManager.playFumbleBuzz();
      return;
    }

    if (userNineBalance < MIN_NINE_REQUIRED) {
      setErrorMsg(`🔒 Transmissions require holding at least ${MIN_NINE_REQUIRED} $NINE tokens. Current balance: ${Math.round(userNineBalance)} $NINE.`);
      soundManager.playFumbleBuzz();
      return;
    }

    // Strict validation against foreign tickers and CAs
    const validation = validateWallContent(newContent);
    if (!validation.isValid) {
      setErrorMsg(validation.error || 'Blocked by Wall Defense: Foreign tickers or unauthorized CAs detected.');
      soundManager.playFumbleBuzz();
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const result = addWallPost(
      newContent,
      postCategory,
      postTag,
      uploadedImage || undefined,
      selectedArcadeGear || undefined,
      customAlias || undefined
    );

    if (!result.success) {
      setErrorMsg(result.error || 'Failed to broadcast');
      soundManager.playFumbleBuzz();
    } else {
      setNewContent('');
      setUploadedImage(null);
      setUploadedImageName(null);
      setSelectedArcadeGear(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
    setIsSubmitting(false);
  };

  const filteredPosts = wallPosts.filter((post) => {
    if (selectedCategory === 'ALL') return true;
    return post.category === selectedCategory;
  });

  return (
    <section id="nine-wall" className="relative w-full border-b border-nine-border bg-nine-bg py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-nine-border pb-6 mb-8">
          <div className="flex items-start gap-4">
            <img
              src="/assets/mascot/mascot_stool.webp"
              alt="Mascot Sentinel"
              className="h-20 w-auto object-contain drop-shadow-[0_0_15px_rgba(0,255,102,0.3)] hidden sm:block"
            />
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-nine-green uppercase tracking-widest mb-1 font-bold">
                <MessageSquare className="h-4 w-4" />
                <span>OPEN TRANSMISSION WALL /// COMMUNITY MEME VANGUARD</span>
              </div>
              <h2 className="font-mono text-3xl sm:text-4xl font-black tracking-tight text-white flex flex-wrap items-center gap-3">
                <span>NINE WALL</span>
                <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  <span>HOLD MIN. 9 $NINE</span>
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40 font-bold flex items-center gap-1">
                  <ImageIcon className="h-3 w-3 text-purple-400" />
                  <span>IMAGE UPLOADS ACTIVE</span>
                </span>
              </h2>
              <p className="mt-1 text-xs sm:text-sm font-mono text-zinc-400 max-w-xl">
                Operatives must hold at least 9 $NINE tokens to broadcast transmissions. Transmit raw conviction, comeback stories, upload your highest quality memes, and flaunt your Arcade gear. Shilling foreign tickers or unverified CAs is forbidden by the defense shield.
              </p>
            </div>
          </div>

          {/* Categories Tab bar */}
          <div className="flex flex-wrap items-center rounded border border-nine-border bg-nine-surface p-0.5 font-mono text-xs">
            {(['ALL', 'HOT', 'NEW', 'GME LORE', 'FUMBLES', 'ART', 'BAG WORK', 'MEMES'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  soundManager.playClick();
                  setSelectedCategory(cat);
                }}
                className={`px-3 py-1.5 rounded text-[11px] font-bold transition-colors ${
                  selectedCategory === cat ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Input Box: Broadcast Transmission (No Gatekeeping + Image Upload + Arcade Flex) */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={handleDrop}
          className={`mb-10 rounded-xl border p-5 font-mono shadow-xl transition-all ${
            isDraggingOver
              ? 'border-emerald-400 bg-emerald-950/20'
              : 'border-nine-border bg-nine-surface'
          }`}
        >
          {/* Top Bar with Security Shield Status & Author Identification */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-nine-border/70 pb-3 mb-4 text-xs">
            <div className="flex items-center gap-2 text-white font-bold">
              <Sparkles className="h-4 w-4 text-nine-green" />
              <span>TRANSMIT TO THE NINE WALL</span>
            </div>

            {/* Author Status: Connected or Proof of Bag Required */}
            <div className="flex items-center gap-3 text-[11px]">
              {isConnected && connectedProfile ? (
                <div
                  className={`flex items-center gap-1.5 font-bold px-2.5 py-1 rounded border ${
                    isHolderVerified
                      ? 'border-emerald-500/40 bg-emerald-950/50 text-emerald-300'
                      : 'border-amber-500/40 bg-amber-950/50 text-amber-300'
                  }`}
                >
                  {isHolderVerified ? (
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                  )}
                  <span>
                    {connectedProfile.displayName} ({connectedProfile.shortAddress}) • {userNineBalance.toLocaleString()} $NINE
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setWalletModalOpen(true);
                  }}
                  className="flex items-center gap-1 text-nine-gold bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 rounded font-bold hover:bg-amber-500/30 transition-colors"
                >
                  <Lock className="h-3 w-3" />
                  <span>CONNECT WALLET (HOLD 9+ $NINE)</span>
                </button>
              )}

              <div className="hidden sm:flex items-center gap-1 text-zinc-500">
                <Shield className="h-3.5 w-3.5 text-nine-green" />
                <span>ONLY $NINE ALLOWED</span>
              </div>
            </div>
          </div>

          <form onSubmit={handlePostSubmit}>
            {/* ── HARD GATE: Non-holders see a locked overlay ─────────── */}
            {!isHolderVerified ? (
              <div className="relative w-full">
                {/* Blurred-out fake textarea */}
                <div className="w-full rounded-lg border border-amber-500/40 bg-black/40 p-3 text-xs text-transparent select-none pointer-events-none font-mono resize-none min-h-[72px] blur-[2px]">
                  This area is locked. Hold 9+ $NINE to transmit to the wall.
                </div>
                {/* Lock overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-lg bg-black/70 backdrop-blur-sm border border-amber-500/40">
                  <div className="flex items-center gap-2 text-amber-300 font-black text-xs">
                    <Lock className="h-4 w-4 text-amber-400" />
                    <span>
                      {!isConnected
                        ? 'CONNECT WALLET TO UNLOCK TRANSMISSIONS'
                        : `PROOF OF BAG REQUIRED — You hold ${Math.round(userNineBalance)} $NINE (need 9+)`}
                    </span>
                  </div>
                  {!isConnected ? (
                    <button
                      type="button"
                      onClick={() => { soundManager.playClick(); setWalletModalOpen(true); }}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xs hover:shadow-[0_0_12px_rgba(251,191,36,0.5)] transition-all"
                    >
                      <Wallet className="h-3.5 w-3.5" />
                      CONNECT WALLET
                    </button>
                  ) : (
                    <a
                      href={TOKEN_INFO.contractAddress.startsWith('0x') ? `https://robinhoodchain.blockscout.com/token/${TOKEN_INFO.contractAddress}` : 'https://robinhoodchain.blockscout.com'}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-900 border border-emerald-500/50 text-emerald-300 font-black text-xs hover:bg-emerald-800 transition-all"
                    >
                      <Zap className="h-3.5 w-3.5 text-emerald-400" />
                      ACQUIRE $NINE ON ROBINHOOD CHAIN
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              /* ── UNLOCKED COMPOSER for verified $NINE holders ────────── */
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Drop a comeback story, market observation, encrypted meme packet, or $NINE conviction (max 500 characters)..."
                maxLength={500}
                rows={3}
                className="w-full rounded-lg border border-nine-border bg-black/60 p-3 text-xs text-white placeholder-zinc-600 focus:border-nine-green focus:outline-none transition-colors resize-none font-mono"
              />
            )}



            {/* Live Ticker / CA Defense Shield Alert */}
            {!validationStatus.isValid && validationStatus.error && (
              <div className="mt-2.5 rounded-lg border border-red-500/60 bg-red-950/50 p-3 text-xs text-red-300 flex items-start gap-2 animate-fadeIn">
                <ShieldAlert className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold">{validationStatus.error}</div>
                  <div className="text-[10px] text-red-400/80">
                    Wall Defense Rule: Only <strong className="text-white">$NINE</strong>, <strong className="text-white">$nine</strong>, and the official contract (<code className="text-emerald-300">0x2E8c...1e18</code>) are permitted on this wall.
                  </div>
                </div>
              </div>
            )}

            {/* General Error Message */}
            {errorMsg && (
              <div className="mt-2.5 flex items-center gap-1.5 text-xs text-nine-red font-bold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Uploaded Image Preview Box */}
            {uploadedImage && (
              <div className="mt-3 relative inline-block rounded-lg border border-emerald-500/40 bg-black/80 p-2 overflow-hidden group">
                <div className="flex items-center gap-3">
                  <img
                    src={uploadedImage}
                    alt="Upload Preview"
                    className="h-20 w-20 rounded object-cover border border-zinc-700"
                  />
                  <div className="text-xs">
                    <div className="text-white font-bold truncate max-w-xs">{uploadedImageName || 'Uploaded Image'}</div>
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                      <Check className="h-3 w-3" />
                      <span>Ready to transmit with post</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUploadedImage(null);
                    setUploadedImageName(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-zinc-800 text-zinc-400 hover:bg-red-900 hover:text-white transition-colors"
                  title="Remove Image"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}


            {/* ── ARCADE ATTACHED — compact inline strip ── */}
            {selectedArcadeGear && (
              <div className={`mt-2 flex items-center gap-2.5 px-3 py-2 rounded-lg border text-xs ${
                selectedArcadeGear.rarity === 'MYTHIC'
                  ? 'border-amber-400/60 bg-amber-950/30 shadow-[0_0_10px_rgba(255,215,0,0.12)]'
                  : selectedArcadeGear.rarity === 'ARTIFACT'
                  ? 'border-purple-500/50 bg-purple-950/30'
                  : selectedArcadeGear.rarity === 'LEGENDARY'
                  ? 'border-emerald-500/50 bg-emerald-950/30'
                  : 'border-nine-gold/40 bg-amber-950/20'
              }`}>
                {/* Small sprite or GIF */}
                {(selectedArcadeGear.category === 'PET_CAT' || selectedArcadeGear.category === 'MONSTER') && selectedArcadeGear.companionType ? (
                  <div className="shrink-0" style={{ width: 36, height: 36 }}>
                    <PixelCompanionAnimator
                      type={selectedArcadeGear.companionType}
                      catId={selectedArcadeGear.petCatId || 1}
                      monsterId={selectedArcadeGear.monsterId || 'doux'}
                      fairyId={selectedArcadeGear.fairyId || 1}
                      action="idle"
                      size={36}
                      interactive={false}
                    />
                  </div>
                ) : selectedArcadeGear.imageSrc ? (
                  <img
                    src={selectedArcadeGear.imageSrc}
                    alt=""
                    className="shrink-0 h-7 w-7 object-contain rounded"
                    style={{ imageRendering: 'pixelated' }}
                  />
                ) : (
                  <Gamepad2 className="h-4 w-4 text-nine-gold shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-white text-[11px]">{selectedArcadeGear.name}</span>
                  <span className={`ml-1.5 text-[8px] px-1 py-0.5 rounded border font-black uppercase ${
                    selectedArcadeGear.rarity === 'MYTHIC' ? 'text-nine-gold border-amber-500/50'
                    : selectedArcadeGear.rarity === 'LEGENDARY' ? 'text-emerald-300 border-emerald-500/50'
                    : selectedArcadeGear.rarity === 'ARTIFACT' ? 'text-purple-300 border-purple-500/50'
                    : 'text-zinc-300 border-zinc-600'
                  }`}>{selectedArcadeGear.rarity}</span>
                </div>
                <span className="text-[9px] text-emerald-400 font-bold hidden sm:inline shrink-0">✓ ATTACHED</span>
                <button
                  type="button"
                  onClick={() => setSelectedArcadeGear(null)}
                  className="shrink-0 p-1 rounded text-zinc-500 hover:text-red-400 transition-colors"
                  title="Detach"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}


            {/* Controls Bar */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs pt-3 border-t border-nine-border/70">
              <div className="flex flex-wrap items-center gap-2">
                
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept="image/*"
                  className="hidden"
                />

                {/* Upload Image Button */}
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    fileInputRef.current?.click();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                    uploadedImage
                      ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                      : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white hover:border-emerald-500'
                  }`}
                  title="Upload meme or image file from device"
                >
                  <ImageIcon className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{uploadedImage ? 'CHANGE IMAGE' : 'UPLOAD IMAGE'}</span>
                </button>

                {/* Arcade Flex Dropdown Trigger */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setIsGearMenuOpen((prev) => !prev);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                      selectedArcadeGear
                        ? 'border-amber-500 bg-amber-950/40 text-nine-gold'
                        : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white hover:border-amber-500'
                    }`}
                    title="Flaunt your Arcade purchases on this post"
                  >
                    <Gamepad2 className="h-3.5 w-3.5 text-nine-gold" />
                    <span>{selectedArcadeGear ? 'GEAR ATTACHED' : 'ARCADE FLEX'}</span>
                    <ChevronDown className="h-3 w-3 ml-0.5" />
                  </button>

                  {/* Dropdown Menu for Arcade Gear */}
                  {isGearMenuOpen && (
                    <div className="absolute left-0 bottom-full mb-2 w-72 rounded-xl border border-nine-border bg-[#0d0f14] p-2 shadow-2xl z-30 font-mono">
                      <div className="text-[10px] text-zinc-500 uppercase font-bold px-2 py-1 flex items-center justify-between border-b border-zinc-800 mb-1">
                        <span>SELECT GEAR TO SHOWCASE</span>
                        <button
                          type="button"
                          onClick={() => setIsGearMenuOpen(false)}
                          className="text-zinc-500 hover:text-white"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="max-h-60 overflow-y-auto space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedArcadeGear(null);
                            setIsGearMenuOpen(false);
                          }}
                          className="w-full text-left p-1.5 rounded text-xs text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        >
                          None (No Flex)
                        </button>

                        {availableShowcaseItems.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setSelectedArcadeGear({
                                itemId: item.id,
                                name: item.name,
                                category: item.category,
                                rarity: item.rarity,
                                imageSrc: item.imageSrc,
                                previewColor: item.previewColor,
                                effectType: item.effectType,
                                petCatId: item.petCatId,
                                companionType: item.companionType,
                                monsterId: item.monsterId,
                                fairyId: item.fairyId,
                              });
                              setIsGearMenuOpen(false);
                              soundManager.playComebackChime();
                            }}
                            className="w-full flex items-center gap-2 p-1.5 rounded text-xs hover:bg-zinc-800 text-left transition-colors"
                          >
                            {item.imageSrc ? (
                              <img
                                src={item.imageSrc}
                                alt={item.name}
                                className="h-6 w-6 rounded object-contain bg-black/60 p-0.5"
                              />
                            ) : (
                              <div className="h-6 w-6 rounded bg-zinc-800 flex items-center justify-center text-nine-gold text-[10px]">
                                🎮
                              </div>
                            )}
                            <div className="flex-1 truncate">
                              <div className="text-white font-bold truncate text-[11px]">{item.name}</div>
                              <div className="text-[9px] text-zinc-500">{item.rarity} • {item.category}</div>
                            </div>
                            {ownedItemIds.includes(item.id) && (
                              <span className="text-[9px] text-emerald-400 font-bold">OWNED</span>
                            )}
                          </button>
                        ))}
                      </div>

                      <div className="pt-2 mt-2 border-t border-zinc-800 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setIsGearMenuOpen(false);
                            setActiveTab('ARCADE');
                          }}
                          className="text-[10px] text-nine-gold hover:underline font-bold"
                        >
                          Browse Full Arcade Catalog ──▶
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Channel / Category Selector */}
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value as WallPost['category'])}
                  className="rounded-lg border border-nine-border bg-nine-elevated px-2.5 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="HOT">🔥 HOT</option>
                  <option value="NEW">⚡ NEW</option>
                  <option value="GME LORE">📜 GME LORE</option>
                  <option value="FUMBLES">💀 FUMBLES</option>
                  <option value="BAG WORK">💼 BAG WORK</option>
                  <option value="ART">🎨 ART & MEMES</option>
                </select>

                {/* Tag Input */}
                <input
                  type="text"
                  value={postTag}
                  onChange={(e) => setPostTag(e.target.value)}
                  placeholder="#Tag"
                  className="w-28 rounded-lg border border-nine-border bg-nine-elevated px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none font-mono"
                />
              </div>

              {/* Character Counter & Transmit Button */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-zinc-500">{500 - newContent.length} chars</span>
                {!isConnected ? (
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setWalletModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 px-5 py-2 font-black text-black hover:shadow-[0_0_15px_rgba(251,191,36,0.4)] transition-all text-xs"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>CONNECT (9+ $NINE)</span>
                  </button>
                ) : !isHolderVerified ? (
                  <button
                    type="button"
                    disabled
                    className="flex items-center gap-1.5 rounded-lg bg-zinc-800 border border-zinc-700 px-5 py-2 font-black text-zinc-500 text-xs cursor-not-allowed opacity-60"
                    title="Must hold at least 9 $NINE tokens to transmit"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>HOLD 9+ $NINE TO TRANSMIT</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting || !validationStatus.isValid || !newContent.trim()}
                    className="flex items-center gap-1.5 rounded-lg bg-nine-green px-5 py-2 font-black text-black hover:bg-emerald-400 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>TRANSMIT</span>
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Wall Posts Feed */}
        <div className="space-y-4 font-mono">
          {filteredPosts.length === 0 ? (
            <div className="rounded-2xl border border-nine-border bg-gradient-to-b from-[#12131c]/90 via-[#0d0e14]/90 to-[#08080c] p-12 text-center text-zinc-400 font-mono shadow-xl relative overflow-hidden">
              <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-nine-elevated border border-nine-border mb-4 text-nine-green">
                <MessageSquare className="h-8 w-8 text-nine-green animate-pulse" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                NO TRANSMISSIONS YET • AWAITING FIRST COMMUNITY BROADCAST
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-xl mx-auto leading-relaxed">
                Be the first to transmit on the Nine Wall! Connect your wallet holding 9+ $NINE to post alpha, mascot memes, and showcase your equipped arcade companions to the community.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/30 px-3.5 py-1 text-xs text-emerald-400 font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>NINE WALL SENSORS LIVE ON ROBINHOOD CHAIN</span>
              </div>
            </div>
          ) : (
            filteredPosts.map((post) => {
            // Resolve equipped companion or arcade cosmetic for this user/post
            const companion =
              post.arcadeShowcase && (post.arcadeShowcase.category === 'PET_CAT' || post.arcadeShowcase.category === 'MONSTER')
                ? {
                    type: post.arcadeShowcase.companionType || 'cat',
                    catId: post.arcadeShowcase.petCatId || 1,
                    monsterId: post.arcadeShowcase.monsterId || 'doux',
                    fairyId: post.arcadeShowcase.fairyId || 1,
                    name: post.arcadeShowcase.name,
                    rarity: post.arcadeShowcase.rarity,
                  }
                : post.author.equippedCompanionType
                ? {
                    type: post.author.equippedCompanionType,
                    catId: post.author.equippedPetCatId || 1,
                    monsterId: post.author.equippedMonsterId || 'doux',
                    fairyId: post.author.equippedFairyId || 1,
                    name: post.author.equippedPetName || 'Companion',
                    rarity: post.arcadeShowcase?.rarity || 'SURVIVOR',
                  }
                : null;

            const auraCosmetic =
              !companion && post.arcadeShowcase
                ? {
                    name: post.arcadeShowcase.name,
                    rarity: post.arcadeShowcase.rarity,
                    category: post.arcadeShowcase.category,
                  }
                : null;

            const highestRarity = companion?.rarity || auraCosmetic?.rarity;

            return (
              <div
                key={post.id}
                className={`rounded-xl border p-5 transition-all ${
                  highestRarity === 'MYTHIC'
                    ? 'border-amber-400/50 shadow-[0_0_22px_rgba(255,215,0,0.12)] bg-gradient-to-b from-[#161103] via-nine-surface to-nine-surface'
                    : highestRarity === 'LEGENDARY'
                    ? 'border-emerald-500/50 shadow-[0_0_22px_rgba(0,255,102,0.10)] bg-gradient-to-b from-[#06170c] via-nine-surface to-nine-surface'
                    : highestRarity === 'ARTIFACT'
                    ? 'border-purple-500/50 shadow-[0_0_22px_rgba(168,85,247,0.10)] bg-gradient-to-b from-[#13071c] via-nine-surface to-nine-surface'
                    : highestRarity === 'DEGEN'
                    ? 'border-red-500/50 shadow-[0_0_22px_rgba(239,68,68,0.10)] bg-gradient-to-b from-[#190808] via-nine-surface to-nine-surface'
                    : post.pinned
                    ? 'border-nine-gold/60 shadow-[0_0_15px_rgba(255,215,0,0.06)] bg-nine-surface'
                    : 'border-nine-border hover:border-zinc-500 bg-nine-surface'
                }`}
              >
                {/* Post Header: Integrated User Identity & Arcade Equipment */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-nine-border/70 pb-3.5 mb-3 gap-3">
                  {/* Left: Author Identity */}
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={post.author.avatarUrl}
                      alt={post.author.displayName}
                      onClick={() => openProfileModal(post.author.displayName)}
                      className="h-11 w-11 rounded-xl border-2 border-nine-border cursor-pointer object-cover hover:border-nine-green transition-colors shrink-0 shadow-md"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          onClick={() => openProfileModal(post.author.displayName)}
                          className="text-sm font-black text-white hover:text-nine-green cursor-pointer transition-colors"
                        >
                          {post.author.displayName}
                        </span>
                        {post.author.customTitle && (
                          <span className="text-[10px] text-nine-gold font-bold bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded">
                            {post.author.customTitle}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>{post.author.address}</span>
                        <span>•</span>
                        <span>{post.timestamp}</span>
                        {post.pinned && (
                          <span className="flex items-center gap-1 text-[9px] font-bold text-nine-gold bg-amber-950/60 border border-amber-500/40 px-1.5 py-0.2 rounded">
                            <Pin className="h-2.5 w-2.5" />
                            PINNED
                          </span>
                        )}
                        {post.tag && (
                          <span className="text-[9px] text-zinc-400 bg-black/40 border border-nine-border px-1.5 py-0.2 rounded">
                            {post.tag}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: The User's Equipped Arcade Companion or Aura Flex */}
                  {companion ? (
                    <div
                      onClick={() => setActiveTab('ARCADE')}
                      className={`flex items-center gap-3 px-3 py-1.5 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] shadow-lg shrink-0 ${
                        companion.rarity === 'MYTHIC'
                          ? 'border-amber-400/60 bg-gradient-to-r from-amber-950/60 via-[#191204] to-black/80 shadow-[0_0_15px_rgba(255,215,0,0.18)] hover:border-amber-300'
                          : companion.rarity === 'LEGENDARY'
                          ? 'border-emerald-500/60 bg-gradient-to-r from-emerald-950/60 via-[#06170d] to-black/80 shadow-[0_0_15px_rgba(0,255,102,0.18)] hover:border-emerald-400'
                          : companion.rarity === 'ARTIFACT'
                          ? 'border-purple-500/60 bg-gradient-to-r from-purple-950/60 via-[#13071c] to-black/80 shadow-[0_0_15px_rgba(168,85,247,0.18)] hover:border-purple-400'
                          : 'border-emerald-500/50 bg-gradient-to-r from-emerald-950/40 to-black/80 hover:border-emerald-400'
                      }`}
                      title={`${companion.name} · Click to explore Arcade`}
                    >
                      <div className="text-right">
                        <div className="text-xs font-black text-white flex items-center justify-end gap-1.5">
                          <span>🐾</span>
                          <span className="tracking-tight">{companion.name}</span>
                        </div>
                        <div className="text-[9px] flex items-center justify-end gap-1.5 mt-0.5">
                          <span className={`px-1.5 py-0.2 rounded font-black border uppercase text-[8px] ${
                            companion.rarity === 'MYTHIC'
                              ? 'bg-amber-500/20 text-nine-gold border-amber-500/50 shadow-[0_0_6px_#ffd700]'
                              : companion.rarity === 'LEGENDARY'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                              : companion.rarity === 'ARTIFACT'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                              : 'bg-emerald-950/50 text-emerald-400 border-emerald-600/40'
                          }`}>
                            {companion.rarity}
                          </span>
                          <span className="text-nine-gold font-black tracking-wider text-[8px] flex items-center gap-0.5">
                            <Trophy className="h-2.5 w-2.5 text-nine-gold" />
                            ARCADE PET
                          </span>
                        </div>
                      </div>

                      {/* Animated Companion Sprite: Noticeable & Crisp at 50px */}
                      <div className="relative shrink-0 flex items-center justify-center bg-black/60 rounded-lg p-0.5 border border-white/10" style={{ width: 54, height: 54 }}>
                        <PixelCompanionAnimator
                          type={companion.type}
                          catId={companion.catId}
                          monsterId={companion.monsterId}
                          fairyId={companion.fairyId}
                          action="idle"
                          size={50}
                          interactive={true}
                        />
                      </div>
                    </div>
                  ) : auraCosmetic ? (
                    <div
                      onClick={() => setActiveTab('ARCADE')}
                      className={`flex items-center gap-3 px-3 py-1.5 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] shadow-lg shrink-0 ${
                        auraCosmetic.rarity === 'MYTHIC'
                          ? 'border-amber-400/60 bg-gradient-to-r from-amber-950/60 via-[#191204] to-black/80 shadow-[0_0_15px_rgba(255,215,0,0.18)] hover:border-amber-300'
                          : auraCosmetic.rarity === 'LEGENDARY'
                          ? 'border-emerald-500/60 bg-gradient-to-r from-emerald-950/60 via-[#06170d] to-black/80 shadow-[0_0_15px_rgba(0,255,102,0.18)] hover:border-emerald-400'
                          : auraCosmetic.rarity === 'ARTIFACT'
                          ? 'border-purple-500/60 bg-gradient-to-r from-purple-950/60 via-[#13071c] to-black/80 shadow-[0_0_15px_rgba(168,85,247,0.18)] hover:border-purple-400'
                          : 'border-nine-gold/50 bg-gradient-to-r from-amber-950/40 to-black/80 hover:border-nine-gold'
                      }`}
                      title={`${auraCosmetic.name} · Click to explore Arcade`}
                    >
                      <div className="text-right">
                        <div className="text-xs font-black text-white flex items-center justify-end gap-1.5">
                          <span className="text-emerald-400">✨</span>
                          <span className="tracking-tight">{auraCosmetic.name}</span>
                        </div>
                        <div className="text-[9px] flex items-center justify-end gap-1.5 mt-0.5">
                          <span className={`px-1.5 py-0.2 rounded font-black border uppercase text-[8px] ${
                            auraCosmetic.rarity === 'MYTHIC'
                              ? 'bg-amber-500/20 text-nine-gold border-amber-500/50'
                              : auraCosmetic.rarity === 'LEGENDARY'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                              : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                          }`}>
                            {auraCosmetic.rarity}
                          </span>
                          <span className="text-nine-gold font-black tracking-wider text-[8px] flex items-center gap-0.5">
                            <Sparkles className="h-2.5 w-2.5 text-nine-gold" />
                            ARCADE FX
                          </span>
                        </div>
                      </div>

                      {/* Glowing Pulsing Aura Orb */}
                      <div className="relative shrink-0 h-11 w-11 rounded-lg bg-emerald-950/80 border-2 border-emerald-400/80 flex items-center justify-center text-emerald-300 text-xl shadow-[0_0_15px_rgba(0,255,102,0.5)] animate-pulse">
                        ✨
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Post Content */}
                <p className="text-xs text-zinc-200 leading-relaxed font-mono whitespace-pre-line mb-2">
                  {post.content}
                </p>

                {/* Post Image — compact thumbnail (max 200px), click to zoom fullscreen */}
                {post.imageUrl && (
                  <div
                    onClick={() => setLightboxImage(post.imageUrl!)}
                    className="relative mt-2 mb-3 rounded-lg border border-zinc-800/80 bg-zinc-900 cursor-zoom-in group flex items-center justify-center overflow-hidden"
                    style={{ maxHeight: '200px', minHeight: '80px' }}
                  >
                    <img
                      src={post.imageUrl}
                      alt="Wall attachment"
                      className="max-w-full max-h-[200px] object-contain transition-transform group-hover:scale-[1.02] duration-300 rounded-lg"
                    />
                    <div className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <Maximize2 className="h-2.5 w-2.5 text-emerald-400" />
                      CLICK TO ZOOM
                    </div>
                  </div>
                )}

                {/* Custom Multi-Emoji Reaction Toolbar */}
                <div className="mt-3 pt-3 border-t border-nine-border/70 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => reactToWallPost(post.id, 'cat')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded border text-xs transition-colors ${
                    post.userReactions.includes('cat')
                      ? 'border-nine-green bg-nine-greenMuted text-nine-green font-bold'
                      : 'border-nine-border bg-nine-elevated text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>🐈</span>
                  <span className="text-[11px]">{post.reactions.cat}</span>
                </button>

                <button
                  onClick={() => reactToWallPost(post.id, 'fire')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded border text-xs transition-colors ${
                    post.userReactions.includes('fire')
                      ? 'border-orange-500 bg-orange-950/50 text-orange-300 font-bold'
                      : 'border-nine-border bg-nine-elevated text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>🔥</span>
                  <span className="text-[11px]">{post.reactions.fire}</span>
                </button>

                <button
                  onClick={() => reactToWallPost(post.id, 'skull')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded border text-xs transition-colors ${
                    post.userReactions.includes('skull')
                      ? 'border-nine-red bg-nine-redDark/40 text-nine-red font-bold'
                      : 'border-nine-border bg-nine-elevated text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>💀</span>
                  <span className="text-[11px]">{post.reactions.skull}</span>
                </button>

                <button
                  onClick={() => reactToWallPost(post.id, 'comeback')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded border text-xs transition-colors ${
                    post.userReactions.includes('comeback')
                      ? 'border-nine-green bg-nine-greenMuted/60 text-nine-green font-bold'
                      : 'border-nine-border bg-nine-elevated text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>COMEBACK</span>
                  <span className="text-[11px]">{post.reactions.comeback}</span>
                </button>

                <button
                  onClick={() => reactToWallPost(post.id, 'based')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded border text-xs transition-colors ${
                    post.userReactions.includes('based')
                      ? 'border-blue-500 bg-blue-950/50 text-blue-300 font-bold'
                      : 'border-nine-border bg-nine-elevated text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>BASED</span>
                  <span className="text-[11px]">{post.reactions.based}</span>
                </button>

                <button
                  onClick={() => reactToWallPost(post.id, 'fumble')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded border text-xs transition-colors ${
                    post.userReactions.includes('fumble')
                      ? 'border-nine-red bg-nine-redDark text-nine-red font-bold'
                      : 'border-nine-border bg-nine-elevated text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>FUMBLE</span>
                  <span className="text-[11px]">{post.reactions.fumble}</span>
                </button>
              </div>
            </div>
            );
          })
        )}
        </div>

        {/* High-Resolution Image Lightbox Modal */}
        {lightboxImage && (
          <div
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-fadeIn cursor-zoom-out"
          >
            <div className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-zinc-700 bg-black shadow-2xl">
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-3 right-3 z-10 rounded-full bg-black/80 p-2 text-zinc-400 hover:text-white border border-zinc-700 transition-colors"
                title="Close Lightbox"
              >
                <X className="h-5 w-5" />
              </button>
              <img
                src={lightboxImage}
                alt="Enlarged Wall Meme"
                className="w-auto h-auto max-h-[85vh] max-w-full object-contain mx-auto"
              />
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
