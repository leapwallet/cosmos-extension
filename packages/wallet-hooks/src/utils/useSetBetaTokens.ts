import { NativeDenom, SecretToken } from '@leapwallet/cosmos-wallet-sdk';

import { useDenoms, useDenomsStore, useSnipDenomsStore } from '../store';
import { storage, useGetStorageLayer } from './global-vars';
import { BETA_CW20_TOKENS, BETA_NATIVE_TOKENS } from './useInitDenoms';
import { BETA_SNIP_20_TOKENS } from './useInitSnipDenoms';

async function setBetaTokens<T>(
  coinMinimalDenom: string,
  tokenInfo: T,
  chain: string,
  storageKey: string,
  storage: storage,
) {
  const betaTokens = await storage.get(storageKey);

  if (betaTokens) {
    await storage.set(storageKey, {
      ...betaTokens,
      [chain]: {
        ...(betaTokens[chain] ?? {}),
        [coinMinimalDenom]: tokenInfo,
      },
    });
  } else {
    await storage.set(storageKey, {
      ...(betaTokens ?? {}),
      [chain]: {
        [coinMinimalDenom]: tokenInfo,
      },
    });
  }
}

export function useSetBetaCW20Tokens() {
  const denoms = useDenoms();
  const storage = useGetStorageLayer();
  const { setDenoms } = useDenomsStore();

  return async (coinMinimalDenom: string, tokenInfo: NativeDenom, chain: string) => {
    setDenoms({
      ...denoms,
      [coinMinimalDenom]: tokenInfo,
    });
    await setBetaTokens<NativeDenom>(coinMinimalDenom, tokenInfo, chain, BETA_CW20_TOKENS, storage);
  };
}

export function useSetBetaNativeTokens() {
  const denoms = useDenoms();
  const storage = useGetStorageLayer();
  const { setDenoms } = useDenomsStore();

  return async (coinMinimalDenom: string, tokenInfo: NativeDenom, chain: string) => {
    setDenoms({
      ...denoms,
      [coinMinimalDenom]: tokenInfo,
    });
    await setBetaTokens<NativeDenom>(coinMinimalDenom, tokenInfo, chain, BETA_NATIVE_TOKENS, storage);
  };
}

export function useSetBetaSnip20Tokens() {
  const { denoms, setDenoms } = useSnipDenomsStore();
  const storage = useGetStorageLayer();

  return async (coinMinimalDenom: string, tokenInfo: SecretToken, chain: string) => {
    setDenoms({
      ...denoms,
      [coinMinimalDenom]: tokenInfo,
    });
    await setBetaTokens<SecretToken>(coinMinimalDenom, tokenInfo, chain, BETA_SNIP_20_TOKENS, storage);
  };
}
