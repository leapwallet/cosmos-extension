import { ChainInfos, SupportedChain, Validator } from '@leapwallet/cosmos-wallet-sdk';
import { NmsStore } from '@leapwallet/cosmos-wallet-store';
import axios from 'axios';
import { useEffect, useState } from 'react';

import { useChainId, useIsFeatureExistForChain } from '../utils-hooks';

export function useConsensusValidators(
  validators: Record<string, Validator>,
  nmsStore: NmsStore,
  activeChain: SupportedChain,
  activeNetwork: 'mainnet' | 'testnet',
) {
  const [activeValidators, setActiveValidators] = useState<Validator[]>([]);
  const activeChainId = useChainId(activeChain, activeNetwork) as string;
  const isConsensusUpdate = useIsFeatureExistForChain({
    checkForExistenceType: 'comingSoon',
    feature: 'cosmosConsensusUpdate',
    platform: 'Extension',
  });

  useEffect(() => {
    let filteredValidators = Object.values(validators ?? {});

    const filterCosmosValidators = async () => {
      if (isConsensusUpdate) {
        try {
          const nodeUrl =
            activeNetwork === 'mainnet'
              ? nmsStore.rpcEndPoints?.[activeChainId]?.[0]?.nodeUrl
              : ChainInfos[activeChain].apis.rpcTest;
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
          filteredValidators = filteredValidators.map((v) => {
            return {
              ...v,
              active: v.active && validatorPubkeys.includes(v.consensus_pubkey?.key),
            };
          });
        } catch (error) {
          //
        }
      }

      setActiveValidators(filteredValidators);
    };

    filterCosmosValidators();
  }, [isConsensusUpdate, validators, nmsStore.rpcEndPoints, activeChainId, activeNetwork]);

  return activeValidators;
}
