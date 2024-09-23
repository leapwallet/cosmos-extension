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
import BottomModal from 'components/bottom-modal'
import Text from 'components/text'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useHideAssets } from 'hooks/settings/useHideAssets'
import { SelectedNetwork, useSelectedNetwork } from 'hooks/settings/useNetwork'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'

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
    const { formatHideBalance } = useHideAssets()
    const [formatCurrency] = useFormatCurrency()
    const denoms = rootDenomsStore.allDenoms
    const [activeStakingDenom] = useActiveStakingDenom(denoms)

    const _activeChain = useActiveChain()
    const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain])

    const _activeNetwork = useSelectedNetwork()
    const activeNetwork = useMemo(
      () => forceNetwork || _activeNetwork,
      [_activeNetwork, forceNetwork],
    )

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

    const formattedTokenReward = useMemo(() => {
      return formatHideBalance(
        `${formatTokenAmount(nativeTokenReward?.amount ?? '', activeStakingDenom.coinDenom)} ${
          rewards?.total?.length > 1 ? `+${rewards?.total?.length - 1} more` : ''
        }`,
      )
    }, [
      activeStakingDenom?.coinDenom,
      formatHideBalance,
      nativeTokenReward?.amount,
      rewards?.total.length,
    ])

    const validatorRewardTitle = useMemo(() => {
      if (new BigNumber(totalRewardsDollarAmt).gt(0)) {
        return formatHideBalance(formatCurrency(new BigNumber(totalRewardsDollarAmt)))
      } else {
        return formattedTokenReward
      }
    }, [formatCurrency, formatHideBalance, formattedTokenReward, totalRewardsDollarAmt])

    const validatorRewardSubtitle = useMemo(() => {
      if (new BigNumber(totalRewardsDollarAmt).gt(0)) {
        return formattedTokenReward
      }
      return ''
    }, [formattedTokenReward, totalRewardsDollarAmt])

    const formattedProviderReward = useMemo(() => {
      return formatHideBalance(
        formatTokenAmount(providerRewards?.totalRewards ?? '', activeStakingDenom?.coinDenom),
      )
    }, [activeStakingDenom?.coinDenom, formatHideBalance, providerRewards?.totalRewards])

    const providerRewardTitle = useMemo(() => {
      if (new BigNumber(providerRewards?.totalRewardsDollarAmt).gt(0)) {
        return formatHideBalance(
          formatCurrency(new BigNumber(providerRewards?.totalRewardsDollarAmt)),
        )
      } else {
        return formattedProviderReward
      }
    }, [
      formatCurrency,
      formatHideBalance,
      formattedProviderReward,
      providerRewards?.totalRewardsDollarAmt,
    ])

    const providerRewardSubtitle = useMemo(() => {
      if (new BigNumber(providerRewards?.totalRewardsDollarAmt).gt(0)) {
        return formattedProviderReward
      }
      return ''
    }, [formattedProviderReward, providerRewards?.totalRewardsDollarAmt])

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
        </div>
      </BottomModal>
    )
  },
)

export default LavaClaimInfo
