import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import {
  ROBINHOOD_CONFIG,
  DEFAULT_TOKEN_ADDRESS,
  BURN_ADDRESS,
  ERC20_ABI,
} from '@/lib/onchain';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { burnAmount, priceInNine, reason } = body;
    const amountToBurn = burnAmount || priceInNine;

    if (!amountToBurn || amountToBurn <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid burn amount' },
        { status: 400 }
      );
    }

    const privateKey = process.env.TESTNET_PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json(
        { success: false, error: 'Relayer private key is not configured in server environment' },
        { status: 500 }
      );
    }

    const provider = new ethers.JsonRpcProvider(ROBINHOOD_CONFIG.rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);
    const relayerAddress = await signer.getAddress();

    const tokenContract = new ethers.Contract(DEFAULT_TOKEN_ADDRESS, ERC20_ABI, signer);

    const priceWei = ethers.parseEther(amountToBurn.toString());

    // 1. Verify relayer has enough balance
    const relayerBalance = await tokenContract.balanceOf(relayerAddress).catch(() => BigInt(0));
    if (relayerBalance < priceWei) {
      return NextResponse.json(
        {
          success: false,
          error: `Relayer wallet balance (${ethers.formatEther(relayerBalance)} $NINE) is insufficient for ${amountToBurn} $NINE burn.`,
        },
        { status: 400 }
      );
    }

    // 2. Execute Direct Burn Transfer to Dead Address
    console.log(`Executing direct burn transfer of ${amountToBurn} $NINE to ${BURN_ADDRESS}...`);
    const transferTx = await tokenContract.transfer(BURN_ADDRESS, priceWei);
    const receipt = await transferTx.wait(1);
    const txHash = receipt?.hash || transferTx.hash;
    const blockNumber = receipt?.blockNumber || 0;

    // 3. Verify post-burn balance of the dead address
    const deadBalanceWei = await tokenContract.balanceOf(BURN_ADDRESS).catch(() => BigInt(0));

    return NextResponse.json({
      success: true,
      txHash,
      blockNumber,
      reason: reason || 'Community on-chain burn',
      burnedAmount: amountToBurn,
      burnAddress: BURN_ADDRESS,
      explorerUrl: `${ROBINHOOD_CONFIG.blockExplorerUrl}/tx/${txHash}`,
      newDeadBalance: Number(ethers.formatEther(deadBalanceWei)),
      newTotalBurned: Number(ethers.formatEther(deadBalanceWei)),
    });
  } catch (error: any) {
    console.error('Relayed onchain burn error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.reason || error?.message || 'On-chain burn execution reverted on Robinhood Chain',
      },
      { status: 500 }
    );
  }
}
