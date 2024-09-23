/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  SelectedNetwork,
  sliceWord,
  useActiveChain,
  useIsCancleUnstakeSupported,
  useSelectedNetwork,
  useStaking,
  useValidatorImage,
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
import BigNumber from 'bignumber.js'
import { ValidatorListItemSkeleton } from 'components/Skeletons/ValidatorListSkeleton'
import Text from 'components/text'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useHideAssets } from 'hooks/settings/useHideAssets'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'
import { imgOnError } from 'utils/imgOnError'
import { isSidePanel } from 'utils/isSidePanel'
import { timeLeft } from 'utils/timeLeft'

import UnstakedValidatorDetails from './UnstakedValidatorDetails'

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

    const { unboundingDelegationsInfo, network, loadingUnboundingDelegations } = useStaking(
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
        validatorsStore.chainValidators.validatorData.validators?.reduce((acc, validator) => {
          acc[validator.address] = validator
          return acc
        }, {} as Record<string, Validator>),
      [validatorsStore.chainValidators.validatorData.validators],
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
    const [formatCurrency] = useFormatCurrency()
    const { formatHideBalance } = useHideAssets()
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
        {isLoading && <ValidatorListItemSkeleton />}
        {!isLoading && validators && unboundingDelegationsInfo && (
          <div className='flex flex-col w-full gap-y-2'>
            <div className='flex justify-between'>
              <Text size='xs' color='text-gray-700 dark:text-gray-400'>
                Validator
              </Text>
              <Text size='xs' color='text-gray-700 dark:text-gray-400'>
                Amount Staked
              </Text>
            </div>

            {Object.values(unboundingDelegationsInfo ?? {}).map((uds: any) => {
              const validator = validators[uds?.validator_address]
              if (!validator) {
                return null
              }
              return uds.entries.map((ud: any, idx: number) => {
                const timeLeftText = timeLeft(ud.completion_time)
                const Component = () => {
                  const { data: imageUrl } = useValidatorImage(validator)
                  const amountTitleText = useMemo(() => {
                    if (new BigNumber(ud.currencyBalance ?? '').gt(0)) {
                      return formatHideBalance(
                        formatCurrency(new BigNumber(ud.currencyBalance ?? '')),
                      )
                    } else {
                      return formatHideBalance(ud.formattedBalance ?? '')
                    }
                  }, [])
                  const amountSubtitleText = useMemo(() => {
                    if (new BigNumber(ud.currencyBalance ?? '').gt(0)) {
                      return formatHideBalance(ud.formattedBalance ?? '')
                    }
                    return ''
                  }, [])

                  return (
                    <div
                      onClick={() => {
                        if (isCancleUnstakeSupported) {
                          setShowUnstakeValidatorDetails(true)
                          setSelectedUnbondingDelegation(uds)
                          setSelectedDelegationEntry(ud)
                        }
                      }}
                      className={`flex justify-between items-center px-4 py-3 bg-white-100 dark:bg-gray-950 cursor-pointer rounded-xl ${
                        isCancleUnstakeSupported && 'cursor-pointer'
                      }`}
                    >
                      <div className='flex items-center w-full'>
                        <img
                          src={imageUrl ?? validator?.image ?? Images.Misc.Validator}
                          onError={imgOnError(Images.Misc.Validator)}
                          width={28}
                          height={28}
                          className='mr-4 rounded-full'
                        />

                        <div className='flex justify-between items-center w-full'>
                          <div className='flex flex-col'>
                            <Text
                              size='sm'
                              color='text-black-100 dark:text-white-100'
                              className='font-bold  overflow-hidden'
                            >
                              {sliceWord(
                                validator.moniker,
                                isSidePanel()
                                  ? 6 +
                                      Math.floor(
                                        ((Math.min(window.innerWidth, 400) - 320) / 81) * 7,
                                      )
                                  : 10,
                                3,
                              )}
                            </Text>

                            <Text
                              size='xs'
                              color='dark:text-gray-400 text-gray-600'
                              className='font-medium'
                            >
                              {timeLeftText}
                            </Text>
                          </div>

                          <div className='flex flex-col items-end'>
                            <Text
                              size='sm'
                              color='text-black-100 dark:text-white-100'
                              className='font-bold'
                            >
                              {amountTitleText}
                            </Text>

                            <Text
                              size='xs'
                              color='dark:text-gray-400 text-gray-600'
                              className='font-medium'
                            >
                              {amountSubtitleText}
                            </Text>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                }

                return <Component key={`${validator?.address} ${idx}`} />
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
