'use client';

import React, { useState, useEffect } from 'react';
import { useNine } from '@/context/NineContext';
import { soundManager } from '@/lib/sound';
import { PixelCompanionAnimator } from '@/components/arcade/PixelCompanionAnimator';
import {
  X,
  Sparkles,
  MessageCircle,
  Maximize2,
  Minimize2,
  Heart,
  Flame,
  Shield,
  Compass,
} from 'lucide-react';

const SAGA_TRANSMISSIONS = [
  "What's an exit strategy?",
  "Shorts never closed. The cat never left.",
  "140% shorted? That just means 140% more fuel for the comeback.",
  "A cat has nine lives. We haven't even used our second.",
  "When they turn off the buy button, retail turns on immortal conviction.",
  "I am not a cat... wait, yes I am.",
  "Just up.",
  "Crashes are not the epilogue. Crashes are chapters.",
  "Wall Street wanted liquidation. Retail engineered resurrection.",
];

export function FloatingMascotCompanion() {
  const { setActiveTab, connectedProfile } = useNine();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [companionAction, setCompanionAction] = useState<string>('idle');
  const [viewTarget, setViewTarget] = useState<'COMPANION' | 'MASCOT'>('COMPANION');

  // If user has an equipped pet, default to COMPANION
  useEffect(() => {
    if (connectedProfile?.equippedPet) {
      setViewTarget('COMPANION');
    }
  }, [connectedProfile?.equippedPet]);

  // Handle ESC key to exit full screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen]);

  const handleNextQuote = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundManager.playClick();
    setCurrentQuoteIndex((prev) => (prev + 1) % SAGA_TRANSMISSIONS.length);
  };

  const toggleFullScreen = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundManager.playClick();
    setIsFullScreen((prev) => !prev);
  };

  const equippedType = connectedProfile?.equippedCompanionType || 'cat';
  const equippedCatId = connectedProfile?.equippedPetCatId || 1;
  const equippedMonsterId = connectedProfile?.equippedMonsterId || 'doux';
  const equippedFairyId = connectedProfile?.equippedFairyId || 1;
  const companionName = connectedProfile?.equippedPetName || 'Calico Guardian';

  return (
    <>
      {/* ========================================================= */}
      {/* 1. FULL SCREEN IMMERSIVE COMPANION STAGE / SANCTUARY       */}
      {/* ========================================================= */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 bg-[#06060a]/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-8 font-mono select-none animate-fadeIn overflow-hidden">
          {/* Subtle Ambient Scanlines & Radial Glow */}
          <div className="absolute inset-0 crt-scanlines opacity-15 pointer-events-none" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-nine-green/10 blur-[160px] pointer-events-none rounded-full" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-600/10 blur-[140px] pointer-events-none rounded-full" />

          {/* Full Screen Header */}
          <div className="relative z-10 flex items-center justify-between border-b border-nine-border/70 pb-4">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-nine-green animate-pulse" />
              <div>
                <div className="text-xs text-nine-green font-bold tracking-widest uppercase">
                  $NINE COMPANION SANCTUARY /// FULL SCREEN STAGE
                </div>
                <div className="text-[10px] text-zinc-400">
                  REAL-TIME 16-BIT FRAME-BY-FRAME RETRO COMPANION ENGINE
                </div>
              </div>
            </div>

            {/* View Target Switcher (Equipped Companion vs Official Mascot) */}
            <div className="hidden sm:flex items-center rounded border border-nine-border bg-black/60 p-1 text-xs">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setViewTarget('COMPANION');
                  setCompanionAction('idle');
                }}
                className={`px-3 py-1.5 rounded transition-all font-bold ${
                  viewTarget === 'COMPANION'
                    ? 'bg-nine-green text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {companionName}
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  setViewTarget('MASCOT');
                }}
                className={`px-3 py-1.5 rounded transition-all font-bold ${
                  viewTarget === 'MASCOT'
                    ? 'bg-white text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                MASCOT ($NINE CAT)
              </button>
            </div>

            {/* Controls: Minimize / Exit */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleFullScreen}
                className="flex items-center gap-1.5 rounded border border-nine-border bg-nine-surface px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:border-zinc-400 transition-all font-bold"
                title="Exit Full Screen (Esc)"
              >
                <Minimize2 className="h-4 w-4" />
                <span className="hidden sm:inline">EXIT FULL SCREEN</span>
              </button>

              <button
                onClick={() => {
                  setIsFullScreen(false);
                  setIsOpen(false);
                }}
                className="p-2 rounded border border-nine-border text-zinc-400 hover:text-white hover:border-zinc-400 transition-colors"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Full Screen Center Stage (Giant Companion Display) */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-6">
            {viewTarget === 'COMPANION' ? (
              <div className="flex flex-col items-center justify-center text-center max-w-2xl w-full">
                {/* Stage Lighting & Giant Pedestal Shadow */}
                <div className="relative flex flex-col items-center justify-center my-4">
                  <div className="absolute -bottom-6 w-72 h-14 bg-nine-green/25 blur-2xl rounded-full pointer-events-none" />
                  <div className="absolute -bottom-2 w-56 h-6 bg-black/80 rounded-full border border-nine-green/30" />

                  {/* Giant Companion Animator */}
                  <PixelCompanionAnimator
                    type={equippedType}
                    catId={equippedCatId}
                    monsterId={equippedMonsterId}
                    fairyId={equippedFairyId}
                    action={companionAction}
                    size={260}
                    interactive={true}
                  />
                </div>

                {/* Companion Meta info */}
                <div className="mt-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-nine-green/10 border border-nine-green/40 text-nine-green text-xs font-bold uppercase mb-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{companionName}</span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-zinc-300">{equippedType.toUpperCase()} COMPANION</span>
                  </div>

                  <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                    Synchronized with your identity wallet. Always standing watch over your charts and portfolio conviction.
                  </p>
                </div>

                {/* Interactive Full Action Controls */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
                  {equippedType === 'cat' && (
                    <>
                      {(['idle', 'walk', 'run', 'stretch', 'laying'] as const).map((act) => (
                        <button
                          key={act}
                          onClick={() => {
                            soundManager.playClick();
                            setCompanionAction(act);
                          }}
                          className={`px-4 py-2 text-xs rounded uppercase font-bold transition-all ${
                            companionAction === act
                              ? 'bg-nine-green text-black shadow-[0_0_15px_rgba(0,255,102,0.4)] scale-105'
                              : 'bg-zinc-900/90 text-zinc-300 hover:text-white border border-zinc-800'
                          }`}
                        >
                          {act}
                        </button>
                      ))}
                    </>
                  )}

                  {equippedType === 'monster' && (
                    <>
                      {(['idle', 'move', 'kick', 'bite', 'jump', 'dash'] as const).map((act) => (
                        <button
                          key={act}
                          onClick={() => {
                            soundManager.playClick();
                            setCompanionAction(act);
                          }}
                          className={`px-4 py-2 text-xs rounded uppercase font-bold transition-all ${
                            companionAction === act
                              ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] scale-105'
                              : 'bg-zinc-900/90 text-zinc-300 hover:text-white border border-zinc-800'
                          }`}
                        >
                          {act}
                        </button>
                      ))}
                    </>
                  )}

                  {equippedType === 'fairy' && (
                    <div className="flex items-center gap-2">
                      <span className="px-4 py-2 text-xs rounded uppercase font-bold bg-purple-950/80 border border-purple-800 text-purple-300">
                        CELESTIAL HOVER ACTIVE
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Mascot Display */
              <div className="flex flex-col items-center justify-center text-center max-w-xl">
                <div className="relative mb-6">
                  <div className="absolute -bottom-4 w-72 h-12 bg-nine-gold/20 blur-2xl rounded-full" />
                  <img
                    src="/assets/mascot/mascot_stool.webp"
                    alt="Mascot On Stool"
                    className="h-72 w-auto object-contain drop-shadow-[0_0_25px_rgba(0,255,102,0.3)] cursor-pointer hover:scale-105 transition-transform"
                    onClick={handleNextQuote}
                    title="Click mascot for next transmission!"
                  />
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-500/40 text-nine-gold text-xs font-bold uppercase mb-2">
                  <span>THE SOVEREIGN MASCOT OF COMEBACKS</span>
                </div>
                <p className="text-xs text-zinc-400 max-w-md leading-relaxed">
                  The original sentinel of the GameStop financial uprising. 9 Lives. One More Comeback.
                </p>
              </div>
            )}
          </div>

          {/* Full Screen Bottom Transmission Banner */}
          <div className="relative z-10 border-t border-nine-border/70 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left w-full sm:w-auto">
              <div className="p-2 rounded bg-nine-green/10 text-nine-green border border-nine-green/30 shrink-0">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
                  $NINE SAGA TRANSMISSION
                </div>
                <div className="text-sm font-bold text-white italic">
                  "{SAGA_TRANSMISSIONS[currentQuoteIndex]}"
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
              <button
                onClick={handleNextQuote}
                className="flex items-center justify-center gap-2 rounded bg-nine-green px-4 py-2 font-black text-black hover:bg-emerald-400 transition-all text-xs"
              >
                <span>NEXT LORE TRANSMISSION</span>
              </button>

              <button
                onClick={() => {
                  setIsFullScreen(false);
                  setActiveTab('ARCADE');
                }}
                className="flex items-center justify-center gap-2 rounded border border-nine-borderHighlight bg-nine-surface px-4 py-2 font-bold text-white hover:border-nine-green hover:text-nine-green transition-all text-xs"
              >
                <Sparkles className="h-3.5 w-3.5 text-nine-gold" />
                <span>OPEN ARCADE ARMORY</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. FLOATING ASIDE WIDGET / COMMAND WATCH DOCK             */}
      {/* ========================================================= */}
      <aside aria-label="Mascot Companion" className="fixed bottom-16 md:bottom-6 right-4 z-40 font-mono">
        {isOpen && !isFullScreen ? (
          <div className="relative w-88 sm:w-96 rounded-xl border border-nine-green/60 bg-[#08080d]/95 backdrop-blur-md p-4 shadow-[0_0_30px_rgba(0,255,102,0.2)] animate-fadeIn">
            {/* Subtle Scanlines */}
            <div className="absolute inset-0 crt-scanlines opacity-15 pointer-events-none rounded-xl" />

            {/* Widget Header */}
            <div className="flex items-center justify-between border-b border-nine-border/70 pb-2.5 mb-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-nine-green animate-pulse" />
                <span className="font-bold text-white tracking-wider text-[11px]">
                  $NINE COMPANION WATCH
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Full Screen Expand Button */}
                <button
                  onClick={toggleFullScreen}
                  className="p-1 rounded text-zinc-400 hover:text-nine-green hover:bg-zinc-800 transition-colors"
                  title="Open Full Screen Stage"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Target Switcher in Widget: Equipped Companion vs Mascot */}
            <div className="flex items-center justify-between mb-2 text-[10px]">
              <div className="flex items-center gap-1 rounded bg-black/60 p-0.5 border border-zinc-800">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setViewTarget('COMPANION');
                  }}
                  className={`px-2 py-0.5 rounded font-bold transition-all ${
                    viewTarget === 'COMPANION'
                      ? 'bg-nine-green text-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  COMPANION
                </button>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setViewTarget('MASCOT');
                  }}
                  className={`px-2 py-0.5 rounded font-bold transition-all ${
                    viewTarget === 'MASCOT'
                      ? 'bg-zinc-700 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  MASCOT
                </button>
              </div>

              <span className="text-zinc-500 font-bold uppercase truncate max-w-[150px]">
                {viewTarget === 'COMPANION' ? companionName : 'ROARING CAT'}
              </span>
            </div>

            {/* Main Stage in Widget */}
            <div className="relative flex flex-col items-center justify-center p-3 mb-3 bg-black/60 rounded-lg border border-nine-border/80 overflow-hidden min-h-[160px]">
              {viewTarget === 'COMPANION' ? (
                /* The Equipped Companion fills the stage! */
                <div className="relative flex flex-col items-center justify-center w-full">
                  {/* Pedestal shadow */}
                  <div className="absolute bottom-2 w-32 h-4 bg-nine-green/20 blur-sm rounded-full" />

                  <PixelCompanionAnimator
                    type={equippedType}
                    catId={equippedCatId}
                    monsterId={equippedMonsterId}
                    fairyId={equippedFairyId}
                    action={companionAction}
                    size={110}
                    interactive={true}
                  />

                  {/* Micro Action Buttons on stage */}
                  <div className="mt-2 flex items-center justify-center gap-1">
                    {equippedType === 'cat' && (
                      <>
                        {(['idle', 'walk', 'run', 'stretch'] as const).map((act) => (
                          <button
                            key={act}
                            onClick={() => {
                              soundManager.playClick();
                              setCompanionAction(act);
                            }}
                            className={`px-1.5 py-0.5 text-[8px] rounded uppercase font-bold transition-all ${
                              companionAction === act
                                ? 'bg-nine-green text-black'
                                : 'bg-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {act}
                          </button>
                        ))}
                      </>
                    )}

                    {equippedType === 'monster' && (
                      <>
                        {(['idle', 'move', 'kick', 'bite'] as const).map((act) => (
                          <button
                            key={act}
                            onClick={() => {
                              soundManager.playClick();
                              setCompanionAction(act);
                            }}
                            className={`px-1.5 py-0.5 text-[8px] rounded uppercase font-bold transition-all ${
                              companionAction === act
                                ? 'bg-red-500 text-white'
                                : 'bg-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {act}
                          </button>
                        ))}
                      </>
                    )}

                    {equippedType === 'fairy' && (
                      <span className="text-[8px] font-bold text-purple-300 uppercase px-2 py-0.5 bg-purple-950/60 rounded border border-purple-800/40">
                        CELESTIAL HOVER
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                /* Mascot View */
                <img
                  src="/assets/mascot/mascot_stool.webp"
                  alt="Mascot Perched"
                  className="h-32 w-auto object-contain cursor-pointer hover:scale-105 transition-transform duration-200"
                  onClick={handleNextQuote}
                  title="Click cat for next transmission!"
                />
              )}
            </div>

            {/* Speech Bubble */}
            <div className="rounded border border-nine-border bg-nine-surface/90 p-2.5 mb-3 relative">
              <p className="text-xs text-zinc-200 leading-relaxed italic">
                "{SAGA_TRANSMISSIONS[currentQuoteIndex]}"
              </p>
            </div>

            {/* Action Row */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                onClick={handleNextQuote}
                className="flex items-center justify-center gap-1 rounded bg-nine-green px-2 py-1.5 font-black text-black hover:bg-emerald-400 transition-all text-[10px]"
              >
                <MessageCircle className="h-3 w-3" />
                <span>LORE</span>
              </button>

              <button
                onClick={toggleFullScreen}
                className="flex items-center justify-center gap-1 rounded border border-nine-borderHighlight bg-nine-elevated px-2 py-1.5 font-bold text-nine-green hover:bg-nine-green hover:text-black transition-all text-[10px]"
                title="Full Screen Companion Stage"
              >
                <Maximize2 className="h-3 w-3" />
                <span>FULL STAGE</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('ARCADE');
                  setIsOpen(false);
                }}
                className="flex items-center justify-center gap-1 rounded border border-nine-borderHighlight bg-nine-surface px-2 py-1.5 font-bold text-white hover:border-nine-gold hover:text-nine-gold transition-all text-[10px]"
              >
                <Sparkles className="h-3 w-3 text-nine-gold" />
                <span>ARCADE</span>
              </button>
            </div>
          </div>
        ) : !isFullScreen ? (
          /* ── COMPANION LAUNCHER PILL ── */
          <button
            onClick={() => {
              soundManager.playClick();
              setIsOpen(true);
            }}
            className="group flex items-center gap-2 rounded-full border border-nine-green/60 bg-[#08080d]/95 backdrop-blur-md pl-1 pr-3 py-1 shadow-[0_0_16px_rgba(0,255,102,0.2)] hover:border-nine-green hover:shadow-[0_0_22px_rgba(0,255,102,0.35)] transition-all"
            title="Open Companion Panel"
          >
            {/* Sprite circle */}
            <div className="relative h-8 w-8 rounded-full overflow-hidden border border-nine-green/70 bg-zinc-950 flex items-center justify-center shrink-0">
              {connectedProfile?.equippedPet ? (
                <PixelCompanionAnimator
                  type={equippedType}
                  catId={equippedCatId}
                  monsterId={equippedMonsterId}
                  fairyId={equippedFairyId}
                  action="idle"
                  size={30}
                  interactive={false}
                />
              ) : (
                <img
                  src="/assets/mascot/mascot_head_favicon.webp"
                  alt="Cat"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            {/* Name */}
            <span className="font-black text-[10px] text-nine-green tracking-wide">
              {connectedProfile?.equippedPetName || '$NINE COMPANION'}
            </span>
            {/* Live dot */}
            <span className="h-2 w-2 rounded-full bg-nine-green animate-pulse shrink-0" />
          </button>
        ) : null}
      </aside>
    </>
  );
}
