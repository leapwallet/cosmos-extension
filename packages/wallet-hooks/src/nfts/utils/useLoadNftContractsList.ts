import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import {
  StoredBetaNftCollection,
  useBetaNFTsCollections,
  useDisabledNFTsCollections,
  useEnabledNftsCollections,
  useIsCompassWallet,
} from '../../store';
import { CosmWasmClientHandler, defaultQueryOptions, QueryOptions } from '../../utils';
import { getNftContractsEndpoint } from './index';

export function useLoadNftContractsList(
  chain: SupportedChain,
  network: 'mainnet' | 'testnet',
  rpcUrl: string,
  isEvm = false,
  options: QueryOptions<
    {
      name: string;
      address: string;
    }[]
  > = defaultQueryOptions,
) {
  const isCompassWallet = useIsCompassWallet();
  const enabledNftsCollections = useEnabledNftsCollections(chain);
  const betaNFTsCollections = useBetaNFTsCollections(chain);
  const disabledNftsCollections = useDisabledNFTsCollections();

  const nftCollections = useMemo(() => {
    if (isCompassWallet) {
      return enabledNftsCollections;
    }

    return (betaNFTsCollections?.[network] ?? []).reduce((acc: string[], curr) => {
      return [...acc, ...curr.address];
    }, []);
  }, [betaNFTsCollections, enabledNftsCollections]);

  return useQuery<
    {
      name: string;
      address: string;
    }[]
  >({
    queryKey: ['nft-contracts-list', chain, network, nftCollections, disabledNftsCollections, rpcUrl, isCompassWallet],
    queryFn: async () => {
      const res = await fetch(getNftContractsEndpoint(network, chain, isCompassWallet));
      const betaCollections = nftCollections.reduce((acc: { address: string }[], collection: string) => {
        if (isEvm) {
          if (!collection.toLowerCase().startsWith('0x')) {
            return acc;
          }
        } else if (collection.toLowerCase().startsWith('0x')) {
          return acc;
        }

        return [...acc, { address: collection }];
      }, []);

      if (res.status === 403) {
        return betaCollections;
      } else {
        let data = await res.json();

        if (chain === 'teritori') {
          const client = await CosmWasmClientHandler.getClient(rpcUrl);
          const response = await client.queryContractSmart(data[0].address, {
            addresses: {},
          });

          data = response.map((address: string) => ({ address }));
        }

        const newData = data.filter(({ address }: { address: string }) => {
          if (isEvm && !address.toLowerCase().startsWith('0x')) {
            return false;
          }

          return !nftCollections.includes(address);
        });

        // remove duplicates
        const allCollections = [...newData, ...betaCollections].reduce((acc, curr) => {
          if (!acc.find((v: { address: string }) => v.address.toLowerCase() === curr.address.toLowerCase())) {
            acc.push(curr);
          }

          return acc;
        }, []);

        return allCollections.filter((collection: StoredBetaNftCollection) => {
          if (isCompassWallet) {
            return !disabledNftsCollections.includes(collection.address);
          }

          return true;
        });
      }
    },
    ...options,
  });
}
