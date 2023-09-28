import { ActivityType } from '@leapwallet/cosmos-wallet-hooks'
import classnames from 'classnames'
import { Images } from 'images'
import React from 'react'

import { LoaderAnimation } from '../../components/loader/Loader'

export type ActivityIconProps = {
  img?: string
  secondaryImg?: string
  type: ActivityType
  showLoader?: boolean
  voteOption?: string
  size?: 'md' | 'lg'
  isSuccessful: boolean
}

const getVoteIcon = (voteOption: string): string => {
  switch (voteOption) {
    case 'Yes':
      return Images.Gov.VoteOptionYes
    case 'No':
      return Images.Gov.VoteOptionNo
    case 'No with Veto':
      return Images.Gov.VoteOptionNoWithVeto
    case 'Abstain':
      return Images.Gov.VoteOptionAbstain
  }
  return Images.Activity.Voting
}

export const getActivityActionTypeIcon = (type: ActivityType, voteOption?: string) => {
  switch (type) {
    case 'send':
      return Images.Activity.SendIcon
    case 'receive':
      return Images.Activity.ReceiveIcon
    case 'fallback':
      return Images.Activity.Fallback
    case 'delegate':
      return Images.Activity.Delegate
    case 'undelegate':
      return Images.Activity.Undelegate
    case 'pending':
      return Images.Activity.Pending
    case 'ibc/transfer':
      return Images.Activity.SwapIcon
    case 'swap':
      return Images.Activity.SwapIcon
    case 'vote':
      return getVoteIcon(voteOption as string)
    case 'secretTokenTransfer':
      return Images.Activity.SendIcon
    case 'liquidity/add':
      return Images.Activity.Delegate
    case 'liquidity/remove':
      return Images.Activity.Undelegate
  }
}

export function ActivityIcon({
  img,
  secondaryImg,
  type,
  showLoader,
  voteOption,
  size = 'md',
  isSuccessful,
}: ActivityIconProps) {
  const icon = getActivityActionTypeIcon(type, voteOption)
  return (
    <div
      className={classnames('relative', {
        'h-10 w-10': size === 'md',
        'h-16 w-16': size === 'lg',
      })}
    >
      <img
        src={type === 'fallback' ? Images.Activity.Hash : img}
        className={classnames('absolute', {
          'w-full h-full': !secondaryImg,
          'w-7 h-7 ': size === 'md',
          'w-12 h-12': size === 'lg',
          'left-0 bottom-0': !!secondaryImg,
        })}
      />
      {secondaryImg && (
        <img
          src={secondaryImg}
          className={classnames('absolute top-0 right-0', {
            'w-7 h-7': size === 'md',
            'w-12 h-12': size === 'lg',
          })}
        />
      )}
      {showLoader && (
        <div className='absolute right-0 bottom-0'>
          <LoaderAnimation color='#29a874' className='h-5 w-5 bg-white-100 rounded-2xl' />
        </div>
      )}
      {!secondaryImg && !showLoader && (
        <img
          src={isSuccessful ? icon : Images.Activity.Error}
          className='absolute right-0 bottom-0'
        />
      )}
    </div>
  )
}
