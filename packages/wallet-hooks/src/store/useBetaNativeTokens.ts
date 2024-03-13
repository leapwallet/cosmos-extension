import { DenomsRecord } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

type BetaNativeTokens = {
  betaNativeTokens: DenomsRecord | null;
  setBetaNativeTokens: (betaNativeTokens: DenomsRecord | null) => void;
};

export const useBetaNativeTokensStore = create<BetaNativeTokens>((set) => ({
  betaNativeTokens: null,
  setBetaNativeTokens: (betaNativeTokens) =>
    set(() => {
      return { betaNativeTokens };
    }),
}));

export const useBetaNativeTokens = () => {
  const { betaNativeTokens } = useBetaNativeTokensStore();
  return betaNativeTokens ?? {};
};
