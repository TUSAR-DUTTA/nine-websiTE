'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';
import { useNine } from '@/context/NineContext';

export default function AdminPage() {
  const { setAdminModalOpen } = useNine();

  React.useEffect(() => {
    setAdminModalOpen(true);
  }, [setAdminModalOpen]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 font-mono text-center">
      <div className="h-14 w-14 rounded border border-nine-gold bg-amber-950/40 text-nine-gold flex items-center justify-center mb-4">
        <Shield className="h-7 w-7" />
      </div>
      <h1 className="text-2xl font-black text-white">ADMIN COMMAND PROTOCOL</h1>
      <p className="text-xs text-zinc-400 mt-2 max-w-md">
        The admin command modal has been initialized. If it did not open automatically, click below.
      </p>

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => setAdminModalOpen(true)}
          className="rounded bg-nine-gold px-4 py-2 text-xs font-bold text-black hover:bg-yellow-400 transition-colors"
        >
          OPEN ADMIN MODAL
        </button>

        <Link
          href="/"
          className="rounded border border-nine-border bg-nine-surface px-4 py-2 text-xs font-bold text-white hover:border-zinc-400 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>RETURN TO TERMINAL</span>
        </Link>
      </div>
    </div>
  );
}
