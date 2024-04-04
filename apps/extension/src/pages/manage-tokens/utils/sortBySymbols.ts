import { SupportedToken } from '../components'

export function sortBySymbols(tokenA: SupportedToken, tokenB: SupportedToken) {
  const symbolA = tokenA.coinDenom.toUpperCase()
  const symbolB = tokenB.coinDenom.toUpperCase()

  if (symbolA < symbolB) return -1
  if (symbolA < symbolB) return 1
  return 0
}
