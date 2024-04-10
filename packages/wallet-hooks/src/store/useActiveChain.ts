import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

type ActiveChainState = {
  activeChain: SupportedChain;
  setActiveChain: (activeChain: SupportedChain) => void;
};

export const useActiveChainStore = create<ActiveChainState>((set) => ({
  activeChain: process.env.APP?.includes('compass') ? 'seiTestnet2' : 'cosmos',
  setActiveChain: (chain: SupportedChain) => set(() => ({ activeChain: chain })),
}));

export const useActiveChain = () => useActiveChainStore((state) => state.activeChain);

export const useSetActiveChain = () => {
  const { setActiveChain } = useActiveChainStore();
  return setActiveChain;
};
