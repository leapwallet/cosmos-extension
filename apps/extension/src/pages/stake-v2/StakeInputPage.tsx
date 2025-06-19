import {
  FeeTokenData,
  SelectedNetwork,
  STAKE_MODE,
  useActiveChain,
  useActiveStakingDenom,
  useConsensusValidators,
  useDualStaking,
  useDualStakingTx,
  useFeatureFlags,
  useSelectedNetwork,
  useStakeTx,
  useStaking,
} from '@leapwallet/cosmos-wallet-hooks'
import { isBabylon, SupportedChain, Validator } from '@leapwallet/cosmos-wallet-sdk'
import {
  Delegation,
  Provider,
  ProviderDelegation,
} from '@leapwallet/cosmos-wallet-sdk/dist/browser/types/staking'
import {
  ClaimRewardsStore,
  DelegationsStore,
  NmsStore,
  RootBalanceStore,
  RootDenomsStore,
  UndelegationsStore,
  ValidatorsStore,
} from '@leapwallet/cosmos-wallet-store'
import { CaretDown, GasPump } from '@phosphor-icons/react'
import BigNumber from 'bignumber.js'
import GasPriceOptions, { useDefaultGasPrice } from 'components/gas-price-options'
import { DisplayFeeValue, GasPriceOptionValue } from 'components/gas-price-options/context'
import { DisplayFee } from 'components/gas-price-options/display-fee'
import { FeesSettingsSheet } from 'components/gas-price-options/fees-settings-sheet'
import { YouStakeSkeleton } from 'components/Skeletons/StakeSkeleton'
import { EventName } from 'config/analytics'
import { addSeconds } from 'date-fns'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import useQuery from 'hooks/useQuery'
import { Wallet } from 'hooks/wallet/useWallet'
import mixpanel from 'mixpanel-browser'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { timeLeft } from 'utils/timeLeft'

import InsufficientBalanceCard from './components/InsufficientBalanceCard'
import ReviewStakeTx, { getButtonTitle } from './components/ReviewStakeTx'
import SelectValidatorCard from './components/SelectValidatorCard'
import SelectValidatorSheet from './components/SelectValidatorSheet'
import YouStake from './components/YouStake'
import useGetWallet = Wallet.useGetWallet

import { Button } from 'components/ui/button'
import { useCaptureUIException } from 'hooks/perf-monitoring/useCaptureUIException'
import { importWatchWalletSeedPopupStore } from 'stores/import-watch-wallet-seed-popup-store'

import AutoAdjustAmountSheet from './components/AutoAdjustModal'
import { SelectProviderCard } from './restaking/SelectProviderCard'
import SelectProviderSheet from './restaking/SelectProviderSheet'
import SuggestSelectProviderSheet from './restaking/SuggestSelectProviderSheet'
import { StakeHeader } from './stake-header'
import { StakeTxnSheet } from './StakeTxnSheet'

export type StakeInputPageState = {
  mode: STAKE_MODE
  toValidator?: Validator
  fromValidator?: Validator
  delegation?: Delegation
  forceChain?: SupportedChain
  forceNetwork?: SelectedNetwork
  toProvider?: Provider
  fromProvider?: Provider
  providerDelegation?: ProviderDelegation
}

const getTransactionType = (mode: STAKE_MODE) => {
  switch (mode) {
    case 'DELEGATE':
      return 'stake_delegate'
    case 'REDELEGATE':
      return 'stake_redelegate'
    case 'UNDELEGATE':
      return 'stake_undelegate'
    case 'CANCEL_UNDELEGATION':
      return 'stake_cancel_undelegate'
    case 'CLAIM_REWARDS':
      return 'stake_claim'
    default:
      return 'stake_delegate'
  }
}

type StakeInputPageProps = {
  rootDenomsStore: RootDenomsStore
  delegationsStore: DelegationsStore
  validatorsStore: ValidatorsStore
  unDelegationsStore: UndelegationsStore
  claimRewardsStore: ClaimRewardsStore
  rootBalanceStore: RootBalanceStore
  nmsStore: NmsStore
}

const StakeInputPage = observer(
  ({
    rootDenomsStore,
    delegationsStore,
    validatorsStore,
    unDelegationsStore,
    claimRewardsStore,
    rootBalanceStore,
    nmsStore,
  }: StakeInputPageProps) => {
    const [selectedValidator, setSelectedValidator] = useState<Validator | undefined>()
    const [showSelectProviderSheet, setShowSelectProviderSheet] = useState(false)
    const [showFeesSettingSheet, setShowFeesSettingSheet] = useState(false)
    const [showReviewStakeTx, setShowReviewStakeTx] = useState(false)
    const [showSuggestSelectProviderSheet, setShowSuggestSelectProviderSheet] = useState(false)
    const [hasError, setHasError] = useState(false)
    const [loadingSelectedValidator, setLoadingSelectedValidator] = useState(false)
    const [showAdjustAmountSheet, setShowAdjustAmountSheet] = useState(false)
    const [adjustAmount, setAdjustAmount] = useState(false)
    const [claimTxMode, setClaimTxMode] = useState<STAKE_MODE | 'CLAIM_AND_DELEGATE' | null>(null)

    const navigate = useNavigate()
    const location = useLocation()
    const query = useQuery()
    const paramValidatorAddress = query.get('validatorAddress') ?? undefined

    const {
      toValidator: _toValidator,
      fromValidator,
      mode = 'DELEGATE',
      delegation,
      forceChain,
      forceNetwork,
      toProvider,
      fromProvider,
      providerDelegation,
    } = useMemo(() => {
      const navigateStakeInputState = JSON.parse(
        sessionStorage.getItem('navigate-stake-input-state') ?? 'null',
      )

      return (location?.state || navigateStakeInputState || {}) as StakeInputPageState
    }, [location?.state])

    const [selectedProvider, setSelectedProvider] = useState(toProvider)

    const _activeChain = useActiveChain()
    const _activeNetwork = useSelectedNetwork()

    const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain])
    const activeNetwork = useMemo(
      () => forceNetwork || _activeNetwork,
      [_activeNetwork, forceNetwork],
    )

    const denoms = rootDenomsStore.allDenoms

    const chainDelegations = delegationsStore.delegationsForChain(activeChain)
    const chainValidators = validatorsStore.validatorsForChain(activeChain)
    const chainUnDelegations = unDelegationsStore.unDelegationsForChain(activeChain)
    const chainClaimRewards = claimRewardsStore.claimRewardsForChain(activeChain)

    useEffect(() => {
      validatorsStore.ensureValidatorsLoaded(activeChain, activeNetwork)
    }, [activeChain, activeNetwork, validatorsStore])

    const [activeStakingDenom] = useActiveStakingDenom(denoms, activeChain, activeNetwork)
    const { network } = useStaking(
      denoms,
      chainDelegations,
      chainValidators,
      chainUnDelegations,
      chainClaimRewards,
      activeChain,
      activeNetwork,
    )
    const { providers } = useDualStaking()

    const unstakingPeriod = useMemo(
      () =>
        timeLeft(
          addSeconds(
            new Date(),
            network?.chain?.params?.unbonding_time ?? 24 * 60 * 60 + 10,
          ).toISOString(),
          '',
        ),
      [network],
    )

    const validators = useMemo(
      () =>
        chainValidators.validatorData.validators?.reduce((acc, validator) => {
          acc[validator.address] = validator
          return acc
        }, {} as Record<string, Validator>),
      [chainValidators.validatorData.validators],
    )

    const hasDefaultValidator = useMemo(() => {
      return Object.values(validators ?? {}).some((v) => v.custom_attributes?.priority === 0)
    }, [validators])

    const [showSelectValidatorSheet, setShowSelectValidatorSheet] = useState(
      (mode === 'DELEGATE' && !hasDefaultValidator) || (mode === 'REDELEGATE' && !fromProvider),
    )
    const apr = network?.validatorAprs
    const { data: featureFlags } = useFeatureFlags()
    const {
      amount,
      setAmount,
      recommendedGasLimit,
      userPreferredGasLimit,
      setUserPreferredGasLimit,
      userPreferredGasPrice,
      setUserPreferredGasPrice,
      gasOption,
      setFeeDenom,
      isLoading,
      onReviewTransaction,
      customFee,
      feeDenom,
      setGasOption,
      error,
      ledgerError,
      setLedgerError,
      showLedgerPopup,
      setMemo,
    } =
      activeChain === 'lava' && featureFlags?.restaking?.extension === 'active'
        ? useDualStakingTx(
            denoms,
            mode,
            selectedValidator as Validator,
            fromValidator,
            [delegation as Delegation],
            [providerDelegation as ProviderDelegation],
            selectedProvider,
            fromProvider,
            undefined,
            activeChain,
            activeNetwork,
          )
        : useStakeTx(
            denoms,
            mode,
            selectedValidator as Validator,
            fromValidator,
            [delegation as Delegation],
            activeChain,
            activeNetwork,
          )

    const defaultGasPrice = useDefaultGasPrice(denoms, {
      activeChain,
      selectedNetwork: activeNetwork,
    })
    const getWallet = useGetWallet(activeChain)
    const { activeWallet } = useActiveWallet()

    const [gasError, setGasError] = useState<string | null>(null)
    const [gasPriceOption, setGasPriceOption] = useState<GasPriceOptionValue>({
      option: gasOption,
      gasPrice: userPreferredGasPrice ?? defaultGasPrice.gasPrice,
    })
    const [displayFeeValue, setDisplayFeeValue] = useState<DisplayFeeValue>()

    const token = useMemo(() => {
      return rootBalanceStore.allSpendableTokens?.find(
        (e) => e.symbol === activeStakingDenom?.coinDenom,
      )
    }, [activeStakingDenom?.coinDenom, rootBalanceStore.allSpendableTokens])

    const consensusValidators = useConsensusValidators(
      validators,
      nmsStore,
      activeChain,
      activeNetwork,
    )
    const activeValidators = useMemo(
      () =>
        consensusValidators
          .filter((v) => !v.jailed)
          .filter((v) => v.address !== fromValidator?.address)
          // remove interchain validator
          .filter((v) => v.address !== 'cosmosvaloper1j78gfl4ml9h2xdduhw2cpgheu3hdalkpuvk7m5'),
      [consensusValidators, fromValidator?.address],
    )

    const toValidator = useMemo(() => {
      if (_toValidator) {
        return _toValidator
      }
      if (paramValidatorAddress) {
        return validators?.[paramValidatorAddress]
      }
      return undefined
    }, [_toValidator, paramValidatorAddress, validators])

    const activeProviders = useMemo(() => {
      const _providers = [...providers]
      if (mode === 'REDELEGATE') {
        _providers.push({
          provider: 'empty_provider',
          moniker: 'Empty Provider',
          address: 'empty_provider',
          specs: [],
          stakestatus: 'Active',
          delegateCommission: '',
          delegateLimit: '',
          delegateTotal: '',
        })
      }
      return _providers.filter((p) => p.address !== fromProvider?.address)
    }, [fromProvider?.address, mode, providers])

    useEffect(() => {
      setGasPriceOption({
        option: gasOption,
        gasPrice: defaultGasPrice.gasPrice,
      })

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultGasPrice.gasPrice.amount.toString(), defaultGasPrice.gasPrice.denom])

    useEffect(() => {
      if (!selectedValidator) {
        setLoadingSelectedValidator(true)
        if (toValidator) {
          setSelectedValidator(toValidator)
          setShowSelectValidatorSheet(false)
        } else {
          if (mode === 'DELEGATE') {
            const validator = Object.values(validators ?? {}).find(
              (v: Validator) => v.custom_attributes?.priority === 0,
            )
            if (validator) {
              setSelectedValidator(validator)
            }
          }
        }
        setLoadingSelectedValidator(false)
      }
    }, [mode, selectedValidator, toValidator, validators])

    useEffect(() => {
      if (gasPriceOption.option) {
        setGasOption(gasPriceOption.option)
      }
      if (gasPriceOption.gasPrice) {
        setUserPreferredGasPrice(gasPriceOption.gasPrice)
      }
    }, [gasPriceOption, setGasOption, setUserPreferredGasPrice])

    const onGasPriceOptionChange = useCallback(
      (value: GasPriceOptionValue, feeBaseDenom: FeeTokenData) => {
        setGasPriceOption(value)
        setFeeDenom(feeBaseDenom.denom)
      },
      [setFeeDenom],
    )

    const txCallback = useCallback(() => {
      setClaimTxMode(mode)
      setShowReviewStakeTx(false)
      // mixpanel.track(EventName.TransactionSigned, {
      //   transactionType:
      //     mode === 'REDELEGATE' && fromProvider ? 'provider_redelegate' : getTransactionType(mode),
      // })
    }, [fromProvider, mode])

    const onSubmit = useCallback(async () => {
      try {
        const wallet = await getWallet(activeChain)
        await onReviewTransaction(wallet, txCallback, false, {
          stdFee: customFee,
          feeDenom: feeDenom,
        })
      } catch (error) {
        const _error = error as Error
        setLedgerError(_error.message)

        setTimeout(() => {
          setLedgerError('')
        }, 6000)
      }
    }, [
      activeChain,
      customFee,
      feeDenom,
      getWallet,
      onReviewTransaction,
      setLedgerError,
      txCallback,
    ])

    useEffect(() => {
      if (adjustAmount) {
        if (new BigNumber(amount).gt(0)) {
          setShowReviewStakeTx(true)
        }
      }
    }, [adjustAmount, amount])

    useEffect(() => {
      if (
        (mode === 'DELEGATE' || mode === 'REDELEGATE') &&
        selectedValidator?.custom_attributes?.priority &&
        selectedValidator?.custom_attributes?.priority > 0
      ) {
        setMemo('Staked with Leap Wallet')
      } else {
        setMemo('')
      }
    }, [mode, selectedValidator?.custom_attributes?.priority, setMemo])

    const delegationBalance = useMemo(() => {
      if (delegation) {
        return delegation.balance
      }
      if (providerDelegation) {
        return providerDelegation.amount
      }
    }, [delegation, providerDelegation])

    useCaptureUIException(ledgerError || error, {
      activeChain,
      activeNetwork,
      mode,
    })

    const tokenLoading = rootBalanceStore.getLoadingStatusForChain(activeChain, activeNetwork)

    const delegationBalanceLoading =
      delegationsStore.delegationsForChain(activeChain)?.loadingDelegations

    useEffect(() => {
      return () => {
        if (!location.state) {
          sessionStorage.removeItem('navigate-stake-input-state')
        }
      }
    }, [location.state])

    return (
      <>
        {selectedValidator || fromProvider ? (
          <>
            <StakeHeader />
            <div className='flex flex-col gap-y-5 px-6 pb-6 pt-7 w-full flex-1 h-[calc(100%-132px)] overflow-y-scroll bg-secondary'>
              {fromValidator && (
                <SelectValidatorCard
                  title='Current Validator'
                  selectedValidator={fromValidator}
                  setShowSelectValidatorSheet={setShowSelectValidatorSheet}
                  selectDisabled={true}
                  apr={apr && apr[fromValidator?.address ?? '']}
                />
              )}

              {fromProvider && (
                <SelectProviderCard
                  title='Current Provider'
                  selectedProvider={fromProvider}
                  setShowSelectProviderSheet={setShowSelectProviderSheet}
                  selectDisabled={true}
                  rootDenomsStore={rootDenomsStore}
                />
              )}

              <YouStake
                amount={amount}
                setAmount={setAmount}
                adjustAmount={adjustAmount}
                setAdjustAmount={setAdjustAmount}
                token={token}
                fees={customFee?.amount[0]}
                hasError={hasError}
                setHasError={setHasError}
                mode={mode}
                tokenLoading={tokenLoading}
                delegationBalance={delegationBalance}
                rootDenomsStore={rootDenomsStore}
                activeChain={activeChain}
                activeNetwork={activeNetwork}
                delegationBalanceLoading={delegationBalanceLoading}
              />
              {!fromProvider &&
                (loadingSelectedValidator ? (
                  <YouStakeSkeleton />
                ) : (
                  <SelectValidatorCard
                    title={
                      activeChain === 'lava' &&
                      featureFlags?.restaking?.extension === 'active' &&
                      mode === 'DELEGATE'
                        ? 'Stake to Validator'
                        : 'Validator'
                    }
                    selectedValidator={selectedValidator}
                    setShowSelectValidatorSheet={setShowSelectValidatorSheet}
                    selectDisabled={mode === 'UNDELEGATE' && !!toValidator}
                    apr={apr && apr[selectedValidator?.address ?? '']}
                  />
                ))}

              {activeChain === 'lava' &&
                featureFlags?.restaking?.extension === 'active' &&
                (mode === 'DELEGATE' ||
                  (mode === 'REDELEGATE' && fromProvider) ||
                  (mode === 'UNDELEGATE' && toProvider)) && (
                  <SelectProviderCard
                    title={mode === 'DELEGATE' ? 'Restake to Provider' : 'Provider'}
                    optional={mode === 'DELEGATE'}
                    selectedProvider={selectedProvider}
                    setShowSelectProviderSheet={setShowSelectProviderSheet}
                    selectDisabled={mode === 'UNDELEGATE'}
                    rootDenomsStore={rootDenomsStore}
                  />
                )}

              {token && new BigNumber(token.amount).isEqualTo(0) && (
                <InsufficientBalanceCard
                  rootDenomsStore={rootDenomsStore}
                  activeChain={activeChain}
                  activeNetwork={activeNetwork}
                />
              )}

              {new BigNumber(amount).isGreaterThan(0) && (
                <div className='flex items-center justify-between px-2'>
                  {!isBabylon(activeChain) && (
                    <div className='text-xs font-medium'>
                      <span className='text-muted-foreground'>Unstaking period: </span>
                      <span>{unstakingPeriod}</span>
                    </div>
                  )}

                  {displayFeeValue?.fiatValue && (
                    <button
                      onClick={() => setShowFeesSettingSheet(true)}
                      className='flex items-center hover:cursor-pointer ml-auto gap-1 group'
                    >
                      <GasPump size={16} />
                      <span className='text-xs text-secondary-800 font-medium group-hover:text-foreground transition-colors'>
                        {displayFeeValue?.fiatValue}
                      </span>
                      <CaretDown
                        size={12}
                        className='text-secondary-600 group-hover:text-secondary-800 transition-colors'
                      />
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className='flex flex-col gap-4 w-full p-4 mt-auto sticky bottom-0 bg-secondary-100'>
              <Button
                className='w-full'
                variant={hasError ? 'destructive' : 'default'}
                onClick={() => {
                  if (
                    mode === 'DELEGATE' &&
                    parseFloat(amount) + (displayFeeValue?.value ?? 0) >
                      parseFloat(token?.amount ?? '')
                  ) {
                    setShowAdjustAmountSheet(true)
                  } else {
                    if (
                      activeChain === 'lava' &&
                      featureFlags?.restaking?.extension === 'active' &&
                      mode === 'DELEGATE' &&
                      !selectedProvider
                    ) {
                      setShowSuggestSelectProviderSheet(true)
                    } else {
                      if (activeWallet?.watchWallet) {
                        importWatchWalletSeedPopupStore.setShowPopup(true)
                      } else {
                        setShowReviewStakeTx(true)
                      }
                    }
                  }
                }}
                disabled={
                  !new BigNumber(amount).isGreaterThan(0) ||
                  hasError ||
                  ((fromValidator || mode === 'DELEGATE') && !selectedValidator) ||
                  (fromProvider && !selectedProvider) ||
                  !!ledgerError
                }
              >
                {hasError
                  ? 'Insufficient Balance'
                  : `Review ${getButtonTitle(mode, !!fromProvider)}`}
              </Button>
            </div>
          </>
        ) : null}
        <SelectValidatorSheet
          isVisible={showSelectValidatorSheet}
          onClose={() => {
            if (!selectedValidator) {
              navigate(-1)
            } else {
              setShowSelectValidatorSheet(false)
            }
          }}
          onValidatorSelect={(validator) => {
            setSelectedValidator(validator)
            setShowSelectValidatorSheet(false)
          }}
          validators={activeValidators}
          apr={apr}
          forceChain={activeChain}
          forceNetwork={activeNetwork}
        />
        {activeChain === 'lava' && featureFlags?.restaking?.extension === 'active' && (
          <SelectProviderSheet
            isVisible={showSelectProviderSheet}
            onClose={() => setShowSelectProviderSheet(false)}
            onProviderSelect={(provider) => {
              setSelectedProvider(provider)
              setShowSelectProviderSheet(false)
            }}
            providers={activeProviders}
          />
        )}
        {(selectedValidator || (mode === 'REDELEGATE' && selectedProvider)) && (
          <ReviewStakeTx
            isVisible={showReviewStakeTx}
            isLoading={isLoading}
            onClose={() => setShowReviewStakeTx(false)}
            onSubmit={onSubmit}
            tokenAmount={amount}
            token={token}
            validator={selectedValidator}
            provider={selectedProvider}
            error={error}
            gasError={gasError}
            mode={mode}
            unstakingPeriod={unstakingPeriod}
            showLedgerPopup={showLedgerPopup}
            ledgerError={ledgerError}
          />
        )}
        {mode === 'DELEGATE' && token && customFee && showAdjustAmountSheet ? (
          <AutoAdjustAmountSheet
            tokenAmount={amount}
            setTokenAmount={setAmount}
            token={token}
            fee={customFee.amount[0]}
            onAdjust={() => {
              setShowAdjustAmountSheet(false)
              setAdjustAmount(true)
              setShowReviewStakeTx(true)
            }}
            onCancel={() => {
              setShowAdjustAmountSheet(false)
            }}
            isOpen={showAdjustAmountSheet}
          />
        ) : null}
        {activeChain === 'lava' &&
          featureFlags?.restaking?.extension === 'active' &&
          mode === 'DELEGATE' && (
            <SuggestSelectProviderSheet
              isVisible={showSuggestSelectProviderSheet}
              onClose={() => setShowSuggestSelectProviderSheet(false)}
              setShowSelectProviderSheet={() => {
                setShowSuggestSelectProviderSheet(false)
                setShowSelectProviderSheet(true)
              }}
              onReviewStake={() => {
                setShowSuggestSelectProviderSheet(false)
                setShowReviewStakeTx(true)
              }}
            />
          )}
        <StakeTxnSheet
          mode={claimTxMode}
          isOpen={!!claimTxMode}
          onClose={() => {
            setAmount('')
            setClaimTxMode(null)
          }}
          forceChain={activeChain}
          forceNetwork={activeNetwork}
        />
        <GasPriceOptions
          recommendedGasLimit={recommendedGasLimit}
          gasLimit={userPreferredGasLimit?.toString() ?? recommendedGasLimit}
          setGasLimit={(value: number | string | BigNumber) =>
            setUserPreferredGasLimit(Number(value.toString()))
          }
          gasPriceOption={gasPriceOption}
          onGasPriceOptionChange={onGasPriceOptionChange}
          error={gasError}
          setError={setGasError}
          chain={activeChain}
          network={activeNetwork}
          rootDenomsStore={rootDenomsStore}
          rootBalanceStore={rootBalanceStore}
        >
          <DisplayFee
            className='hidden'
            setDisplayFeeValue={setDisplayFeeValue}
            setShowFeesSettingSheet={setShowFeesSettingSheet}
          />
          <FeesSettingsSheet
            showFeesSettingSheet={showFeesSettingSheet}
            onClose={() => setShowFeesSettingSheet(false)}
            gasError={null}
          />
        </GasPriceOptions>
      </>
    )
  },
)

export default StakeInputPage
