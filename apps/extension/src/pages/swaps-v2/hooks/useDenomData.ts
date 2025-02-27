import { useDenomData as useElementsDenomData } from '@leapwallet/elements-hooks'
import { useMemo } from 'react'

import useAssets from './useAssets'

export function useDenomData(denom: string, chainId: string) {
  const { data: elementsDenomData, isLoading: isElementsDenomDataLoading } = useElementsDenomData(
    denom,
    chainId,
  )

  const { data: allAssets, loading: isAllAssetsLoading } = useAssets()

  const mergedDenomData = useMemo(() => {
    if (!allAssets || elementsDenomData) {
      return { data: elementsDenomData, isLoading: isElementsDenomDataLoading }
    }

    const asset = allAssets[chainId]?.find(
      (asset) =>
        asset.originDenom?.toLowerCase() === denom?.toLowerCase() ||
        asset.evmTokenContract?.toLowerCase() === denom?.toLowerCase(),
    )

    if (!asset) return { data: elementsDenomData, isLoading: isElementsDenomDataLoading }

    return {
      data: {
        coinDenom: asset.symbol,
        coinMinimalDenom: asset.originDenom,
        coinDecimals: asset.decimals,
        icon: asset.logoUri ?? '',
        chain: 'seiTestnet2',
        coinGeckoId: asset.coingeckoId ?? '',
      },
      isLoading: isAllAssetsLoading,
    }
  }, [allAssets, chainId, denom, elementsDenomData, isAllAssetsLoading, isElementsDenomDataLoading])

  return mergedDenomData
}
