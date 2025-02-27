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
}: Props) {
  return (
    <div
      className={classNames(
        'w-full bg-gray-50 dark:bg-gray-900 flex items-center justify-between p-4 gap-2 max-[350px]:gap-0 rounded-2xl',
        className,
      )}
    >
      <TxReviewTokenInfo
        amount={inAmount}
        token={sourceToken}
        chain={sourceChain}
        assetUsdValue={sourceAssetUSDValue}
      />

      <div className='bg-gray-100 dark:bg-gray-850 shrink-0 flex justify-center items-center w-[24px] h-[24px] max-[350px]:w-[20px] max-[350px]:h-[20px] rounded-full'>
        <ArrowRight
          size={16}
          className='dark:text-white-100 text-black-100 !leading-[16px] text-xs max-[350px]:!leading-[13.33px]'
        />
      </div>

      <TxReviewTokenInfo
        amount={amountOut}
        token={destinationToken}
        chain={destinationChain}
        assetUsdValue={destinationAssetUSDValue}
      />
    </div>
  )
}

export default TxTokensSummary
