import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { Erc20Denoms } from '@leapwallet/cosmos-wallet-sdk/dist/browser/constants/erc20-denoms';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useActiveChain, useERC20TokensStore } from '../store';
import { cachedRemoteDataWithLastModified } from './cached-remote-data';
import { storage, useGetStorageLayer } from './global-vars';
import { initResourceFromS3 } from './initResourceFromS3';

const ERC20_TOKENS = 'erc20-tokens';
const ERC20_TOKENS_LAST_UPDATED_AT = 'erc20-tokens-last-updated-at';

export function getErc20TokensSupportedChains(storage: storage): Promise<{ chains: string[] }> {
  return cachedRemoteDataWithLastModified({
    remoteUrl: 'https://assets.leapwallet.io/cosmos-registry/v1/denoms/erc20-chains.json',
    storageKey: 'erc20-tokens-supported-chains',
    storage,
  });
}

export function useFetchERC20Tokens(forceChain?: SupportedChain, forceSupportedChainsList?: string[]) {
  const _activeChain = useActiveChain();
  const activeChain = useMemo(
    () => (forceChain || _activeChain) as SupportedChain & 'aggregated',
    [forceChain, _activeChain],
  );

  const storage = useGetStorageLayer();
  const { setERC20Tokens } = useERC20TokensStore();

  useQuery(
    ['fetch-erc20-tokens', activeChain, forceSupportedChainsList],
    async () => {
      if (activeChain && activeChain !== 'aggregated') {
        const { chains: erc20TokensSupportedChains } = forceSupportedChainsList
          ? { chains: forceSupportedChainsList }
          : await getErc20TokensSupportedChains(storage);

        if (erc20TokensSupportedChains.includes(activeChain)) {
          const resourceKey = `${activeChain}-${ERC20_TOKENS}`;
          const resourceURL = `https://assets.leapwallet.io/cosmos-registry/v1/denoms/${activeChain}/erc20.json`;

          const lastUpdatedAtKey = `${activeChain}-${ERC20_TOKENS_LAST_UPDATED_AT}`;
          const lastUpdatedAtURL = `https://assets.leapwallet.io/cosmos-registry/v1/denoms/${activeChain}/erc20-last-updated-at.json`;

          const setResource = (resource: any) => {
            setERC20Tokens(resource, activeChain);
          };

          initResourceFromS3({
            storage,
            setResource,
            resourceKey,
            resourceURL,
            lastUpdatedAtKey,
            lastUpdatedAtURL,
            defaultResourceData: Erc20Denoms[activeChain as 'evmos'] ?? {},
          });
        }
      }
    },
    {
      retry: (failureCount: number, error: any) => {
        if (error.response?.status === 404 || error.response?.status === 403 || error.response?.status === 429) {
          return false;
        }

        return failureCount < 3;
      },
      enabled: activeChain !== 'aggregated',
    },
  );
}
