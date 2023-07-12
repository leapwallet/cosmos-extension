import { getChannelIdData } from '@leapwallet/cosmos-wallet-sdk';
import { useCallback } from 'react';

import { useActiveChain } from '../store/useActiveChain';
import { useChainApis } from '../store/useRpcUrl';
import { useGetStorageLayer } from './global-vars';

export function useGetChannelIdData() {
  const lcdUrl = useChainApis().lcdUrl;
  const activeChain = useActiveChain();
  const storage = useGetStorageLayer();

  return useCallback(
    async (channelId: string) => {
      const cacheKey = `${channelId}-${activeChain}`;
      const storedChainId = await storage.get(cacheKey);
      if (storedChainId) {
        return storedChainId;
      }
      const chainId = await getChannelIdData(lcdUrl ?? '', channelId);
      await storage.set(cacheKey, chainId);
      return chainId;
    },
    [lcdUrl],
  );
}
