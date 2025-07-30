import { useTokenPriorityKado } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { useQuery } from '@tanstack/react-query'
import { useChainInfos } from 'hooks/useChainInfos'
import { useOnramperAssets } from 'hooks/useGetOnramperDetails'
import { useEffect, useState } from 'react'
import { rootDenomsStore } from 'stores/denoms-store-instance'

export type AssetProps = {
  id?: string
  symbol: string
  chainName: string
  chainId?: string
  assetImg?: string
  chainSymbolImageUrl?: string
  priority?: number
  origin: string
  chainKey: SupportedChain
  tags?: string[]
}

export function useGetSupportedAssets() {
  const chainInfos = useChainInfos()
  const denoms = rootDenomsStore.allDenoms
  const { data, isLoading: isAssetsLoading } = useOnramperAssets()
  const { cryptoAssets = [] } = data ?? {}
  const [isWaited, setIsWaited] = useState(false)

  function filterData() {
    const denomsArray = Object.values(denoms)
    const chainsArray = Object.values(chainInfos)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filteredAssets: AssetProps[] = cryptoAssets.reduce((acc: AssetProps[], asset: any) => {
      const chain = chainsArray.find((chain) => {
        return chain.chainRegistryPath === asset.network || chain.key === asset.network
      })

      const denomData = denomsArray.find(
        (denom) => denom.coinDenom.toLowerCase() === asset.symbol.toLowerCase(),
      )

      if (chain) {
        acc.push({
          symbol: asset.code,
          chainName: chain.chainName,
          chainId: chain.chainId,
          assetImg: denomData?.icon ?? asset.icon,
          chainSymbolImageUrl: chain.chainSymbolImageUrl,
          origin: asset.network,
          chainKey: chain.key,
          id: asset.id,
        })
      }
      return acc
    }, [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filteredAssets.sort((assetA: any, assetB: any) => {
      const priorityA = assetA.priority ?? Infinity
      const priorityB = assetB.priority ?? Infinity
      if (priorityA !== priorityB) {
        return priorityA - priorityB
      }
      return assetA.symbol.localeCompare(assetB.symbol)
    })
    return filteredAssets
  }

  useEffect(() => {
    setTimeout(() => {
      setIsWaited(true)
    }, 1000)
  }, [])

  return useQuery(['filtered-swapped-assets'], filterData, {
    enabled: chainInfos && isWaited && denoms && !isAssetsLoading,
  })
}
