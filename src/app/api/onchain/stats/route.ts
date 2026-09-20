import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import {
  ROBINHOOD_CONFIG,
  DEFAULT_TOKEN_ADDRESS,
  DEFAULT_ARCADE_ADDRESS,
  BURN_ADDRESS,
  ERC20_ABI,
  ARCADE_BURNER_ABI,
} from '@/lib/onchain';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const provider = new ethers.JsonRpcProvider(ROBINHOOD_CONFIG.rpcUrl);

    const tokenContract = new ethers.Contract(DEFAULT_TOKEN_ADDRESS, ERC20_ABI, provider);
    const arcadeContract = new ethers.Contract(DEFAULT_ARCADE_ADDRESS, ARCADE_BURNER_ABI, provider);

    const [deadBalanceWei, arcadeStats, blockNumber] = await Promise.all([
      tokenContract.balanceOf(BURN_ADDRESS).catch(() => BigInt(0)),
      arcadeContract.getMacroStats().catch(() => [BigInt(0), BigInt(0), BURN_ADDRESS, DEFAULT_TOKEN_ADDRESS]),
      provider.getBlockNumber().catch(() => 0),
    ]);

    const deadBalance = Number(ethers.formatEther(deadBalanceWei));
    const arcadeBurned = Number(ethers.formatEther(arcadeStats[0]));
    const purchasesCount = Number(arcadeStats[1]);

    return NextResponse.json({
      success: true,
      blockNumber,
      deadBalance,
      arcadeBurned: arcadeBurned > 0 ? arcadeBurned : deadBalance,
      purchasesCount,
      burnAddress: BURN_ADDRESS,
      tokenAddress: DEFAULT_TOKEN_ADDRESS,
      tokenSymbol: 'NINE',
      tokenName: 'NINE',
      arcadeAddress: DEFAULT_ARCADE_ADDRESS,
      network: ROBINHOOD_CONFIG.chainName,
      chainId: ROBINHOOD_CONFIG.chainId,
      blockExplorerUrl: ROBINHOOD_CONFIG.blockExplorerUrl,
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
