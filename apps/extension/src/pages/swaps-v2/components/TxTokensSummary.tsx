import classNames from 'classnames'
import React from 'react'
import { SourceChain, SourceToken } from 'types/swap'

import { TxReviewTokenInfo } from './TxReviewTokenInfo'

type Props = {
  inAmount: string
  sourceToken: SourceToken | null
  sourceChain: SourceChain | undefined
  amountOut: string
  destinationToken: SourceToken | null
  destinationChain: SourceChain | undefined
  className?: string
}

function TxTokensSummary({
  inAmount,
  sourceToken,
  sourceChain,
  amountOut,
  destinationToken,
  destinationChain,
  className,
}: Props) {
  return (
    <div
      className={classNames(
        'w-full bg-gray-50 dark:bg-gray-900 flex items-center justify-between p-4 gap-2 rounded-2xl',
        className,
      )}
    >
      <TxReviewTokenInfo amount={inAmount} token={sourceToken} chain={sourceChain} />

      <div className='bg-gray-100 dark:bg-gray-850 shrink-0 flex justify-center items-center w-[24px] h-[24px] rounded-full'>
        <span className='dark:text-white-100 text-black-100 material-icons-round !leading-[16px] text-xs'>
          arrow_forward
        </span>
      </div>

      <TxReviewTokenInfo amount={amountOut} token={destinationToken} chain={destinationChain} />
    </div>
  )
}

export default TxTokensSummary
