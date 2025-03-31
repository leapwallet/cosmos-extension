import { useTokenPriorityKado } from '@leapwallet/cosmos-wallet-hooks'
import { useQuery } from '@tanstack/react-query'
import { useChainInfos } from 'hooks/useChainInfos'
import { useKadoAssets } from 'hooks/useGetKadoDetails'
import { useMoonpayAssets } from 'hooks/useGetMoonpayDetails'
import { useTransakAssets } from 'hooks/useGetTransakDetails'
import { rootDenomsStore } from 'stores/denoms-store-instance'

export type AssetProps = {
  id?: string
  symbol: string
  assetImg?: string
  priority?: number
  origin: string
}

export function useGetSupportedAssets() {
  const chainInfos = useChainInfos()
  const denoms = rootDenomsStore.allDenoms
  const { data: kadoAssets = [], isLoading: isKadoAssetsLoading } = useKadoAssets()
  const { data: transakAssets = [], isLoading: isTransakAssetsLoading } = useTransakAssets()
  const { data: moonpayAssets = [], isLoading: isMoonpayAssetsLoading } = useMoonpayAssets()
  const { data: tokenPriority = {}, isLoading: isPriorityListLoading } = useTokenPriorityKado()

  function filterData() {
    const denomsArray = Object.values(denoms)
    const chainsArray = Object.values(chainInfos)

    const assets: AssetProps[] = []

    kadoAssets.map((asset: any) => {
      const chain = chainsArray.find(
        (chain) =>
          chain.key !== 'cosmos' &&
          (chain.chainId === asset.officialChainId || chain.chainRegistryPath === asset.origin),
      )
      const denomData = denomsArray.find(
        (denom) => denom.coinDenom.toLowerCase() === asset.symbol?.toLowerCase(),
      )
      if (chain) {
        assets.push({
          symbol: asset.symbol,
          assetImg: denomData?.icon,
          priority: tokenPriority[chain.key]?.[asset.symbol],
          origin: asset.origin,
        })
      }
    })
    transakAssets.map((asset: any) => {
      const existingAsset = assets.find(
        (item) => item.symbol.toLowerCase() === asset.symbol?.toLowerCase(),
      )
      if (existingAsset) return
      const chain = chainsArray.find(
        (chain) => chain.key !== 'cosmos' && chain.chainName === asset.name,
      )
      const denomData = denomsArray.find(
        (denom) => denom.coinDenom.toLowerCase() === asset.symbol?.toLowerCase(),
      )
      if (chain) {
        assets.push({
          symbol: asset.symbol,
          assetImg: denomData?.icon,
          priority: tokenPriority[chain.key]?.[asset.symbol],
          origin: 'sei',
        })
      }
    })
    moonpayAssets.map((asset: any) => {
      const existingAsset = assets.find(
        (item) => item.symbol.toLowerCase() === asset.symbol?.toLowerCase(),
      )
      if (existingAsset) return
      const chain = chainsArray.find(
        (chain) => chain.key !== 'cosmos' && chain.chainName.toLowerCase() === asset.chain,
      )
      const denomData = denomsArray.find(
        (denom) => denom.coinDenom.toLowerCase() === asset.symbol?.toLowerCase(),
      )
      if (chain) {
        assets.push({
          symbol: asset.symbol,
          assetImg: denomData?.icon,
          priority: tokenPriority[chain.key]?.[asset.symbol],
          origin: 'sei',
        })
      }
    })

    assets.sort((assetA: any, assetB: any) => {
      const priorityA = assetA.priority ?? Infinity
      const priorityB = assetB.priority ?? Infinity
      if (priorityA !== priorityB) {
        return priorityA - priorityB
      }
      return assetA.symbol.localeCompare(assetB.symbol)
    })
    return assets
  }

  return useQuery(['filtered-assets'], filterData, {
    enabled:
      chainInfos &&
      denoms &&
      !isKadoAssetsLoading &&
      !isPriorityListLoading &&
      !isTransakAssetsLoading &&
      !isMoonpayAssetsLoading,
  })
}
