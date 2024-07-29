import {
  formatTokenAmount,
  useActiveStakingDenom,
  useStaking,
} from '@leapwallet/cosmos-wallet-hooks'
import { GenericCard } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import BottomModal from 'components/bottom-modal'
import Text from 'components/text'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useHideAssets } from 'hooks/settings/useHideAssets'
import React, { useMemo } from 'react'

interface ClaimInfoProps {
  isOpen: boolean
  onClose: () => void
  onClaim: () => void
  onClaimAndStake: () => void
}

export default function ClaimInfo({ isOpen, onClose, onClaim, onClaimAndStake }: ClaimInfoProps) {
  const { formatHideBalance } = useHideAssets()
  const [formatCurrency] = useFormatCurrency()
  const [activeStakingDenom] = useActiveStakingDenom()

  const { totalRewardsDollarAmt, rewards } = useStaking()
  const nativeTokenReward = useMemo(() => {
    if (rewards) {
      return rewards.total?.find((token) => token.denom === activeStakingDenom.coinMinimalDenom)
    }
  }, [activeStakingDenom.coinMinimalDenom, rewards])

  const isClaimAndStakeDisabled = useMemo(
    () => !nativeTokenReward || new BigNumber(nativeTokenReward.amount).lt(0.00001),
    [nativeTokenReward],
  )

  const formattedNativeTokenReward = useMemo(() => {
    return formatHideBalance(
      formatTokenAmount(nativeTokenReward?.amount ?? '', activeStakingDenom.coinDenom),
    )
  }, [activeStakingDenom.coinDenom, formatHideBalance, nativeTokenReward?.amount])

  const nativeRewardTitle = useMemo(() => {
    if (new BigNumber(nativeTokenReward?.currenyAmount ?? '').gt(0)) {
      return formatHideBalance(
        formatCurrency(new BigNumber(nativeTokenReward?.currenyAmount ?? '')),
      )
    } else {
      return formattedNativeTokenReward
    }
  }, [
    formatCurrency,
    formatHideBalance,
    formattedNativeTokenReward,
    nativeTokenReward?.currenyAmount,
  ])

  const nativeRewardSubtitle = useMemo(() => {
    if (new BigNumber(nativeTokenReward?.currenyAmount ?? '').gt(0)) {
      return formattedNativeTokenReward
    }
    return ''
  }, [formattedNativeTokenReward, nativeTokenReward?.currenyAmount])

  const formattedTokenReward = useMemo(() => {
    return formatHideBalance(
      `${formatTokenAmount(nativeTokenReward?.amount ?? '', activeStakingDenom.coinDenom)} ${
        rewards?.total?.length > 1 ? `+${rewards.total.length - 1} more` : ''
      }`,
    )
  }, [
    activeStakingDenom.coinDenom,
    formatHideBalance,
    nativeTokenReward?.amount,
    rewards?.total.length,
  ])

  const totalRewardTitle = useMemo(() => {
    if (new BigNumber(totalRewardsDollarAmt).gt(0)) {
      return formatHideBalance(formatCurrency(new BigNumber(totalRewardsDollarAmt)))
    } else {
      return formattedTokenReward
    }
  }, [formatCurrency, formatHideBalance, formattedTokenReward, totalRewardsDollarAmt])

  const totalRewardSubtitle = useMemo(() => {
    if (new BigNumber(totalRewardsDollarAmt).gt(0)) {
      return formattedTokenReward
    }
    return ''
  }, [formattedTokenReward, totalRewardsDollarAmt])

  return (
    <BottomModal
      isOpen={isOpen}
      onClose={onClose}
      title='Claim Rewards'
      closeOnBackdropClick={true}
      className='p-6'
    >
      <div className='flex flex-col items-center w-full gap-y-4'>
        <div className='flex flex-col gap-y-2'>
          <Text
            size='xs'
            color='text-gray-700 dark:text-gray-400'
          >{`Claim rewards on ${activeStakingDenom.coinDenom}`}</Text>
          <GenericCard
            title={
              <Text
                size='sm'
                color='text-gray-800 dark:text-white-100'
                className='font-bold mb-0.5'
              >
                {totalRewardTitle}
              </Text>
            }
            subtitle={
              <Text size='xs' color='text-gray-600 dark:text-gray-400' className='font-medium'>
                {totalRewardSubtitle}
              </Text>
            }
            size='md'
            isRounded
            className='bg-white-100 dark:bg-gray-950'
            title2={
              <button
                onClick={onClaim}
                className='rounded-full text-xs font-bold text-white-100 dark:text-gray-900 dark:bg-white-100 bg-gray-900 px-4 py-2'
              >
                Claim
              </button>
            }
          />
        </div>

        <div className='flex flex-col gap-y-2'>
          <Text size='xs' color='text-gray-700 dark:text-gray-400'>
            Auto stake the rewards earned
          </Text>
          <GenericCard
            title={
              <Text
                size='sm'
                color='text-black-100 dark:text-white-100'
                className='font-bold mb-0.5'
              >
                {nativeRewardTitle}
              </Text>
            }
            subtitle={
              <Text size='xs' color='text-gray-600 dark:text-gray-400' className='font-medium'>
                {nativeRewardSubtitle}
              </Text>
            }
            size='md'
            isRounded
            className='bg-white-100 dark:bg-gray-950'
            title2={
              <button
                onClick={onClaimAndStake}
                disabled={isClaimAndStakeDisabled}
                className={`rounded-full text-xs font-bold px-4 py-2 bg-gray-100 dark:bg-gray-800 dark:text-white-100 text-gray-900 ${
                  isClaimAndStakeDisabled && 'opacity-70 !cursor-not-allowed'
                } `}
              >
                Claim and Stake
              </button>
            }
          />
        </div>
      </div>
    </BottomModal>
  )
}
