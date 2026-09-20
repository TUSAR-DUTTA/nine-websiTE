'use client';

import React, { useState } from 'react';
import { GME_SAGA_CHAPTERS } from '@/lib/data';
import { GmeSagaChapter } from '@/types';
import { useNine } from '@/context/NineContext';
import { soundManager } from '@/lib/sound';
import {
  BookOpen,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  Flame,
  Zap,
  Quote,
  Clock,
  ArrowRight,
  ExternalLink,
  Lock,
  X,
  Radio,
} from 'lucide-react';

export function GmeSagaSection() {
  const [selectedChapter, setSelectedChapter] = useState<GmeSagaChapter>(GME_SAGA_CHAPTERS[0]);
  const [modalChapter, setModalChapter] = useState<GmeSagaChapter | null>(null);

  const handleSelectChapter = (ch: GmeSagaChapter) => {
    soundManager.playClick();
    setSelectedChapter(ch);
  };

  return (
    <section id="gme-saga" className="relative w-full bg-[#0a0a0d] py-10 font-mono">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="border-b border-nine-border pb-6 mb-8">
          <div className="inline-flex items-center gap-2 text-xs text-nine-gold uppercase tracking-widest mb-1 font-bold">
            <BookOpen className="h-4 w-4" />
            <span>THE REAL HISTORIC INSPIRATION BEHIND $NINE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            THE GME CHRONICLE: THE FALL & THE UPRISING
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-3xl leading-relaxed">
            $NINE does not assume or manufacture fake crashes for our token.
            Instead, $NINE is the on-chain cultural monument to the real GameStop ($GME) financial saga.
            Like a cat with nine lives, Wall Street tried to kill GameStop over and over — yet retail conviction refused to die.
          </p>
        </div>

        {/* 6 Saga Milestones Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {GME_SAGA_CHAPTERS.map((ch) => {
            const isSelected = selectedChapter.id === ch.id;
            return (
              <div
                key={ch.id}
                onClick={() => handleSelectChapter(ch)}
                className={`cursor-pointer rounded border p-3.5 transition-all select-none flex flex-col justify-between ${
                  isSelected
                    ? 'border-nine-green bg-nine-surface shadow-[0_0_15px_rgba(0,255,102,0.15)] ring-1 ring-nine-green'
                    : 'border-nine-border bg-nine-surface/60 hover:border-zinc-500 hover:bg-nine-elevated'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-black text-nine-gold">0{ch.chapterNumber}</span>
                    <span className="text-[10px] text-zinc-500">{ch.timeframe.split('–')[0].trim()}</span>
                  </div>
                  <div className="text-xs font-bold text-white line-clamp-2 leading-snug">
                    {ch.title}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-nine-border/60 text-[10px] text-nine-green font-bold truncate">
                  {ch.stockMovement.split('(')[0]}
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Chapter Detailed Command Dossier */}
        <div className="rounded border border-nine-border bg-nine-surface overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-nine-border bg-nine-elevated p-5 px-6">
            <div>
              <div className="text-[11px] text-nine-green font-bold uppercase tracking-wider">
                CHAPTER 0{selectedChapter.chapterNumber} /// {selectedChapter.timeframe}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                {selectedChapter.title}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">{selectedChapter.subtitle}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-nine-gold font-bold px-3 py-1 rounded bg-amber-950/40 border border-amber-500/30">
                GME STOCK: {selectedChapter.stockMovement}
              </span>
            </div>
          </div>

          {/* Body: Two Pillars: THE FALL vs THE UPRISING */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* The Fall Box */}
            <div className="lg:col-span-6 rounded border border-nine-redDark/60 bg-nine-redDark/10 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-nine-red uppercase mb-3">
                  <TrendingDown className="h-4 w-4" />
                  <span>THE INSTITUTIONAL FALL & ATTACK</span>
                </div>
                <h4 className="text-sm font-bold text-white mb-2">
                  {selectedChapter.fallEvent}
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                  <strong className="text-zinc-400">Wall Street Action:</strong> {selectedChapter.wallStreetAction}
                </p>
              </div>

              <div className="pt-3 border-t border-nine-red/20 text-[11px] text-nine-red font-bold">
                RESULT: PREDATORY SHORTING ATTEMPT
              </div>
            </div>

            {/* The Uprising Box */}
            <div className="lg:col-span-6 rounded border border-nine-green/40 bg-nine-greenMuted/20 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-nine-green uppercase mb-3">
                  <TrendingUp className="h-4 w-4" />
                  <span>THE RETAIL UPRISING & COMEBACK</span>
                </div>
                <h4 className="text-sm font-bold text-white mb-2">
                  {selectedChapter.uprisingEvent}
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                  <strong className="text-zinc-400">Retail Response:</strong> {selectedChapter.retailResponse}
                </p>
              </div>

              <div className="pt-3 border-t border-nine-green/30 text-[11px] text-nine-green font-bold">
                RESULT: IMMORTAL RESILIENCE
              </div>
            </div>

            {/* The Lore Lesson & Famous Quote Banner */}
            <div className="lg:col-span-12 rounded border border-nine-border bg-black/60 p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">
                    WHY $NINE EMBODIES THIS EVENT:
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                    {selectedChapter.loreLesson}
                  </div>
                </div>

                <div className="border-t md:border-t-0 md:border-l border-zinc-800 pt-4 md:pt-0 md:pl-6 shrink-0 max-w-sm">
                  <div className="flex items-start gap-2">
                    <Quote className="h-4 w-4 text-nine-gold shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs text-nine-gold italic font-bold">
                        {selectedChapter.quote}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-1">
                        — {selectedChapter.quoteAuthor}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Strip */}
          <div className="border-t border-nine-border bg-nine-elevated p-3 px-6 flex items-center justify-between text-xs">
            <span className="text-zinc-500">
              6 CHAPTERS OF VERIFIED HISTORICAL SAGA
            </span>
            <button
              onClick={() => {
                soundManager.playClick();
                setModalChapter(selectedChapter);
              }}
              className="text-nine-green hover:underline font-bold flex items-center gap-1"
            >
              <span>EXPAND HISTORICAL ANALYSIS</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Detailed Modal Popup */}
        {modalChapter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
            <div className="relative w-full max-w-2xl rounded border border-nine-border bg-nine-surface p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-nine-border pb-3 mb-4">
                <div className="text-xs font-bold text-nine-gold uppercase">
                  HISTORICAL DOSSIER /// CHAPTER 0{modalChapter.chapterNumber}
                </div>
                <button
                  onClick={() => setModalChapter(null)}
                  className="text-zinc-500 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <h3 className="text-xl font-black text-white">{modalChapter.title}</h3>
              <p className="text-xs text-zinc-400 mt-1">{modalChapter.subtitle} • {modalChapter.timeframe}</p>

              <div className="mt-5 space-y-4 text-xs text-zinc-300 leading-relaxed border-y border-nine-border py-4">
                <div>
                  <strong className="text-nine-red block mb-1">THE INSTITUTIONAL FALL:</strong>
                  <p>{modalChapter.fallEvent}</p>
                  <p className="text-zinc-400 mt-1">{modalChapter.wallStreetAction}</p>
                </div>

                <div>
                  <strong className="text-nine-green block mb-1">THE RETAIL UPRISING:</strong>
                  <p>{modalChapter.uprisingEvent}</p>
                  <p className="text-zinc-400 mt-1">{modalChapter.retailResponse}</p>
                </div>

                <div className="rounded bg-black/50 p-3 border border-nine-border text-nine-gold font-bold">
                  {modalChapter.quote}
                  <div className="text-[10px] text-zinc-400 font-normal mt-1">— {modalChapter.quoteAuthor}</div>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => setModalChapter(null)}
                  className="rounded bg-white px-4 py-1.5 text-xs font-bold text-black hover:bg-zinc-200"
                >
                  CLOSE DOSSIER
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
