import { ChainInfos, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { Avatar, GenericCard } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import React, { useCallback } from 'react'

import { TokenCardSkeleton } from '~/components/skeletons'
import Text from '~/components/text'
import { useFormatCurrency } from '~/hooks/settings/use-currency'
import { useClaimRewards } from '~/hooks/staking/use-claim-rewards'
import { Images } from '~/images'
import hexToRgba from '~/util/hex-to-rgba'

function StakeRewardCard({
  rewardsAmount,
  activeChain,
  percent,
  validatorIcon,
  isLoading,
  onClaim,
}: {
  rewardsAmount: BigNumber
  activeChain: SupportedChain
  validatorIcon?: string
  percent: string
  isLoading: boolean
  onClaim: () => void
}) {
  const claimRewards = useClaimRewards()
  const formatCurrency = useFormatCurrency()

  const handleClaim = useCallback(() => {
    claimRewards()
    onClaim()
  }, [onClaim, claimRewards])

  if (isLoading) {
    return (
      <div className='rounded-2xl py-3 dark:bg-gray-900 bg-white-100 justify-center'>
        <TokenCardSkeleton />
      </div>
    )
  }

  if ((!isLoading && !rewardsAmount) || rewardsAmount.isEqualTo(0)) return <></>

  return (
    <div className='stake-reward-card relative rounded-2xl items-center py-3 dark:bg-gray-900 bg-white-100 justify-center'>
      <GenericCard
        img={
          <div className='mr-3'>
            <Avatar size='sm' avatarImage={Images.Misc.LeapReward} chainIcon={validatorIcon} />
          </div>
        }
        isRounded
        className='hover:cursor-default'
        title='Your Rewards'
        subtitle={
          <div>
            {formatCurrency(rewardsAmount)}
            {percent === 'NaN%' ? null : (
              <>
                <br />
                {percent} per year
              </>
            )}
          </div>
        }
      />
      <div
        onClick={handleClaim}
        className='absolute hover:cursor-pointer rounded-2xl px-3 py-1 right-6 top-[28px]'
        style={{ backgroundColor: hexToRgba(ChainInfos[activeChain].theme.primaryColor, 0.1) }}
      >
        <Text
          size='sm'
          className='font-bold'
          style={{ color: ChainInfos[activeChain].theme.primaryColor }}
        >
          Claim
        </Text>
      </div>
    </div>
  )
}

export default StakeRewardCard
