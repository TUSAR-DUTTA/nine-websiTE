'use client';

import React from 'react';
import { useNine } from '@/context/NineContext';
import { LandingPage } from '@/components/landing/LandingPage';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { ProfileSlideOver } from '@/components/profile/ProfileSlideOver';
import { WalletConnectModal } from '@/components/wallet/WalletConnectModal';
import { AdminDashboardModal } from '@/components/admin/AdminDashboardModal';
import { FumbleExplainerModal } from '@/components/modals/FumbleExplainerModal';
import { BagWorkerExplainerModal } from '@/components/modals/BagWorkerExplainerModal';
import { FloatingMascotCompanion } from '@/components/layout/FloatingMascotCompanion';

export function AppContent({ children }: { children: React.ReactNode }) {
  const { viewLayer, setViewLayer } = useNine();

  if (viewLayer === 'LANDING') {
    return (
      <div className="relative min-h-screen w-full">
        {/* The First Layer: Landing / Front Page */}
        <LandingPage onEnterTerminal={() => setViewLayer('TERMINAL')} />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col animate-fadeIn">
      {/* The Second Layer: Community Terminal */}
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileNav />

      {/* Terminal Modals & Companions */}
      <ProfileSlideOver />
      <WalletConnectModal />
      <AdminDashboardModal />
      <FumbleExplainerModal />
      <BagWorkerExplainerModal />
      <FloatingMascotCompanion />
    </div>
  );
}
