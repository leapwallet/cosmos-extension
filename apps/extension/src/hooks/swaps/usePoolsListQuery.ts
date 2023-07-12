/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query'
import { PoolsListQueryResponse } from 'types/swap'

export const usePoolsListQuery = (options?: Parameters<typeof useQuery>[1]) => {
  return useQuery<PoolsListQueryResponse>(
    ['@pools-list'],
    async () => {
      const response = await fetch(process.env.NEXT_PUBLIC_POOLS_LIST_URL as string)
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

export const usePoolFromListQueryById = ({ poolId }: { poolId: string }) => {
  const { data: poolListResponse, isLoading } = usePoolsListQuery()
  return [poolListResponse?.poolsById[poolId], isLoading] as const
}
