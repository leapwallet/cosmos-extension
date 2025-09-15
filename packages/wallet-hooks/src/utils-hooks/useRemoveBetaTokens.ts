import { NativeDenom } from '@leapwallet/cosmos-wallet-sdk';

import { useDenoms, useDenomsStore } from '../store';
import { storage, useGetStorageLayer } from '../utils/global-vars';
import { BETA_CW20_TOKENS, BETA_ERC20_TOKENS, BETA_NATIVE_TOKENS } from '../utils/useInitDenoms';

export type BetaTokens<T> = Record<string, Record<string, T>>;

async function removeBetaTokens(tokenInfo: NativeDenom, chain: string, storageKey: string, storage: storage) {
  const betaTokens = await storage.get<BetaTokens<NativeDenom>>(storageKey);
  delete betaTokens[chain][tokenInfo.coinMinimalDenom];

  await storage.set<BetaTokens<NativeDenom>>(storageKey, {
    ...betaTokens,
    [chain]: {
      ...betaTokens[chain],
    },
  });
}

export function useRemoveBetaERC20Tokens() {
  const denoms = useDenoms();
  const storage = useGetStorageLayer();
  const { setDenoms } = useDenomsStore();

  return async function (tokenInfo: NativeDenom, chain: string) {
    delete denoms[tokenInfo.coinMinimalDenom];
    setDenoms({ ...denoms });

    await removeBetaTokens(tokenInfo, chain, BETA_ERC20_TOKENS, storage);
  };
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
