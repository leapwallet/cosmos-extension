import {
  FeeTokenData,
  STAKE_MODE,
  useActiveChain,
  useActiveStakingDenom,
  useGetTokenSpendableBalances,
  useSelectedNetwork,
  useStakeTx,
  useStaking,
} from '@leapwallet/cosmos-wallet-hooks'
import { Delegation } from '@leapwallet/cosmos-wallet-sdk/dist/browser/types/staking'
import { Validator } from '@leapwallet/cosmos-wallet-sdk/dist/browser/types/validators'
import { Buttons, Header, HeaderActionType } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import GasPriceOptions, { useDefaultGasPrice } from 'components/gas-price-options'
import { DisplayFeeValue, GasPriceOptionValue } from 'components/gas-price-options/context'
import { DisplayFee } from 'components/gas-price-options/display-fee'
import { FeesSettingsSheet } from 'components/gas-price-options/fees-settings-sheet'
import PopupLayout from 'components/layout/popup-layout'
import Text from 'components/text'
import { Wallet } from 'hooks/wallet/useWallet'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'

import InactiveValidatorCard from './components/InactiveValidatorCard'
import InsufficientBalanceCard from './components/InsufficientBalanceCard'
import ReviewStakeTx, { buttonTitle } from './components/ReviewStakeTx'
import SelectValidatorCard from './components/SelectValidatorCard'
import SelectValidatorSheet from './components/SelectValidatorSheet'
import YouStake from './components/YouStake'
import useGetWallet = Wallet.useGetWallet
import { YouStakeSkeleton } from 'components/Skeletons/StakeSkeleton'
import { EventName } from 'config/analytics'
import { addSeconds } from 'date-fns'
import mixpanel from 'mixpanel-browser'
import { Colors } from 'theme/colors'
import { timeLeft } from 'utils/timeLeft'

import AutoAdjustAmountSheet from './components/AutoAdjustModal'
import { StakeTxnPageState } from './StakeTxnPage'

export type StakeInputPageState = {
  mode: STAKE_MODE
  toValidator?: Validator
  fromValidator?: Validator
  delegation?: Delegation
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

export default function StakeInputPage() {
  const [selectedValidator, setSelectedValidator] = useState<Validator | undefined>()
  const [showSelectValidatorSheet, setShowSelectValidatorSheet] = useState(false)
  const [showFeesSettingSheet, setShowFeesSettingSheet] = useState(false)
  const [showReviewStakeTx, setShowReviewStakeTx] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [loadingSelectedValidator, setLoadingSelectedValidator] = useState(false)
  const [showAdjustAmountSheet, setShowAdjustAmountSheet] = useState(false)
  const [adjustAmount, setAdjustAmount] = useState(false)
  const navigate = useNavigate()
  const [activeStakingDenom] = useActiveStakingDenom()
  const { allAssets } = useGetTokenSpendableBalances()
  const {
    toValidator,
    fromValidator,
    mode = 'DELEGATE',
    delegation,
  } = useLocation().state as StakeInputPageState
  const { network } = useStaking()
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
  const validators = network?.getValidators({}) as Record<string, Validator>
  const apy = network?.validatorApys
  const {
    amount,
    setAmount,
    recommendedGasLimit,
    userPreferredGasLimit,
    setUserPreferredGasLimit,
    userPreferredGasPrice,
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
  } = useStakeTx(mode, selectedValidator as Validator, fromValidator, [delegation as Delegation])
  const activeChain = useActiveChain()
  const activeNetwork = useSelectedNetwork()
  const defaultGasPrice = useDefaultGasPrice({
    activeChain,
    selectedNetwork: activeNetwork,
  })
  const getWallet = useGetWallet()

  const [gasError, setGasError] = useState<string | null>(null)
  const [gasPriceOption, setGasPriceOption] = useState<GasPriceOptionValue>({
    option: gasOption,
    gasPrice: userPreferredGasPrice ?? defaultGasPrice.gasPrice,
  })
  const [displayFeeValue, setDisplayFeeValue] = useState<DisplayFeeValue>()

  const token = useMemo(() => {
    return allAssets?.find((e) => e.symbol === activeStakingDenom.coinDenom)
  }, [activeStakingDenom.coinDenom, allAssets])

  const activeValidators = useMemo(
    () =>
      Object.values(validators ?? {})
        .filter((v) => !v.jailed)
        .filter((v) => v.address !== fromValidator?.address),
    [fromValidator?.address, validators],
  )

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

  const onGasPriceOptionChange = useCallback(
    (value: GasPriceOptionValue, feeBaseDenom: FeeTokenData) => {
      setGasPriceOption(value)
      if (value.option) {
        setGasOption(value.option)
      }
      setFeeDenom(feeBaseDenom.denom)
    },
    [setFeeDenom, setGasOption],
  )

  const txCallback = useCallback(() => {
    navigate('/stake-pending-txn', {
      state: {
        validator: selectedValidator,
        mode,
      } as StakeTxnPageState,
    })
    mixpanel.track(EventName.TransactionSigned, {
      transactionType: getTransactionType(mode),
    })
  }, [mode, navigate, selectedValidator])

  const onSubmit = useCallback(async () => {
    try {
      const wallet = await getWallet()
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
  }, [customFee, feeDenom, getWallet, onReviewTransaction, setLedgerError, txCallback])

  useEffect(() => {
    if (adjustAmount) {
      if (new BigNumber(amount).gt(0)) {
        setShowReviewStakeTx(true)
      }
    }
  }, [adjustAmount, amount])

  return (
    <div>
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
        <div className='flex flex-col justify-between p-4' style={{ height: 'calc(100% - 72px)' }}>
          <div className='space-y-4 overflow-y-auto'>
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
              delegation={delegation}
            />

            {loadingSelectedValidator ? (
              <YouStakeSkeleton />
            ) : (
              <SelectValidatorCard
                title='Validator'
                selectedValidator={selectedValidator}
                setShowSelectValidatorSheet={setShowSelectValidatorSheet}
                selectDisabled={mode === 'UNDELEGATE'}
              />
            )}
            {token && new BigNumber(token.amount).isEqualTo(0) && <InsufficientBalanceCard />}
            {selectedValidator &&
              selectedValidator.active === false &&
              (mode === 'DELEGATE' || mode === 'REDELEGATE') && <InactiveValidatorCard />}
          </div>
          <div>
            {new BigNumber(amount).isGreaterThan(0) && (
              <div className='flex items-center justify-between pt-2 px-2'>
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
                <div
                  onClick={() => setShowFeesSettingSheet(true)}
                  className='flex gap-x-1 items-center hover:cursor-pointer'
                >
                  <span className='material-icons-round !text-lg text-black-100 dark:text-white-100'>
                    local_gas_station
                  </span>
                  <Text
                    size='xs'
                    color='text-black-100 dark:text-white-100'
                    className='font-medium'
                  >
                    {displayFeeValue?.fiatValue}
                  </Text>
                  <span className='material-icons-round text-black-100 dark:text-white-100'>
                    expand_more
                  </span>
                </div>
              </div>
            )}
            <Buttons.Generic
              size='normal'
              className='mt-2'
              color={hasError ? Colors.red300 : Colors.green600}
              onClick={() => {
                if (
                  mode === 'DELEGATE' &&
                  parseFloat(amount) + (displayFeeValue?.value ?? 0) >
                    parseFloat(token?.amount ?? '')
                ) {
                  setShowAdjustAmountSheet(true)
                } else {
                  setShowReviewStakeTx(true)
                }
              }}
              disabled={
                !new BigNumber(amount).isGreaterThan(0) ||
                hasError ||
                !selectedValidator ||
                !!ledgerError
              }
            >
              {hasError ? 'Insufficient Balance' : `Review ${buttonTitle[mode]}`}
            </Buttons.Generic>
          </div>
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
        apy={apy}
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
          unstakingPeriod={unstakingPeriod}
          showLedgerPopup={showLedgerPopup}
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
            // setShowReviewStakeTx(true)
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
        setGasLimit={(value: number) => setUserPreferredGasLimit(Number(value.toString()))}
        gasPriceOption={gasPriceOption}
        onGasPriceOptionChange={onGasPriceOptionChange}
        error={gasError}
        setError={setGasError}
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
    </div>
  )
}
