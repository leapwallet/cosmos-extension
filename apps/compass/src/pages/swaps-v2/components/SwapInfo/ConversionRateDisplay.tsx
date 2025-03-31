import { formatTokenAmount, sliceWord } from '@leapwallet/cosmos-wallet-hooks'
import BigNumber from 'bignumber.js'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useSwapContext } from 'pages/swaps-v2/context'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { cn } from 'utils/cn'

type ConversionRateDisplayProps = {
  onClick?: () => void
  isReviewSheet?: boolean
}

export function ConversionRateDisplay({ onClick, isReviewSheet }: ConversionRateDisplayProps) {
  const {
    amountOut,
    inAmount,
    sourceToken,
    destinationToken,
    loadingRoutes,
    loadingMessages,
    isSkipGasFeeLoading,
  } = useSwapContext()
  const [interchangeTokens, setInterchangeTokens] = useState<boolean>(false)
  const isFirstLoadRef = useRef(true)

  const loading = isFirstLoadRef.current
    ? loadingRoutes || loadingMessages || isSkipGasFeeLoading
    : loadingRoutes

  const [formatCurrency] = useFormatCurrency()

  const { quoteTokenAmount, baseTokenAmount, baseToken, quoteToken } = useMemo(() => {
    if (interchangeTokens) {
      return {
        baseToken: destinationToken,
        quoteToken: sourceToken,
        baseTokenAmount: amountOut,
        quoteTokenAmount: inAmount,
      }
    }
    return {
      baseToken: sourceToken,
      quoteToken: destinationToken,
      baseTokenAmount: inAmount,
      quoteTokenAmount: amountOut,
    }
  }, [interchangeTokens, sourceToken, destinationToken, inAmount, amountOut])

  const conversionRate = useMemo(() => {
    if (!baseTokenAmount) return
    if (isNaN(parseFloat(quoteTokenAmount)) || isNaN(parseFloat(baseTokenAmount))) return
    return String(parseFloat(quoteTokenAmount) / parseFloat(baseTokenAmount))
  }, [quoteTokenAmount, baseTokenAmount])

  const handleInterchange = useCallback(() => {
    setInterchangeTokens((prev) => !prev)
  }, [setInterchangeTokens])

  useEffect(() => {
    if (!loadingRoutes && !loadingMessages && !isSkipGasFeeLoading) {
      isFirstLoadRef.current = false // Mark first load as completed
    }
  }, [loadingRoutes, loadingMessages, isSkipGasFeeLoading])

  return loading ? (
    <Skeleton width={105} height={18} containerClassName='block !leading-none rounded-xl' />
  ) : (
    <button onClick={onClick ?? handleInterchange} className='flex items-center gap-1 flex-wrap'>
      {conversionRate && baseToken && quoteToken && (
        <>
          <span
            className={cn(
              'text-secondary-800 text-xs !leading-[18.9px] font-medium',
              isReviewSheet && 'text-sm',
            )}
          >
            1 {baseToken?.symbol} ={' '}
          </span>
          <div
            className={cn(
              '!leading-[18.9px] text-xs font-medium h-[19.2px]',
              isReviewSheet && 'text-sm',
            )}
          >
            <span className='text-secondary-800'>
              {formatTokenAmount(
                conversionRate ?? '0',
                sliceWord(quoteToken?.symbol ?? '', 4, 4),
                3,
              )}
            </span>
            {baseToken.usdPrice && (
              <span className='ml-1 text-muted-foreground'>
                ({formatCurrency(new BigNumber(baseToken.usdPrice))})
              </span>
            )}
          </div>
        </>
      )}
    </button>
  )
}
