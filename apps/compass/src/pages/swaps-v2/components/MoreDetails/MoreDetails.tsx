import { formatPercentAmount } from '@leapwallet/cosmos-wallet-hooks'
import { Info } from '@phosphor-icons/react'
import classNames from 'classnames'
import { useSwapContext } from 'pages/swaps-v2/context'
import { getPriceImpactPercent } from 'pages/swaps-v2/utils/priceImpact'
import { getSlippageRemarks } from 'pages/swaps-v2/utils/slippage'
import React, { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react'

import LeapFeesInfoSheet from './LeapFeesInfoSheet'
import PriceImpactSheet from './PriceImpactSheet'

type MoreDetailsProps = {
  showInfo?: boolean
  isReviewSheet?: boolean
  onSlippageInfoClick: () => void
  setShowFeesSettingSheet: Dispatch<SetStateAction<boolean>>
}

export function MoreDetails({
  showInfo = true,
  isReviewSheet = false,
  onSlippageInfoClick,
  setShowFeesSettingSheet,
}: MoreDetailsProps) {
  const { slippagePercent, displayFee, routingInfo, leapFeeBps, isSwapFeeEnabled } =
    useSwapContext()

  const slippageRemarks = useMemo(() => {
    return getSlippageRemarks(String(slippagePercent))
  }, [slippagePercent])

  const [showPriceImpactInfo, setShowPriceImpactInfo] = useState(false)
  const [showLeapFeesInfo, setShowLeapFeesInfo] = useState(false)

  const priceImpactPercentage = useMemo(() => {
    const priceImpactPercent = getPriceImpactPercent(routingInfo.route)
    if (priceImpactPercent.isNaN()) {
      return null
    }
    return priceImpactPercent
  }, [routingInfo.route])

  const showLeapFees = useMemo(() => {
    return Number(leapFeeBps) > 0 && isSwapFeeEnabled
  }, [leapFeeBps, isSwapFeeEnabled])

  const handlePriceImpactInfoClick = useCallback(() => {
    setShowPriceImpactInfo(true)
  }, [setShowPriceImpactInfo])

  const handleLeapFeesInfoClick = useCallback(() => {
    setShowLeapFeesInfo(true)
  }, [setShowLeapFeesInfo])

  const handleSlippageInfoClick = useCallback(() => {
    onSlippageInfoClick?.()
  }, [onSlippageInfoClick])

  const handleTransactionFeesClick = useCallback(() => {
    setShowFeesSettingSheet(true)
  }, [setShowFeesSettingSheet])

  return (
    <>
      <div className='flex flex-col justify-start w-full items-start'>
        <div className={classNames('flex w-full justify-between items-center pt-1 pb-2')}>
          <div className='flex justify-start items-center gap-1'>
            <span className='text-sm font-medium text-muted-foreground !leading-[22.4px]'>
              Price impact
            </span>
            {showInfo && (
              <button onClick={handlePriceImpactInfoClick} className='text-secondary-600'>
                <Info size={16} className='!text-md !leading-[16px]' />
              </button>
            )}
          </div>
          <span
            className={classNames('text-sm font-bold !leading-[19.8px]', {
              'text-black-100 dark:text-white-100':
                !priceImpactPercentage || priceImpactPercentage.isLessThan(3),
              'text-orange-500 dark:text-orange-300':
                priceImpactPercentage?.isGreaterThanOrEqualTo(3) &&
                priceImpactPercentage?.isLessThan(5),
              'text-red-400 dark:text-red-300': priceImpactPercentage?.isGreaterThanOrEqualTo(5),
            })}
          >
            {priceImpactPercentage
              ? `${formatPercentAmount(priceImpactPercentage.toString(), 2)}%`
              : '-'}
          </span>
        </div>

        <div className={classNames('flex w-full justify-between items-center py-2')}>
          <div className='flex justify-start items-center gap-1'>
            <span className='text-sm font-medium text-gray-600 dark:text-gray-400 !leading-[22.4px]'>
              Max. slippage
            </span>
            {showInfo && (
              <button onClick={handleSlippageInfoClick} className='text-secondary-600'>
                <Info size={16} className='!text-md !leading-[16px]' />
              </button>
            )}
          </div>
          <span
            className={classNames('text-sm font-bold !leading-[19.8px]', {
              'text-black-100 dark:text-white-100': !slippageRemarks,
              'text-orange-500 dark:text-orange-300': slippageRemarks?.color === 'orange',
              'text-red-400 dark:text-red-300': slippageRemarks?.color === 'red',
            })}
          >
            {slippagePercent}%
          </span>
        </div>

        {showLeapFees && (
          <div className={'flex w-full justify-between items-center py-2'}>
            <div className='flex justify-start items-center gap-1'>
              <span className='text-sm font-medium text-gray-600 dark:text-gray-400 !leading-[22.4px]'>
                Compass fee
              </span>
              {showInfo && (
                <button onClick={handleLeapFeesInfoClick} className='text-secondary-600'>
                  <Info size={16} className='!text-md !leading-[16px]' />
                </button>
              )}
            </div>
            <span
              className={classNames('text-sm font-bold !leading-[19.8px]', {
                'text-black-100 dark:text-white-100': !slippageRemarks,
                'text-orange-500 dark:text-orange-300': slippageRemarks?.color === 'orange',
                'text-red-400 dark:text-red-300': slippageRemarks?.color === 'red',
              })}
            >
              {parseFloat((Number(leapFeeBps) / 100).toFixed(2))}%
            </span>
          </div>
        )}

        <div className='flex w-full justify-between items-start p-[1.5px]'>
          <div
            onClick={() => {
              if (!isReviewSheet) {
                handleTransactionFeesClick()
              }
            }}
            className={classNames('flex justify-start items-center gap-1 min-h-[19.2px] shrink-0', {
              'cursor-pointer': !isReviewSheet,
            })}
          >
            <span className='text-sm font-medium text-gray-600 dark:text-gray-400 !leading-[22.4px] shrink-0'>
              Transaction fee
            </span>
            {showInfo && !isReviewSheet && (
              <Info size={16} className='!text-md !leading-[16px] text-secondary-600' />
            )}
          </div>
          <span className='text-sm font-bold dark:text-white-100 !leading-[19.8px] text-right'>
            {displayFee?.fiatValue ? (
              <>{displayFee?.fiatValue}</>
            ) : (
              <>
                {displayFee?.formattedAmount} {displayFee?.feeDenom?.coinDenom}
              </>
            )}
          </span>
        </div>
      </div>
      <PriceImpactSheet
        isOpen={showPriceImpactInfo}
        onClose={() => {
          setShowPriceImpactInfo(false)
        }}
      />
      {showLeapFees && (
        <LeapFeesInfoSheet
          isOpen={showLeapFeesInfo}
          leapFeeBps={leapFeeBps}
          onClose={() => {
            setShowLeapFeesInfo(false)
          }}
        />
      )}
    </>
  )
}
