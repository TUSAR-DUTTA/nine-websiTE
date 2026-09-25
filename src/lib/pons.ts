import { ethers } from 'ethers';
import { ROBINHOOD_CONFIG, BURN_ADDRESS } from './onchain';

// ============================================================================
// PONS V2 PROTOCOL ADDRESSES (ROBINHOOD CHAIN MAINNET, CHAIN ID 4663)
// ============================================================================
export const PONS_FACTORY_ADDRESS = '0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e';
export const PONS_MEME_HOOK_ADDRESS = '0xE5e702641Ea86F4ae6cC3cDaeD2B886f976Be044';
export const PONS_FEE_ESCROW_ADDRESS = '0xd3AFEB2a57f70eF218Aa82451c51B2fb0416Ac9e';
export const PONS_BUYBACK_VAULT_ADDRESS = '0x42df2a798f82289E177311362e8f5ccC45c1219c';
export const PONS_LAUNCH_LOCKER_ADDRESS = '0x267444D099b10fB5Ed7c3Cc7B7c767AdcA574952';
export const PONS_LAUNCH_AND_BUY_ADDRESS = '0xe33E9E479dF8802cb0866d5d05258bEc4cF62948';
export const PONS_LAUNCH_DEPLOYER_ADDRESS = '0x3711ceA4feaDE896C913C68F01Eda97Cb06D1A42';
export const PONS_GRADUATION_EXECUTOR_ADDRESS = '0xC7819B64A1dAECD7eC19856d026cb14EfBd89046';
export const PONS_GRADUATION_GUARD_ADDRESS = '0xf5695117b99B6f6401e67d4195BD653628176C6C';

// Genesis launch block for $NINE on Robinhood Chain Mainnet
export const NINE_LAUNCH_BLOCK = 71544756;
export const GME_TOKEN_ADDRESS = '0x1b0E319c6A659F002271B69dB8A7df2F911c153E';

// ============================================================================
// CONTRACT ABIS
// ============================================================================
export const PONS_FACTORY_ABI = [
  'function getLaunchedToken(address token) view returns (tuple(address token, address curve, address deployer, address creatorFeeRecipient, address pairToken, uint256 graduationThreshold, uint24 poolFee, int24 tickSpacing, uint16 creatorTaxBps, bool buybackEnabled, uint8 phase, uint256 sweptQuote, uint256 sweptTokens, uint256 sweptAt, bool exists))',
  'function getLaunchConfig(uint256 id) view returns (tuple(uint256 supply, uint256 curveFeeBps, uint256 phantomQuote, uint256 graduationThreshold, uint24 poolFee, int24 tickSpacing, bool enabled))',
  'function launchConfigCount() view returns (uint256)',
  'function previewLaunchEconomics(uint256 launchConfigId, address pairToken) view returns (bytes32)',
  'function launchFee() view returns (uint256)',
  'event TokenLaunched(address indexed token, address indexed curve, address indexed deployer, address pairToken, uint256 launchConfigId, uint256 graduationThreshold)',
  'event LaunchSwept(address indexed token, address indexed curve, uint256 sweptQuote, uint256 sweptTokens)',
  'event PoolGraduated(address indexed token, address indexed curve, address poolId)',
];

export const PONS_CURVE_ABI = [
  'function getReserves() view returns (uint256 quoteReserve, uint256 tokenReserve)',
  'function realQuoteReserve() view returns (uint256)',
  'function graduationThreshold() view returns (uint256)',
  'function sellableTokens() view returns (uint256)',
  'function reservedTokens() view returns (uint256)',
  'function feeBps() view returns (uint256)',
  'function creatorTaxBps() view returns (uint256)',
  'function readyToGraduate() view returns (bool)',
  'function graduated() view returns (bool)',
  'function isNativeQuote() view returns (bool)',
  'function pairToken() view returns (address)',
  'function currentSnipeTaxBps(address recipient) view returns (uint256)',
  'function buy(uint256 quoteIn, uint256 minTokensOut, address recipient) payable returns (uint256 tokensOut)',
  'function sell(uint256 tokensIn, uint256 minQuoteOut, address recipient) returns (uint256 quoteOut)',
  'event CurveBuy(address indexed buyer, address indexed recipient, uint256 quoteIn, uint256 tokensOut, uint256 fee, uint256 tax)',
  'event CurveSell(address indexed seller, address indexed recipient, uint256 tokensIn, uint256 quoteOut, uint256 fee, uint256 tax)',
  'event CurveBuyRefunded(address indexed buyer, address indexed recipient, uint256 quoteRefunded)',
  'event CurveCompleted(uint256 finalQuoteReserve, uint256 finalTokenReserve)',
  'event AutoGraduationFailed(string reason)',
];

export const PONS_TOKEN_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function transfer(address recipient, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address sender, address recipient, uint256 amount) returns (bool)',
  'function getTokenInfo() view returns (address tokenDeployer, string tokenLogo, string tokenDescription, tuple(string twitter, string telegram, string discord, string website, string farcaster) tokenSocials)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
];

export const PONS_ESCROW_ABI = [
  'function balanceOf(address recipient) view returns (uint256)',
  'function balanceOfToken(address recipient, address token) view returns (uint256)',
  'function claim()',
  'function claimToken(address token)',
  'event Credited(address indexed recipient, uint256 amount)',
  'event CreditedToken(address indexed recipient, address indexed token, uint256 amount)',
];

export const PONS_BUYBACK_VAULT_ABI = [
  'function totalLocked(address token) view returns (uint256)',
  'function totalReleased(address token) view returns (uint256)',
  'function vestedAmount(address token) view returns (uint256)',
  'function releasable(address token) view returns (uint256)',
  'function vestingStart(address token) view returns (uint256)',
  'function VESTING_DURATION() view returns (uint256)',
  'function release(address token) returns (uint256 released)',
];

export const PONS_HOOK_ABI = [
  'function pendingFees(bytes32 poolId, address currency) view returns (uint256)',
  'function pendingCreatorTax(bytes32 poolId, address currency) view returns (uint256)',
];

// ============================================================================
// KNOWN LABELS ON ROBINHOOD CHAIN
// ============================================================================
export const PONS_KNOWN_ENTITIES: Record<
  string,
  { label: string; type: 'BURN' | 'DEX' | 'ROUTER' | 'TOKEN' | 'WHALE' | 'SYSTEM' }
> = {
  [BURN_ADDRESS.toLowerCase()]: { label: '🔥 Dead Burn Vault', type: 'BURN' },
  [PONS_FACTORY_ADDRESS.toLowerCase()]: { label: '🏛️ Pons Launch Factory', type: 'SYSTEM' },
  [PONS_LAUNCH_AND_BUY_ADDRESS.toLowerCase()]: { label: '⚡ Pons Launch & Buy Router', type: 'ROUTER' },
  [PONS_FEE_ESCROW_ADDRESS.toLowerCase()]: { label: '💼 Pons Fee Escrow', type: 'SYSTEM' },
  [PONS_BUYBACK_VAULT_ADDRESS.toLowerCase()]: { label: '🔒 Pons Buyback Vault', type: 'SYSTEM' },
  [PONS_LAUNCH_LOCKER_ADDRESS.toLowerCase()]: { label: '🛡️ Pons Launch Locker', type: 'SYSTEM' },
  [PONS_LAUNCH_DEPLOYER_ADDRESS.toLowerCase()]: { label: '🚀 Pons Launch Deployer', type: 'SYSTEM' },
  [PONS_MEME_HOOK_ADDRESS.toLowerCase()]: { label: '🪝 Pons Uniswap v4 Hook', type: 'DEX' },
  [PONS_GRADUATION_EXECUTOR_ADDRESS.toLowerCase()]: { label: '🎓 Graduation Executor', type: 'SYSTEM' },
  [GME_TOKEN_ADDRESS.toLowerCase()]: { label: '🎮 GameStop Token (GME)', type: 'TOKEN' },
  '0xd89590cde7989ffe2731a17a2fd745b7bb969623': { label: '🐱 $NINE Genesis Creator', type: 'WHALE' },
  '0xbea6edfb4cd1196a0d5f486432ec6020fb407369': { label: '🎯 Pons Router / Arbitrage', type: 'ROUTER' },
  '0x6f646e7d21090f77abe4c3b7924b6dadb205cfef': { label: '💼 Operative #1', type: 'WHALE' },
  '0x4fc24462b10d7609fc98962b65081f8a885e1ca0': { label: '💼 Operative #2', type: 'WHALE' },
  '0x71f3b6236881739c5be2436222f9ae9150cfffb1': { label: '💼 Operative #3', type: 'WHALE' },
  '0x3da66157309794822c1506702a9c966fd9612773': { label: '🐋 Whale Conviction Vault', type: 'WHALE' },
  '0x363a847ab420963cca3a97126270fb30c78832d4': { label: '🛡️ Diamond Paws Holder', type: 'WHALE' },
  '0x8752d78a0d9b4079df2025200678bb2355215ce9': { label: '💼 Active Bag Worker', type: 'WHALE' },
  '0x65050a9b7e5075a2ba5ced7b1b64ee66262c40dc': { label: '💼 Active Bag Worker #2', type: 'WHALE' },
  '0xa06d0763a7330b0dad77864314b65fd8e3ddf869': { label: '💼 Active Bag Worker #3', type: 'WHALE' },
};

export function getEntityTag(address: string, curveAddress?: string, tokenAddress?: string): {
  label: string;
  isKnown: boolean;
  type: string;
} {
  const lower = address.toLowerCase();

  if (curveAddress && lower === curveAddress.toLowerCase()) {
    return { label: '🔄 Pons Bonding Curve', isKnown: true, type: 'DEX' };
  }
  if (tokenAddress && lower === tokenAddress.toLowerCase()) {
    return { label: '🐱 $NINE Token Contract', isKnown: true, type: 'TOKEN' };
  }
  if (PONS_KNOWN_ENTITIES[lower]) {
    return {
      label: PONS_KNOWN_ENTITIES[lower].label,
      isKnown: true,
      type: PONS_KNOWN_ENTITIES[lower].type,
    };
  }
  return {
    label: `${address.slice(0, 6)}...${address.slice(-4)}`,
    isKnown: false,
    type: 'OPERATIVE',
  };
}

// ============================================================================
// DYNAMIC PRICING AND RESOLUTION
// ============================================================================
export const GME_USDG_POOL_ADDRESS = '0xE2b46c905E12Ab8E2f864e4821a4325884C1B126';

let cachedGmePriceUSD = 23.602; // Fallback
let lastGmePriceFetch = 0;

export async function getLiveGmePriceUSD(provider?: ethers.JsonRpcProvider): Promise<number> {
  const now = Date.now();
  if (now - lastGmePriceFetch < 10000 && cachedGmePriceUSD > 0) {
    return cachedGmePriceUSD;
  }

  // 1. Direct on-chain read from Robinhood Chain Uniswap v3 GME/USDG pool
  try {
    const prov = provider || new ethers.JsonRpcProvider(ROBINHOOD_CONFIG.rpcUrl);
    const pool = new ethers.Contract(
      GME_USDG_POOL_ADDRESS,
      ['function slot0() view returns (uint160 sqrtPriceX96, int24, uint16, uint16, uint16, uint8, bool)'],
      prov
    );
    const slot0 = await pool.slot0();
    const sqrtPriceX96 = BigInt(slot0[0]);
    const Q96 = 2n ** 96n;
    const sqrtRatio = Number(sqrtPriceX96) / Number(Q96);
    // GME (18 dec) is token0, USDG (6 dec) is token1. 1 USDG = 1.00 USD.
    const priceOnChain = (sqrtRatio ** 2) * 1e12;
    if (priceOnChain > 5 && priceOnChain < 100) {
      cachedGmePriceUSD = priceOnChain;
      lastGmePriceFetch = now;
      return cachedGmePriceUSD;
    }
  } catch (err) {
    // fallback to DexScreener
  }

  // 2. Secondary fallback via DexScreener
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${GME_TOKEN_ADDRESS}`, {
      next: { revalidate: 15 },
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.pairs?.[0]?.priceUsd) {
        cachedGmePriceUSD = parseFloat(data.pairs[0].priceUsd);
        lastGmePriceFetch = now;
      }
    }
  } catch (err) {
    // Keep cached fallback
  }
  return cachedGmePriceUSD;
}

export interface LaunchedTokenRecord {
  token: string;
  curve: string;
  deployer: string;
  creatorFeeRecipient: string;
  pairToken: string;
  graduationThreshold: bigint;
  poolFee: number;
  tickSpacing: number;
  creatorTaxBps: number;
  buybackEnabled: boolean;
  phase: number; // 0 NotGraduated, 1 Swept, 2 PoolCreated, 3 Rescued
  sweptQuote: bigint;
  sweptTokens: bigint;
  sweptAt: bigint;
  exists: boolean;
}

export interface CurveTelemetry {
  quoteReserve: number;
  tokenReserve: number;
  spotPriceInQuote: number;
  spotPriceUSD: number;
  marketCapUSD: number;
  gmePriceUSD: number;
  realQuoteRaised: number;
  raisedUSD: number;
  quoteThreshold: number;
  graduationProgressPct: number;
  sellableTokens: number;
  reservedTokens: number;
  readyToGraduate: boolean;
  graduated: boolean;
  feeBps: number;
  creatorTaxBps: number;
  pairSymbol: string;
  pairDecimals: number;
  currentBlock: number;
  phase: number;
  phaseLabel: string;
}

// Cache the resolved token launch details
const launchCache = new Map<string, { data: LaunchedTokenRecord; timestamp: number }>();

export async function resolveLaunchedToken(
  provider: ethers.JsonRpcProvider,
  tokenAddress: string
): Promise<LaunchedTokenRecord | null> {
  const key = tokenAddress.toLowerCase();
  const cached = launchCache.get(key);
  if (cached && Date.now() - cached.timestamp < 60000) {
    return cached.data;
  }

  try {
    const factory = new ethers.Contract(PONS_FACTORY_ADDRESS, PONS_FACTORY_ABI, provider);
    const res = await factory.getLaunchedToken(tokenAddress);
    if (!res || !res.exists) {
      return null;
    }

    const record: LaunchedTokenRecord = {
      token: res.token,
      curve: res.curve,
      deployer: res.deployer,
      creatorFeeRecipient: res.creatorFeeRecipient,
      pairToken: res.pairToken,
      graduationThreshold: res.graduationThreshold,
      poolFee: Number(res.poolFee),
      tickSpacing: Number(res.tickSpacing),
      creatorTaxBps: Number(res.creatorTaxBps),
      buybackEnabled: Boolean(res.buybackEnabled),
      phase: Number(res.phase),
      sweptQuote: res.sweptQuote,
      sweptTokens: res.sweptTokens,
      sweptAt: res.sweptAt,
      exists: Boolean(res.exists),
    };

    launchCache.set(key, { data: record, timestamp: Date.now() });
    return record;
  } catch (err) {
    console.warn(`Could not resolve launch from factory for ${tokenAddress}:`, err);
    return null;
  }
}

export async function fetchPonsCurveTelemetry(
  provider: ethers.JsonRpcProvider,
  tokenAddress: string
): Promise<CurveTelemetry | null> {
  const launch = await resolveLaunchedToken(provider, tokenAddress);
  if (!launch || !launch.curve || launch.curve === ethers.ZeroAddress) {
    return null;
  }

  const curve = new ethers.Contract(launch.curve, PONS_CURVE_ABI, provider);
  const pairContract = new ethers.Contract(launch.pairToken, PONS_TOKEN_ABI, provider);

  const [
    reserves,
    realQuote,
    threshold,
    sellable,
    reserved,
    feeBps,
    creatorTaxBps,
    readyToGraduate,
    graduated,
    pairSymbol,
    pairDecimals,
    currentBlock,
    gmePriceUSD,
  ] = await Promise.all([
    curve.getReserves(),
    curve.realQuoteReserve(),
    curve.graduationThreshold(),
    curve.sellableTokens(),
    curve.reservedTokens().catch(() => 0n),
    curve.feeBps(),
    curve.creatorTaxBps(),
    curve.readyToGraduate(),
    curve.graduated(),
    pairContract.symbol().catch(() => 'GME'),
    pairContract.decimals().catch(() => 18),
    provider.getBlockNumber(),
    getLiveGmePriceUSD(provider),
  ]);

  const quoteReserve = Number(ethers.formatUnits(reserves[0], pairDecimals));
  const tokenReserve = Number(ethers.formatEther(reserves[1]));
  const spotPriceInQuote = tokenReserve > 0 ? quoteReserve / tokenReserve : 0;
  const spotPriceUSD = spotPriceInQuote * gmePriceUSD;
  const marketCapUSD = spotPriceUSD * 1000000000;

  const realQuoteRaised = Number(ethers.formatUnits(realQuote, pairDecimals));
  const raisedUSD = realQuoteRaised * gmePriceUSD;
  const quoteThreshold = Number(ethers.formatUnits(threshold, pairDecimals));
  const graduationProgressPct = quoteThreshold > 0 ? Math.min(100, (realQuoteRaised / quoteThreshold) * 100) : 0;

  const phaseNames = ['NotGraduated', 'Swept', 'PoolCreated', 'Rescued'];
  const phaseLabel = phaseNames[launch.phase] || 'Unknown';

  return {
    quoteReserve,
    tokenReserve,
    spotPriceInQuote,
    spotPriceUSD,
    marketCapUSD,
    gmePriceUSD,
    realQuoteRaised,
    raisedUSD,
    quoteThreshold,
    graduationProgressPct,
    sellableTokens: Number(ethers.formatEther(sellable)),
    reservedTokens: Number(ethers.formatEther(reserved)),
    readyToGraduate,
    graduated,
    feeBps: Number(feeBps),
    creatorTaxBps: Number(creatorTaxBps),
    pairSymbol,
    pairDecimals: Number(pairDecimals),
    currentBlock,
    phase: launch.phase,
    phaseLabel,
  };
}
