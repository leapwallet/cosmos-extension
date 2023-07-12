import { ActivityType } from '@leapwallet/cosmos-wallet-hooks'
import classnames from 'classnames'
import { Images } from 'images'
import React from 'react'

export type ActivityIconProps = {
  img?: string
  secondaryImg?: string
  type: ActivityType
  showLoader?: boolean
  voteOption?: string
  size?: 'md' | 'lg'
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
  return Images.Activity.Fallback
}

export function ActivityIcon({
  img,
  secondaryImg,
  type,
  voteOption,
  size = 'md',
}: ActivityIconProps) {
  const icon = {
    send: Images.Activity.SendIcon,
    receive: Images.Activity.ReceiveIcon,
    fallback: Images.Activity.Fallback,
    delegate: Images.Activity.Delegate,
    undelegate: Images.Activity.Undelegate,
    pending: Images.Activity.Pending,
    'ibc/transfer': Images.Activity.SwapIcon,
    swap: Images.Activity.SwapIcon,
    vote: getVoteIcon(voteOption),
  }[type]

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
          'w-7 h-7 left-0 bottom-0': secondaryImg,
        })}
      />
      {secondaryImg && <img src={secondaryImg} className='absolute w-7 h-7 top-0 right-0' />}
      <img src={icon} className='absolute right-0 bottom-0' />
    </div>
  )
}
