import {
  addressPrefixes as ADDRESS_PREFIXES,
  ChainInfo,
  ChainInfos,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk';
import { useMemo } from 'react';
import create from 'zustand';

type ChainsState = {
  chains: Record<SupportedChain, ChainInfo>;
  setChains: (val: Record<SupportedChain, ChainInfo>) => void;
};

export const useChainsStore = create<ChainsState>((set) => ({
  chains: ChainInfos,
  setChains: (val: Record<SupportedChain, ChainInfo>) =>
    set(() => ({
      chains: val,
    })),
}));

export const getChains = (): Promise<Record<SupportedChain, ChainInfo>> => {
  const currentState = useChainsStore.getState().chains;

  if (currentState === null) {
    return new Promise((resolve) => {
      const unsubscribe = useChainsStore.subscribe((state) => {
        if (state.chains !== null) {
          unsubscribe();
          resolve(state.chains);
        }
      });
    });
  }

  return Promise.resolve(currentState);
};

export function useGetChains() {
  return useChainsStore((store) => store.chains);
}

export function useAddressPrefixes() {
  const chains = useGetChains();

  const addressPrefixes = useMemo(() => {
    const prefixMap: Record<string, string> = {};
    Object.values(chains).forEach((chain) => {
      if (ADDRESS_PREFIXES[chain.addressPrefix]) {
        prefixMap[chain.addressPrefix] = ADDRESS_PREFIXES[chain.addressPrefix];
      } else {
        prefixMap[chain.addressPrefix] = chain.key;
      }
    });

    prefixMap['sei'] = 'seiTestnet2';
    return prefixMap;
  }, [chains]);

  return addressPrefixes;
}
