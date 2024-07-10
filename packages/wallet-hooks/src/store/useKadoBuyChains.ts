import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

type KadoBuyChainsStore = {
  kadoBuyChains: SupportedChain[];
  setKadoBuyChains: (kadoBuyChains: SupportedChain[]) => void;
};

export const useKadoBuyChainsStore = create<KadoBuyChainsStore>((set) => ({
  kadoBuyChains: [],
  setKadoBuyChains: (kadoBuyChains) => set({ kadoBuyChains }),
}));

export const useKadoBuyChains = () => {
  const { kadoBuyChains } = useKadoBuyChainsStore();
  return kadoBuyChains ?? [];
};
