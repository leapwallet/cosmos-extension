import { SourceToken } from 'types/swap'

export function getSortFnBasedOnWhiteListing(
  autoFetchedTokensList: string[],
  nativeDenoms: string[],
): ((a: SourceToken, b: SourceToken) => number) | undefined {
  return (a, b) => {
    const isAInNativeDenom = nativeDenoms.includes(a.skipAsset.denom)
    const isBInNativeDenom = nativeDenoms.includes(b.skipAsset.denom)
    if (isAInNativeDenom && !isBInNativeDenom) {
      return -1
    }
    if (!isAInNativeDenom && isBInNativeDenom) {
      return 1
    }
    if (a.amount !== '0' || b.amount !== '0') {
      return 0
    }
    const isAAutoFetched = autoFetchedTokensList?.includes(a?.skipAsset.denom)
    const isBAutoFetched = autoFetchedTokensList?.includes(b?.skipAsset.denom)
    if (isAAutoFetched && !isBAutoFetched) {
      return 1
    }
    if (!isAAutoFetched && isBAutoFetched) {
      return -1
    }
    return a.symbol.localeCompare(b.symbol)
  }
}
