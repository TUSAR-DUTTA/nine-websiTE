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

export const DEFAULT_ARCADE_ADDRESS =
  process.env.NEXT_PUBLIC_ARCADE_ADDRESS || BURN_ADDRESS;

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

export const ARCADE_BURNER_ABI = [
  'function purchaseItem(string calldata itemId, uint256 tokenPrice) external',
  'function isItemOwned(address user, string calldata itemId) external view returns (bool)',
  'function batchCheckItems(address user, string[] calldata itemIds) external view returns (bool[] memory)',
  'function totalTokensBurned() external view returns (uint256)',
  'function totalPurchasesCount() external view returns (uint256)',
  'function getMacroStats() external view returns (uint256 totalBurned, uint256 totalPurchases, address burnDest, address token)',
  'event ArcadeItemBurned(address indexed buyer, string itemId, uint256 amountBurned, address indexed burnAddress, uint256 timestamp)',
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

/**
 * Fetch macro stats directly from NineArcadeBurner
 */
export async function fetchMacroBurnStats(): Promise<{ totalBurned: number; totalPurchases: number }> {
  try {
    const provider = getTestnetProvider();
    const arcadeContract = new ethers.Contract(DEFAULT_ARCADE_ADDRESS, ARCADE_BURNER_ABI, provider);
    const stats = await arcadeContract.getMacroStats();
    return {
      totalBurned: Number(ethers.formatEther(stats[0])),
      totalPurchases: Number(stats[1]),
    };
  } catch (err) {
    console.warn('Could not fetch macro stats:', err);
    return { totalBurned: 0, totalPurchases: 0 };
  }
}

/**
 * Check if a user owns an item on-chain
 */
export async function checkItemOwnershipOnChain(
  userAddress: string,
  itemId: string
): Promise<boolean> {
  try {
    const provider = getTestnetProvider();
    const arcadeContract = new ethers.Contract(DEFAULT_ARCADE_ADDRESS, ARCADE_BURNER_ABI, provider);
    return await arcadeContract.isItemOwned(userAddress, itemId);
  } catch (err) {
    console.warn('Could not check item ownership on-chain:', err);
    return false;
  }
}
