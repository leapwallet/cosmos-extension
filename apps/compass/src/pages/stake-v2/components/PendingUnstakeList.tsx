/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  SelectedNetwork,
  useActiveChain,
  useIsCancleUnstakeSupported,
  useSelectedNetwork,
  useStaking,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  SupportedChain,
  UnbondingDelegation,
  UnbondingDelegationEntry,
  Validator,
} from '@leapwallet/cosmos-wallet-sdk'
import {
  ClaimRewardsStore,
  DelegationsStore,
  RootBalanceStore,
  RootDenomsStore,
  UndelegationsStore,
  ValidatorsStore,
} from '@leapwallet/cosmos-wallet-store'
import { ValidatorItemSkeleton } from 'components/Skeletons/StakeSkeleton'
import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'

import UnstakedValidatorDetails from './UnstakedValidatorDetails'
import { ValidatorCard } from './ValidatorCard'

type PendingUnstakeListProps = {
  rootDenomsStore: RootDenomsStore
  delegationsStore: DelegationsStore
  validatorsStore: ValidatorsStore
  unDelegationsStore: UndelegationsStore
  claimRewardsStore: ClaimRewardsStore
  forceChain?: SupportedChain
  forceNetwork?: SelectedNetwork
  rootBalanceStore: RootBalanceStore
}

const PendingUnstakeList = observer(
  ({
    rootDenomsStore,
    delegationsStore,
    validatorsStore,
    unDelegationsStore,
    claimRewardsStore,
    forceChain,
    forceNetwork,
    rootBalanceStore,
  }: PendingUnstakeListProps) => {
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

    const { unboundingDelegationsInfo, loadingUnboundingDelegations } = useStaking(
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
    const memoisedUndelegation = useMemo(
      () => Object.values(unboundingDelegationsInfo ?? {})?.[0],
      [unboundingDelegationsInfo],
    )
    const { isCancleUnstakeSupported } = useIsCancleUnstakeSupported(
      memoisedUndelegation,
      activeChain,
      activeNetwork,
    )
    const isLoading = loadingUnboundingDelegations
    const [showUnstakeValidatorDetails, setShowUnstakeValidatorDetails] = useState(false)
    const [selectedUnbondingDelegation, setSelectedUnbondingDelegation] = useState<
      UnbondingDelegation | undefined
    >()
    const [selectedDelegationEntry, setSelectedDelegationEntry] = useState<
      UnbondingDelegationEntry | undefined
    >()

    if (
      !isLoading &&
      (Object.values(unboundingDelegationsInfo ?? {}).length === 0 || !validators)
    ) {
      return <></>
    }

    return (
      <>
        {isLoading && (
          <div className='flex flex-col w-full gap-4'>
            <div className='flex justify-between'>
              <span className='text-xs text-muted-foreground'>Validator</span>
              <span className='text-xs text-muted-foreground'>Amount Staked</span>
            </div>

            <ValidatorItemSkeleton count={5} />
          </div>
        )}

        {!isLoading && validators && unboundingDelegationsInfo && (
          <div className='flex flex-col w-full gap-4'>
            <div className='flex justify-between'>
              <span className='text-xs text-muted-foreground'>Validator</span>
              <span className='text-xs text-muted-foreground'>Amount Staked</span>
            </div>

            {Object.values(unboundingDelegationsInfo ?? {}).map((uds) => {
              const validator = validators[uds?.validator_address]
              if (!validator) {
                return null
              }
              return uds.entries.map((ud, idx) => {
                return (
                  <ValidatorCard
                    entry={ud}
                    key={`${validator?.address} ${idx}`}
                    isCancleUnstakeSupported={isCancleUnstakeSupported}
                    validator={validator}
                    onClick={() => {
                      if (isCancleUnstakeSupported) {
                        setShowUnstakeValidatorDetails(true)
                        setSelectedUnbondingDelegation(uds)
                        setSelectedDelegationEntry(ud)
                      }
                    }}
                  />
                )
              })
            })}
          </div>
        )}

        {selectedUnbondingDelegation && selectedDelegationEntry && validators && (
          <UnstakedValidatorDetails
            isOpen={showUnstakeValidatorDetails}
            onClose={() => setShowUnstakeValidatorDetails(false)}
            unbondingDelegation={selectedUnbondingDelegation}
            unbondingDelegationEntry={selectedDelegationEntry}
            validator={validators[selectedUnbondingDelegation.validator_address]}
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

export default PendingUnstakeList
