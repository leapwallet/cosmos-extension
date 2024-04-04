import { QueryStatus, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { useActiveChain, useAddress, useChainApis, useIteratedUriEnabledNftContracts } from '../store';
import { CosmWasmClientHandler, defaultQueryOptions, QueryOptions } from '../utils';
import { OwnedCollectionInfo, OwnedCollectionOptions, OwnedCollectionTokenInfo, TokensListByCollection } from './types';
import { getNftTokensInfo, getNonTeritoriTokensInfo, getTeritoriTokensInfo } from './utils';

export const useGetOwnedCollection = (
  tokensListByCollection: TokensListByCollection,
  options?: OwnedCollectionOptions,
  customQueryOptions: QueryOptions<OwnedCollectionInfo> = defaultQueryOptions,
) => {
  const _chain = useActiveChain();
  const chain = options?.forceChain ?? _chain;
  const paginationLimit = options?.paginationLimit ?? 30;

  const [fetchTillIndex, setFetchTillIndex] = useState(paginationLimit);
  const walletAddress = useAddress(chain);

  const iteratedUriNftContracts = useIteratedUriEnabledNftContracts();
  const { rpcUrl } = useChainApis(chain, options?.forceNetwork);

  if (!rpcUrl) {
    throw new Error(`Invalid rpc URL for chain ${chain}`);
  }

  const queryData = useQuery<OwnedCollectionInfo>(
    ['get-owned-collection', rpcUrl, tokensListByCollection, fetchTillIndex],
    async function () {
      const client = await CosmWasmClientHandler.getClient(rpcUrl);
      if (!client || !tokensListByCollection.collection.address) {
        throw new Error('useGetOwnedCollection: Invalid state');
      }

      const collectionName = tokensListByCollection?.collection?.name ?? '';
      const collectionAddress = tokensListByCollection?.collection?.address ?? '';

      const allTokensInfo = await Promise.all(
        tokensListByCollection.tokens
          .slice(fetchTillIndex - paginationLimit, fetchTillIndex)
          .map(async (tokenId) =>
            getNftTokensInfo({ client, tokenId, collectionAddress, iteratedUriNftContracts, walletAddress }),
          ),
      );

      let resolvedInfo;
      const collection = {
        name: collectionName,
        contractAddress: collectionAddress,
      };

      if (chain === 'teritori') {
        resolvedInfo = allTokensInfo.map((tokensInfo) =>
          getTeritoriTokensInfo({ tokensInfo: tokensInfo ?? null, collection }),
        );
      } else {
        resolvedInfo = await Promise.all(
          allTokensInfo.map(async (tokensInfo) =>
            getNonTeritoriTokensInfo({ tokensInfo: tokensInfo ?? null, collection, options }),
          ),
        );
      }

      resolvedInfo = resolvedInfo.filter((info) => info);
      return {
        collection: {
          name: tokensListByCollection.collection.name ?? '',
          image: resolvedInfo[0]?.image ?? '',
        },
        tokens: resolvedInfo as OwnedCollectionTokenInfo[],
      };
    },
    {
      enabled: customQueryOptions.enabled !== false && !!tokensListByCollection,
      ...customQueryOptions,
    },
  );

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
      if (fetchTillIndex < tokensListByCollection.tokens.length) {
        setFetchTillIndex((prevValue) => prevValue + paginationLimit);
      }
    },
  };
};
