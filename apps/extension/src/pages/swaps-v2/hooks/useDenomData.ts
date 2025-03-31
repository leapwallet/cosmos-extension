import { DenomsRecord } from '@leapwallet/cosmos-wallet-sdk'
import { useDenomData as useElementsDenomData } from '@leapwallet/elements-hooks'
import { useMemo } from 'react'

import { hasCoinType } from '../utils'
import useAssets from './useAssets'

export function useDenomData(denom: string, chainId: string, denoms: DenomsRecord) {
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
        asset.evmTokenContract?.toLowerCase() === denom?.toLowerCase() ||
        (hasCoinType(asset) && asset.coinType?.toLowerCase() === denom?.toLowerCase()),
    )

    if (!asset) return { data: elementsDenomData, isLoading: isElementsDenomDataLoading }

    const icon = asset.logoUri ?? (hasCoinType(asset) ? denoms[asset.coinType]?.icon : '') ?? ''

    return {
      data: {
        coinDenom: asset.symbol,
        coinMinimalDenom: asset.originDenom,
        coinDecimals: asset.decimals,
        icon,
        chain: 'seiTestnet2',
        coinGeckoId: asset.coingeckoId ?? '',
      },
      isLoading: isAllAssetsLoading,
    }
  }, [
    allAssets,
    chainId,
    denom,
    denoms,
    elementsDenomData,
    isAllAssetsLoading,
    isElementsDenomDataLoading,
  ])

  return mergedDenomData
}
