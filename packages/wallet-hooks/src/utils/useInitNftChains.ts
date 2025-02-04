import { initResourceFromS3 } from '@leapwallet/cosmos-wallet-sdk';
import { useCallback, useEffect } from 'react';

import { useNftChainsStore } from '../store';
import { useGetStorageLayer } from './global-vars';

export const BETA_NFT_CHAINS = 'beta-nft-chains';
const NFT_CHAINS = 'nft-chains';
const NFT_CHAINS_LAST_UPDATED_AT = 'nft-chains-last-updated-at';

const NFT_CHAINS_URL = 'https://assets.leapwallet.io/cosmos-registry/v1/nft-chains/chains.json';
const NFT_CHAINS_LAST_UPDATED_AT_URL =
  'https://assets.leapwallet.io/cosmos-registry/v1/nft-chains/chains-last-updated-at.json';

export function useInitNftChains() {
  const storage = useGetStorageLayer();
  const { setNftChains } = useNftChainsStore();

  const setResource = useCallback(async (resource: any) => {
    const betaNftChains = await storage.get(BETA_NFT_CHAINS);
    if (betaNftChains) {
      const parsedBetaNftChains = JSON.parse(betaNftChains);
      setNftChains([...resource, ...parsedBetaNftChains]);
    } else {
      setNftChains(resource);
    }
  }, []);

  useEffect(() => {
    initResourceFromS3({
      storage,
      setResource,
      resourceKey: NFT_CHAINS,
      resourceURL: NFT_CHAINS_URL,
      lastUpdatedAtKey: NFT_CHAINS_LAST_UPDATED_AT,
      lastUpdatedAtURL: NFT_CHAINS_LAST_UPDATED_AT_URL,
      defaultResourceData: [],
    });
  }, []);
}
