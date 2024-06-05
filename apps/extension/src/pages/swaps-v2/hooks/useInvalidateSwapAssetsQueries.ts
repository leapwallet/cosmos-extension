import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

export function useInvalidateSwapAssetsQueries() {
  const queryClient = useQueryClient()

  return useCallback(
    (activeChain: SupportedChain) => {
      queryClient.invalidateQueries([`${activeChain}-swap-assets`])
    },
    [queryClient],
  )
}
