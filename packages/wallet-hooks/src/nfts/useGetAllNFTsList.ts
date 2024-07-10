import { axiosWrapper, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import {
  useActiveChain,
  useAddress,
  useBetaNFTsCollections,
  useChainApis,
  useDisabledNFTsCollections,
  useDisabledNFTsCollectionsStore,
  useEnabledNftsCollections,
  useEnabledNftsCollectionsStore,
  useIsCompassWallet,
  useSelectedNetwork,
} from '../store';
import { transformUrlQueryPath, useGetStorageLayer, useSetDisabledNFTsInStorage } from '../utils';
import { defaultQueryOptions, QueryOptions } from '../utils/useCosmWasmClient';
import { CosmWasmClientHandler } from '../utils/useCosmWasmClient';
import { ENABLED_NFTS_COLLECTIONS } from '../utils-init-hooks';
import type { TokensListByCollection } from './types';
import { getIsFractionalizedNft, getTokensQuery, useLoadNftContractsList } from './utils';

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

  let disabledNFTsCollections = useDisabledNFTsCollections();
  const setDisabledNFTsCollections = useSetDisabledNFTsInStorage();
  const { disabledNFTsCollections: storedDisabledNFTsCollections } = useDisabledNFTsCollectionsStore();

  let enabledNftsCollections = useEnabledNftsCollections(options?.forceContractsListChain ?? chain);
  const { enabledNftsCollections: storedEnabledNftsCollections, setEnabledNftsCollections } =
    useEnabledNftsCollectionsStore();

  const isCompassWallet = useIsCompassWallet();
  const storage = useGetStorageLayer();
  const betaNFTsCollections = useBetaNFTsCollections(options?.forceContractsListChain ?? chain);

  const haveToFillDisabledNFTs = useMemo(() => {
    return (storedDisabledNFTsCollections ?? {})[walletAddress] === undefined;
  }, [walletAddress, storedDisabledNFTsCollections]);

  const _activeNetwork = useSelectedNetwork();
  const activeNetwork = options?.forceNetwork ?? _activeNetwork;
  const { rpcUrl, lcdUrl } = useChainApis(chain, activeNetwork);

  if (rpcUrl && lcdUrl) {
    const { data: nftContractsList, status: nftContractsListStatus } = useLoadNftContractsList(
      options?.forceContractsListChain ?? chain,
      activeNetwork,
      rpcUrl,
    );

    const dynamicKey = isCompassWallet ? [nftContractsList] : [haveToFillDisabledNFTs, betaNFTsCollections];
    return useQuery<TokensListByCollection[]>({
      queryKey: ['nft-records', rpcUrl, walletAddress, ...dynamicKey, lcdUrl, isCompassWallet],
      queryFn: async () => {
        const client = await CosmWasmClientHandler.getClient(rpcUrl);

        if (!nftContractsList || !client) {
          throw new Error('useGetAllNFTsList: Invalid state');
        }

        const fetchResponse = async (
          collectionAddress: string,
          startAfter?: string,
          tokens: string[] = [],
        ): Promise<string[]> => {
          if (chain === 'nibiru' && (await getIsFractionalizedNft(collectionAddress ?? ''))) {
            return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'];
          }

          let _response;
          const query = await getTokensQuery({ walletAddress, limit: 50, startAfter, collectionAddress });

          if (chain === 'teritori') {
            const transformedQuery = transformUrlQueryPath(query, 'base64');

            _response = await axiosWrapper({
              baseURL: lcdUrl,
              method: 'get',
              url: `/cosmwasm/wasm/v1/contract/${collectionAddress}/smart/${transformedQuery}`,
            });
            _response = _response.data.data;
          } else {
            _response = await client.queryContractSmart(collectionAddress, query);
          }

          // for Zen on Injective, we get ids in the response and for others, we get tokens
          const response: { tokens?: string[]; ids?: string[] } = _response;

          const _tokens = response?.tokens ?? response?.ids ?? [];
          tokens = [...tokens, ..._tokens];

          if (_tokens.length === 50) {
            return fetchResponse(collectionAddress, _tokens[49], tokens);
          }
          return tokens;
        };

        let isEnabledChanged = false;
        let isDisabledChanged = false;

        const tokensOwned = await Promise.all(
          nftContractsList.map(async ({ address: collectionAddress }) => {
            try {
              const tokens = await fetchResponse(collectionAddress);

              if (isCompassWallet) {
                if (
                  tokens.length === 0 &&
                  !disabledNFTsCollections.includes(collectionAddress) &&
                  !storedEnabledNftsCollections?.[options?.forceContractsListChain ?? chain]?.includes(
                    collectionAddress,
                  )
                ) {
                  isDisabledChanged = true;
                  disabledNFTsCollections = [...disabledNFTsCollections, collectionAddress];
                } else if (!enabledNftsCollections.includes(collectionAddress)) {
                  isEnabledChanged = true;
                  enabledNftsCollections = [...enabledNftsCollections, collectionAddress];
                }
              } else {
                if (haveToFillDisabledNFTs && tokens.length === 0) {
                  disabledNFTsCollections = [...disabledNFTsCollections, collectionAddress];
                }
              }

              const aboutContract: { name: string } = await client.queryContractSmart(collectionAddress, {
                contract_info: {},
              });
              return {
                collection: { address: collectionAddress, name: aboutContract.name ?? '' },
                tokens,
              };
            } catch (_) {
              //
            }

            return null;
          }),
        );

        if (isCompassWallet && isEnabledChanged) {
          await setEnabledNftsCollections({
            ...storedEnabledNftsCollections,
            [options?.forceContractsListChain ?? chain]: [...enabledNftsCollections],
          });

          await storage.set(
            ENABLED_NFTS_COLLECTIONS,
            JSON.stringify({
              ...storedEnabledNftsCollections,
              [options?.forceContractsListChain ?? chain]: [...enabledNftsCollections],
            }),
          );

          isDisabledChanged && (await setDisabledNFTsCollections(disabledNFTsCollections));
        } else {
          haveToFillDisabledNFTs && (await setDisabledNFTsCollections(disabledNFTsCollections));
        }

        return tokensOwned.filter((v) => v !== null) as TokensListByCollection[];
      },
      enabled: nftContractsListStatus === 'success' && customQueryOptions.enabled !== false,
      ...customQueryOptions,
    });
  }
};
