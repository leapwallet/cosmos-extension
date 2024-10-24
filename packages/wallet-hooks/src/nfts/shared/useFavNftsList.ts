import { useMemo } from 'react';

import { useDisabledNFTsCollections } from '../../store';
import { OwnedCollectionTokenInfo } from '../types';
import { FavNftsList, NftContextType } from './types';

type useFavNftsListParams = {
  collectionData: NftContextType['_collectionData'];
  favNfts: string[];
};

export function useFavNftsList({ collectionData, favNfts }: useFavNftsListParams) {
  const disabledNFTsCollections = useDisabledNFTsCollections();

  const favNftsList = useMemo(() => {
    if (!collectionData) return [];

    const _favNftsList: FavNftsList[] = favNfts.reduce((nfts: FavNftsList[], favNft) => {
      const [address, tokenId] = favNft.split('-:-');

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

    return _favNftsList;
  }, [collectionData, disabledNFTsCollections, favNfts]);

  return { favNftsList };
}
