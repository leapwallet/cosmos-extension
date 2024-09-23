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
          const restUrl =
            activeNetwork === 'mainnet'
              ? nmsStore.restEndpoints?.[activeChainId]?.[0]?.nodeUrl
              : ChainInfos[activeChain].apis.restTest;
          const res = await axios.get(`${restUrl}/cosmos/base/tendermint/v1beta1/validatorsets/latest`);
          const validatorPubkeys = res.data.validators.map((v: any) => v.pub_key.key);
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
  }, [isConsensusUpdate, validators, nmsStore.restEndpoints, activeChainId, activeNetwork]);

  return activeValidators;
}
