import { NextRequest, NextResponse } from 'next/server';
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');

    if (!address || !ethers.isAddress(address)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing Ethereum address parameter.' },
        { status: 400 }
      );
    }

    const provider = new ethers.JsonRpcProvider(ROBINHOOD_CONFIG.rpcUrl);
    const tokenContract = new ethers.Contract(DEFAULT_TOKEN_ADDRESS, ERC20_ABI, provider);
    const arcadeContract = new ethers.Contract(DEFAULT_ARCADE_ADDRESS, ARCADE_BURNER_ABI, provider);

    const [balanceWei, ethBalanceWei, txCount, code, currentBlock] = await Promise.all([
      tokenContract.balanceOf(address).catch(() => BigInt(0)),
      provider.getBalance(address).catch(() => BigInt(0)),
      provider.getTransactionCount(address).catch(() => 0),
      provider.getCode(address).catch(() => '0x'),
      provider.getBlockNumber().catch(() => 0),
    ]);

    const nineBalance = Number(ethers.formatEther(balanceWei));
    const ethBalance = Number(ethers.formatEther(ethBalanceWei));
    const isContract = code !== '0x';

    // Check ownership of classic arcade items if applicable
    const isDeadAddress = address.toLowerCase() === BURN_ADDRESS.toLowerCase();

    return NextResponse.json({
      success: true,
      address,
      nineBalance,
      ethBalance,
      txCount,
      isContract,
      isDeadAddress,
      currentBlock,
      tokenSymbol: 'NINE',
      tokenName: 'NINE',
      explorerUrl: `${ROBINHOOD_CONFIG.blockExplorerUrl}/address/${address}`,
      tokenAddress: DEFAULT_TOKEN_ADDRESS,
      network: ROBINHOOD_CONFIG.chainName,
      chainId: ROBINHOOD_CONFIG.chainId,
    });
  } catch (error: any) {
    console.error('Error inspecting on-chain address:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to inspect on-chain address',
      },
      { status: 500 }
    );
  }
}
