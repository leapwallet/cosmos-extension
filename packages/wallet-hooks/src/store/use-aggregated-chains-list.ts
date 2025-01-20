import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

export const AGGREGATED_CHAINS: SupportedChain[] = [
  'cosmos',
  'osmosis',
  'akash',
  'axelar',
  'stargaze',
  'umee',
  'kujira',
  'aura',
  'injective',
  'stride',
  'carbon',
  'archway',
  'migaloo',
  'neutron',
  'mainCoreum',
  'seiTestnet2',
  'noble',
  'nibiru',
  'dydx',
  'celestia',
  'composable',
  'dymension',
  'saga',
  'omniflix',
  'cheqd',
  'bitcoin',
];

type AggregatedChainsListState = {
  aggregatedChains: SupportedChain[];
  setAggregatedChains: (aggregatedChains: SupportedChain[]) => void;
};

export const useAggregatedChainsListStore = create<AggregatedChainsListState>((set) => ({
  aggregatedChains: AGGREGATED_CHAINS,
  setAggregatedChains: (aggregatedChains) => set({ aggregatedChains: [...aggregatedChains, 'bitcoin'] }),
}));

export const useAggregatedChainsList = (): SupportedChain[] => {
  return useAggregatedChainsListStore((state) => state.aggregatedChains);
};
