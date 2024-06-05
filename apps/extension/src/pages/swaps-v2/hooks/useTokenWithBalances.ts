import {
  bankQueryIds,
  currencyDetail,
  fetchCurrency,
  useAddress,
  useAutoFetchedCW20Tokens,
  useBetaCW20Tokens,
  useChainApis,
  useCW20Tokens,
  useDisabledCW20Tokens,
  useEnabledCW20Tokens,
  useUserPreferredCurrency,
} from '@leapwallet/cosmos-wallet-hooks'
import { fetchCW20Balances, fromSmall, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import { SourceChain, SourceToken } from 'types/swap'

import { SWAP_NETWORK } from './useSwapsTx'

export function useTokenWithBalances(
  token: SourceToken | null,
  chain: SourceChain | undefined,
): { data: any; status: any } {
  const disabledCW20Tokens = useDisabledCW20Tokens(chain?.key ?? undefined)
  const enabledCW20Tokens = useEnabledCW20Tokens(chain?.key ?? undefined)
  const cw20Tokens = useCW20Tokens(chain?.key ?? undefined)
  const autoFetchedCW20Tokens = useAutoFetchedCW20Tokens(chain?.key ?? undefined)
  const betaCw20Tokens = useBetaCW20Tokens(chain?.key ?? undefined)
  const queryClient = useQueryClient()
  const { rpcUrl } = useChainApis(chain?.key ?? undefined, SWAP_NETWORK)
  const [preferredCurrency] = useUserPreferredCurrency()

  const preferredCurrencyPointer = currencyDetail[preferredCurrency].currencyPointer

  const address = useAddress(chain?.key ?? undefined)
  /**
   * Managed Tokens Coin Minimal Denoms
   */
  const managedTokens = useMemo(() => {
    return [
      ...Object.values(cw20Tokens),
      ...Object.values(autoFetchedCW20Tokens),
      ...Object.values(betaCw20Tokens ?? {}),
    ].map((token) => token.coinMinimalDenom)
  }, [autoFetchedCW20Tokens, betaCw20Tokens, cw20Tokens])

  const { data, status } = useQuery(
    [
      token?.coinMinimalDenom,
      token?.skipAsset?.denom,
      token?.skipAsset?.originDenom,
      token?.amount,
    ],
    async () => {
      if (!token || !chain) return token

      if (!managedTokens.includes(token.coinMinimalDenom)) return token

      if (
        !(
          disabledCW20Tokens.includes(token.coinMinimalDenom) ||
          (Object.keys(autoFetchedCW20Tokens).includes(token.coinMinimalDenom) &&
            !enabledCW20Tokens?.includes(token.coinMinimalDenom))
        )
      ) {
        return token
      }

      try {
        let balances: any[]
        if (token?.coinMinimalDenom) {
          balances = await fetchCW20Balances(rpcUrl ?? '', address, [token?.coinMinimalDenom ?? ''])
        } else {
          balances = []
        }
        if (!balances?.length) return token

        const balance = balances?.[0]
        queryClient.setQueryData(
          [
            `${chain?.key}-${bankQueryIds.cw20TokenBalancesRaw}`,
            chain?.key,
            address,
            [token?.coinMinimalDenom],
          ],
          balances,
        )

        const amount = fromSmall(new BigNumber(balance.amount).toString(), token?.coinDecimals)

        let usdPrice
        try {
          usdPrice = await fetchCurrency(
            '1',
            token?.coinGeckoId,
            (token?.chain ?? '') as SupportedChain,
            preferredCurrencyPointer,
            `${chain?.chainId}-${token?.coinMinimalDenom}`,
          )
        } catch (error) {
          //
        }

        return {
          ...token,
          amount,
          usdPrice,
          usdValue: usdPrice ? new BigNumber(amount).multipliedBy(usdPrice).toString() : undefined,
        }
      } catch (error) {
        return token
      }
    },
  )

  return { data: (status === 'success' ? data ?? null : token) as SourceToken | null, status }
}
