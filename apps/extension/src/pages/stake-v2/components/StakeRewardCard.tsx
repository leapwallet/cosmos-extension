import {
  formatTokenAmount,
  SelectedNetwork,
  useActiveChain,
  useActiveStakingDenom,
  useDualStaking,
  useFeatureFlags,
  useSelectedNetwork,
  useStaking,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import {
  ClaimRewardsStore,
  DelegationsStore,
  RootDenomsStore,
  UndelegationsStore,
  ValidatorsStore,
} from '@leapwallet/cosmos-wallet-store'
import { CaretDown } from '@phosphor-icons/react'
import BigNumber from 'bignumber.js'
import Text from 'components/text'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useHideAssets } from 'hooks/settings/useHideAssets'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import Skeleton from 'react-loading-skeleton'

interface StakeRewardCardProps {
  onClaim?: () => void
  onClaimAndStake?: () => void
  rootDenomsStore: RootDenomsStore
  delegationsStore: DelegationsStore
  validatorsStore: ValidatorsStore
  unDelegationsStore: UndelegationsStore
  claimRewardsStore: ClaimRewardsStore
  forceChain?: SupportedChain
  forceNetwork?: SelectedNetwork
}

const StakeRewardCard = observer(
  ({
    onClaim,
    onClaimAndStake,
    rootDenomsStore,
    delegationsStore,
    validatorsStore,
    unDelegationsStore,
    claimRewardsStore,
    forceChain,
    forceNetwork,
  }: StakeRewardCardProps) => {
    const _activeChain = useActiveChain()
    const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain])
    const { data: featureFlags } = useFeatureFlags()
    const _activeNetwork = useSelectedNetwork()
    const activeNetwork = useMemo(
      () => forceNetwork || _activeNetwork,
      [_activeNetwork, forceNetwork],
    )

    const denoms = rootDenomsStore.allDenoms
    const [activeStakingDenom] = useActiveStakingDenom(denoms, activeChain, activeNetwork)
    const chainDelegations = delegationsStore.delegationsForChain(activeChain)
    const chainValidators = validatorsStore.validatorsForChain(activeChain)
    const chainUnDelegations = unDelegationsStore.unDelegationsForChain(activeChain)
    const chainClaimRewards = claimRewardsStore.claimRewardsForChain(activeChain)

    const [formatCurrency] = useFormatCurrency()
    const { activeWallet } = useActiveWallet()
    const { formatHideBalance } = useHideAssets()
    const { rewards: providerRewards } = useDualStaking()
    const { totalRewards, totalRewardsDollarAmt, loadingRewards, rewards } = useStaking(
      denoms,
      chainDelegations,
      chainValidators,
      chainUnDelegations,
      chainClaimRewards,
      activeChain,
      activeNetwork,
    )
    const isClaimDisabled = useMemo(() => {
      if (activeChain === 'evmos' && activeWallet?.walletType === WALLETTYPE.LEDGER) {
        return true
      }
      return !totalRewards || new BigNumber(totalRewards).lt(0.00001)
    }, [activeChain, activeWallet?.walletType, totalRewards])
    const nativeTokenReward = useMemo(() => {
      if (rewards) {
        return rewards.total?.find((token) => token.denom === activeStakingDenom?.coinMinimalDenom)
      }
    }, [activeStakingDenom?.coinMinimalDenom, rewards])

    const formattedRewardAmount = useMemo(() => {
      if (totalRewardsDollarAmt && new BigNumber(totalRewardsDollarAmt).gt(0)) {
        return formatHideBalance(formatCurrency(new BigNumber(totalRewardsDollarAmt)))
      } else {
        const rewardsCount = rewards?.total?.length ?? 0
        return formatHideBalance(
          `${formatTokenAmount(nativeTokenReward?.amount ?? '', activeStakingDenom?.coinDenom)} ${
            rewardsCount > 1 ? `+${rewardsCount - 1} more` : ''
          }`,
        )
      }
    }, [
      activeStakingDenom?.coinDenom,
      formatCurrency,
      formatHideBalance,
      nativeTokenReward?.amount,
      rewards?.total.length,
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
        {!loadingRewards &&
          (activeChain === 'lava' && featureFlags?.restaking?.extension === 'active' ? (
            <button
              disabled={isClaimDisabled && new BigNumber(providerRewards.totalRewards).lt(0.00001)}
              onClick={onClaim}
              className={`py-2 pl-4 pr-3 hover:cursor-pointer flex items-center rounded-full bg-gray-200 dark:bg-gray-800 gap-x-2 ${
                isClaimDisabled &&
                new BigNumber(providerRewards.totalRewards).lt(0.00001) &&
                'opacity-70 !cursor-not-allowed'
              }`}
            >
              <span className='font-bold text-xs text-black-100 dark:text-white-100'>Claim</span>
              <CaretDown size={12} className='text-black-100 dark:text-white-100' />
            </button>
          ) : (
            <button
              disabled={isClaimDisabled}
              className={`py-2 pl-4 pr-3 hover:cursor-pointer flex items-center rounded-full bg-gray-200 dark:bg-gray-800 gap-x-2 ${
                isClaimDisabled && 'opacity-70 !cursor-not-allowed'
              }`}
            >
              <span
                onClick={onClaim}
                className='font-bold text-xs text-black-100 dark:text-white-100'
              >
                Claim
              </span>
              <div className='w-px h-4 bg-gray-400 dark:bg-gray-700' />
              <CaretDown
                size={12}
                onClick={onClaimAndStake}
                className='text-black-100 dark:text-white-100'
              />
            </button>
          ))}
      </div>
    )
  },
)

export default StakeRewardCard
