import type { Metadata } from 'next';
import './globals.css';
import { NineProvider } from '@/context/NineContext';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { Footer } from '@/components/layout/Footer';
import { ProfileSlideOver } from '@/components/profile/ProfileSlideOver';
import { WalletConnectModal } from '@/components/wallet/WalletConnectModal';
import { AdminDashboardModal } from '@/components/admin/AdminDashboardModal';
import { FumbleExplainerModal } from '@/components/modals/FumbleExplainerModal';
import { BagWorkerExplainerModal } from '@/components/modals/BagWorkerExplainerModal';
import { FloatingMascotCompanion } from '@/components/layout/FloatingMascotCompanion';

export const metadata: Metadata = {
  title: '$NINE | 9 Lives. One More Comeback. ($NINE × $GME)',
  description:
    'Every cat has nine lives. But some cats just refuse to stay dead. The decentralized terminal for comeback believers, bag holders, CT addicts, and meme historians.',
  keywords: [
    'NINE',
    'GME',
    'Memecoin',
    'Comeback',
    'Crypto Terminal',
    'Nine Lives',
    'Fumble Board',
    'Bag Workers',
  ],
  openGraph: {
    title: '$NINE | 9 Lives. One More Comeback.',
    description: 'Crashes are chapters, not epilogues. 9 Lives. One More Comeback.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-nine-bg text-nine-text antialiased selection:bg-nine-green selection:text-black">
        <NineProvider>
          {/* Subtle CRT Scanline overlay across the screen */}
          <div className="fixed inset-0 crt-scanlines opacity-25 pointer-events-none z-50" />
          
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <MobileNav />
          </div>

          {/* Interactive Modals & Slide-overs */}
          <ProfileSlideOver />
          <WalletConnectModal />
          <AdminDashboardModal />
          <FumbleExplainerModal />
          <BagWorkerExplainerModal />
          <FloatingMascotCompanion />
        </NineProvider>
      </body>
    </html>
  );
}
