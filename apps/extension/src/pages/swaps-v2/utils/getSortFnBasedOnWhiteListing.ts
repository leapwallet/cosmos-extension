import { Token } from '@leapwallet/cosmos-wallet-hooks'

export function getSortFnBasedOnWhiteListing(
  autoFetchedTokensList: string[],
  nativeDenoms: string[],
): ((a: Token, b: Token) => number) | undefined {
  return (a, b) => {
    const isAInNativeDenom = nativeDenoms.includes(a.coinMinimalDenom)
    const isBInNativeDenom = nativeDenoms.includes(b.coinMinimalDenom)
    if (isAInNativeDenom && !isBInNativeDenom) {
      return -1
    }
    if (!isAInNativeDenom && isBInNativeDenom) {
      return 1
    }
    if (a.amount !== '0' || b.amount !== '0') {
      return 0
    }
    const isAAutoFetched = autoFetchedTokensList?.includes(a?.coinMinimalDenom)
    const isBAutoFetched = autoFetchedTokensList?.includes(b?.coinMinimalDenom)
    if (isAAutoFetched && !isBAutoFetched) {
      return 1
    }
    if (!isAAutoFetched && isBAutoFetched) {
      return -1
    }
    return a.symbol.localeCompare(b.symbol)
  }
}
