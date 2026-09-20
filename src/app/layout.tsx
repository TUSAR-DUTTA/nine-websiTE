import type { Metadata } from 'next';
import './globals.css';
import { NineProvider } from '@/context/NineContext';
import { AppContent } from '@/components/layout/AppContent';

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
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bungee&family=JetBrains+Mono:ital,wght@0,400;0,700;0,800;1,700&family=Space+Grotesk:wght@400;500;600;700&family=Titan+One&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#08080a] text-nine-text antialiased selection:bg-[#ff6b9d] selection:text-black">
        <NineProvider>
          {/* Subtle CRT Scanline overlay across the screen */}
          <div className="fixed inset-0 crt-scanlines opacity-25 pointer-events-none z-50" />

          {/* Unified Multi-Layer App Content (Landing Layer -> Glass Break -> Terminal Layer) */}
          <AppContent>{children}</AppContent>
        </NineProvider>
      </body>
    </html>
  );
}
