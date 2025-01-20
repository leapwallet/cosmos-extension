import { useTokenPriorityKado } from '@leapwallet/cosmos-wallet-hooks'
import { useQuery } from '@tanstack/react-query'
import { useChainInfos } from 'hooks/useChainInfos'
import { useKadoAssets } from 'hooks/useGetKadoDetails'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { isCompassWallet } from 'utils/isCompassWallet'

export type AssetProps = {
  id?: string
  symbol: string
  chainName: string
  chainId?: string
  assetImg?: string
  chainSymbolImageUrl?: string
  priority?: number
  origin: string
}

export function useGetSupportedAssets() {
  const chainInfos = useChainInfos()
  const denoms = rootDenomsStore.allDenoms
  const { data: kadoAssets = [], isLoading: isAssetsLoading } = useKadoAssets()
  const { data: tokenPriority = {}, isLoading: isPriorityListLoading } = useTokenPriorityKado()

  function filterData() {
    const denomsArray = Object.values(denoms)
    const chainsArray = Object.values(chainInfos)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filteredAssets = kadoAssets.reduce((acc: AssetProps[], asset: any) => {
      const chain = chainsArray.find((chain) => {
        if (isCompassWallet() && chain.key === 'cosmos') {
          return false
        }

        return chain.chainId === asset.officialChainId || chain.chainRegistryPath === asset.origin
      })

      const denomData = denomsArray.find(
        (denom) => denom.coinDenom.toLowerCase() === asset.symbol.toLowerCase(),
      )

      if (chain) {
        acc.push({
          id: asset._id,
          symbol: asset.symbol,
          chainName: chain.chainName,
          chainId: chain.chainId,
          assetImg: denomData?.icon,
          chainSymbolImageUrl: chain.chainSymbolImageUrl,
          priority: tokenPriority[chain.key]?.[asset.symbol],
          origin: asset.origin,
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

  return useQuery(['filtered-kado-assets'], filterData, {
    enabled: chainInfos && denoms && !isAssetsLoading && !isPriorityListLoading,
  })
}
