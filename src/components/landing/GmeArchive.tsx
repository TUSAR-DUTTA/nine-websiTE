import React from 'react';
import { Newspaper, ExternalLink, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { soundFx } from '@/utils/audio';

interface ArchiveRecord {
  date: string;
  source: string;
  headline: string;
  summary: string;
  sourceUrl: string;
  category: 'surge' | 'crash' | 'reversal' | 'legend';
  stamp: string;
}

const ARCHIVE_RECORDS: ArchiveRecord[] = [
  {
    date: "JANUARY 2021",
    source: "Reuters Financial Archive",
    headline: "GameStop surges over 1,600% in historic retail short squeeze",
    summary: "Retail traders organized on Reddit's r/wallstreetbets to counter institutional short sellers, triggering a historic short squeeze that rocketed GME from ~$17 to an intraday high of $483.",
    sourceUrl: "https://www.reuters.com/article/markets/us/gamestop-shares-surge-in-historic-retail-frenzy-idUSKBN29V1X7/",
    category: "surge",
    stamp: "HISTORIC SQUEEZE"
  },
  {
    date: "JANUARY 28, 2021",
    source: "Reuters Market Coverage",
    headline: "Robinhood and major brokerages abruptly restrict GameStop buying",
    summary: "Citing massive clearinghouse collateral requirements, retail brokerages paused buy orders for GME, sparking market fury, federal scrutiny, and congressional hearings on market structure.",
    sourceUrl: "https://www.reuters.com/article/markets/us/robinhood-curbs-trading-in-gamestop-amc-idUSKBN29X1UQ/",
    category: "crash",
    stamp: "THE PAUSE"
  },
  {
    date: "FEBRUARY 2021",
    source: "Reuters Financial News",
    headline: "GameStop plunges 80% as mainstream media declares the meme era finished",
    summary: "After trading curbs and heavy selling pressure, shares crashed back below $40. Mainstream financial commentators published unanimous obituaries for the meme stock movement.",
    sourceUrl: "https://www.reuters.com/article/markets/us/gamestop-tumbles-as-reddit-rally-stalls-idUSKBN2A21B6/",
    category: "crash",
    stamp: "THE OBITUARY"
  },
  {
    date: "FEBRUARY 24, 2021",
    source: "Reuters Market Report",
    headline: "GameStop shares double in late-day trading frenzy, defying death predictions",
    summary: "In a sudden late-afternoon reversal, GME surged more than 100% in the final hour of trading, triggering trading halts and shocking analysts who had declared the stock dead just days prior.",
    sourceUrl: "https://www.reuters.com/article/markets/us/gamestop-surges-100-in-dramatic-afternoon-rally-idUSKBN2AP27P/",
    category: "reversal",
    stamp: "FIRST REVIVAL"
  },
  {
    date: "MAY 12–14, 2024",
    source: "Reuters Business Archive",
    headline: "‘Roaring Kitty’ returns after 3-year silence; GameStop jumps 74% to 110%",
    summary: "Keith Gill resurfaced on X with an image of a gamer leaning forward in a chair. The single post ignited an immediate retail wave, halting trading multiple times as the stock doubled intraday.",
    sourceUrl: "https://www.reuters.com/markets/us/gamestop-surges-as-roaring-kitty-resurfaces-on-social-media-2024-05-13/",
    category: "legend",
    stamp: "THE RETURN"
  },
  {
    date: "JUNE 2024",
    source: "Reuters Corporate Finance",
    headline: "Keith Gill reveals $116M GME bet; GameStop raises over $3B in cash offerings",
    summary: "Gill disclosed a 5-million-share stake on Reddit, while GameStop capitalized on the renewed liquidity by raising $3.07 billion in share sales, turning the balance sheet into a cash fortress.",
    sourceUrl: "https://www.reuters.com/markets/deals/gamestop-raises-2-14-billion-in-share-sale-2024-06-11/",
    category: "legend",
    stamp: "$3B WAR CHEST"
  }
];

export const GmeArchive: React.FC = () => {
  return (
    <section id="gme-archive" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-[#0c0c12] border-y-2 border-black">
      {/* Background newspaper texture & halftone */}
      <div className="absolute inset-0 bg-halftone opacity-25 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffb703]/20 border border-[#ffb703]/40 text-[#ffb703] text-xs font-['JetBrains_Mono'] font-bold uppercase tracking-wider">
            <Newspaper className="w-3.5 h-3.5" />
            REAL FINANCIAL HISTORY • DOCUMENTED RECORDS
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-['Titan_One'] text-white leading-tight">
            THE DEAD CAT <br />
            <span className="text-[#ffb703]">BILLBOARD ARCHIVES</span>
          </h2>

          <p className="text-sm sm:text-base text-neutral-300 font-['Space_Grotesk'] leading-relaxed">
            The $NINE mythology isn't invented from thin air. It is culturally inspired by the documented, real-world saga of GameStop ($GME)—the stock that was counted out, pronounced deceased, and came back anyway.
          </p>
        </div>

        {/* The Historical News Wall Billboard Collage */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {ARCHIVE_RECORDS.map((item, idx) => {
            const isRed = item.category === 'crash';
            const isGreen = item.category === 'reversal' || item.category === 'surge';
            return (
              <div
                key={idx}
                className="bg-[#15151f] border-3 border-black rounded-2xl p-6 shadow-[6px_6px_0px_#000] relative flex flex-col justify-between hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[9px_9px_0px_#000] transition group"
              >
                {/* Vintage Tape Pin on top */}
                <div className="absolute -top-3 left-8 w-16 h-5 bg-amber-100/20 border border-neutral-700 rotate-[-3deg] backdrop-blur-xs pointer-events-none" />

                <div>
                  {/* Card Meta Bar */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 text-xs font-['JetBrains_Mono'] text-neutral-400">
                      <Calendar className="w-3.5 h-3.5 text-[#ffb703]" />
                      <span className="font-bold text-neutral-200">{item.date}</span>
                    </div>

                    <span
                      className={`text-[10px] font-['Titan_One'] px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000] ${
                        isRed
                          ? 'bg-red-600 text-white'
                          : isGreen
                          ? 'bg-[#00e676] text-black'
                          : 'bg-[#ffb703] text-black'
                      }`}
                    >
                      {item.stamp}
                    </span>
                  </div>

                  {/* Headline */}
                  <h3 className="text-lg font-['Space_Grotesk'] font-bold text-white mb-3 group-hover:text-[#ff6b9d] transition-colors leading-snug">
                    “{item.headline}”
                  </h3>

                  {/* Concise factual summary */}
                  <p className="text-xs sm:text-sm text-neutral-300 font-['Space_Grotesk'] leading-relaxed mb-4">
                    {item.summary}
                  </p>
                </div>

                {/* Footer source verification */}
                <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs font-['JetBrains_Mono']">
                  <span className="text-neutral-500 font-medium">
                    SRC: <strong className="text-neutral-400">{item.source}</strong>
                  </span>

                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => soundFx.playCash()}
                    className="inline-flex items-center gap-1 text-[#ffb703] hover:text-white font-bold transition-colors"
                  >
                    READ ARCHIVE
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fact vs Lore Disclaimer Box */}
        <div className="bg-[#121218] border-2 border-neutral-800 rounded-2xl p-6 max-w-4xl mx-auto flex items-start gap-4 text-left shadow-inner">
          <AlertCircle className="w-6 h-6 text-[#ffb703] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-['Titan_One'] text-sm text-white uppercase tracking-wider">
              HISTORICAL FACT VS. MEME HOMAGE
            </h4>
            <p className="text-xs text-neutral-400 font-['Space_Grotesk'] leading-relaxed">
              The news summaries above reflect factual market reporting documented by Reuters and global financial media. $NINE is an independent creative meme project paying homage to the resilience of meme stock culture. $NINE is NOT affiliated with, endorsed by, or sponsored by GameStop Corp., Roaring Kitty, Reddit, or any corporate entity.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
