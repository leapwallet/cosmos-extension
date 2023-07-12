import { DenomsRecord } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

type BetaCW20Tokens = {
  betaCW20Tokens: DenomsRecord | null;
  setBetaCW20Tokens: (betaCW20Tokens: DenomsRecord | null) => void;
};

export const useBetaCW20TokensStore = create<BetaCW20Tokens>((set) => ({
  betaCW20Tokens: null,
  setBetaCW20Tokens: (betaCW20Tokens) =>
    set(() => {
      return { betaCW20Tokens };
    }),
}));

export const useBetaCW20Tokens = () => {
  const { betaCW20Tokens } = useBetaCW20TokensStore();
  return betaCW20Tokens ?? {};
};
