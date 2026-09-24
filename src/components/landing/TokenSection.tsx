import React, { useState } from 'react';
import { Copy, Check, ExternalLink, ShieldCheck, ArrowRight, AlertTriangle, Coins, Zap } from 'lucide-react';
import { soundFx } from '@/utils/audio';

export const TokenSection: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);

  // Official Token Parameters
  const NETWORK = "Robinhood Chain (4663)";
  const CONTRACT_ADDRESS = "0x697518845e7c5DEE323720871D8bE03F9D3Fc901";
  const DEX_PLATFORM = "Pons Family Launchpad";
  const LAUNCHPAD_URL = "https://www.ponsfamily.com/launchpad/0x697518845e7c5DEE323720871D8bE03F9D3Fc901";

  const copyAddress = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    soundFx.playCash();
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <section id="token" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-[#09090d] border-t-2 border-black">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00e676]/15 border border-[#00e676]/30 text-[#00e676] text-xs font-['JetBrains_Mono'] font-bold uppercase tracking-wider">
            <Coins className="w-3.5 h-3.5" />
            TRANSPARENT TOKENOMICS
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-['Titan_One'] text-white leading-tight">
            HOW TO ACQUIRE <br />
            <span className="text-[#00e676]">$NINE</span>
          </h2>

          <p className="text-sm sm:text-base text-neutral-300 font-['Space_Grotesk']">
            No secret presales. No hidden developer taxes. Just an immortal cat on a mission to rewrite memecoin comebacks.
          </p>
        </div>

        {/* Token Specs Card */}
        <div className="bg-[#13131c] border-3 border-black rounded-3xl p-6 sm:p-10 shadow-[8px_8px_0px_#000] mb-12 max-w-4xl mx-auto">
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 text-left">
            <div className="p-4 bg-[#0a0a0f] border-2 border-black rounded-xl">
              <span className="text-[10px] font-['JetBrains_Mono'] text-neutral-500 uppercase">TICKER</span>
              <div className="font-['Titan_One'] text-xl sm:text-2xl text-[#ff6b9d]">$NINE</div>
            </div>

            <div className="p-4 bg-[#0a0a0f] border-2 border-black rounded-xl">
              <span className="text-[10px] font-['JetBrains_Mono'] text-neutral-500 uppercase">NETWORK</span>
              <div className="font-['Titan_One'] text-xl sm:text-2xl text-white">{NETWORK}</div>
            </div>

            <div className="p-4 bg-[#0a0a0f] border-2 border-black rounded-xl">
              <span className="text-[10px] font-['JetBrains_Mono'] text-neutral-500 uppercase">BUY / SELL TAX</span>
              <div className="font-['Titan_One'] text-xl sm:text-2xl text-[#00e676]">0% / 0%</div>
            </div>

            <div className="p-4 bg-[#0a0a0f] border-2 border-black rounded-xl">
              <span className="text-[10px] font-['JetBrains_Mono'] text-neutral-500 uppercase">DEX PLATFORM</span>
              <div className="font-['Titan_One'] text-xl sm:text-2xl text-[#ffb703]">{DEX_PLATFORM}</div>
            </div>
          </div>

          {/* Official Contract Copier Bar */}
          <div className="space-y-3 text-left">
            <div className="flex items-center justify-between">
              <span className="font-['Titan_One'] text-xs uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#00e676]" />
                OFFICIAL CONTRACT ADDRESS
              </span>
              <span className="text-[11px] font-['JetBrains_Mono'] text-[#ffb703] font-bold">
                ⚠️ ALWAYS VERIFY BEFORE TRADING
              </span>
            </div>

            <div className="flex items-center justify-between bg-[#08080c] border-2 border-neutral-700 rounded-2xl p-2.5 sm:p-3 shadow-inner">
              <code className="text-xs sm:text-sm font-['JetBrains_Mono'] text-neutral-200 select-all truncate mr-3 font-bold">
                {CONTRACT_ADDRESS}
              </code>

              <button
                onClick={copyAddress}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#00e676] hover:bg-[#33ff99] text-black font-['Titan_One'] text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] shrink-0 transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-black" />
                    COPIED!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    COPY CA
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action Links Buttons */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-6 border-t border-neutral-800 mt-6">
            <a
              href={LAUNCHPAD_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundFx.playCash()}
              className="px-6 py-3 font-['Titan_One'] text-xs uppercase tracking-wider text-black bg-[#00e676] border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#000] transition flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4" />
              BUY ON {DEX_PLATFORM}
            </a>

            <a
              href={`https://robinhoodchain.blockscout.com/token/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 font-['Space_Grotesk'] font-bold text-xs uppercase text-white bg-neutral-900 border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] hover:border-neutral-500 transition flex items-center gap-1.5"
            >
              VIEW ON BLOCKSCOUT
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href="https://x.com/NineDcat"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 font-['Space_Grotesk'] font-bold text-xs uppercase text-white bg-neutral-900 border-2 border-neutral-700 rounded-xl hover:border-white transition flex items-center gap-1.5"
            >
              <span className="font-['Titan_One']">𝕏</span> TWITTER
            </a>

            <a
              href="https://t.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 font-['Space_Grotesk'] font-bold text-xs uppercase text-white bg-neutral-900 border-2 border-neutral-700 rounded-xl hover:border-white transition flex items-center gap-1.5"
            >
              TELEGRAM
            </a>
          </div>

        </div>

        {/* 4-Step Quick How-to-Buy Guide */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            {
              step: "01",
              title: "CREATE A WALLET",
              desc: "Download an EVM-compatible Web3 wallet like MetaMask, Rabby, or Robinhood Wallet."
            },
            {
              step: "02",
              title: "ACQUIRE GAS",
              desc: "Ensure you have ETH on Robinhood Chain Mainnet (Chain ID 4663) to cover gas fees."
            },
            {
              step: "03",
              title: "CONNECT TO LAUNCHPAD",
              desc: "Navigate to Pons Family Launchpad, connect your wallet, and locate the official $NINE pool."
            },
            {
              step: "04",
              title: "HODL 9 LIVES",
              desc: "Swap for $NINE. Secure your bag and join the immortal retail comeback."
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-[#12121a] border-3 border-black rounded-2xl p-5 shadow-[4px_4px_0px_#000] text-left hover:translate-y-[-2px] transition"
            >
              <div className="font-['Titan_One'] text-2xl text-[#ffb703] mb-2">{item.step}</div>
              <h4 className="font-['Titan_One'] text-sm text-white mb-2">{item.title}</h4>
              <p className="text-xs text-neutral-400 font-['Space_Grotesk'] leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
