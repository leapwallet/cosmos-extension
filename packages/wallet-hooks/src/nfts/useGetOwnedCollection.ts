// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Dict, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { QueryStatus, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { useActiveChain, useChainApis, useIteratedUriEnabledNftContracts } from '../store';
import { CosmWasmClientHandler, defaultQueryOptions, QueryOptions } from '../utils/useCosmWasmClient';
import {
  NFTDisplayInformation,
  NFTInfo,
  OwnedCollectionInfo,
  TokensListByCollection,
  TokenUriModifierFn,
} from './types';

/**
 * This hook is used to load all the tokens of a collection
 *
 * @param tokensListByCollection
 * @param tokenUriModifier Modify the tokenUri field before making the request
 * @param customQueryOptions query options
 */
export const useGetOwnedCollection = (
  tokensListByCollection: TokensListByCollection,
  options?: {
    tokenUriModifier?: TokenUriModifierFn;
    forceChain?: SupportedChain;
    forceNetwork?: 'mainnet' | 'testnet';
    paginationLimit?: number;
  },
  customQueryOptions: QueryOptions<OwnedCollectionInfo> = defaultQueryOptions,
) => {
  const _chain = useActiveChain();
  const chain = options?.forceChain ?? _chain;
  const paginationLimit = options?.paginationLimit ?? 30;
  const [fetchTillIndex, setFetchTillIndex] = useState(paginationLimit);
  const iteratedUriNftContracts = useIteratedUriEnabledNftContracts();

  const { rpcUrl } = useChainApis(chain, options?.forceNetwork);
  if (!rpcUrl) {
    throw new Error(`Invalid rpc URL for chain ${chain}`);
  }

  const queryData = useQuery<OwnedCollectionInfo>({
    queryKey: ['get-owned-collection', rpcUrl, tokensListByCollection, fetchTillIndex],
    queryFn: async () => {
      const client = await CosmWasmClientHandler.getClient(rpcUrl);
      if (!client || !tokensListByCollection.collection.address) {
        throw new Error('useGetOwnedCollection: Invalid state');
      }

      const allTokensInfo = await Promise.all(
        tokensListByCollection.tokens.slice(fetchTillIndex - paginationLimit, fetchTillIndex).map(async (tokenId) => {
          try {
            const nftInfo: NFTInfo = await client.queryContractSmart(tokensListByCollection.collection.address, {
              nft_info: { token_id: tokenId },
            });

            if (iteratedUriNftContracts.includes(tokensListByCollection.collection.address)) {
              return {
                tokenUri: `${nftInfo.token_uri ?? ''}/${tokenId}`,
                extension: nftInfo.extension as Dict,
                tokenId: tokenId ?? '',
              };
            }

            return {
              tokenUri: nftInfo.token_uri ?? '',
              extension: nftInfo.extension as Dict,
              tokenId: tokenId ?? '',
            };
          } catch (_) {
            //
          }
        }),
      );

      const collection = {
        name: tokensListByCollection.collection.name ?? '',
        contractAddress: tokensListByCollection.collection.address ?? '',
      };

      let resolvedInfo;

      if (chain === 'teritori') {
        resolvedInfo = allTokensInfo.map((tokensInfo) => {
          if (!tokensInfo) {
            return null;
          }

          const { tokenId, extension } = tokensInfo;

          if (extension.public_name && tokenId.includes('.')) {
            return {
              name: extension.public_name ?? '',
              domain: tokenId ?? '',
              collection,
              extension,
            };
          }

          return {
            extension,
            collection,
            name: extension.name,
            image: extension.image,
            tokenId,
            tokenUri: `https://app.teritori.com/nft/tori-${collection.contractAddress}-${tokenId}`,
          };
        });
      } else {
        resolvedInfo = await Promise.all(
          allTokensInfo.map(async ({ tokenUri, tokenId, extension }) => {
            try {
              const res = await fetch(options?.tokenUriModifier?.(tokenUri) ?? tokenUri);
              //The below fix is to fetch details properly on android, the request was made but when we do res.json(), it results into a parse error. Due to some object structure
              let nftDisplayInfo: NFTDisplayInformation = await JSON.parse((await res.text()).trim());

              // for one of the collection on Sei, we get name and image in properties property
              if ([nftDisplayInfo.name, nftDisplayInfo.image].includes(undefined) && nftDisplayInfo?.properties) {
                nftDisplayInfo = {
                  name: nftDisplayInfo.properties?.name?.description ?? '',
                  image: nftDisplayInfo.properties?.image?.description ?? '',
                };
              }

              // for Zen on Injective, we get NFT Image in media property
              if ([nftDisplayInfo.name, nftDisplayInfo.image].includes(undefined) && nftDisplayInfo?.media) {
                nftDisplayInfo = {
                  image: nftDisplayInfo.media ?? '',
                  name: nftDisplayInfo.title ?? nftDisplayInfo.name ?? '',
                };
              }

              return {
                ...nftDisplayInfo,
                tokenUri,
                tokenId,
                collection,
                extension,
              };
            } catch (_) {
              //
            }

            // For domain name nfts
            if (extension && extension.name && extension.domain) {
              return {
                name: extension.name ?? '',
                domain: extension.domain ?? '',
                collection,
                extension,
              };
            }
          }),
        );
      }

      resolvedInfo = resolvedInfo.filter((info) => info);
      return {
        collection: {
          name: tokensListByCollection.collection.name ?? '',
          image: resolvedInfo[0]?.image ?? '',
        },
        tokens: resolvedInfo,
      };
    },
    enabled: customQueryOptions.enabled !== false && !!tokensListByCollection,
    ...customQueryOptions,
  });

  return {
    ...queryData,
    status: (function () {
      if (fetchTillIndex === paginationLimit) {
        return queryData.status;
      }

      if (queryData.isFetching) {
        return 'fetching-more';
      }

      return 'success';
    })() as QueryStatus | 'fetching-more',
    fetchMore: function () {
      if (fetchTillIndex + paginationLimit <= tokensListByCollection.tokens.length) {
        setFetchTillIndex((prevValue) => prevValue + paginationLimit);
      }
    },
  };
};
