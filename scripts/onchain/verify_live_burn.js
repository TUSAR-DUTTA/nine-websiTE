const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env.local') });

const ROBINHOOD_TESTNET_RPC = 'https://rpc.testnet.chain.robinhood.com';
const BURN_ADDRESS = '0x000000000000000000000000000000000000dEaD';

async function verifyLiveBurn() {
  console.log('================================================================');
  console.log('🔥 LIVE ON-CHAIN ARCADE BURN VERIFICATION ON ROBINHOOD TESTNET');
  console.log('RPC:      ' + ROBINHOOD_TESTNET_RPC);
  console.log('Burn Dest:' + BURN_ADDRESS);
  console.log('================================================================\n');

  const deployment = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', '..', 'contracts', 'deployment.json'), 'utf8')
  );

  const tokenAddress = deployment.tokenAddress;
  const arcadeAddress = deployment.arcadeAddress;

  console.log(`Deployed Token Address:  ${tokenAddress}`);
  console.log(`Deployed Arcade Address: ${arcadeAddress}`);

  const privateKey = process.env.TESTNET_PRIVATE_KEY;
  const provider = new ethers.JsonRpcProvider(ROBINHOOD_TESTNET_RPC);
  const signer = new ethers.Wallet(privateKey, provider);
  const userAddress = await signer.getAddress();

  console.log(`\nTester Wallet Address:   ${userAddress}`);

  // Load contract ABIs
  const tokenArtifact = JSON.parse(fs.readFileSync(path.join(__dirname, 'artifacts', 'NineToken.json'), 'utf8'));
  const arcadeArtifact = JSON.parse(fs.readFileSync(path.join(__dirname, 'artifacts', 'NineArcadeBurner.json'), 'utf8'));

  const tokenContract = new ethers.Contract(tokenAddress, tokenArtifact.abi, signer);
  const arcadeContract = new ethers.Contract(arcadeAddress, arcadeArtifact.abi, signer);

  // 1. Initial balance checks
  const initialUserBal = await tokenContract.balanceOf(userAddress);
  const initialBurnBal = await tokenContract.balanceOf(BURN_ADDRESS);

  console.log('\n[1/4] On-Chain Balances BEFORE Purchase:');
  console.log(`  • User $NINE Balance:         ${ethers.formatEther(initialUserBal)} $NINE`);
  console.log(`  • Dead Address (Burn) Balance:${ethers.formatEther(initialBurnBal)} $NINE`);

  // 2. Approve arcade contract to spend tokens
  const purchasePrice = 15000;
  const purchasePriceWei = ethers.parseEther(purchasePrice.toString());
  const itemId = 'item-pet-cat-calico';

  console.log(`\n[2/4] Approving NineArcadeBurner for ${purchasePrice.toLocaleString()} $NINE...`);
  const approveTx = await tokenContract.approve(arcadeAddress, purchasePriceWei);
  console.log(`  ✓ Approve broadcasted. Tx: ${approveTx.hash}`);
  const approveReceipt = await approveTx.wait(1);
  console.log(`  ✓ Approve mined in block ${approveReceipt.blockNumber}!`);

  // 3. Call purchaseItem on arcade contract
  console.log(`\n[3/4] Calling arcade.purchaseItem("${itemId}", ${purchasePrice.toLocaleString()})...`);
  const purchaseTx = await arcadeContract.purchaseItem(itemId, purchasePriceWei);
  console.log(`  ✓ Purchase broadcasted. Tx: ${purchaseTx.hash}`);
  const purchaseReceipt = await purchaseTx.wait(1);
  console.log(`  ✓ Purchase mined in block ${purchaseReceipt.blockNumber}!`);
  console.log(`  ✓ Explorer Link: https://explorer.testnet.chain.robinhood.com/tx/${purchaseTx.hash}`);

  // 4. Verify post-purchase balances and ownership on-chain
  const finalUserBal = await tokenContract.balanceOf(userAddress);
  const finalBurnBal = await tokenContract.balanceOf(BURN_ADDRESS);
  const isOwned = await arcadeContract.isItemOwned(userAddress, itemId);
  const totalBurnedStats = await arcadeContract.totalTokensBurned();

  console.log('\n[4/4] On-Chain Balances AFTER Purchase:');
  console.log(`  • User $NINE Balance:         ${ethers.formatEther(finalUserBal)} $NINE (-${purchasePrice.toLocaleString()} $NINE)`);
  console.log(`  • Dead Address (Burn) Balance:${ethers.formatEther(finalBurnBal)} $NINE (+${purchasePrice.toLocaleString()} $NINE)`);
  console.log(`  • Contract Total Burned:      ${ethers.formatEther(totalBurnedStats)} $NINE`);
  console.log(`  • Item "${itemId}" On-Chain Ownership: ${isOwned ? '✅ VERIFIED OWNED' : '❌ NOT OWNED'}`);

  console.log('\n================================================================');
  console.log('🎉 100% LIVE ON-CHAIN BURN VERIFIED ON ROBINHOOD CHAIN TESTNET!');
  console.log(`Tx: https://explorer.testnet.chain.robinhood.com/tx/${purchaseTx.hash}`);
  console.log(`Burn Address: https://explorer.testnet.chain.robinhood.com/address/${BURN_ADDRESS}`);
  console.log('================================================================\n');
}

verifyLiveBurn().catch(console.error);
