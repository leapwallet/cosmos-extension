/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { PoolsListQueryResponse, TokenList } from 'types/swap'
import { DEBUG } from 'utils/debug'

export const usePoolsListQuery = (options?: Parameters<typeof useQuery>[1]) => {
  return useQuery<PoolsListQueryResponse>(
    ['@pools-list'],
    async () => {
      const response = await fetch(
        'https://assets.leapwallet.io/CosmosContracts/junoswap-asset-list/pools_list.json',
      )
      const tokenList = await response.json()

      return {
        ...tokenList,
        poolsById: tokenList.pools.reduce(
          (poolsById: { [x: string]: any }, pool: { pool_id: string | number }) => (
            (poolsById[pool.pool_id] = pool), poolsById
          ),
          {},
        ),
      }
    },
    Object.assign(
      {
        refetchOnMount: false,
      },
      options || {},
    ),
  )
}

export const useTokenList = () => {
  const { data: poolsListResponse } = usePoolsListQuery()

  /* generate token list off pool list and store it in cache */
  const { data } = useQuery<TokenList>(
    ['@token-list'],
    () => {
      const tokenMapBySymbol = new Map()
      poolsListResponse?.pools.forEach(({ pool_assets }) => {
        pool_assets.forEach((token) => {
          if (!tokenMapBySymbol.has(token.symbol)) {
            tokenMapBySymbol.set(token.symbol, token)
          }
        })
      })

      return {
        base_token: poolsListResponse?.base_token,
        tokens: Array.from(tokenMapBySymbol.values()),
        tokensBySymbol: tokenMapBySymbol,
      } as TokenList
    },
    {
      enabled: Boolean(poolsListResponse?.pools),
      refetchOnMount: false,
      onError(e: any) {
        DEBUG('Error generating token list:', e.toString())
      },
    },
  )

  const isLoading = !poolsListResponse?.pools

  return [data, isLoading] as const
}

export const useTokenId = () => {
  const [tokenList] = useTokenList()

  return useMemo(() => {
    return (tokenName: string): string | null | undefined => {
      if (!tokenList) {
        return null
      }
      const token = tokenList.tokensBySymbol.get(tokenName)

      return token?.id
    }
  }, [tokenList])
}
