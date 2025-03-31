import {
  formatTokenAmount,
  useActiveChain,
  useActiveStakingDenom,
  useActiveWallet,
  useSelectedNetwork,
  useStaking,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import BigNumber from 'bignumber.js'
import { Button } from 'components/ui/button'
import { Skeleton } from 'components/ui/skeleton'
import { motion } from 'framer-motion'
import { AnimatePresence } from 'framer-motion'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { hideAssetsStore } from 'stores/hide-assets-store'
import {
  claimRewardsStore,
  delegationsStore,
  unDelegationsStore,
  validatorsStore,
} from 'stores/stake-store'
import { cn } from 'utils/cn'
import { transition150 } from 'utils/motion-variants'
import { opacityFadeInOut } from 'utils/motion-variants'

import { StakeInputPageState } from '../StakeInputPage'

interface StakeAmountCardProps {
  onClaim: () => void
}

const StakeAmountCard = observer(({ onClaim }: StakeAmountCardProps) => {
  const activeChain = useActiveChain()
  const activeNetwork = useSelectedNetwork()

  const denoms = rootDenomsStore.allDenoms
  const chainDelegations = delegationsStore.delegationsForChain(activeChain)
  const chainValidators = validatorsStore.validatorsForChain(activeChain)
  const chainUnDelegations = unDelegationsStore.unDelegationsForChain(activeChain)
  const chainClaimRewards = claimRewardsStore.claimRewardsForChain(activeChain)

  const {
    currencyAmountDelegation,
    totalDelegationAmount,
    rewards,
    totalRewards,
    totalRewardsDollarAmt,
    loadingRewards,
    loadingDelegations,
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
  const [activeStakingDenom] = useActiveStakingDenom(denoms, activeChain, activeNetwork)
  const activeWallet = useActiveWallet()

  const formattedCurrencyAmountDelegation = useMemo(() => {
    if (currencyAmountDelegation && new BigNumber(currencyAmountDelegation).gt(0)) {
      return formatCurrency(new BigNumber(currencyAmountDelegation))
    }
  }, [currencyAmountDelegation, formatCurrency])

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

  const isClaimDisabled = useMemo(() => {
    if (activeChain === 'evmos' && activeWallet?.walletType === WALLETTYPE.LEDGER) {
      return true
    }
    return !totalRewards || new BigNumber(totalRewards).lt(0.00001)
  }, [activeChain, activeWallet?.walletType, totalRewards])

  return (
    <div className='flex flex-col w-full bg-secondary-100 rounded-2xl p-5 gap-y-6'>
      <div className='flex gap-x-2 [&>*]:flex-1'>
        <AmountCard title='Deposited Amount' loading={loadingDelegations}>
          <span className='font-bold text-lg'>
            {formattedCurrencyAmountDelegation &&
              hideAssetsStore.formatHideBalance(formattedCurrencyAmountDelegation)}
          </span>
          <span className='text-sm text-muted-foreground'>
            ({hideAssetsStore.formatHideBalance(totalDelegationAmount ?? '-')})
          </span>
        </AmountCard>

        <AmountCard title='Total Earnings' loading={loadingRewards}>
          <span className={cn('font-bold text-lg', formattedRewardAmount && 'text-accent-success')}>
            {formattedRewardAmount || '-'}
          </span>
        </AmountCard>
      </div>

      <div className='flex gap-x-4 [&>*]:flex-1'>
        <Button size='md' asChild>
          <Link
            to='/stake/input'
            state={
              {
                mode: 'DELEGATE',
              } as StakeInputPageState
            }
          >
            Stake
          </Link>
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

export const AmountCard = (props: {
  loading: boolean
  title: string
  children: React.ReactNode
}) => {
  return (
    <div className='flex flex-col gap-2 justify-between'>
      <span className='text-xs text-muted-foreground'>{props.title}</span>
      <AnimatePresence exitBeforeEnter>
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
