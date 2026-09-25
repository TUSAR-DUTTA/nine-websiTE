import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import {
  ROBINHOOD_CONFIG,
  DEFAULT_TOKEN_ADDRESS,
  BURN_ADDRESS,
} from '@/lib/onchain';
import {
  PONS_FACTORY_ADDRESS,
  resolveLaunchedToken,
  fetchPonsCurveTelemetry,
  getLiveGmePriceUSD,
  PONS_TOKEN_ABI,
} from '@/lib/pons';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const provider = new ethers.JsonRpcProvider(ROBINHOOD_CONFIG.rpcUrl);
    const tokenContract = new ethers.Contract(DEFAULT_TOKEN_ADDRESS, PONS_TOKEN_ABI, provider);

    const [deadBalanceWei, launch, telemetry, gmePriceUSD] = await Promise.all([
      tokenContract.balanceOf(BURN_ADDRESS).catch(() => 0n),
      resolveLaunchedToken(provider, DEFAULT_TOKEN_ADDRESS),
      fetchPonsCurveTelemetry(provider, DEFAULT_TOKEN_ADDRESS),
      getLiveGmePriceUSD(),
    ]);

    const deadBalance = Number(ethers.formatEther(deadBalanceWei));
    const livePriceUSD = telemetry?.spotPriceUSD || 0;
    const priceInGME = telemetry?.spotPriceInQuote || 0;
    const currentBlock = telemetry?.currentBlock || (await provider.getBlockNumber());

    return NextResponse.json({
      success: true,
      blockNumber: currentBlock,
      deadBalance,
      burnAddress: BURN_ADDRESS,
      tokenAddress: DEFAULT_TOKEN_ADDRESS,
      tokenSymbol: 'NINE',
      tokenName: 'NINE',
      network: ROBINHOOD_CONFIG.chainName,
      chainId: ROBINHOOD_CONFIG.chainId,
      blockExplorerUrl: ROBINHOOD_CONFIG.blockExplorerUrl,
      ponsFactory: PONS_FACTORY_ADDRESS,
      curveAddress: launch?.curve || null,
      pairTokenAddress: launch?.pairToken || null,
      pairSymbol: telemetry?.pairSymbol || 'GME',
      gmePriceUSD,
      livePriceUSD,
      marketCapUSD: telemetry?.marketCapUSD || livePriceUSD * 1000000000,
      priceInGME,
      realQuoteRaised: telemetry?.realQuoteRaised || 0,
      raisedUSD: telemetry?.raisedUSD || 0,
      graduationThreshold: telemetry?.quoteThreshold || 369,
      graduationProgressPct: telemetry?.graduationProgressPct || 0,
      sellableTokens: telemetry?.sellableTokens || 0,
      reservedTokens: telemetry?.reservedTokens || 0,
      quoteReserve: telemetry?.quoteReserve || 0,
      tokenReserve: telemetry?.tokenReserve || 0,
      feeBps: telemetry?.feeBps || 100,
      creatorTaxBps: telemetry?.creatorTaxBps || 400,
      readyToGraduate: telemetry?.readyToGraduate || false,
      graduated: telemetry?.graduated || false,
      phase: launch?.phase ?? 0,
      phaseLabel: telemetry?.phaseLabel || 'NotGraduated',
    });
  } catch (error: any) {
    console.error('Error fetching onchain stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch on-chain statistics',
      },
      { status: 500 }
    );
  }
}
