'use client';

import React from 'react';
import { useNine } from '@/context/NineContext';
import { TabType } from '@/types';
import { Terminal, BookOpen, Flame, Trophy, User } from 'lucide-react';

export function MobileNav() {
  const { activeTab, setActiveTab, setViewLayer, isConnected, connectedProfile, openProfileModal, setWalletModalOpen } = useNine();

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'TERMINAL', label: 'TERMINAL', icon: <Terminal className="h-4 w-4" /> },
    { id: 'FUMBLES', label: 'FUMBLES', icon: <Flame className="h-4 w-4 text-nine-red" /> },
    { id: 'BAGS', label: 'WORKERS', icon: <Trophy className="h-4 w-4 text-nine-gold" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-40 flex h-14 w-full items-center justify-around border-t border-nine-border bg-nine-bg/95 backdrop-blur-lg px-2 md:hidden font-mono">
      <button
        onClick={() => setViewLayer('LANDING')}
        className="flex flex-col items-center justify-center gap-1 text-[9px] text-[#ffb703] font-bold"
        title="Landing Page"
      >
        <span className="text-xs">🐱</span>
        <span>LOBBY</span>
      </button>

      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center gap-1 text-[9px] transition-colors ${
              isActive ? 'text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        );
      })}

      <button
        onClick={() => {
          if (isConnected && connectedProfile) {
            openProfileModal(connectedProfile);
          } else {
            setWalletModalOpen(true);
          }
        }}
        className="flex flex-col items-center justify-center gap-1 text-[9px] text-nine-green font-bold"
      >
        <User className="h-4 w-4" />
        <span>{isConnected ? 'PROFILE' : 'WALLET'}</span>
      </button>
    </nav>
  );
}
