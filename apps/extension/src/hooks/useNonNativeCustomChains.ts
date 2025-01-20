import { useCustomChains, useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { ChainInfo } from '@leapwallet/cosmos-wallet-sdk'
import { useMemo } from 'react'

export function useNonNativeCustomChains(): Record<SupportedChain, ChainInfo> {
  const chains = useGetChains()
  const _customChains = useCustomChains()
  const allNativeChainID = useMemo(() => {
    return Object.values(chains)
      .filter((chain) => chain.enabled)
      .map((chain) => {
        if (chain.testnetChainId && chain.chainId !== chain.testnetChainId) {
          return [chain.chainId, chain.testnetChainId]
        }
        return [chain.chainId]
      })
      .flat()
  }, [chains])

  const customChains = useMemo(() => {
    return _customChains.reduce((acc, d) => {
      if (!allNativeChainID.includes(d.chainId)) {
        acc[d.key as SupportedChain] = d
      }
      return acc
    }, {} as Record<SupportedChain, ChainInfo>)
  }, [_customChains, allNativeChainID])

  return customChains
}
