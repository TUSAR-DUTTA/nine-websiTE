import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Skull, HeartPulse, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';
import { soundFx } from '@/utils/audio';

interface LifeVariant {
  img: string;
  name: string;
  quote: string;
}

interface LifeItem {
  id: number;
  label: string;
  subtitle: string;
  tag: string;
  color: 'green' | 'red' | 'purple' | 'gold' | 'pink';
  mascotImg: string;
  mascotQuote: string;
  variants?: LifeVariant[];
  story: string;
  chartStatus: string;
  statusIcon: 'alive' | 'dead' | 'reviving';
}

const LIVES: LifeItem[] = [
  {
    id: 1,
    label: "LIFE 01",
    subtitle: "THE INNOCENT ENTRY",
    tag: "BIRTH OF THE CHAOS",
    color: "pink",
    mascotImg: "/assets/meme_baby_hi.webp",
    mascotQuote: "“Wait, you guys are making money?”",
    variants: [
      { img: "/assets/meme_baby_hi.webp", name: "BABY NINE (HI!)", quote: "“Wait, you guys are making money?”" },
      { img: "/assets/meme_nine_standing.webp", name: "CLASSIC NINE", quote: "“Zero risk management. Infinite conviction.”" },
    ],
    story: "Nine the Cat stumbles into the market with zero financial literacy, no risk management, and supreme confidence. He says 'hi' with giant glossy anime pupils and happily buys the top.",
    chartStatus: "VOLATILITY: +14% (Oblivious)",
    statusIcon: "alive"
  },
  {
    id: 2,
    label: "LIFE 02",
    subtitle: "THE ACCUMULATION",
    tag: "RETAIL AWAKENING",
    color: "green",
    mascotImg: "/assets/mascot_stool.webp",
    mascotQuote: "“Sitting on this dip until further notice.”",
    variants: [
      { img: "/assets/mascot_stool.webp", name: "STOOL SENTINEL", quote: "“Sitting on this dip until further notice.”" },
      { img: "/assets/meme_strawberry_zen.webp", name: "STRAWBERRY ZEN", quote: "“Unbothered. Peaceful. Clutching my giant berry.”" },
    ],
    story: "Nine the Cat sits calmly on a red wooden stool while degenerates scream on Reddit. Quiet hands accumulate. The tension builds like a coiled spring.",
    chartStatus: "VOLATILITY: +80% (Whales confused)",
    statusIcon: "alive"
  },
  {
    id: 3,
    label: "LIFE 03",
    subtitle: "THE SHORT SQUEEZE",
    tag: "EUPHORIA",
    color: "green",
    mascotImg: "/assets/mascot_main.webp",
    mascotQuote: "“WE ARE GOING TO PARALLEL UNIVERSES!”",
    story: "The chart launches into outer orbit. Short sellers collapse into fetal positions. Nine the Cat is screaming with pure joy, purple tongue flying in the solar wind.",
    chartStatus: "VOLATILITY: +1,600% (Historic)",
    statusIcon: "alive"
  },
  {
    id: 4,
    label: "LIFE 04",
    subtitle: "THE PAUSED BUTTON",
    tag: "THE DOWNFALL",
    color: "red",
    mascotImg: "/assets/meme_shocked_duo.webp",
    mascotQuote: "“BRO WHO TOOK AWAY THE BUY BUTTON?!”",
    story: "Brokers pull the plug. You can sell, but you can't buy. Red candlesticks crash through the floorboards like falling anvils. Nine the Cat watches in total shock as -80% hits in hours.",
    chartStatus: "VOLATILITY: -84% (Broker shutdown)",
    statusIcon: "dead"
  },
  {
    id: 5,
    label: "LIFE 05",
    subtitle: "THE MAINSTREAM OBITUARY",
    tag: "COUNTED OUT",
    color: "red",
    mascotImg: "/assets/mascot_head_favicon.webp",
    mascotQuote: "“Reports of my demise are slightly exaggerated.”",
    story: "Every financial news outlet prints the same headline: 'Meme frenzy dead forever.' Short sellers pop champagne. Nine the Cat lies motionless in the dip. Or so they think.",
    chartStatus: "VOLATILITY: FLATLINE (Declared deceased)",
    statusIcon: "dead"
  },
  {
    id: 6,
    label: "LIFE 06",
    subtitle: "THE CLOSET PAINTER",
    tag: "UNDERCOVER SURVIVAL",
    color: "purple",
    mascotImg: "/assets/mascot_closet.webp",
    mascotQuote: "“Painting green candles in the dark.”",
    story: "Three years in the shadows. While Wall Street laughed, Nine the Cat hid in the closet, quietly painting fresh green candlesticks for the next chapter.",
    chartStatus: "VOLATILITY: 0% (Silent accumulation)",
    statusIcon: "reviving"
  },
  {
    id: 7,
    label: "LIFE 07",
    subtitle: "THE GAMER LEANS FORWARD",
    tag: "THE COMEBACK",
    color: "gold",
    mascotImg: "/assets/mascot_moonwatcher.webp",
    mascotQuote: "“I'M NOT LOCKED IN HERE WITH YOU...”",
    story: "May 2024: A single tweet. The gamer leans forward in the chair. Millions of screens light up. Nine the Cat awakens with a +110% morning god candle.",
    chartStatus: "VOLATILITY: +110% (The second coming)",
    statusIcon: "alive"
  },
  {
    id: 8,
    label: "LIFE 08",
    subtitle: "THE $3 BILLION WAR CHEST",
    tag: "THE RE-UP",
    color: "green",
    mascotImg: "/assets/meme_wallstreet_suit.webp",
    mascotQuote: "“YOU THOUGHT LIFE 8 WAS OVER? CALL ME THE CEO.”",
    variants: [
      { img: "/assets/meme_wallstreet_suit.webp", name: "CEO PINSTRIPE", quote: "“YOU THOUGHT LIFE 8 WAS OVER? CALL ME THE CEO.”" },
      { img: "/assets/meme_gatsby_toast.webp", name: "GATSBY TOAST", quote: "“A TOAST TO THE SHORT SELLERS WHO COUNTED US OUT!”" },
    ],
    story: "June 2024: Massive cash reserves raised. Debt zeroed out. Nine the Cat adjusts his silk tie, checks his diamond paw watch, and turns the retailer into an impregnable fortress of liquidity.",
    chartStatus: "VOLATILITY: +200% (Fortress mode)",
    statusIcon: "alive"
  },
  {
    id: 9,
    label: "LIFE 09",
    subtitle: "THE IMMORTAL PROPHECY",
    tag: "THE SACRED SCROLL",
    color: "pink",
    mascotImg: "/assets/meme_ancient_sage.webp",
    mascotQuote: "“AS FORETOLD IN THE SACRED SCROLLS: LIFE NINE IS ETERNAL.”",
    variants: [
      { img: "/assets/meme_ancient_sage.webp", name: "GRAND SAGE", quote: "“AS FORETOLD IN THE SACRED SCROLLS: LIFE NINE IS ETERNAL.”" },
      { img: "/assets/meme_gatsby_toast.webp", name: "VICTORY CHAMPAGNE", quote: "“CHEERS TO LIFE 9 AND THE GREATEST COMEBACK!”" },
    ],
    story: "The ancient scriptures were true. The ninth life isn't just another candle—it is the immortal soul of Nine the Cat and the decentralized community that will never surrender and never read an obituary. Nine the Cat is eternal.",
    chartStatus: "STATUS: IMMORTAL (Lives remaining: ∞)",
    statusIcon: "alive"
  }
];

export const NineLives: React.FC = () => {
  const [activeLife, setActiveLife] = useState<number>(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<number, number>>({});

  const current = LIVES.find((l) => l.id === activeLife) || LIVES[0];
  const activeVariantIdx = selectedVariants[activeLife] || 0;
  const currentVariant = current.variants && current.variants[activeVariantIdx] ? current.variants[activeVariantIdx] : null;
  const displayImg = currentVariant ? currentVariant.img : current.mascotImg;
  const displayQuote = currentVariant ? currentVariant.quote : current.mascotQuote;

  const handleSelectLife = (id: number) => {
    setActiveLife(id);
    if (id === 4 || id === 5) {
      soundFx.playGlitch();
    } else if (id === 7 || id === 8 || id === 9) {
      soundFx.playRevive();
    } else {
      soundFx.playBoing();
    }
  };

  const nextLife = () => {
    const next = activeLife >= 9 ? 1 : activeLife + 1;
    handleSelectLife(next);
  };

  const prevLife = () => {
    const prev = activeLife <= 1 ? 9 : activeLife - 1;
    handleSelectLife(prev);
  };

  return (
    <section id="ninelives" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-[#09090d]">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff6b9d]/15 border border-[#ff6b9d]/30 text-[#ff6b9d] text-xs font-['JetBrains_Mono'] font-bold uppercase tracking-wider">
            <HeartPulse className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            NINE THE CAT // THE INTERACTIVE 9 LIVES CHRONICLE
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-['Titan_One'] text-white leading-tight">
            COUNTED OUT. <span className="text-[#ffb703]">EIGHT TIMES.</span><br />
            NINE THE CAT <span className="text-[#00e676]">STILL HAS LIVES</span>.
          </h2>

          <p className="text-sm sm:text-base text-neutral-300 font-['Space_Grotesk']">
            Click through all 9 lives below to watch Nine the Cat's legendary death-and-resurrection saga unfold.
          </p>
        </div>

        {/* Life Stage Selector Strip */}
        <div className="flex items-center justify-between gap-1 sm:gap-2 mb-10 overflow-x-auto pb-4 scrollbar-none">
          {LIVES.map((life) => {
            const isSelected = life.id === activeLife;
            const isDead = life.id === 4 || life.id === 5;
            return (
              <button
                key={life.id}
                onClick={() => handleSelectLife(life.id)}
                className={`flex-1 min-w-[70px] sm:min-w-[100px] py-3 px-2 rounded-xl border-2 sm:border-3 font-['Titan_One'] text-xs sm:text-sm text-center transition-all duration-150 relative ${
                  isSelected
                    ? isDead
                      ? 'bg-red-600 text-white border-black shadow-[4px_4px_0px_#000] -translate-y-1'
                      : 'bg-[#00e676] text-black border-black shadow-[4px_4px_0px_#000] -translate-y-1'
                    : 'bg-[#14141c] text-neutral-400 border-neutral-800 hover:border-neutral-500 hover:text-white'
                }`}
              >
                <div className="text-[10px] sm:text-xs font-['JetBrains_Mono'] font-bold">
                  {life.label}
                </div>
                <div className="text-[9px] sm:text-[11px] truncate uppercase">
                  {isDead ? '💀 OBIT' : '🐾 ALIVE'}
                </div>
                {isSelected && (
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white rotate-45 border-r border-b border-black" />
                )}
              </button>
            );
          })}
        </div>

        {/* Active Stage Interactive Showcase Panel */}
        <div
          className={`border-3 border-black rounded-3xl p-6 sm:p-10 shadow-[10px_10px_0px_#000] transition-colors duration-300 relative overflow-hidden ${
            current.color === 'red'
              ? 'bg-gradient-to-br from-[#240c10] via-[#160a0d] to-[#0c0809]'
              : current.color === 'green'
              ? 'bg-gradient-to-br from-[#0c2214] via-[#09170e] to-[#080f0a]'
              : current.color === 'gold'
              ? 'bg-gradient-to-br from-[#241c0c] via-[#171208] to-[#0c0b08]'
              : 'bg-gradient-to-br from-[#1e0f18] via-[#140c11] to-[#0d090c]'
          }`}
        >
          {/* Background scanline & halftone */}
          <div className="absolute inset-0 scanlines opacity-30 pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Left Column: Mascot State Art (5 cols) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              <div className="relative group cursor-pointer" onClick={() => soundFx.playMeow()}>
                <img
                  key={displayImg}
                  src={displayImg}
                  alt={current.subtitle}
                  className={`w-64 sm:w-80 max-h-[340px] object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)] transition-transform duration-300 animate-in fade-in zoom-in-95 duration-200 ${
                    current.statusIcon === 'dead' ? 'rotate-12 grayscale-[50%] brightness-75' : 'hover:scale-105'
                  }`}
                />

                {/* Speech Bubble */}
                <div
                  className={`absolute -top-4 -right-4 sm:-right-8 font-['Titan_One'] text-xs sm:text-sm px-3.5 py-2 rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000] rotate-[5deg] max-w-[220px] ${
                    current.statusIcon === 'dead' ? 'bg-red-500 text-white' : 'bg-white text-black'
                  }`}
                >
                  {displayQuote}
                </div>
              </div>

              {/* Variant Switcher Pills if available */}
              {current.variants && current.variants.length > 1 && (
                <div className="flex items-center gap-1.5 mt-3 bg-black/60 p-1 rounded-xl border border-neutral-800">
                  {current.variants.map((v, i) => (
                    <button
                      key={v.name}
                      onClick={(e) => {
                        e.stopPropagation();
                        soundFx.playBoing();
                        setSelectedVariants((prev) => ({ ...prev, [activeLife]: i }));
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-['JetBrains_Mono'] font-bold border transition ${
                        activeVariantIdx === i
                          ? 'bg-[#ffb703] text-black border-black shadow-[2px_2px_0px_#000]'
                          : 'bg-neutral-900/80 text-neutral-400 border-neutral-700 hover:text-white'
                      }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Status Stamp */}
              <div className="mt-4 flex items-center gap-2">
                {current.statusIcon === 'dead' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/30 text-red-400 border border-red-500 font-['JetBrains_Mono'] text-xs font-bold uppercase">
                    <Skull className="w-3.5 h-3.5" />
                    DECLARED CASUALTY
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/30 text-[#00e676] border border-emerald-500 font-['JetBrains_Mono'] text-xs font-bold uppercase">
                    <Sparkles className="w-3.5 h-3.5" />
                    VITAL SIGNS: BULLETPROOF
                  </span>
                )}
              </div>
            </div>

            {/* Right Column: Comic Lore Details (7 cols) */}
            <div className="lg:col-span-7 space-y-5 text-left">
              
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-black text-[#ffb703] font-['Titan_One'] text-sm rounded-lg border border-neutral-700">
                    {current.label} / 09
                  </span>
                  <span className="px-2.5 py-1 bg-neutral-800 text-neutral-300 font-['JetBrains_Mono'] text-xs font-bold rounded uppercase">
                    {current.tag}
                  </span>
                </div>

                <div className="text-xs font-['JetBrains_Mono'] text-neutral-400 bg-black/50 px-3 py-1 rounded-lg border border-neutral-800">
                  {current.chartStatus}
                </div>
              </div>

              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-['Titan_One'] text-white leading-tight">
                {current.subtitle}
              </h3>

              <p className="text-base sm:text-lg text-neutral-200 font-['Space_Grotesk'] leading-relaxed">
                {current.story}
              </p>

              {/* Navigation Controls */}
              <div className="pt-4 flex items-center justify-between border-t border-neutral-800/80">
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevLife}
                    className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border-2 border-black text-white shadow-[2px_2px_0px_#000] transition"
                    title="Previous Life"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextLife}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ffb703] hover:bg-[#ffc633] text-black font-['Titan_One'] text-xs uppercase border-2 border-black shadow-[3px_3px_0px_#000] transition"
                    title="Next Life"
                  >
                    NEXT LIFE
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs font-['JetBrains_Mono'] text-neutral-400">
                  LIFE {activeLife} OF 9
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
