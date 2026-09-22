import React, { useState, useEffect } from 'react';
import { Download, Share2, ZoomIn, X, Sparkles, Check } from 'lucide-react';
import { soundFx } from '@/utils/audio';

interface MemeCard {
  id: number;
  title: string;
  caption: string;
  category: 'all' | 'bullish' | 'pain' | 'undercover' | 'immortal';
  image: string;
  cutoutImage?: string;
  tag: string;
  rotation: string;
}

const MEMES: MemeCard[] = [
  {
    id: 1,
    title: "“‘HI!’ (I BOUGHT THE TOP)”",
    caption: "Zero thoughts behind those shiny galaxy eyes. Just wide open paws, saying 'hi' to Nine the Cat's first buy with complete conviction.",
    category: "pain",
    image: "/assets/meme_baby_hi.webp",
    tag: "INNOCENT ENTRY",
    rotation: "rotate-[2deg]"
  },
  {
    id: 2,
    title: "“WE ARE NOT THE SAME”",
    caption: "You panic-sell on the 3rd red candle because of your emotions. Nine the Cat adjusts his tie and accumulates because he has 9 lives. We are not the same.",
    category: "undercover",
    image: "/assets/meme_wallstreet_suit_bg.webp",
    cutoutImage: "/assets/meme_wallstreet_suit.png",
    tag: "WALL STREET CEO",
    rotation: "rotate-[-2deg]"
  },
  {
    id: 3,
    title: "“A TOAST TO THE SHORT SELLERS”",
    caption: "When mainstream finance publishes their 8th obituary and Nine the Cat raises a coupe of champagne on the god candle revival.",
    category: "bullish",
    image: "/assets/meme_gatsby_toast_bg.webp",
    cutoutImage: "/assets/meme_gatsby_toast.png",
    tag: "GATSBY CELEBRATION",
    rotation: "rotate-[1deg]"
  },
  {
    id: 4,
    title: "“THE SACRED SCROLL OF NINE”",
    caption: "The ancient texts foretold of Nine the Cat who shall defy gravity, ignore liquidation orders, and laugh at margin calls with his celestial staff.",
    category: "immortal",
    image: "/assets/meme_ancient_sage.webp",
    tag: "ELDER LORE SAGE",
    rotation: "rotate-[-1deg]"
  },
  {
    id: 5,
    title: "“TOUCHING GRASS WITH MY BERRY”",
    caption: "Markets on fire? Cascading liquidations across CT? Nine the Cat is oblivious, unbothered, and clutching a gigantic strawberry in a sunny meadow.",
    category: "immortal",
    image: "/assets/meme_strawberry_field.webp",
    cutoutImage: "/assets/meme_strawberry_zen.png",
    tag: "SWEET ACCUMULATION",
    rotation: "rotate-[2deg]"
  },
  {
    id: 6,
    title: "“DID YOU SEE THAT CANDLE?!”",
    caption: "POV: You closed your trading app for 90 seconds and the entire order book inverted. Nine the Cat and his degen buddy in absolute awe.",
    category: "pain",
    image: "/assets/meme_shocked_duo.webp",
    tag: "SOYJAK CAT DUO",
    rotation: "rotate-[-2deg]"
  },
  {
    id: 7,
    title: "“PAINTING GREEN IN THE CLOSET”",
    caption: "When the market calls for blood, Nine the Cat secretly paints fresh green God-candles in the dark. Life #6 survival mode.",
    category: "undercover",
    image: "/assets/mascot_closet.webp",
    tag: "UNDERCOVER DEGEN",
    rotation: "rotate-[1deg]"
  },
  {
    id: 8,
    title: "“PATIENTLY SITTING ON THE DIP”",
    caption: "Down 70%? Not Nine the Cat's problem. Patiently perched on this red wooden stool waiting for the next cycle.",
    category: "immortal",
    image: "/assets/mascot_stool.webp",
    tag: "STOOL SENTINEL",
    rotation: "rotate-[-1deg]"
  },
  {
    id: 9,
    title: "“GAZING INTO ORBIT”",
    caption: "Watching the green wick cross atmospheric entry coordinates. Nine the Cat eyes locked on the lunar horizon.",
    category: "bullish",
    image: "/assets/mascot_moonwatcher.webp",
    tag: "CHART WATCHER",
    rotation: "rotate-[2deg]"
  },
  {
    id: 10,
    title: "“THE BARKING SCREAM OF VICTORY”",
    caption: "When you survive your 8th liquidation and the comeback rally goes parabolic. Nine the Cat screaming in pure ecstasy.",
    category: "bullish",
    image: "/assets/mascot_main.webp",
    tag: "UNHINGED EUPHORIA",
    rotation: "rotate-[-2deg]"
  }
];

export const MemeVault: React.FC = () => {
  const [filter, setFilter] = useState<string>('all');
  const [selectedMeme, setSelectedMeme] = useState<MemeCard | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const filteredMemes = filter === 'all' ? MEMES : MEMES.filter((m) => m.category === filter);

  const openLightbox = (meme: MemeCard) => {
    setSelectedMeme(meme);
    soundFx.playBoing();
  };

  const closeLightbox = () => {
    setSelectedMeme(null);
  };

  const copyMemeLink = (imgUrl: string) => {
    const fullUrl = window.location.origin + imgUrl;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    soundFx.playCash();
    setTimeout(() => setCopiedLink(false), 2000);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedMeme(null);
      }
    };
    if (selectedMeme) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMeme]);

  return (
    <section id="memes" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff6b9d]/15 border border-[#ff6b9d]/30 text-[#ff6b9d] text-xs font-['JetBrains_Mono'] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            NINE THE CAT // OFFICIAL ASSET ARCHIVE
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-['Titan_One'] text-white leading-tight">
            NINE THE CAT <span className="text-[#ff6b9d]">MEME VAULT</span>
          </h2>

          <p className="text-sm sm:text-base text-neutral-300 font-['Space_Grotesk']">
            The complete, high-resolution archive of Nine the Cat. From closet painter to Wall Street CEO, ancient lore sage, and strawberry zen master. Click any card to view full resolution or download in HD PNG & WebP.
          </p>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {[
              { id: 'all', label: 'ALL MEMES' },
              { id: 'bullish', label: '🚀 BULLISH / COMEBACK' },
              { id: 'pain', label: '📉 SHOCK / DIP' },
              { id: 'undercover', label: '🎨 UNDERCOVER' },
              { id: 'immortal', label: '🐾 IMMORTAL ZEN' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setFilter(tab.id);
                  soundFx.playBoing();
                }}
                className={`px-4 py-1.5 rounded-xl font-['Titan_One'] text-xs uppercase border-2 transition ${
                  filter === tab.id
                    ? 'bg-[#ffb703] text-black border-black shadow-[3px_3px_0px_#000] -translate-y-0.5'
                    : 'bg-[#15151f] text-neutral-400 border-neutral-800 hover:border-neutral-600 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Meme Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMemes.map((meme) => (
            <div
              key={meme.id}
              onClick={() => openLightbox(meme)}
              className={`bg-[#14141e] border-3 border-black rounded-3xl p-6 shadow-[6px_6px_0px_#000] cursor-pointer hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[10px_10px_0px_#000] transition-all group flex flex-col justify-between ${meme.rotation}`}
            >
              <div>
                {/* Tag header */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-2.5 py-0.5 rounded-lg bg-black text-[#ffb703] font-['JetBrains_Mono'] text-[11px] font-bold border border-neutral-700">
                    {meme.tag}
                  </span>
                  <div className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 group-hover:text-white transition">
                    <ZoomIn className="w-4 h-4" />
                  </div>
                </div>

                {/* Meme Graphic Box */}
                <div className="h-60 sm:h-64 rounded-2xl bg-[#0c0c12] border-2 border-black/80 flex items-center justify-center p-4 relative overflow-hidden mb-4 group-hover:bg-[#111118] transition-colors">
                  <div className="absolute inset-0 bg-halftone opacity-30 pointer-events-none" />
                  <img
                    src={meme.image}
                    alt={meme.title}
                    className="max-h-full max-w-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                {/* Title & Caption */}
                <h3 className="font-['Titan_One'] text-lg text-white mb-2 group-hover:text-[#ff6b9d] transition-colors">
                  {meme.title}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 font-['Space_Grotesk'] leading-relaxed">
                  {meme.caption}
                </p>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs font-['JetBrains_Mono'] text-neutral-500">
                <span>FORMAT: WEBP / PNG</span>
                <span className="text-[#00e676] font-bold group-hover:underline">CLICK TO EXPAND</span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Modal */}
      {selectedMeme && (
        <div
          onClick={closeLightbox}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#14141e] border-4 border-black rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-[12px_12px_0px_#000] relative animate-in fade-in zoom-in-95 duration-200 cursor-default"
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 z-30 p-2.5 rounded-2xl bg-[#ff3344] hover:bg-red-600 text-white border-3 border-black shadow-[4px_4px_0px_#000] hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              title="Close (Esc)"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Modal Image Display */}
            <div className="h-80 sm:h-96 rounded-2xl bg-[#09090d] border-2 border-black flex items-center justify-center p-4 mb-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-halftone opacity-40 pointer-events-none" />
              <img
                src={selectedMeme.image}
                alt={selectedMeme.title}
                className="max-h-full max-w-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)]"
              />
            </div>

            {/* Text details */}
            <div className="space-y-2 mb-6 text-left">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-[#ffb703] text-black font-['Titan_One'] text-xs">
                  {selectedMeme.tag}
                </span>
              </div>
              <h3 className="font-['Titan_One'] text-2xl text-white">
                {selectedMeme.title}
              </h3>
              <p className="text-sm text-neutral-300 font-['Space_Grotesk'] leading-relaxed">
                {selectedMeme.caption}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-neutral-800">
              <a
                href={selectedMeme.image.replace('.webp', '.png')}
                download={`NINE_${selectedMeme.tag.replace(/\s+/g, '_')}.png`}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#00e676] text-black font-['Titan_One'] text-xs uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#000] transition"
              >
                <Download className="w-4 h-4" />
                {selectedMeme.cutoutImage ? 'DOWNLOAD FULL ART (PNG)' : 'DOWNLOAD HD PNG'}
              </a>

              {selectedMeme.cutoutImage && (
                <a
                  href={selectedMeme.cutoutImage}
                  download={`NINE_${selectedMeme.tag.replace(/\s+/g, '_')}_STICKER.png`}
                  className="flex items-center gap-2 px-4 py-2.5 bg-cyan-400 text-black font-['Titan_One'] text-xs uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#000] transition"
                >
                  <Download className="w-4 h-4" />
                  DOWNLOAD STICKER (PNG)
                </a>
              )}

              <a
                href={selectedMeme.image}
                download={`NINE_${selectedMeme.tag.replace(/\s+/g, '_')}.webp`}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#ffb703] text-black font-['Titan_One'] text-xs uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#000] transition"
              >
                <Download className="w-4 h-4" />
                DOWNLOAD WEBP
              </a>

              <button
                onClick={() => copyMemeLink(selectedMeme.image)}
                className="flex items-center gap-2 px-4 py-2.5 bg-neutral-800 text-white font-['Space_Grotesk'] font-bold text-xs rounded-xl border-2 border-neutral-700 hover:border-white transition"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-[#00e676]" />
                    LINK COPIED!
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    COPY DIRECT LINK
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
