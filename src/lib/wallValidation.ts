import { DEFAULT_TOKEN_ADDRESS, BURN_ADDRESS } from './onchain';

export interface WallValidationResult {
  isValid: boolean;
  error?: string;
  bannedTickers: string[];
  bannedCAs: string[];
}

/**
 * Validates wall transmission content against foreign ticker and unauthorized CA shilling.
 * ALLOWED: $NINE, $nine, #nine, #NINE, official $NINE token contract address, and dead burn address.
 * BANNED: All other tickers ($BTC, $ETH, $SOL, $PEPE, $TRUMP, etc.) and any unauthorized 0x addresses.
 */
export function validateWallContent(content: string): WallValidationResult {
  if (!content || !content.trim()) {
    return {
      isValid: false,
      error: 'Transmission content cannot be empty.',
      bannedTickers: [],
      bannedCAs: [],
    };
  }

  // 1. Check for banned tickers (anything starting with $ except $nine / $NINE)
  const tickerRegex = /\$([a-zA-Z0-9_]+)/g;
  const matches = Array.from(content.matchAll(tickerRegex));
  const bannedTickers: string[] = [];

  for (const match of matches) {
    const symbol = match[1].toLowerCase();
    if (symbol !== 'nine') {
      bannedTickers.push(match[0]);
    }
  }

  const uniqueBannedTickers = Array.from(new Set(bannedTickers));

  // 2. Check for unauthorized Contract Addresses (0x[a-fA-F0-9]{40})
  const officialCA = DEFAULT_TOKEN_ADDRESS.toLowerCase();
  const deadCA = BURN_ADDRESS.toLowerCase();

  const caRegex = /0x[a-fA-F0-9]{40}/g;
  const caMatches = Array.from(content.matchAll(caRegex));
  const bannedCAs: string[] = [];

  for (const match of caMatches) {
    const address = match[0].toLowerCase();
    if (address !== officialCA && address !== deadCA) {
      bannedCAs.push(match[0]);
    }
  }

  const uniqueBannedCAs = Array.from(new Set(bannedCAs));

  // Check for foreign Solana-style pump addresses
  const solPumpRegex = /\b[1-9A-HJ-NP-Za-km-z]{32,44}pump\b/g;
  const pumpMatches = Array.from(content.matchAll(solPumpRegex));
  for (const p of pumpMatches) {
    uniqueBannedCAs.push(p[0]);
  }

  if (uniqueBannedTickers.length > 0 && uniqueBannedCAs.length > 0) {
    return {
      isValid: false,
      error: `🛡️ WALL DEFENSE: Competing tickers (${uniqueBannedTickers.join(', ')}) & unauthorized CAs (${uniqueBannedCAs.map(ca => ca.slice(0, 8) + '...').join(', ')}) are forbidden! Only $NINE and the official $NINE contract address are allowed on this wall.`,
      bannedTickers: uniqueBannedTickers,
      bannedCAs: uniqueBannedCAs,
    };
  }

  if (uniqueBannedTickers.length > 0) {
    return {
      isValid: false,
      error: `🛡️ WALL DEFENSE: Competing tickers are forbidden! Only $NINE is allowed on this wall. Remove: ${uniqueBannedTickers.join(', ')}`,
      bannedTickers: uniqueBannedTickers,
      bannedCAs: [],
    };
  }

  if (uniqueBannedCAs.length > 0) {
    return {
      isValid: false,
      error: `🛡️ WALL DEFENSE: Unauthorized contract address detected! Only the official $NINE contract (${DEFAULT_TOKEN_ADDRESS.slice(0, 6)}...${DEFAULT_TOKEN_ADDRESS.slice(-4)}) is allowed. Remove unauthorized CA.`,
      bannedTickers: [],
      bannedCAs: uniqueBannedCAs,
    };
  }

  // 3. Anti-Spam Keywords
  const spamKeywords = ['drainer', 'claim-airdrop-now', 'free-airdrop', 'scam-mint', 'airdrop-claim-now.xyz'];
  for (const kw of spamKeywords) {
    if (content.toLowerCase().includes(kw)) {
      return {
        isValid: false,
        error: 'Transmission rejected: Anti-spam trigger.',
        bannedTickers: [],
        bannedCAs: [],
      };
    }
  }

  return {
    isValid: true,
    bannedTickers: [],
    bannedCAs: [],
  };
}
