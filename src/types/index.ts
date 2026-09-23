export type ProfileSkin = 
  | 'DEFAULT'
  | 'CRT_BURNT'
  | 'RED_ALERT'
  | 'AFTER_THE_CRASH'
  | 'CAT_IN_THE_DARK'
  | 'GME_TERMINAL'
  | 'NINE_LIVES'
  | 'MARKET_SURVIVOR';

export type TabType = 
  | 'TERMINAL'
  | 'GME_SAGA'
  | 'FUMBLES'
  | 'BAGS';

export interface TradeHistoryItem {
  id: string;
  type: 'BUY' | 'SELL';
  amountNine: number;
  priceUSD: number;
  totalUSD: number;
  timestamp: string;
  txHash: string;
}

export interface NineProfile {
  id: string;
  address: string;
  shortAddress: string;
  displayName: string;
  avatarUrl: string;
  customTitle: string;
  bio: string;
  twitterHandle?: string;
  twitterFollowers?: number;
  isVerifiedX?: boolean;
  nineHoldings: number;
  netPositionUSD: number;
  holdingSince: string; // e.g. "42 days ago"
  holdingSinceDate: string; // ISO date
  largestBag: number;
  totalBuysCount: number;
  totalSellsCount: number;
  unrealizedPnLPercent: number;
  achievements: string[];
  equippedSkin: ProfileSkin;
  equippedAura?: string; // e.g. animated GIF aura path
  equippedPet?: string;  // e.g. animated pixel cat path
  equippedPetName?: string;
  equippedPetCatId?: number; // 1 to 6
  equippedCompanionType?: 'cat' | 'monster' | 'fairy';
  equippedMonsterId?: string;
  equippedFairyId?: number;
  equippedSymbol?: string;
  recentTrades: TradeHistoryItem[];
  socialActivityLevel: number; // 0 to 100
  postsCount: number;
  activeDaysCount: number;
  topPostImpressions: number;
  cursorEffect?: string;
}

export interface Fumble {
  id: string;
  code: string; // e.g. "FUMBLE #00421"
  wallet: string;
  shortWallet: string;
  boughtAmountUSD: number;
  soldAmountUSD: number;
  lossUSD: number;
  missedPercent: number;
  statusQuote: string;
  timestamp: string;
  contextStory: string;
  txHash: string;
  reactions: {
    lol: number;
    pain: number;
    respect: number;
    cooked: number;
    comeback: number;
  };
  userReaction?: 'lol' | 'pain' | 'respect' | 'cooked' | 'comeback';
  explorerUrl?: string;
  tokenSymbol?: string;
  era?: 'ALL' | 'GENESIS' | 'EARLY' | 'MID' | 'INTRADAY' | 'GME';
  eraLabel?: string;
  marketCapAtSale?: string;
  tokenAmount?: number;
  remainingTokens?: number;
  percentExited?: number;
  initialBagTokens?: number;
  walletTag?: string;
  strategyClassification?: string;
  totalSwapsCount?: string | number;
  realizedUSD?: number;
  athPeakUSD?: number;
  walletExplorerUrl?: string;
}

export type BagCategory =
  | 'BIGGEST BAG'
  | 'LONGEST HOLDER'
  | 'EARLY CAT'
  | 'COMEBACK HOLDER'
  | 'CONVICTION HOLDER'
  | 'MOST ACTIVE HOLDER'
  | 'BIGGEST BUY'
  | 'BIGGEST RECOVERY'
  | 'BIGGEST RE-ENTRY'
  | 'RE-ENTRY ARTIST'
  | 'MOST CHAOTIC TRADER'
  | 'GENESIS PILLAR'
  | 'GENESIS ARCHITECT'
  | 'COMMUNITY LEAD'
  | 'TIMELINE HISTORIAN'
  | 'REDEEMED TRADER'
  | 'MEME VANGUARD';

export interface BagLeader {
  id: string;
  category: BagCategory;
  categoryTagline: string;
  profile: NineProfile;
  highlightStat: string;
  highlightLabel: string;
  rank: number;
}

export interface BagWorker {
  rank: number;
  profile: NineProfile;
  bagWorkerScore: number;
  postsCount: number;
  activeDays: number;
  topPostImpressions: number;
  consistencyScore: number;
  latestPostQuote: string;
}

export interface GmeSagaChapter {
  id: string;
  chapterNumber: number;
  title: string;
  subtitle: string;
  timeframe: string;
  fallEvent: string;
  uprisingEvent: string;
  wallStreetAction: string;
  retailResponse: string;
  stockMovement: string;
  loreLesson: string;
  quote: string;
  quoteAuthor: string;
  iconType: 'SHORT_INTEREST' | 'BUY_BUTTON' | 'HEARINGS' | 'FUD_MEDIA' | 'REVIVAL' | 'IMMORTALITY';
}

export interface WalletTrailStep {
  step: number;
  label: string;
  address: string;
  amount: number;
  timestamp: string;
  type: 'TRANSFER' | 'SWAP' | 'LP_ADD' | 'HOLD';
  actionDesc: string;
}

export interface WalletTrail {
  id: string;
  catId: string;
  totalMoved: number;
  fromEntity: string;
  toEntity: string;
  timestamp: string;
  story: string;
  steps: WalletTrailStep[];
}

export interface LiveFeedItem {
  id: string;
  type: 'HOLDER' | 'POST' | 'FUMBLE' | 'COMEBACK' | 'BUY' | 'SELL' | 'MILESTONE' | 'TESTNET' | 'COMMUNITY' | 'LAUNCHPAD';
  title: string;
  detail: string;
  value?: string;
  timestamp: string;
  profileId?: string;
  author?: string;
}

export interface MarketPulse {
  communityGauge: number; // 0-100
  socialGauge: number;
  tradingGauge: number;
  memesGauge: number;
  holdersOnline: number;
  postsToday: number;
  fumblesLogged: number;
  volume24hUSD: string;
  isComebackSignalActive: boolean;
  signalHeadline: string;
  signalConfidence: string;
  signalTriggerReason: string;
}
