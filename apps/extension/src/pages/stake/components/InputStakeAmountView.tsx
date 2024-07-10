import {
  capitalize,
  FeeTokenData,
  formatTokenAmount,
  Token,
  useActiveStakingDenom,
  useChainInfo,
  useformatCurrency,
  useGetTokenSpendableBalances,
  useStakeTx,
  useValidatorImage,
} from '@leapwallet/cosmos-wallet-hooks'
import { Delegation, SupportedChain, Validator } from '@leapwallet/cosmos-wallet-sdk'
import { Avatar, Buttons, GenericCard, StakeInput } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import { AutoAdjustAmountSheet } from 'components/auto-adjust-amount-sheet'
import { ErrorCard } from 'components/ErrorCard'
import GasPriceOptions, { useDefaultGasPrice } from 'components/gas-price-options'
import { DisplayFeeValue, GasPriceOptionValue } from 'components/gas-price-options/context'
import { DisplayFee } from 'components/gas-price-options/display-fee'
import { FeesSettingsSheet } from 'components/gas-price-options/fees-settings-sheet'
import Text from 'components/text'
import { SelectedNetwork } from 'hooks/settings/useNetwork'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { Colors } from 'theme/colors'
import { imgOnError } from 'utils/imgOnError'
import { useTxCallBack } from 'utils/txCallback'

import {
  CurrentValidatorCard,
  DelegateUndelegateReviewProps,
  RedelegateReviewProps,
  ReviewStakeTransaction,
} from './index'

const useGetWallet = Wallet.useGetWallet
type STAKE_MODE = 'DELEGATE' | 'UNDELEGATE' | 'REDELEGATE' | 'CLAIM_REWARDS' | 'CANCEL_UNDELEGATION'

type InputStakeAmountViewProps = {
  toValidator: Validator
  fromValidator?: Validator
  delegation?: Delegation
  activeChain: SupportedChain
  token: Token
  unstakingPeriod: string
  mode: STAKE_MODE
  activeNetwork: SelectedNetwork
}

const InputStakeAmountView = React.memo(
  ({
    toValidator,
    fromValidator,
    activeChain,
    token,
    delegation,
    mode,
    unstakingPeriod,
    activeNetwork,
  }: InputStakeAmountViewProps) => {
    const getWallet = useGetWallet()
    const txCallback = useTxCallBack()
    const defaultGasPrice = useDefaultGasPrice({
      activeChain,
      selectedNetwork: activeNetwork,
    })
    const [activeStakingDenom] = useActiveStakingDenom(activeChain, activeNetwork)

    const activeChainInfo = useChainInfo(activeChain)
    const { allAssets } = useGetTokenSpendableBalances(activeChain, activeNetwork)
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
    } = useStakeTx(
      mode,
      toValidator,
      fromValidator,
      [delegation as Delegation],
      activeChain,
      activeNetwork,
    )

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
        const wallet = await getWallet(activeChain)
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
    }, [
      activeChain,
      customFee,
      feeDenom,
      getWallet,
      onReviewTransaction,
      setLedgerError,
      txCallback,
    ])

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
    }, [defaultGasPrice.gasPrice.amount.toString(), defaultGasPrice.gasPrice.denom])

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
        chain={activeChain}
        network={activeNetwork}
      >
        <div className='flex flex-col gap-y-4 mb-8 justify-center'>
          {fromValidator && delegation && mode === 'REDELEGATE' && (
            <CurrentValidatorCard delegation={delegation} fromValidator={fromValidator} />
          )}

          {!token && !delegation && (
            <div className='flex flex-col dark:bg-gray-950 h-[252px] w-[344px] justify-center items-center p-4 bg-white-100 rounded-2xl overflow-clip '>
              <Skeleton circle count={1} className='my-8' height={80} width={80} />
              <Skeleton count={1} width={300} />
              <Skeleton count={1} width={300} />
            </div>
          )}

          {token && mode === 'DELEGATE' && (
            <div className='[&>div]:dark:!bg-gray-950 [&>div_input]:dark:!bg-gray-950'>
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
            </div>
          )}

          {delegation && mode !== 'DELEGATE' && (
            <div className='[&>div]:dark:!bg-gray-950 [&>div_input]:dark:!bg-gray-950'>
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
            </div>
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
            className='dark:!bg-gray-950'
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
            forceChain={activeChain}
            forceNetwork={activeNetwork}
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
          activeChain={activeChain}
          activeNetwork={activeNetwork}
        />
      </GasPriceOptions>
    )
  },
)

InputStakeAmountView.displayName = 'InputStakeAmountView'
export { InputStakeAmountView, STAKE_MODE }
