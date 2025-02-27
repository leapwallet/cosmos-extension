/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  formatTokenAmount,
  SelectedNetwork,
  sliceWord,
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
import { Buttons, ThemeName, useTheme } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import BottomModal from 'components/bottom-modal'
import { ValidatorItemSkeleton } from 'components/Skeletons/StakeSkeleton'
import Text from 'components/text'
import { TokenImageWithFallback } from 'components/token-image-with-fallback'
import currency from 'currency.js'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import useQuery from 'hooks/useQuery'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { epochIntervalStore } from 'stores/epoch-interval-store'
import { stakeEpochStore } from 'stores/epoch-store'
import { hideAssetsStore } from 'stores/hide-assets-store'
import { Colors } from 'theme/colors'
import { hex2rgba } from 'utils/hextorgba'
import { imgOnError } from 'utils/imgOnError'
import { isCompassWallet } from 'utils/isCompassWallet'
import { isSidePanel } from 'utils/isSidePanel'

import { StakeInputPageState } from '../StakeInputPage'
import ReviewValidatorClaimTx from './ReviewValidatorClaimTx'

interface StakedValidatorDetailsProps {
  isOpen: boolean
  onClose: () => void
  onSwitchValidator: () => void
  onUnstake: () => void
  validator: Validator
  delegation: Delegation
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
    const { network, rewards } = useStaking(
      denoms,
      chainDelegations,
      chainValidators,
      chainUnDelegations,
      chainClaimRewards,
      activeChain,
      activeNetwork,
    )

    const aprs = network?.validatorAprs
    const { data: imageUrl } = useValidatorImage(validator)
    const { theme } = useTheme()

    const [validatorRewardCurrency, validatorRewardToken, validatorRewardTotal] = useMemo(() => {
      const validatorRewards = chainClaimRewards.rewards?.rewards?.[validator?.address ?? '']
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
    }, [
      activeStakingDenom?.coinDenom,
      activeStakingDenom?.coinMinimalDenom,
      chainClaimRewards.rewards.rewards,
      validator?.address,
    ])

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

    return (
      <BottomModal
        isOpen={isOpen}
        onClose={onClose}
        title='Validator Details'
        closeOnBackdropClick={true}
        className='p-6'
      >
        <div className='flex flex-col w-full gap-y-4'>
          <div className='flex w-full gap-x-2 items-center'>
            <img
              width={24}
              height={24}
              className='rounded-full'
              src={imageUrl ?? validator.image ?? Images.Misc.Validator}
              onError={imgOnError(Images.Misc.Validator)}
            />

            <Text size='lg' color='text-black-100 dark:text-white-100' className='font-bold'>
              {sliceWord(
                validator.moniker,
                isSidePanel()
                  ? 18 + Math.floor(((Math.min(window.innerWidth, 400) - 320) / 81) * 7)
                  : 10,
                3,
              )}
            </Text>
          </div>

          <div className='flex w-full rounded-lg p-3 bg-white-100 dark:bg-gray-950 border  border-gray-100 dark:border-gray-850'>
            <div className='flex flex-col items-center gap-y-0.5 w-1/3'>
              <Text color='text-gray-700 dark:text-gray-400' size='xs' className='font-medium'>
                Total Staked
              </Text>

              <Text color='text-black-100 dark:text-white-100' size='sm' className='font-bold'>
                {currency(validator?.delegations?.total_tokens_display ?? validator.tokens ?? '', {
                  symbol: '',
                  precision: 0,
                }).format()}
              </Text>
            </div>

            <div className='w-px h-10 bg-gray-100 dark:bg-gray-850' />
            <div className='flex flex-col items-center gap-y-0.5 w-1/3'>
              <Text color='text-gray-700 dark:text-gray-400' size='xs' className='font-medium'>
                Commission
              </Text>

              <Text color='text-black-100 dark:text-white-100' size='sm' className='font-bold'>
                {validator?.commission?.commission_rates?.rate
                  ? `${new BigNumber(validator.commission.commission_rates.rate)
                      .multipliedBy(100)
                      .toFixed(0)}%`
                  : 'N/A'}
              </Text>
            </div>

            <div className='w-px h-10 bg-gray-100 dark:bg-gray-850' />
            <div className='flex flex-col items-center gap-y-0.5 w-1/3'>
              <Text color='text-gray-700 dark:text-gray-400' size='xs' className='font-medium'>
                APR
              </Text>

              <Text color='text-black-100 dark:text-white-100' size='sm' className='font-bold'>
                {aprs &&
                  (aprs[validator?.address]
                    ? `${currency(aprs[validator?.address] * 100, {
                        precision: 2,
                        symbol: '',
                      }).format()}%`
                    : 'N/A')}
              </Text>
            </div>
          </div>

          <div className='w-full p-4 bg-white-100 dark:bg-gray-950 rounded-lg'>
            <Text size='xs' color='text-gray-800 dark:text-gray-200' className='font-medium'>
              Your deposited amount
            </Text>

            <div className='flex gap-x-4 mt-4'>
              <TokenImageWithFallback
                assetImg={activeStakingDenom.icon}
                text={activeStakingDenom.coinDenom}
                altText={activeStakingDenom.coinDenom}
                imageClassName='w-9 h-9 rounded-full'
                containerClassName='w-9 h-9 bg-gray-100 dark:bg-gray-850'
                textClassName='text-[10px] !leading-[14px]'
              />
              <div className='flex flex-col justify-center'>
                <Text color='text-black-100 dark:text-white-100' size='sm' className='font-bold'>
                  {amountTitleText}
                </Text>

                <Text color='text-gray-700 dark:text-gray-400' size='xs' className='font-medium'>
                  {amountSubtitleText}
                </Text>
              </div>
            </div>
          </div>

          {delegation.status !== 'delegation_pending_epoch_cycle' &&
            delegation.status !== 're_delegation_pending_epoch_cycle' && (
              <>
                <div className='flex justify-between items-center w-full p-4 bg-white-100 dark:bg-gray-950 rounded-lg'>
                  <div className='flex flex-col gap-y-0.5'>
                    <Text
                      size='sm'
                      color='text-black-100 dark:text-white-100'
                      className='font-bold'
                    >
                      Your Rewards
                    </Text>

                    <div className='flex gap-x-2 justify-center'>
                      <Text
                        color='text-gray-700 dark:text-gray-400'
                        size='xs'
                        className='font-medium'
                      >
                        {formatCurrency(validatorRewardCurrency ?? new BigNumber(''))}
                      </Text>
                      <div className='w-px h-4 bg-gray-400 dark:bg-gray-700' />
                      <Text
                        color='text-gray-700 dark:text-gray-400'
                        size='xs'
                        className='font-medium'
                      >
                        {validatorRewardToken}
                      </Text>
                    </div>
                  </div>
                  <button
                    disabled={!validatorRewardTotal || validatorRewardTotal.lt(0.00001)}
                    onClick={onValidatorClaim}
                    className={`hover:cursor-pointer rounded-[14px] px-3 py-1 ${
                      (!validatorRewardTotal || validatorRewardTotal.lt(0.00001)) &&
                      'opacity-70 !cursor-not-allowed'
                    }`}
                    style={{
                      backgroundColor: hex2rgba(
                        isCompassWallet() ? Colors.compassPrimary : Colors.green600,
                        0.2,
                      ),
                    }}
                  >
                    <Text
                      size='xs'
                      className='font-bold'
                      style={{ color: isCompassWallet() ? Colors.compassPrimary : Colors.green500 }}
                    >
                      Claim
                    </Text>
                  </button>
                </div>

                <div className='flex gap-x-4 w-full'>
                  <Buttons.Generic
                    onClick={onSwitchValidator}
                    color={theme === ThemeName.DARK ? Colors.gray800 : Colors.gray200}
                    className={'flex-1 px-2'}
                    size='normal'
                  >
                    <Text color='dark:text-white-100 text-black-100'>Switch validator</Text>
                  </Buttons.Generic>

                  <Buttons.Generic
                    onClick={onUnstake}
                    color={Colors.red300}
                    className={'flex-1'}
                    size='normal'
                  >
                    <Text color='dark:text-white-100 text-white-100'>Unstake</Text>
                  </Buttons.Generic>
                </div>
              </>
            )}
        </div>
      </BottomModal>
    )
  },
)

interface ValidatorCardProps {
  validator: Validator
  delegation: Delegation
  status?: Delegation['status']
  onClick: (delegation: Delegation) => void
}

const ValidatorCard = observer(({ validator, delegation, onClick, status }: ValidatorCardProps) => {
  const [formatCurrency] = useFormatCurrency()
  const { data: imageUrl } = useValidatorImage(validator)

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
    <div
      onClick={handleValidatorCardClick}
      className='flex justify-between items-center px-4 py-3 bg-white-100 dark:bg-gray-950 cursor-pointer rounded-xl'
    >
      <div className='flex items-center w-full'>
        <img
          src={imageUrl ?? validator.image ?? Images.Misc.Validator}
          onError={imgOnError(Images.Misc.Validator)}
          width={28}
          height={28}
          className='mr-4 rounded-full'
        />

        <div className='flex justify-between items-center w-full'>
          <div className='flex flex-col items-start gap-y-1'>
            <Text
              size='sm'
              color='text-black-100 dark:text-white-100'
              className='font-bold  overflow-hidden'
            >
              {sliceWord(
                validator.moniker,
                isSidePanel()
                  ? 5 + Math.floor(((Math.min(window.innerWidth, 400) - 320) / 81) * 7)
                  : 10,
                3,
              )}
            </Text>

            {status === 'delegation_pending_epoch_cycle' ? (
              <Text size='xs' color='dark:text-yellow-500 text-yellow-600' className='font-medium'>
                Queued for staking in {epochIntervalStore.timeLeft}
              </Text>
            ) : status === 're_delegation_pending_epoch_cycle' ? (
              <Text size='xs' color='dark:text-yellow-500 text-yellow-600' className='font-medium'>
                Queued for restaking in {epochIntervalStore.timeLeft}
              </Text>
            ) : null}

            {validator.jailed && (
              <Text
                color='text-red-600 dark:text-red-300'
                className='font-bold text-[10px] px-1.5 py-0.5 rounded-[4px] bg-red-600 dark:bg-red-300 bg-opacity-10 dark:bg-opacity-10'
              >
                Jailed
              </Text>
            )}
          </div>

          <div className='flex flex-col items-end gap-y-0.5'>
            <Text
              size='sm'
              color='text-black-100 dark:text-white-100'
              className='font-bold text-right'
            >
              {amountTitleText}
            </Text>
            <Text
              size='xs'
              color='dark:text-gray-400 text-gray-700'
              className='font-medium text-right'
            >
              {amountSubtitleText}
            </Text>
          </div>
        </div>
      </div>
    </div>
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

    const [activeStakingDenom] = useActiveStakingDenom(denoms, activeChain, activeNetwork)

    const { delegations, loadingNetwork, loadingDelegations } = useStaking(
      denoms,
      chainDelegations,
      chainValidators,
      chainUnDelegations,
      chainClaimRewards,
      activeChain,
      activeNetwork,
    )

    const pendingDelegations = stakeEpochStore.getDelegationEpochMessages(activeStakingDenom)
    const pendingReDelegations = stakeEpochStore.getReDelegationEpochMessages(activeStakingDenom)

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
          (d: any) => d.delegation.validator_address === paramValidatorAddress,
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
      const allDelegations = [...pendingReDelegations, ...pendingDelegations, ..._sortedDelegations]

      const _activeValidatorDelegations = allDelegations.filter((d: any) => {
        const validator = validators?.[d?.delegation?.validator_address]
        if (!validator || validator.active === false) return false
        return true
      })

      const _inactiveValidatorDelegations = allDelegations.filter((d: any) => {
        const validator = validators?.[d?.delegation?.validator_address]
        if (!validator || validator.active !== false) return false
        return true
      })

      return [_activeValidatorDelegations, _inactiveValidatorDelegations]
    }, [delegations, pendingDelegations, pendingReDelegations, validators])

    const onValidatorClaim = useCallback(() => {
      setShowStakedValidatorDetails(false)
      setShowReviewValidatorClaimTx(true)
    }, [])

    const handleValidatorCardClick = useCallback((delegation: Delegation) => {
      setSelectedDelegation(delegation)
      setShowStakedValidatorDetails(true)
    }, [])

    return (
      <>
        {isLoading && <ValidatorItemSkeleton />}
        <div className='flex flex-col w-full gap-y-2'>
          {!isLoading && validators && activeValidatorDelegations.length > 0 && (
            <>
              <div className='flex justify-between'>
                <Text size='xs' color='text-gray-700 dark:text-gray-400'>
                  Validator
                </Text>
                <Text size='xs' color='text-gray-700 dark:text-gray-400'>
                  Amount Staked
                </Text>
              </div>

              {activeValidatorDelegations.map((d) => {
                const validator = validators?.[d?.delegation?.validator_address]
                return (
                  <ValidatorCard
                    key={validator.address}
                    delegation={d}
                    validator={validator}
                    status={d.status}
                    onClick={handleValidatorCardClick}
                  />
                )
              })}
            </>
          )}
          {!isLoading && validators && inactiveValidatorDelegations.length > 0 && (
            <>
              <div className='flex justify-between mt-2'>
                <Text size='xs' color='text-gray-700 dark:text-gray-400'>
                  Inactive validator
                </Text>
                <Text size='xs' color='text-gray-700 dark:text-gray-400'>
                  Amount Staked
                </Text>
              </div>

              {inactiveValidatorDelegations.map((d) => {
                const validator = validators[d?.delegation?.validator_address]
                return (
                  <ValidatorCard
                    key={validator.address}
                    delegation={d}
                    validator={validator}
                    onClick={handleValidatorCardClick}
                  />
                )
              })}
            </>
          )}
        </div>

        {showStakedValidatorDetails && selectedDelegation && (
          <StakedValidatorDetails
            isOpen={showStakedValidatorDetails}
            onClose={() => setShowStakedValidatorDetails(false)}
            onSwitchValidator={() => {
              const state = {
                mode: 'REDELEGATE',
                fromValidator: validators[selectedDelegation.delegation.validator_address],
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
                toValidator: validators[selectedDelegation.delegation.validator_address],
                delegation: selectedDelegation,
                forceChain: activeChain,
                forceNetwork: activeNetwork,
              } as StakeInputPageState

              sessionStorage.setItem('navigate-stake-input-state', JSON.stringify(state))
              navigate('/stake/input', {
                state,
              })
            }}
            validator={validators[selectedDelegation?.delegation?.validator_address]}
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
        )}
        {showReviewValidatorClaimTx && selectedDelegation && (
          <ReviewValidatorClaimTx
            isOpen={showReviewValidatorClaimTx}
            onClose={() => setShowReviewValidatorClaimTx(false)}
            validator={validators[selectedDelegation.delegation.validator_address]}
            selectedDelegation={selectedDelegation}
            rootDenomsStore={rootDenomsStore}
            rootBalanceStore={rootBalanceStore}
            delegationsStore={delegationsStore}
            validatorsStore={validatorsStore}
            unDelegationsStore={unDelegationsStore}
            claimRewardsStore={claimRewardsStore}
            forceChain={activeChain}
            forceNetwork={activeNetwork}
          />
        )}
      </>
    )
  },
)

export default ValidatorList
