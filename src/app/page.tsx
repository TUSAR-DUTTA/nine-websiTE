'use client';

import React from 'react';
import { useNine } from '@/context/NineContext';
import { HeroSection } from '@/components/hero/HeroSection';
import { LiveTerminalSection } from '@/components/terminal/LiveTerminalSection';
import { FumbleBoardSection } from '@/components/fumbles/FumbleBoardSection';
import { BagWorkersSection } from '@/components/social/BagWorkersSection';
import { NineWallSection } from '@/components/social/NineWallSection';
import { NinePulseSection } from '@/components/pulse/NinePulseSection';
import { NineArcadeSection } from '@/components/arcade/NineArcadeSection';
import { GmeSagaSection } from '@/components/saga/GmeSagaSection';

export default function HomePage() {
  const { activeTab } = useNine();

  return (
    <div className="flex flex-col w-full min-h-[85vh]">
      {/* TAB 1: TERMINAL (Overview & Command Center) */}
      {activeTab === 'TERMINAL' && (
        <div className="flex flex-col w-full animate-fadeIn">
          <HeroSection />
          <GmeSagaSection />
          <NinePulseSection />
          <LiveTerminalSection />
        </div>
      )}

      {/* HISTORIC GME SAGA VIEW */}
      {activeTab === 'GME_SAGA' && (
        <div className="flex flex-col w-full animate-fadeIn">
          <GmeSagaSection />
        </div>
      )}

      {/* TAB 2: FUMBLES (The Fumble Board) */}
      {activeTab === 'FUMBLES' && (
        <div className="flex flex-col w-full animate-fadeIn">
          <FumbleBoardSection />
        </div>
      )}

      {/* TAB 3: BAG WORKERS (Live Social Tracking Leaderboard on Supabase) */}
      {activeTab === 'BAGS' && (
        <div className="flex flex-col w-full animate-fadeIn">
          <BagWorkersSection />
        </div>
      )}

      {/* TAB 4: WALL (Community Memes & Graffiti) */}
      {activeTab === 'WALL' && (
        <div className="flex flex-col w-full animate-fadeIn">
          <NineWallSection />
        </div>
      )}

      {/* TAB 5: ARCADE (Digital Identity Marketplace) */}
      {activeTab === 'ARCADE' && (
        <div className="flex flex-col w-full animate-fadeIn">
          <NineArcadeSection />
        </div>
      )}
    </div>
  );
}
