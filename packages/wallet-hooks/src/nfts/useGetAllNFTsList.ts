import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import {
  useActiveChain,
  useAddress,
  useBetaNFTsCollections,
  useChainApis,
  useDisabledNFTsCollections,
  useDisabledNFTsCollectionsStore,
  useIsCompassWallet,
  useSelectedNetwork,
} from '../store';
import { useSetDisabledNFTsInStorage } from '../utils';
import { defaultQueryOptions, QueryOptions } from '../utils/useCosmWasmClient';
import { CosmWasmClientHandler } from '../utils/useCosmWasmClient';
import type { TokensListByCollection } from './types';

const getNFTContracts = (network: 'mainnet' | 'testnet', chain: SupportedChain, isCompassWallet?: boolean) => {
  return `https://assets.leapwallet.io/cosmos-registry/v1/nft-contracts${
    isCompassWallet ? '-compass' : ''
  }/${network}/${chain}.json`;
};

/**
 * This hook will load NFT contracts list from leapwallet/nft-contracts-list repo
 *
 * @param chain
 * @param options
 * @returns
 */
export const useLoadNFTContractsList = (
  chain: SupportedChain,
  network: 'mainnet' | 'testnet',
  options: QueryOptions<
    {
      name: string;
      address: string;
    }[]
  > = defaultQueryOptions,
) => {
  const isCompassWallet = useIsCompassWallet();
  return useQuery<
    {
      name: string;
      address: string;
    }[]
  >({
    queryKey: ['nft-contracts-list', chain],
    queryFn: async () => {
      const res = await fetch(getNFTContracts(network, chain, isCompassWallet));
      return res.json();
    },
    ...options,
  });
};

/**
 * This hook is used to load the collection info along with list of tokens owned by the wallet address
 *
 * @param customQueryOptions query options
 * @returns
 */
export const useGetAllNFTsList = (
  options?: {
    forceChain?: SupportedChain;
    forceWalletAddress?: string;
    forceContractsListChain?: SupportedChain;
    forceNetwork?: 'mainnet' | 'testnet';
  },
  customQueryOptions: QueryOptions<TokensListByCollection[]> = defaultQueryOptions,
) => {
  const _chain = useActiveChain();
  const chain = options?.forceChain ?? _chain;

  const _walletAddress = useAddress(chain);
  const walletAddress = options?.forceWalletAddress ?? _walletAddress;

  const betaNFTsCollections = useBetaNFTsCollections();
  let disabledNFTsCollections = useDisabledNFTsCollections();
  const { disabledNFTsCollections: storedDisabledNFTsCollections } = useDisabledNFTsCollectionsStore();
  const setDisabledNFTsCollections = useSetDisabledNFTsInStorage();
  const _activeNetwork = useSelectedNetwork();
  const activeNetwork = options?.forceNetwork ?? _activeNetwork;
  const { rpcUrl } = useChainApis(chain, activeNetwork);

  const haveToFillDisabledNFTs = useMemo(() => {
    return (storedDisabledNFTsCollections ?? {})[walletAddress] === undefined;
  }, [walletAddress, storedDisabledNFTsCollections]);

  if (rpcUrl) {
    const { data: nftContractsList, status: nftContractsListStatus } = useLoadNFTContractsList(
      options?.forceContractsListChain ?? chain,
      activeNetwork,
    );

    return useQuery<TokensListByCollection[]>({
      queryKey: ['nft-records', rpcUrl, walletAddress, haveToFillDisabledNFTs, betaNFTsCollections],
      queryFn: async () => {
        const client = await CosmWasmClientHandler.getClient(rpcUrl);

        if (!nftContractsList || !client) {
          throw new Error('useGetAllNFTsList: Invalid state');
        }

        const fetchResponse = async (
          collectionAddress: string,
          start_after?: string,
          tokens: string[] = [],
        ): Promise<string[]> => {
          const query = { tokens: { owner: walletAddress, limit: 50, start_after } };

          // for Zen on Injective, we get ids in the response and for others, we get tokens
          const response: { tokens?: string[]; ids?: string[] } = await client.queryContractSmart(
            collectionAddress,
            query,
          );

          const _tokens = response?.tokens ?? response?.ids ?? [];
          tokens = [...tokens, ..._tokens];

          if (_tokens.length === 50) {
            return fetchResponse(collectionAddress, _tokens[49], tokens);
          }
          return tokens;
        };

        const tokensOwned = await Promise.all(
          [...nftContractsList, ...betaNFTsCollections.map((collection) => ({ address: collection }))].map(
            async ({ address: collectionAddress }) => {
              try {
                const tokens = await fetchResponse(collectionAddress);

                if (haveToFillDisabledNFTs && tokens.length === 0) {
                  disabledNFTsCollections = [...disabledNFTsCollections, collectionAddress];
                }

                const aboutContract: { name: string } = await client.queryContractSmart(collectionAddress, {
                  contract_info: {},
                });
                return {
                  collection: { address: collectionAddress, name: aboutContract.name },
                  tokens,
                };
              } catch (_) {
                //
              }

              return null;
            },
          ),
        );

        haveToFillDisabledNFTs && (await setDisabledNFTsCollections(disabledNFTsCollections));
        return tokensOwned.filter((v) => v !== null) as TokensListByCollection[];
      },
      enabled: nftContractsListStatus === 'success' && customQueryOptions.enabled !== false,
      ...customQueryOptions,
    });
  }
};
