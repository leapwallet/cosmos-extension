import { DenomsRecord } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

type CW20Tokens = {
  cw20Tokens: DenomsRecord | null;
  setCW20Tokens: (cw20Tokens: DenomsRecord | null) => void;
};

export const useCW20TokensStore = create<CW20Tokens>((set) => ({
  cw20Tokens: null,
  setCW20Tokens: (cw20Tokens) =>
    set(() => {
      return { cw20Tokens };
    }),
}));

export const useCW20Tokens = () => {
  const { cw20Tokens } = useCW20TokensStore();
  return cw20Tokens;
};
