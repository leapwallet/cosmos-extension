import {
  useAutoFetchedCW20Tokens,
  useBetaCW20Tokens,
  useCW20Tokens,
  useDisabledCW20Tokens,
  useEnabledCW20Tokens,
  useSetDisabledCW20InStorage,
  useSetEnabledCW20InStorage,
} from '@leapwallet/cosmos-wallet-hooks'
import { useCallback, useMemo } from 'react'
import { SourceChain, SourceToken } from 'types/swap'

export function useEnableToken(
  chain: SourceChain | undefined,
  tokenToEnable: SourceToken | undefined | null,
) {
  const disabledCW20Tokens = useDisabledCW20Tokens(chain?.key ?? undefined)
  const enabledCW20Tokens = useEnabledCW20Tokens(chain?.key ?? undefined)
  const cw20Tokens = useCW20Tokens(chain?.key ?? undefined)
  const autoFetchedCW20Tokens = useAutoFetchedCW20Tokens(chain?.key ?? undefined)
  const betaCw20Tokens = useBetaCW20Tokens(chain?.key ?? undefined)
  const setEnabledCW20Tokens = useSetEnabledCW20InStorage(chain?.key ?? undefined)
  const setDisabledCW20Tokens = useSetDisabledCW20InStorage(chain?.key ?? undefined)

  const managedTokens = useMemo(() => {
    return [
      ...Object.values(cw20Tokens),
      ...Object.values(autoFetchedCW20Tokens),
      ...Object.values(betaCw20Tokens ?? {}),
    ].map((token) => token.coinMinimalDenom)
  }, [autoFetchedCW20Tokens, betaCw20Tokens, cw20Tokens])

  const enableToken = useCallback(async () => {
    if (!tokenToEnable || !chain) return

    if (!managedTokens.includes(tokenToEnable.coinMinimalDenom)) return

    if (
      !(
        disabledCW20Tokens.includes(tokenToEnable.coinMinimalDenom) ||
        (Object.keys(autoFetchedCW20Tokens).includes(tokenToEnable.coinMinimalDenom) &&
          !enabledCW20Tokens?.includes(tokenToEnable.coinMinimalDenom))
      )
    ) {
      return
    }

    const _disabledCW20Tokens = disabledCW20Tokens.filter(
      (_token) => _token !== tokenToEnable?.coinMinimalDenom,
    )
    const _enabledCW20Tokens = [...enabledCW20Tokens, tokenToEnable?.coinMinimalDenom]
    await setDisabledCW20Tokens(_disabledCW20Tokens)
    await setEnabledCW20Tokens(_enabledCW20Tokens)
  }, [
    autoFetchedCW20Tokens,
    chain,
    disabledCW20Tokens,
    enabledCW20Tokens,
    managedTokens,
    setDisabledCW20Tokens,
    setEnabledCW20Tokens,
    tokenToEnable,
  ])

  return { enableToken }
}
