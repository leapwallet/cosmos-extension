import { ArrowSquareOut, Info, X } from '@phosphor-icons/react'
import PopupLayout from 'components/layout/popup-layout'
import Text from 'components/text'
import { PageName } from 'config/analytics'
import { usePageView } from 'hooks/analytics/usePageView'
import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { useNavigate } from 'react-router'
import { formatForSubstring } from 'utils/strings'

import { ClaimableRewardInfo } from './components/ClaimableRewardInfo'
import { LastUpdatedScoreInfo } from './components/LastUpdatedScoreInfo'
import { RollupSkeleton } from './components/RollupSkeleton'
import { VipGaugeInfo } from './components/VipGaugeInfo'
import { VipRewardsInfo } from './components/VipRewardsInfo'
import { useVipData } from './useVipData'

const InitiaVip = observer(() => {
  usePageView(PageName.InitiaVip)
  const [isLastUpdatedScoreInfoOpen, setIsLastUpdatedScoreInfoOpen] = useState(false)
  const [isClaimableRewardInfoOpen, setIsClaimableRewardInfoOpen] = useState(false)
  const [isVipRewardsInfoOpen, setIsVipRewardsInfoOpen] = useState(false)
  const [isVipGaugeInfoOpen, setIsVipGaugeInfoOpen] = useState(false)
  const navigate = useNavigate()
  const {
    isLoading,
    data: { rollupList, totalClaimableReward, votingEndsIn },
  } = useVipData()

  const handleClose = () => {
    navigate('/home')
  }

  const handleClaim = () => {
    window.open('https://app.initia.xyz/vip', '_blank')
  }

  return (
    <>
      <div className='py-4 px-6 flex justify-between items-center bg-secondary-100 border-b border-secondary-200'>
        <div className='w-5 h-5' />
        <div className='flex items-center gap-2'>
          <Text className='font-bold text-[18px]' color='text-black-100 dark:text-white-100'>
            VIP Rewards
          </Text>
          <Info
            className='text-gray-400 dark:text-gray-600 w-5 h-5 cursor-pointer'
            onClick={(e) => {
              e.stopPropagation()
              setIsVipRewardsInfoOpen(true)
            }}
          />
        </div>
        <X
          className='text-muted-foreground hover:text-foreground w-5 h-5 cursor-pointer'
          onClick={handleClose}
        />
      </div>

      <div className='flex flex-col gap-8 pt-8 h-[calc(100%-61px)] overflow-y-scroll'>
        <div className='flex flex-col gap-3 px-6 items-center'>
          <Text size='md' color='text-gray-600 dark:text-gray-400'>
            Current gauge vote ends in
          </Text>
          {isLoading ? (
            <Skeleton width={150} height={20} />
          ) : (
            <Text color='text-black-100 dark:text-white-100' size='xl' className='font-bold'>
              {votingEndsIn}
            </Text>
          )}
        </div>

        <div className='flex flex-col p-5 mx-6 rounded-2xl gap-4 border border-secondary-200'>
          <div className='flex items-center gap-1'>
            <Text className='font-bold' size='sm' color='text-black-100 dark:text-white-100'>
              Claimable rewards
            </Text>
            <Info
              className='text-gray-400 dark:text-gray-600 w-4 h-4 cursor-pointer'
              onClick={(e) => {
                e.stopPropagation()
                setIsClaimableRewardInfoOpen(true)
              }}
            />
          </div>
          {isLoading ? (
            <div className='flex flex-col gap-1'>
              <Skeleton className='h-4' />
              <Skeleton className='!w-1/2 h-4' />
            </div>
          ) : totalClaimableReward > 0 ? (
            <div className='flex justify-between items-center'>
              <div className='flex flex-col gap-1.5'>
                <Text size='xs' color='text-gray-600 dark:text-gray-400'>
                  Total claimable
                </Text>
                <div className='flex gap-1 items-center'>
                  <Text color='text-green-600' size='lg' className='font-bold'>
                    {formatForSubstring(totalClaimableReward.toString())}
                  </Text>
                  <Text color='text-gray-600 dark:text-gray-400' size='md'>
                    INIT
                  </Text>
                </div>
              </div>
              <button
                className='flex items-center py-2 px-4 text-sm font-bold text-white-100 rounded-full cursor-pointer bg-green-600 hover:bg-green-500'
                onClick={handleClaim}
              >
                <span>Claim now</span>
                <ArrowSquareOut size={12} weight='bold' className='ml-1.5' />
              </button>
            </div>
          ) : (
            <Text size='sm' color='text-gray-600 dark:text-gray-400'>
              No rewards available to claim. Engage with the rollups below to earn rewards.
            </Text>
          )}
        </div>

        <div className='flex flex-col gap-4 p-6'>
          <div className='flex items-center gap-1'>
            <Text className='font-bold' size='md' color='text-black-100 dark:text-white-100'>
              Rollups
            </Text>
            <Info
              className='text-gray-400 dark:text-gray-600 w-4 h-4 cursor-pointer'
              onClick={(e) => {
                e.stopPropagation()
                setIsVipGaugeInfoOpen(true)
              }}
            />
          </div>
          {isLoading ? (
            <>
              <RollupSkeleton />
              <RollupSkeleton />
            </>
          ) : (
            rollupList.map((rollup) => {
              return (
                <div
                  key={rollup.name}
                  className='dark:bg-gray-900 bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-850 rounded-xl p-5 flex gap-10 cursor-pointer'
                  onClick={() => window.open(rollup.website, '_blank')}
                >
                  <div className='flex flex-col gap-4 flex-grow'>
                    <div className='flex gap-3'>
                      <img src={rollup.logo} alt={rollup.name} className='w-10 h-10 rounded-full' />
                      <div className='flex flex-col'>
                        <Text
                          className='font-bold'
                          size='md'
                          color='text-black-100 dark:text-white-100'
                        >
                          {rollup.prettyName}
                        </Text>
                        <Text
                          className='font-medium'
                          size='xs'
                          color='text-gray-600 dark:text-gray-400'
                        >
                          Gauge vote: {(rollup.votePercent * 100).toFixed(2)}%
                        </Text>
                      </div>
                    </div>

                    <div className='flex justify-between'>
                      <div className='flex flex-col gap-1'>
                        <div className='flex items-center gap-1'>
                          <Text size='xs' color='text-gray-600 dark:text-gray-400'>
                            Last updated score
                          </Text>
                          <Info
                            className='text-gray-400 dark:text-gray-600 w-3 h-3 cursor-pointer'
                            onClick={(e) => {
                              e.stopPropagation()
                              setIsLastUpdatedScoreInfoOpen(true)
                            }}
                          />
                        </div>
                        <Text
                          className='font-bold'
                          size='sm'
                          color='text-black-100 dark:text-white-100'
                        >
                          {formatForSubstring(rollup.lastUpdatedScore.toString())}
                        </Text>
                      </div>

                      <div className='flex flex-col gap-1'>
                        <Text size='xs' color='text-gray-600 dark:text-gray-400'>
                          Claimable rewards
                        </Text>

                        <Text size='sm' color='text-green-600'>
                          <span className='font-bold'>
                            {formatForSubstring(rollup.claimableReward.toString())}
                          </span>
                          &nbsp; INIT
                        </Text>
                      </div>
                    </div>
                  </div>
                  <ArrowSquareOut size={20} className='text-gray-400 dark:text-gray-600' />
                </div>
              )
            })
          )}
        </div>
      </div>
      <LastUpdatedScoreInfo
        isOpen={isLastUpdatedScoreInfoOpen}
        onClose={() => setIsLastUpdatedScoreInfoOpen(false)}
      />
      <ClaimableRewardInfo
        isOpen={isClaimableRewardInfoOpen}
        onClose={() => setIsClaimableRewardInfoOpen(false)}
      />
      <VipRewardsInfo
        isOpen={isVipRewardsInfoOpen}
        onClose={() => setIsVipRewardsInfoOpen(false)}
      />
      <VipGaugeInfo isOpen={isVipGaugeInfoOpen} onClose={() => setIsVipGaugeInfoOpen(false)} />
    </>
  )
})

export default InitiaVip
