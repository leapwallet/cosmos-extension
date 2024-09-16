import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import {
  AutoFetchedCW20DenomsStore,
  BetaCW20DenomsStore,
  CW20DenomsStore,
  DisabledCW20DenomsStore,
  EnabledCW20DenomsStore,
} from '@leapwallet/cosmos-wallet-store'
import { useCallback, useMemo } from 'react'
import { SourceChain, SourceToken } from 'types/swap'

export function useEnableToken(
  chain: SourceChain | undefined,
  tokenToEnable: SourceToken | undefined | null,
  autoFetchedCW20DenomsStore: AutoFetchedCW20DenomsStore,
  betaCW20DenomsStore: BetaCW20DenomsStore,
  cw20DenomsStore: CW20DenomsStore,
  disabledCW20DenomsStore: DisabledCW20DenomsStore,
  enabledCW20DenomsStore: EnabledCW20DenomsStore,
) {
  const cw20Tokens = cw20DenomsStore.getCW20DenomsForChain((chain?.key ?? '') as SupportedChain)
  const enabledCW20Tokens = enabledCW20DenomsStore.getEnabledCW20DenomsForChain(
    (chain?.key ?? '') as SupportedChain,
  )
  const disabledCW20Tokens = disabledCW20DenomsStore.getDisabledCW20DenomsForChain(
    (chain?.key ?? '') as SupportedChain,
  )
  const betaCw20Tokens = betaCW20DenomsStore.getBetaCW20DenomsForChain(
    (chain?.key ?? '') as SupportedChain,
  )
  const autoFetchedCW20Denoms = autoFetchedCW20DenomsStore.getAutoFetchedCW20DenomsForChain(
    (chain?.key ?? '') as SupportedChain,
  )

  const managedTokens = useMemo(() => {
    return [
      ...Object.values(cw20Tokens ?? {}),
      ...Object.values(autoFetchedCW20Denoms ?? {}),
      ...Object.values(betaCw20Tokens ?? {}),
    ].map((token) => token.coinMinimalDenom)
  }, [autoFetchedCW20Denoms, betaCw20Tokens, cw20Tokens])

  const enableToken = useCallback(async () => {
    if (!tokenToEnable || !chain) return

    if (!managedTokens.includes(tokenToEnable.coinMinimalDenom)) return

    if (
      !(
        disabledCW20Tokens.includes(tokenToEnable.coinMinimalDenom) ||
        (Object.keys(autoFetchedCW20Denoms).includes(tokenToEnable.coinMinimalDenom) &&
          !enabledCW20Tokens?.includes(tokenToEnable.coinMinimalDenom))
      )
    ) {
      return
    }

    const _disabledCW20Tokens = disabledCW20Tokens.filter(
      (_token) => _token !== tokenToEnable?.coinMinimalDenom,
    )
    const _enabledCW20Tokens = [...enabledCW20Tokens, tokenToEnable?.coinMinimalDenom]
    await disabledCW20DenomsStore.setDisabledCW20Denoms(_disabledCW20Tokens, chain?.key)
    await enabledCW20DenomsStore.setEnabledCW20Denoms(_enabledCW20Tokens, chain?.key)
  }, [
    autoFetchedCW20Denoms,
    chain,
    disabledCW20DenomsStore,
    disabledCW20Tokens,
    enabledCW20DenomsStore,
    enabledCW20Tokens,
    managedTokens,
    tokenToEnable,
  ])

  return { enableToken }
}
