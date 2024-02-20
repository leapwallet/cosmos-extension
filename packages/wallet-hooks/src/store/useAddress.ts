import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useMemo } from 'react';
import create from 'zustand';

import { useActiveChain } from './useActiveChain';
import { useActiveWallet } from './useActiveWallet';

type AddressState = {
  primaryAddress: string;
  setPrimaryAddress: (addr: string) => void;
};

export const useAddressStore = create<AddressState>((set) => ({
  primaryAddress: '',
  setPrimaryAddress: (addr: string) => set(() => ({ primaryAddress: addr })),
}));

export const useAddress = (forceChain?: SupportedChain) => {
  const activeChain = useActiveChain();
  const activeWallet = useActiveWallet();
  const chain = forceChain ?? activeChain;

  return useMemo(() => {
    return activeWallet?.addresses[chain] ?? '';
  }, [activeWallet, chain, activeWallet?.addresses]);
};

export const usePrimaryWalletAddress = () => useAddressStore((state) => state.primaryAddress);

export const useSetPrimaryAddress = () => {
  const { setPrimaryAddress } = useAddressStore();
  return setPrimaryAddress;
};
