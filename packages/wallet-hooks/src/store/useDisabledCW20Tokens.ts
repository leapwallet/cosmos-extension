import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

import { useActiveChain } from './useActiveChain';
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

export const useDisabledCW20Tokens = (forceChain?: SupportedChain) => {
  const _activeChain = useActiveChain();
  const activeChain = forceChain || _activeChain;
  const address = useAddress(activeChain);
  return useDisabledCW20TokensStore((state) =>
    state.disabledCW20Tokens ? state.disabledCW20Tokens[address] ?? [] : [],
  );
};
