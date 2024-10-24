import { useMemo } from 'react';

import { useDisabledNFTsCollections } from '../../store';
import { OwnedCollectionTokenInfo } from '../types';
import { FavNftsList, NftContextType } from './types';

type useHiddenNftsListParams = {
  collectionData: NftContextType['collectionData'];
  hiddenNfts: string[];
};

export function useHiddenNftsList({ collectionData, hiddenNfts }: useHiddenNftsListParams) {
  const disabledNFTsCollections = useDisabledNFTsCollections();

  const hiddenNftsList = useMemo(() => {
    if (!collectionData) return [];

    const _hiddenNftsList: FavNftsList[] = hiddenNfts.reduce((nfts: FavNftsList[], hiddenNft) => {
      const [address, tokenId] = hiddenNft.split('-:-');

      const collection = collectionData.collections?.find(
        (collection) => collection.address === address && !disabledNFTsCollections.includes(collection.address),
      );

      if (collection) {
        const { chain } = collection;
        const _nfts: OwnedCollectionTokenInfo[] = collectionData.nfts[chain];
        const nft = _nfts?.find((_nft) => (_nft.tokenId ?? _nft.domain) === tokenId);

        if (nft) {
          return [...nfts, { ...nft, chain }];
        }
      }

      return nfts;
    }, []);

    return _hiddenNftsList;
  }, [collectionData, disabledNFTsCollections, hiddenNfts]);

  return { hiddenNftsList };
}
