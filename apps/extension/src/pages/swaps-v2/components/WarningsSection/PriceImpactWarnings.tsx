import { useSwapContext } from 'pages/swaps-v2/context'
import { getPriceImpactVars } from 'pages/swaps-v2/utils/priceImpact'
import React, { Dispatch, SetStateAction } from 'react'

import { WarningBox } from './WarningBox'
import { WarningWithCheck } from './WarningWithCheck'

type PriceImpactWarningsProps = {
  isPriceImpactChecked: boolean
  setIsPriceImpactChecked: Dispatch<SetStateAction<boolean>>
}

export default function PriceImpactWarnings({
  isPriceImpactChecked,
  setIsPriceImpactChecked,
}: PriceImpactWarningsProps) {
  const { route } = useSwapContext()
  const formatter = Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })

  const {
    shouldCheckPriceImpact,
    priceImpactPercent,
    usdValueDecreasePercent,
    sourceAssetUSDValue,
    destinationAssetUSDValue,
  } = getPriceImpactVars(route)

  if (!shouldCheckPriceImpact) {
    return null
  }

  // if price impact is not available
  if (priceImpactPercent.isNaN()) {
    // if usd value decrease is not available, show alert
    if (usdValueDecreasePercent.isNaN()) {
      return (
        <WarningWithCheck
          title={'Low information warning'}
          message='I understand that I might get an unfavourable exchange rate for this transaction.'
          isChecked={isPriceImpactChecked}
          setIsChecked={setIsPriceImpactChecked}
        />
      )
    }
    // usd value decrease is not more than 5%
    if (usdValueDecreasePercent.lt(5)) {
      return null
    }
    // usd value decrease is more than 5%
    return (
      <WarningWithCheck
        title='Bad trade warning'
        title2={`-${usdValueDecreasePercent.toFixed(2)}%`}
        message={`Estimated output value ($${formatter.format(
          destinationAssetUSDValue.toNumber(),
        )}) is ${usdValueDecreasePercent.toFixed(
          2,
        )}% lower than estimated input value ($${formatter.format(sourceAssetUSDValue.toNumber())}).
          I understand and wish to proceed.`}
        isChecked={isPriceImpactChecked}
        setIsChecked={setIsPriceImpactChecked}
      />
    )
  }

  // price impact is less than 5%
  if (priceImpactPercent.lt(5)) {
    // usd value decrease is not available
    if (usdValueDecreasePercent.isNaN()) {
      return <WarningBox type={'warning'} message='Price data unavailable for selected token(s).' />
    }
    if (usdValueDecreasePercent.lt(5)) {
      // no need to show any alerts/confirmations
      return null
    }
    // usd value decrease is more than 5%
    return (
      <WarningWithCheck
        title={'Bad trade warning'}
        title2={`-${usdValueDecreasePercent.toFixed(2)}%`}
        message={`Estimated output value ($${formatter.format(
          destinationAssetUSDValue.toNumber(),
        )}) is ${usdValueDecreasePercent.toFixed(
          2,
        )}% lower than estimated input value ($${formatter.format(
          sourceAssetUSDValue.toNumber(),
        )}). I understand and wish to proceed.`}
        isChecked={isPriceImpactChecked}
        setIsChecked={setIsPriceImpactChecked}
      />
    )
  }

  // price impact is more than 5%
  {
    // usd value decrease is not available
    if (usdValueDecreasePercent.isNaN() || usdValueDecreasePercent.lt(5)) {
      return (
        <WarningWithCheck
          title={'Bad trade warning'}
          title2={`-${priceImpactPercent.toFixed(2)}%`}
          message={`Swap will execute at a ${priceImpactPercent.toFixed(
            2,
          )}% worse price than the estimated on-chain price, due to low liquidity. I understand and wish to proceed.`}
          isChecked={isPriceImpactChecked}
          setIsChecked={setIsPriceImpactChecked}
        />
      )
    }

    // both price impact and usd value decrease are more than 5%

    // if usd value decrease is more than price impact, show usd value decrease alert
    if (usdValueDecreasePercent.gt(priceImpactPercent)) {
      return (
        <WarningWithCheck
          title={'Bad trade warning'}
          title2={`-${usdValueDecreasePercent.toFixed(2)}%`}
          message={`Estimated output value ($${formatter.format(
            destinationAssetUSDValue.toNumber(),
          )}) is ${usdValueDecreasePercent.toFixed(
            2,
          )}% lower than estimated input value ($${formatter.format(
            sourceAssetUSDValue.toNumber(),
          )}). I understand and wish to proceed.`}
          isChecked={isPriceImpactChecked}
          setIsChecked={setIsPriceImpactChecked}
        />
      )
    }

    // show price impact alert
    return (
      <WarningWithCheck
        title={'Bad trade warning'}
        title2={`-${priceImpactPercent.toFixed(2)}%`}
        message={`Swap will execute at a ${priceImpactPercent.toFixed(
          2,
        )}% worse price than the estimated on-chain price, due to low liquidity. I understand and wish to proceed.`}
        isChecked={isPriceImpactChecked}
        setIsChecked={setIsPriceImpactChecked}
      />
    )
  }
}
