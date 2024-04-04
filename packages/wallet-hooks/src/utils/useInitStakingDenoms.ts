import { StakingDenoms } from '@leapwallet/cosmos-wallet-sdk';
import { useEffect } from 'react';

import { useStakingDenomsStore } from '../store';
import { cachedRemoteDataWithLastModified } from './cached-remote-data';
import { storage, useGetStorageLayer } from './global-vars';

export function getStakingDenoms(storage: storage): Promise<StakingDenoms> {
  return cachedRemoteDataWithLastModified({
    remoteUrl: 'https://assets.leapwallet.io/cosmos-registry/v1/denoms/staking-denoms.json',
    storageKey: 'staking-denoms',
    storage,
  });
}

export function useInitStakingDenoms() {
  const storage = useGetStorageLayer();
  const { setStakingDenoms } = useStakingDenomsStore();

  useEffect(() => {
    (async function initStakingDenoms() {
      const stakingDenoms = await getStakingDenoms(storage);
      setStakingDenoms(stakingDenoms);
    })();
  }, []);
}
