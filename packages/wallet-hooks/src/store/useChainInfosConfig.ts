import { CHAIN_INFOS_CONFIG, ChainInfosConfigType } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

type ChainInfosConfigState = {
  chainInfosConfig: ChainInfosConfigType;
  setChainInfosConfig: (stakingDenoms: ChainInfosConfigType) => void;
};

export const useChainInfosConfigStore = create<ChainInfosConfigState>((set) => ({
  chainInfosConfig: CHAIN_INFOS_CONFIG,
  setChainInfosConfig: (chainInfosConfig) =>
    set(() => {
      return { chainInfosConfig };
    }),
}));

export const useChainInfosConfig = (): ChainInfosConfigType => {
  return useChainInfosConfigStore((state) => state.chainInfosConfig) ?? CHAIN_INFOS_CONFIG;
};
