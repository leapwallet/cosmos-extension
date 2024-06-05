import { ActivityCardContent } from '@leapwallet/cosmos-wallet-hooks'
import { default as classNames } from 'classnames'
import { useHideAssets } from 'hooks/settings/useHideAssets'
import { Images } from 'images'
import React from 'react'

import { useActivityImage } from '../../hooks/activity/useActivityImage'
import { formatTokenAmount } from '../../utils/strings'
import { ActivityIcon } from './ActivityIcon'

export type ActivityCardProps = {
  content: ActivityCardContent
  showLoader?: boolean
  onClick?: () => void
  isSuccessful: boolean
  containerClassNames?: string
}

export function ActivityCard({
  content,
  onClick,
  showLoader,
  isSuccessful,
  containerClassNames,
}: ActivityCardProps) {
  const {
    txType,
    title1,
    subtitle1,
    sentTokenInfo,
    sentAmount,
    receivedAmount,
    sentUsdValue,
    img: customImage,
    secondaryImg,
    receivedTokenInfo,
  } = content

  const defaultImg = useActivityImage(txType)
  const img = customImage || defaultImg

  const { formatHideBalance } = useHideAssets()

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
    <div
      className={classNames(
        'flex rounded-2xl justify-between items-center p-[16px] bg-white-100 dark:bg-gray-900 cursor-pointer',
        containerClassNames,
      )}
      onClick={onClick}
    >
      <div className='flex items-center flex-grow'>
        <ActivityIcon
          img={img}
          showLoader={showLoader}
          voteOption={content.txType === 'vote' ? content.title1 : ''}
          secondaryImg={secondaryImg}
          type={txType}
          isSuccessful={isSuccessful}
        />
        <div className='flex flex-col justify-center items-start px-3'>
          <div className='text-base font-bold text-black-100 dark:text-white-100 text-left'>
            {title1}
          </div>
          <div className='text-xs text-gray-600 dark:text-gray-400'>{subtitle1}</div>
        </div>
        <div className='flex flex-grow' />
        <div className='flex flex-col justify-center items-end pr-3'>
          {txType === 'swap' ? (
            <>
              {receivedAmountInfo && (
                <p className='text-xs text-right font-semibold text-green-600 dark:text-green-600'>
                  {balanceReduced && '-'} {formatHideBalance(receivedAmountInfo)}
                </p>
              )}
              {sentAmountInfo && (
                <p className='text-[10px] text-right text-gray-600 dark:text-gray-400'>
                  {balanceReduced && '-'} {formatHideBalance(sentAmountInfo)}
                </p>
              )}
            </>
          ) : (
            <>
              {sentUsdValue && (
                <p
                  className={classNames('text-sm text-right font-bold', {
                    'text-black-100 dark:text-white-100': !balanceIncreased && !balanceReduced,
                    'text-red-600 dark:text-red-300': balanceReduced,
                    'text-green-600 dark:text-green-600': balanceIncreased,
                  })}
                >
                  {balanceReduced && '-'} ${formatHideBalance(Number(sentUsdValue).toFixed(2))}
                </p>
              )}

              {sentAmountInfo && (
                <p className={classNames('text-xs text-right text-gray-600 dark:text-gray-400')}>
                  {balanceReduced && '-'} {formatHideBalance(sentAmountInfo)}
                </p>
              )}
            </>
          )}
        </div>
        <img src={Images.Misc.RightArrow} />
      </div>
    </div>
  )
}
