import { formatTokenAmount, sliceWord } from '@leapwallet/cosmos-wallet-hooks'
import { Images } from 'images'
import React, { useMemo } from 'react'
import { SourceChain, SourceToken } from 'types/swap'

import { useOnline } from '../hooks/useOnline'

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
        {isSuccessFull ? (
          <img src={Images.Activity.TxSwapSuccess} className='h-[75px] w-[75px]' />
        ) : (
          <img src={Images.Activity.TxSwapFailure} className='h-[75px] w-[75px]' />
        )}
      </div>

      <div className='flex flex-col justify-start items-center gap-1'>
        <div className='text-lg font-bold text-black-100 dark:text-white-100 !leading-[27px] text-center'>
          {isSuccessFull
            ? `${formatTokenAmount(amountOut, sliceWord(destinationToken?.symbol ?? '', 4, 4), 3)}`
            : errorTitle}
        </div>
        {(isSuccessFull || errorSubtitle) && (
          <div className='text-md font-medium text-black-100 dark:text-white-100 !leading-[25.6px] text-center'>
            {isSuccessFull ? `received on ${destinationChain?.chainName ?? ''}` : errorSubtitle}
          </div>
        )}
      </div>
    </div>
  )
}
