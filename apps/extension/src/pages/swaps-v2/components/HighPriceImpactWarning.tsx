import { CustomCheckbox } from 'components/custom-checkbox'
import { Images } from 'images'
import React, { useEffect } from 'react'

import { useSwapContext } from '../context'

type HighPriceImpactWarningProps = {
  onPriceWarningCheckboxClick: () => void
  setIsBlockingPriceImpactWarning: React.Dispatch<React.SetStateAction<boolean>>
  isBlockingPriceImpactWarningChecked: boolean
  onUsdValueWarningCheckboxClick: () => void
  setIsBlockingUsdValueWarning: React.Dispatch<React.SetStateAction<boolean>>
  isBlockingUsdValueWarningChecked: boolean
}

export function HighPriceImpactWarning({
  onPriceWarningCheckboxClick,
  setIsBlockingPriceImpactWarning,
  isBlockingPriceImpactWarningChecked,
  onUsdValueWarningCheckboxClick,
  setIsBlockingUsdValueWarning,
  isBlockingUsdValueWarningChecked,
}: HighPriceImpactWarningProps) {
  const { priceImpactWarning, priceImpactPercentage } = useSwapContext()

  useEffect(() => {
    if (priceImpactWarning === 'REQUEST_CONFIRMATION') {
      setIsBlockingPriceImpactWarning(true)
    } else if (priceImpactWarning === 'LOW_INFO_WARNING') {
      setIsBlockingUsdValueWarning(true)
    } else {
      setIsBlockingPriceImpactWarning(false)
      setIsBlockingUsdValueWarning(false)
    }
  }, [priceImpactWarning, setIsBlockingPriceImpactWarning, setIsBlockingUsdValueWarning])

  if (priceImpactWarning === 'LOW_INFO_WARNING') {
    return (
      <div className='w-full bg-white-100 dark:bg-gray-900 text-sm flex gap-3 items-center p-2 rounded-lg border border-yellow-600'>
        <CustomCheckbox
          checked={isBlockingUsdValueWarningChecked}
          color='gray'
          onClick={onUsdValueWarningCheckboxClick}
        />

        <span className='dark:text-white-100 text-sm'>
          Price impact cannot be calculated for this swap pair. Proceed anyway
        </span>

        <img src={Images.Misc.InfoFilledExclamationMark} className='ml-auto w-[18px] h-[18px]' />
      </div>
    )
  }

  if (priceImpactWarning === 'REQUEST_CONFIRMATION') {
    return (
      <div className='w-full bg-white-100 dark:bg-gray-900 text-sm flex gap-3 items-center p-2 rounded-lg border border-red-300'>
        <CustomCheckbox
          checked={isBlockingPriceImpactWarningChecked}
          color='gray'
          onClick={onPriceWarningCheckboxClick}
        />

        <span className='dark:text-white-100 text-sm'>
          Due to low liquidity, a {priceImpactPercentage?.toString()}% price impact is expected. I
          understand and wish to proceed.
        </span>

        <img src={Images.Misc.InfoFilledExclamationRedMark} className='ml-auto w-[18px] h-[18px]' />
      </div>
    )
  }

  return null
}
