import { NativeDenom } from '@leapwallet/cosmos-wallet-sdk';

import { useDenoms, useDenomsStore } from '../store';
import { storage, useGetStorageLayer } from './global-vars';
import { BETA_CW20_TOKENS, BETA_NATIVE_TOKENS } from './useInitDenoms';

async function removeBetaTokens(tokenInfo: NativeDenom, chain: string, storageKey: string, storage: storage) {
  const betaTokens = await storage.get(storageKey);
  delete betaTokens[chain][tokenInfo.coinMinimalDenom];

  await storage.set(storageKey, {
    ...betaTokens,
    [chain]: {
      ...betaTokens[chain],
    },
  });
}

export function useRemoveBetaCW20Tokens() {
  const denoms = useDenoms();
  const storage = useGetStorageLayer();
  const { setDenoms } = useDenomsStore();

  return async function (tokenInfo: NativeDenom, chain: string) {
    delete denoms[tokenInfo.coinMinimalDenom];
    setDenoms({ ...denoms });

    await removeBetaTokens(tokenInfo, chain, BETA_CW20_TOKENS, storage);
  };
}

export function useRemoveBetaNativeTokens() {
  const denoms = useDenoms();
  const storage = useGetStorageLayer();
  const { setDenoms } = useDenomsStore();

  return async function (tokenInfo: NativeDenom, chain: string) {
    delete denoms[tokenInfo.coinMinimalDenom];
    setDenoms({ ...denoms });

    await removeBetaTokens(tokenInfo, chain, BETA_NATIVE_TOKENS, storage);
  };
}
