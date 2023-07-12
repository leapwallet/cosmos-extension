import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

type LSStrideEnabledDenoms = {
  lsStrideEnabledDenoms: Record<string, SupportedChain> | undefined | null;
  setLSStrideEnabledDenoms: (denoms: Record<string, SupportedChain> | undefined | null) => void;
};

export const useLSStrideEnabledDenomsStore = create<LSStrideEnabledDenoms>((set) => ({
  lsStrideEnabledDenoms: null,
  setLSStrideEnabledDenoms: (denoms) =>
    set(() => {
      return { lsStrideEnabledDenoms: denoms };
    }),
}));

export const useLSStrideEnabledDenoms = () => {
  const { lsStrideEnabledDenoms } = useLSStrideEnabledDenomsStore();
  return lsStrideEnabledDenoms;
};
