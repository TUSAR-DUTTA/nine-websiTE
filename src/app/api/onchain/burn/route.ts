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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { itemId, priceInNine, buyerAddress } = body;

    if (!itemId || !priceInNine || priceInNine <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid item ID or price' },
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

    const priceWei = ethers.parseEther(priceInNine.toString());

    // 1. Verify relayer has enough balance
    const relayerBalance = await tokenContract.balanceOf(relayerAddress).catch(() => BigInt(0));
    if (relayerBalance < priceWei) {
      return NextResponse.json(
        {
          success: false,
          error: `Relayer wallet balance (${ethers.formatEther(relayerBalance)} $NINE) is insufficient for ${priceInNine} $NINE burn.`,
        },
        { status: 400 }
      );
    }

    let txHash = '';
    let blockNumber = 0;

    // 2. Execute Burn: Direct dead address transfer or via arcade burner
    const isDirectBurn = DEFAULT_ARCADE_ADDRESS.toLowerCase() === BURN_ADDRESS.toLowerCase();

    if (isDirectBurn) {
      console.log(`Executing direct burn transfer of ${priceInNine} $NINE to ${BURN_ADDRESS}...`);
      const transferTx = await tokenContract.transfer(BURN_ADDRESS, priceWei);
      const receipt = await transferTx.wait(1);
      txHash = receipt?.hash || transferTx.hash;
      blockNumber = receipt?.blockNumber || 0;
    } else {
      const arcadeContract = new ethers.Contract(DEFAULT_ARCADE_ADDRESS, ARCADE_BURNER_ABI, signer);
      const currentAllowance = await tokenContract.allowance(relayerAddress, DEFAULT_ARCADE_ADDRESS);
      if (currentAllowance < priceWei) {
        console.log(`Approving arcade burner contract for ${priceInNine} $NINE...`);
        const approveTx = await tokenContract.approve(DEFAULT_ARCADE_ADDRESS, ethers.MaxUint256);
        await approveTx.wait(1);
      }
      console.log(`Executing purchaseItem("${itemId}", ${priceInNine}) on-chain...`);
      const purchaseTx = await arcadeContract.purchaseItem(itemId, priceWei);
      const receipt = await purchaseTx.wait(1);
      txHash = receipt?.hash || purchaseTx.hash;
      blockNumber = receipt?.blockNumber || 0;
    }

    // 3. Verify post-burn balance of the dead address
    const deadBalanceWei = await tokenContract.balanceOf(BURN_ADDRESS).catch(() => BigInt(0));

    return NextResponse.json({
      success: true,
      txHash,
      blockNumber,
      itemId,
      burnedAmount: priceInNine,
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

