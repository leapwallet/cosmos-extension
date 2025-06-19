import { useChainInfo } from '@leapwallet/cosmos-wallet-hooks'
import { ChainTagsStore } from '@leapwallet/cosmos-wallet-store'
import { CaretRight } from '@phosphor-icons/react'
import classNames from 'classnames'
import Text from 'components/text'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React from 'react'
import Skeleton from 'react-loading-skeleton'
import { useNavigate } from 'react-router'
import { formatForSubstring } from 'utils/strings'

import { useVipData } from '../useVipData'

export const RewardCard = observer(({ chainTagsStore }: { chainTagsStore: ChainTagsStore }) => {
  const chainInfo = useChainInfo()
  const selectedNetwork = useSelectedNetwork()
  const navigate = useNavigate()
  const tags = chainTagsStore.allChainTags[chainInfo?.chainId]
  const {
    isLoading,
    data: { votingEndsIn, totalClaimableReward },
  } = useVipData()
  const daysUntilVotingEnds = +votingEndsIn.split('d:')[0] || 0
  const hoursUntilVotingEnds = +votingEndsIn.split('d:')[1]?.split('h:')[0] || 0
  const minutesUntilVotingEnds = +votingEndsIn.split('d:')[1]?.split('h:')[1]?.split('m')[0] || 0

  const handleClick = () => {
    navigate('/initia-vip')
  }

  if (!tags || !tags.includes('Initia') || selectedNetwork === 'testnet') return null

  return (
    <div className='px-7 w-full mt-3 mb-6'>
      <div
        className='bg-secondary-100 hover:bg-secondary-200 rounded-2xl border dark:border-gray-850 border-gray-100 flex justify-between py-4 px-5 w-full items-center cursor-pointer'
        onClick={handleClick}
      >
        <div className='flex gap-3'>
          <img
            src={Images.Misc.PersonPlay}
            className='w-12 h-12 p-3 rounded-full bg-secondary-250'
          />
          <div
            className={classNames('flex flex-col justify-between', {
              'py-[1px]': totalClaimableReward,
              'py-1': !totalClaimableReward,
            })}
          >
            <Text color='text-black-100 dark:text-white-100' className='font-bold' size='sm'>
              VIP rewards
            </Text>
            {isLoading ? (
              <Skeleton className='w-12 h-3' />
            ) : totalClaimableReward > 0 ? (
              <div className='flex gap-1 items-center'>
                <Text color='text-green-600' size='sm' className='font-medium'>
                  {formatForSubstring(totalClaimableReward.toString())}
                </Text>
                <Text color='text-gray-600 dark:text-gray-400' size='xs'>
                  INIT claimable
                </Text>
              </div>
            ) : (
              <Text color='text-gray-600 dark:text-gray-400' size='xs'>
                {daysUntilVotingEnds > 0
                  ? `${daysUntilVotingEnds} ${daysUntilVotingEnds === 1 ? 'day' : 'days'} `
                  : hoursUntilVotingEnds > 0
                  ? `${hoursUntilVotingEnds} ${hoursUntilVotingEnds === 1 ? 'hour' : 'hours'} `
                  : `${minutesUntilVotingEnds} ${
                      minutesUntilVotingEnds === 1 ? 'minute' : 'minutes'
                    } `}
                until this stage ends
              </Text>
            )}
          </div>
        </div>
        <CaretRight className='w-7 h-7 rounded-full bg-secondary-300 dark:text-gray-400 text-gray-600 p-1.5 font-bold' />
      </div>
    </div>
  )
})
