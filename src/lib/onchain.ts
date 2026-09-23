import { ethers } from 'ethers';

export const ROBINHOOD_MAINNET_CONFIG = {
  chainId: 4663,
  chainIdHex: '0x1237',
  chainName: 'Robinhood Chain',
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.mainnet.chain.robinhood.com',
  blockExplorerUrl: 'https://robinhoodchain.blockscout.com',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
};

// Default active config is Mainnet
export const ROBINHOOD_CONFIG = ROBINHOOD_MAINNET_CONFIG;
export const ROBINHOOD_TESTNET_CONFIG = ROBINHOOD_MAINNET_CONFIG;

export const BURN_ADDRESS = '0x000000000000000000000000000000000000dEaD';

// Official $NINE Token Contract on Robinhood Chain Mainnet (Awaiting official launch CA)
export const DEFAULT_TOKEN_ADDRESS =
  process.env.NEXT_PUBLIC_TOKEN_ADDRESS || '';

export const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function transfer(address recipient, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address sender, address recipient, uint256 amount) returns (bool)',
  'function faucetMint(address to, uint256 amount)',
  'function burn(uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
];

/**
 * Switch or add Robinhood Chain Mainnet (4663) to window.ethereum
 */
export async function switchOrAddRobinhoodChain(): Promise<boolean> {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('No EVM wallet detected (e.g. MetaMask / Rabby / Robinhood Wallet).');
  }

  const ethereum = (window as any).ethereum;

  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: ROBINHOOD_CONFIG.chainIdHex }],
    });
    return true;
  } catch (switchError: any) {
    if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
      try {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: ROBINHOOD_CONFIG.chainIdHex,
              chainName: ROBINHOOD_CONFIG.chainName,
              rpcUrls: [ROBINHOOD_CONFIG.rpcUrl],
              blockExplorerUrls: [ROBINHOOD_CONFIG.blockExplorerUrl],
              nativeCurrency: ROBINHOOD_CONFIG.nativeCurrency,
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error('Failed to add Robinhood Chain Mainnet to wallet:', addError);
        throw addError;
      }
    }
    throw switchError;
  }
}

export const switchOrAddRobinhoodTestnet = switchOrAddRobinhoodChain;

/**
 * Get read-only provider for Robinhood Chain Mainnet
 */
export function getProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(ROBINHOOD_CONFIG.rpcUrl);
}

export const getTestnetProvider = getProvider;


/**
 * Fetch on-chain token balance for a specific wallet address
 */
export async function fetchOnChainTokenBalance(
  walletAddress: string,
  tokenAddress: string = DEFAULT_TOKEN_ADDRESS
): Promise<number> {
  try {
    const provider = getTestnetProvider();
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const balanceWei = await tokenContract.balanceOf(walletAddress);
    return Number(ethers.formatEther(balanceWei));
  } catch (err) {
    console.warn('Could not read on-chain token balance:', err);
    return 0;
  }
}

/**
 * Fetch total tokens burned to 0x...dEaD
 */
export async function fetchTotalTokensBurned(
  tokenAddress: string = DEFAULT_TOKEN_ADDRESS
): Promise<number> {
  try {
    const provider = getTestnetProvider();
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const balanceWei = await tokenContract.balanceOf(BURN_ADDRESS);
    return Number(ethers.formatEther(balanceWei));
  } catch (err) {
    console.warn('Could not read burn address balance:', err);
    return 0;
  }
}

