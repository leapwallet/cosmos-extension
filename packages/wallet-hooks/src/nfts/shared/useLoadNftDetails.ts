import { useEffect } from 'react';

import { useIsCompassWallet } from '../../store';
import { NftChain } from '../../types';
import { normalizeImageSrc } from '../../utils';
import { OwnedCollectionInfo, OwnedCollectionTokenInfo, TokensListByCollection } from '../types';
import { useGetTenOwnedCollection } from '../useGetTenOwnedCollection';
import { Collection, NftContextType } from './types';

type useLoadNftDetailsParams = {
  nftChain: NftChain;
  index: string;
  nftChains: NftContextType['nftChains'];
  setIsLoading: NftContextType['setIsLoading'];
  tokensListByCollection: TokensListByCollection;
  setCollectionData: NftContextType['setCollectionData'];
};

export function useLoadNftDetails({
  nftChain,
  index,
  nftChains,
  setIsLoading,
  tokensListByCollection,
  setCollectionData,
}: useLoadNftDetailsParams) {
  const { forceChain, forceNetwork, forceContractsListChain } = nftChain;
  const isCompassWallet = useIsCompassWallet();
  const { status, data, refetch } = useGetTenOwnedCollection(tokensListByCollection, {
    forceChain,
    forceNetwork,
    tokenUriModifier: normalizeImageSrc,
  });

  useEffect(() => {
    if (status === 'loading' && isCompassWallet) {
      setIsLoading((prevValue) => ({
        ...prevValue,
        [tokensListByCollection.collection.address]: true,
      }));
    }

    if (status === 'success') {
      setIsLoading((prevValue) => ({ ...prevValue, [index]: false }));

      if (isCompassWallet) {
        setIsLoading((prevValue) => ({
          ...prevValue,
          [tokensListByCollection.collection.address]: false,
        }));
      }
    }

    if (data && (data as unknown as OwnedCollectionInfo).tokens.length) {
      const newCollection: Collection = {
        chain: forceContractsListChain,
        name: tokensListByCollection.collection.name,
        address: tokensListByCollection.collection.address,
        image: (data as unknown as OwnedCollectionInfo).collection.image,
        totalNfts: tokensListByCollection.tokens.length,
        tokensListByCollection,
        forceChain,
        forceNetwork,
      };

      setCollectionData((prevValue) => {
        let collections = prevValue?.collections ?? [];
        collections = collections.filter(
          (collection) => collection.address !== tokensListByCollection.collection.address,
        );

        const nfts = prevValue?.nfts ?? {};
        let tokens = (data as unknown as OwnedCollectionInfo).tokens;

        if (Object.keys(nfts).length && nfts[forceContractsListChain]) {
          const _tokens = nfts[forceContractsListChain];
          tokens = tokens.filter(
            (token: OwnedCollectionTokenInfo) =>
              !_tokens.find(
                (_token: OwnedCollectionTokenInfo) =>
                  _token.tokenId === token.tokenId && _token.domain === token.domain,
              ),
          );
        }

        // Final filter for checking tokens in collection
        const finalCollections = [...collections, { ...newCollection }];

        // to filter new state of nfts after NFT transfer
        const finalNFTs = ([...(nfts[forceContractsListChain] ?? []), ...tokens] as OwnedCollectionTokenInfo[]).filter(
          (nft) => {
            // find the matching collection fot the nft
            const coll = finalCollections.find(
              (c) => c.address === nft.collection.contractAddress ?? nft.collection.address,
            );
            // if not found, i.e its other collection
            if (!coll) return true;
            // if found match all tokenIds
            return coll.tokensListByCollection?.tokens.includes(nft.tokenId ?? nft.domain);
          },
        );

        return {
          ...prevValue,
          collections: finalCollections,
          nfts: {
            ...nfts,
            [forceContractsListChain]: finalNFTs,
          },
        };
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, data, index, forceContractsListChain, tokensListByCollection, nftChains?.length]);

  return { status, data, refetch };
}
