import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { TokenInfo } from '@leapwallet/cosmos-wallet-sdk'
import { useQuery } from '@tanstack/react-query'
import { useCosmWasmClient } from 'hooks/cosm-wasm/useCosmWasmClient'
import { UseTokenPairsPricesArgs } from 'types/swap'

import { tokenToTokenPriceQueryWithPools } from './conversion'
import { useQueryMatchingPoolForSwap } from './useQueryMatchingPoolForSwap'
import { useTokenInfo } from './useTokenInfo'

const DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL = 7500

export const useTokenToTokenPriceQuery = ({
  tokenAmount,
  tokenASymbol,
  tokenBSymbol,
  enabled = true,
  refetchInBackground = true,
}: UseTokenPairsPricesArgs) => {
  const { client } = useCosmWasmClient()

  const tokenA = useTokenInfo(tokenASymbol)
  const tokenB = useTokenInfo(tokenBSymbol)

  const [matchingPools] = useQueryMatchingPoolForSwap({
    tokenA: tokenA as TokenInfo,
    tokenB: tokenB as TokenInfo,
  })

  return useQuery({
    queryKey: [`tokenToTokenPrice/${tokenBSymbol}/${tokenASymbol}/${tokenAmount}`, tokenAmount],
    async queryFn() {
      if (tokenA && tokenB && matchingPools) {
        return await tokenToTokenPriceQueryWithPools({
          matchingPools,
          tokenA,
          tokenB,
          client: client as CosmWasmClient,
          amount: tokenAmount,
        })
      }
    },
    enabled: Boolean(
      enabled &&
        client &&
        matchingPools &&
        tokenA &&
        tokenB &&
        tokenAmount > 0 &&
        tokenBSymbol !== tokenASymbol,
    ),
    refetchOnMount: 'always' as const,
    refetchInterval: refetchInBackground ? DEFAULT_TOKEN_BALANCE_REFETCH_INTERVAL : undefined,
    refetchIntervalInBackground: Boolean(refetchInBackground),
  })
}

export const useTokenToTokenPrice = (args: UseTokenPairsPricesArgs) => {
  const { data, isLoading } = useTokenToTokenPriceQuery(args)
  return [data, isLoading] as const
}
