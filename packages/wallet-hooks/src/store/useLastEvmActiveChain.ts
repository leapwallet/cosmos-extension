import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

type LastEvmActiveChainState = {
  lastEvmActiveChain: SupportedChain;
  setLastEvmActiveChain: (activeChain: SupportedChain) => void;
};

export const useLastEvmActiveChainStore = create<LastEvmActiveChainState>((set) => ({
  lastEvmActiveChain: 'ethereum',
  setLastEvmActiveChain: (chain: SupportedChain) => set(() => ({ lastEvmActiveChain: chain })),
}));

export const useLastEvmActiveChain = () => useLastEvmActiveChainStore((state) => state.lastEvmActiveChain);

export const useSetLastEvmActiveChain = () => {
  const { setLastEvmActiveChain } = useLastEvmActiveChainStore();
  return setLastEvmActiveChain;
};
