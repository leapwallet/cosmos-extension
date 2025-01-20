import { formatPercentAmount } from '@leapwallet/cosmos-wallet-hooks'
import { useSkipSupportedChains } from '@leapwallet/elements-hooks'
import { ArrowRight, CaretRight, Info } from '@phosphor-icons/react'
import classNames from 'classnames'
import { useChainInfos } from 'hooks/useChainInfos'
import { Images } from 'images'
import { useSwapContext } from 'pages/swaps-v2/context'
import { getPriceImpactPercent } from 'pages/swaps-v2/utils/priceImpact'
import { getChainIdsFromRoute } from 'pages/swaps-v2/utils/route'
import { getSlippageRemarks } from 'pages/swaps-v2/utils/slippage'
import React, { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react'
import { isCompassWallet } from 'utils/isCompassWallet'

import LeapFeesInfoSheet from './LeapFeesInfoSheet'
import PriceImpactSheet from './PriceImpactSheet'

function OrderRoutingDisplay({
  orderRouting,
}: {
  orderRouting: { chainId: string; chainName: string; icon: string | undefined }[]
}) {
  return (
    <div className='flex items-center gap-[4px]'>
      {orderRouting.map((chain, idx, self) => (
        <div key={`${chain.chainId}-${idx}`} className='flex items-center gap-[4px]'>
          <img src={chain?.icon} alt={chain.chainId} className='w-5 h-5 rounded-full' />
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
  const { slippagePercent, displayFee, routingInfo, leapFeeBps, isSwapFeeEnabled } =
    useSwapContext()

  const slippageRemarks = useMemo(() => {
    return getSlippageRemarks(String(slippagePercent))
  }, [slippagePercent])

  const [showPriceImpactInfo, setShowPriceImpactInfo] = useState(false)
  const [showLeapFeesInfo, setShowLeapFeesInfo] = useState(false)
  const chains = useChainInfos()
  const skipChains = useSkipSupportedChains()

  const priceImpactPercentage = useMemo(() => {
    const priceImpactPercent = getPriceImpactPercent(routingInfo.route)
    if (priceImpactPercent.isNaN()) {
      return null
    }
    return priceImpactPercent
  }, [routingInfo.route])

  const orderRouting = useMemo(() => {
    const chainIds = getChainIdsFromRoute(routingInfo.route)
    if (!chains || !chainIds) {
      return null
    }
    return chainIds.map((chainId: string) => {
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
  }, [routingInfo.route, chains, skipChains?.data])

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
            {priceImpactPercentage
              ? `${formatPercentAmount(priceImpactPercentage.toString(), 2)}%`
              : '-'}
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
                {isCompassWallet() ? 'Compass' : 'Leap'} fee
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
          <div
            onClick={handleTransactionFeesClick}
            className='flex justify-start items-center gap-1 min-h-[19.2px] shrink-0 cursor-pointer'
          >
            <span className='text-sm font-medium text-gray-800 dark:text-gray-200 !leading-[22.4px] shrink-0'>
              Transaction fee
            </span>
            {showInfo && (
              <CaretRight
                size={16}
                className='!text-md !leading-[16px] text-gray-600 dark:text-gray-400'
              />
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
