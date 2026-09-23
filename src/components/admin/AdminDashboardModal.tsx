'use client';

import React, { useState } from 'react';
import { useNine } from '@/context/NineContext';
import { soundManager } from '@/lib/sound';
import {
  Shield,
  X,
  Check,
  AlertTriangle,
  Server,
  Activity,
  Plus,
  Radio,
  Sliders,
  Flame,
} from 'lucide-react';

export function AdminDashboardModal() {
  const { isAdminModalOpen, setAdminModalOpen } = useNine();
  const [activeTab, setActiveTab] = useState<'HEALTH' | 'CHAPTERS' | 'ALERT'>('HEALTH');
  const [alertBroadcastText, setAlertBroadcastText] = useState('THE CAT IS MOVING: LIFE 04 BREAKOUT IN PROGRESS');
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [streamSpeed, setStreamSpeed] = useState('NORMAL');

  if (!isAdminModalOpen) return null;

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playComebackChime();
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-mono">
      <div className="relative w-full max-w-3xl rounded border border-nine-border bg-nine-surface p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-nine-border pb-4 mb-6">
          <div className="flex items-center gap-2 text-xs text-nine-gold font-bold uppercase">
            <Shield className="h-4 w-4" />
            <span>NINE COMMAND PROTOCOL /// ADMIN GATEWAY</span>
          </div>

          <button
            onClick={() => setAdminModalOpen(false)}
            className="text-zinc-500 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-nine-border pb-3 mb-6 text-xs">
          {(['HEALTH', 'CHAPTERS', 'ALERT'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                soundManager.playClick();
                setActiveTab(tab);
              }}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === tab
                  ? 'bg-nine-gold text-black font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* TAB 1: SYSTEM HEALTH */}
        {activeTab === 'HEALTH' && (
          <div className="space-y-5 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded border border-nine-border bg-black/40 p-3">
                <div className="text-[10px] text-zinc-500 uppercase">RPC LATENCY</div>
                <div className="text-nine-green font-bold text-base mt-0.5">14ms</div>
                <div className="text-[10px] text-zinc-400">Node cluster nominal</div>
              </div>
              <div className="rounded border border-nine-border bg-black/40 p-3">
                <div className="text-[10px] text-zinc-500 uppercase">BLOCK HEIGHT</div>
                <div className="text-white font-bold text-base mt-0.5">#20,918,241</div>
                <div className="text-[10px] text-zinc-400">Sync: 100%</div>
              </div>
              <div className="rounded border border-nine-border bg-black/40 p-3">
                <div className="text-[10px] text-zinc-500 uppercase">ACTIVE SOCKETS</div>
                <div className="text-white font-bold text-base mt-0.5">1,842 peers</div>
                <div className="text-[10px] text-nine-green">Stream healthy</div>
              </div>
              <div className="rounded border border-nine-border bg-black/40 p-3">
                <div className="text-[10px] text-zinc-500 uppercase">MEMORY FOOTPRINT</div>
                <div className="text-white font-bold text-base mt-0.5">48.2 MB</div>
                <div className="text-[10px] text-zinc-400">Lightweight load</div>
              </div>
            </div>

            <div className="rounded border border-nine-border bg-nine-bg p-4 space-y-3">
              <div className="text-xs text-white font-bold flex items-center justify-between">
                <span>SIMULATED STREAM TRAFFIC SPEED</span>
                <span className="text-nine-gold font-bold">{streamSpeed}</span>
              </div>
              <div className="flex gap-2">
                {(['SLOW', 'NORMAL', 'HYPER-SPEED'] as const).map((spd) => (
                  <button
                    key={spd}
                    onClick={() => {
                      soundManager.playClick();
                      setStreamSpeed(spd);
                    }}
                    className={`flex-1 py-1.5 rounded border text-xs ${
                      streamSpeed === spd
                        ? 'border-nine-green bg-nine-greenMuted text-nine-green font-bold'
                        : 'border-nine-border bg-nine-surface text-zinc-400'
                    }`}
                  >
                    {spd}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CHAPTERS LORE */}
        {activeTab === 'CHAPTERS' && (
          <div className="space-y-4 text-xs">
            <div className="rounded border border-nine-border bg-nine-bg p-4">
              <div className="text-xs font-bold text-white mb-2">CHAPTER TRIGGER STATUS</div>
              <p className="text-zinc-400 mb-3">
                Chapters 01, 02, and 03 are archived permanently. Chapter 04 is currently active.
                To simulate unlocking Life 05, broadcast a resilience event below.
              </p>
              <button
                onClick={() => {
                  soundManager.playComebackChime();
                  alert('Simulated Chapter 05 event trigger dispatched to network.');
                }}
                className="rounded border border-nine-gold bg-amber-950/40 px-3 py-1.5 text-nine-gold font-bold hover:bg-amber-900/60 transition-colors"
              >
                TEST SIMULATE LIFE 05 UNLOCK EVENT
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: ALERT BROADCAST */}
        {activeTab === 'ALERT' && (
          <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
            <div className="text-xs font-bold text-white">EMERGENCY NETWORK TRANSMISSION</div>
            <p className="text-zinc-400">
              Broadcast high-priority ticker alerts directly to all connected terminal observers.
            </p>

            <input
              type="text"
              value={alertBroadcastText}
              onChange={(e) => setAlertBroadcastText(e.target.value)}
              className="w-full rounded border border-nine-border bg-black/60 p-3 text-xs text-white focus:outline-none focus:border-nine-gold"
            />

            {broadcastSent && (
              <div className="rounded bg-nine-greenMuted p-2 text-nine-green font-bold flex items-center gap-1.5">
                <Check className="h-4 w-4" />
                <span>Alert broadcast successfully pushed to active feeds!</span>
              </div>
            )}

            <button
              type="submit"
              className="rounded bg-nine-gold px-4 py-2 font-bold text-black hover:bg-yellow-400 transition-colors"
            >
              DISPATCH TRANSMISSION
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-nine-border flex justify-end">
          <button
            onClick={() => setAdminModalOpen(false)}
            className="rounded bg-white px-4 py-1.5 text-xs font-bold text-black hover:bg-zinc-200"
          >
            EXIT GATEWAY
          </button>
        </div>
      </div>
    </div>
  );
}
