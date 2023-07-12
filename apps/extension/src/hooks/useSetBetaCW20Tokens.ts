import {
  BETA_CW20_TOKENS,
  useDenoms,
  useDenomsStore,
  useSnipDenomsStore,
} from '@leapwallet/cosmos-wallet-hooks'
import { BETA_SNIP_20_TOKENS } from '@leapwallet/cosmos-wallet-hooks/dist/utils/useInitSnipDenoms'
import { NativeDenom, SecretToken } from '@leapwallet/cosmos-wallet-sdk'
import Browser from 'webextension-polyfill'

async function setBetaTokens<T>(
  coinMinimalDenom: string,
  tokenInfo: T,
  chain: string,
  storageKey: string,
) {
  const storage = await Browser.storage.local.get([storageKey])
  if (storage[storageKey]) {
    await Browser.storage.local.set({
      [storageKey]: {
        ...storage[storageKey],
        [chain]: {
          ...(storage[storageKey][chain] ?? {}),
          [coinMinimalDenom]: tokenInfo,
        },
      },
    })
  } else {
    await Browser.storage.local.set({
      [storageKey]: {
        [chain]: {
          [coinMinimalDenom]: tokenInfo,
        },
      },
    })
  }
}

export function useSetBetaCW20Tokens() {
  const denoms = useDenoms()
  const { setDenoms } = useDenomsStore()

  return async (coinMinimalDenom: string, tokenInfo: NativeDenom, chain: string) => {
    setDenoms({
      ...denoms,
      [coinMinimalDenom]: tokenInfo,
    })
    await setBetaTokens<NativeDenom>(coinMinimalDenom, tokenInfo, chain, BETA_CW20_TOKENS)
  }
}

export function useSetBetaSnip20Tokens() {
  const { denoms, setDenoms } = useSnipDenomsStore()
  return async (coinMinimalDenom: string, tokenInfo: SecretToken, chain: string) => {
    setDenoms({
      ...denoms,
      [coinMinimalDenom]: tokenInfo,
    })
    await setBetaTokens<SecretToken>(coinMinimalDenom, tokenInfo, chain, BETA_SNIP_20_TOKENS)
  }
}
