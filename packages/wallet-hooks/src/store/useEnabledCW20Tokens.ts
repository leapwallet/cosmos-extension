import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

import { useActiveChain } from './useActiveChain';
import { useAddress } from './useAddress';
import { DisableObject } from './useDisabledCW20Tokens';

type EnabledCW20Tokens = {
  enabledCW20Tokens: DisableObject | null;
  setEnabledCW20Tokens: (enabledCW20Tokens: DisableObject | null) => void;
};

export const useEnabledCW20TokensStore = create<EnabledCW20Tokens>((set) => ({
  enabledCW20Tokens: null,
  setEnabledCW20Tokens: (enabledCW20Tokens) => set(() => ({ enabledCW20Tokens })),
}));

export const useEnabledCW20Tokens = (forceChain?: SupportedChain) => {
  const _activeChain = useActiveChain();
  const activeChain = forceChain || _activeChain;
  const address = useAddress(activeChain);
  return useEnabledCW20TokensStore((state) => (state.enabledCW20Tokens ? state.enabledCW20Tokens[address] ?? [] : []));
};
