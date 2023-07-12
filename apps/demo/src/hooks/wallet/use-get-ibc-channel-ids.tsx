import { useChainsStore } from '@leapwallet/cosmos-wallet-hooks'
import {
  addressPrefixes,
  getBlockChainFromAddress,
  getChannelIds,
} from '@leapwallet/cosmos-wallet-sdk'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/constants'
import { useCallback } from 'react'

import { useAddress } from './use-address'

export function useGetIbcChannelId() {
  const fromAddress = useAddress()
  const { chains } = useChainsStore()

  return useCallback(
    async (toAddress: string) => {
      const sourceChain = getBlockChainFromAddress(fromAddress)
      const recipientChain = getBlockChainFromAddress(toAddress)

      if (sourceChain && recipientChain && sourceChain !== recipientChain) {
        try {
          const sourceChainKey = addressPrefixes[sourceChain] as SupportedChain
          const destChainKey = addressPrefixes[recipientChain] as SupportedChain
          return await getChannelIds(
            chains[sourceChainKey].chainRegistryPath,
            chains[destChainKey].chainRegistryPath,
          )
        } catch (_) {
          throw new Error('We currently do not support IBC across these chains')
        }
      }
    },
    [fromAddress],
  )
}
