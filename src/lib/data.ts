import {
  NineProfile,
  Fumble,
  BagLeader,
  BagWorker,
  GmeSagaChapter,
  WalletTrail,
  MarketPulse,
  LiveFeedItem,
} from '@/types';

// ==========================================
// TOKEN CONSTANTS & MARKET METRICS
// ==========================================
export const TOKEN_INFO = {
  name: '$NINE',
  symbol: 'NINE',
  mascotName: 'Nine The Cat',
  twitterHandle: 'NineDcat',
  twitterUrl: 'https://x.com/NineDcat',
  tagline: 'THE ON-CHAIN EMBODIMENT OF GAMESTOP RETAIL RESILIENCE',
  subtagline: '$NINE on Robinhood Chain Mainnet. 9 Lives. One more comeback.',
  contractAddress: process.env.NEXT_PUBLIC_TOKEN_ADDRESS || '0x697518845e7c5DEE323720871D8bE03F9D3Fc901',
  chain: 'Robinhood Chain (Mainnet 4663)',
  launchVenue: 'Pons Family Launchpad',
  launchpadUrl: 'https://www.ponsfamily.com/launchpad/0x697518845e7c5DEE323720871D8bE03F9D3Fc901',
  status: 'LIVE ON LAUNCHPAD',
  totalSupply: 1000000000,
  circulatingSupply: 1000000000,
  priceUSD: 0,
  change24h: 0,
  marketCapUSD: 0,
  liquidityUSD: 0,
  volume24hUSD: 0,
  holdersCount: 0,
  transactions24h: 0,
  isLive: true,
};

// ==========================================
// PROFILES (Using Official Mascot Assets)
// ==========================================
export const PROFILES: Record<string, NineProfile> = {
  catlord: {
    id: 'p-catlord',
    address: '0x8f28b49e1903429188339c910382918374829103',
    shortAddress: '0x8f2...9103',
    displayName: 'CATLORD',
    avatarUrl: '/assets/mascot/mascot_head_favicon.webp',
    customTitle: '🐈 BAG WORKER / GME SAGA HISTORIAN',
    bio: 'Held through January 28, 2021 when they shut off the buy button. $NINE is the on-chain monument to the retail rebellion that Wall Street could never silence.',
    twitterHandle: 'catlord',
    twitterFollowers: 0,
    isVerifiedX: true,
    nineHoldings: 0,
    netPositionUSD: 0,
    holdingSince: 'Pre-Launch Genesis',
    holdingSinceDate: '2026-09-19',
    largestBag: 0,
    totalBuysCount: 0,
    totalSellsCount: 0,
    unrealizedPnLPercent: 0,
    achievements: ['GME VETERAN', 'GENESIS MEMBER'],
    equippedSkin: 'GME_TERMINAL',
    equippedAura: '/assets/animations/pixel-fx/Free Preview 1.gif',
    equippedPet: '/assets/animations/pet-cats/Cat-1/Cat-1-Idle.png',
    equippedPetName: 'Calico Guardian #01',
    socialActivityLevel: 0,
    postsCount: 0,
    activeDaysCount: 0,
    topPostImpressions: 0,
    recentTrades: [],
  },
  roaring_feline: {
    id: 'p-roaring',
    address: '0x3e18a99420deadc0019428beefcafe3928174920',
    shortAddress: '0x3e1...4920',
    displayName: '0xRoaringFeline',
    avatarUrl: '/assets/mascot/mascot_main.webp',
    customTitle: '🎯 TITAN CONVICTION / I LIKE THE STOCK',
    bio: 'What is an exit strategy? GME proved that conviction beats algorithmic hedge funds. $NINE brings that nine-lives spirit permanently on-chain.',
    twitterHandle: 'roaringfeline',
    twitterFollowers: 0,
    isVerifiedX: true,
    nineHoldings: 0,
    netPositionUSD: 0,
    holdingSince: 'Pre-Launch Genesis',
    holdingSinceDate: '2026-09-19',
    largestBag: 0,
    totalBuysCount: 0,
    totalSellsCount: 0,
    unrealizedPnLPercent: 0,
    achievements: ['DIAMOND PAWS', 'CONVICTION HOLDER', 'GME VETERAN'],
    equippedSkin: 'NINE_LIVES',
    equippedAura: '/assets/animations/pixel-fx/Free Preview All.gif',
    equippedPet: '/assets/animations/pet-cats/Cat-6/Cat-6-Idle.png',
    equippedPetName: 'Diamond Cat Titan',
    socialActivityLevel: 0,
    postsCount: 0,
    activeDaysCount: 0,
    topPostImpressions: 0,
    recentTrades: [],
  },
  paperhand_pete: {
    id: 'p-pete',
    address: '0x9923847291aebcd7201947294719284719284729',
    shortAddress: '0x992...4729',
    displayName: 'PaperhandPete',
    avatarUrl: '/assets/mascot/mascot_stool.webp',
    customTitle: '🍳 FUMBLE SURVIVOR / REDEEMED TRADER',
    bio: 'Sold before the big green candle once in 2021. Learned the hard way that patience is the ultimate edge. The cat always rebounds.',
    twitterHandle: 'pete_trades',
    twitterFollowers: 0,
    isVerifiedX: false,
    nineHoldings: 0,
    netPositionUSD: 0,
    holdingSince: 'Pre-Launch Genesis',
    holdingSinceDate: '2026-09-19',
    largestBag: 0,
    totalBuysCount: 0,
    totalSellsCount: 0,
    unrealizedPnLPercent: 0,
    achievements: ['FUMBLE SURVIVOR', 'CHART WATCHER'],
    equippedSkin: 'RED_ALERT',
    equippedAura: '/assets/animations/pixel-fx/Preview Free 4.gif',
    equippedPet: '/assets/animations/pet-cats/Cat-3/Cat-3-Idle.png',
    equippedPetName: 'Ginger Rebounder',
    socialActivityLevel: 0,
    postsCount: 0,
    activeDaysCount: 0,
    topPostImpressions: 0,
    recentTrades: [],
  },
  keith_gme: {
    id: 'p-keith',
    address: '0x7129847192847192847192847192847192847192',
    shortAddress: '0x712...7192',
    displayName: 'DeepNineValue',
    avatarUrl: '/assets/mascot/mascot_moonwatcher.webp',
    customTitle: '🐱 TIMELINE ADDICT / LORE MASTER',
    bio: 'No price target. Just up. $NINE captures the exact essence of the GameStop fall and uprising. You cannot short cultural immortality.',
    twitterHandle: 'deepninevalue',
    twitterFollowers: 0,
    isVerifiedX: true,
    nineHoldings: 0,
    netPositionUSD: 0,
    holdingSince: 'Pre-Launch Genesis',
    holdingSinceDate: '2026-09-19',
    largestBag: 0,
    totalBuysCount: 0,
    totalSellsCount: 0,
    unrealizedPnLPercent: 0,
    achievements: ['COMEBACK BELIEVER', 'TIMELINE ADDICT', 'DIAMOND PAWS'],
    equippedSkin: 'CRT_BURNT',
    equippedAura: '/assets/animations/pixel-fx/Preview Free 2.gif',
    equippedPet: '/assets/animations/pet-cats/Cat-2/Cat-2-Idle.png',
    equippedPetName: 'Void Stalker #02',
    socialActivityLevel: 0,
    postsCount: 0,
    activeDaysCount: 0,
    topPostImpressions: 0,
    recentTrades: [],
  },
  chaotic_whiskers: {
    id: 'p-whiskers',
    address: '0x5501928471928471928471928471928471928471',
    shortAddress: '0x550...8471',
    displayName: 'ChaoticWhiskers',
    avatarUrl: '/assets/mascot/meme_shocked_duo.webp',
    customTitle: '🌪️ MEME VANGUARD',
    bio: 'High velocity meme maker. Spreading nine-lives conviction and GME retail lore across the timeline.',
    twitterHandle: 'chaoticwhiskers',
    twitterFollowers: 0,
    isVerifiedX: false,
    nineHoldings: 0,
    netPositionUSD: 0,
    holdingSince: 'Pre-Launch Genesis',
    holdingSinceDate: '2026-09-19',
    largestBag: 0,
    totalBuysCount: 0,
    totalSellsCount: 0,
    unrealizedPnLPercent: 0,
    achievements: ['MEME VANGUARD', 'CHART WATCHER', 'GENESIS SUPPORTER'],
    equippedSkin: 'AFTER_THE_CRASH',
    equippedAura: '/assets/animations/pixel-fx/Preview Free 3.gif',
    equippedPet: '/assets/animations/pet-cats/Cat-4/Cat-4-Idle.png',
    equippedPetName: 'Siamese Flash #04',
    socialActivityLevel: 0,
    postsCount: 0,
    activeDaysCount: 0,
    topPostImpressions: 0,
    recentTrades: [],
  },
  nine_sage: {
    id: 'p-sage',
    address: '0x1102938472918374928174928374918273918273',
    shortAddress: '0x110...8273',
    displayName: 'TheNineSage',
    avatarUrl: '/assets/mascot/mascot_closet.webp',
    customTitle: '🏛️ GENESIS ARCHITECT',
    bio: 'Genesis contributor. The market can be irrational, but decentralized conviction is an immovable object.',
    twitterHandle: 'ninesage',
    twitterFollowers: 0,
    isVerifiedX: true,
    nineHoldings: 0,
    netPositionUSD: 0,
    holdingSince: 'Pre-Launch Genesis',
    holdingSinceDate: '2026-09-19',
    largestBag: 0,
    totalBuysCount: 0,
    totalSellsCount: 0,
    unrealizedPnLPercent: 0,
    achievements: ['GENESIS ARCHITECT', 'LAST CAT STANDING', 'DIAMOND PAWS', 'CONVICTION HOLDER'],
    equippedSkin: 'CAT_IN_THE_DARK',
    equippedAura: '/assets/animations/pixel-fx/Preview Free 5.gif',
    equippedPet: '/assets/animations/pet-cats/Cat-5/Cat-5-Idle.png',
    equippedPetName: 'Spectral Guardian #05',
    socialActivityLevel: 0,
    postsCount: 0,
    activeDaysCount: 0,
    topPostImpressions: 0,
    recentTrades: [],
  },
};

// ==========================================
// THE GME SAGA CHRONICLE (The Fall & The Uprising)
// ==========================================
export const GME_SAGA_CHAPTERS: GmeSagaChapter[] = [
  {
    id: 'gme-ch1',
    chapterNumber: 1,
    title: 'THE 140% SHORT TRAP',
    subtitle: 'Wall Street Declares GameStop Dead at $2.50',
    timeframe: '2019 – MID 2020',
    fallEvent: 'Hedge funds shorted over 140% of the public float, banking on total corporate bankruptcy.',
    uprisingEvent: 'DeepFuckingValue and retail researchers exposed mathematical insolvency in short positioning and identified deep value.',
    wallStreetAction: 'Melvin Capital and institutional short sellers continuously expanded naked shorting.',
    retailResponse: 'Early retail investors accumulated physical and synthetic shares, sharing DD on r/wallstreetbets.',
    stockMovement: '$2.57 → $12.00 (The quiet accumulation floor)',
    loreLesson: 'The first life: They called it a dying mall company. They did not expect retail to do arithmetic.',
    quote: '"I am not an institutional investor, nor am I a hedge fund. I just like the stock."',
    quoteAuthor: 'Keith Gill (Roaring Kitty)',
    iconType: 'SHORT_INTEREST',
  },
  {
    id: 'gme-ch2',
    chapterNumber: 2,
    title: 'THE MOTHER OF ALL SHORT SQUEEZES',
    subtitle: 'From $18 to $483: Wall Street Loses Control',
    timeframe: 'JANUARY 11 – 27, 2021',
    fallEvent: 'Citron Research tweeted: "Buyers are the suckers in this poker game, stock going back to $20 fast."',
    uprisingEvent: 'Retail banded together worldwide. The options chain triggered a historic gamma ramp that shattered Wall Street margin models.',
    wallStreetAction: 'Major hedge funds faced multi-billion dollar daily margin calls and impending liquidation.',
    retailResponse: 'Millions of retail traders refused to sell a single share, chanting "DIAMOND HANDS".',
    stockMovement: '$19.90 → $483.00+ (+2,300% in 14 days, +18,000% from lows)',
    loreLesson: 'The second life: When retail stands united, the biggest hedge funds on Earth can be brought to their knees in a single trading session.',
    quote: '"In all my years on Wall Street, I have never seen retail move like an organized army."',
    quoteAuthor: 'CNBC Senior Market Analyst',
    iconType: 'REVIVAL',
  },
  {
    id: 'gme-ch3',
    chapterNumber: 3,
    title: 'THE BUY BUTTON MASSACRE',
    subtitle: 'January 28, 2021: Robinhood Shuts Off The Buy Side',
    timeframe: 'JANUARY 28 – FEBRUARY 4, 2021',
    fallEvent: 'Robinhood and clearing brokers halted BUY orders ("Position Closing Only"), deliberately crashing the price from $483 down to $40.',
    uprisingEvent: 'Instead of capitulating, the retail rebellion went mainstream, sparking global outrage and congressional investigations.',
    wallStreetAction: 'Brokers colluded with market makers to suppress buying while allowing institutional shorts to close.',
    retailResponse: 'Traders held their shares through a catastrophic artificial -88% drop, refusing to panic sell.',
    stockMovement: '$483.00 → $40.00 (The synthetic flash crash)',
    loreLesson: 'The third life: They proved the game was rigged by turning off the rules when they were losing. But they couldn’t erase conviction.',
    quote: '"They didn\'t just turn off the buy button; they revealed the entire machinery of modern finance is an illusion."',
    quoteAuthor: 'Community Manifesto',
    iconType: 'BUY_BUTTON',
  },
  {
    id: 'gme-ch4',
    chapterNumber: 4,
    title: 'CONGRESSIONAL HEARINGS & "I LIKE THE STOCK"',
    subtitle: 'Roaring Kitty Testifies Under Oath and Doubles Down',
    timeframe: 'FEBRUARY 18 – MARCH 2021',
    fallEvent: 'Hedge fund managers appeared with teams of lawyers to deflect blame and claim GameStop was finished.',
    uprisingEvent: 'Keith Gill testified from his basement: "In short, I like the stock." Two days later, he posted his position doubling his shares.',
    wallStreetAction: 'Media broadcasted non-stop headlines claiming the squeeze was completely over.',
    retailResponse: 'A massive wave of retail capital poured back in, sending the stock surging from $40 back to $348 in days.',
    stockMovement: '$40.00 → $348.50 (+770% immediate rebound)',
    loreLesson: 'The fourth life: You cannot intimidate someone who isn’t afraid of losing money and only cares about the truth.',
    quote: '"A few things that I am not: I am not a cat. I am not an institutional investor... I like the stock."',
    quoteAuthor: 'Keith Gill Congressional Testimony',
    iconType: 'HEARINGS',
  },
  {
    id: 'gme-ch5',
    chapterNumber: 5,
    title: 'THE 3-YEAR PSYCHOLOGICAL SIEGE',
    subtitle: 'The "Forget GameStop" Era & Direct Registration (DRS)',
    timeframe: '2021 – 2023',
    fallEvent: 'Mainstream financial media published thousands of articles titled "Forget GameStop" while shares were routed through off-exchange dark pools.',
    uprisingEvent: 'Retail did what no market analyst expected: they Direct Registered (DRS) over 75,000,000 shares in Computershare, locking them away from short borrows.',
    wallStreetAction: 'Continuous synthetic suppression and short ladder attacks to grind the price down over 36 months.',
    retailResponse: 'Millions of bag workers bought the dip every paycheck, treating GameStop shares as sacred collectibles.',
    stockMovement: 'Persistent algorithmic grinding tested retail patience for over 1,000 consecutive days.',
    loreLesson: 'The fifth & sixth lives: Wall Street can fight price, but they cannot fight infinite holding time.',
    quote: '"They thought we would get bored. They forgot we spent our childhoods grinding in video games for zero dollars."',
    quoteAuthor: 'Superstonk Community Archive',
    iconType: 'FUD_MEDIA',
  },
  {
    id: 'gme-ch6',
    chapterNumber: 6,
    title: 'THE ROARING RETURN & THE IMMORTAL NINE LIVES',
    subtitle: 'May 2024 – Present: The Cat Returns to the Timeline',
    timeframe: 'MAY 2024 – PRESENT',
    fallEvent: 'Wall Street thought the saga was a distant 2021 memory relegated to history books.',
    uprisingEvent: 'Roaring Kitty posted a single meme of a gamer leaning forward. The internet exploded. GME spiked +180% in premarket trading.',
    wallStreetAction: 'Emergency halts, media meltdowns, and questions about market manipulation against a single individual.',
    retailResponse: 'The $NINE community coalesced on-chain to celebrate the immortal cat with nine lives that can never be put down.',
    stockMovement: 'Multi-day vertical surges and billions in trading volume reigniting the global movement.',
    loreLesson: 'The seventh, eighth & ninth lives: A cat has nine lives. GME is the comeback. NINE is the on-chain badge of that eternal uprising.',
    quote: '"You thought it was over? Some cats just refuse to stay dead. That\'s $NINE."',
    quoteAuthor: '$NINE Manifesto',
    iconType: 'IMMORTALITY',
  },
];

// ==========================================
// THE FUMBLE BOARD (Populates from live Robinhood Chain Mainnet sells on launch)
// ==========================================
export const FUMBLES_DATA: Fumble[] = [];

// ==========================================
// THE BAG BOARD (Populates on token launch)
// ==========================================
export const BAG_LEADERS: BagLeader[] = [];

// ==========================================
// BAG WORKERS (Populates via 6-hour Playwright scraper into Supabase)
// ==========================================
export const BAG_WORKERS_DATA: BagWorker[] = [];


// ==========================================
// "WHERE DID THE CAT GO?" (Wallet Trail)
// ==========================================
export const WALLET_TRAIL_SAMPLE: WalletTrail = {
  id: 'trail-genesis',
  catId: 'GENESIS 1B ALLOCATION',
  totalMoved: 1000000000,
  fromEntity: 'Genesis Token Contract',
  toEntity: 'Pons Family Launchpad & Liquidity Pools',
  timestamp: 'Genesis Mainnet',
  story: 'Architectural tracking of 1,000,000,000 $NINE total supply deployed on Robinhood Chain Mainnet (4663) across Pons Family Launchpad and community pools.',
  steps: [
    {
      step: 1,
      label: 'GENESIS TOKEN DEPLOYMENT',
      address: '0x697518845e7c5DEE323720871D8bE03F9D3Fc901',
      amount: 1000000000,
      timestamp: 'Genesis',
      type: 'TRANSFER',
      actionDesc: '1,000,000,000 $NINE fixed total supply deployed on Robinhood Chain Mainnet (4663)',
    },
    {
      step: 2,
      label: 'PONS FAMILY LAUNCHPAD',
      address: '0x697518845e7c5DEE323720871D8bE03F9D3Fc901',
      amount: 500000000,
      timestamp: 'Live',
      type: 'LP_ADD',
      actionDesc: 'Official fair launch liquidity on Pons Family Launchpad (Robinhood Chain Arbitrum L2)',
    },
    {
      step: 3,
      label: 'ROBINHOOD ECOSYSTEM VAULT',
      address: '0xRobinhood...Vault',
      amount: 300000000,
      timestamp: 'Active',
      type: 'HOLD',
      actionDesc: 'Reserved for Robinhood ecosystem integrations and community incentives',
    },
    {
      step: 4,
      label: 'ON-CHAIN DEAD / BURN VAULT',
      address: '0x000000000000000000000000000000000000dead',
      amount: 200000000,
      timestamp: 'Permanent',
      type: 'HOLD',
      actionDesc: 'Permanent community treasury and verifiable on-chain burn sink (0x...dEaD)',
    },
  ],
};

// ==========================================
// NINE PULSE & COMEBACK SIGNAL
// ==========================================
export const INITIAL_PULSE: MarketPulse = {
  communityGauge: 95,
  socialGauge: 88,
  tradingGauge: 82,
  memesGauge: 99,
  holdersOnline: 1,
  postsToday: 2,
  fumblesLogged: 0,
  volume24hUSD: 'Live on Launchpad',
  isComebackSignalActive: true,
  signalHeadline: 'LIVE ON PONS FAMILY LAUNCHPAD',
  signalConfidence: 'TRADING ACTIVE',
  signalTriggerReason: 'Official $NINE deployed on Robinhood Chain Mainnet (4663) via Pons Family Launchpad.',
};

// ==========================================
// ROLLING LIVE TICKER FEED ITEMS
// ==========================================
export const LIVE_FEED_ITEMS: LiveFeedItem[] = [
  { id: 'lf-1', type: 'MILESTONE', title: 'SUPPLY DEPLOYED', detail: '1,000,000,000 $NINE fixed total supply on-chain', value: '1B NINE', timestamp: 'Genesis' },
  { id: 'lf-2', type: 'BUY', title: 'ROBINHOOD CHAIN', detail: 'Native deployment on Mainnet (Chain ID 4663)', timestamp: 'Active' },
  { id: 'lf-3', type: 'COMEBACK', title: 'ON-CHAIN BURNS', detail: 'On-chain burns to 0x000...dEaD active on network', timestamp: 'Ready' },
  { id: 'lf-4', type: 'COMMUNITY', title: 'GME SAGA CHRONICLE', detail: '6 Historic chapters loaded into on-chain monument', timestamp: 'Indexed' },
  { id: 'lf-5', type: 'POST', title: 'OFFICIAL LAUNCH', detail: 'Live on Pons Family Launchpad (Robinhood Chain 4663)', timestamp: 'Live' },
];

// ==========================================
// ENGINE CALCULATIONS
// ==========================================

export function calculateBagWorkerScore(posts: number, activeDays: number, impressions: number, consistency: number): number {
  const postPart = Math.min(posts * 0.2, 30);
  const daysPart = Math.min(activeDays * 0.5, 35);
  const impPart = Math.min((Math.log10(Math.max(impressions, 10)) / 6) * 25, 25);
  const consPart = Math.min((consistency / 100) * 10, 10);
  return Number((postPart + daysPart + impPart + consPart).toFixed(1));
}

export function detectFumble(sellPriceUSD: number, currentOrSubsequentHighUSD: number, soldAmountUSD: number) {
  if (currentOrSubsequentHighUSD > sellPriceUSD * 1.2) {
    const missedMultiplier = (currentOrSubsequentHighUSD - sellPriceUSD) / sellPriceUSD;
    const missedPercent = Math.round(missedMultiplier * 100);
    const potentialValueUSD = soldAmountUSD * (1 + missedMultiplier);
    const leftOnTableUSD = potentialValueUSD - soldAmountUSD;

    let humorousQuote = '"THE REBOUND WAS IMMINENT"';
    if (missedPercent > 400) {
      humorousQuote = '"LEGENDARY PAPERHAND STATUS UNLOCKED"';
    } else if (missedPercent > 200) {
      humorousQuote = '"HE SOLD AND THE GOD CANDLE APPEARED"';
    } else if (missedPercent > 100) {
      humorousQuote = '"CHART WENT TO THE MOON WITHOUT HIM"';
    }

    return {
      isFumble: true,
      missedPercent,
      leftOnTableUSD,
      humorousQuote,
    };
  }
  return { isFumble: false, missedPercent: 0, leftOnTableUSD: 0, humorousQuote: '' };
}
