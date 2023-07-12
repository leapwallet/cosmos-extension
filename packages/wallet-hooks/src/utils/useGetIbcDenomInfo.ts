import { Chain } from '@leapwallet/cosmos-wallet-sdk';
import { useCallback } from 'react';

import { useGetIbcDenomTrace } from '../ibc';
import { useActiveChain, useDenoms, useSelectedNetwork } from '../store';
import { getDenomInfo, isTerraClassic, useGetChannelIdData } from './index';

export function useGetIbcDenomInfo() {
  const getChainId = useGetChannelIdData();
  const getIbcDenomTrace = useGetIbcDenomTrace();
  const denoms = useDenoms();
  const selectedNetwork = useSelectedNetwork();
  const activeChain = useActiveChain();

  return useCallback(
    async (ibcDenom: string, getChainInfoById: (chainId: string) => Chain | null | undefined) => {
      try {
        let _baseDenom = ibcDenom;
        let denomChain = activeChain as string;

        if (ibcDenom.includes('ibc/')) {
          const denomTrace: any = await getIbcDenomTrace(ibcDenom.replace('ibc/', ''));
          const lastChannelId = denomTrace?.path?.split('/')[1];
          const baseDenom = denomTrace?.base_denom ?? denomTrace?.baseDenom;

          const chainId = await getChainId(lastChannelId ?? '');
          const chainInfo = getChainInfoById(chainId);

          denomChain = isTerraClassic(chainId) ? 'terra-classic' : chainInfo?.path ?? '';
          _baseDenom = baseDenom.includes('cw20:') ? baseDenom.replace('cw20:', '') : baseDenom;
        }

        const denomInfo = await getDenomInfo(_baseDenom, denomChain, denoms, selectedNetwork === 'testnet');
        return denomInfo;
      } catch {
        return;
      }
    },
    [denoms, selectedNetwork],
  );
}
