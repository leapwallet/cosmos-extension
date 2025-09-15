import {
  formatTokenAmount,
  SelectedNetwork,
  useActiveChain,
  useActiveStakingDenom,
  useActiveWallet,
  useSelectedNetwork,
  useStaking,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { WALLETTYPE } from '@leapwallet/cosmos-wallet-store'
import BigNumber from 'bignumber.js'
import { Button } from 'components/ui/button'
import { AnimatePresence, motion } from 'framer-motion'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import Skeleton from 'react-loading-skeleton'
import { Link, useNavigate } from 'react-router-dom'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { hideAssetsStore } from 'stores/hide-assets-store'
import {
  claimRewardsStore,
  delegationsStore,
  unDelegationsStore,
  validatorsStore,
} from 'stores/stake-store'
import { cn } from 'utils/cn'
import { opacityFadeInOut, transition150 } from 'utils/motion-variants'

import { StakeInputPageState } from '../StakeInputPage'

interface StakeAmountCardProps {
  onClaim: () => void
  forceChain?: SupportedChain
  forceNetwork?: SelectedNetwork
}

export const AmountCard = (props: {
  loading: boolean
  title: string
  children: React.ReactNode
}) => {
  return (
    <div className='flex flex-col gap-2'>
      <span className='text-xs text-muted-foreground'>{props.title}</span>
      <AnimatePresence mode='wait'>
        {props.loading ? (
          <motion.div
            key='loading'
            className='h-[1.875rem] flex flex-col justify-end'
            transition={transition150}
            variants={opacityFadeInOut}
            initial='hidden'
            animate='visible'
            exit='hidden'
          >
            <Skeleton className='w-24 h-5 grow-0' />
          </motion.div>
        ) : (
          <motion.span
            key='loaded'
            className='flex gap-1 items-baseline'
            transition={transition150}
            variants={opacityFadeInOut}
            initial='hidden'
            animate='visible'
            exit='hidden'
          >
            {props.children}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}

const StakeAmountCard = observer(({ onClaim, forceChain, forceNetwork }: StakeAmountCardProps) => {
  const _activeChain = useActiveChain()
  const activeChain = forceChain ?? _activeChain

  const _activeNetwork = useSelectedNetwork()
  const activeNetwork = forceNetwork ?? _activeNetwork

  const denoms = rootDenomsStore.allDenoms
  const chainDelegations = delegationsStore.delegationsForChain(activeChain)
  const chainValidators = validatorsStore.validatorsForChain(activeChain)
  const chainUnDelegations = unDelegationsStore.unDelegationsForChain(activeChain)
  const chainClaimRewards = claimRewardsStore.claimRewardsForChain(activeChain)

  const [activeStakingDenom] = useActiveStakingDenom(denoms, activeChain, activeNetwork)
  const {
    totalRewardsDollarAmt,
    loadingDelegations,
    currencyAmountDelegation,
    totalDelegationAmount,
    loadingRewards,
    totalRewards,
    rewards,
  } = useStaking(
    denoms,
    chainDelegations,
    chainValidators,
    chainUnDelegations,
    chainClaimRewards,
    activeChain,
    activeNetwork,
  )
  const [formatCurrency] = useFormatCurrency()
  const activeWallet = useActiveWallet()
  const navigate = useNavigate()

  const formattedCurrencyAmountDelegation = useMemo(() => {
    if (currencyAmountDelegation && new BigNumber(currencyAmountDelegation).gt(0)) {
      return formatCurrency(new BigNumber(currencyAmountDelegation))
    }
  }, [currencyAmountDelegation, formatCurrency])

  const isClaimDisabled = useMemo(() => {
    if (activeChain === 'evmos' && activeWallet?.walletType === WALLETTYPE.LEDGER) {
      return true
    }
    if (activeChain === 'celestia') {
      const _totalRewards = (chainClaimRewards?.rewards?.result?.rewards ?? []).reduce(
        (acc, curr) => {
          if (!chainDelegations?.delegationInfo?.delegations?.[curr.validator_address]) return acc
          const nativeReward = curr.reward.find(
            (r) => r.denom === activeStakingDenom?.coinMinimalDenom,
          )
          if (!nativeReward) return acc
          return new BigNumber(nativeReward.amount).plus(acc)
        },
        new BigNumber(0),
      )
      return _totalRewards.lt(0.00001)
    }
    return !totalRewards || new BigNumber(totalRewards).lt(0.00001)
  }, [
    activeChain,
    activeStakingDenom?.coinMinimalDenom,
    activeWallet?.walletType,
    chainClaimRewards?.rewards?.result?.rewards,
    chainDelegations?.delegationInfo?.delegations,
    totalRewards,
  ])

  const formattedRewardAmount = useMemo(() => {
    const nativeTokenReward = rewards?.total?.find(
      (token) => token.denom === activeStakingDenom?.coinMinimalDenom,
    )
    if (totalRewardsDollarAmt && new BigNumber(totalRewardsDollarAmt).gt(0)) {
      return hideAssetsStore.formatHideBalance(formatCurrency(new BigNumber(totalRewardsDollarAmt)))
    }

    const rewardsCount = rewards?.total?.length ?? 0
    return hideAssetsStore.formatHideBalance(
      `${formatTokenAmount(nativeTokenReward?.amount ?? '', activeStakingDenom?.coinDenom)} ${
        rewardsCount > 1 ? `+${rewardsCount - 1} more` : ''
      }`,
    )
  }, [activeStakingDenom, formatCurrency, rewards, totalRewardsDollarAmt])

  return (
    <div className='flex flex-col w-full bg-secondary-100 rounded-2xl p-5 gap-y-6'>
      <div className='flex gap-x-2 [&>*]:flex-1'>
        <AmountCard title='Deposited Amount' loading={loadingDelegations}>
          <div className='flex flex-col'>
            <span className='font-bold text-[18px]'>
              {formattedCurrencyAmountDelegation &&
                hideAssetsStore.formatHideBalance(formattedCurrencyAmountDelegation)}
            </span>
            <span className='text-sm text-muted-foreground'>
              ({hideAssetsStore.formatHideBalance(totalDelegationAmount ?? '-')})
            </span>
          </div>
        </AmountCard>

        <AmountCard title='Total Earnings' loading={loadingRewards}>
          <span
            className={cn('font-bold text-[18px]', formattedRewardAmount && 'text-accent-success')}
          >
            {formattedRewardAmount || '-'}
          </span>
        </AmountCard>
      </div>

      <div className='flex gap-x-4 [&>*]:flex-1'>
        <Button
          size='md'
          onClick={() => {
            const state: StakeInputPageState = {
              mode: 'DELEGATE',
              forceChain: activeChain,
              forceNetwork: activeNetwork,
            }
            sessionStorage.setItem('navigate-stake-input-state', JSON.stringify(state))
            navigate('/stake/input', {
              state,
            })
          }}
        >
          Stake
        </Button>
        <Button
          variant='secondary'
          size='md'
          className='bg-secondary-350 disabled:bg-secondary-350 hover:bg-secondary-300'
          onClick={onClaim}
          disabled={isClaimDisabled}
        >
          Claim
        </Button>
      </div>
    </div>
  )
})

export default StakeAmountCard
