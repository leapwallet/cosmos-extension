import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

export const QUERY_GET_SOURCE_ASSETS_SWAP = 'query-get-source-assets-swap'
export const QUERY_GET_DESTINATION_ASSETS_SWAP = 'query-get-destination-assets-swap'

export function useInvalidateSwapAssetsQueries() {
  const queryClient = useQueryClient()

  return useCallback(
    (activeChain: SupportedChain) => {
      queryClient.invalidateQueries([`${activeChain}-${QUERY_GET_SOURCE_ASSETS_SWAP}`])
      queryClient.invalidateQueries([`${activeChain}-${QUERY_GET_DESTINATION_ASSETS_SWAP}`])
    },
    [queryClient],
  )
}
