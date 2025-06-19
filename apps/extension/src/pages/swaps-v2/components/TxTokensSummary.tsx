import { ArrowRight } from '@phosphor-icons/react'
import BigNumber from 'bignumber.js'
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
  sourceAssetUSDValue?: BigNumber
  destinationAssetUSDValue?: BigNumber
  amountOutLoading?: boolean
}

function TxTokensSummary({
  inAmount,
  sourceToken,
  sourceChain,
  amountOut,
  destinationToken,
  destinationChain,
  className,
  sourceAssetUSDValue,
  destinationAssetUSDValue,
  amountOutLoading,
}: Props) {
  return (
    <div
      className={classNames(
        'relative w-full flex items-center justify-between gap-3 max-[350px]:gap-0 rounded-2xl',
        className,
      )}
    >
      <div className='flex justify-center bg-secondary py-[24px] px-4 rounded-xl !max-w-[170px] w-full'>
        <TxReviewTokenInfo
          amount={inAmount}
          token={sourceToken}
          chain={sourceChain}
          assetUsdValue={sourceAssetUSDValue}
        />
      </div>

      <ArrowRight
        size={40}
        className='dark:text-white-100 text-black-100 bg-gray-100 dark:bg-gray-800 absolute rounded-full p-2.5 left-1/2 -translate-x-1/2'
      />

      <div className='flex justify-center bg-secondary-200 py-[24px] px-4 rounded-xl !max-w-[170px] w-full'>
        <TxReviewTokenInfo
          amount={amountOut}
          amountLoading={amountOutLoading}
          token={destinationToken}
          chain={destinationChain}
          assetUsdValue={destinationAssetUSDValue}
        />
      </div>
    </div>
  )
}

export default TxTokensSummary
