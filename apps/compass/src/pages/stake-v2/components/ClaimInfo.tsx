import {
  formatTokenAmount,
  SelectedNetwork,
  useActiveChain,
  useActiveStakingDenom,
  useSelectedNetwork,
  useStaking,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import BigNumber from 'bignumber.js'
import BottomModal from 'components/bottom-modal'
import { Button } from 'components/ui/button'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { hideAssetsStore } from 'stores/hide-assets-store'
import {
  claimRewardsStore,
  delegationsStore,
  unDelegationsStore,
  validatorsStore,
} from 'stores/stake-store'

interface ClaimInfoProps {
  isOpen: boolean
  onClose: () => void
  onClaim: () => void
  onClaimAndStake: () => void
  forceChain?: SupportedChain
  forceNetwork?: SelectedNetwork
}

const ClaimCard = (props: {
  titleAmount: string
  secondaryAmount: string
  button: React.ReactNode
}) => {
  return (
    <div className='flex gap-2 items-center justify-between bg-secondary-100 p-6 rounded-xl'>
      <div className='flex flex-col gap-1'>
        <span className='text-lg font-bold'>{props.titleAmount}</span>
        <span className='text-sm text-muted-foreground'>{props.secondaryAmount}</span>
      </div>

      {props.button}
    </div>
  )
}

const ClaimInfo = observer(
  ({ isOpen, onClose, onClaim, onClaimAndStake, forceChain, forceNetwork }: ClaimInfoProps) => {
    const _activeChain = useActiveChain()
    const activeChain = useMemo(() => forceChain || _activeChain, [forceChain, _activeChain])

    const _activeNetwork = useSelectedNetwork()
    const activeNetwork = useMemo(
      () => forceNetwork || _activeNetwork,
      [forceNetwork, _activeNetwork],
    )

    const [formatCurrency] = useFormatCurrency()

    const denoms = rootDenomsStore.allDenoms
    const chainDelegations = delegationsStore.delegationsForChain(activeChain)
    const chainValidators = validatorsStore.validatorsForChain(activeChain)
    const chainUnDelegations = unDelegationsStore.unDelegationsForChain(activeChain)
    const chainClaimRewards = claimRewardsStore.claimRewardsForChain(activeChain)

    const [activeStakingDenom] = useActiveStakingDenom(denoms, activeChain, activeNetwork)
    const { totalRewardsDollarAmt, rewards } = useStaking(
      denoms,
      chainDelegations,
      chainValidators,
      chainUnDelegations,
      chainClaimRewards,
      activeChain,
      activeNetwork,
    )

    const nativeTokenReward = useMemo(() => {
      if (rewards) {
        return rewards.total?.find((token) => token.denom === activeStakingDenom?.coinMinimalDenom)
      }
    }, [activeStakingDenom?.coinMinimalDenom, rewards])

    const isClaimAndStakeDisabled = useMemo(
      () => !nativeTokenReward || new BigNumber(nativeTokenReward.amount).lt(0.00001),
      [nativeTokenReward],
    )

    const formattedNativeTokenReward = useMemo(() => {
      return hideAssetsStore.formatHideBalance(
        formatTokenAmount(nativeTokenReward?.amount ?? '', activeStakingDenom?.coinDenom),
      )
    }, [activeStakingDenom?.coinDenom, nativeTokenReward?.amount])

    const nativeRewardTitle = useMemo(() => {
      if (new BigNumber(nativeTokenReward?.currencyAmount ?? '').gt(0)) {
        return hideAssetsStore.formatHideBalance(
          formatCurrency(new BigNumber(nativeTokenReward?.currencyAmount ?? '')),
        )
      } else {
        return formattedNativeTokenReward
      }
    }, [formatCurrency, formattedNativeTokenReward, nativeTokenReward?.currencyAmount])

    const nativeRewardSubtitle = useMemo(() => {
      if (new BigNumber(nativeTokenReward?.currencyAmount ?? '').gt(0)) {
        return formattedNativeTokenReward
      }
      return ''
    }, [formattedNativeTokenReward, nativeTokenReward?.currencyAmount])

    const formattedTokenReward = useMemo(() => {
      const rewardCount = rewards?.total?.length ?? 0
      return hideAssetsStore.formatHideBalance(
        `${formatTokenAmount(nativeTokenReward?.amount ?? '', activeStakingDenom?.coinDenom)} ${
          rewardCount > 1 ? `+${rewardCount - 1} more` : ''
        }`,
      )
    }, [activeStakingDenom?.coinDenom, nativeTokenReward?.amount, rewards?.total.length])

    const totalRewardTitle = useMemo(() => {
      if (totalRewardsDollarAmt && new BigNumber(totalRewardsDollarAmt).gt(0)) {
        return hideAssetsStore.formatHideBalance(
          formatCurrency(new BigNumber(totalRewardsDollarAmt)),
        )
      } else {
        return formattedTokenReward
      }
    }, [formatCurrency, formattedTokenReward, totalRewardsDollarAmt])

    const totalRewardSubtitle = useMemo(() => {
      if (totalRewardsDollarAmt && new BigNumber(totalRewardsDollarAmt).gt(0)) {
        return formattedTokenReward
      }
      return ''
    }, [formattedTokenReward, totalRewardsDollarAmt])

    return (
      <BottomModal
        isOpen={isOpen}
        onClose={onClose}
        title='Claim rewards'
        className='flex flex-col gap-8 mt-4'
      >
        <div className='flex flex-col gap-4 w-full'>
          <span className='text-muted-foreground text-sm'>{`Claim rewards on ${activeStakingDenom.coinDenom}`}</span>
          <ClaimCard
            titleAmount={totalRewardTitle}
            secondaryAmount={totalRewardSubtitle}
            button={
              <Button
                onClick={onClaim}
                variant='secondary'
                size='md'
                className='w-[7.5rem] bg-secondary-350 disabled:bg-secondary-300 hover:bg-secondary-300'
              >
                Claim
              </Button>
            }
          />
        </div>
        <div className='flex flex-col gap-4 w-full'>
          <span className='text-muted-foreground text-sm'>Auto stake the rewards earned</span>
          <ClaimCard
            titleAmount={nativeRewardTitle}
            secondaryAmount={nativeRewardSubtitle}
            button={
              <Button
                size='md'
                className='w-[7.5rem] whitespace-nowrap'
                onClick={onClaimAndStake}
                disabled={isClaimAndStakeDisabled}
              >
                Claim & stake
              </Button>
            }
          />
        </div>
      </BottomModal>
    )
  },
)

export default ClaimInfo
