import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import create from 'zustand';

import { useChainInfo } from '../utils-hooks';
import { ChainCosmosSDK } from '../utils-init-hooks';

type ChainCosmosSDKStore = {
  chainCosmosSDK: ChainCosmosSDK;
  setChainCosmosSDK: (chainCosmosSDK: ChainCosmosSDK) => void;
};

export const useChainCosmosSDKStore = create<ChainCosmosSDKStore>((set) => ({
  chainCosmosSDK: {},
  setChainCosmosSDK: (chainCosmosSDK) => set(() => ({ chainCosmosSDK })),
}));

export const useChainCosmosSDK = (forceChain?: SupportedChain) => {
  const chainInfo = useChainInfo(forceChain);
  const { chainCosmosSDK } = useChainCosmosSDKStore();

  return chainCosmosSDK[chainInfo?.chainId]?.cosmosSDK ?? chainInfo?.cosmosSDK;
};
