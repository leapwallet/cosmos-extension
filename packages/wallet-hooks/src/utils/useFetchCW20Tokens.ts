import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { CosmWasmChain, Cw20Denoms } from '@leapwallet/cosmos-wallet-sdk/dist/browser/constants/cw20-denoms';
import { useQuery } from '@tanstack/react-query';

import { useActiveChain, useCW20TokensStore } from '../store';
import { cachedRemoteDataWithLastModified } from './cached-remote-data';
import { fetchCW20TokensQueryParams } from './cw20TokensQueryParams';
import { storage, useGetStorageLayer } from './global-vars';
import { initResourceFromS3 } from './initResourceFromS3';

const CW20_TOKENS = 'cw20-tokens';
const CW20_TOKENS_LAST_UPDATED_AT = 'cw20-tokens-last-updated-at';

export function getCw20TokensSupportedChains(storage: storage): Promise<{ chains: string[] }> {
  return cachedRemoteDataWithLastModified({
    remoteUrl: 'https://assets.leapwallet.io/cosmos-registry/v1/denoms/cw20-chains.json',
    storageKey: 'cw20-tokens-supported-chains',
    storage,
  });
}

export async function fetchCW20TokensQueryFn(
  activeChain: SupportedChain,
  storage: storage,
  setCW20Tokens: (resource: any, chain: SupportedChain) => void,
) {
  const { chains: cw20TokensSupportedChains } = await getCw20TokensSupportedChains(storage);

  const setResource = (resource: any) => {
    setCW20Tokens(resource, activeChain);
  };

  if (cw20TokensSupportedChains.includes(activeChain)) {
    const resourceKey = `${activeChain}-${CW20_TOKENS}`;
    const resourceURL = `https://assets.leapwallet.io/cosmos-registry/v1/denoms/${activeChain}/cw20.json`;

    const lastUpdatedAtKey = `${activeChain}-${CW20_TOKENS_LAST_UPDATED_AT}`;
    const lastUpdatedAtURL = `https://assets.leapwallet.io/cosmos-registry/v1/denoms/${activeChain}/cw20-last-updated-at.json`;

    initResourceFromS3({
      storage,
      setResource: setResource,
      resourceKey,
      resourceURL,
      lastUpdatedAtKey,
      lastUpdatedAtURL,
      defaultResourceData: Cw20Denoms[activeChain as CosmWasmChain] ?? {},
    });
  }
}

export function useFetchCW20Tokens() {
  const activeChain = useActiveChain();
  const storage = useGetStorageLayer();
  const { setCW20Tokens } = useCW20TokensStore();

  useQuery(
    ['fetch-cw20-tokens', activeChain],
    async () => fetchCW20TokensQueryFn(activeChain, storage, setCW20Tokens),
    fetchCW20TokensQueryParams,
  );
}
