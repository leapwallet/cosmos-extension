import { formatTokenAmount, sliceWord } from '@leapwallet/cosmos-wallet-hooks'
import React, { useMemo } from 'react'
import { SourceChain, SourceToken } from 'types/swap'

import { useOnline } from '../hooks/useOnline'
import { SwapFailureIcon } from './SwapFailureIcon'
import { SwapSuccessfulIcon } from './SwapSuccessfulIcon'

export function TxStatusOverview({
  isSuccessFull,
  amountOut,
  destinationChain,
  destinationToken,
  unableToTrackError,
  failedActionWasSwap,
}: {
  isSuccessFull: boolean
  amountOut: string
  failedActionWasSwap: boolean
  unableToTrackError: boolean | null
  timeoutError: boolean | undefined
  destinationToken: SourceToken | null
  destinationChain: SourceChain | undefined
}) {
  const isOnline = useOnline()

  const errorTitle = useMemo(() => {
    if (!isOnline || unableToTrackError) {
      return 'Tracking unavailable'
    }

    return 'Swap failed'
  }, [isOnline, unableToTrackError])

  const errorSubtitle = useMemo(() => {
    if (!isOnline) {
      return
    }

    if (failedActionWasSwap) {
      return 'Due to slippage'
    }

    return ''
  }, [failedActionWasSwap, isOnline])

  return (
    <div className='flex w-full rounded-2xl bg-white-100 dark:bg-gray-950 flex-col items-center justify-center py-4'>
      <div className='w-[100px] h-[100px] flex items-center justify-center'>
        {isSuccessFull ? <SwapSuccessfulIcon size='100' /> : <SwapFailureIcon size='100' />}
      </div>

      <div className='flex flex-col justify-start items-center gap-1'>
        <div className='text-lg max-[350px]:!text-[18px] font-bold text-black-100 dark:text-white-100 !leading-[27px] max-[350px]:!leading-[24.3px] text-center'>
          {isSuccessFull
            ? `${formatTokenAmount(amountOut, sliceWord(destinationToken?.symbol ?? '', 4, 4), 3)}`
            : errorTitle}
        </div>
        {(isSuccessFull || errorSubtitle) && (
          <div className='text-md max-[350px]:!text-sm font-medium text-black-100 dark:text-white-100 !leading-[25.6px] max-[350px]:!leading-[22.4px] text-center'>
            {isSuccessFull ? `received on ${destinationChain?.chainName ?? ''}` : errorSubtitle}
          </div>
        )}
      </div>
    </div>
  )
}
