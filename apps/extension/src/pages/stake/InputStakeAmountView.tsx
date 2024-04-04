import {
  FeeTokenData,
  formatTokenAmount,
  useActiveStakingDenom,
  useChainInfo,
  useformatCurrency,
  useGetTokenBalances,
  useStakeTx,
  useValidatorImage,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/constants'
import { Delegation } from '@leapwallet/cosmos-wallet-sdk/dist/types/staking'
import { Validator } from '@leapwallet/cosmos-wallet-sdk/dist/types/validators'
import { Avatar, Buttons, GenericCard, StakeInput } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import { ErrorCard } from 'components/ErrorCard'
import GasPriceOptions, { useDefaultGasPrice } from 'components/gas-price-options'
import { DisplayFeeValue, GasPriceOptionValue } from 'components/gas-price-options/context'
import { DisplayFee } from 'components/gas-price-options/display-fee'
import { FeesSettingsSheet } from 'components/gas-price-options/fees-settings-sheet'
import Text from 'components/text'
import { Images } from 'images'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
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
import { Colors } from 'theme/colors'

export type STAKE_MODE =
  | 'DELEGATE'
  | 'UNDELEGATE'
  | 'REDELEGATE'
  | 'CLAIM_REWARDS'
  | 'CANCEL_UNDELEGATION'

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
  const getWallet = useGetWallet()
  const txCallback = useTxCallBack()
  const defaultGasPrice = useDefaultGasPrice()
  const [activeStakingDenom] = useActiveStakingDenom()

  const activeChainInfo = useChainInfo()
  const { allAssets } = useGetTokenBalances()
  const [formatCurrency] = useformatCurrency()
  const { data: toKeybaseImageUrl } = useValidatorImage(toValidator)

  const [checkForAutoAdjust, setCheckForAutoAdjust] = useState(false)
  const [showReviewTransactionSheet, setReviewTransactionSheet] = useState<boolean>(false)
  const [showFeesSettingSheet, setShowFeesSettingSheet] = useState<boolean>(false)
  const [displayFeeValue, setDisplayFeeValue] = useState<DisplayFeeValue>()

  const {
    recommendedGasLimit,
    amount,
    error,
    clearError,
    memo,
    onReviewTransaction,
    setMemo,
    setAmount,
    showLedgerPopup,
    isLoading,
    setLedgerError,
    ledgerError,
    tokenFiatValue,
    userPreferredGasPrice,
    gasOption,
    userPreferredGasLimit,
    setUserPreferredGasLimit,
    feeDenom,
    setFeeDenom,
    customFee,
  } = useStakeTx(mode, toValidator, fromValidator, [delegation as Delegation])

  const [gasError, setGasError] = useState<string | null>(null)
  const [gasPriceOption, setGasPriceOption] = useState<GasPriceOptionValue>({
    option: gasOption,
    gasPrice: userPreferredGasPrice ?? defaultGasPrice.gasPrice,
  })

  const selectedToken = useMemo(() => {
    return allAssets.find((asset) => asset.symbol === activeStakingDenom.coinDenom)
  }, [allAssets, activeStakingDenom.coinDenom])

  const handleCloseFeeSettingSheet = useCallback(() => {
    setShowFeesSettingSheet(false)
  }, [])

  const onGasPriceOptionChange = useCallback(
    (value: GasPriceOptionValue, feeBaseDenom: FeeTokenData) => {
      setGasPriceOption(value)
      setFeeDenom(feeBaseDenom.denom)
    },
    [setFeeDenom],
  )

  const onSubmit = useCallback(async () => {
    try {
      const wallet = await getWallet()
      await onReviewTransaction(wallet, txCallback, false, {
        stdFee: customFee,
        feeDenom: feeDenom,
      })
    } catch (error: unknown) {
      const _error = error as Error
      setLedgerError(_error.message)

      setTimeout(() => {
        setLedgerError('')
      }, 6000)
    }
  }, [customFee, feeDenom, getWallet, onReviewTransaction, setLedgerError, txCallback])

  const showAdjustmentSheet = useCallback(() => {
    setCheckForAutoAdjust(true)
  }, [])

  const hideAdjustmentSheet = useCallback(() => {
    setCheckForAutoAdjust(false)
  }, [])

  // initialize gasPriceOption with correct defaultGasPrice.gasPrice
  useEffect(() => {
    setGasPriceOption({
      option: gasOption,
      gasPrice: defaultGasPrice.gasPrice,
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultGasPrice.gasPrice])

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
    !!inputAmountError || !amount || +amount === 0 || +balance === 0 || +amount > +balance

  return (
    <GasPriceOptions
      recommendedGasLimit={recommendedGasLimit}
      gasLimit={userPreferredGasLimit?.toString() ?? recommendedGasLimit}
      setGasLimit={(value: number) => setUserPreferredGasLimit(Number(value.toString()))}
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
            usdValue={
              amount && tokenFiatValue
                ? formatCurrency(new BigNumber(tokenFiatValue).times(amount))
                : token.symbol
            }
            name={token.symbol}
            amount={amount}
            stakeAllText={capitalize(mode.toLowerCase())}
            setAmount={setAmount}
            balance={formatTokenAmount(token.amount)}
            icon={activeChainInfo.chainSymbolImageUrl}
            onStakeAllClick={() => {
              setAmount(token.amount)
            }}
          />
        )}

        {delegation && mode !== 'DELEGATE' && (
          <StakeInput
            usdValue={
              amount && tokenFiatValue
                ? formatCurrency(new BigNumber(tokenFiatValue).times(amount))
                : activeStakingDenom.coinDenom
            }
            name={activeStakingDenom.coinDenom}
            amount={amount}
            setAmount={setAmount}
            stakeAllText={capitalize(mode.toLowerCase())}
            balance={delegation.balance?.amount ?? 0}
            icon={activeChainInfo.chainSymbolImageUrl}
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

        {(error ?? ledgerError) && <ErrorCard text={error ?? ledgerError} />}
        {gasError && !showFeesSettingSheet ? (
          <p className='text-red-300 text-sm font-medium text-center'>{gasError}</p>
        ) : null}

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
        ledgerError={ledgerError}
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
        showLedgerPopup={!ledgerError && showLedgerPopup}
        gasOption={gasPriceOption.option}
      />
    </GasPriceOptions>
  )
}
