'use client';

import React from 'react';
import { useNine } from '@/context/NineContext';
import { soundManager } from '@/lib/sound';
import {
  Wallet,
  X,
  ShieldCheck,
  Zap,
  ArrowRight,
  Flame,
  Radio,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { ROBINHOOD_CONFIG, BURN_ADDRESS } from '@/lib/onchain';

export function WalletConnectModal() {
  const {
    isWalletModalOpen,
    setWalletModalOpen,
    connectWallet,
    connectWeb3Wallet,
    isConnected,
    disconnectWallet,
    isWeb3Connecting,
    web3Error,
  } = useNine();

  if (!isWalletModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono animate-fadeIn">
      {/* Click backdrop to close */}
      <div className="absolute inset-0" onClick={() => setWalletModalOpen(false)} />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-nine-borderHighlight bg-[#0b0c10] p-6 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-[60px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 blur-[60px] pointer-events-none rounded-full" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-nine-border pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight">COMMAND WALLET ACCESS</h3>
              <div className="text-[10px] text-zinc-400">ROBINHOOD CHAIN MAINNET (4663)</div>
            </div>
          </div>

          <button
            onClick={() => setWalletModalOpen(false)}
            className="p-1.5 rounded-lg border border-zinc-700 bg-zinc-900/60 text-zinc-400 hover:text-white hover:border-zinc-500 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Wallet Connection Error Banner */}
        {web3Error && (
          <div className="mb-4 rounded-xl border border-red-500/50 bg-red-950/40 p-3 text-xs text-red-300 flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-red-200">Connection Failed</div>
              <div className="text-[11px] leading-relaxed text-red-300/90">{web3Error}</div>
            </div>
          </div>
        )}

        {/* Primary Action: Real Web3 Injected Wallet */}
        <div className="space-y-3 mb-5">
          <button
            onClick={connectWeb3Wallet}
            disabled={isWeb3Connecting}
            className="group w-full flex items-center justify-between p-4 rounded-xl border border-emerald-500/60 bg-gradient-to-r from-emerald-950/60 via-[#0d1811] to-emerald-950/40 hover:border-emerald-400 hover:bg-emerald-950/80 transition-all shadow-md text-left disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                {isWeb3Connecting ? (
                  <RefreshCw className="h-5 w-5 text-emerald-400 animate-spin" />
                ) : (
                  <Zap className="h-5 w-5 text-emerald-400" />
                )}
              </div>
              <div>
                <div className="text-sm font-black text-white group-hover:text-emerald-300 flex items-center gap-2">
                  <span>METAMASK / RABBY / ROBINHOOD</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                    RECOMMENDED
                  </span>
                </div>
                <div className="text-xs text-zinc-400 mt-0.5">
                  Connect & auto-switch to Robinhood Chain Mainnet (4663)
                </div>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Secondary Action: Guest Read-Only Explorer */}
          <button
            onClick={() => connectWallet()}
            className="group w-full flex items-center justify-between p-3.5 rounded-xl border border-nine-border bg-black/40 hover:border-nine-gold hover:bg-black/60 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0">
                <Radio className="h-4 w-4 text-nine-gold" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-nine-gold transition-colors">
                  EXPLORE AS GUEST (READ-ONLY)
                </div>
                <div className="text-[10px] text-zinc-500">
                  Read-only observer mode without needing browser extension
                </div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-nine-gold group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>

        {/* Network & Burn Spec Banner */}
        <div className="rounded-xl border border-nine-border/80 bg-black/60 p-3.5 text-[11px] text-zinc-400 space-y-2 mb-6">
          <div className="flex items-center justify-between text-zinc-300 font-bold">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>ROBINHOOD CHAIN MAINNET (4663)</span>
            </span>
            <span className="text-[10px] text-zinc-500">Arbitrum L2 Stack</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
            <div>
              <span className="text-zinc-500 block">RPC ENDPOINT:</span>
              <span className="text-zinc-300 font-mono">rpc.mainnet.chain.robinhood.com</span>
            </div>
            <div>
              <span className="text-zinc-500 block">BURN DESTINATION:</span>
              <a
                href={`https://robinhoodchain.blockscout.com/address/${BURN_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
                className="text-amber-300 hover:underline flex items-center gap-1 font-mono"
              >
                <span>0x000...dEaD</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs pt-4 border-t border-nine-border">
          {isConnected ? (
            <button
              onClick={() => {
                disconnectWallet();
                setWalletModalOpen(false);
              }}
              className="text-red-400 hover:text-red-300 text-xs font-bold"
            >
              DISCONNECT CURRENT WALLET
            </button>
          ) : (
            <span className="text-zinc-500 text-[11px]">100% NON-CUSTODIAL</span>
          )}

          <button
            onClick={() => setWalletModalOpen(false)}
            className="rounded-lg bg-zinc-800 px-4 py-1.5 text-xs text-white hover:bg-zinc-700"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
