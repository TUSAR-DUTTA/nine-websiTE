import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

export const Disclaimer: React.FC = () => {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#060608] border-t border-neutral-900">
      <div className="max-w-4xl mx-auto space-y-4">
        
        {/* Cultural & Legal Disclaimer Box */}
        <div className="bg-[#0f0f16] border-2 border-neutral-800 rounded-2xl p-6 text-left shadow-inner">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-5 h-5 text-[#ffb703]" />
            <h4 className="font-['Titan_One'] text-sm text-white uppercase tracking-wider">
              CULTURAL HOMAGE & LEGAL DISCLAIMER
            </h4>
          </div>

          <p className="text-xs text-neutral-300 font-['Space_Grotesk'] leading-relaxed">
            <strong>NINE ($NINE)</strong> is an independent meme project inspired by internet meme-stock culture and retail market resilience. 
            It is <strong>NOT</strong> affiliated with, endorsed by, or sponsored by <strong>GameStop Corp.</strong>, Keith Gill (aka Roaring Kitty), Reddit Inc., or any related corporate company or individual. 
            References to historical market events and financial reporting are made solely for cultural narrative and artistic storytelling purposes.
          </p>
        </div>

        {/* Crypto Risk Warning */}
        <div className="p-4 rounded-xl bg-black/40 border border-neutral-800/80 text-left">
          <p className="text-[11px] text-neutral-500 font-['Space_Grotesk'] leading-relaxed">
            <strong className="text-neutral-400">MEMECOIN RISK WARNING:</strong> $NINE is a cryptocurrency token created for entertainment and community meme culture purposes. It possesses no intrinsic utility, financial guarantee, or expectation of profit. Cryptocurrency trading carries high risk of total loss. Do not risk funds you cannot afford to lose. Always perform independent due diligence before interacting with any decentralized smart contract.
          </p>
        </div>

      </div>
    </section>
  );
};
