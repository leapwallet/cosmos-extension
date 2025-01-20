import { FeeDenoms } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

type FeeDenomsState = {
  feeDenoms: FeeDenoms | null;
  setFeeDenoms: (feeDenoms: FeeDenoms | null) => void;
};

export const useFeeDenomsStore = create<FeeDenomsState>((set) => ({
  feeDenoms: null,
  setFeeDenoms: (feeDenoms) =>
    set(() => {
      if (!feeDenoms) return { feeDenoms: feeDenoms };
      return {
        feeDenoms: {
          mainnet: {
            ...feeDenoms.mainnet,
            forma: 'forma-native',
            flame: 'flame-native',
          },
          testnet: {
            ...feeDenoms.testnet,
            forma: 'forma-native',
            flame: 'flame-native',
          },
        },
      };
    }),
}));

export const useFeeDenoms = (): FeeDenoms | Record<'mainnet' | 'testnet', Record<string, never>> => {
  return useFeeDenomsStore((state) => state.feeDenoms) ?? { mainnet: {}, testnet: {} };
};
