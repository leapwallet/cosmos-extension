import { ActivityCardContent } from '@leapwallet/cosmos-wallet-hooks'
import classnames from 'classnames'
import { Images } from 'images'
import React from 'react'

import { useActivityImage } from '~/hooks/activity/use-activity-image'
import { formatTokenAmount } from '~/util/strings'

import { ActivityIcon } from './activity-icon'

export type ActivityCardProps = {
  content: ActivityCardContent
  showLoader?: boolean
  onClick?: () => void
}

function ActivityCard({ content, onClick, showLoader }: ActivityCardProps) {
  const { txType, title1, subtitle1, sentTokenInfo, sentAmount, sentUsdValue, secondaryImg } =
    content

  const img = useActivityImage({ txType, content })

  const amountInfo =
    sentAmount && sentTokenInfo ? formatTokenAmount(sentAmount, sentTokenInfo.coinDenom) : undefined
  const textRed = txType === 'delegate' || txType === 'send'
  const textGreen = txType === 'undelegate' || txType === 'receive'

  return (
    <div
      className={classnames(
        'flex rounded-2xl justify-between items-center p-[16px] bg-white-100 dark:bg-gray-900 cursor-pointer',
      )}
      onClick={onClick}
    >
      <div className={classnames('flex items-center flex-grow')}>
        <ActivityIcon
          img={img}
          showLoader={showLoader}
          voteOption={content.txType === 'vote' && content.title1}
          secondaryImg={secondaryImg}
          type={txType}
        />
        <div className={classnames('flex flex-col justify-center items-start px-3')}>
          <div
            className={classnames(
              'text-base font-bold text-black-100 dark:text-white-100 text-left',
            )}
          >
            {title1}
          </div>
          <div className={classnames('text-xs text-gray-600 dark:text-gray-400')}>{subtitle1}</div>
        </div>
        <div className='flex flex-grow' />
        <div className={classnames('flex flex-col justify-center items-end pr-3')}>
          {sentUsdValue && (
            <div
              className={classnames('text-sm font-bold', {
                'text-black-100 dark:text-white-100': !textGreen && !textRed,
                'text-red-600 dark:text-red-300': textRed,
                'text-green-600 dark:text-green-600': textGreen,
              })}
            >
              {textRed && '-'} ${Number(sentUsdValue).toFixed(2)}
            </div>
          )}

          {amountInfo && (
            <div className={classnames('text-xs text-gray-600 dark:text-gray-400')}>
              {textRed && '-'} {amountInfo}
            </div>
          )}
        </div>
        <img src={Images.Misc.RightArrow} />
      </div>
    </div>
  )
}

export default ActivityCard
