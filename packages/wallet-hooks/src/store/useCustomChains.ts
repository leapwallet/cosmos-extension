import { ChainInfo } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

import { CustomChainsType, formatNewChainInfo } from '../utils/formatNewChainInfo';

type CustomChainsState = {
  customChains: ChainInfo[];
  setCustomChains: (customChains: CustomChainsType[]) => void;
};

export const useCustomChainsStore = create<CustomChainsState>((set) => ({
  customChains: [],
  setCustomChains: (data) =>
    set(() => {
      return { customChains: data.map((d) => formatNewChainInfo(d)) };
    }),
}));

export const useCustomChains = () => {
  const { customChains } = useCustomChainsStore();
  return customChains ?? [];
};
