import { DenomsRecord } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

type ERCTokens = {
  erc20Tokens: DenomsRecord | null;
  setERC20Tokens: (erc20Tokens: DenomsRecord | null) => void;
};

export const useERC20TokensStore = create<ERCTokens>((set) => ({
  erc20Tokens: null,
  setERC20Tokens: (erc20Tokens) =>
    set(() => {
      return { erc20Tokens };
    }),
}));

export const useERC20Tokens = () => {
  const { erc20Tokens } = useERC20TokensStore();
  return erc20Tokens;
};
