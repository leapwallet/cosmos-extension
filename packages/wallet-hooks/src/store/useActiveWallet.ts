import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

import { WALLETTYPE } from '../types';

export type Key = {
  addressIndex: number;
  name: string;
  cipher: string;
  addresses: Record<SupportedChain, string>;
  pubKeys?: Record<SupportedChain, string>;
  walletType: WALLETTYPE;
  id: string;
  colorIndex: number;
  avatar?: string;
  avatarIndex?: string;
};

type ActiveWallet = {
  activeWallet: Key | null;
  setActiveWallet: (activeWallet: any) => void;
};

export const useActiveWalletStore = create<ActiveWallet>((set) => ({
  activeWallet: null,
  setActiveWallet: (activeWallet: any) =>
    set(() => {
      return { activeWallet };
    }),
}));

export const useActiveWallet = () => {
  const { activeWallet } = useActiveWalletStore();
  return activeWallet;
};
