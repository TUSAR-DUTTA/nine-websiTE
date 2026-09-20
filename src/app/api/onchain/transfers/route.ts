import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import {
  ROBINHOOD_CONFIG,
  DEFAULT_TOKEN_ADDRESS,
  BURN_ADDRESS,
  ERC20_ABI,
} from '@/lib/onchain';

export const dynamic = 'force-dynamic';

// Dynamic price caching
let cachedPriceUSD = 0;
let lastPriceFetchTimestamp = 0;

async function getLivePriceUSD(): Promise<number> {
  if (!DEFAULT_TOKEN_ADDRESS || !DEFAULT_TOKEN_ADDRESS.startsWith('0x') || DEFAULT_TOKEN_ADDRESS === '0x0000000000000000000000000000000000000000') {
    return 0;
  }
  const now = Date.now();
  if (now - lastPriceFetchTimestamp < 30000 && cachedPriceUSD > 0) {
    return cachedPriceUSD;
  }
  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${DEFAULT_TOKEN_ADDRESS}`,
      { next: { revalidate: 30 } }
    );
    if (res.ok) {
      const data = await res.json();
      if (data?.pairs?.[0]?.priceUsd) {
        cachedPriceUSD = parseFloat(data.pairs[0].priceUsd);
        lastPriceFetchTimestamp = now;
      }
    }
  } catch (err) {
    // Keep cached fallback
  }
  return cachedPriceUSD;
}

// Known Robinhood Chain Entities
const KNOWN_ENTITIES: Record<string, { label: string; type: 'BURN' | 'DEX' | 'ROUTER' | 'TOKEN' | 'WHALE' }> = {
  [BURN_ADDRESS.toLowerCase()]: { label: '🔥 Dead Burn Vault', type: 'BURN' },
  ...(DEFAULT_TOKEN_ADDRESS && DEFAULT_TOKEN_ADDRESS.startsWith('0x') ? { [DEFAULT_TOKEN_ADDRESS.toLowerCase()]: { label: '🐱 $NINE Token Contract', type: 'TOKEN' } } : {}),
  '0x8366a39cc670b4001a1121b8f6a443a643e40951': { label: '🔄 Uniswap v4 Router / Pool', type: 'DEX' },
  '0x6f02324d20cc679d0e585290caa6b16bacbc0f77': { label: '⚡ Uniswap v4 Settlement Vault', type: 'ROUTER' },
  '0x35d217b10f974a49f1bfd369fc5c85b597ae09a1': { label: '⚡ Robinhood DEX Settlement', type: 'ROUTER' },
  '0x0000000071647c6c1ae028daf9f80c000beac2cc': { label: '⚡ DEX Execution Agent', type: 'ROUTER' },
  '0x204faca1764b154221e35c0d20abb3c525710498': { label: '🐋 Whale Alpha Operative', type: 'WHALE' },
  '0xd246c518244a6e41f71d89d3f6aeb81b837565cc': { label: '💼 Active Bag Worker', type: 'WHALE' },
  '0x8f10b468b06c6fd214b65f87778827f7d113f996': { label: '💼 Active Bag Worker #2', type: 'WHALE' },
  '0xd1843da3ef8336d0464a6d9935119964d6243167': { label: '💼 Active Bag Worker #3', type: 'WHALE' },
  '0x69322d1527f0071de9b265fc213c8645e93f1f9f': { label: '💼 Active Operative #4', type: 'WHALE' },
  '0x02b50609956ae61f528a0c3b428476657d3334f2': { label: '🛡️ Diamond Paws Holder', type: 'WHALE' },
};

function getAddressTag(address: string): { label: string; isKnown: boolean; type: string } {
  const lower = address.toLowerCase();
  if (KNOWN_ENTITIES[lower]) {
    return { label: KNOWN_ENTITIES[lower].label, isKnown: true, type: KNOWN_ENTITIES[lower].type };
  }
  return {
    label: `${address.slice(0, 6)}...${address.slice(-4)}`,
    isKnown: false,
    type: 'OPERATIVE',
  };
}

// Robinhood Chain block time is ~0.12 seconds per block (~8 blocks per second)
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
  } else {
    const hours = Math.floor(approxSeconds / 3600);
    const mins = Math.floor((approxSeconds % 3600) / 60);
    desc = mins > 0 ? `${hours}h ${mins}m ago` : `${hours}h ago`;
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetWallet = searchParams.get('wallet');

    // If token contract address is not yet configured on Robinhood Chain, return clean launch-ready telemetry
    if (!DEFAULT_TOKEN_ADDRESS || !DEFAULT_TOKEN_ADDRESS.startsWith('0x') || DEFAULT_TOKEN_ADDRESS === '0x0000000000000000000000000000000000000000') {
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

    const [priceUSD, provider] = await Promise.all([
      getLivePriceUSD(),
      new ethers.JsonRpcProvider(ROBINHOOD_CONFIG.rpcUrl),
    ]);

    const tokenContract = new ethers.Contract(DEFAULT_TOKEN_ADDRESS, ERC20_ABI, provider);
    const currentBlock = await provider.getBlockNumber();

    // ========================================================
    // CASE A: WALLET SPECIFIC PATH TRACER ("WHERE DID THE CAT GO?")
    // ========================================================
    if (targetWallet && ethers.isAddress(targetWallet)) {
      const filterFrom = tokenContract.filters.Transfer(targetWallet, null);
      const filterTo = tokenContract.filters.Transfer(null, targetWallet);

      // Search last 18,000 blocks (~35-45 minutes on Robinhood chain)
      const lookback = 18000;
      const startBlock = Math.max(0, currentBlock - lookback);

      const [logsFrom, logsTo, walletBalanceWei] = await Promise.all([
        tokenContract.queryFilter(filterFrom, startBlock, currentBlock).catch(() => []),
        tokenContract.queryFilter(filterTo, startBlock, currentBlock).catch(() => []),
        tokenContract.balanceOf(targetWallet).catch(() => BigInt(0)),
      ]);

      const walletBalance = Number(ethers.formatEther(walletBalanceWei));
      const walletBalanceUSD = Number((walletBalance * priceUSD).toFixed(2));

      const allLogs = [...logsFrom, ...logsTo];
      const seen = new Set<string>();
      const uniqueLogs = allLogs.filter((log: any) => {
        const key = `${log.transactionHash}-${log.index ?? log.logIndex ?? ''}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      let totalInflow = 0;
      let totalOutflow = 0;
      let burnContribution = 0;

      const sendersMap = new Map<string, { total: number; count: number }>();
      const receiversMap = new Map<string, { total: number; count: number }>();

      const formattedTransfers: FormattedTransfer[] = uniqueLogs.map((log: any) => {
        const from = log.args[0];
        const to = log.args[1];
        const amount = Number(ethers.formatEther(log.args[2]));
        const amountUSD = Number((amount * priceUSD).toFixed(2));
        const fromInfo = getAddressTag(from);
        const toInfo = getAddressTag(to);

        const isIncoming = to.toLowerCase() === targetWallet.toLowerCase();
        if (isIncoming) {
          totalInflow += amount;
          const prev = sendersMap.get(from.toLowerCase()) || { total: 0, count: 0 };
          sendersMap.set(from.toLowerCase(), { total: prev.total + amount, count: prev.count + 1 });
        } else {
          totalOutflow += amount;
          const prev = receiversMap.get(to.toLowerCase()) || { total: 0, count: 0 };
          receiversMap.set(to.toLowerCase(), { total: prev.total + amount, count: prev.count + 1 });
          if (to.toLowerCase() === BURN_ADDRESS.toLowerCase()) {
            burnContribution += amount;
          }
        }

        const isBurn = to.toLowerCase() === BURN_ADDRESS.toLowerCase();
        const isFromDEX = fromInfo.type === 'DEX' || fromInfo.type === 'ROUTER';
        const isToDEX = toInfo.type === 'DEX' || toInfo.type === 'ROUTER';
        const isWhaleAmount = amount >= 5000 || amountUSD >= 1000;

        let transferType: TransferCategory = 'TRANSFER';
        if (isBurn) {
          transferType = 'BURN';
        } else if (isFromDEX) {
          transferType = isWhaleAmount ? 'WHALE_BUY' : 'DEX_BUY';
        } else if (isToDEX) {
          transferType = isWhaleAmount ? 'WHALE_SELL' : 'DEX_SELL';
        } else if (isWhaleAmount) {
          transferType = 'WHALE_TRANSFER';
        } else {
          transferType = 'TRANSFER';
        }

        const blocksAgo = Math.max(0, currentBlock - log.blockNumber);
        const { desc, exactTime } = calculateBlockTime(blocksAgo);

        return {
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
          from,
          to,
          fromTag: fromInfo.label,
          toTag: toInfo.label,
          fromType: fromInfo.type,
          toType: toInfo.type,
          amount,
          amountUSD,
          transferType,
          explorerUrl: `${ROBINHOOD_CONFIG.blockExplorerUrl}/tx/${log.transactionHash}`,
          timestampDesc: desc,
          exactTime,
        };
      });

      formattedTransfers.sort((a, b) => b.blockNumber - a.blockNumber);

      // Build Top Senders Breakdown
      const topSenders: CounterpartySummary[] = Array.from(sendersMap.entries())
        .map(([addr, data]) => {
          const info = getAddressTag(addr);
          const pct = totalInflow > 0 ? Math.round((data.total / totalInflow) * 100) : 0;
          return {
            address: addr,
            tag: info.label,
            type: info.type,
            totalAmount: Number(data.total.toFixed(2)),
            totalUSD: Number((data.total * priceUSD).toFixed(2)),
            count: data.count,
            percentage: pct,
          };
        })
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 5);

      // Build Top Receivers Breakdown
      const topReceivers: CounterpartySummary[] = Array.from(receiversMap.entries())
        .map(([addr, data]) => {
          const info = getAddressTag(addr);
          const pct = totalOutflow > 0 ? Math.round((data.total / totalOutflow) * 100) : 0;
          return {
            address: addr,
            tag: info.label,
            type: info.type,
            totalAmount: Number(data.total.toFixed(2)),
            totalUSD: Number((data.total * priceUSD).toFixed(2)),
            count: data.count,
            percentage: pct,
          };
        })
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 5);

      // Cat Retention Score & Flow Metrics
      const isDead = targetWallet.toLowerCase() === BURN_ADDRESS.toLowerCase();
      let retentionRate = 0;
      if (isDead) {
        retentionRate = 100;
      } else if (totalInflow > 0) {
        retentionRate = Math.min(100, Math.max(0, Number(((walletBalance / totalInflow) * 100).toFixed(1))));
      } else if (walletBalance > 0) {
        retentionRate = 100;
      }

      // Classification Verdict & Detailed Story
      let verdict = 'ACTIVE BAG WORKER';
      let verdictDetail = 'Trading and transacting on Robinhood Chain Mainnet.';

      if (isDead) {
        verdict = 'PERMANENT DEFLATIONARY DEAD VAULT';
        verdictDetail = 'Tokens here are verifiably destroyed and permanently unspendable forever.';
      } else if (walletBalance > 50000 && retentionRate >= 70) {
        verdict = 'DIAMOND PAWS MEGA-WHALE';
        verdictDetail = `Retaining ${retentionRate}% of all received $NINE in diamond hands conviction.`;
      } else if (totalInflow > 0 && totalOutflow === 0) {
        verdict = 'PURE ACCUMULATOR (0% OUTFLOW)';
        verdictDetail = 'Wallet has only received tokens and never sold or transferred a single $NINE out.';
      } else if (totalOutflow > totalInflow * 1.5) {
        verdict = 'DEX ROTATOR / DISTRIBUTOR';
        verdictDetail = 'Actively circulating and distributing bags back into DEX liquidity.';
      } else if (burnContribution > 0) {
        verdict = 'COMMUNITY BURN CONTRIBUTOR';
        verdictDetail = `Has personally incinerated ${burnContribution.toLocaleString()} $NINE to the Dead Vault.`;
      } else if (walletBalance > 2000) {
        verdict = 'STRATEGIC BAG HOLDER';
        verdictDetail = `Maintaining a solid bag of ${Math.round(walletBalance).toLocaleString()} $NINE on-chain.`;
      }

      return NextResponse.json({
        success: true,
        isWalletQuery: true,
        targetWallet,
        currentBlock,
        livePriceUSD: priceUSD,
        walletBalance,
        walletBalanceUSD,
        totalInflow: Number(totalInflow.toFixed(2)),
        totalInflowUSD: Number((totalInflow * priceUSD).toFixed(2)),
        totalOutflow: Number(totalOutflow.toFixed(2)),
        totalOutflowUSD: Number((totalOutflow * priceUSD).toFixed(2)),
        netFlow: Number((totalInflow - totalOutflow).toFixed(2)),
        netFlowUSD: Number(((totalInflow - totalOutflow) * priceUSD).toFixed(2)),
        burnContribution: Number(burnContribution.toFixed(2)),
        retentionRate,
        verdict,
        verdictDetail,
        topSenders,
        topReceivers,
        transfersCount: formattedTransfers.length,
        transfers: formattedTransfers,
      });
    }

    // ========================================================
    // CASE B: MACRO REAL-TIME ON-CHAIN MOVEMENT STREAM
    // ========================================================
    const lookback = 3500;
    const startBlock = Math.max(0, currentBlock - lookback);
    const filter = tokenContract.filters.Transfer();
    const logs = await tokenContract.queryFilter(filter, startBlock, currentBlock);

    let totalVolumeMoved = 0;
    let whaleMovesCount = 0;
    let burnsCount = 0;
    let dexBuysCount = 0;
    let dexSellsCount = 0;
    let p2pCount = 0;

    const volumeByWallet = new Map<string, { volume: number; txCount: number }>();
    const uniqueWallets = new Set<string>();

    const formattedTransfers: FormattedTransfer[] = logs.map((log: any) => {
      const from = log.args[0];
      const to = log.args[1];
      const amount = Number(ethers.formatEther(log.args[2]));
      const amountUSD = Number((amount * priceUSD).toFixed(2));
      totalVolumeMoved += amount;

      uniqueWallets.add(from.toLowerCase());
      uniqueWallets.add(to.toLowerCase());

      // Track volume by wallet
      const fromVol = volumeByWallet.get(from.toLowerCase()) || { volume: 0, txCount: 0 };
      volumeByWallet.set(from.toLowerCase(), { volume: fromVol.volume + amount, txCount: fromVol.txCount + 1 });

      const toVol = volumeByWallet.get(to.toLowerCase()) || { volume: 0, txCount: 0 };
      volumeByWallet.set(to.toLowerCase(), { volume: toVol.volume + amount, txCount: toVol.txCount + 1 });

      const fromInfo = getAddressTag(from);
      const toInfo = getAddressTag(to);

      const isBurn = to.toLowerCase() === BURN_ADDRESS.toLowerCase();
      const isFromDEX = fromInfo.type === 'DEX' || fromInfo.type === 'ROUTER';
      const isToDEX = toInfo.type === 'DEX' || toInfo.type === 'ROUTER';
      const isWhaleAmount = amount >= 5000 || amountUSD >= 1000;

      let transferType: TransferCategory = 'TRANSFER';
      if (isBurn) {
        transferType = 'BURN';
        burnsCount++;
      } else if (isFromDEX) {
        if (isWhaleAmount) {
          transferType = 'WHALE_BUY';
          whaleMovesCount++;
        } else {
          transferType = 'DEX_BUY';
        }
        dexBuysCount++;
      } else if (isToDEX) {
        if (isWhaleAmount) {
          transferType = 'WHALE_SELL';
          whaleMovesCount++;
        } else {
          transferType = 'DEX_SELL';
        }
        dexSellsCount++;
      } else if (isWhaleAmount) {
        transferType = 'WHALE_TRANSFER';
        whaleMovesCount++;
        p2pCount++;
      } else {
        transferType = 'TRANSFER';
        p2pCount++;
      }

      const blocksAgo = Math.max(0, currentBlock - log.blockNumber);
      const { desc, exactTime } = calculateBlockTime(blocksAgo);

      return {
        txHash: log.transactionHash,
        blockNumber: log.blockNumber,
        from,
        to,
        fromTag: fromInfo.label,
        toTag: toInfo.label,
        fromType: fromInfo.type,
        toType: toInfo.type,
        amount,
        amountUSD,
        transferType,
        explorerUrl: `${ROBINHOOD_CONFIG.blockExplorerUrl}/tx/${log.transactionHash}`,
        timestampDesc: desc,
        exactTime,
      };
    });

    formattedTransfers.sort((a, b) => b.blockNumber - a.blockNumber);

    // Filter out contracts from top movers to show prominent participants
    const topActiveMovers: TopActiveMover[] = Array.from(volumeByWallet.entries())
      .filter(([addr]) => {
        const lower = addr.toLowerCase();
        return (
          lower !== DEFAULT_TOKEN_ADDRESS.toLowerCase() &&
          lower !== BURN_ADDRESS.toLowerCase()
        );
      })
      .map(([addr, data]) => {
        const info = getAddressTag(addr);
        return {
          address: addr,
          tag: info.label,
          type: info.type,
          volume: Math.round(data.volume),
          volumeUSD: Math.round(data.volume * priceUSD),
          txCount: data.txCount,
        };
      })
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 6);

    return NextResponse.json({
      success: true,
      isWalletQuery: false,
      currentBlock,
      livePriceUSD: priceUSD,
      totalTrackedInWindow: formattedTransfers.length,
      totalVolumeMoved: Math.round(totalVolumeMoved),
      totalVolumeUSD: Math.round(totalVolumeMoved * priceUSD),
      whaleMovesCount,
      burnsCount,
      dexBuysCount,
      dexSellsCount,
      p2pCount,
      activeWalletsCount: uniqueWallets.size,
      tokenSymbol: 'NINE',
      tokenName: 'NINE',
      topActiveMovers,
      transfers: formattedTransfers.slice(0, 60),
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
