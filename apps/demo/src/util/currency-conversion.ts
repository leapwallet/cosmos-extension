import { SupportedCurrencies } from '@leapwallet/cosmos-wallet-hooks'
import BigNumber from 'bignumber.js'

export const usdToRegional: Record<SupportedCurrencies, number> = {
  US: 1,
  EU: 1.02,
  GB: 0.89,
  AU: 1.55,
  CN: 7.12,
  KR: 1443.26,
  IN: 81.8,
  JP: 145.13,
}

export const convertFromUsdToRegional = (
  value: BigNumber | number,
  currency: SupportedCurrencies,
): BigNumber => {
  if (typeof value === 'number') return new BigNumber(value * usdToRegional[currency])
  return value.multipliedBy(usdToRegional[currency])
}
