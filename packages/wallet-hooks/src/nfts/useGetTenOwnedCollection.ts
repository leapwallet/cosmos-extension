import { useQuery } from '@tanstack/react-query';

import { useActiveChain, useAddress, useChainApis, useIteratedUriEnabledNftContracts } from '../store';
import { CosmWasmClientHandler, defaultQueryOptions, QueryOptions } from '../utils';
import { OwnedCollectionInfo, OwnedCollectionOptions, OwnedCollectionTokenInfo, TokensListByCollection } from './types';
import { getNftTokensInfo, getNonTeritoriTokensInfo, getTeritoriTokensInfo } from './utils';

export const useGetTenOwnedCollection = (
  tokensListByCollection: TokensListByCollection,
  options?: OwnedCollectionOptions,
  customQueryOptions: QueryOptions<OwnedCollectionInfo> = defaultQueryOptions,
) => {
  const _chain = useActiveChain();
  const chain = options?.forceChain ?? _chain;

  const iteratedUriNftContracts = useIteratedUriEnabledNftContracts();
  const { rpcUrl } = useChainApis(chain, options?.forceNetwork);
  const walletAddress = useAddress(chain);

  if (!rpcUrl) {
    throw new Error(`Invalid rpc URL for chain ${chain}`);
  }

  return useQuery<OwnedCollectionInfo>(
    ['get-ten-owned-collection', rpcUrl, tokensListByCollection],
    async function () {
      const client = await CosmWasmClientHandler.getClient(rpcUrl);
      if (!client || !tokensListByCollection.collection.address) {
        throw new Error('useGetTenOwnedCollection: Invalid state');
      }

      const collectionName = tokensListByCollection?.collection?.name ?? '';
      const collectionAddress = tokensListByCollection?.collection?.address ?? '';

      const allTokensInfo = await Promise.all(
        tokensListByCollection.tokens
          .slice(0, 10)
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
};
