import { useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import { IQueryDenomTraceResponse, TransferQueryClient } from '@leapwallet/cosmos-wallet-sdk'
import { useCallback } from 'react'
import browser from 'webextension-polyfill'

import { useActiveChain } from './settings/useActiveChain'
import { useRpcUrl } from './settings/useRpcUrl'

export function useGetIbcDenomTrace() {
  const rpcUrl = useRpcUrl().rpcUrl
  const activeChain = useActiveChain()
  const chainInfos = useGetChains()

  return useCallback(
    async (hash: string) => {
      const storageKey = `${hash}-${activeChain}`
      const storage = await browser.storage.local.get(storageKey)
      if (storageKey in storage) {
        return storage[storageKey] as IQueryDenomTraceResponse
      }

      const denomTrace = await TransferQueryClient.getDenomTrace(hash, `${rpcUrl}/`, chainInfos)
      await browser.storage.local.set({ [storageKey]: denomTrace.denomTrace })
      return denomTrace.denomTrace
    },
    [activeChain, rpcUrl, chainInfos],
  )
}
