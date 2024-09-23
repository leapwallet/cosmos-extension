import { useSkipSupportedChains } from '@leapwallet/elements-hooks'
import { ArrowRight, CaretRight, Info } from '@phosphor-icons/react'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { useChainInfos } from 'hooks/useChainInfos'
import { Images } from 'images'
import { useSwapContext } from 'pages/swaps-v2/context'
import { getSlippageRemarks } from 'pages/swaps-v2/utils/slippage'
import React, { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react'

import LeapFeesInfoSheet from './LeapFeesInfoSheet'
import PriceImpactSheet from './PriceImpactSheet'

function OrderRoutingDisplay({
  orderRouting,
}: {
  orderRouting: { chainId: string; chainName: string; icon: string }[]
}) {
  return (
    <div className='flex items-center gap-[4px]'>
      {orderRouting.map((chain, idx, self) => (
        <div key={`${chain.chainId}-${idx}`} className='flex items-center gap-[4px]'>
          <img src={chain.icon} alt={chain.chainId} className='w-5 h-5 rounded-full' />
          {self.length - 1 !== idx ? (
            <ArrowRight size={16} className='text-gray-600 dark:text-gray-400' />
          ) : null}
        </div>
      ))}
    </div>
  )
}

type MoreDetailsProps = {
  showInfo?: boolean
  onSlippageInfoClick?: () => void
  setShowFeesSettingSheet: Dispatch<SetStateAction<boolean>>
}

export function MoreDetails({
  showInfo = true,
  onSlippageInfoClick,
  setShowFeesSettingSheet,
}: MoreDetailsProps) {
  const { slippagePercent, displayFee, route, leapFeeBps, isSwapFeeEnabled } = useSwapContext()

  const slippageRemarks = useMemo(() => {
    return getSlippageRemarks(String(slippagePercent))
  }, [slippagePercent])

  const [showPriceImpactInfo, setShowPriceImpactInfo] = useState(false)
  const [showLeapFeesInfo, setShowLeapFeesInfo] = useState(false)
  const chains = useChainInfos()
  const skipChains = useSkipSupportedChains()

  const priceImpactPercentage = useMemo(() => {
    if (
      route?.response?.swap_price_impact_percent &&
      !isNaN(parseFloat(route.response.swap_price_impact_percent))
    ) {
      return new BigNumber(route.response.swap_price_impact_percent)
    }
    return null
  }, [route?.response?.swap_price_impact_percent])

  const orderRouting = useMemo(() => {
    if (!chains || !route?.response?.chain_ids) {
      return null
    }
    return route.response.chain_ids.map((chainId: string) => {
      const nativeChainsEntry = Object.values(chains).find(
        (chain) => chain.chainId === chainId || chain.testnetChainId === chainId,
      )

      if (nativeChainsEntry) {
        return {
          chainId,
          chainName: nativeChainsEntry.chainName,
          icon: Images.Logos.getChainImage(nativeChainsEntry.key),
        }
      }

      const skipChainEntry = skipChains?.data?.find((chain) => chain.chainId === chainId)

      if (!skipChainEntry) {
        return { chainId, chainName: 'Unknown Chain', icon: Images.Logos.getChainImage('default') }
      }

      return { chainId, chainName: skipChainEntry.chainName, icon: skipChainEntry.icon }
    })
  }, [chains, skipChains?.data, route?.response?.chain_ids])

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
      <div className='flex flex-col justify-start w-full items-start gap-4'>
        <div className='flex w-full justify-between items-center'>
          <div className='flex justify-start items-center gap-1'>
            <span className='text-sm font-medium text-gray-800 dark:text-gray-200 !leading-[22.4px]'>
              Price impact
            </span>
            {showInfo && (
              <button
                onClick={handlePriceImpactInfoClick}
                className='text-gray-600 dark:text-gray-400'
              >
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
            {priceImpactPercentage ? `${priceImpactPercentage?.toString()}%` : '-'}
          </span>
        </div>

        <div className='flex w-full justify-between items-center'>
          <div className='flex justify-start items-center gap-1'>
            <span className='text-sm font-medium text-gray-800 dark:text-gray-200 !leading-[22.4px]'>
              Max. slippage
            </span>
            {showInfo && (
              <button
                onClick={handleSlippageInfoClick}
                className='text-gray-600 dark:text-gray-400'
              >
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
          <div className='flex w-full justify-between items-center'>
            <div className='flex justify-start items-center gap-1'>
              <span className='text-sm font-medium text-gray-800 dark:text-gray-200 !leading-[22.4px]'>
                Leap fee
              </span>
              {showInfo && (
                <button
                  onClick={handleLeapFeesInfoClick}
                  className='text-gray-600 dark:text-gray-400'
                >
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
          <div className='flex justify-start items-center gap-1 min-h-[19.2px] shrink-0'>
            <span className='text-sm font-medium text-gray-800 dark:text-gray-200 !leading-[22.4px] shrink-0'>
              Transaction fee
            </span>
            {showInfo && (
              <button
                onClick={handleTransactionFeesClick}
                className='text-gray-600 dark:text-gray-400'
              >
                <CaretRight size={16} className='!text-md !leading-[16px]' />
              </button>
            )}
          </div>
          <span className='text-sm font-bold dark:text-white-100 !leading-[19.8px] text-right'>
            {displayFee?.fiatValue ? (
              <>
                <span className='font-medium'>
                  ({displayFee?.formattedAmount} {displayFee?.feeDenom?.coinDenom})
                </span>{' '}
                {displayFee?.fiatValue}
              </>
            ) : (
              <>
                {displayFee?.formattedAmount} {displayFee?.feeDenom?.coinDenom}
              </>
            )}
          </span>
        </div>

        {orderRouting && (
          <div className='flex w-full justify-between items-center'>
            <div className='flex justify-start items-center gap-1'>
              <span className='text-sm font-medium text-gray-800 dark:text-gray-200 !leading-[22.4px]'>
                Order routing
              </span>
            </div>
            <OrderRoutingDisplay orderRouting={orderRouting} />
          </div>
        )}
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
