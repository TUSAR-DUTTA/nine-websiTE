import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import {
  ROBINHOOD_CONFIG,
  DEFAULT_TOKEN_ADDRESS,
  BURN_ADDRESS,
  ERC20_ABI,
} from '@/lib/onchain';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const provider = new ethers.JsonRpcProvider(ROBINHOOD_CONFIG.rpcUrl);
    const tokenContract = new ethers.Contract(DEFAULT_TOKEN_ADDRESS, ERC20_ABI, provider);

    const [deadBalanceWei, blockNumber] = await Promise.all([
      tokenContract.balanceOf(BURN_ADDRESS).catch(() => BigInt(0)),
      provider.getBlockNumber().catch(() => 0),
    ]);

    const deadBalance = Number(ethers.formatEther(deadBalanceWei));

    return NextResponse.json({
      success: true,
      blockNumber,
      deadBalance,
      burnAddress: BURN_ADDRESS,
      tokenAddress: DEFAULT_TOKEN_ADDRESS,
      tokenSymbol: 'NINE',
      tokenName: 'NINE',
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
