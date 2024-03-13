import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useEffect } from 'react';

import { OmniflixNft, OwnedCollectionTokenInfo } from '../types';
import { Collection, NftContextType } from './types';

type useCollectEndpointNftsParams = {
  index: string;
  status: 'loading' | 'success' | 'error';
  data: OmniflixNft[] | undefined;
  chain: SupportedChain;
  setIsLoading: NftContextType['setIsLoading'];
  setCollectionData: NftContextType['setCollectionData'];
  nftChains: NftContextType['nftChains'];
};

export function useCollectEndpointNfts({
  index,
  status,
  data,
  chain,
  setIsLoading,
  setCollectionData,
  nftChains,
}: useCollectEndpointNftsParams) {
  useEffect(() => {
    if (status === 'loading') {
      setIsLoading((prevValue) => ({ ...prevValue, [index]: true }));
    }

    if (status === 'success') {
      setIsLoading((prevValue) => ({ ...prevValue, [index]: false }));
    }

    if (data && data.length) {
      const collections: Collection[] = data.reduce((_collections: Collection[], nft: OmniflixNft): Collection[] => {
        const { address, image, name } = nft.collection;
        const collection = _collections.find((_collection) => _collection.address === address);

        if (collection) {
          return [
            ..._collections.filter((_collection) => _collection.address !== address),
            {
              ...collection,
              totalNfts: (collection.totalNfts ?? 0) + 1,
            },
          ];
        }

        return [..._collections, { address, image, name, totalNfts: 1, chain }];
      }, []);

      setCollectionData((prevValue) => {
        const _collections = (prevValue?.collections ?? []).filter(
          (collection) => !collections.find((_collection) => _collection.address === collection.address),
        );
        const prevNfts = prevValue?.nfts ?? {};

        return {
          ...prevValue,
          collections: [..._collections, ...collections],
          nfts: {
            ...prevNfts,
            [chain]: data as unknown as OwnedCollectionTokenInfo[],
          },
        };
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, index, status, chain, nftChains?.length]);
}
