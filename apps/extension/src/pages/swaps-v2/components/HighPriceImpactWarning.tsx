import BigNumber from 'bignumber.js'
import { Images } from 'images'
import React, { useEffect, useMemo } from 'react'

import { useSwapContext } from '../context'

export function HighPriceImpactWarning({ onClick }: { onClick: () => void }) {
  const {
    inAmount,
    sourceToken,
    amountOut,
    destinationToken,
    impactedPriceValue,
    setImpactedPriceValue,
  } = useSwapContext()
  const inAmountDollarValue = new BigNumber(inAmount).times(sourceToken?.usdPrice ?? NaN)
  const amountOutDollarValue = new BigNumber(amountOut ?? 0).times(
    destinationToken?.usdPrice ?? NaN,
  )

  const percentageDifference = useMemo(() => {
    if (inAmountDollarValue.isNaN() || amountOutDollarValue.isNaN()) {
      return null
    }

    return inAmountDollarValue
      .minus(amountOutDollarValue)
      .dividedBy(inAmountDollarValue)
      .times(100)
      .toNumber()
  }, [inAmountDollarValue, amountOutDollarValue])

  const showWarning =
    inAmountDollarValue.isGreaterThan(50) && !!percentageDifference && percentageDifference >= 5

  useEffect(() => {
    setImpactedPriceValue(
      `~$${inAmountDollarValue.minus(amountOutDollarValue).toNumber().toFixed(2)}`,
    )
  }, [amountOutDollarValue, inAmountDollarValue, setImpactedPriceValue])

  return showWarning ? (
    <div
      className='w-full bg-white-100 dark:bg-gray-900 text-sm flex gap-2 items-center p-2 rounded-lg border border-yellow-600'
      onClick={onClick}
    >
      <img src={Images.Misc.InfoFilledExclamationMark} />
      <span className='dark:text-white-100'>Price impact warning:</span>
      <span className='text-gray-300 text-xs'>Expected loss {impactedPriceValue}</span>

      <img src={Images.Misc.RightArrow} className='ml-auto mr-[4px]' />
    </div>
  ) : null
}
