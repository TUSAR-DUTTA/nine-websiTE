const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env.local') });

const ROBINHOOD_TESTNET_RPC = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.testnet.chain.robinhood.com';
const ROBINHOOD_TESTNET_CHAIN_ID = 46630;
const BURN_ADDRESS = '0x000000000000000000000000000000000000dEaD';

async function main() {
  console.log('====================================================');
  console.log('🚀 DEPLOYING NINE TOKEN ON TESTNET');
  console.log('====================================================');

  const privateKey = process.env.TESTNET_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('TESTNET_PRIVATE_KEY missing in .env.local');
  }

  const provider = new ethers.JsonRpcProvider(ROBINHOOD_TESTNET_RPC);
  const signer = new ethers.Wallet(privateKey, provider);
  const deployerAddress = await signer.getAddress();

  console.log(`Deployer: ${deployerAddress}`);
  const balance = await provider.getBalance(deployerAddress);
  console.log(`Balance:  ${ethers.formatEther(balance)} ETH\n`);

  if (balance === 0n) {
    throw new Error('Deployer wallet has 0 balance on Robinhood Chain Testnet.');
  }

  // Load compiled artifacts
  const tokenArtifactPath = path.join(__dirname, 'artifacts', 'NineToken.json');
  if (!fs.existsSync(tokenArtifactPath)) {
    console.log('Artifacts not found, running compile.js...');
    require('./compile').compileContracts();
  }

  const tokenArtifact = JSON.parse(fs.readFileSync(tokenArtifactPath, 'utf8'));

  // Deploy NineToken
  console.log('\nDeploying NineToken ($NINE)...');
  const TokenFactory = new ethers.ContractFactory(tokenArtifact.abi, tokenArtifact.bytecode, signer);
  const tokenContract = await TokenFactory.deploy();
  await tokenContract.waitForDeployment();
  const tokenAddress = await tokenContract.getAddress();
  console.log(`✓ NineToken deployed at: ${tokenAddress}`);

  // Save deployment metadata
  const deploymentInfo = {
    network: 'Robinhood Chain Testnet',
    chainId: ROBINHOOD_TESTNET_CHAIN_ID,
    rpcUrl: ROBINHOOD_TESTNET_RPC,
    explorerUrl: 'https://explorer.testnet.chain.robinhood.com',
    tokenAddress,
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

  fs.writeFileSync(envLocalPath, envContent.trim() + '\n');
  console.log(`Updated .env.local with NEXT_PUBLIC_TOKEN_ADDRESS!`);
}

main().catch(console.error);
