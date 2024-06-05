import { formatTokenAmount, sliceWord } from '@leapwallet/cosmos-wallet-hooks'
import BigNumber from 'bignumber.js'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useSwapContext } from 'pages/swaps-v2/context'
import React, { useCallback, useMemo, useState } from 'react'
import Skeleton from 'react-loading-skeleton'

type ConversionRateDisplayProps = {
  onClick?: () => void
}

export function ConversionRateDisplay({ onClick }: ConversionRateDisplayProps) {
  const { amountOut, inAmount, sourceToken, destinationToken, loadingRoutes } = useSwapContext()
  const [interchangeTokens, setInterchangeTokens] = useState<boolean>(false)

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

  return loadingRoutes ? (
    <Skeleton width={105} height={18} containerClassName='block !leading-none rounded-xl' />
  ) : (
    <button onClick={onClick ?? handleInterchange} className='flex items-center gap-1'>
      {conversionRate && baseToken && quoteToken && (
        <>
          <span className='dark:text-white-100 text-xs !leading-[19.2px] font-medium'>
            1 {baseToken?.symbol} ={' '}
            {formatTokenAmount(conversionRate ?? '0', sliceWord(quoteToken?.symbol ?? '', 4, 4), 3)}
          </span>
          {baseToken.usdPrice && (
            <span className='text-gray-600 dark:text-gray-400 text-xs !leading-[19.2px] font-medium'>
              ({formatCurrency(new BigNumber(baseToken.usdPrice))})
            </span>
          )}
        </>
      )}
    </button>
  )
}
