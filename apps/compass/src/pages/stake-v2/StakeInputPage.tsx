import {
  FeeTokenData,
  SelectedNetwork,
  STAKE_MODE,
  useActiveChain,
  useActiveStakingDenom,
  useConsensusValidators,
  useSelectedNetwork,
  useStakeTx,
  useStaking,
} from '@leapwallet/cosmos-wallet-hooks'
import { isBabylon, SupportedChain, Validator } from '@leapwallet/cosmos-wallet-sdk'
import { Delegation } from '@leapwallet/cosmos-wallet-sdk/dist/browser/types/staking'
import { CaretDown, GasPump } from '@phosphor-icons/react'
import BigNumber from 'bignumber.js'
import GasPriceOptions, { useDefaultGasPrice } from 'components/gas-price-options'
import { DisplayFeeValue, GasPriceOptionValue } from 'components/gas-price-options/context'
import { DisplayFee } from 'components/gas-price-options/display-fee'
import { FeesSettingsSheet } from 'components/gas-price-options/fees-settings-sheet'
import { addSeconds } from 'date-fns'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { Wallet } from 'hooks/wallet/useWallet'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { timeLeft } from 'utils/timeLeft'

import InsufficientBalanceCard from './components/InsufficientBalanceCard'
import ReviewStakeTx from './components/ReviewStakeTx'
import SelectValidatorCard from './components/SelectValidatorCard'
import SelectValidatorSheet from './components/SelectValidatorSheet'
import YouStake from './components/YouStake'
import useGetWallet = Wallet.useGetWallet

import { Button } from 'components/ui/button'
import { useCaptureUIException } from 'hooks/perf-monitoring/useCaptureUIException'
import { nmsStore } from 'stores/balance-store'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { rootBalanceStore } from 'stores/root-store'
import {
  claimRewardsStore,
  delegationsStore,
  unDelegationsStore,
  validatorsStore,
} from 'stores/stake-store'
import { globalSheetsStore } from 'stores/ui/global-sheets-store'

import AutoAdjustAmountSheet from './components/AutoAdjustModal'
import { StakeHeader } from './stake-header'
import { StakeTxnSheet } from './StakeTxnSheet'
import { stakeButtonTitleMap } from './utils/stake-text'

export type StakeInputPageState = {
  mode: STAKE_MODE
  toValidator?: Validator
  fromValidator?: Validator
  delegation?: Delegation
  forceChain?: SupportedChain
  forceNetwork?: SelectedNetwork
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

const StakeInputPage = observer(() => {
  const [selectedValidator, setSelectedValidator] = useState<Validator | undefined>()
  const [showFeesSettingSheet, setShowFeesSettingSheet] = useState(false)
  const [showReviewStakeTx, setShowReviewStakeTx] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [loadingSelectedValidator, setLoadingSelectedValidator] = useState(false)
  const [showAdjustAmountSheet, setShowAdjustAmountSheet] = useState(false)
  const [adjustAmount, setAdjustAmount] = useState(false)
  const [claimTxMode, setClaimTxMode] = useState<STAKE_MODE | 'CLAIM_AND_DELEGATE' | null>(null)

  const location = useLocation()
  const {
    toValidator,
    fromValidator,
    mode = 'DELEGATE',
    delegation,
  } = useMemo(() => {
    const navigateStakeInputState = JSON.parse(
      sessionStorage.getItem('navigate-stake-input-state') ?? 'null',
    )

    return (location?.state || navigateStakeInputState || {}) as StakeInputPageState
  }, [location?.state])

  const [showSelectValidatorSheet, setShowSelectValidatorSheet] = useState(
    mode === 'DELEGATE' || mode === 'REDELEGATE',
  )

  const activeChain = useActiveChain()
  const activeNetwork = useSelectedNetwork()
  const navigate = useNavigate()

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
  } = useStakeTx(
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
        .filter((v) => v.address !== fromValidator?.address),
    [consensusValidators, fromValidator?.address],
  )

  useEffect(() => {
    setGasPriceOption({
      option: gasOption,
      gasPrice: defaultGasPrice.gasPrice,
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultGasPrice.gasPrice.amount.toString(), defaultGasPrice.gasPrice.denom])

  useEffect(() => {
    if (selectedValidator) {
      return
    }

    setLoadingSelectedValidator(true)
    if (toValidator) {
      setSelectedValidator(toValidator)
      return
    }

    if (mode === 'DELEGATE') {
      const validator = Object.values(validators ?? {}).find(
        (v: Validator) => v.custom_attributes?.priority === 0,
      )
      if (validator) {
        setSelectedValidator(validator)
      }
    }
    setLoadingSelectedValidator(false)
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
  }, [mode])

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
  }, [activeChain, customFee, feeDenom, getWallet, onReviewTransaction, setLedgerError, txCallback])

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

  const delegationBalance = delegation?.balance

  const handleValidatorSelect = useCallback((validator: Validator) => {
    setSelectedValidator(validator)
    setShowSelectValidatorSheet(false)
  }, [])

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
      {selectedValidator ? (
        <>
          <StakeHeader />

          <div className='flex flex-col gap-y-5 px-6 pb-6 pt-7 w-full flex-1 overflow-auto'>
            {fromValidator && (
              <SelectValidatorCard
                title='Current Validator'
                selectedValidator={fromValidator}
                setShowSelectValidatorSheet={setShowSelectValidatorSheet}
                selectDisabled={true}
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

            <SelectValidatorCard
              title={'Validator'}
              selectedValidator={selectedValidator}
              setShowSelectValidatorSheet={setShowSelectValidatorSheet}
              selectDisabled={mode === 'UNDELEGATE' && !!toValidator}
              apr={apr?.[selectedValidator?.address ?? '']}
              loading={loadingSelectedValidator}
            />

            {token && new BigNumber(token.amount).isEqualTo(0) && <InsufficientBalanceCard />}

            <div className='mt-auto space-y-4'>
              {new BigNumber(amount).isGreaterThan(0) && (
                <div className='flex items-center justify-between pt-2 px-2'>
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

              <Button
                className='w-full'
                variant={hasError ? 'destructive' : 'default'}
                disabled={
                  !new BigNumber(amount).isGreaterThan(0) ||
                  hasError ||
                  ((fromValidator || mode === 'DELEGATE') && !selectedValidator) ||
                  !!ledgerError
                }
                onClick={() => {
                  if (
                    mode === 'DELEGATE' &&
                    parseFloat(amount) + (displayFeeValue?.value ?? 0) >
                      parseFloat(token?.amount ?? '')
                  ) {
                    setShowAdjustAmountSheet(true)
                    return
                  }

                  if (activeWallet?.watchWallet) {
                    globalSheetsStore.setImportWatchWalletSeedPopupOpen(true)
                    return
                  }

                  setShowReviewStakeTx(true)
                }}
              >
                {hasError ? 'Insufficient Balance' : `Review ${stakeButtonTitleMap[mode]}`}
              </Button>
            </div>
          </div>
        </>
      ) : null}

      <StakeTxnSheet
        mode={claimTxMode}
        isOpen={!!claimTxMode}
        onClose={() => {
          setAmount('')
          setClaimTxMode(null)
        }}
      />

      <SelectValidatorSheet
        isVisible={showSelectValidatorSheet}
        selectedValidator={selectedValidator}
        onClose={() => {
          if (!selectedValidator) {
            navigate(-1)
          } else {
            setShowSelectValidatorSheet(false)
          }
        }}
        onValidatorSelect={handleValidatorSelect}
        validators={activeValidators}
        apr={apr}
      />

      {selectedValidator && (
        <ReviewStakeTx
          isVisible={showReviewStakeTx}
          isLoading={isLoading}
          onClose={() => setShowReviewStakeTx(false)}
          onSubmit={onSubmit}
          tokenAmount={amount}
          token={token}
          validator={selectedValidator}
          error={error}
          gasError={gasError}
          mode={mode}
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
})

export default StakeInputPage
