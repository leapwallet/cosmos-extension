import { SnipDenomRecord, SnipDenoms } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

type SnipDenoms = {
  denoms: SnipDenomRecord;
  setDenoms: (denoms: SnipDenomRecord) => void;
};

export const useSnipDenomsStore = create<SnipDenoms>((set) => ({
  denoms: SnipDenoms,
  setDenoms: (denoms) =>
    set(() => {
      return { denoms };
    }),
}));

export const useSnipDenoms = (): SnipDenomRecord => {
  return useSnipDenomsStore((state) => state.denoms) ?? {};
};
