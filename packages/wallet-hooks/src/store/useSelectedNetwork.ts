import { useEffect } from 'react';
import create from 'zustand';

import { getStorageLayer } from '../utils';
import { useActiveChainStore } from './useActiveChain';

type SelectedNetworkState = {
  selectedNetwork: 'mainnet' | 'testnet';
  setSelectedNetwork: (network: 'mainnet' | 'testnet') => void;
};

const useSelectedNetworkStore = create<SelectedNetworkState>((set) => {
  return {
    selectedNetwork: 'mainnet',
    setSelectedNetwork: (network: 'mainnet' | 'testnet') => set(() => ({ selectedNetwork: network })),
  };
});

useSelectedNetworkStore.subscribe(async ({ selectedNetwork }) => {
  const storage = getStorageLayer();
  const activechainState = useActiveChainStore.getState();

  const networkMapJson = await storage.get('networkMap');
  let currentMap = networkMapJson ? JSON.parse(networkMapJson) : undefined;

  if (currentMap) {
    currentMap[activechainState.activeChain] = selectedNetwork;
  } else {
    currentMap = { [activechainState.activeChain]: selectedNetwork };
  }

  storage.set('networkMap', JSON.stringify(currentMap));
});

export const useInitSelectedNetwork = () => {
  useEffect(() => {
    const fn = async () => {
      const selectedNetworkStore = useSelectedNetworkStore.getState();
      const storage = getStorageLayer();
      const selectedNetwork = await storage.get('selected-network');
      const defaultSelectedNetwork = 'mainnet';
      selectedNetworkStore.setSelectedNetwork(selectedNetwork ?? defaultSelectedNetwork);
    };
    fn();
  }, []);
};

export const useSelectedNetwork = () => useSelectedNetworkStore((state) => state.selectedNetwork);
export const useSetSelectedNetwork = () => {
  const { setSelectedNetwork } = useSelectedNetworkStore();
  return setSelectedNetwork;
};
