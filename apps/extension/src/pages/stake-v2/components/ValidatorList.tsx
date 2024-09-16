/* eslint-disable @typescript-eslint/no-explicit-any */
import {
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
  RootDenomsStore,
  UndelegationsStore,
  ValidatorsStore,
} from '@leapwallet/cosmos-wallet-store'
import { Buttons, ThemeName, useTheme } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import BottomModal from 'components/bottom-modal'
import { ValidatorItemSkeleton } from 'components/Skeletons/StakeSkeleton'
import Text from 'components/text'
import currency from 'currency.js'
import { useDefaultTokenLogo } from 'hooks'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useHideAssets } from 'hooks/settings/useHideAssets'
import useQuery from 'hooks/useQuery'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { Colors } from 'theme/colors'
import { imgOnError } from 'utils/imgOnError'
import { isSidePanel } from 'utils/isSidePanel'

import { StakeInputPageState } from '../StakeInputPage'

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
    const defaultTokenLogo = useDefaultTokenLogo()

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

    const { formatHideBalance } = useHideAssets()

    const apys = network?.validatorApys
    const { data: imageUrl } = useValidatorImage(validator)
    const { theme } = useTheme()

    const amountTitleText = useMemo(() => {
      if (new BigNumber(delegation.balance.currencyAmount ?? '').gt(0)) {
        return formatHideBalance(
          formatCurrency(new BigNumber(delegation.balance.currencyAmount ?? '')),
        )
      } else {
        return formatHideBalance(delegation.balance.formatted_amount ?? delegation.balance.amount)
      }
    }, [
      delegation.balance.amount,
      delegation.balance.currencyAmount,
      delegation.balance.formatted_amount,
      formatCurrency,
      formatHideBalance,
    ])

    const amountSubtitleText = useMemo(() => {
      if (new BigNumber(delegation.balance.currencyAmount ?? '').gt(0)) {
        return formatHideBalance(delegation.balance.formatted_amount ?? delegation.balance.amount)
      }
      return ''
    }, [
      delegation.balance.amount,
      delegation.balance.currencyAmount,
      delegation.balance.formatted_amount,
      formatHideBalance,
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
                APY
              </Text>

              <Text color='text-black-100 dark:text-white-100' size='sm' className='font-bold'>
                {apys &&
                  (apys[validator?.address]
                    ? `${currency(apys[validator?.address] * 100, {
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
              <img
                className='w-9 h-9'
                src={activeStakingDenom.icon}
                onError={imgOnError(defaultTokenLogo)}
              />

              <div>
                <Text color='text-black-100 dark:text-white-100' size='sm' className='font-bold'>
                  {amountTitleText}
                </Text>

                <Text color='text-gray-700 dark:text-gray-400' size='xs' className='font-medium'>
                  {amountSubtitleText}
                </Text>
              </div>
            </div>
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
        </div>
      </BottomModal>
    )
  },
)

interface ValidatorCardProps {
  validator: Validator
  delegation: Delegation
  onClick: () => void
}

function ValidatorCard({ validator, delegation, onClick }: ValidatorCardProps) {
  const [formatCurrency] = useFormatCurrency()
  const { formatHideBalance } = useHideAssets()
  const { data: imageUrl } = useValidatorImage(validator)

  const amountTitleText = useMemo(() => {
    if (new BigNumber(delegation.balance.currencyAmount ?? '').gt(0)) {
      return formatHideBalance(
        formatCurrency(new BigNumber(delegation.balance.currencyAmount ?? '')),
      )
    } else {
      return formatHideBalance(delegation.balance.formatted_amount ?? delegation.balance.amount)
    }
  }, [
    delegation.balance.amount,
    delegation.balance.currencyAmount,
    delegation.balance.formatted_amount,
    formatCurrency,
    formatHideBalance,
  ])

  const amountSubtitleText = useMemo(() => {
    if (new BigNumber(delegation.balance.currencyAmount ?? '').gt(0)) {
      return formatHideBalance(delegation.balance.formatted_amount ?? delegation.balance.amount)
    }
    return ''
  }, [
    delegation.balance.amount,
    delegation.balance.currencyAmount,
    delegation.balance.formatted_amount,
    formatHideBalance,
  ])

  return (
    <div
      onClick={onClick}
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
}

type ValidatorListProps = {
  rootDenomsStore: RootDenomsStore
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
  }: ValidatorListProps) => {
    const navigate = useNavigate()
    const [showStakedValidatorDetails, setShowStakedValidatorDetails] = useState(false)
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

    const { delegations, network, loadingNetwork, loadingDelegations } = useStaking(
      denoms,
      chainDelegations,
      chainValidators,
      chainUnDelegations,
      chainClaimRewards,
      activeChain,
      activeNetwork,
    )

    const validators = network?.getValidators({}) as Record<string, Validator>
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
        (a: any, b: any) => parseFloat(b.balance.amount) - parseFloat(a.balance.amount),
      )

      const _activeValidatorDelegations = _sortedDelegations.filter((d: any) => {
        const validator = validators?.[d?.delegation?.validator_address]
        if (!validator || validator.active === false) return false
        return true
      })

      const _inactiveValidatorDelegations = _sortedDelegations.filter((d: any) => {
        const validator = validators?.[d?.delegation?.validator_address]
        if (!validator || validator.active !== false) return false
        return true
      })

      return [_activeValidatorDelegations, _inactiveValidatorDelegations]
    }, [delegations, validators])

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

              {activeValidatorDelegations.map((d: any) => {
                const validator = validators?.[d?.delegation?.validator_address]
                return (
                  <ValidatorCard
                    key={validator.address}
                    delegation={d}
                    validator={validator}
                    onClick={() => {
                      setSelectedDelegation(d)
                      setShowStakedValidatorDetails(true)
                    }}
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

              {inactiveValidatorDelegations.map((d: any) => {
                const validator = validators[d?.delegation?.validator_address]
                return (
                  <ValidatorCard
                    key={validator.address}
                    delegation={d}
                    validator={validator}
                    onClick={() => {
                      setSelectedDelegation(d)
                      setShowStakedValidatorDetails(true)
                    }}
                  />
                )
              })}
            </>
          )}
        </div>

        {selectedDelegation && network && (
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
          />
        )}
      </>
    )
  },
)

export default ValidatorList
