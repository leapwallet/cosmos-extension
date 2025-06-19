import { ChainInfos, SupportedChain, Validator } from '@leapwallet/cosmos-wallet-sdk';
import { NmsStore } from '@leapwallet/cosmos-wallet-store';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { useChainId, useIsFeatureExistForChain } from '../utils-hooks';

export function useConsensusValidators(
  validators: Record<string, Validator>,
  nmsStore: NmsStore,
  activeChain: SupportedChain,
  activeNetwork: 'mainnet' | 'testnet',
) {
  const activeChainId = useChainId(activeChain, activeNetwork) as string;
  const isConsensusUpdate = useIsFeatureExistForChain({
    checkForExistenceType: 'comingSoon',
    feature: 'cosmosConsensusUpdate',
    platform: 'Extension',
  });

  const nodeUrl =
    activeNetwork === 'mainnet'
      ? nmsStore.rpcEndPoints?.[activeChainId]?.[0]?.nodeUrl
      : ChainInfos[activeChain].apis.rpcTest;

  const _validators = Object.values(validators ?? {});
  const { data: activeValidators = _validators } = useQuery({
    queryKey: ['consensus-validators', activeChainId, activeNetwork, nodeUrl, validators],
    queryFn: async () => {
      let filteredValidators = _validators;
      if (isConsensusUpdate) {
        try {
          const url = `${nodeUrl}/validators`;
          const consensusList = [];
          let currentPage = 1;
          let totalPages = 1;

          while (currentPage <= totalPages) {
            const res = await axios.get(`${url}?page=${currentPage}&per_page=100`);
            consensusList.push(...res.data.result.validators);
            totalPages = Math.ceil(parseInt(res.data.result.total) / 100);
            currentPage++;
          }

          const validatorPubkeys = consensusList.map((v: any) => v.pub_key.value);
          filteredValidators = filteredValidators.map((v) => ({
            ...v,
            active: v.active && validatorPubkeys.includes(v.consensus_pubkey?.key),
          }));
        } catch (error) {
          // Error handling is managed by React Query
        }
      }

      return filteredValidators;
    },
    enabled: isConsensusUpdate && _validators.length > 0 && !!nodeUrl,
    staleTime: 5 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return activeValidators;
}
