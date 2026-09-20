const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env.local') });

const ROBINHOOD_TESTNET_RPC = 'https://rpc.testnet.chain.robinhood.com';
const ROBINHOOD_TESTNET_CHAIN_ID = 46630;
const BURN_ADDRESS = '0x000000000000000000000000000000000000dEaD';

async function main() {
  console.log('================================================================');
  console.log('🚀 DEPLOYING NINE ARCADE BURN PROTOCOL ON TESTNET');
  console.log('Network:  Robinhood Chain Testnet (Chain ID: 46630)');
  console.log('RPC:      ' + ROBINHOOD_TESTNET_RPC);
  console.log('Burn Dest:' + BURN_ADDRESS);
  console.log('================================================================\n');

  const privateKey = process.env.TESTNET_PRIVATE_KEY || process.env.PRIVATE_KEY;

  if (!privateKey) {
    console.log('⚠️ No TESTNET_PRIVATE_KEY found in environment or .env.local.');
    console.log('Generating a new ephemeral deployer wallet for you:');
    const wallet = ethers.Wallet.createRandom();
    console.log(`\n  Address:     ${wallet.address}`);
    console.log(`  Private Key: ${wallet.privateKey}`);
    console.log('\nTo deploy to Robinhood Chain Testnet:');
    console.log('1. Get testnet ETH from: https://faucet.testnet.chain.robinhood.com');
    console.log('   Send testnet ETH to the address above.');
    console.log('2. Add to .env.local:');
    console.log(`   TESTNET_PRIVATE_KEY=${wallet.privateKey}`);
    console.log('3. Re-run: node scripts/onchain/deploy.js\n');
    return;
  }

  const provider = new ethers.JsonRpcProvider(ROBINHOOD_TESTNET_RPC);
  const signer = new ethers.Wallet(privateKey, provider);
  const deployerAddress = await signer.getAddress();
  const balance = await provider.getBalance(deployerAddress);

  console.log(`Deployer Address: ${deployerAddress}`);
  console.log(`ETH Balance:      ${ethers.formatEther(balance)} ETH`);

  if (balance === 0n) {
    console.error('❌ Error: Deployer balance is 0 ETH. Please request testnet ETH from https://faucet.testnet.chain.robinhood.com');
    return;
  }

  // Load compiled artifacts
  const tokenArtifact = JSON.parse(fs.readFileSync(path.join(__dirname, 'artifacts', 'NineToken.json'), 'utf8'));
  const arcadeArtifact = JSON.parse(fs.readFileSync(path.join(__dirname, 'artifacts', 'NineArcadeBurner.json'), 'utf8'));

  // 1. Deploy NineToken
  console.log('\n[1/2] Deploying NineToken ($NINE)...');
  const TokenFactory = new ethers.ContractFactory(tokenArtifact.abi, tokenArtifact.bytecode, signer);
  const tokenContract = await TokenFactory.deploy();
  await tokenContract.waitForDeployment();
  const tokenAddress = await tokenContract.getAddress();
  console.log(`✓ NineToken deployed at: ${tokenAddress}`);

  // 2. Deploy NineArcadeBurner
  console.log('\n[2/2] Deploying NineArcadeBurner...');
  const ArcadeFactory = new ethers.ContractFactory(arcadeArtifact.abi, arcadeArtifact.bytecode, signer);
  const arcadeContract = await ArcadeFactory.deploy(tokenAddress);
  await arcadeContract.waitForDeployment();
  const arcadeAddress = await arcadeContract.getAddress();
  console.log(`✓ NineArcadeBurner deployed at: ${arcadeAddress}`);

  // Save deployment metadata
  const deploymentInfo = {
    network: 'Robinhood Chain Testnet',
    chainId: ROBINHOOD_TESTNET_CHAIN_ID,
    rpcUrl: ROBINHOOD_TESTNET_RPC,
    explorerUrl: 'https://explorer.testnet.chain.robinhood.com',
    tokenAddress,
    arcadeAddress,
    burnAddress: BURN_ADDRESS,
    deployedAt: new Date().toISOString(),
    deployer: deployerAddress,
  };

  const deploymentPath = path.join(__dirname, '..', '..', 'contracts', 'deployment.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\nDeployment metadata saved to: contracts/deployment.json`);

  // Update .env.local with deployed contract addresses
  const envLocalPath = path.join(__dirname, '..', '..', '.env.local');
  let envContent = fs.existsSync(envLocalPath) ? fs.readFileSync(envLocalPath, 'utf8') : '';

  if (envContent.includes('NEXT_PUBLIC_TOKEN_ADDRESS=')) {
    envContent = envContent.replace(/NEXT_PUBLIC_TOKEN_ADDRESS=.*/, `NEXT_PUBLIC_TOKEN_ADDRESS=${tokenAddress}`);
  } else {
    envContent += `\nNEXT_PUBLIC_TOKEN_ADDRESS=${tokenAddress}`;
  }

  if (envContent.includes('NEXT_PUBLIC_ARCADE_ADDRESS=')) {
    envContent = envContent.replace(/NEXT_PUBLIC_ARCADE_ADDRESS=.*/, `NEXT_PUBLIC_ARCADE_ADDRESS=${arcadeAddress}`);
  } else {
    envContent += `\nNEXT_PUBLIC_ARCADE_ADDRESS=${arcadeAddress}`;
  }

  fs.writeFileSync(envLocalPath, envContent.trim() + '\n');
  console.log(`Updated .env.local with NEXT_PUBLIC_TOKEN_ADDRESS and NEXT_PUBLIC_ARCADE_ADDRESS!`);
}

main().catch(console.error);
