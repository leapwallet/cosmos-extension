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
import { SupportedChain, Validator } from '@leapwallet/cosmos-wallet-sdk'
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
import { Buttons, Header, HeaderActionType } from '@leapwallet/leap-ui'
import { CaretDown, GasPump } from '@phosphor-icons/react'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import GasPriceOptions, { useDefaultGasPrice } from 'components/gas-price-options'
import { DisplayFeeValue, GasPriceOptionValue } from 'components/gas-price-options/context'
import { DisplayFee } from 'components/gas-price-options/display-fee'
import { FeesSettingsSheet } from 'components/gas-price-options/fees-settings-sheet'
import PopupLayout from 'components/layout/popup-layout'
import { YouStakeSkeleton } from 'components/Skeletons/StakeSkeleton'
import Text from 'components/text'
import { EventName } from 'config/analytics'
import { addSeconds } from 'date-fns'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { Wallet } from 'hooks/wallet/useWallet'
import mixpanel from 'mixpanel-browser'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Colors } from 'theme/colors'
import { isCompassWallet } from 'utils/isCompassWallet'
import { isSidePanel } from 'utils/isSidePanel'
import { timeLeft } from 'utils/timeLeft'

import InactiveValidatorCard from './components/InactiveValidatorCard'
import InsufficientBalanceCard from './components/InsufficientBalanceCard'
import ReviewStakeTx, { getButtonTitle } from './components/ReviewStakeTx'
import SelectValidatorCard from './components/SelectValidatorCard'
import SelectValidatorSheet from './components/SelectValidatorSheet'
import YouStake from './components/YouStake'
import useGetWallet = Wallet.useGetWallet

import { useCaptureUIException } from 'hooks/perf-monitoring/useCaptureUIException'
import { importWatchWalletSeedPopupStore } from 'stores/import-watch-wallet-seed-popup-store'

import AutoAdjustAmountSheet from './components/AutoAdjustModal'
import { SelectProviderCard } from './restaking/SelectProviderCard'
import SelectProviderSheet from './restaking/SelectProviderSheet'
import SuggestSelectProviderSheet from './restaking/SuggestSelectProviderSheet'
import { StakeTxnPageState } from './StakeTxnPage'

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
    const [showSelectValidatorSheet, setShowSelectValidatorSheet] = useState(false)
    const [showSelectProviderSheet, setShowSelectProviderSheet] = useState(false)
    const [showFeesSettingSheet, setShowFeesSettingSheet] = useState(false)
    const [showReviewStakeTx, setShowReviewStakeTx] = useState(false)
    const [showSuggestSelectProviderSheet, setShowSuggestSelectProviderSheet] = useState(false)
    const [hasError, setHasError] = useState(false)
    const [loadingSelectedValidator, setLoadingSelectedValidator] = useState(false)
    const [showAdjustAmountSheet, setShowAdjustAmountSheet] = useState(false)
    const [adjustAmount, setAdjustAmount] = useState(false)

    const navigate = useNavigate()
    const location = useLocation()

    const {
      toValidator,
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

      return (location?.state ?? navigateStakeInputState) as StakeInputPageState
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
      const state = {
        validator: selectedValidator,
        provider: selectedProvider,
        mode,
        forceChain: activeChain,
        forceNetwork: activeNetwork,
      } as StakeTxnPageState

      sessionStorage.setItem('navigate-stake-pending-txn-state', JSON.stringify(state))
      navigate('/stake/pending-txn', {
        state,
      })

      mixpanel.track(EventName.TransactionSigned, {
        transactionType:
          mode === 'REDELEGATE' && fromProvider ? 'provider_redelegate' : getTransactionType(mode),
      })
    }, [
      selectedValidator,
      selectedProvider,
      mode,
      activeChain,
      activeNetwork,
      navigate,
      fromProvider,
    ])

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

    return (
      <>
        <PopupLayout
          header={
            <Header
              action={{
                onClick: () => navigate(-1),
                type: HeaderActionType.BACK,
              }}
              title={mode === 'UNDELEGATE' ? 'Unstaking' : 'Staking'}
            />
          }
        >
          <div className='space-y-4 overflow-y-auto p-4'>
            {fromValidator && (
              <SelectValidatorCard
                title='Current Validator'
                selectedValidator={fromValidator}
                setShowSelectValidatorSheet={setShowSelectValidatorSheet}
                selectDisabled={true}
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
          </div>

          <div className={classNames('absolute bottom-4 px-3', { 'mt-auto': isSidePanel() })}>
            {new BigNumber(amount).isGreaterThan(0) && (
              <div className='flex items-center justify-between pt-2 px-2'>
                {activeChain !== 'babylon' && (
                  <div className='flex gap-x-1'>
                    <Text
                      size='xs'
                      color='text-gray-700 dark:text-gray-400'
                      className='font-medium text-center'
                    >
                      Unstaking period
                    </Text>
                    <Text
                      size='xs'
                      color='text-black-100 dark:text-white-100'
                      className='font-medium'
                    >
                      {unstakingPeriod}
                    </Text>
                  </div>
                )}

                {displayFeeValue?.fiatValue && (
                  <div
                    onClick={() => setShowFeesSettingSheet(true)}
                    className='flex gap-x-1 items-center hover:cursor-pointer ml-auto'
                  >
                    <GasPump size={20} className='text-black-100 dark:text-white-100' />
                    <Text
                      size='xs'
                      color='text-black-100 dark:text-white-100'
                      className='font-medium'
                    >
                      {displayFeeValue?.fiatValue}
                    </Text>
                    <CaretDown size={16} className='text-black-100 dark:text-white-100' />
                  </div>
                )}
              </div>
            )}

            <Buttons.Generic
              size='normal'
              className='mt-2'
              color={
                hasError
                  ? Colors.red300
                  : !isCompassWallet()
                  ? Colors.green600
                  : Colors.compassPrimary
              }
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
              {hasError ? 'Insufficient Balance' : `Review ${getButtonTitle(mode, !!fromProvider)}`}
            </Buttons.Generic>
          </div>
        </PopupLayout>

        <SelectValidatorSheet
          isVisible={showSelectValidatorSheet}
          onClose={() => setShowSelectValidatorSheet(false)}
          onValidatorSelect={(validator) => {
            setSelectedValidator(validator)
            setShowSelectValidatorSheet(false)
          }}
          validators={activeValidators}
          apr={apr}
          rootDenomsStore={rootDenomsStore}
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
