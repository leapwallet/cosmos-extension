import { formatPercentAmount } from '@leapwallet/cosmos-wallet-hooks'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { InfoIcon } from 'icons/info-icon'
import { useSwapContext } from 'pages/swaps-v2/context'
import { useAggregatorBridgeRelayerFee } from 'pages/swaps-v2/hooks/useBridgeFee'
import { getPriceImpactPercent } from 'pages/swaps-v2/utils/priceImpact'
import { getSlippageRemarks } from 'pages/swaps-v2/utils/slippage'
import React, { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react'

import LeapFeesInfoSheet from './LeapFeesInfoSheet'
import PriceImpactSheet from './PriceImpactSheet'

function formatAmount(amount: BigNumber.Value) {
  const amountBN = new BigNumber(amount)
  return amountBN.isEqualTo(0)
    ? '0'
    : amountBN.isNaN()
    ? '-'
    : amountBN.isLessThan('0.00001')
    ? '< 0.00001'
    : amountBN.toFormat(5, BigNumber.ROUND_DOWN)
}

// function OrderRoutingDisplay({
//   orderRouting,
// }: {
//   orderRouting: { chainId: string; chainName: string; icon: string | undefined }[]
// }) {
//   return (
//     <div className='flex items-center gap-[4px]'>
//       {orderRouting.map((chain, idx, self) => (
//         <div key={`${chain.chainId}-${idx}`} className='flex items-center gap-[4px]'>
//           <img src={chain?.icon} alt={chain.chainId} className='w-5 h-5 rounded-full' />
//           {self.length - 1 !== idx ? (
//             <ArrowRight size={16} className='text-gray-600 dark:text-gray-400' />
//           ) : null}
//         </div>
//       ))}
//     </div>
//   )
// }

type MoreDetailsProps = {
  showInfo?: boolean
  isReviewSheet?: boolean
  onSlippageInfoClick?: () => void
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

  const { bridgeFee, relayerFee } = useAggregatorBridgeRelayerFee(routingInfo?.route)

  const slippageRemarks = useMemo(() => {
    return getSlippageRemarks(String(slippagePercent))
  }, [slippagePercent])

  const [showPriceImpactInfo, setShowPriceImpactInfo] = useState(false)
  const [showLeapFeesInfo, setShowLeapFeesInfo] = useState(false)
  // const chains = useChainInfos()
  // const skipChains = useSkipSupportedChains()

  const priceImpactPercentage = useMemo(() => {
    const priceImpactPercent = getPriceImpactPercent(routingInfo.route)
    if (priceImpactPercent.isNaN()) {
      return null
    }
    return priceImpactPercent
  }, [routingInfo.route])

  const bridgeFeeDisplay = () => {
    if (bridgeFee?.bridgeFees?.length) {
      return bridgeFee.bridgeFees.map((fee, index) => {
        if (!fee) {
          return null
        }
        const [amt, symbol] = fee.split(' ')

        if (!amt) {
          return null
        }
        const formattedAmount = formatAmount(amt)

        const usdFee = bridgeFee.usdBridgeFees?.[index]

        const hasUsdFee = usdFee?.isGreaterThan(0)

        return (
          <>
            {!isReviewSheet && (
              <div className='w-full border-t border-dashed border-secondary-300' />
            )}
            <div className='flex w-full justify-between items-center' key='bridge-fees'>
              <div className='flex justify-start items-center gap-1'>
                <span className='text-sm font-medium text-muted-foreground !leading-[22.4px]'>
                  {bridgeFee?.feeLabels?.[index] || 'Bridge fee'}
                </span>
              </div>
              <span
                className={classNames(
                  'text-sm font-bold !leading-[22.4px] text-right text-foreground',
                )}
              >
                {hasUsdFee
                  ? `(${formattedAmount} ${symbol}) $${bridgeFee.usdBridgeFees?.[
                      index
                    ]?.toString()}`
                  : `${formattedAmount} ${symbol}`}
              </span>
            </div>
          </>
        )
      })
    }
    return null
  }

  const relayerFeeDisplay = () => {
    if (relayerFee?.gasFees) {
      const [amt, symbol] = relayerFee.gasFees.split(' ')

      if (!amt) {
        return null
      }

      const formattedAmount = formatAmount(amt)

      const usdFee = relayerFee.usdGasFees
      const hasUsdFee = usdFee?.isGreaterThan(0)

      return (
        <>
          {!isReviewSheet && <div className='w-full border-t border-dashed border-secondary-300' />}
          <div className='flex w-full justify-between items-center' key='bridge-fees'>
            <div className='flex justify-start items-center gap-1'>
              <span className='text-sm font-medium text-muted-foreground !leading-[22.4px]'>
                Relayer fee
              </span>
            </div>
            <span
              className={classNames(
                'text-sm font-bold !leading-[22.4px] text-right text-foreground',
              )}
            >
              {hasUsdFee
                ? `(${formattedAmount} ${symbol}) $${relayerFee.usdGasFees.toString()}`
                : `${formattedAmount} ${symbol}`}
            </span>
          </div>
        </>
      )
    }
    return null
  }

  // const orderRouting = useMemo(() => {
  //   const chainIds = getChainIdsFromRoute(routingInfo.route)
  //   if (!chains || !chainIds) {
  //     return null
  //   }
  //   return chainIds.map((chainId: string) => {
  //     const nativeChainsEntry = Object.values(chains).find(
  //       (chain) => chain.chainId === chainId || chain.testnetChainId === chainId,
  //     )

  //     if (nativeChainsEntry) {
  //       return {
  //         chainId,
  //         chainName: nativeChainsEntry.chainName,
  //         icon: Images.Logos.getChainImage(nativeChainsEntry.key),
  //       }
  //     }

  //     const skipChainEntry = skipChains?.data?.find((chain) => chain.chainId === chainId)

  //     if (!skipChainEntry) {
  //       return { chainId, chainName: 'Unknown Chain', icon: Images.Logos.getChainImage('default') }
  //     }

  //     return { chainId, chainName: skipChainEntry.chainName, icon: skipChainEntry.icon }
  //   })
  // }, [routingInfo.route, chains, skipChains?.data])

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
      <div
        className={classNames(
          'flex flex-col justify-start w-full items-start',
          !isReviewSheet ? 'gap-5' : 'gap-4',
        )}
      >
        <div className='flex w-full justify-between items-center'>
          <div className='flex justify-start items-center gap-1'>
            <span className='text-sm font-medium text-muted-foreground !leading-[22.4px]'>
              Price impact
            </span>
            {showInfo && (
              <button onClick={handlePriceImpactInfoClick} className='text-secondary-600'>
                <InfoIcon size={16} className='p-[2px]' />
              </button>
            )}
          </div>
          <span
            className={classNames('text-sm font-bold !leading-[22.4px]', {
              'text-foreground': !priceImpactPercentage || priceImpactPercentage.isLessThan(3),
              'text-accent-warning':
                priceImpactPercentage?.isGreaterThanOrEqualTo(3) &&
                priceImpactPercentage?.isLessThan(5),
              'text-destructive-100': priceImpactPercentage?.isGreaterThanOrEqualTo(5),
            })}
          >
            {priceImpactPercentage
              ? `${formatPercentAmount(priceImpactPercentage.toString(), 2)}%`
              : '-'}
          </span>
        </div>

        {!isReviewSheet && <div className='w-full border-t border-dashed border-secondary-300' />}

        <div className='flex w-full justify-between items-center'>
          <div className='flex justify-start items-center gap-1'>
            <span className='text-sm font-medium text-muted-foreground !leading-[22.4px]'>
              Max. slippage
            </span>
            {showInfo && (
              <button onClick={handleSlippageInfoClick} className='text-secondary-600'>
                <InfoIcon size={16} className='p-[2px]' />
              </button>
            )}
          </div>
          <span
            className={classNames('text-sm font-bold !leading-[22.4px]', {
              'text-foreground': !slippageRemarks,
              'text-accent-warning': slippageRemarks?.color === 'orange',
              'text-destructive-100': slippageRemarks?.color === 'red',
            })}
          >
            {slippagePercent}%
          </span>
        </div>

        {showLeapFees && (
          <>
            {!isReviewSheet && (
              <div className='w-full border-t border-dashed border-secondary-300' />
            )}
            <div className='flex w-full justify-between items-center'>
              <div className='flex justify-start items-center gap-1'>
                <span className='text-sm font-medium text-muted-foreground !leading-[22.4px]'>
                  Leap fee
                </span>
                {showInfo && (
                  <button onClick={handleLeapFeesInfoClick} className='text-secondary-600'>
                    <InfoIcon size={16} className='p-[2px]' />
                  </button>
                )}
              </div>
              <span className={classNames('text-sm font-bold !leading-[22.4px] text-foreground')}>
                {parseFloat((Number(leapFeeBps) / 100).toFixed(2))}%
              </span>
            </div>
          </>
        )}

        {bridgeFeeDisplay()}

        {relayerFeeDisplay()}

        {!isReviewSheet && <div className='w-full border-t border-dashed border-secondary-300' />}

        <div className='flex w-full justify-between items-start p-[1.5px]'>
          <div
            onClick={handleTransactionFeesClick}
            className='flex justify-start items-center gap-1 min-h-[19.2px] shrink-0 cursor-pointer'
          >
            <span className='text-sm font-medium text-muted-foreground !leading-[22.4px] shrink-0'>
              Transaction fee
            </span>
            {showInfo && !isReviewSheet && (
              <span className='text-secondary-600'>
                <InfoIcon size={16} className='p-[2px]' />
              </span>
            )}
          </div>
          <span className='text-sm font-bold text-foreground !leading-[22.4px] text-right'>
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

        {/* {!isReviewSheet && <div className='w-full border-t border-dashed border-secondary-300' />}

        {orderRouting && (
          <div className='flex w-full justify-between items-center'>
            <div className='flex justify-start items-center gap-1'>
              <span className='text-sm font-medium text-gray-800 dark:text-gray-200 !leading-[22.4px]'>
                Order routing
              </span>
            </div>
            <OrderRoutingDisplay orderRouting={orderRouting} />
          </div>
        )} */}
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
