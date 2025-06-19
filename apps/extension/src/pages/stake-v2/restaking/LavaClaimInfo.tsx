import {
  formatTokenAmount,
  useActiveStakingDenom,
  useDualStaking,
  useStaking,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import {
  ClaimRewardsStore,
  DelegationsStore,
  RootBalanceStore,
  RootDenomsStore,
  UndelegationsStore,
  ValidatorsStore,
} from '@leapwallet/cosmos-wallet-store'
import { GenericCard } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import BottomModal from 'components/new-bottom-modal'
import Text from 'components/text'
import { Button } from 'components/ui/button'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { SelectedNetwork, useSelectedNetwork } from 'hooks/settings/useNetwork'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { hideAssetsStore } from 'stores/hide-assets-store'

import { ClaimCard } from '../components/ClaimInfo'

interface LavaClaimInfoProps {
  isOpen: boolean
  onClose: () => void
  onClaimValidatorRewards: () => void
  onClaimProviderRewards: () => void
  rootDenomsStore: RootDenomsStore
  rootBalanceStore: RootBalanceStore
  delegationsStore: DelegationsStore
  validatorsStore: ValidatorsStore
  unDelegationsStore: UndelegationsStore
  claimRewardsStore: ClaimRewardsStore
  forceChain?: SupportedChain
  forceNetwork?: SelectedNetwork
}

const LavaClaimInfo = observer(
  ({
    isOpen,
    onClose,
    onClaimValidatorRewards,
    onClaimProviderRewards,
    rootDenomsStore,
    delegationsStore,
    validatorsStore,
    unDelegationsStore,
    claimRewardsStore,
    forceChain,
    forceNetwork,
  }: LavaClaimInfoProps) => {
    const [formatCurrency] = useFormatCurrency()
    const denoms = rootDenomsStore.allDenoms

    const _activeChain = useActiveChain()
    const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain])

    const _activeNetwork = useSelectedNetwork()
    const activeNetwork = useMemo(
      () => forceNetwork || _activeNetwork,
      [_activeNetwork, forceNetwork],
    )

    const [activeStakingDenom] = useActiveStakingDenom(denoms, activeChain, activeNetwork)
    const chainDelegations = delegationsStore.delegationsForChain(activeChain)
    const chainValidators = validatorsStore.validatorsForChain(activeChain)
    const chainUnDelegations = unDelegationsStore.unDelegationsForChain(activeChain)
    const chainClaimRewards = claimRewardsStore.claimRewardsForChain(activeChain)

    const {
      totalRewardsDollarAmt = 0,
      rewards = { total: [] },
      totalRewards,
    } = useStaking(
      denoms,
      chainDelegations,
      chainValidators,
      chainUnDelegations,
      chainClaimRewards,
      activeChain,
      activeNetwork,
    )
    const isClaimDisabled = useMemo(
      () => !totalRewards || new BigNumber(totalRewards).lt(0.00001),
      [totalRewards],
    )
    const { rewards: providerRewards } = useDualStaking()

    const isProviderClaimDisabled = useMemo(
      () =>
        !providerRewards?.totalRewards || new BigNumber(providerRewards?.totalRewards).lt(0.00001),
      [providerRewards?.totalRewards],
    )
    const nativeTokenReward = useMemo(() => {
      if (rewards) {
        return rewards?.total?.find((token) => token.denom === activeStakingDenom?.coinMinimalDenom)
      }
    }, [activeStakingDenom?.coinMinimalDenom, rewards])

    const formattedTokenProviderReward = useMemo(() => {
      if (providerRewards) {
        const rewardItems = providerRewards.rewards
          ?.flatMap((reward) => reward.amount)
          .reduce((acc, curr) => {
            acc[curr.denom] = acc[curr.denom]
              ? new BigNumber(acc[curr.denom]).plus(new BigNumber(curr.amount))
              : new BigNumber(curr.amount)
            return acc
          }, {} as Record<string, BigNumber>)
        const rewardsLength = Object.keys(rewardItems ?? {}).length
        return hideAssetsStore.formatHideBalance(
          `${providerRewards.formattedTotalRewards} ${
            rewardsLength > 1 ? `+${rewardsLength - 1} more` : ''
          }`,
        )
      }
    }, [providerRewards])

    const formattedTokenReward = useMemo(() => {
      return hideAssetsStore.formatHideBalance(
        `${formatTokenAmount(nativeTokenReward?.amount ?? '', activeStakingDenom.coinDenom)} ${
          rewards?.total?.length > 1 ? `+${rewards?.total?.length - 1} more` : ''
        }`,
      )
    }, [activeStakingDenom?.coinDenom, nativeTokenReward?.amount, rewards?.total.length])

    const validatorRewardTitle = useMemo(() => {
      if (new BigNumber(totalRewardsDollarAmt).gt(0)) {
        return hideAssetsStore.formatHideBalance(
          formatCurrency(new BigNumber(totalRewardsDollarAmt)),
        )
      } else {
        return formattedTokenReward
      }
    }, [formatCurrency, formattedTokenReward, totalRewardsDollarAmt])

    const validatorRewardSubtitle = useMemo(() => {
      if (new BigNumber(totalRewardsDollarAmt).gt(0)) {
        return formattedTokenReward
      }
      return ''
    }, [formattedTokenReward, totalRewardsDollarAmt])

    const providerRewardTitle = useMemo(() => {
      if (new BigNumber(providerRewards?.totalRewardsDollarAmt).gt(0)) {
        return hideAssetsStore.formatHideBalance(
          formatCurrency(new BigNumber(providerRewards?.totalRewardsDollarAmt)),
        )
      } else {
        return formattedTokenProviderReward
      }
    }, [formatCurrency, formattedTokenProviderReward, providerRewards?.totalRewardsDollarAmt])

    const providerRewardSubtitle = useMemo(() => {
      if (new BigNumber(providerRewards?.totalRewardsDollarAmt).gt(0)) {
        return formattedTokenProviderReward
      }
      return ''
    }, [formattedTokenProviderReward, providerRewards?.totalRewardsDollarAmt])

    return (
      <BottomModal
        isOpen={isOpen}
        onClose={onClose}
        title='Claim rewards'
        className='flex flex-col gap-8 mt-4'
      >
        {/* <div className='flex flex-col items-center w-full gap-y-4'>
          <div className='flex flex-col gap-y-2'>
            <Text size='xs' color='text-gray-700 dark:text-gray-400'>
              Validator Rewards
            </Text>
            <GenericCard
              title={
                <Text
                  size='sm'
                  color='text-gray-800 dark:text-white-100'
                  className='font-bold mb-0.5'
                >
                  {validatorRewardTitle}
                </Text>
              }
              subtitle={
                <Text size='xs' color='text-gray-600 dark:text-gray-400' className='font-medium'>
                  {validatorRewardSubtitle}
                </Text>
              }
              size='md'
              isRounded
              className='bg-white-100 dark:bg-gray-950'
              title2={
                <button
                  onClick={onClaimValidatorRewards}
                  disabled={isClaimDisabled}
                  className={`rounded-full text-xs font-bold text-white-100 dark:text-gray-900 dark:bg-white-100 bg-gray-900 px-4 py-2 ${
                    isClaimDisabled && 'opacity-70 !cursor-not-allowed'
                  }`}
                >
                  Claim
                </button>
              }
            />
          </div>

          <div className='flex flex-col gap-y-2'>
            <Text size='xs' color='text-gray-700 dark:text-gray-400'>
              Provider Rewards
            </Text>
            <GenericCard
              title={
                <Text
                  size='sm'
                  color='text-black-100 dark:text-white-100'
                  className='font-bold mb-0.5'
                >
                  {providerRewardTitle}
                </Text>
              }
              subtitle={
                <Text size='xs' color='text-gray-600 dark:text-gray-400' className='font-medium'>
                  {providerRewardSubtitle}
                </Text>
              }
              size='md'
              isRounded
              className='bg-white-100 dark:bg-gray-950'
              title2={
                <button
                  onClick={onClaimProviderRewards}
                  disabled={isProviderClaimDisabled}
                  className={`rounded-full text-xs font-bold text-white-100 dark:text-gray-900 dark:bg-white-100 bg-gray-900 px-4 py-2 ${
                    isProviderClaimDisabled && 'opacity-70 !cursor-not-allowed'
                  }`}
                >
                  Claim
                </button>
              }
            />
          </div>
        </div> */}
        <div className='flex flex-col gap-4 w-full'>
          <span className='text-muted-foreground text-sm'>Validator Rewards</span>
          <ClaimCard
            titleAmount={validatorRewardTitle}
            secondaryAmount={validatorRewardSubtitle}
            button={
              <Button
                onClick={onClaimValidatorRewards}
                disabled={isClaimDisabled}
                size='md'
                variant={'secondary'}
                className='w-[7.5rem] bg-secondary-350 disabled:bg-secondary-300 hover:bg-secondary-300'
              >
                Claim
              </Button>
            }
          />
        </div>
        <div className='flex flex-col gap-4 w-full'>
          <span className='text-muted-foreground text-sm'>Provider Rewards</span>
          <ClaimCard
            titleAmount={providerRewardTitle ?? ''}
            secondaryAmount={providerRewardSubtitle ?? ''}
            button={
              <Button
                size='md'
                variant={'secondary'}
                className='w-[7.5rem] bg-secondary-350 disabled:bg-secondary-300 hover:bg-secondary-300'
                onClick={onClaimProviderRewards}
                disabled={isProviderClaimDisabled}
              >
                Claim
              </Button>
            }
          />
        </div>
      </BottomModal>
    )
  },
)

export default LavaClaimInfo
