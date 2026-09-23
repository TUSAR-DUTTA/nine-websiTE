'use client';

import React from 'react';
import { MascotProjectile } from './MascotProjectile';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { QuickLore } from './QuickLore';
import { NineLives } from './NineLives';
import { ComebackVisual } from './ComebackVisual';
import { GmeArchive } from './GmeArchive';
import { DeadAgainInteractive } from './DeadAgainInteractive';
import { MemeVault } from './MemeVault';
import { TokenSection } from './TokenSection';
import { Disclaimer } from './Disclaimer';
import { Footer } from './Footer';
import { GlassBreakTransition } from './GlassBreakTransition';

interface LandingPageProps {
  onEnterTerminal?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterTerminal }) => {
  return (
    <div
      id="landing-layer-root"
      className="relative min-h-screen bg-[#08080a] text-white flex flex-col selection:bg-[#ff6b9d] selection:text-black overflow-x-hidden"
    >
      {/* Glass Break Transition Overlay (listens for nine:break-glass event) */}
      <GlassBreakTransition onComplete={onEnterTerminal} />

      {/* Periodic Mascot Cat Projectile Layer */}
      <MascotProjectile />

      {/* Sticky Navbar & Ticker */}
      <Navbar />

      {/* Page Content Flow */}
      <main className="flex-1">
        {/* 1. Hero Section */}
        <Hero />

        {/* 2. Quick Lore (5-Second Degen Explainer) */}
        <QuickLore />

        {/* 3. Interactive Nine Lives Comic Chronicle */}
        <NineLives />

        {/* 4. The Fall -> Void -> Comeback Transformation */}
        <ComebackVisual />

        {/* 5. GME Historical News Billboard (Reuters / Sourced) */}
        <GmeArchive />

        {/* 6. "Count Me Out" Interactive Survival Moment */}
        <DeadAgainInteractive />

        {/* 7. The NINE Meme Vault */}
        <MemeVault />

        {/* 8. Tokenomics, Contract & How To Buy */}
        <TokenSection />

        {/* 9. Cultural & Legal Disclaimer */}
        <Disclaimer />
      </main>

      {/* 10. Footer Hero */}
      <Footer />
    </div>
  );
};
