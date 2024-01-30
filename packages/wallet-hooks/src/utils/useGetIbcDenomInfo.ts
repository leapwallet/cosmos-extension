import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useCallback } from 'react';

import { fetchIbcTrace, useActiveChain, useChainApis, useChainsStore, useDenoms, useIbcTraceStore } from '../store';

export function useGetIbcDenomInfo(forceChain?: SupportedChain) {
  const { ibcTraceData, addIbcTraceData } = useIbcTraceStore();
  const denoms = useDenoms();
  const _activeChain = useActiveChain();
  const activeChain = forceChain ?? _activeChain;
  const { lcdUrl } = useChainApis(activeChain);
  const { chains } = useChainsStore();

  return useCallback(
    async (ibcDenom: string) => {
      try {
        let _baseDenom = ibcDenom;
        let trace = null;

        if (ibcDenom.includes('ibc/')) {
          trace = ibcTraceData[_baseDenom];
          if (!trace) {
            trace = await fetchIbcTrace(_baseDenom, lcdUrl ?? '', chains[activeChain].chainId);
            if (trace) addIbcTraceData({ [_baseDenom]: trace });
          }

          _baseDenom = trace.baseDenom.includes('cw20:') ? trace.baseDenom.replace('cw20:', '') : trace.baseDenom;
        }

        return { denomInfo: denoms[_baseDenom], trace };
      } catch {
        return {};
      }
    },
    [activeChain, denoms],
  );
}
