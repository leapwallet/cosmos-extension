/**
 * Price Impact Warning
 * Tooltip Content - This could be due to the low liquidity in the swap pool compared to the size of your trade.
 *  > 5 - WARNING + CONFIRMATION - I understand that I might get an unfavourable exchange rate if I go ahead with this transaction.
 *  > 2.5 - WARNING - You may get an unfavourable exchange rate due to the impact of your trade.
 */

import { UseRouteResponse } from '@leapwallet/elements-hooks'
import BigNumber from 'bignumber.js'

type PriceImpactRemarks =
  | {
      type: 'error' | 'warn'
      color: 'orange' | 'red'
      message: string
    }
  | undefined

function getPriceImpactRemarks(priceImpact: string | undefined): PriceImpactRemarks {
  if (!priceImpact) {
    return undefined
  }

  const parsedPriceImpact = parseFloat(priceImpact)

  if (isNaN(parsedPriceImpact)) {
    return { type: 'error', color: 'red', message: 'Please enter a valid number.' }
  }

  if (parsedPriceImpact > 5) {
    return {
      type: 'warn',
      color: 'red',
      message:
        'I understand that I might get an unfavourable exchange rate if I go ahead with this transaction.',
    }
  }

  if (parsedPriceImpact > 2.5) {
    return {
      type: 'warn',
      color: 'orange',
      message: 'You may get an unfavourable exchange rate due to the impact of your trade.',
    }
  }
}

type PriceImpactReturnType = Readonly<
  | {
      shouldCheckPriceImpact: false
      priceImpactPercent: undefined
      usdValueDecreasePercent: BigNumber
      sourceAssetUSDValue: BigNumber
      destinationAssetUSDValue: BigNumber
    }
  | {
      shouldCheckPriceImpact: true
      priceImpactPercent: BigNumber
      usdValueDecreasePercent: BigNumber
      sourceAssetUSDValue: BigNumber
      destinationAssetUSDValue: BigNumber
    }
>

const getPriceImpactVars = (routeResponse: UseRouteResponse): PriceImpactReturnType => {
  const shouldCheckPriceImpact = !!routeResponse?.response.does_swap

  const priceImpactPercent = shouldCheckPriceImpact
    ? new BigNumber(routeResponse?.response.swap_price_impact_percent ?? NaN)
    : undefined

  const sourceAssetUSDValue = new BigNumber(routeResponse?.response.usd_amount_in ?? NaN)
  const destinationAssetUSDValue = new BigNumber(routeResponse?.response.usd_amount_out ?? NaN)

  /**
   * Have disabled usd price delta validation for amount lesser than $0.01
   * as skip returns usd amounts rounded off to the nearest hundredths. So,
   * for < $0.01, it will return 0.00 dollars causing annoying warnings.
   *
   * Plus, it's just a cent!
   */
  const usdValueDecreasePercent = (
    sourceAssetUSDValue.isNaN() ? destinationAssetUSDValue.gte(0.01) : sourceAssetUSDValue.gte(0.01)
  )
    ? new BigNumber(sourceAssetUSDValue)
        .minus(destinationAssetUSDValue)
        .dividedBy(sourceAssetUSDValue)
        .multipliedBy(100)
    : new BigNumber(0)

  return {
    shouldCheckPriceImpact,
    priceImpactPercent,
    usdValueDecreasePercent,
    sourceAssetUSDValue,
    destinationAssetUSDValue,
  } as PriceImpactReturnType
}

type ConversionRateRemark = 'ok' | 'warn' | 'request-confirmation'

const getConversionRateRemark = (
  routeResponse: UseRouteResponse | undefined,
): ConversionRateRemark => {
  if (!routeResponse?.response) {
    return 'ok'
  }

  const { shouldCheckPriceImpact, priceImpactPercent, usdValueDecreasePercent } =
    getPriceImpactVars(routeResponse)

  if (shouldCheckPriceImpact) {
    if (priceImpactPercent.isNaN()) {
      if (usdValueDecreasePercent.isNaN()) {
        return 'request-confirmation'
      }
      if (usdValueDecreasePercent.lt(5)) {
        return 'ok'
      }
      return 'request-confirmation'
    }
    if (priceImpactPercent.lt(5)) {
      if (usdValueDecreasePercent.isNaN()) {
        return 'warn'
      }
      if (usdValueDecreasePercent.lt(5)) {
        return 'ok'
      }
      return 'request-confirmation'
    }
    return 'request-confirmation'
  }

  return 'ok'
}

export {
  ConversionRateRemark,
  getConversionRateRemark,
  getPriceImpactRemarks,
  getPriceImpactVars,
  PriceImpactRemarks,
}
