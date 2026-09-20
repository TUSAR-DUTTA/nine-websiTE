import React from 'react';
import { MascotProjectile } from './components/MascotProjectile';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { QuickLore } from './components/QuickLore';
import { NineLives } from './components/NineLives';
import { ComebackVisual } from './components/ComebackVisual';
import { GmeArchive } from './components/GmeArchive';
import { DeadAgainInteractive } from './components/DeadAgainInteractive';
import { MemeVault } from './components/MemeVault';
import { TokenSection } from './components/TokenSection';
import { Disclaimer } from './components/Disclaimer';
import { Footer } from './components/Footer';
import { GlassBreakTransition } from './components/GlassBreakTransition';

export default function App() {
  return (
    <div className="relative min-h-screen bg-[#08080a] text-white flex flex-col selection:bg-[#ff6b9d] selection:text-black overflow-x-hidden">
      {/* Glass Break Transition Overlay (listens for nine:break-glass event) */}
      <GlassBreakTransition />

      {/* Periodic Arcade Cat Projectile Layer */}
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
}
