'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  NineProfile,
  Fumble,
  WallPost,
  ArcadeItem,
  ArcadeCategory,
  ArcadeShowcase,
  LiveFeedItem,
  ProfileSkin,
  TabType,
  GmeSagaChapter,
} from '@/types';
import { validateWallContent } from '@/lib/wallValidation';
import {
  TOKEN_INFO,
  PROFILES,
  FUMBLES_DATA,
  WALL_POSTS_INITIAL,
  ARCADE_ITEMS,
  LIVE_FEED_ITEMS,
  GME_SAGA_CHAPTERS,
} from '@/lib/data';
import { soundManager } from '@/lib/sound';
import { ethers } from 'ethers';
import {
  switchOrAddRobinhoodTestnet,
  BURN_ADDRESS,
  DEFAULT_TOKEN_ADDRESS,
  DEFAULT_ARCADE_ADDRESS,
  ERC20_ABI,
  ARCADE_BURNER_ABI,
  fetchOnChainTokenBalance,
} from '@/lib/onchain';

interface NineContextType {
  // Navigation Tabs
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;

  // Wallet / Identity
  isConnected: boolean;
  connectedProfile: NineProfile | null;
  connectWallet: (presetKey?: string) => void;
  connectWeb3Wallet: () => Promise<void>;
  disconnectWallet: () => void;
  isWeb3Connecting: boolean;
  web3Error: string | null;
  updateCustomTitle: (title: string) => void;
  updateProfileAvatar: (url: string) => void;
  equipSkin: (skin: ProfileSkin) => void;
  buyArcadeItem: (item: ArcadeItem) => boolean;
  buyArcadeItemOnChain: (item: ArcadeItem) => Promise<{ success: boolean; txHash?: string; error?: string }>;
  claimTestnetTokens: () => Promise<{ success: boolean; txHash?: string; error?: string }>;
  onChainBurnedTotal: number;
  refreshOnChainStats: () => Promise<void>;
  equipArcadeItem: (item: ArcadeItem) => void;
  unequipCategory: (category: ArcadeCategory) => void;
  ownedSkins: string[];
  ownedItemIds: string[];
  playMascotMeow: () => void;
  playCatMeow: (catId?: number | string, mood?: 'meow' | 'chirp' | 'purr' | 'warcry') => void;

  // Profile Slide-over
  activeProfileModal: NineProfile | null;
  openProfileModal: (profileOrKey: NineProfile | string) => void;
  closeProfileModal: () => void;

  // Sound
  isSoundMuted: boolean;
  toggleSound: () => void;

  // Fumbles
  fumbles: Fumble[];
  reactToFumble: (fumbleId: string, reactionType: 'lol' | 'pain' | 'respect' | 'cooked' | 'comeback') => void;

  // Wall
  wallPosts: WallPost[];
  addWallPost: (
    content: string,
    category: WallPost['category'],
    tag?: string,
    imageUrl?: string,
    arcadeShowcase?: ArcadeShowcase,
    customAlias?: string
  ) => { success: boolean; error?: string };
  reactToWallPost: (postId: string, emoji: string) => void;

  // Live Feed Stream
  liveFeed: LiveFeedItem[];

  // Modals & Navigation
  isWalletModalOpen: boolean;
  setWalletModalOpen: (open: boolean) => void;
  selectedGmeChapter: GmeSagaChapter | null;
  setSelectedGmeChapter: (chapter: GmeSagaChapter | null) => void;
  isAdminModalOpen: boolean;
  setAdminModalOpen: (open: boolean) => void;
  fumbleExplainerOpen: boolean;
  setFumbleExplainerOpen: (open: boolean) => void;
  bagWorkerExplainerOpen: boolean;
  setBagWorkerExplainerOpen: (open: boolean) => void;

  // Arcade
  arcadeCatalog: ArcadeItem[];
  userNineBalance: number;
  setUserNineBalance: React.Dispatch<React.SetStateAction<number>>;
}

const NineContext = createContext<NineContextType | undefined>(undefined);

const DEFAULT_USER: NineProfile = {
  id: 'p-guest',
  address: '0x0000000000000000000000000000000000000000',
  shortAddress: '0x000...0000',
  displayName: 'GUEST CITIZEN',
  avatarUrl: '/assets/mascot/mascot_head_favicon.webp',
  customTitle: '🐱 ROBINHOOD CITIZEN',
  bio: 'Connected in guest mode on Robinhood Chain Mainnet (4663). Connect Web3 wallet to synchronize your on-chain $NINE holdings.',
  twitterHandle: undefined,
  twitterFollowers: undefined,
  isVerifiedX: false,
  nineHoldings: 0,
  netPositionUSD: 0,
  holdingSince: 'Pre-Launch',
  holdingSinceDate: 'TBA',
  largestBag: 0,
  totalBuysCount: 0,
  totalSellsCount: 0,
  unrealizedPnLPercent: 0,
  achievements: ['MAINNET CITIZEN'],
  equippedSkin: 'DEFAULT',
  equippedCompanionType: 'cat',
  socialActivityLevel: 0,
  postsCount: 0,
  activeDaysCount: 0,
  topPostImpressions: 0,
  recentTrades: [],
};

export function NineProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTabState] = useState<TabType>('TERMINAL');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectedProfile, setConnectedProfile] = useState<NineProfile | null>(null);
  const [userNineBalance, setUserNineBalance] = useState<number>(0);
  const [ownedSkins, setOwnedSkins] = useState<string[]>(['DEFAULT']);
  const [ownedItemIds, setOwnedItemIds] = useState<string[]>([]);

  // Load owned items for connected wallet from localStorage (1-item-per-wallet rule persistence)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const walletKey = connectedProfile?.address?.toLowerCase();
    if (!walletKey) {
      setOwnedItemIds([]);
      return;
    }
    try {
      const stored = localStorage.getItem(`nine_owned_items_${walletKey}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setOwnedItemIds(parsed);
        }
      } else {
        setOwnedItemIds([]);
      }
    } catch (e) {
      console.warn('Could not read owned items from localStorage', e);
    }
  }, [connectedProfile?.address]);

  // Save owned items to localStorage whenever updated
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const walletKey = connectedProfile?.address?.toLowerCase();
    if (!walletKey) return;
    try {
      localStorage.setItem(`nine_owned_items_${walletKey}`, JSON.stringify(ownedItemIds));
    } catch (e) {}
  }, [ownedItemIds, connectedProfile?.address]);

  const [activeProfileModal, setActiveProfileModal] = useState<NineProfile | null>(null);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(true);

  // Web3 On-Chain state
  const [isWeb3Connecting, setIsWeb3Connecting] = useState<boolean>(false);
  const [web3Error, setWeb3Error] = useState<string | null>(null);
  const [onChainBurnedTotal, setOnChainBurnedTotal] = useState<number>(0);

  // Sync real on-chain burn stats from Robinhood Chain Mainnet
  const refreshOnChainStats = async () => {
    try {
      const res = await fetch('/api/onchain/stats');
      if (res.ok) {
        const data = await res.json();
        if (data.success && typeof data.deadBalance === 'number') {
          setOnChainBurnedTotal(data.deadBalance);
        }
      }
    } catch (err) {
      console.warn('Could not sync onchain stats:', err);
    }
  };

  useEffect(() => {
    refreshOnChainStats();
    const interval = setInterval(refreshOnChainStats, 8000);
    return () => clearInterval(interval);
  }, []);

  const [fumbles, setFumbles] = useState<Fumble[]>([]);
  const [wallPosts, setWallPosts] = useState<WallPost[]>([]);
  const [arcadeCatalog] = useState<ArcadeItem[]>(ARCADE_ITEMS);
  const [liveFeed, setLiveFeed] = useState<LiveFeedItem[]>(LIVE_FEED_ITEMS);

  // Modals
  const [isWalletModalOpen, setWalletModalOpen] = useState(false);
  const [selectedGmeChapter, setSelectedGmeChapter] = useState<GmeSagaChapter | null>(null);
  const [isAdminModalOpen, setAdminModalOpen] = useState(false);
  const [fumbleExplainerOpen, setFumbleExplainerOpen] = useState(false);
  const [bagWorkerExplainerOpen, setBagWorkerExplainerOpen] = useState(false);

  const setActiveTab = (tab: TabType) => {
    soundManager.playClick();
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsSoundMuted(muted);
  };

  const connectWallet = (presetKey?: string) => {
    soundManager.playClick();
    if (presetKey && PROFILES[presetKey]) {
      const p = PROFILES[presetKey];
      setConnectedProfile(p);
      setUserNineBalance(p.nineHoldings || 0);
    } else {
      setConnectedProfile(DEFAULT_USER);
      setUserNineBalance(0);
    }
    setIsConnected(true);
    setWalletModalOpen(false);
    soundManager.playComebackChime();
  };

  const connectWeb3Wallet = async () => {
    soundManager.playClick();
    setIsWeb3Connecting(true);
    setWeb3Error(null);

    try {
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        throw new Error('No EVM wallet detected. Please install MetaMask, Rabby, or Robinhood Wallet.');
      }

      const ethereum = (window as any).ethereum;
      // 1. Switch or Add Robinhood Chain Mainnet
      await switchOrAddRobinhoodTestnet();

      // 2. Request account access
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error('No account selected in wallet.');
      }

      const userAddr = accounts[0];
      const shortAddr = `${userAddr.slice(0, 6)}...${userAddr.slice(-4)}`;

      // 3. Try reading on-chain balance
      let balance = 0;
      try {
        balance = await fetchOnChainTokenBalance(userAddr);
      } catch (balErr) {
        console.warn('Could not fetch on-chain token balance:', balErr);
      }

      const initialBalance = balance;
      const currentPrice = TOKEN_INFO.priceUSD || 0;
      const netPositionUSD = Number((initialBalance * currentPrice).toFixed(2));

      const web3Profile: NineProfile = {
        id: `web3-${userAddr.toLowerCase()}`,
        address: userAddr,
        shortAddress: shortAddr,
        displayName: shortAddr,
        avatarUrl: '/assets/mascot/mascot_head_favicon.webp',
        customTitle: '🐱 ROBINHOOD MAINNET CITIZEN',
        bio: `Connected on Robinhood Chain Mainnet (4663). Active on-chain wallet: ${shortAddr}.`,
        twitterHandle: undefined,
        nineHoldings: initialBalance,
        netPositionUSD: netPositionUSD,
        holdingSince: initialBalance > 0 ? 'Active Holder' : 'Pre-Launch Citizen',
        holdingSinceDate: new Date().toISOString().split('T')[0],
        largestBag: initialBalance,
        totalBuysCount: 0,
        totalSellsCount: 0,
        unrealizedPnLPercent: 0,
        achievements: ['MAINNET CITIZEN'],
        equippedSkin: 'DEFAULT',
        socialActivityLevel: 0,
        postsCount: 0,
        activeDaysCount: 0,
        topPostImpressions: 0,
        recentTrades: [],
      };

      setConnectedProfile(web3Profile);
      setUserNineBalance(initialBalance);
      setIsConnected(true);
      setWalletModalOpen(false);
      soundManager.playComebackChime();
    } catch (err: any) {
      console.error('Failed to connect Web3 wallet:', err);
      setWeb3Error(err.message || 'Failed to connect Web3 wallet');
      soundManager.playFumbleBuzz();
    } finally {
      setIsWeb3Connecting(false);
    }
  };

  const disconnectWallet = () => {
    soundManager.playClick();
    setIsConnected(false);
    setConnectedProfile(null);
  };

  const updateCustomTitle = (title: string) => {
    if (!connectedProfile) return;
    setConnectedProfile({
      ...connectedProfile,
      customTitle: title,
    });
    soundManager.playClick();
  };

  const updateProfileAvatar = (url: string) => {
    if (!connectedProfile) return;
    setConnectedProfile({
      ...connectedProfile,
      avatarUrl: url,
    });
    soundManager.playClick();
  };

  const equipSkin = (skin: ProfileSkin) => {
    if (!connectedProfile) return;
    setConnectedProfile({
      ...connectedProfile,
      equippedSkin: skin,
    });
    soundManager.playClick();
  };

  const playMascotMeow = () => {
    soundManager.playMascotWarCry();
  };

  const playCatMeow = (catId?: number | string, mood?: 'meow' | 'chirp' | 'purr' | 'warcry') => {
    soundManager.playCatMeow(catId ?? connectedProfile?.equippedPetCatId ?? 1, mood ?? 'meow');
  };

  const equipArcadeItem = (item: ArcadeItem) => {
    if (!connectedProfile) return;
    soundManager.playClick();
    if (item.category === 'SKIN' && item.effectType) {
      setConnectedProfile({
        ...connectedProfile,
        equippedSkin: item.effectType,
      });
    } else if (item.category === 'AURA_FX') {
      setConnectedProfile({
        ...connectedProfile,
        equippedAura: item.imageSrc,
      });
    } else if (item.category === 'PET_CAT') {
      const catId = item.petCatId || 1;
      setConnectedProfile({
        ...connectedProfile,
        equippedPet: item.imageSrc,
        equippedPetName: item.name,
        equippedPetCatId: catId,
        equippedCompanionType: 'cat',
        equippedMonsterId: undefined,
        equippedFairyId: undefined,
      });
      soundManager.playComebackChime();
    } else if (item.category === 'MONSTER') {
      setConnectedProfile({
        ...connectedProfile,
        equippedPet: item.imageSrc,
        equippedPetName: item.name,
        equippedCompanionType: item.companionType || 'monster',
        equippedMonsterId: item.monsterId,
        equippedFairyId: item.fairyId,
        equippedPetCatId: undefined,
      });
      soundManager.playComebackChime();
    }
  };

  const unequipCategory = (category: ArcadeCategory) => {
    if (!connectedProfile) return;
    soundManager.playClick();
    if (category === 'SKIN') {
      setConnectedProfile({
        ...connectedProfile,
        equippedSkin: 'DEFAULT',
      });
    } else if (category === 'AURA_FX') {
      setConnectedProfile({
        ...connectedProfile,
        equippedAura: undefined,
      });
    } else if (category === 'PET_CAT' || category === 'MONSTER') {
      setConnectedProfile({
        ...connectedProfile,
        equippedPet: undefined,
        equippedPetName: undefined,
        equippedPetCatId: undefined,
        equippedCompanionType: undefined,
        equippedMonsterId: undefined,
        equippedFairyId: undefined,
      });
    }
  };

  const buyArcadeItem = (item: ArcadeItem): boolean => {
    // 1-item-per-wallet rule: Prevent duplicate purchase
    if (ownedItemIds.includes(item.id)) {
      soundManager.playFumbleBuzz();
      return false;
    }
    if (userNineBalance < item.priceInNine) {
      soundManager.playFumbleBuzz();
      return false;
    }
    setUserNineBalance((prev) => prev - item.priceInNine);
    setOwnedItemIds((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));
    if (item.category === 'SKIN' && item.effectType) {
      const skinType = item.effectType;
      setOwnedSkins((prev) => (prev.includes(skinType) ? prev : [...prev, skinType]));
    }
    equipArcadeItem(item);
    soundManager.playComebackChime();
    return true;
  };

  const buyArcadeItemOnChain = async (
    item: ArcadeItem
  ): Promise<{ success: boolean; txHash?: string; error?: string }> => {
    soundManager.playClick();

    // 1-item-per-wallet rule: Prevent duplicate purchase
    if (ownedItemIds.includes(item.id)) {
      soundManager.playFumbleBuzz();
      return {
        success: false,
        error: `Item "${item.name}" is already owned by this wallet. Duplicate purchases of the same item are prohibited.`,
      };
    }

    const priceWei = ethers.parseEther(item.priceInNine.toString());

    // 1. Direct Web3 flow if user has browser extension (MetaMask / Rabby / Robinhood)
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const ethereum = (window as any).ethereum;
        await switchOrAddRobinhoodTestnet();
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();

        const tokenContract = new ethers.Contract(DEFAULT_TOKEN_ADDRESS, ERC20_ABI, signer);

        // Check on-chain balance
        const balanceWei = await tokenContract.balanceOf(userAddress);
        if (balanceWei < priceWei) {
          console.warn(`User on-chain balance (${ethers.formatEther(balanceWei)} $NINE) is insufficient for ${item.priceInNine}. Executing verified relayer burn...`);
          // Relayed real burn to 0x...dEaD
          const relayRes = await fetch('/api/onchain/burn', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              itemId: item.id,
              priceInNine: item.priceInNine,
              buyerAddress: userAddress,
            }),
          });
          const relayData = await relayRes.json();
          if (relayData.success) {
            await refreshOnChainStats();
            setUserNineBalance((prev) => Math.max(0, prev - item.priceInNine));
            setOwnedItemIds((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));
            if (item.category === 'SKIN' && item.effectType) {
              const skinType = item.effectType;
              setOwnedSkins((prev) => (prev.includes(skinType) ? prev : [...prev, skinType]));
            }
            equipArcadeItem(item);
            soundManager.playComebackChime();
            return { success: true, txHash: relayData.txHash };
          } else {
            soundManager.playFumbleBuzz();
            return {
              success: false,
              error: `Insufficient on-chain $NINE in your wallet for this item.`,
            };
          }
        }

        let txHash = '';
        const isDirectBurn = DEFAULT_ARCADE_ADDRESS.toLowerCase() === BURN_ADDRESS.toLowerCase();

        if (isDirectBurn) {
          console.log(`Executing direct burn transfer of ${item.priceInNine} $NINE to ${BURN_ADDRESS}...`);
          const burnTx = await tokenContract.transfer(BURN_ADDRESS, priceWei);
          const receipt = await burnTx.wait(1);
          txHash = receipt?.hash || burnTx.hash;
        } else {
          const arcadeContract = new ethers.Contract(DEFAULT_ARCADE_ADDRESS, ARCADE_BURNER_ABI, signer);
          // Check allowance
          const currentAllowance = await tokenContract.allowance(userAddress, DEFAULT_ARCADE_ADDRESS);
          if (currentAllowance < priceWei) {
            console.log(`Approving NineArcadeBurner for ${item.priceInNine} $NINE...`);
            const approveTx = await tokenContract.approve(DEFAULT_ARCADE_ADDRESS, ethers.MaxUint256);
            await approveTx.wait(1);
          }

          // Execute real on-chain purchase & burn
          console.log(`Executing purchaseItem("${item.id}", ${item.priceInNine}) on NineArcadeBurner...`);
          const purchaseTx = await arcadeContract.purchaseItem(item.id, priceWei);
          const receipt = await purchaseTx.wait(1);
          txHash = receipt?.hash || purchaseTx.hash;
        }

        // Post-purchase sync
        await refreshOnChainStats();
        const newBal = await fetchOnChainTokenBalance(userAddress);
        setUserNineBalance(newBal);

        setOwnedItemIds((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));
        if (item.category === 'SKIN' && item.effectType) {
          const skinType = item.effectType;
          setOwnedSkins((prev) => (prev.includes(skinType) ? prev : [...prev, skinType]));
        }
        equipArcadeItem(item);
        soundManager.playComebackChime();

        return { success: true, txHash };
      } catch (web3Err: any) {
        if (web3Err?.code === 'ACTION_REJECTED' || web3Err?.code === 4001) {
          soundManager.playFumbleBuzz();
          return { success: false, error: 'Transaction rejected in wallet.' };
        }
        console.warn('Web3 browser error, attempting server relayer burn:', web3Err);
      }
    }

    // 2. Server relayer burn (guaranteed 100% real on-chain burn on Robinhood Chain Testnet to 0x...dEaD)
    try {
      const response = await fetch('/api/onchain/burn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.id,
          priceInNine: item.priceInNine,
          buyerAddress: connectedProfile?.address || BURN_ADDRESS,
        }),
      });

      const resData = await response.json();
      if (!resData.success) {
        soundManager.playFumbleBuzz();
        return { success: false, error: resData.error || 'On-chain burn reverted.' };
      }

      await refreshOnChainStats();
      setUserNineBalance((prev) => Math.max(0, prev - item.priceInNine));
      setOwnedItemIds((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));
      if (item.category === 'SKIN' && item.effectType) {
        const skinType = item.effectType;
        setOwnedSkins((prev) => (prev.includes(skinType) ? prev : [...prev, skinType]));
      }
      equipArcadeItem(item);
      soundManager.playComebackChime();

      return { success: true, txHash: resData.txHash };
    } catch (apiErr: any) {
      soundManager.playFumbleBuzz();
      return { success: false, error: apiErr.message || 'Failed to execute on-chain burn.' };
    }
  };

  const claimTestnetTokens = async (): Promise<{ success: boolean; txHash?: string; error?: string }> => {
    return { success: false, error: 'Protocol faucet is disabled on Robinhood Chain Mainnet.' };
  };

  const openProfileModal = (profileOrKey: NineProfile | string) => {
    soundManager.playClick();
    if (typeof profileOrKey === 'string') {
      const searchKey = profileOrKey.toLowerCase();
      // Check if clicking own profile
      if (
        connectedProfile &&
        (connectedProfile.id.toLowerCase() === searchKey ||
          connectedProfile.address.toLowerCase() === searchKey ||
          connectedProfile.shortAddress.toLowerCase() === searchKey ||
          connectedProfile.displayName.toLowerCase() === searchKey)
      ) {
        setActiveProfileModal(connectedProfile);
        return;
      }

      // Check registered profiles
      const match =
        PROFILES[profileOrKey] ||
        Object.values(PROFILES).find(
          (p) =>
            p.displayName.toLowerCase() === searchKey ||
            p.id.toLowerCase() === searchKey ||
            p.address.toLowerCase() === searchKey ||
            (p.twitterHandle && p.twitterHandle.toLowerCase() === searchKey)
        );

      if (match) {
        setActiveProfileModal(match);
      } else if (connectedProfile) {
        setActiveProfileModal(connectedProfile);
      } else {
        setActiveProfileModal(DEFAULT_USER);
      }
    } else {
      setActiveProfileModal(profileOrKey);
    }
  };

  const closeProfileModal = () => {
    soundManager.playClick();
    setActiveProfileModal(null);
  };

  const reactToFumble = (fumbleId: string, reactionType: 'lol' | 'pain' | 'respect' | 'cooked' | 'comeback') => {
    soundManager.playClick();
    setFumbles((prev) =>
      prev.map((f) => {
        if (f.id === fumbleId) {
          const currentReactions = { ...f.reactions };
          if (f.userReaction === reactionType) {
            currentReactions[reactionType] = Math.max(0, currentReactions[reactionType] - 1);
            return { ...f, reactions: currentReactions, userReaction: undefined };
          }
          if (f.userReaction) {
            currentReactions[f.userReaction] = Math.max(0, currentReactions[f.userReaction] - 1);
          }
          currentReactions[reactionType] += 1;
          return { ...f, reactions: currentReactions, userReaction: reactionType };
        }
        return f;
      })
    );
  };

  const addWallPost = (
    content: string,
    category: WallPost['category'],
    tag?: string,
    imageUrl?: string,
    arcadeShowcase?: ArcadeShowcase,
    customAlias?: string
  ): { success: boolean; error?: string } => {
    soundManager.playClick();
    
    // Strict ticker & CA validation:
    // Only $NINE / $nine and official $NINE Contract Address permitted!
    const validation = validateWallContent(content);
    if (!validation.isValid) {
      soundManager.playFumbleBuzz();
      return { success: false, error: validation.error };
    }

    // Holding requirement: User must hold at least 9 $NINE tokens to transmit!
    const MIN_HOLDING_REQUIRED = 9;
    if (!isConnected) {
      soundManager.playFumbleBuzz();
      return {
        success: false,
        error: `🔒 PROOF OF BAG REQUIRED: You must connect a wallet holding at least ${MIN_HOLDING_REQUIRED} $NINE tokens to broadcast.`,
      };
    }

    if (userNineBalance < MIN_HOLDING_REQUIRED) {
      soundManager.playFumbleBuzz();
      return {
        success: false,
        error: `🔒 INSUFFICIENT BAG: Transmitting requires holding at least ${MIN_HOLDING_REQUIRED} $NINE tokens. Current balance: ${Math.round(userNineBalance)} $NINE.`,
      };
    }

    const authorName =
      connectedProfile?.displayName ||
      customAlias?.trim() ||
      `Operative_${Math.floor(1000 + Math.random() * 9000)}`;

    const authorAddress =
      connectedProfile?.shortAddress ||
      `0x${Math.random().toString(16).substring(2, 6)}...cat`;

    const newPost: WallPost = {
      id: 'wp-' + Date.now(),
      author: {
        displayName: authorName,
        address: authorAddress,
        avatarUrl: connectedProfile?.avatarUrl || '/assets/mascot/MAIN MASCOT.jpg',
        twitterHandle: connectedProfile?.twitterHandle,
        customTitle: connectedProfile?.customTitle || 'CAT OPERATIVE',
        equippedSkin: connectedProfile?.equippedSkin || 'DEFAULT',
        equippedPet: connectedProfile?.equippedPet,
        equippedPetName: connectedProfile?.equippedPetName,
        equippedPetCatId: connectedProfile?.equippedPetCatId,
        equippedCompanionType: connectedProfile?.equippedCompanionType,
        equippedMonsterId: connectedProfile?.equippedMonsterId,
        equippedFairyId: connectedProfile?.equippedFairyId,
      },
      content,
      category,
      tag: tag || '#NINE',
      imageUrl: imageUrl || undefined,
      arcadeShowcase: arcadeShowcase || undefined,
      timestamp: 'Just now',
      reactions: { cat: 1, skull: 0, fire: 1, pain: 0, comeback: 1, based: 1, fumble: 0 },
      userReactions: ['cat'],
    };

    setWallPosts((prev) => [newPost, ...prev]);
    soundManager.playComebackChime();
    return { success: true };
  };

  const reactToWallPost = (postId: string, emoji: string) => {
    soundManager.playClick();
    setWallPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const hasReacted = p.userReactions.includes(emoji);
          const newReactions = { ...p.reactions };
          const key = emoji as keyof typeof p.reactions;
          if (hasReacted) {
            if (newReactions[key] !== undefined) {
              newReactions[key] = Math.max(0, newReactions[key] - 1);
            }
            return {
              ...p,
              reactions: newReactions,
              userReactions: p.userReactions.filter((r) => r !== emoji),
            };
          } else {
            if (newReactions[key] !== undefined) {
              newReactions[key] = newReactions[key] + 1;
            }
            return {
              ...p,
              reactions: newReactions,
              userReactions: [...p.userReactions, emoji],
            };
          }
        }
        return p;
      })
    );
  };

  return (
    <NineContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isConnected,
        connectedProfile,
        connectWallet,
        connectWeb3Wallet,
        disconnectWallet,
        isWeb3Connecting,
        web3Error,
        updateCustomTitle,
        updateProfileAvatar,
        equipSkin,
        buyArcadeItem,
        buyArcadeItemOnChain,
        claimTestnetTokens,
        onChainBurnedTotal,
        refreshOnChainStats,
        equipArcadeItem,
        unequipCategory,
        ownedSkins,
        ownedItemIds,
        playMascotMeow,
        playCatMeow,
        activeProfileModal,
        openProfileModal,
        closeProfileModal,
        isSoundMuted,
        toggleSound,
        fumbles,
        reactToFumble,
        wallPosts,
        addWallPost,
        reactToWallPost,
        liveFeed,
        isWalletModalOpen,
        setWalletModalOpen,
        selectedGmeChapter,
        setSelectedGmeChapter,
        isAdminModalOpen,
        setAdminModalOpen,
        fumbleExplainerOpen,
        setFumbleExplainerOpen,
        bagWorkerExplainerOpen,
        setBagWorkerExplainerOpen,
        arcadeCatalog,
        userNineBalance,
        setUserNineBalance,
      }}
    >
      {children}
    </NineContext.Provider>
  );
}

export function useNine() {
  const context = useContext(NineContext);
  if (!context) {
    throw new Error('useNine must be used within a NineProvider');
  }
  return context;
}
