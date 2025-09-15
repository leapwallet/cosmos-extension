import { NativeDenom, SecretToken } from '@leapwallet/cosmos-wallet-sdk';

import { useDenoms, useDenomsStore, useEnabledCW20Tokens, useSnipDenomsStore } from '../store';
import {
  BETA_CW20_TOKENS,
  BETA_ERC20_TOKENS,
  BETA_NATIVE_TOKENS,
  storage,
  useGetStorageLayer,
  useSetEnabledCW20InStorage,
} from '../utils';
import { BETA_SNIP_20_TOKENS } from '../utils/useInitSnipDenoms';
import { BetaTokens } from './useRemoveBetaTokens';

async function setBetaTokens<T>(
  coinMinimalDenom: string,
  tokenInfo: T,
  chain: string,
  storageKey: string,
  storage: storage,
) {
  const betaTokens = await storage.get<BetaTokens<T>>(storageKey);

  if (betaTokens) {
    await storage.set<BetaTokens<T>>(storageKey, {
      ...betaTokens,
      [chain]: {
        ...(betaTokens[chain] ?? {}),
        [coinMinimalDenom]: tokenInfo,
      },
    });
  } else {
    await storage.set<BetaTokens<T>>(storageKey, {
      [chain]: {
        [coinMinimalDenom]: tokenInfo,
      },
    });
  }
}

export function useSetBetaERC20Tokens() {
  const denoms = useDenoms();
  const storage = useGetStorageLayer();
  const { setDenoms } = useDenomsStore();
  const enabledCW20Tokens = useEnabledCW20Tokens();
  const setEnabledCW20Tokens = useSetEnabledCW20InStorage();

  return async (coinMinimalDenom: string, tokenInfo: NativeDenom, chain: string) => {
    setDenoms({
      ...denoms,
      [coinMinimalDenom]: tokenInfo,
    });

    if (!enabledCW20Tokens?.includes(coinMinimalDenom)) {
      await setEnabledCW20Tokens([...enabledCW20Tokens, coinMinimalDenom]);
    }
    await setBetaTokens<NativeDenom>(coinMinimalDenom, tokenInfo, chain, BETA_ERC20_TOKENS, storage);
  };
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
