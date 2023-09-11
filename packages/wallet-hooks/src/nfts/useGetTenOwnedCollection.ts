// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Dict, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useQuery } from '@tanstack/react-query';

import { useActiveChain, useChainApis } from '../store';
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
export const useGetTenOwnedCollection = (
  tokensListByCollection: TokensListByCollection,
  options?: {
    tokenUriModifier?: TokenUriModifierFn;
    forceChain?: SupportedChain;
    forceNetwork?: 'mainnet' | 'testnet';
  },
  customQueryOptions: QueryOptions<OwnedCollectionInfo> = defaultQueryOptions,
) => {
  const _chain = useActiveChain();
  const chain = options?.forceChain ?? _chain;

  const { rpcUrl } = useChainApis(chain, options?.forceNetwork);
  if (!rpcUrl) {
    throw new Error(`Invalid rpc URL for chain ${chain}`);
  }

  return useQuery<OwnedCollectionInfo>({
    queryKey: ['get-ten-owned-collection', rpcUrl, tokensListByCollection],
    queryFn: async () => {
      const client = await CosmWasmClientHandler.getClient(rpcUrl);
      if (!client || !tokensListByCollection.collection.address) {
        throw new Error('useGetAllNFTsList: Invalid state');
      }

      const allTokensInfo = await Promise.all(
        /**
         * Get 10 NFTs
         */
        tokensListByCollection.tokens.slice(0, 10).map(async (tokenId) => {
          try {
            const nftInfo: NFTInfo = await client.queryContractSmart(tokensListByCollection.collection.address, {
              nft_info: { token_id: tokenId },
            });
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

      let resolvedInfo = await Promise.all(
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
};
