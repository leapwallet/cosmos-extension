import { Token } from '@leapwallet/cosmos-wallet-hooks'

export function getSortFnBasedOnWhiteListing(
  autoFetchedTokensList: string[],
): ((a: Token, b: Token) => number) | undefined {
  return (a, b) => {
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
