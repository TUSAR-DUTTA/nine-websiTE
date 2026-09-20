import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Skull, HeartPulse, RefreshCw, AlertOctagon, Sparkles, Volume2 } from 'lucide-react';
import { soundFx } from '../utils/audio';

type MomentStatus = 'idle' | 'flatlining' | 'revived';

export const DeadAgainInteractive: React.FC = () => {
  const [status, setStatus] = useState<MomentStatus>('idle');
  const [timesCountedOut, setTimesCountedOut] = useState<number>(8);
  const [currentLife, setCurrentLife] = useState<number>(8);

  const sarcasticQuotes = [
    "“Was that supposed to hurt?”",
    "“Nice try. Still got lives left.”",
    "“I didn't hear no bell.”",
    "“My obituary got lost in the mail.”",
    "“Even the undertaker gave up.”",
    "“Just taking a quick power nap on the floor.”",
  ];

  const [quoteIndex, setQuoteIndex] = useState<number>(0);

  const handleCountMeOut = () => {
    if (status !== 'idle') return;

    // Stage 1: Flatline
    setStatus('flatlining');
    soundFx.playGlitch();

    setTimeout(() => {
      // Stage 2: Revive
      setStatus('revived');
      soundFx.playRevive();
      setTimesCountedOut((prev) => prev + 1);
      setQuoteIndex((prev) => (prev + 1) % sarcasticQuotes.length);

      // Trigger colorful celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00e676', '#ff6b9d', '#ffb703', '#ffffff']
      });

      // Reset to idle after 3.2s
      setTimeout(() => {
        setStatus('idle');
      }, 3400);
    }, 1400);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative bg-[#09090e] overflow-hidden border-b-2 border-black">
      {/* Red flash / glitch overlay during flatline */}
      {status === 'flatlining' && (
        <div className="fixed inset-0 bg-red-600/30 z-50 pointer-events-none animate-glitch" />
      )}

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        
        {/* Header */}
        <div className="space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-['JetBrains_Mono'] font-bold uppercase tracking-wider">
            <Skull className="w-3.5 h-3.5" />
            INTERACTIVE TEST FACILITY
          </div>

          <h2 className="text-3xl sm:text-5xl font-['Titan_One'] text-white leading-tight">
            THE “COUNT ME OUT” <span className="text-[#ff3344]">BUTTON</span>
          </h2>

          <p className="text-sm sm:text-base text-neutral-300 font-['Space_Grotesk'] max-w-xl mx-auto">
            Think the cat is finally done for? Go ahead and press the big red button to declare him officially dead. Watch what happens.
          </p>
        </div>

        {/* The Interactive Chamber Console */}
        <div
          className={`border-4 border-black rounded-3xl p-8 sm:p-12 shadow-[10px_10px_0px_#000] transition-all duration-300 relative overflow-hidden ${
            status === 'flatlining'
              ? 'bg-[#2b080c] border-red-500 animate-glitch'
              : status === 'revived'
              ? 'bg-[#082613] border-[#00e676]'
              : 'bg-[#14141c]'
          }`}
        >
          {/* Scanline CRT overlay */}
          <div className="absolute inset-0 scanlines opacity-40 pointer-events-none" />

          {/* Center Stage Mascot & Display */}
          <div className="relative z-10 flex flex-col items-center">
            
            {/* Mascot State */}
            <div className="relative h-64 sm:h-72 flex items-center justify-center mb-6">
              {status === 'flatlining' ? (
                <div className="flex flex-col items-center animate-glitch">
                  <img
                    src="/assets/mascot_head_favicon.webp"
                    alt="Cat Flatlining"
                    className="w-48 sm:w-56 h-auto grayscale contrast-150 rotate-180 transition-transform duration-200"
                  />
                  <div className="mt-2 bg-red-600 text-white font-['Titan_One'] text-sm px-4 py-1 rounded-full border-2 border-black animate-pulse">
                    ⚠️ HEARTBEAT: 0 BPM [DEAD?]
                  </div>
                </div>
              ) : status === 'revived' ? (
                <div className="flex flex-col items-center animate-bounce">
                  <img
                    src="/assets/mascot_main.webp"
                    alt="Cat Revived"
                    className="w-56 sm:w-64 h-auto filter drop-shadow-[0_0_30px_rgba(0,230,118,0.7)]"
                  />
                  <div className="mt-2 bg-[#00e676] text-black font-['Titan_One'] text-base px-5 py-1.5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_#000] rotate-[-3deg]">
                    STILL ALIVE! LIFE {currentLife}/9 🐾
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <img
                    src="/assets/mascot_main.webp"
                    alt="Cat Ready"
                    className="w-52 sm:w-60 h-auto filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] animate-float"
                  />
                  <div className="mt-2 bg-white text-black font-['Titan_One'] text-xs px-3.5 py-1 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000]">
                    DARING YOU TO PRESS IT 👇
                  </div>
                </div>
              )}
            </div>

            {/* Sarcastic Speech Bubble on Revive */}
            {status === 'revived' && (
              <div className="mb-6 p-3 bg-yellow-400 text-black font-['Titan_One'] text-sm rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000] animate-pulse">
                {sarcasticQuotes[quoteIndex]}
              </div>
            )}

            {/* Big Red Button */}
            <div className="space-y-4">
              <button
                onClick={handleCountMeOut}
                disabled={status !== 'idle'}
                className={`px-8 sm:px-12 py-4 font-['Titan_One'] text-lg sm:text-xl uppercase tracking-wider rounded-2xl border-4 border-black transition-all duration-150 relative ${
                  status === 'flatlining'
                    ? 'bg-red-800 text-white cursor-not-allowed'
                    : status === 'revived'
                    ? 'bg-[#00e676] text-black shadow-[4px_4px_0px_#000]'
                    : 'bg-[#ff3344] text-white shadow-[6px_6px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_#000] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0px_#000] hover:bg-red-500 cursor-pointer'
                }`}
              >
                {status === 'flatlining' ? (
                  <span className="flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 animate-spin" />
                    SIMULATING ZERO...
                  </span>
                ) : status === 'revived' ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    SURVIVED ANOTHER DEATH!
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Skull className="w-5 h-5" />
                    COUNT ME OUT (DECLARE DEAD)
                  </span>
                )}
              </button>

              {/* Real-time Degen Counter */}
              <div className="flex items-center justify-center gap-6 pt-2 font-['JetBrains_Mono'] text-xs sm:text-sm">
                <div className="bg-black/60 px-4 py-1.5 rounded-lg border border-neutral-800 text-neutral-300">
                  TIMES COUNTED OUT: <span className="text-[#ffb703] font-black">{timesCountedOut}</span>
                </div>
                <div className="bg-black/60 px-4 py-1.5 rounded-lg border border-neutral-800 text-neutral-300">
                  SURVIVAL RATE: <span className="text-[#00e676] font-black">100%</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
