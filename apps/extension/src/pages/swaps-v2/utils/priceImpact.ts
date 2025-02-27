/**
 * Price Impact Warning
 * Tooltip Content - This could be due to the low liquidity in the swap pool compared to the size of your trade.
 *  > 5 - WARNING + CONFIRMATION - I understand that I might get an unfavourable exchange rate if I go ahead with this transaction.
 *  > 2.5 - WARNING - You may get an unfavourable exchange rate due to the impact of your trade.
 */

import { getKeyToUseForDenoms } from '@leapwallet/cosmos-wallet-hooks'
import { DenomsRecord } from '@leapwallet/cosmos-wallet-sdk'
import { RouteAggregator } from '@leapwallet/elements-hooks'
import BigNumber from 'bignumber.js'
import { SourceToken } from 'types/swap'

import { LifiRouteOverallResponse, SkipRouteResponse } from '../hooks/useRoute'

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

export const routeDoesSwap = (
  route: LifiRouteOverallResponse | SkipRouteResponse | undefined,
): boolean => {
  if (!route) {
    return false
  }

  return !!route.response.does_swap
}

export const getPriceImpactPercent = (
  route: LifiRouteOverallResponse | SkipRouteResponse | undefined,
): BigNumber => {
  return new BigNumber(route?.response.swap_price_impact_percent ?? NaN)
}

export const getSourceAssetUSDValue = (
  route: LifiRouteOverallResponse | SkipRouteResponse | undefined,
  sourceToken: SourceToken | null,
  denoms: DenomsRecord,
): BigNumber => {
  let sourceAssetUSDValue =
    route?.aggregator === RouteAggregator.LIFI
      ? new BigNumber(route?.response.fromAmountUSD ?? NaN)
      : new BigNumber(route?.response.usd_amount_in ?? NaN)

  const sourceTokenUsdPrice =
    sourceToken?.usdPrice && !new BigNumber(sourceToken.usdPrice).isNaN()
      ? new BigNumber(sourceToken.usdPrice)
      : undefined

  if (sourceAssetUSDValue.isNaN() && sourceTokenUsdPrice?.gt(0)) {
    if (route?.aggregator === RouteAggregator.SKIP) {
      const denomKey = getKeyToUseForDenoms(
        route?.response.source_asset_denom,
        route?.response.source_asset_chain_id,
      )
      const denom = denoms[denomKey] ?? denoms[denomKey.toLowerCase()]
      if (denom) {
        sourceAssetUSDValue = new BigNumber(route?.response.amount_in)
          .div(10 ** denom.coinDecimals)
          .multipliedBy(sourceTokenUsdPrice)
      }
    } else {
      sourceAssetUSDValue = new BigNumber(route?.response.fromAmount ?? NaN)
        .div(10 ** (route?.response.fromToken.decimals ?? NaN))
        .multipliedBy(sourceTokenUsdPrice)
    }
  }
  return sourceAssetUSDValue
}

export const getDestinationAssetUSDValue = (
  route: LifiRouteOverallResponse | SkipRouteResponse | undefined,
  destinationToken: SourceToken | null,
  denoms: DenomsRecord,
): BigNumber => {
  let destinationAssetUSDValue =
    route?.aggregator === RouteAggregator.LIFI
      ? new BigNumber(route?.response.toAmountUSD ?? NaN)
      : new BigNumber(route?.response.usd_amount_out ?? NaN)

  const destinationTokenUsdPrice =
    destinationToken?.usdPrice && !new BigNumber(destinationToken.usdPrice).isNaN()
      ? new BigNumber(destinationToken.usdPrice)
      : undefined

  if (destinationAssetUSDValue.isNaN() && destinationTokenUsdPrice?.gt(0)) {
    if (route?.aggregator === RouteAggregator.SKIP) {
      const denomKey = getKeyToUseForDenoms(
        route?.response.dest_asset_denom,
        route?.response.dest_asset_chain_id,
      )
      const denom = denoms[denomKey] ?? denoms[denomKey.toLowerCase()]
      if (denom) {
        destinationAssetUSDValue = new BigNumber(route?.response.amount_out)
          .div(10 ** denom.coinDecimals)
          .multipliedBy(destinationTokenUsdPrice)
      }
    } else {
      destinationAssetUSDValue = new BigNumber(route?.response.toAmount ?? NaN)
        .div(10 ** (route?.response.toToken.decimals ?? NaN))
        .multipliedBy(destinationTokenUsdPrice)
    }
  }
  return destinationAssetUSDValue
}

const getPriceImpactVars = (
  route: LifiRouteOverallResponse | SkipRouteResponse | undefined,
  sourceToken: SourceToken | null,
  destinationToken: SourceToken | null,
  denoms: DenomsRecord,
): PriceImpactReturnType => {
  const shouldCheckPriceImpact = routeDoesSwap(route)

  let priceImpactPercent: BigNumber = new BigNumber(NaN)
  if (shouldCheckPriceImpact) {
    priceImpactPercent = getPriceImpactPercent(route)
  }

  const sourceAssetUSDValue = getSourceAssetUSDValue(route, sourceToken, denoms)
  const destinationAssetUSDValue = getDestinationAssetUSDValue(route, destinationToken, denoms)

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
  route: LifiRouteOverallResponse | SkipRouteResponse | undefined,
  sourceToken: SourceToken | null,
  destinationToken: SourceToken | null,
  denoms: DenomsRecord,
): ConversionRateRemark => {
  if (!route) {
    return 'ok'
  }

  const { shouldCheckPriceImpact, priceImpactPercent, usdValueDecreasePercent } =
    getPriceImpactVars(route, sourceToken, destinationToken, denoms)

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
