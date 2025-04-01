import { MergedAsset } from '../hooks/useAssets'

export function hasCoinType(asset: MergedAsset): asset is MergedAsset & { coinType: string } {
  return 'coinType' in asset && !!asset?.coinType
}
