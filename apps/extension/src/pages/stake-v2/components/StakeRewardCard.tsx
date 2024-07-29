import {
  formatTokenAmount,
  useActiveStakingDenom,
  useStaking,
} from '@leapwallet/cosmos-wallet-hooks'
import BigNumber from 'bignumber.js'
import Text from 'components/text'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useHideAssets } from 'hooks/settings/useHideAssets'
import React, { useMemo } from 'react'
import Skeleton from 'react-loading-skeleton'

interface StakeRewardCardProps {
  onClaim?: () => void
  onClaimAndStake?: () => void
}

export default function StakeRewardCard({ onClaim, onClaimAndStake }: StakeRewardCardProps) {
  const [formatCurrency] = useFormatCurrency()
  const { formatHideBalance } = useHideAssets()
  const [activeStakingDenom] = useActiveStakingDenom()
  const { totalRewards, totalRewardsDollarAmt, loadingRewards, rewards } = useStaking()
  const isClaimDisabled = useMemo(
    () => !totalRewards || new BigNumber(totalRewards).lt(0.00001),
    [totalRewards],
  )

  const nativeTokenReward = useMemo(() => {
    if (rewards) {
      return rewards.total?.find((token) => token.denom === activeStakingDenom.coinMinimalDenom)
    }
  }, [activeStakingDenom.coinMinimalDenom, rewards])

  const formattedRewardAmount = useMemo(() => {
    if (new BigNumber(totalRewardsDollarAmt).gt(0)) {
      return formatHideBalance(formatCurrency(new BigNumber(totalRewardsDollarAmt)))
    } else {
      return formatHideBalance(
        `${formatTokenAmount(nativeTokenReward?.amount ?? '', activeStakingDenom.coinDenom)} ${
          rewards?.total?.length > 1 ? `+${rewards.total.length - 1} more` : ''
        }`,
      )
    }
  }, [
    activeStakingDenom.coinDenom,
    formatCurrency,
    formatHideBalance,
    nativeTokenReward?.amount,
    rewards.total.length,
    totalRewardsDollarAmt,
  ])

  return (
    <div className='rounded-2xl flex items-center p-4 bg-gray-50 dark:bg-gray-900 justify-between w-full'>
      <div className='flex flex-col gap-y-0.5'>
        <Text size='xs' className='font-medium' color='text-gray-700 dark:text-gray-400'>
          You have earned
        </Text>
        {loadingRewards && <Skeleton width={50} height={14} />}
        {!loadingRewards && (
          <Text size='sm' className='font-bold' color='text-black-100 dark:text-white-100'>
            {formattedRewardAmount}
          </Text>
        )}
      </div>
      {loadingRewards && <Skeleton width={95} height={28} borderRadius={100} />}
      {!loadingRewards && (
        <button
          disabled={isClaimDisabled}
          className={`hover:cursor-pointer flex items-center rounded-full bg-gray-200 dark:bg-gray-800 gap-x-2 ${
            isClaimDisabled && 'opacity-70 !cursor-not-allowed'
          }`}
        >
          <span
            onClick={onClaim}
            className='font-bold text-xs text-black-100 dark:text-white-100 py-2 pl-4'
          >
            Claim
          </span>
          <div className='w-px h-4 bg-gray-400 dark:bg-gray-700' />
          <span
            onClick={onClaimAndStake}
            className='material-icons-round pr-3 py-2 text-black-100 dark:text-white-100 !text-md'
          >
            expand_more
          </span>
        </button>
      )}
    </div>
  )
}
