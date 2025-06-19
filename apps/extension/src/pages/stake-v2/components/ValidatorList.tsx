import {
  formatTokenAmount,
  SelectedNetwork,
  sliceWord,
  STAKE_MODE,
  useActiveChain,
  useActiveStakingDenom,
  useSelectedNetwork,
  useStaking,
  useValidatorImage,
} from '@leapwallet/cosmos-wallet-hooks'
import { Delegation, SupportedChain, Validator } from '@leapwallet/cosmos-wallet-sdk'
import {
  ClaimRewardsStore,
  DelegationsStore,
  RootBalanceStore,
  RootDenomsStore,
  UndelegationsStore,
  ValidatorsStore,
} from '@leapwallet/cosmos-wallet-store'
import BigNumber from 'bignumber.js'
import BottomModal from 'components/new-bottom-modal'
import { ValidatorItemSkeleton } from 'components/Skeletons/StakeSkeleton'
import { Button } from 'components/ui/button'
import currency from 'currency.js'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import useQuery from 'hooks/useQuery'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { hideAssetsStore } from 'stores/hide-assets-store'
import { imgOnError } from 'utils/imgOnError'
import { isSidePanel } from 'utils/isSidePanel'

import { StakeInputPageState } from '../StakeInputPage'
import ReviewValidatorClaimTx from './ReviewValidatorClaimTx'
import { ValidatorCardView } from './ValidatorCardView'

interface StakedValidatorDetailsProps {
  isOpen: boolean
  onClose: () => void
  onSwitchValidator: () => void
  onUnstake: () => void
  validator?: Validator
  delegation?: Delegation
  rootDenomsStore: RootDenomsStore
  delegationsStore: DelegationsStore
  validatorsStore: ValidatorsStore
  unDelegationsStore: UndelegationsStore
  claimRewardsStore: ClaimRewardsStore
  forceChain?: SupportedChain
  forceNetwork?: SelectedNetwork
  onValidatorClaim: () => void
}

const StakedValidatorDetails = observer(
  ({
    isOpen,
    onClose,
    onSwitchValidator,
    onUnstake,
    validator,
    delegation,
    rootDenomsStore,
    delegationsStore,
    validatorsStore,
    unDelegationsStore,
    claimRewardsStore,
    forceChain,
    forceNetwork,
    onValidatorClaim,
  }: StakedValidatorDetailsProps) => {
    const _activeChain = useActiveChain()
    const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain])

    const _activeNetwork = useSelectedNetwork()
    const activeNetwork = useMemo(
      () => forceNetwork || _activeNetwork,
      [_activeNetwork, forceNetwork],
    )

    const denoms = rootDenomsStore.allDenoms
    const chainDelegations = delegationsStore.delegationsForChain(activeChain)
    const chainValidators = validatorsStore.validatorsForChain(activeChain)
    const chainUnDelegations = unDelegationsStore.unDelegationsForChain(activeChain)
    const chainClaimRewards = claimRewardsStore.claimRewardsForChain(activeChain)

    const [activeStakingDenom] = useActiveStakingDenom(denoms, activeChain, activeNetwork)
    const [formatCurrency] = useFormatCurrency()
    const { network } = useStaking(
      denoms,
      chainDelegations,
      chainValidators,
      chainUnDelegations,
      chainClaimRewards,
      activeChain,
      activeNetwork,
    )

    const aprs = network?.validatorAprs
    const { data: validatorImage } = useValidatorImage(validator?.image ? undefined : validator)
    const imageUrl = validator?.image || validatorImage || Images.Misc.Validator

    const [validatorRewardCurrency, validatorRewardToken, validatorRewardTotal] = useMemo(() => {
      const validatorRewards = chainClaimRewards?.rewards?.rewards?.[validator?.address ?? '']
      const _validatorRewardCurrency = validatorRewards?.reward.reduce(
        (acc, reward) => acc.plus(new BigNumber(reward.currencyAmount ?? '')),
        new BigNumber(0),
      )
      const rewardCount = validatorRewards?.reward.length ?? 0
      const nativeReward = validatorRewards?.reward.find(
        (r) => r.denom === activeStakingDenom?.coinMinimalDenom,
      )
      const _validatorRewardToken =
        formatTokenAmount(nativeReward?.amount ?? '', activeStakingDenom?.coinDenom) +
        `${rewardCount > 1 ? ` +${rewardCount - 1} more` : ''}`

      const _validatorRewardTotal = validatorRewards?.reward.reduce(
        (acc, reward) => acc.plus(new BigNumber(reward.amount)),
        new BigNumber(0),
      )
      return [_validatorRewardCurrency, _validatorRewardToken, _validatorRewardTotal]
    }, [activeStakingDenom, chainClaimRewards, validator])

    const amountTitleText = useMemo(() => {
      const currencyAmount = new BigNumber(delegation?.balance.currencyAmount ?? '')
      if (currencyAmount.gt(0)) {
        return hideAssetsStore.formatHideBalance(formatCurrency(currencyAmount))
      }

      return hideAssetsStore.formatHideBalance(
        delegation?.balance.formatted_amount || delegation?.balance.amount || '',
      )
    }, [delegation, formatCurrency])

    const amountSubtitleText = useMemo(() => {
      const currencyAmount = new BigNumber(delegation?.balance.currencyAmount ?? '')
      if (currencyAmount.gt(0)) {
        return hideAssetsStore.formatHideBalance(
          delegation?.balance.formatted_amount || delegation?.balance.amount || '',
        )
      }

      return ''
    }, [delegation])

    return (
      <BottomModal
        fullScreen
        isOpen={isOpen}
        onClose={onClose}
        title='Validator details'
        className='!p-0 relative h-full'
        headerClassName='border-secondary-200 border-b'
      >
        <div className='p-6 flex flex-col gap-4 h-[calc(100%-84px)] overflow-y-scroll'>
          <div className='flex w-full gap-4 items-center'>
            <img
              width={40}
              height={40}
              className='rounded-full'
              src={imageUrl}
              onError={imgOnError(Images.Misc.Validator)}
            />

            <span className='font-bold text-lg'>
              {sliceWord(
                validator?.moniker ?? '',
                isSidePanel()
                  ? 18 + Math.floor(((Math.min(window.innerWidth, 400) - 320) / 81) * 7)
                  : 10,
                3,
              )}
            </span>
          </div>

          <div className='flex flex-col gap-4 p-5 bg-secondary-100 rounded-xl'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground !leading-[19px]'>Total Staked</span>

              <span className='font-bold text-sm !leading-[19px]'>
                {currency(validator?.delegations?.total_tokens_display ?? validator?.tokens ?? '', {
                  symbol: '',
                  precision: 0,
                }).format()}
              </span>
            </div>

            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground !leading-[19px]'>Commission</span>

              <span className='font-bold text-sm !leading-[19px]'>
                {validator?.commission?.commission_rates?.rate
                  ? `${new BigNumber(validator?.commission?.commission_rates?.rate ?? '')
                      .multipliedBy(100)
                      .toFixed(0)}%`
                  : 'N/A'}
              </span>
            </div>

            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground !leading-[19px]'>APR</span>

              <span className='font-bold text-sm text-accent-success !leading-[19px]'>
                {aprs &&
                  (aprs[validator?.address ?? '']
                    ? `${currency(aprs[validator?.address ?? ''] * 100, {
                        precision: 2,
                        symbol: '',
                      }).format()}%`
                    : 'N/A')}
              </span>
            </div>
          </div>

          <div className='mt-3 flex flex-col gap-3'>
            <span className='text-sm text-muted-foreground'>Your deposited amount</span>
            <div className='p-5 bg-secondary-100 rounded-xl'>
              <span className='font-bold text-[18px]'>{amountTitleText} </span>
              <span className='text-muted-foreground text-sm'>({amountSubtitleText})</span>
            </div>
          </div>

          <div className='mt-3 flex flex-col gap-3'>
            <span className='text-sm text-muted-foreground'>Your Rewards</span>
            <div className='flex items-center justify-between gap-4 p-5 bg-secondary-100 rounded-xl'>
              <span className='flex flex-col'>
                <span className='font-bold text-[18px]'>
                  {formatCurrency(validatorRewardCurrency ?? new BigNumber(''))}
                </span>
                <span className='text-muted-foreground text-sm'>{validatorRewardToken}</span>
              </span>

              <Button
                size='md'
                variant={'secondary'}
                className='bg-secondary-350 disabled:bg-secondary-300 h-fit w-[121px]'
                disabled={!validatorRewardTotal || validatorRewardTotal.lt(0.00001)}
                onClick={onValidatorClaim}
              >
                Claim
              </Button>
            </div>
          </div>
        </div>

        <div className='flex gap-x-3 bg-secondary-200 w-full [&>*]:flex-1 mt-auto absolute bottom-0 py-4 px-5'>
          <Button onClick={onSwitchValidator}>Switch validator</Button>

          <Button variant={'mono'} onClick={onUnstake}>
            Unstake
          </Button>
        </div>
      </BottomModal>
    )
  },
)

interface ValidatorCardProps {
  validator: Validator
  delegation: Delegation
  onClick: (delegation: Delegation) => void
}

const ValidatorCard = observer(({ validator, delegation, onClick }: ValidatorCardProps) => {
  const [formatCurrency] = useFormatCurrency()
  const { data: validatorImage } = useValidatorImage(validator?.image ? undefined : validator)
  const imageUrl = validator?.image || validatorImage || Images.Misc.Validator

  const amountTitleText = useMemo(() => {
    if (new BigNumber(delegation.balance.currencyAmount ?? '').gt(0)) {
      return hideAssetsStore.formatHideBalance(
        formatCurrency(new BigNumber(delegation.balance.currencyAmount ?? '')),
      )
    } else {
      return hideAssetsStore.formatHideBalance(
        delegation.balance.formatted_amount ?? delegation.balance.amount,
      )
    }
  }, [
    delegation.balance.amount,
    delegation.balance.currencyAmount,
    delegation.balance.formatted_amount,
    formatCurrency,
  ])

  const amountSubtitleText = useMemo(() => {
    if (new BigNumber(delegation.balance.currencyAmount ?? '').gt(0)) {
      return hideAssetsStore.formatHideBalance(
        delegation.balance.formatted_amount ?? delegation.balance.amount,
      )
    }
    return ''
  }, [
    delegation.balance.amount,
    delegation.balance.currencyAmount,
    delegation.balance.formatted_amount,
  ])

  const handleValidatorCardClick = useCallback(() => {
    onClick(delegation)
  }, [onClick, delegation])

  return (
    <ValidatorCardView
      onClick={handleValidatorCardClick}
      imgSrc={imageUrl}
      moniker={validator.moniker}
      titleAmount={amountTitleText}
      subAmount={amountSubtitleText}
      jailed={validator.jailed}
    />
  )
})

type ValidatorListProps = {
  rootDenomsStore: RootDenomsStore
  rootBalanceStore: RootBalanceStore
  delegationsStore: DelegationsStore
  validatorsStore: ValidatorsStore
  unDelegationsStore: UndelegationsStore
  claimRewardsStore: ClaimRewardsStore
  forceChain?: SupportedChain
  forceNetwork?: SelectedNetwork
  setClaimTxMode: (mode: STAKE_MODE | 'CLAIM_AND_DELEGATE' | null) => void
}

const ValidatorList = observer(
  ({
    rootDenomsStore,
    delegationsStore,
    validatorsStore,
    unDelegationsStore,
    claimRewardsStore,
    forceChain,
    forceNetwork,
    rootBalanceStore,
    setClaimTxMode,
  }: ValidatorListProps) => {
    const navigate = useNavigate()
    const [showStakedValidatorDetails, setShowStakedValidatorDetails] = useState(false)
    const [showReviewValidatorClaimTx, setShowReviewValidatorClaimTx] = useState(false)
    const [selectedDelegation, setSelectedDelegation] = useState<Delegation | undefined>()

    const _activeChain = useActiveChain()
    const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain])

    const _activeNetwork = useSelectedNetwork()
    const activeNetwork = useMemo(
      () => forceNetwork || _activeNetwork,
      [_activeNetwork, forceNetwork],
    )

    const denoms = rootDenomsStore.allDenoms
    const chainDelegations = delegationsStore.delegationsForChain(activeChain)
    const chainValidators = validatorsStore.validatorsForChain(activeChain)
    const chainUnDelegations = unDelegationsStore.unDelegationsForChain(activeChain)
    const chainClaimRewards = claimRewardsStore.claimRewardsForChain(activeChain)

    const { delegations, loadingNetwork, loadingDelegations } = useStaking(
      denoms,
      chainDelegations,
      chainValidators,
      chainUnDelegations,
      chainClaimRewards,
      activeChain,
      activeNetwork,
    )

    const validators = useMemo(
      () =>
        chainValidators.validatorData.validators?.reduce((acc, validator) => {
          acc[validator.address] = validator
          return acc
        }, {} as Record<string, Validator>),
      [chainValidators.validatorData.validators],
    )

    const isLoading = loadingNetwork || loadingDelegations

    const query = useQuery()
    const paramValidatorAddress = query.get('validatorAddress') ?? undefined
    const paramAction = query.get('action') ?? undefined

    useEffect(() => {
      if (paramValidatorAddress && paramAction !== 'DELEGATE') {
        const delegation = Object.values(delegations ?? {}).find(
          (d) => d.delegation.validator_address === paramValidatorAddress,
        )

        if (delegation) {
          setSelectedDelegation(delegation as Delegation)
          setShowStakedValidatorDetails(true)
        }
      }
    }, [delegations, paramAction, paramValidatorAddress])

    const [activeValidatorDelegations, inactiveValidatorDelegations] = useMemo(() => {
      const _sortedDelegations = Object.values(delegations ?? {}).sort(
        (a, b) => parseFloat(b.balance.amount) - parseFloat(a.balance.amount),
      )

      const _activeValidatorDelegations = _sortedDelegations.filter((d) => {
        const validator = validators?.[d?.delegation?.validator_address]
        if (!validator || validator.active === false) return false
        return true
      })

      const _inactiveValidatorDelegations = _sortedDelegations.filter((d) => {
        const validator = validators?.[d?.delegation?.validator_address]
        if (!validator || validator.active !== false) return false
        return true
      })

      return [_activeValidatorDelegations, _inactiveValidatorDelegations]
    }, [delegations, validators])

    const onValidatorClaim = useCallback(() => {
      setShowStakedValidatorDetails(false)
      setShowReviewValidatorClaimTx(true)
    }, [])

    const handleValidatorCardClick = useCallback((delegation: Delegation) => {
      setSelectedDelegation(delegation)
      setShowStakedValidatorDetails(true)
    }, [])

    return (
      <div className='flex flex-col w-full gap-7'>
        {isLoading && (
          <div className='flex flex-col w-full gap-4'>
            <div className='flex justify-between'>
              <span className='text-xs text-muted-foreground'>Validator</span>
              <span className='text-xs text-muted-foreground'>Amount Staked</span>
            </div>

            <ValidatorItemSkeleton count={5} />
          </div>
        )}

        {!isLoading && validators && activeValidatorDelegations.length > 0 && (
          <div className='flex flex-col w-full gap-4'>
            <div className='flex justify-between'>
              <span className='text-xs text-muted-foreground'>Validator</span>
              <span className='text-xs text-muted-foreground'>Amount Staked</span>
            </div>

            <div className='flex flex-col w-full gap-4'>
              {activeValidatorDelegations.map((d) => {
                const validator = validators?.[d?.delegation?.validator_address]
                return (
                  <ValidatorCard
                    key={validator.address}
                    delegation={d}
                    validator={validator}
                    onClick={handleValidatorCardClick}
                  />
                )
              })}
            </div>
          </div>
        )}

        {!isLoading && validators && inactiveValidatorDelegations.length > 0 && (
          <div className='flex flex-col w-full gap-4'>
            <div className='flex justify-between'>
              <span className='text-xs text-muted-foreground'>Inactive validator</span>
              <span className='text-xs text-muted-foreground'>Amount Staked</span>
            </div>

            <div className='flex flex-col w-full gap-4'>
              {inactiveValidatorDelegations.map((d) => {
                const validator = validators?.[d?.delegation?.validator_address]
                return (
                  <ValidatorCard
                    key={validator?.address}
                    delegation={d}
                    validator={validator}
                    onClick={handleValidatorCardClick}
                  />
                )
              })}
            </div>
          </div>
        )}

        <StakedValidatorDetails
          isOpen={!!(showStakedValidatorDetails && selectedDelegation)}
          onClose={() => setShowStakedValidatorDetails(false)}
          onSwitchValidator={() => {
            const state = {
              mode: 'REDELEGATE',
              fromValidator: validators[selectedDelegation?.delegation.validator_address || ''],
              delegation: selectedDelegation,
              forceChain: activeChain,
              forceNetwork: activeNetwork,
            } as StakeInputPageState

            sessionStorage.setItem('navigate-stake-input-state', JSON.stringify(state))
            navigate('/stake/input', {
              state,
            })
          }}
          onUnstake={() => {
            const state = {
              mode: 'UNDELEGATE',
              toValidator: validators[selectedDelegation?.delegation.validator_address || ''],
              delegation: selectedDelegation,
              forceChain: activeChain,
              forceNetwork: activeNetwork,
            } as StakeInputPageState

            sessionStorage.setItem('navigate-stake-input-state', JSON.stringify(state))
            navigate('/stake/input', {
              state,
            })
          }}
          validator={validators?.[selectedDelegation?.delegation?.validator_address || '']}
          delegation={selectedDelegation}
          rootDenomsStore={rootDenomsStore}
          delegationsStore={delegationsStore}
          validatorsStore={validatorsStore}
          unDelegationsStore={unDelegationsStore}
          claimRewardsStore={claimRewardsStore}
          forceChain={activeChain}
          forceNetwork={activeNetwork}
          onValidatorClaim={onValidatorClaim}
        />

        {showReviewValidatorClaimTx && selectedDelegation && (
          <ReviewValidatorClaimTx
            isOpen={showReviewValidatorClaimTx}
            onClose={() => setShowReviewValidatorClaimTx(false)}
            validator={validators?.[selectedDelegation.delegation.validator_address]}
            selectedDelegation={selectedDelegation}
            forceChain={activeChain}
            forceNetwork={activeNetwork}
            setClaimTxMode={setClaimTxMode}
          />
        )}
      </div>
    )
  },
)

export default ValidatorList
