import { useTokenPriorityKado } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { useQuery } from '@tanstack/react-query'
import { useChainInfos } from 'hooks/useChainInfos'
import { useSwappedAssets } from 'hooks/useGetSwappedDetails'
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
  const { data, isLoading: isAssetsLoading } = useSwappedAssets()
  const { data: tokenPriority = {}, isLoading: isPriorityListLoading } = useTokenPriorityKado()
  const { cryptoAssets = [] } = data ?? {}

  function filterData() {
    const denomsArray = Object.values(denoms)
    const chainsArray = Object.values(chainInfos)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filteredAssets: AssetProps[] = cryptoAssets.reduce((acc: AssetProps[], asset: any) => {
      const chain = chainsArray.find((chain) => {
        return chain.chainRegistryPath === asset.network || chain.key === asset.network
      })

      const denomData = denomsArray.find(
        (denom) => denom.coinDenom.toLowerCase() === asset.iso.toLowerCase(),
      )

      if (chain) {
        acc.push({
          symbol: asset.iso,
          chainName: chain.chainName,
          chainId: chain.chainId,
          assetImg: denomData?.icon,
          chainSymbolImageUrl: chain.chainSymbolImageUrl,
          priority: tokenPriority[chain.key]?.[asset.iso],
          origin: asset.network,
          chainKey: chain.key,
          tags: asset.tags,
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

  return useQuery(['filtered-swapped-assets'], filterData, {
    enabled: chainInfos && denoms && !isAssetsLoading && !isPriorityListLoading,
  })
}
