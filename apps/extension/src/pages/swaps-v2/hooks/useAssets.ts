import {
  MosaicSupportedAsset,
  SkipSupportedAsset,
  useAllSkipAssets,
  useMosaicAssets,
} from '@leapwallet/elements-hooks'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { compassTokenTagsStore } from 'stores/denoms-store-instance'

import { useProviderFeatureFlags } from './useProviderFeatureFlags'

export type MergedAsset = (SkipSupportedAsset | MosaicSupportedAsset) & {
  evmChainId?: string
  evmTokenContract?: string
  evmDecimals?: number
}

export default function useAssets() {
  const { isSkipEnabled, isEvmSwapEnabled } = useProviderFeatureFlags()
  const blacklistedTokens = compassTokenTagsStore.blacklistedTokens

  const useAllSkipAssetsParams = useMemo(() => {
    return {
      includeCW20Assets: true,
      includeNoMetadataAssets: false,
      includeEVMAssets: isEvmSwapEnabled,
      includeSVMAssets: false,
      nativeOnly: false,
    }
  }, [isEvmSwapEnabled])

  const { data: _allSkipAssets, isLoading: loadingAllSkipAssets } =
    useAllSkipAssets(useAllSkipAssetsParams)

  const { data: _mosaicAssets } = useMosaicAssets()

  const allSkipAssets:
    | Record<string, SkipSupportedAsset[]>
    | Record<string, MosaicSupportedAsset[]>
    | undefined = isSkipEnabled
    ? Object.assign({}, _allSkipAssets, _mosaicAssets?.assets)
    : undefined

  const allAssetsKey = useMemo(() => {
    return ['allSkipAssets', allSkipAssets]
  }, [allSkipAssets])

  const { data: allAssets, isLoading: loadingAllAssets } = useQuery(
    allAssetsKey,
    async () => {
      if (blacklistedTokens.length > 0 && allSkipAssets) {
        Object.keys(allSkipAssets).forEach((chainId) => {
          if (allSkipAssets[chainId]) {
            allSkipAssets[chainId] = allSkipAssets[chainId]?.filter(
              (asset) =>
                !blacklistedTokens.includes(
                  asset.originDenom?.replace(/(cw20:|erc20\/)/g, '').toLowerCase(),
                ),
            )
          }
        })
        return allSkipAssets as Record<string, MergedAsset[]> | undefined
      }
      return allSkipAssets as Record<string, MergedAsset[]> | undefined
    },
    {
      enabled: ['search', '/home', '/swap', '/assetDetails'].some((path) =>
        location.hash.includes(path),
      ),
      staleTime: 1000 * 60 * 2,
      cacheTime: 1000 * 60 * 5,
    },
  )

  return {
    data: allAssets,
    loadingAllSkipAssets,
    loading: loadingAllAssets,
  }
}
