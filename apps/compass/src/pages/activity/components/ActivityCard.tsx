import { ActivityCardContent, useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { CaretRight } from '@phosphor-icons/react'
import { useActivityImage } from 'hooks/activity/useActivityImage'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { hideAssetsStore } from 'stores/hide-assets-store'
import { cn } from 'utils/cn'
import { formatTokenAmount } from 'utils/strings'

import { ActivityIcon } from './index'

export type ActivityCardProps = {
  content: ActivityCardContent
  showLoader?: boolean
  onClick?: () => void
  isSuccessful: boolean
  containerClassNames?: string
  forceChain?: SupportedChain
  titleClassName?: string
  imgSize?: 'sm' | 'md' | 'lg'
}

function ActivityCardView({
  content,
  onClick,
  showLoader,
  isSuccessful,
  containerClassNames,
  titleClassName,
  imgSize,
}: ActivityCardProps) {
  const {
    txType,
    title1,
    subtitle1,
    sentTokenInfo,
    sentAmount,
    receivedAmount,
    sentUsdValue,
    secondaryImg,
    receivedTokenInfo,
  } = content

  const sentAmountInfo =
    sentAmount && sentTokenInfo ? formatTokenAmount(sentAmount, sentTokenInfo.coinDenom) : undefined
  const receivedAmountInfo =
    receivedAmount && receivedTokenInfo
      ? formatTokenAmount(receivedAmount, receivedTokenInfo.coinDenom)
      : undefined

  const balanceReduced = txType === 'delegate' || txType === 'send' || txType === 'liquidity/add'
  const balanceIncreased =
    txType === 'undelegate' || txType === 'receive' || txType === 'liquidity/remove'

  return (
    <button
      className={cn(
        'flex rounded-2xl justify-between items-center p-4 bg-secondary-100 hover:bg-secondary-200 transition-colors',
        containerClassNames,
      )}
      onClick={onClick}
    >
      <div className='flex items-center flex-grow gap-3'>
        <ActivityIcon
          showLoader={showLoader}
          voteOption={content.txType === 'vote' ? content.title1 : ''}
          secondaryImg={secondaryImg}
          type={txType}
          isSuccessful={isSuccessful}
          size={imgSize}
        />
        <div className='flex flex-col justify-center items-start'>
          <span className={cn('text-base font-bold', titleClassName)}>{title1}</span>
          <span className='text-xs font-medium text-muted-foreground'>{subtitle1}</span>
        </div>
        <div className='flex flex-grow' />

        <div className='flex flex-col justify-center items-end'>
          {txType === 'swap' ? (
            <>
              {receivedAmountInfo && (
                <p className='text-xs text-right font-semibold text-green-600 dark:text-green-600'>
                  {balanceReduced && '-'} {hideAssetsStore.formatHideBalance(receivedAmountInfo)}
                </p>
              )}
              {sentAmountInfo && (
                <p className='text-xs font-medium text-muted-foreground text-end'>
                  {balanceReduced && '-'} {hideAssetsStore.formatHideBalance(sentAmountInfo)}
                </p>
              )}
            </>
          ) : (
            <>
              {sentUsdValue && (
                <p
                  className={cn('text-sm text-end font-bold', {
                    'text-black-100 dark:text-white-100': !balanceIncreased && !balanceReduced,
                    'text-destructive-200': balanceReduced,
                    'text-accent-success': balanceIncreased,
                  })}
                >
                  {balanceReduced && '-'} $
                  {hideAssetsStore.formatHideBalance(Number(sentUsdValue).toFixed(2))}
                </p>
              )}

              {sentAmountInfo && (
                <p className={'text-xs font-medium text-muted-foreground'}>
                  {balanceReduced && '-'} {hideAssetsStore.formatHideBalance(sentAmountInfo)}
                </p>
              )}
            </>
          )}
        </div>
        {onClick ? <CaretRight size={12} className='text-muted-foreground' /> : null}
      </div>
    </button>
  )
}

export const ActivityCard = observer(ActivityCardView)
