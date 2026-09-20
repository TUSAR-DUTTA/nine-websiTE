import { Fumble } from '@/types';

export interface LiveTokenMarketData {
  name: string;
  symbol: string;
  address: string;
  pairAddress: string;
  chain: string;
  priceUSD: number;
  peakPrice24h: number;
  athPriceUSD: number;
  change24h: number;
  volume24hUSD: number;
  liquidityUSD: number;
  marketCapUSD: number;
  buys24h: number;
  sells24h: number;
  explorerBaseUrl: string;
  launchDaysAgo: number;
  launchMCUSD: number;
  // Advanced Macro Telemetry
  totalDumpedTokensTracked: number;
  totalFumbledUSD: number;
  highestFumbleUSD: number;
  highestMissedPct: number;
  totalTrackedWallets: number;
  totalSupply: number;
  chainBlockHeight: number;
}

export const ROBINHOOD_CONFIG_FUMBLES = {
  tokenAddress: process.env.NEXT_PUBLIC_TOKEN_ADDRESS || '',
  tokenSymbol: 'NINE',
  tokenName: '$NINE',
  pairAddress: process.env.NEXT_PUBLIC_PAIR_ADDRESS || '',
  chainId: 'robinhood',
  chainName: 'Robinhood Chain',
  coinGeckoApiKey: process.env.COINGECKO_API_KEY || '',
  explorerUrl: 'https://robinhoodchain.blockscout.com',
};

// Verified on-chain historical seller transactions on Robinhood Chain (Populates on launch)
interface HistoricalTxRecord {
  id: string;
  txHash: string;
  sellerWallet: string;
  tokens: number;
  priceAtSale: number;
  mcAtSale: string;
  era: 'GENESIS' | 'EARLY' | 'MID' | 'INTRADAY';
  eraLabel: string;
  daysAgo: number;
  remainingTokens: number;
  percentExited: number;
  walletTag: string;
  strategyClassification: string;
  totalSwapsCount: string;
  customQuote?: string;
  reactions: { lol: number; pain: number; respect: number; cooked: number; comeback: number };
}

const VERIFIED_HISTORICAL_TXS: HistoricalTxRecord[] = [];

let cachedMarketData: LiveTokenMarketData | null = null;
let cachedFumbles: Fumble[] = [];
let lastFetchTime = 0;
const CACHE_TTL_MS = 10000;

export async function fetchRobinhoodChainLiveFumbles(): Promise<{
  marketData: LiveTokenMarketData;
  fumbles: Fumble[];
}> {
  const now = Date.now();
  if (cachedMarketData && cachedFumbles.length > 0 && now - lastFetchTime < CACHE_TTL_MS) {
    return { marketData: cachedMarketData, fumbles: cachedFumbles };
  }

  const tokenAddr = ROBINHOOD_CONFIG_FUMBLES.tokenAddress;
  const pairAddr = ROBINHOOD_CONFIG_FUMBLES.pairAddress;

  // Clean pre-launch state if no real pool has been deployed yet
  const defaultMarketData: LiveTokenMarketData = {
    name: '$NINE',
    symbol: 'NINE',
    address: tokenAddr || 'Pending Official Launch',
    pairAddress: pairAddr || 'Pending Official Launch',
    chain: 'Robinhood Chain (Mainnet 4663)',
    priceUSD: 0,
    peakPrice24h: 0,
    athPriceUSD: 0,
    change24h: 0,
    volume24hUSD: 0,
    liquidityUSD: 0,
    marketCapUSD: 0,
    buys24h: 0,
    sells24h: 0,
    explorerBaseUrl: ROBINHOOD_CONFIG_FUMBLES.explorerUrl,
    launchDaysAgo: 0,
    launchMCUSD: 0,
    totalDumpedTokensTracked: 0,
    totalFumbledUSD: 0,
    highestFumbleUSD: 0,
    highestMissedPct: 0,
    totalTrackedWallets: 0,
    totalSupply: 1000000000,
    chainBlockHeight: 67158000,
  };

  // If there is no real deployed pair configured, return clean launch-ready state
  if (!pairAddr || !pairAddr.startsWith('0x') || pairAddr.length < 42) {
    cachedMarketData = defaultMarketData;
    cachedFumbles = [];
    lastFetchTime = now;
    return { marketData: defaultMarketData, fumbles: [] };
  }

  try {
    // 1. Ingest live pool telemetry from DexScreener if a pair exists
    const pairUrl = `https://api.dexscreener.com/latest/dex/pairs/${ROBINHOOD_CONFIG_FUMBLES.chainId}/${pairAddr}`;
    const pairRes = await fetch(pairUrl, { next: { revalidate: 10 } });
    const pairJson = await pairRes.json();
    const pair = pairJson?.pair || pairJson?.pairs?.[0];

    if (!pair) {
      return { marketData: defaultMarketData, fumbles: [] };
    }

    const currentPrice = Number(pair?.priceUsd || 0);
    const change24h = Number(pair?.priceChange?.h24 || 0);
    const peakPrice24h = change24h < 0 && currentPrice > 0
      ? currentPrice / (1 + change24h / 100)
      : currentPrice;
    const athPriceUSD = Math.max(currentPrice, Number(peakPrice24h.toFixed(6)));

    // 2. Fetch real-time recent 24h DEX sells from GeckoTerminal
    let recentFumbles: Fumble[] = [];
    if (ROBINHOOD_CONFIG_FUMBLES.coinGeckoApiKey) {
      try {
        const tradesUrl = `https://api.geckoterminal.com/api/v2/networks/${ROBINHOOD_CONFIG_FUMBLES.chainId}/pools/${pairAddr}/trades`;
        const tradesRes = await fetch(tradesUrl, {
          headers: {
            'x-cg-demo-api-key': ROBINHOOD_CONFIG_FUMBLES.coinGeckoApiKey,
            Accept: 'application/json',
          },
          next: { revalidate: 10 },
        });

        const tradesJson = await tradesRes.json();
        const trades = tradesJson?.data || [];
        const sells = trades.filter((t: any) => t.attributes?.kind === 'sell');

        recentFumbles = sells.slice(0, 15).map((t: any, idx: number) => {
          const attr = t.attributes;
          const soldTokens = Number(attr.from_token_amount || 0);
          const soldUSD = Number(attr.volume_in_usd || 0);
          const sellPrice = Number(attr.price_from_in_usd || currentPrice);
          const peakVal = soldTokens * peakPrice24h;
          const leftOnTable = Math.max(0, peakVal - soldUSD);
          const missedPct = sellPrice > 0 ? Math.round(((peakPrice24h - sellPrice) / sellPrice) * 100) : 0;

          const tradeDate = new Date(attr.block_timestamp);
          const diffMinutes = Math.max(1, Math.round((now - tradeDate.getTime()) / 60000));
          const timeAgo = diffMinutes < 60 ? `${diffMinutes}m ago` : `${Math.round(diffMinutes / 60)}h ago`;

          const wallet = attr.tx_from_address || '';
          const shortWallet = wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : '0x...';
          const txHash = attr.tx_hash || '';

          return {
            id: `rh-live-${idx}`,
            code: `RH-DEX #${String(idx + 1).padStart(4, '0')}`,
            wallet: wallet,
            shortWallet: shortWallet,
            boughtAmountUSD: Math.round(peakVal),
            soldAmountUSD: Math.round(soldUSD),
            lossUSD: Math.round(leftOnTable),
            missedPercent: Math.max(0, missedPct),
            statusQuote: `"SOLD ${Math.round(soldTokens).toLocaleString()} $NINE ON DEX"`,
            timestamp: timeAgo,
            contextStory: `Sold ${Math.round(soldTokens).toLocaleString()} $NINE at $${sellPrice.toFixed(6)} on Uniswap v4 (Robinhood Chain).`,
            txHash: txHash,
            explorerUrl: `${ROBINHOOD_CONFIG_FUMBLES.explorerUrl}/tx/${txHash}`,
            walletExplorerUrl: `${ROBINHOOD_CONFIG_FUMBLES.explorerUrl}/address/${wallet}`,
            tokenSymbol: 'NINE',
            era: 'INTRADAY',
            eraLabel: '24H RECENT',
            marketCapAtSale: `~$${Math.round((currentPrice * 1000000000) / 1000000)}M MC`,
            tokenAmount: Math.round(soldTokens),
            remainingTokens: 0,
            percentExited: 100.0,
            walletTag: '⚡ ON-CHAIN DUMP',
            strategyClassification: 'DEX SELL',
            totalSwapsCount: '1 DEX Swap',
            realizedUSD: Math.round(soldUSD),
            athPeakUSD: Math.round(peakVal),
            reactions: { lol: 0, pain: 0, respect: 0, cooked: 0, comeback: 0 },
          };
        });
      } catch (tradeErr) {
        console.warn('GeckoTerminal trades fetch failed:', tradeErr);
      }
    }

    const combinedFumbles: Fumble[] = [...recentFumbles];

    const totalDumped = combinedFumbles.reduce((acc, f) => acc + (f.tokenAmount || 0), 0);
    const totalFumbled = combinedFumbles.reduce((acc, f) => acc + (f.lossUSD || 0), 0);
    const maxLoss = combinedFumbles.length > 0 ? Math.max(...combinedFumbles.map((f) => f.lossUSD)) : 0;
    const maxMissedPct = combinedFumbles.length > 0 ? Math.max(...combinedFumbles.map((f) => f.missedPercent)) : 0;
    const uniqueWallets = new Set(combinedFumbles.map((f) => f.wallet.toLowerCase())).size;

    const marketData: LiveTokenMarketData = {
      name: '$NINE',
      symbol: 'NINE',
      address: tokenAddr,
      pairAddress: pairAddr,
      chain: 'Robinhood Chain',
      priceUSD: currentPrice,
      peakPrice24h: Number(peakPrice24h.toFixed(6)),
      athPriceUSD: athPriceUSD,
      change24h: change24h,
      volume24hUSD: Number(pair?.volume?.h24 || 0),
      liquidityUSD: Number(pair?.liquidity?.usd || 0),
      marketCapUSD: Number(pair?.fdv || pair?.marketCap || 0),
      buys24h: Number(pair?.txns?.h24?.buys || 0),
      sells24h: Number(pair?.txns?.h24?.sells || 0),
      explorerBaseUrl: ROBINHOOD_CONFIG_FUMBLES.explorerUrl,
      launchDaysAgo: 0,
      launchMCUSD: 0,
      totalDumpedTokensTracked: totalDumped,
      totalFumbledUSD: totalFumbled,
      highestFumbleUSD: maxLoss,
      highestMissedPct: maxMissedPct,
      totalTrackedWallets: uniqueWallets,
      totalSupply: 1000000000,
      chainBlockHeight: 67158000,
    };

    cachedMarketData = marketData;
    cachedFumbles = combinedFumbles;
    lastFetchTime = now;

    return { marketData, fumbles: combinedFumbles };
  } catch (err) {
    console.error('Error fetching live Robinhood chain fumbles:', err);
    return { marketData: defaultMarketData, fumbles: [] };
  }
}
