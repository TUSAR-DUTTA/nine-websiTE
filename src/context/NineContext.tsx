'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  NineProfile,
  Fumble,
  LiveFeedItem,
  ProfileSkin,
  TabType,
  GmeSagaChapter,
} from '@/types';
import {
  TOKEN_INFO,
  PROFILES,
  FUMBLES_DATA,
  LIVE_FEED_ITEMS,
  GME_SAGA_CHAPTERS,
} from '@/lib/data';
import { soundManager } from '@/lib/sound';
import { ethers } from 'ethers';
import {
  switchOrAddRobinhoodTestnet,
  BURN_ADDRESS,
  DEFAULT_TOKEN_ADDRESS,
  ERC20_ABI,
  fetchOnChainTokenBalance,
} from '@/lib/onchain';

interface NineContextType {
  // Website Layer (Landing vs Terminal)
  viewLayer: 'LANDING' | 'TERMINAL';
  setViewLayer: (layer: 'LANDING' | 'TERMINAL') => void;

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
  claimTestnetTokens: () => Promise<{ success: boolean; txHash?: string; error?: string }>;
  onChainBurnedTotal: number;
  refreshOnChainStats: () => Promise<void>;
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
  const [viewLayer, setViewLayer] = useState<'LANDING' | 'TERMINAL'>('LANDING');
  const [activeTab, setActiveTabState] = useState<TabType>('TERMINAL');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const path = window.location.pathname;
      const search = window.location.search;
      if (hash === '#terminal' || path.startsWith('/terminal') || search.includes('view=terminal')) {
        setViewLayer('TERMINAL');
      }
    }
  }, []);
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

  return (
    <NineContext.Provider
      value={{
        viewLayer,
        setViewLayer,
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
        claimTestnetTokens,
        onChainBurnedTotal,
        refreshOnChainStats,
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
