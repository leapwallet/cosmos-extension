import create from 'zustand';

import { useAddress } from './useAddress';

export type DisableObject = {
  [key: string]: string[];
};

type DisabledCW20Tokens = {
  disabledCW20Tokens: DisableObject | null;
  setDisabledCW20Tokens: (disabledCW20Tokens: DisableObject | null) => void;
};

export const useDisabledCW20TokensStore = create<DisabledCW20Tokens>((set) => ({
  disabledCW20Tokens: null,
  setDisabledCW20Tokens: (disabledCW20Tokens) => set(() => ({ disabledCW20Tokens })),
}));

export const useDisabledCW20Tokens = () => {
  const address = useAddress();
  return useDisabledCW20TokensStore((state) =>
    state.disabledCW20Tokens ? state.disabledCW20Tokens[address] ?? [] : [],
  );
};
