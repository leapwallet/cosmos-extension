import { IQueryDenomTraceResponse } from '@leapwallet/cosmos-wallet-sdk';
import axios from 'axios';
import { useCallback } from 'react';

import { useActiveChain, useChainApis } from '../store';
import { useGetStorageLayer } from '../utils/global-vars';

export function useGetIbcDenomTrace(): (hash: string) => Promise<IQueryDenomTraceResponse> {
  const { lcdUrl, rpcUrl } = useChainApis();
  const activeChain = useActiveChain();
  const storage = useGetStorageLayer();

  return useCallback(
    async (hash: string) => {
      const storageKey = `${hash}-${activeChain}`;
      const json = await storage.get(storageKey);
      const storedObj = JSON.parse(json ?? null);
      if (storedObj) {
        return storedObj.denomTrace
          ? { path: storedObj.denomTrace.path, base_denom: storedObj.denomTrace.baseDenom }
          : storedObj;
      }

      const denomTrace = await axios.get(`${lcdUrl}/ibc/apps/transfer/v1/denom_traces/${hash}`);

      await storage.set(storageKey, JSON.stringify(denomTrace.data.denom_trace));
      return denomTrace.data.denom_trace;
    },
    [rpcUrl, activeChain],
  );
}
