import { initResourceFromS3, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useQuery } from '@tanstack/react-query';

import { useActiveChain, useAutoFetchedCW20TokensStore } from '../store';
import { cachedRemoteDataWithLastModified } from './cached-remote-data';
import { fetchCW20TokensQueryParams } from './cw20TokensQueryParams';
import { storage, useGetStorageLayer } from './global-vars';
import { BETA_CW20_TOKENS } from './useInitDenoms';

const AUTO_FETCHED_CW20_TOKENS = 'auto-fetched-cw20-tokens';
const AUTO_FETCHED_CW20_TOKENS_LAST_UPDATED_AT = 'auto-fetched-cw20-tokens-last-updated-at';

function getCw20TokensSupportedChains(storage: storage): Promise<{ chains: string[] }> {
  return cachedRemoteDataWithLastModified({
    remoteUrl: 'https://assets.leapwallet.io/cosmos-registry/v1/denoms/cw20-chains.json',
    storageKey: 'cw20-tokens-supported-chains',
    storage,
  });
}

export async function fetchAutoFetchedCW20BalancesQueryFn(
  activeChain: SupportedChain,
  storage: storage,
  setAutoFetchedCW20Tokens: (resource: any, chain: SupportedChain) => void,
) {
  const setResource = async (resource: any) => {
    const betaCW20Tokens = await storage.get(BETA_CW20_TOKENS);

    if (betaCW20Tokens) {
      let allBetaCW20Tokens = {};
      for (const chain in betaCW20Tokens) {
        for (const coinMinimalDenom in betaCW20Tokens[chain]) {
          if (resource[coinMinimalDenom]) {
            delete betaCW20Tokens[chain][coinMinimalDenom];
          }
        }

        allBetaCW20Tokens = { ...allBetaCW20Tokens, ...betaCW20Tokens[chain] };
      }

      await storage.set(BETA_CW20_TOKENS, betaCW20Tokens);
    }

    setAutoFetchedCW20Tokens(resource, activeChain);
  };

  const { chains: cw20TokensSupportedChains } = await getCw20TokensSupportedChains(storage);

  if (cw20TokensSupportedChains.includes(activeChain)) {
    const resourceKey = `${activeChain}-${AUTO_FETCHED_CW20_TOKENS}`;
    const resourceURL = `https://assets.leapwallet.io/cosmos-registry/v1/denoms/${activeChain}/cw20_all.json`;

    const lastUpdatedAtKey = `${activeChain}-${AUTO_FETCHED_CW20_TOKENS_LAST_UPDATED_AT}`;
    const lastUpdatedAtURL = `https://assets.leapwallet.io/cosmos-registry/v1/denoms/${activeChain}/cw20_all-last-updated-at.json`;

    initResourceFromS3({
      storage,
      setResource: setResource,
      resourceKey,
      resourceURL,
      lastUpdatedAtKey,
      lastUpdatedAtURL,
      defaultResourceData: {},
    });
  }
}

export function useFetchAutoFetchedCW20Tokens(forceChain?: SupportedChain) {
  const _activeChain = useActiveChain();
  const activeChain = (forceChain || _activeChain) as SupportedChain & 'aggregated';
  const storage = useGetStorageLayer();
  const { setAutoFetchedCW20Tokens } = useAutoFetchedCW20TokensStore();

  useQuery(
    ['fetch-auto-fetched-cw20-tokens', activeChain],
    async () => {
      if (activeChain && activeChain !== 'aggregated') {
        await fetchAutoFetchedCW20BalancesQueryFn(activeChain, storage, setAutoFetchedCW20Tokens);
      }
    },
    fetchCW20TokensQueryParams,
  );
}
