import { calculateFee } from '@cosmjs/stargate'
import {
  FeeTokenData,
  formatTokenAmount,
  GasOptions,
  useChainInfo,
  useDefaultGasEstimates,
  useGasAdjustment,
  useGetTokenBalances,
  useNativeFeeDenom,
  useSimulateStakeTx,
  useStakeTx,
  useValidatorImage,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  DEFAULT_GAS_REDELEGATE,
  DefaultGasEstimates,
  NativeDenom,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk/dist/constants'
import { Delegation } from '@leapwallet/cosmos-wallet-sdk/dist/types/staking'
import { Validator } from '@leapwallet/cosmos-wallet-sdk/dist/types/validators'
import { Avatar, Buttons, GenericCard, StakeInput } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import { ErrorCard } from 'components/ErrorCard'
import GasPriceOptions, { useDefaultGasPrice } from 'components/gas-price-options'
import { GasPriceOptionValue } from 'components/gas-price-options/context'
import { DisplayFee } from 'components/gas-price-options/display-fee'
import { FeesSettingsSheet } from 'components/gas-price-options/fees-settings-sheet'
import Text from 'components/text'
import { Images } from 'images'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { Colors } from 'theme/colors'
import { Token } from 'types/bank'
import { imgOnError } from 'utils/imgOnError'
import { capitalize } from 'utils/strings'
import { useTxCallBack } from 'utils/txCallback'

import { Wallet } from '../../hooks/wallet/useWallet'
import { CurrentValidatorCard } from './chooseValidator'
import ReviewStakeTransaction, {
  DelegateUndelegateReviewProps,
  RedelegateReviewProps,
} from './reviewStake'

import useGetWallet = Wallet.useGetWallet
import { AutoAdjustAmountSheet } from 'components/auto-adjust-amount-sheet'

export type STAKE_MODE = 'DELEGATE' | 'UNDELEGATE' | 'REDELEGATE' | 'CLAIM_REWARDS'

export default function InputStakeAmountView({
  toValidator,
  fromValidator,
  activeChain,
  token,
  delegation,
  mode,
  unstakingPeriod,
}: {
  toValidator: Validator
  fromValidator?: Validator
  delegation?: Delegation
  activeChain: SupportedChain
  token: Token
  unstakingPeriod: string
  mode: STAKE_MODE
}) {
  const chainInfo = useChainInfo()
  const getWallet = useGetWallet()
  const txCallback = useTxCallBack()
  const defaultGasPrice = useDefaultGasPrice()
  const defaultGasEstimates = useDefaultGasEstimates()
  const nativeFeeDenom = useNativeFeeDenom()

  const { allAssets } = useGetTokenBalances()

  const [checkForAutoAdjust, setCheckForAutoAdjust] = useState(false)
  const [feeDenom, setFeeDenom] = useState<NativeDenom>(nativeFeeDenom)
  const [recommendedGasLimit, setRecommendedGasLimit] = useState(() => {
    if (mode === 'REDELEGATE') return DEFAULT_GAS_REDELEGATE.toString()
    return (
      defaultGasEstimates[activeChain]?.DEFAULT_GAS_STAKE.toString() ??
      DefaultGasEstimates.DEFAULT_GAS_STAKE
    )
  })
  const [gasLimit, setGasLimit] = useState<string>(recommendedGasLimit)
  const [showReviewTransactionSheet, setReviewTransactionSheet] = useState<boolean>(false)
  const [gasPriceOption, setGasPriceOption] = useState<GasPriceOptionValue>({
    gasPrice: defaultGasPrice.gasPrice,
    option: GasOptions.LOW,
  })
  const [gasError, setGasError] = useState<string | null>(null)
  const [showFeesSettingSheet, setShowFeesSettingSheet] = useState<boolean>(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [displayFeeValue, setDisplayFeeValue] = useState<any>(null)
  const { data: toKeybaseImageUrl } = useValidatorImage(toValidator)

  const simulateTx = useSimulateStakeTx(mode, toValidator, fromValidator, [
    delegation as Delegation,
  ])

  const {
    amount,
    error,
    clearError,
    memo,
    onReviewTransaction,
    setMemo,
    setAmount,
    showLedgerPopup,
    isLoading,
  } = useStakeTx(mode, toValidator, fromValidator, [delegation as Delegation])
  const gasAdjustment = useGasAdjustment()

  const selectedToken = useMemo(() => {
    return allAssets.find((asset) => asset.symbol === chainInfo.denom)
  }, [allAssets, chainInfo.denom])

  const customFee = useMemo(() => {
    const gasEstimate = Math.ceil(Number(gasLimit) * gasAdjustment)
    return calculateFee(gasEstimate, gasPriceOption.gasPrice)
  }, [gasAdjustment, gasLimit, gasPriceOption.gasPrice])

  const handleCloseFeeSettingSheet = useCallback(() => {
    setShowFeesSettingSheet(false)
  }, [])

  const onGasPriceOptionChange = useCallback(
    (value: GasPriceOptionValue, feeBaseDenom: FeeTokenData) => {
      setGasPriceOption(value)
      setFeeDenom(feeBaseDenom.denom)
    },
    [],
  )

  const onSubmit = useCallback(async () => {
    const wallet = await getWallet()
    await onReviewTransaction(wallet, txCallback, false, {
      stdFee: customFee,
      feeDenom: feeDenom,
    })
  }, [customFee, feeDenom, getWallet, onReviewTransaction, txCallback])

  useEffect(() => {
    if (showReviewTransactionSheet) {
      return
    }
    const amountBN = new BigNumber(amount)
    const simulateAmount =
      !amountBN.isNaN() && amountBN.isGreaterThan(0)
        ? amount
        : new BigNumber(delegation?.balance?.amount ?? 0).dividedBy(10).toString()

    const timeout = setTimeout(() => {
      simulateTx(simulateAmount).then(({ gasUsed }) => {
        setRecommendedGasLimit(gasUsed.toString())
      })
    }, 250)

    return () => {
      clearTimeout(timeout)
    }
  }, [amount, delegation, showReviewTransactionSheet, simulateTx])

  const showAdjustmentSheet = useCallback(() => {
    setCheckForAutoAdjust(true)
  }, [])

  const hideAdjustmentSheet = useCallback(() => {
    setCheckForAutoAdjust(false)
  }, [])

  useEffect(() => {
    setGasPriceOption({
      gasPrice: defaultGasPrice.gasPrice,
      option: GasOptions.LOW,
    })
  }, [defaultGasPrice])

  if (token?.amount) token.amount = (+token.amount).toFixed(7)
  const inputAmountError = useMemo(() => {
    const trimmedAmount = amount.trim()
    if (trimmedAmount === '') {
      return null
    }
    const amountBN = new BigNumber(trimmedAmount)
    if (amountBN.isNaN()) {
      return 'Invalid amount'
    }
    if (amountBN.isLessThanOrEqualTo(0)) {
      return 'Amount must be greater than 0'
    }
    return null
  }, [amount])

  const balance = (mode === 'DELEGATE' ? token?.amount : delegation?.balance?.amount) ?? '0'

  const disableReview =
    !!inputAmountError ||
    !!gasError ||
    !amount ||
    +amount === 0 ||
    +balance === 0 ||
    +amount > +balance

  return (
    <GasPriceOptions
      recommendedGasLimit={recommendedGasLimit}
      gasLimit={gasLimit}
      setGasLimit={(value) => setGasLimit(value.toString())}
      gasPriceOption={gasPriceOption}
      onGasPriceOptionChange={onGasPriceOptionChange}
      error={gasError}
      setError={setGasError}
    >
      <div className='flex flex-col gap-y-4 mb-8 justify-center'>
        {fromValidator && delegation && mode === 'REDELEGATE' && (
          <CurrentValidatorCard delegation={delegation} fromValidator={fromValidator} />
        )}
        {!token && !delegation && (
          <div className='flex flex-col dark:bg-gray-900 h-[252px] w-[344px] justify-center items-center p-4 bg-white-100 rounded-2xl overflow-clip '>
            <Skeleton circle count={1} className='my-8' height={80} width={80} />
            <Skeleton count={1} width={300} />
            <Skeleton count={1} width={300} />
          </div>
        )}
        {token && mode === 'DELEGATE' && (
          <StakeInput
            name={token.symbol}
            amount={amount}
            stakeAllText={capitalize(mode.toLowerCase())}
            setAmount={setAmount}
            balance={formatTokenAmount(token.amount)}
            icon={token.img}
            onStakeAllClick={() => {
              setAmount(token.amount)
            }}
          />
        )}
        {delegation && mode !== 'DELEGATE' && (
          <StakeInput
            name={chainInfo.denom}
            amount={amount}
            setAmount={setAmount}
            stakeAllText={capitalize(mode.toLowerCase())}
            balance={delegation.balance?.amount ?? 0}
            icon={chainInfo.chainSymbolImageUrl}
            onStakeAllClick={() => setAmount(delegation.balance.amount)}
          />
        )}
        {inputAmountError ? (
          <p className='text-sm font-bold text-red-300 my-1 px-2'>{inputAmountError}</p>
        ) : null}
        <GenericCard
          isRounded={true}
          img={
            <Avatar
              size='sm'
              className='rounded-full overflow-hidden'
              avatarImage={toKeybaseImageUrl ?? toValidator?.image ?? Images.Misc.Validator}
              avatarOnError={imgOnError(Images.Misc.Validator)}
            />
          }
          title={
            <Text size='md' className='font-bold ml-3 w-[120px]'>
              {`${mode === 'REDELEGATE' ? 'New ' : ''}Validator`}
            </Text>
          }
          title2={
            <p className='text-right truncate w-[130px] py-2 text-ellipsis'>
              {toValidator?.moniker ?? toValidator?.name ?? ''}
            </p>
          }
        />
        <DisplayFee
          setDisplayFeeValue={setDisplayFeeValue}
          setShowFeesSettingSheet={setShowFeesSettingSheet}
        />
        {error && <ErrorCard text={error} />}
        <Buttons.Generic
          color={Colors.getChainColor(activeChain)}
          size='normal'
          className='w-[344px]'
          title='Review'
          disabled={disableReview}
          onClick={() => {
            if (mode === 'DELEGATE' && selectedToken && customFee) {
              showAdjustmentSheet()
            } else {
              setReviewTransactionSheet(true)
            }
          }}
        >
          Review
        </Buttons.Generic>
      </div>
      <FeesSettingsSheet
        showFeesSettingSheet={showFeesSettingSheet}
        onClose={handleCloseFeeSettingSheet}
        gasError={gasError}
      />
      {mode === 'DELEGATE' && selectedToken && customFee && checkForAutoAdjust ? (
        <AutoAdjustAmountSheet
          amount={amount}
          setAmount={setAmount}
          selectedToken={selectedToken}
          fee={customFee.amount[0]}
          setShowReviewSheet={setReviewTransactionSheet}
          closeAdjustmentSheet={hideAdjustmentSheet}
        />
      ) : null}
      <ReviewStakeTransaction
        gasError={gasError}
        error={error}
        feeDenom={feeDenom}
        displayFee={displayFeeValue}
        amount={amount}
        data={
          mode !== 'REDELEGATE'
            ? ({ toValidator } as DelegateUndelegateReviewProps)
            : ({
                fromValidator,
                toValidator,
              } as RedelegateReviewProps)
        }
        unstakingPeriod={unstakingPeriod}
        isLoading={isLoading}
        isVisible={showReviewTransactionSheet}
        memo={memo}
        setMemo={setMemo}
        onSubmit={onSubmit}
        type={mode}
        onCloseHandler={() => {
          clearError()
          setReviewTransactionSheet(false)
        }}
        showLedgerPopup={showLedgerPopup}
      />
    </GasPriceOptions>
  )
}
