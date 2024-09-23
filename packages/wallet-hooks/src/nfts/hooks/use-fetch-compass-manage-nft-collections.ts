import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import {
  StoredBetaNftCollection,
  useActiveChain,
  useBetaNFTsCollections,
  useIsCompassWallet,
  useSelectedNetwork,
} from '../../store';
import { cachedRemoteDataWithLastModified, storage, useGetStorageLayer } from '../../utils';
import { useChainId } from '../../utils-hooks';

type UseFetchCompassManageNftCollectionsParams = {
  forceChain?: SupportedChain;
};

export function getCompassManageNftCollections(
  url: string,
  chainId: string,
  storage: storage,
): Promise<StoredBetaNftCollection[]> {
  return cachedRemoteDataWithLastModified({
    remoteUrl: url,
    storageKey: `compass-${chainId}-manage-nft-collections`,
    storage,
  });
}

export function useFetchCompassManageNftCollections({ forceChain }: UseFetchCompassManageNftCollectionsParams) {
  const activeNetwork = useSelectedNetwork();
  const isCompassWallet = useIsCompassWallet();
  const _activeChain = useActiveChain();

  const activeChain = useMemo(() => forceChain || _activeChain, [forceChain, _activeChain]);
  const betaNFTsCollections = useBetaNFTsCollections(activeChain);
  const storage = useGetStorageLayer();
  const chainId = useChainId(activeChain);

  return useQuery<StoredBetaNftCollection[]>(
    [
      'query-use-fetch-compass-manage-nft-collections',
      activeNetwork,
      activeChain,
      chainId,
      betaNFTsCollections,
      storage,
    ],
    async function fetchCompassManageNftCollections() {
      let allNftCollections: StoredBetaNftCollection[] = [];

      if (activeChain === 'seiDevnet') return [];

      try {
        const url = `https://assets.leapwallet.io/cosmos-registry/v1/nft-contracts-compass/${activeNetwork}/all-${activeChain}.json`;
        allNftCollections = await getCompassManageNftCollections(url, chainId ?? '', storage);
      } catch (_) {
        //
      }

      const formattedBetaNftCollections = (betaNFTsCollections?.[activeNetwork] ?? []).reduce(
        (acc: StoredBetaNftCollection[], collection) => {
          return [...acc, { ...collection }];
        },
        [],
      );

      // remove duplicates
      const allCollections = [...allNftCollections, ...formattedBetaNftCollections].reduce(
        (acc: StoredBetaNftCollection[], curr) => {
          if (acc.find((item) => item.address === curr.address)) {
            return acc;
          }

          return [...acc, curr];
        },
        [],
      );

      return allCollections;
    },
    {
      enabled: isCompassWallet,
    },
  );
}
