import BigNumber from 'bignumber.js'
import { CustomCheckbox } from 'components/custom-checkbox'
import { Images } from 'images'
import React, { useEffect, useMemo } from 'react'

import { useSwapContext } from '../context'

type HighPriceImpactWarningProps = {
  onClick: () => void
  isBlockingPriceImpactWarning: boolean
  onPriceWarningCheckboxClick: () => void
  setIsBlockingPriceImpactWarning: React.Dispatch<React.SetStateAction<boolean>>
  isBlockingPriceImpactWarningChecked: boolean
  isBlockingUsdValueWarning: boolean
  onUsdValueWarningCheckboxClick: () => void
  setIsBlockingUsdValueWarning: React.Dispatch<React.SetStateAction<boolean>>
  isBlockingUsdValueWarningChecked: boolean
}

export function HighPriceImpactWarning({
  onClick,
  isBlockingPriceImpactWarning,
  onPriceWarningCheckboxClick,
  setIsBlockingPriceImpactWarning,
  isBlockingPriceImpactWarningChecked,
  isBlockingUsdValueWarning,
  onUsdValueWarningCheckboxClick,
  setIsBlockingUsdValueWarning,
  isBlockingUsdValueWarningChecked,
}: HighPriceImpactWarningProps) {
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

  useEffect(() => {
    setImpactedPriceValue(
      `~$${inAmountDollarValue.minus(amountOutDollarValue).toNumber().toFixed(2)}`,
    )
  }, [amountOutDollarValue, inAmountDollarValue, setImpactedPriceValue])

  useEffect(() => {
    setIsBlockingPriceImpactWarning(
      inAmountDollarValue.isGreaterThan(50) && !!percentageDifference && percentageDifference > 10,
    )
  }, [inAmountDollarValue, percentageDifference, setIsBlockingPriceImpactWarning])

  useEffect(() => {
    setIsBlockingUsdValueWarning(
      amountOutDollarValue.isLessThanOrEqualTo(0) || inAmountDollarValue.isLessThanOrEqualTo(0),
    )
  }, [amountOutDollarValue, inAmountDollarValue, setIsBlockingUsdValueWarning])

  const showNonBlockingWarning =
    inAmountDollarValue.isGreaterThan(50) &&
    !!percentageDifference &&
    percentageDifference >= 5 &&
    percentageDifference <= 10

  if (isBlockingUsdValueWarning && Number(inAmount) && Number(amountOut)) {
    return (
      <div className='w-full bg-white-100 dark:bg-gray-900 text-sm flex gap-3 items-center p-2 rounded-lg border border-yellow-600'>
        <CustomCheckbox
          checked={isBlockingUsdValueWarningChecked}
          color='gray'
          onClick={onUsdValueWarningCheckboxClick}
        />

        <span className='dark:text-white-100 text-sm'>
          The USD Value is unavailable at the moment. I confirm and agree to proceed.
        </span>

        <img src={Images.Misc.InfoFilledExclamationMark} className='ml-auto w-[18px] h-[18px]' />
      </div>
    )
  }

  if (isBlockingPriceImpactWarning) {
    return (
      <div className='w-full bg-white-100 dark:bg-gray-900 text-sm flex gap-3 items-center p-2 rounded-lg border border-red-300'>
        <CustomCheckbox
          checked={isBlockingPriceImpactWarningChecked}
          color='gray'
          onClick={onPriceWarningCheckboxClick}
        />

        <span className='dark:text-white-100 text-sm'>
          High impact expected {impactedPriceValue} at current token amounts. I confirm and agree to
          proceed.
        </span>

        <img src={Images.Misc.InfoFilledExclamationRedMark} className='ml-auto w-[18px] h-[18px]' />
      </div>
    )
  }

  return showNonBlockingWarning ? (
    <div
      className='w-full bg-white-100 dark:bg-gray-900 text-sm flex gap-2 items-center p-2 rounded-lg border border-yellow-600 cursor-pointer'
      onClick={onClick}
    >
      <img src={Images.Misc.InfoFilledExclamationMark} />
      <span className='dark:text-white-100'>Price impact warning:</span>
      <span className='text-gray-300 text-xs'>Expected loss {impactedPriceValue}</span>

      <img src={Images.Misc.RightArrow} className='ml-auto mr-[4px]' />
    </div>
  ) : null
}
