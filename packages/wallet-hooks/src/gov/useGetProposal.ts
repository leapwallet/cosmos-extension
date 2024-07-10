import { axiosWrapper, CosmosSDK, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useActiveChain, useChainApis, useGetChains, useSelectedNetwork } from '../store';
import { useGetExplorerAccountUrl } from '../utils-hooks';
import { govQueryIds } from './queryIds';

export function useGetProposal(
  id: number,
  enabled: boolean,
  forceChain?: SupportedChain,
  forceNetwork?: 'mainnet' | 'testnet',
) {
  const _activeChain = useActiveChain();
  const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain]);

  const _selectedNetwork = useSelectedNetwork();
  const selectedNetwork = useMemo(() => forceNetwork || _selectedNetwork, [_selectedNetwork, forceNetwork]);

  const { lcdUrl } = useChainApis(activeChain, selectedNetwork);
  const chains = useGetChains();
  const { getExplorerAccountUrl } = useGetExplorerAccountUrl({
    forceChain: activeChain,
    forceNetwork: selectedNetwork,
  });

  return useQuery(
    [govQueryIds.proposals, activeChain, selectedNetwork, id, chains],
    async (): Promise<any> => {
      const chainInfo = chains[activeChain];
      let version = 'v1beta1';

      switch (chainInfo.cosmosSDK) {
        case CosmosSDK.Version_Point_46:
        case CosmosSDK.Version_Point_47:
          version = `v1`;
          break;
      }

      const url = `/cosmos/gov/${version}/proposals/${id}/tally`;
      const tallying = `/cosmos/gov/${version}/params/tallying`;
      let poolUrl = `/cosmos/staking/${version}/pool`;
      const proposerUrl = `/cosmos/gov/${version}/proposals/${id}/deposits`;

      if (activeChain === 'initia') {
        poolUrl = `/initia/mstaking/v1/pool`;
      }

      const [data1, data2, data3, data4] = await Promise.all([
        axiosWrapper({ baseURL: lcdUrl, method: 'get', url }),
        axiosWrapper({ baseURL: lcdUrl, method: 'get', url: tallying }),
        axiosWrapper({ baseURL: lcdUrl, method: 'get', url: poolUrl }),
        axiosWrapper({ baseURL: lcdUrl, method: 'get', url: proposerUrl }),
      ]);
      const proposer = data4.data.deposits[data4.data.deposits.length - 1];
      return {
        ...data1.data.tally,
        ...data2.data.tally_params,
        ...data3.data.pool,
        proposer,
        proposerTxUrl: proposer?.depositor ? `${getExplorerAccountUrl(proposer?.depositor)}` : '',
      };
    },
    { enabled: !!activeChain && enabled, retry: 2 },
  );
}
