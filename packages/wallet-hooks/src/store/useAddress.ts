import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { pubKeyToEvmAddressToShow } from '@leapwallet/cosmos-wallet-sdk';
import { useMemo } from 'react';
import create from 'zustand';

import { useChainInfo } from '../utils-hooks/use-chain-info';
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

export const useAddress = (forceChain?: SupportedChain, noPlaceholder: boolean = true) => {
  const activeChain = useActiveChain();
  const activeWallet = useActiveWallet();
  const chain = useMemo(() => forceChain ?? activeChain, [forceChain, activeChain]);
  const activeChainInfo = useChainInfo(chain);

  return useMemo(() => {
    if (activeChainInfo?.evmOnlyChain) {
      const evmAddress = pubKeyToEvmAddressToShow(activeWallet?.pubKeys?.[chain], noPlaceholder);
      if (evmAddress) {
        return evmAddress;
      }
    }
    return activeWallet?.addresses[chain] ?? '';
  }, [activeWallet, chain, activeWallet?.addresses, activeChainInfo?.evmOnlyChain]);
};

export const usePrimaryWalletAddress = () => useAddressStore((state) => state.primaryAddress);

export const useSetPrimaryAddress = () => {
  const { setPrimaryAddress } = useAddressStore();
  return setPrimaryAddress;
};
