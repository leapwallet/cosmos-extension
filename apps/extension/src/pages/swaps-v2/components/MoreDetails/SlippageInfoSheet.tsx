import BigNumber from 'bignumber.js'
import BottomModal from 'components/new-bottom-modal'
import { useSwapContext } from 'pages/swaps-v2/context'
import React, { useMemo } from 'react'
import { formatTokenAmount } from 'utils/strings'

type SlippageInfoSheetProps = {
  isOpen: boolean
  onClose: () => void
}

export function SlippageInfoSheet({ isOpen, onClose }: SlippageInfoSheetProps) {
  const { slippagePercent, amountOut, destinationToken } = useSwapContext()

  const percentageChangeAmount = useMemo(() => {
    const inputAmountNumber = new BigNumber(amountOut)
    return inputAmountNumber.multipliedBy(slippagePercent).dividedBy(100)
  }, [amountOut, slippagePercent])

  const slippageAmount = useMemo(() => {
    const inputAmountNumber = new BigNumber(amountOut)
    return inputAmountNumber.minus(percentageChangeAmount)
  }, [percentageChangeAmount, amountOut])

  return (
    <BottomModal title='Max. Slippage' onClose={onClose} isOpen={isOpen} className='p-6'>
      <div className='text-md !leading-[25.6px] font-medium text-gray-800 dark:text-gray-200 text-left'>
        You will receive a minimum of{' '}
        <span className='text-black-100 dark:text-white-100 font-bold'>
          {formatTokenAmount(slippageAmount.toString(), destinationToken?.symbol)} (
          {slippagePercent}% slippage ~{' '}
          {formatTokenAmount(percentageChangeAmount.toString(), destinationToken?.symbol)})
        </span>{' '}
        in the worst case. If the price changes unfavorably by more than{' '}
        <span className='text-black-100 dark:text-white-100 font-bold'>{slippagePercent}%</span>,
        the swap will not take place and your funds will be refunded.
      </div>
    </BottomModal>
  )
}
