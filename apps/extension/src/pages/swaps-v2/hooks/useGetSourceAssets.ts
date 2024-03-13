import { useGetTokenBalances } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { useSkipAssets } from '@leapwallet/elements-hooks'
import { useQuery } from '@tanstack/react-query'
import { SourceChain, SourceToken } from 'types/swap'

import { QUERY_GET_SOURCE_ASSETS_SWAP } from './useInvalidateSwapAssetsQueries'

export function useGetSourceAssets(sourceChain: SourceChain | undefined) {
  const { allAssets, refetchBalances } = useGetTokenBalances(
    (sourceChain?.key ?? '') as SupportedChain,
  )
  const { data: sourceAssets } = useSkipAssets((sourceChain?.chainId ?? '') as string, {
    includeCW20Assets: true,
  })

  return useQuery(
    [
      `${sourceChain?.key}-${QUERY_GET_SOURCE_ASSETS_SWAP}`,
      allAssets,
      sourceAssets,
      refetchBalances,
    ],
    function () {
      if (sourceAssets && sourceAssets.success && sourceAssets.assets.length > 0) {
        const _sourceAssets: SourceToken[] = []

        allAssets.forEach((asset) => {
          const skipAsset = sourceAssets.assets.find((_skipAsset) =>
            [asset.ibcDenom, asset.coinMinimalDenom].includes(
              _skipAsset.denom.replace('cw20:', ''),
            ),
          )

          if (skipAsset) {
            _sourceAssets.push({ ...asset, skipAsset })
          }
        })

        return { assets: _sourceAssets, refetchBalances }
      }

      return { assets: [], refetchBalances }
    },
  )
}
