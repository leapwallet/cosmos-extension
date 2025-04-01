import { ActivityType, useGetChains } from '@leapwallet/cosmos-wallet-hooks'
import { Images } from 'images'
import React from 'react'
import { cn } from 'utils/cn'

import { LoaderAnimation } from '../../../components/loader/Loader'

export type ActivityIconProps = {
  secondaryImg?: string
  type: ActivityType
  showLoader?: boolean
  voteOption?: string
  size?: 'sm' | 'md' | 'lg'
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

const activityActionTypeIconMap: Record<Exclude<ActivityType, 'vote'>, string> = {
  send: Images.Activity.SendIcon,
  receive: Images.Activity.ReceiveIcon,
  fallback: Images.Activity.SendIcon,
  delegate: Images.Activity.Delegate,
  undelegate: Images.Activity.Undelegate,
  pending: Images.Activity.Pending,
  'ibc/transfer': Images.Activity.SwapIcon,
  swap: Images.Activity.SwapIcon,
  secretTokenTransfer: Images.Activity.SendIcon,
  'liquidity/add': Images.Activity.Delegate,
  'liquidity/remove': Images.Activity.Undelegate,
  cw20TokenTransfer: Images.Activity.SendIcon,
  grant: Images.Activity.SendIcon,
  revoke: Images.Activity.SendIcon,
}

export function ActivityIcon({
  secondaryImg,
  type,
  showLoader,
  voteOption,
  size = 'md',
  isSuccessful,
}: ActivityIconProps) {
  const icon =
    (type === 'vote' ? getVoteIcon(voteOption as string) : activityActionTypeIconMap[type]) ||
    Images.Activity.SendIcon

  const chains = useGetChains()
  const chainInfo = chains.seiDevnet
  const chainSymbolImageUrl = chainInfo?.chainSymbolImageUrl

  return (
    <div
      className={cn('relative', {
        'size-8': size === 'sm',
        'size-10': size === 'md',
        'size-16': size === 'lg',
      })}
    >
      <img
        src={chainSymbolImageUrl}
        className={cn('absolute', {
          'size-full': !secondaryImg,
          'size-10': size === 'md',
          'size-12': size === 'lg',
          'left-0 bottom-0': !!secondaryImg,
        })}
      />

      {secondaryImg && (
        <img
          src={secondaryImg}
          className={cn('absolute top-0 right-0', {
            'w-4 h-4': size === 'sm',
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
          className={cn(
            'absolute right-0 bottom-0 outline outline-2 outline-offset-[-2px] outline-secondary rounded-full',
            (size === 'sm' || size === 'md') && 'size-4',
          )}
        />
      )}
    </div>
  )
}
