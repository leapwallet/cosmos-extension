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
      return { feeDenoms };
    }),
}));

export const useFeeDenoms = (): FeeDenoms | Record<'mainnet' | 'testnet', Record<string, never>> => {
  return useFeeDenomsStore((state) => state.feeDenoms) ?? { mainnet: {}, testnet: {} };
};
