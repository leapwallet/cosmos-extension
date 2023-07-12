import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

type AstroportPoolsChains = {
  astroportPoolsChains: Record<string, SupportedChain[]> | undefined | null;
  setAstroportPoolsChains: (data: Record<string, SupportedChain[]> | undefined | null) => void;
};

export const useAstroportPoolsChainsStore = create<AstroportPoolsChains>((set) => ({
  astroportPoolsChains: null,
  setAstroportPoolsChains: (data) =>
    set(() => {
      return { astroportPoolsChains: data };
    }),
}));

export const useAstroportPoolsChains = () => {
  const { astroportPoolsChains } = useAstroportPoolsChainsStore();
  return astroportPoolsChains;
};
