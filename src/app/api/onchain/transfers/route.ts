import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import {
  ROBINHOOD_CONFIG,
  DEFAULT_TOKEN_ADDRESS,
  BURN_ADDRESS,
} from '@/lib/onchain';
import {
  NINE_LAUNCH_BLOCK,
  GME_TOKEN_ADDRESS,
  resolveLaunchedToken,
  fetchPonsCurveTelemetry,
  getEntityTag,
  getLiveGmePriceUSD,
  PONS_CURVE_ABI,
  PONS_TOKEN_ABI,
} from '@/lib/pons';

export const dynamic = 'force-dynamic';

// ============================================================================
// IN-MEMORY INDEXING CACHE FOR ULTRA-FAST TELEMETRY
// ============================================================================
interface CachedRawTrade {
  type: 'BUY' | 'SELL';
  txHash: string;
  blockNumber: number;
  from: string;
  to: string;
  amount: number; // NINE tokens
  quoteAmount: number; // GME quote asset
  fee: number;
  tax: number;
}

interface CachedRawTransfer {
  txHash: string;
  blockNumber: number;
  from: string;
  to: string;
  amount: number;
}

let cachedCurveAddress = '';
let cachedPairAddress = '';
let lastIndexedBlock = 0;
let cachedTrades: CachedRawTrade[] = [];
let cachedTransfers: CachedRawTransfer[] = [];
let isIndexing = false;

// Robinhood Chain block time is ~0.12 seconds (~8 blocks/sec)
function calculateBlockTime(blocksAgo: number): { desc: string; exactTime: string } {
  const approxSeconds = Math.max(1, Math.round(blocksAgo * 0.12));
  const txDate = new Date(Date.now() - approxSeconds * 1000);
  const exactTime = txDate.toISOString().replace('T', ' ').substring(11, 19) + ' UTC';

  let desc: string;
  if (approxSeconds < 60) {
    desc = `${approxSeconds}s ago`;
  } else if (approxSeconds < 3600) {
    const mins = Math.floor(approxSeconds / 60);
    const secs = approxSeconds % 60;
    desc = secs > 0 ? `${mins}m ${secs}s ago` : `${mins}m ago`;
  } else if (approxSeconds < 86400) {
    const hours = Math.floor(approxSeconds / 3600);
    const mins = Math.floor((approxSeconds % 3600) / 60);
    desc = mins > 0 ? `${hours}h ${mins}m ago` : `${hours}h ago`;
  } else {
    const days = Math.floor(approxSeconds / 86400);
    const hours = Math.floor((approxSeconds % 86400) / 3600);
    desc = hours > 0 ? `${days}d ${hours}h ago` : `${days}d ago`;
  }
  return { desc, exactTime };
}

export type TransferCategory =
  | 'BURN'
  | 'WHALE_BUY'
  | 'WHALE_SELL'
  | 'WHALE_TRANSFER'
  | 'DEX_BUY'
  | 'DEX_SELL'
  | 'TRANSFER';

export interface FormattedTransfer {
  txHash: string;
  blockNumber: number;
  from: string;
  to: string;
  fromTag: string;
  toTag: string;
  fromType: string;
  toType: string;
  amount: number;
  amountUSD: number;
  quoteAmount?: number;
  quoteSymbol?: string;
  transferType: TransferCategory;
  explorerUrl: string;
  timestampDesc: string;
  exactTime: string;
}

export interface CounterpartySummary {
  address: string;
  tag: string;
  type: string;
  totalAmount: number;
  totalUSD: number;
  count: number;
  percentage?: number;
}

export interface TopActiveMover {
  address: string;
  tag: string;
  type: string;
  volume: number;
  volumeUSD: number;
  txCount: number;
}

/**
 * Performs parallel indexing of the Pons bonding curve and token transfers
 */
async function syncOnChainActivity(
  provider: ethers.JsonRpcProvider,
  curveAddress: string,
  tokenAddress: string,
  currentBlock: number
) {
  if (isIndexing) return;
  isIndexing = true;

  try {
    const curve = new ethers.Contract(curveAddress, PONS_CURVE_ABI, provider);
    const token = new ethers.Contract(tokenAddress, PONS_TOKEN_ABI, provider);

    // If curve changed or first run, initialize from launch block
    if (cachedCurveAddress !== curveAddress.toLowerCase() || lastIndexedBlock === 0) {
      cachedCurveAddress = curveAddress.toLowerCase();
      cachedTrades = [];
      cachedTransfers = [];
      lastIndexedBlock = NINE_LAUNCH_BLOCK;
    }

    const startFrom = lastIndexedBlock;
    if (startFrom >= currentBlock) {
      isIndexing = false;
      return;
    }

    // Break into parallel ranges of up to 100,000 blocks
    const chunkSize = 100000;
    const ranges: { from: number; to: number }[] = [];
    for (let f = startFrom; f <= currentBlock; f += chunkSize) {
      const t = Math.min(currentBlock, f + chunkSize - 1);
      ranges.push({ from: f, to: t });
    }

    const results = await Promise.all(
      ranges.map(async ({ from, to }) => {
        try {
          const [buys, sells, transfers] = await Promise.all([
            curve.queryFilter(curve.filters.CurveBuy(), from, to).catch(() => []),
            curve.queryFilter(curve.filters.CurveSell(), from, to).catch(() => []),
            token.queryFilter(token.filters.Transfer(), from, to).catch(() => []),
          ]);
          return { buys, sells, transfers };
        } catch (err) {
          console.warn(`Query range [${from} - ${to}] failed:`, err);
          return { buys: [], sells: [], transfers: [] };
        }
      })
    );

    const newTrades: CachedRawTrade[] = [];
    for (const r of results) {
      for (const b of r.buys as any[]) {
        newTrades.push({
          type: 'BUY',
          txHash: b.transactionHash,
          blockNumber: b.blockNumber,
          from: b.args[0], // buyer
          to: b.args[1],   // recipient
          amount: Number(ethers.formatEther(b.args[3])), // tokensOut
          quoteAmount: Number(ethers.formatEther(b.args[2])), // quoteIn (GME)
          fee: Number(ethers.formatEther(b.args[4])),
          tax: Number(ethers.formatEther(b.args[5])),
        });
      }
      for (const s of r.sells as any[]) {
        newTrades.push({
          type: 'SELL',
          txHash: s.transactionHash,
          blockNumber: s.blockNumber,
          from: s.args[0], // seller
          to: s.args[1],   // recipient
          amount: Number(ethers.formatEther(s.args[2])), // tokensIn
          quoteAmount: Number(ethers.formatEther(s.args[3])), // quoteOut (GME)
          fee: Number(ethers.formatEther(s.args[4])),
          tax: Number(ethers.formatEther(s.args[5])),
        });
      }
    }

    const newTransfers: CachedRawTransfer[] = [];
    for (const r of results) {
      for (const t of r.transfers as any[]) {
        newTransfers.push({
          txHash: t.transactionHash,
          blockNumber: t.blockNumber,
          from: t.args[0],
          to: t.args[1],
          amount: Number(ethers.formatEther(t.args[2])),
        });
      }
    }

    // Merge & deduplicate
    const tradeMap = new Map<string, CachedRawTrade>();
    for (const t of [...cachedTrades, ...newTrades]) {
      tradeMap.set(`${t.txHash.toLowerCase()}-${t.type}-${t.amount}`, t);
    }
    cachedTrades = Array.from(tradeMap.values());

    const transferMap = new Map<string, CachedRawTransfer>();
    for (const t of [...cachedTransfers, ...newTransfers]) {
      transferMap.set(`${t.txHash.toLowerCase()}-${t.from}-${t.to}-${t.amount}`, t);
    }
    cachedTransfers = Array.from(transferMap.values());

    lastIndexedBlock = currentBlock;
  } catch (err) {
    console.error('Error syncing onchain activity:', err);
  } finally {
    isIndexing = false;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetWallet = searchParams.get('wallet');

    const provider = new ethers.JsonRpcProvider(ROBINHOOD_CONFIG.rpcUrl);

    // 1. Resolve token launch & curve from Pons Factory
    const launch = await resolveLaunchedToken(provider, DEFAULT_TOKEN_ADDRESS);
    if (!launch || !launch.curve || launch.curve === ethers.ZeroAddress) {
      return NextResponse.json({
        success: true,
        transfers: [],
        currentBlock: 0,
        livePriceUSD: 0,
        totalVolumeMoved: 0,
        burnsCount: 0,
        dexBuysCount: 0,
        dexSellsCount: 0,
        whaleMovesCount: 0,
        topActiveMovers: [],
        awaitingLaunch: true,
      });
    }

    // 2. Fetch live curve telemetry & current block
    const telemetry = await fetchPonsCurveTelemetry(provider, DEFAULT_TOKEN_ADDRESS);
    const currentBlock = telemetry?.currentBlock || (await provider.getBlockNumber());
    const livePriceUSD = telemetry?.spotPriceUSD || 0.000007608;
    const priceInQuote = telemetry?.spotPriceInQuote || 0.0000003223;
    const quoteSymbol = telemetry?.pairSymbol || 'GME';
    const gmePriceUSD = telemetry?.gmePriceUSD || 23.602;
    const marketCapUSD = telemetry?.marketCapUSD || livePriceUSD * 1000000000;
    const raisedUSD = telemetry?.raisedUSD || 0;

    // 3. Ensure events are synced
    await syncOnChainActivity(provider, launch.curve, DEFAULT_TOKEN_ADDRESS, currentBlock);

    // 4. Build unified transfer log
    const tradeTxHashes = new Set(cachedTrades.map((t) => t.txHash.toLowerCase()));
    const unifiedFeed: FormattedTransfer[] = [];

    // Add DEX Buys & Sells from Curve
    for (const trade of cachedTrades) {
      const fromAddr = trade.type === 'BUY' ? launch.curve : trade.from;
      const toAddr = trade.type === 'BUY' ? trade.to : launch.curve;

      const fromInfo = getEntityTag(fromAddr, launch.curve, DEFAULT_TOKEN_ADDRESS);
      const toInfo = getEntityTag(toAddr, launch.curve, DEFAULT_TOKEN_ADDRESS);

      // Exact USD value of the trade settled on the curve (quote in / quote out * GME price)
      const rawTradeUSD = trade.quoteAmount * gmePriceUSD;
      const amountUSD = rawTradeUSD < 0.01 ? Number(rawTradeUSD.toFixed(4)) : Number(rawTradeUSD.toFixed(2));
      const isWhale = trade.amount >= 5000000 || amountUSD >= 50;

      let transferType: TransferCategory =
        trade.type === 'BUY'
          ? isWhale
            ? 'WHALE_BUY'
            : 'DEX_BUY'
          : isWhale
          ? 'WHALE_SELL'
          : 'DEX_SELL';

      const blocksAgo = Math.max(0, currentBlock - trade.blockNumber);
      const { desc, exactTime } = calculateBlockTime(blocksAgo);

      unifiedFeed.push({
        txHash: trade.txHash,
        blockNumber: trade.blockNumber,
        from: fromAddr,
        to: toAddr,
        fromTag: fromInfo.label,
        toTag: toInfo.label,
        fromType: fromInfo.type,
        toType: toInfo.type,
        amount: trade.amount,
        amountUSD,
        quoteAmount: Number(trade.quoteAmount.toFixed(4)),
        quoteSymbol,
        transferType,
        explorerUrl: `${ROBINHOOD_CONFIG.blockExplorerUrl}/tx/${trade.txHash}`,
        timestampDesc: desc,
        exactTime,
      });
    }

    // Add non-curve transfers (Burns and P2P transfers)
    for (const t of cachedTransfers) {
      if (tradeTxHashes.has(t.txHash.toLowerCase())) continue; // Skip if already part of a curve buy/sell
      if (t.from === ethers.ZeroAddress) continue; // Skip initial genesis mint to curve

      const isBurn = t.to.toLowerCase() === BURN_ADDRESS.toLowerCase();
      const rawTransferUSD = t.amount * livePriceUSD;
      const amountUSD = rawTransferUSD < 0.01 ? Number(rawTransferUSD.toFixed(4)) : Number(rawTransferUSD.toFixed(2));
      const isWhale = t.amount >= 5000000 || amountUSD >= 50;

      const fromInfo = getEntityTag(t.from, launch.curve, DEFAULT_TOKEN_ADDRESS);
      const toInfo = getEntityTag(t.to, launch.curve, DEFAULT_TOKEN_ADDRESS);

      let transferType: TransferCategory = 'TRANSFER';
      if (isBurn) {
        transferType = 'BURN';
      } else if (isWhale) {
        transferType = 'WHALE_TRANSFER';
      }

      const blocksAgo = Math.max(0, currentBlock - t.blockNumber);
      const { desc, exactTime } = calculateBlockTime(blocksAgo);

      unifiedFeed.push({
        txHash: t.txHash,
        blockNumber: t.blockNumber,
        from: t.from,
        to: t.to,
        fromTag: fromInfo.label,
        toTag: toInfo.label,
        fromType: fromInfo.type,
        toType: toInfo.type,
        amount: t.amount,
        amountUSD,
        quoteAmount: 0,
        quoteSymbol,
        transferType,
        explorerUrl: `${ROBINHOOD_CONFIG.blockExplorerUrl}/tx/${t.txHash}`,
        timestampDesc: desc,
        exactTime,
      });
    }

    // Sort by block number descending (most recent first)
    unifiedFeed.sort((a, b) => b.blockNumber - a.blockNumber);

    // ========================================================
    // CASE A: WALLET SPECIFIC DOSSIER TRACER
    // ========================================================
    if (targetWallet && ethers.isAddress(targetWallet)) {
      const targetLower = targetWallet.toLowerCase();
      const walletTransfers = unifiedFeed.filter(
        (item) => item.from.toLowerCase() === targetLower || item.to.toLowerCase() === targetLower
      );

      const tokenContract = new ethers.Contract(DEFAULT_TOKEN_ADDRESS, PONS_TOKEN_ABI, provider);
      const walletBalanceWei = await tokenContract.balanceOf(targetWallet).catch(() => 0n);
      const walletBalance = Number(ethers.formatEther(walletBalanceWei));
      const walletBalanceUSD = Number((walletBalance * livePriceUSD).toFixed(2));

      let totalInflow = 0;
      let totalOutflow = 0;
      let burnContribution = 0;

      const sendersMap = new Map<string, { total: number; count: number }>();
      const receiversMap = new Map<string, { total: number; count: number }>();

      walletTransfers.forEach((tx) => {
        const isIncoming = tx.to.toLowerCase() === targetLower;
        if (isIncoming) {
          totalInflow += tx.amount;
          const prev = sendersMap.get(tx.from.toLowerCase()) || { total: 0, count: 0 };
          sendersMap.set(tx.from.toLowerCase(), { total: prev.total + tx.amount, count: prev.count + 1 });
        } else {
          totalOutflow += tx.amount;
          const prev = receiversMap.get(tx.to.toLowerCase()) || { total: 0, count: 0 };
          receiversMap.set(tx.to.toLowerCase(), { total: prev.total + tx.amount, count: prev.count + 1 });
          if (tx.to.toLowerCase() === BURN_ADDRESS.toLowerCase()) {
            burnContribution += tx.amount;
          }
        }
      });

      const topSenders: CounterpartySummary[] = Array.from(sendersMap.entries())
        .map(([addr, data]) => {
          const info = getEntityTag(addr, launch.curve, DEFAULT_TOKEN_ADDRESS);
          const pct = totalInflow > 0 ? Math.round((data.total / totalInflow) * 100) : 0;
          return {
            address: addr,
            tag: info.label,
            type: info.type,
            totalAmount: Number(data.total.toFixed(2)),
            totalUSD: Number((data.total * livePriceUSD).toFixed(2)),
            count: data.count,
            percentage: pct,
          };
        })
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 5);

      const topReceivers: CounterpartySummary[] = Array.from(receiversMap.entries())
        .map(([addr, data]) => {
          const info = getEntityTag(addr, launch.curve, DEFAULT_TOKEN_ADDRESS);
          const pct = totalOutflow > 0 ? Math.round((data.total / totalOutflow) * 100) : 0;
          return {
            address: addr,
            tag: info.label,
            type: info.type,
            totalAmount: Number(data.total.toFixed(2)),
            totalUSD: Number((data.total * livePriceUSD).toFixed(2)),
            count: data.count,
            percentage: pct,
          };
        })
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 5);

      const isDead = targetLower === BURN_ADDRESS.toLowerCase();
      let retentionRate = 0;
      if (isDead) {
        retentionRate = 100;
      } else if (totalInflow > 0) {
        retentionRate = Math.min(100, Math.max(0, Number(((walletBalance / totalInflow) * 100).toFixed(1))));
      } else if (walletBalance > 0) {
        retentionRate = 100;
      }

      let verdict = 'ACTIVE BAG WORKER';
      let verdictDetail = 'Trading and transacting on Pons Launchpad v2 (Robinhood Chain).';

      if (isDead) {
        verdict = 'PERMANENT DEFLATIONARY DEAD VAULT';
        verdictDetail = 'Tokens here are verifiably destroyed and permanently unspendable forever.';
      } else if (walletBalance > 10000000 && retentionRate >= 70) {
        verdict = 'DIAMOND PAWS MEGA-WHALE';
        verdictDetail = `Retaining ${retentionRate}% of all received $NINE in diamond hands conviction.`;
      } else if (totalInflow > 0 && totalOutflow === 0) {
        verdict = 'PURE ACCUMULATOR (0% OUTFLOW)';
        verdictDetail = 'Wallet has only accumulated on the curve and never sold a single $NINE.';
      } else if (totalOutflow > totalInflow * 1.2) {
        verdict = 'CURVE ROTATOR / PAPERHAND TRADER';
        verdictDetail = 'Liquidated position back into the Pons bonding curve.';
      } else if (burnContribution > 0) {
        verdict = 'COMMUNITY BURN CONTRIBUTOR';
        verdictDetail = `Has personally incinerated ${burnContribution.toLocaleString()} $NINE to the Dead Vault.`;
      } else if (walletBalance > 100000) {
        verdict = 'STRATEGIC BAG HOLDER';
        verdictDetail = `Maintaining a solid bag of ${Math.round(walletBalance).toLocaleString()} $NINE on-chain.`;
      }

      return NextResponse.json({
        success: true,
        isWalletQuery: true,
        targetWallet,
        currentBlock,
        livePriceUSD,
        priceInQuote,
        quoteSymbol,
        walletBalance,
        walletBalanceUSD,
        totalInflow: Number(totalInflow.toFixed(2)),
        totalInflowUSD: Number((totalInflow * livePriceUSD).toFixed(2)),
        totalOutflow: Number(totalOutflow.toFixed(2)),
        totalOutflowUSD: Number((totalOutflow * livePriceUSD).toFixed(2)),
        netFlow: Number((totalInflow - totalOutflow).toFixed(2)),
        netFlowUSD: Number(((totalInflow - totalOutflow) * livePriceUSD).toFixed(2)),
        burnContribution: Number(burnContribution.toFixed(2)),
        retentionRate,
        verdict,
        verdictDetail,
        topSenders,
        topReceivers,
        transfersCount: walletTransfers.length,
        transfers: walletTransfers,
      });
    }

    // ========================================================
    // CASE B: MACRO REAL-TIME TERMINAL STREAM
    // ========================================================
    let totalVolumeMoved = 0;
    let dexBuysCount = 0;
    let dexSellsCount = 0;
    let burnsCount = 0;
    let whaleMovesCount = 0;

    const volumeByWallet = new Map<string, { volume: number; txCount: number }>();
    const uniqueWallets = new Set<string>();

    for (const item of unifiedFeed) {
      totalVolumeMoved += item.amount;
      uniqueWallets.add(item.from.toLowerCase());
      uniqueWallets.add(item.to.toLowerCase());

      const fromVol = volumeByWallet.get(item.from.toLowerCase()) || { volume: 0, txCount: 0 };
      volumeByWallet.set(item.from.toLowerCase(), {
        volume: fromVol.volume + item.amount,
        txCount: fromVol.txCount + 1,
      });

      if (item.transferType === 'DEX_BUY' || item.transferType === 'WHALE_BUY') {
        dexBuysCount++;
      }
      if (item.transferType === 'DEX_SELL' || item.transferType === 'WHALE_SELL') {
        dexSellsCount++;
      }
      if (item.transferType === 'BURN') {
        burnsCount++;
      }
      if (
        item.transferType === 'WHALE_BUY' ||
        item.transferType === 'WHALE_SELL' ||
        item.transferType === 'WHALE_TRANSFER'
      ) {
        whaleMovesCount++;
      }
    }

    const topActiveMovers: TopActiveMover[] = Array.from(volumeByWallet.entries())
      .filter(([addr]) => {
        const lower = addr.toLowerCase();
        return (
          lower !== DEFAULT_TOKEN_ADDRESS.toLowerCase() &&
          lower !== launch.curve.toLowerCase() &&
          lower !== BURN_ADDRESS.toLowerCase()
        );
      })
      .map(([addr, data]) => {
        const info = getEntityTag(addr, launch.curve, DEFAULT_TOKEN_ADDRESS);
        return {
          address: addr,
          tag: info.label,
          type: info.type,
          volume: Math.round(data.volume),
          volumeUSD: Math.round(data.volume * livePriceUSD),
          txCount: data.txCount,
        };
      })
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 6);

    return NextResponse.json({
      success: true,
      isWalletQuery: false,
      currentBlock,
      livePriceUSD,
      priceInQuote,
      quoteSymbol,
      gmePriceUSD,
      marketCapUSD,
      raisedUSD,
      curveAddress: launch.curve,
      pairTokenAddress: launch.pairToken,
      phase: launch.phase,
      phaseLabel: telemetry?.phaseLabel || 'NotGraduated',
      quoteRaised: telemetry?.realQuoteRaised || 0,
      quoteThreshold: telemetry?.quoteThreshold || 369,
      graduationProgressPct: telemetry?.graduationProgressPct || 0,
      sellableTokens: telemetry?.sellableTokens || 0,
      totalTrackedInWindow: unifiedFeed.length,
      totalVolumeMoved: Math.round(totalVolumeMoved),
      totalVolumeUSD: Math.round(totalVolumeMoved * livePriceUSD),
      whaleMovesCount,
      burnsCount,
      dexBuysCount,
      dexSellsCount,
      activeWalletsCount: uniqueWallets.size,
      tokenSymbol: 'NINE',
      tokenName: 'NINE',
      topActiveMovers,
      transfers: unifiedFeed.slice(0, 100),
    });
  } catch (error: any) {
    console.error('Error fetching onchain transfers:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to query on-chain transfers',
      },
      { status: 500 }
    );
  }
}
