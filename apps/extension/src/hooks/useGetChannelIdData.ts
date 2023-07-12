import { getChannelIdData } from '@leapwallet/cosmos-wallet-sdk'
import { useCallback } from 'react'
import browser from 'webextension-polyfill'

import { useActiveChain } from './settings/useActiveChain'
import { useRpcUrl } from './settings/useRpcUrl'

export function useGetChannelIdData() {
  const lcdUrl = useRpcUrl().lcdUrl
  const activeChain = useActiveChain()

  return useCallback(
    async (channelId: string) => {
      const cacheKey = `${channelId}-${activeChain}`
      const storage = await browser.storage.local.get(cacheKey)
      if (cacheKey in storage) {
        return storage[cacheKey]
      }
      const chainId = await getChannelIdData(lcdUrl as string, channelId)
      await browser.storage.local.set({ [cacheKey]: chainId })
      return chainId
    },
    [lcdUrl],
  )
}
