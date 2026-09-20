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
  | 'BAGS'
  | 'WALL'
  | 'ARCADE';

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

export type ArcadeCategory = 'SKIN' | 'AURA_FX' | 'PET_CAT' | 'MONSTER';

export interface ArcadeShowcase {
  itemId: string;
  name: string;
  category: ArcadeCategory;
  rarity: 'SURVIVOR' | 'DEGEN' | 'LEGENDARY' | 'ARTIFACT' | 'MYTHIC';
  imageSrc?: string;
  previewColor?: string;
  effectType?: ProfileSkin;
  petCatId?: number;
  companionType?: 'cat' | 'monster' | 'fairy';
  monsterId?: string;
  fairyId?: number;
}

export interface WallPost {
  id: string;
  author: {
    displayName: string;
    address: string;
    avatarUrl: string;
    twitterHandle?: string;
    customTitle?: string;
    equippedSkin?: ProfileSkin;
    equippedPet?: string;
    equippedPetName?: string;
    equippedPetCatId?: number;
    equippedCompanionType?: 'cat' | 'monster' | 'fairy';
    equippedMonsterId?: string;
    equippedFairyId?: number;
  };
  content: string;
  category: 'HOT' | 'NEW' | 'GME LORE' | 'FUMBLES' | 'ART' | 'BAG WORK' | 'MEMES';
  timestamp: string;
  tag?: string;
  imageUrl?: string;
  arcadeShowcase?: ArcadeShowcase;
  pinned?: boolean;
  reactions: {
    cat: number;
    skull: number;
    fire: number;
    pain: number;
    comeback: number;
    based: number;
    fumble: number;
  };
  userReactions: string[];
}

export interface ArcadeItem {
  id: string;
  name: string;
  category: ArcadeCategory;
  priceInNine: number;
  description: string;
  rarity: 'SURVIVOR' | 'DEGEN' | 'LEGENDARY' | 'ARTIFACT' | 'MYTHIC';
  previewClass?: string;
  previewColor?: string;
  effectType?: ProfileSkin;
  imageSrc?: string; // animated GIF or sprite sheet
  soundEffect?: string;
  petAction?: string;
  petCatId?: number; // 1 to 6
  companionType?: 'cat' | 'monster' | 'fairy';
  monsterId?: string; // 'doux' | 'mort' | 'tard' | 'vita' | 'loki' | 'kira' | 'nico' | 'olaf'
  fairyId?: number;
  owned?: boolean;
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
