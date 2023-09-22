import { useCallback } from 'react';

import { fetchIbcTrace, useActiveChain, useChainApis, useChainsStore, useDenoms, useIbcTraceStore } from '../store';

export function useGetIbcDenomInfo() {
  const { ibcTraceData, addIbcTraceData } = useIbcTraceStore();
  const denoms = useDenoms();
  const activeChain = useActiveChain();
  const { lcdUrl } = useChainApis();
  const { chains } = useChainsStore();

  return useCallback(
    async (ibcDenom: string) => {
      try {
        let _baseDenom = ibcDenom;

        if (ibcDenom.includes('ibc/')) {
          let trace = ibcTraceData[_baseDenom];
          if (!trace) {
            trace = await fetchIbcTrace(_baseDenom, lcdUrl ?? '', chains[activeChain].chainId);
            if (trace) addIbcTraceData({ [_baseDenom]: trace });
          }

          _baseDenom = trace.baseDenom.includes('cw20:') ? trace.baseDenom.replace('cw20:', '') : trace.baseDenom;
        }

        return denoms[_baseDenom];
      } catch {
        return;
      }
    },
    [activeChain, denoms],
  );
}
