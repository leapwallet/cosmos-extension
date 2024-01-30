import { useGetTokenBalances } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { useSkipAssets } from '@leapwallet/elements-hooks'
import { useQuery } from '@tanstack/react-query'
import { SourceChain, SourceToken } from 'types/swap'

export function useGetSourceAssets(sourceChain: SourceChain | undefined) {
  const { allAssets } = useGetTokenBalances((sourceChain?.key ?? '') as SupportedChain)
  const { data: sourceAssets } = useSkipAssets((sourceChain?.chainId ?? '') as string)

  return useQuery(['get-source-assets-swap', allAssets, sourceAssets], function () {
    if (sourceAssets && sourceAssets.success && sourceAssets.assets.length > 0) {
      const _sourceAssets: SourceToken[] = []

      allAssets.forEach((asset) => {
        const skipAsset = sourceAssets.assets.find((_skipAsset) =>
          [asset.ibcDenom, asset.coinMinimalDenom].includes(_skipAsset.denom),
        )

        if (skipAsset) {
          _sourceAssets.push({ ...asset, skipAsset })
        }
      })

      return _sourceAssets
    }

    return []
  })
}
