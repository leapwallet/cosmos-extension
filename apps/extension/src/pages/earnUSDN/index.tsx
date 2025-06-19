import {
  EARN_MODE,
  FeeTokenData,
  formatTokenAmount,
  useEarnTx,
} from '@leapwallet/cosmos-wallet-hooks'
import { fromSmall } from '@leapwallet/cosmos-wallet-sdk'
import { Header, HeaderActionType } from '@leapwallet/leap-ui'
import {
  ArrowDown,
  ArrowLeft,
  CaretDown,
  CheckSquare,
  GasPump,
  Square,
} from '@phosphor-icons/react'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import GasPriceOptions, { useDefaultGasPrice } from 'components/gas-price-options'
import { DisplayFeeValue, GasPriceOptionValue } from 'components/gas-price-options/context'
import { DisplayFee } from 'components/gas-price-options/display-fee'
import { FeesSettingsSheet } from 'components/gas-price-options/fees-settings-sheet'
import { PageHeader } from 'components/header/PageHeaderV2'
import PopupLayout from 'components/layout/popup-layout'
import Text from 'components/text'
import { PageName } from 'config/analytics'
import { usePageView } from 'hooks/analytics/usePageView'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import useQuery from 'hooks/useQuery'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { useNavigate } from 'react-router'
import { miscellaneousDataStore } from 'stores/chain-infos-store'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { rootBalanceStore } from 'stores/root-store'
import { imgOnError } from 'utils/imgOnError'

import ReviewTxSheet from './ReviewTxSheet'
import Terms from './Terms'
import TxPage from './TxPage'

const EarnPage = observer(() => {
  // usePageView(PageName.USDN_REWARDS)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const query = useQuery()
  const [mode, setMode] = useState<EARN_MODE>(query.get('withdraw') ? 'withdraw' : 'deposit')
  const [showTerms, setShowTerms] = useState(false)
  const activeNetwork = useSelectedNetwork()
  const {
    amount,
    setAmount,
    sourceToken,
    setSourceToken,
    destinationToken,
    setDestinationToken,
    userPreferredGasLimit,
    recommendedGasLimit,
    setUserPreferredGasLimit,
    userPreferredGasPrice,
    gasOption,
    setGasOption,
    setUserPreferredGasPrice,
    setFeeDenom,
    amountOut,
    setError,
    onReviewTransaction,
    txHash,
    setTxHash,
    isLoading,
    customFee,
    error,
    showLedgerPopup,
    ledgerError,
  } = useEarnTx(rootDenomsStore.allDenoms, mode)
  const [showFeesSettingSheet, setShowFeesSettingSheet] = useState(false)
  const [isChecked, setIsChecked] = useState(true)
  const [amountError, setAmountError] = useState('')
  const [textInputValue, setTextInputValue] = useState('')
  const getWallet = Wallet.useGetWallet()
  const [showReviewTxSheet, setShowReviewTxSheet] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const allBalanceTokens = rootBalanceStore.allTokens
  const defaultGasPrice = useDefaultGasPrice(rootDenomsStore.allDenoms, {
    activeChain: 'noble',
  })
  const [gasError, setGasError] = useState<string | null>(null)
  const [gasPriceOption, setGasPriceOption] = useState<GasPriceOptionValue>({
    option: gasOption,
    gasPrice: userPreferredGasPrice ?? defaultGasPrice.gasPrice,
  })
  const [displayFeeValue, setDisplayFeeValue] = useState<DisplayFeeValue>()

  useEffect(() => {
    setGasPriceOption({
      option: gasOption,
      gasPrice: defaultGasPrice.gasPrice,
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultGasPrice.gasPrice.amount.toString(), defaultGasPrice.gasPrice.denom])

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

  useEffect(() => {
    let usdn = allBalanceTokens.find(
      (token) => token.coinMinimalDenom === 'uusdn' && token.tokenBalanceOnChain === 'noble',
    )
    if (!usdn) {
      usdn = {
        ...rootDenomsStore.allDenoms.uusdn,
        symbol: rootDenomsStore.allDenoms.uusdn?.coinDenom,
        amount: '0',
        img: rootDenomsStore.allDenoms.uusdn?.icon,
      }
    }
    let usdc = allBalanceTokens.find(
      (token) => token.coinMinimalDenom === 'uusdc' && token.tokenBalanceOnChain === 'noble',
    )
    if (!usdc) {
      usdc = {
        ...rootDenomsStore.allDenoms.usdc,
        symbol: rootDenomsStore.allDenoms.usdc?.coinDenom,
        amount: '0',
        img: rootDenomsStore.allDenoms.usdc?.icon,
      }
    }
    if (mode === 'deposit') {
      setSourceToken(usdc)
      setDestinationToken(usdn)
    } else {
      setSourceToken(usdn)
      setDestinationToken(usdc)
    }
  }, [allBalanceTokens, mode, query, setDestinationToken, setSourceToken])

  useEffect(() => {
    if (textInputValue && sourceToken) {
      if (
        new BigNumber(textInputValue).gt(0) &&
        new BigNumber(textInputValue).lte(sourceToken.amount ?? '0')
      ) {
        let val = textInputValue
        setAmountError('')
        if (
          customFee?.amount[0].denom === sourceToken.coinMinimalDenom &&
          new BigNumber(textInputValue)
            .plus(fromSmall(customFee?.amount[0].amount ?? '0'))
            .gt(sourceToken.amount)
        ) {
          const newVal = new BigNumber(sourceToken.amount).minus(
            fromSmall(customFee?.amount[0].amount ?? '0'),
          )
          if (newVal.gt(0)) {
            setTimeout(() => {
              setAmount(newVal.toString())
            }, 200)
            return
          } else {
            val = '0'
          }
        }
        setAmount(val)
      } else {
        setAmount('0')
        if (!new BigNumber(textInputValue).lte(sourceToken.amount ?? '0')) {
          setAmountError('Insufficient Balance')
        }
      }
    } else {
      setAmount('0')
      setAmountError('')
    }
  }, [customFee?.amount, setAmount, sourceToken, textInputValue])

  const handle25Click = () => {
    const amount = new BigNumber(sourceToken?.amount ?? '0')
    if (amount.gt(0)) {
      setTextInputValue(amount.dividedBy(4).toFixed(6, 1))
    }
  }

  const handle50Click = () => {
    const amount = new BigNumber(sourceToken?.amount ?? '0')
    if (amount.gt(0)) {
      setTextInputValue(amount.dividedBy(2).toFixed(6, 1))
    }
  }

  const handleMaxClick = () => {
    const amount = new BigNumber(sourceToken?.amount ?? '0').minus(
      customFee?.amount[0].denom === sourceToken?.coinMinimalDenom
        ? fromSmall(customFee?.amount[0].amount ?? '0')
        : '0',
    )
    if (amount.gt(0)) {
      setTextInputValue(amount.toFixed(6, 1))
    }
  }

  const isReviewDisabled =
    !new BigNumber(amountOut).gt(0) ||
    !new BigNumber(textInputValue).gt(0) ||
    isLoading ||
    !!amountError ||
    !!gasError ||
    !!error ||
    !!ledgerError ||
    (mode === 'deposit' && !isChecked)

  const handleConfirmTx = useCallback(async () => {
    setIsProcessing(true)
    try {
      const wallet = await getWallet('noble')
      onReviewTransaction(wallet, () => {}, false)
      setTxHash(txHash)
    } catch (error) {
      setError(error as string)
      setTimeout(() => {
        setError(undefined)
      }, 5000)
    } finally {
      setIsProcessing(false)
    }
  }, [getWallet, onReviewTransaction, setError, setTxHash, txHash])

  if (txHash) {
    return (
      <TxPage
        onClose={() => {
          setTxHash(undefined)
          setShowReviewTxSheet(false)
          setAmount('0')
          setAmountError('')
          setTextInputValue('')
        }}
        txHash={txHash}
        txType={mode}
        sourceToken={sourceToken}
        destinationToken={destinationToken}
      />
    )
  }

  if (showTerms) {
    return (
      <Terms
        onBack={() => setShowTerms(false)}
        onAgree={() => {
          setIsChecked(true)
          setShowTerms(false)
        }}
      />
    )
  }

  return (
    // <div className='relative h-full w-full'>
    <>
      {/* <PopupLayout
        header={
          <Header
            title='Earn'
            action={{
              type: HeaderActionType.BACK,
              onClick: () => {
                navigate(-1)
              },
            }}
          />
        }
      > */}
      <>
        <PageHeader>
          <ArrowLeft
            size={36}
            className='text-muted-foreground hover:text-foreground cursor-pointer p-2'
            onClick={() => {
              navigate(-1)
            }}
          />
          <span className='text-[18px] font-bold text-foreground'>Earn</span>
          <div className='w-9' />
        </PageHeader>
        <div className='flex flex-col p-6 !pb-4 items-center max-w-[400px] h-[calc(100%-72px)]'>
          <Text
            className='self-start mb-5 !inline'
            color='text-gray-600 dark:text-gray-400'
            size='sm'
          >
            Put your stable asset to work and earn
            {
              <strong className='text-green-600'>
                &nbsp;
                {parseFloat(miscellaneousDataStore.data?.noble?.usdnEarnApy) > 0
                  ? new BigNumber(miscellaneousDataStore.data.noble.usdnEarnApy)
                      .multipliedBy(100)
                      .toFixed(2) + '%'
                  : '-'}
                &nbsp;APY
              </strong>
            }{' '}
            with no lock-ups!
          </Text>

          <div className='relative flex flex-col gap-4 w-full'>
            <div className='flex flex-col gap-3 bg-secondary-100 rounded-xl p-5'>
              <p className='text-gray-600 dark:text-gray-400 text-sm font-medium !leading-[22.4px]'>
                Enter amount to deposit
              </p>
              <div className='flex rounded-2xl justify-between w-full items-center gap-2 h-[34px] p-[2px]'>
                <input
                  type='number'
                  className={classNames(
                    'bg-transparent outline-none w-full text-left placeholder:font-bold placeholder:text-[24px] placeholder:text-black-100 dark:placeholder:text-white-100 font-bold !leading-[32.4px] caret-green-600',
                    {
                      'text-red-400 dark:text-red-600': amountError,
                      'text-black-100 dark:text-white-100': !amountError,
                      'text-[24px]': textInputValue.length < 12,
                      'text-[22px]': textInputValue.length >= 12 && textInputValue.length < 15,
                      'text-[20px]': textInputValue.length >= 15 && textInputValue.length < 18,
                      'text-[18px]': textInputValue.length >= 18,
                    },
                  )}
                  placeholder={'0'}
                  value={textInputValue}
                  ref={inputRef}
                  onChange={(e) => setTextInputValue(e.target.value)}
                  autoFocus
                />
                <button
                  className={classNames(
                    'flex justify-end items-center gap-2 shrink-0 py-1 pl-1.5 pr-2.5 rounded-[40px] bg-gray-100 dark:bg-gray-800 cursor-default',
                  )}
                >
                  <div className='relative'>
                    <img
                      src={sourceToken?.img ?? Images.Logos.GenericDark}
                      className='w-[24px] h-[24px] rounded-full'
                      onError={imgOnError(Images.Logos.GenericDark)}
                    />
                  </div>

                  <p className='dark:text-white-100 text-sm font-medium'>{sourceToken?.symbol}</p>
                </button>
              </div>
              <div className='flex w-full justify-between'>
                <Text size='sm' color='text-gray-600 dark:text-gray-400' className='font-medium'>
                  {formatTokenAmount(sourceToken?.amount ?? '0', sourceToken?.symbol)}
                </Text>
                <div className='flex gap-1'>
                  <button
                    onClick={handle25Click}
                    className='rounded-full bg-gray-100 dark:bg-gray-850 px-[6px] py-0.5 font-medium text-xs hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-white-100 hover:text-black-100 !leading-[19.2px] text-gray-600 dark:text-gray-400'
                  >
                    25%
                  </button>
                  <button
                    onClick={handle50Click}
                    className='rounded-full bg-gray-100 dark:bg-gray-850 px-[6px] py-0.5 font-medium text-xs hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-white-100 hover:text-black-100 !leading-[19.2px] text-gray-600 dark:text-gray-400'
                  >
                    50%
                  </button>
                  <button
                    onClick={handleMaxClick}
                    className='rounded-full bg-gray-100 dark:bg-gray-850 px-[6px] py-0.5 font-medium text-xs hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-white-100 hover:text-black-100 !leading-[19.2px] text-gray-600 dark:text-gray-400'
                  >
                    Max
                  </button>
                </div>
              </div>
            </div>

            <div className='absolute p-[5px] bg-secondary-100 top-[130px] left-[calc(50%-20px)]'>
              <ArrowDown
                className=' text-black-100 dark:text-white-100 rounded-full bg-green-600 p-1.5'
                size={30}
              />
            </div>

            <div className='flex flex-col gap-3 bg-secondary-100 rounded-xl p-5'>
              <p className='text-gray-600 dark:text-gray-400 text-sm font-medium !leading-[22.4px]'>
                To
              </p>
              <div className='flex rounded-2xl justify-between w-full items-center gap-2 h-[34px] p-[2px]'>
                {isLoading ? (
                  <div className='w-[50px] h-full z-0'>
                    <Skeleton className='rounded-full bg-gray-50 dark:bg-gray-800' />
                  </div>
                ) : (
                  <input
                    type='number'
                    readOnly
                    className={classNames(
                      'bg-transparent outline-none w-full text-left placeholder:font-bold placeholder:text-[24px] placeholder:text-black-100 dark:placeholder:text-white-100 font-bold !leading-[32.4px] text-black-100 dark:text-white-100',
                      {
                        'text-[24px]': amountOut.length < 12,
                        'text-[22px]': amountOut.length >= 12 && amountOut.length < 15,
                        'text-[20px]': amountOut.length >= 15 && amountOut.length < 18,
                        'text-[18px]': amountOut.length >= 18,
                      },
                    )}
                    placeholder={'0'}
                    value={amountOut}
                  />
                )}
                <button
                  className={classNames(
                    'flex justify-end items-center gap-2 shrink-0 py-1 pl-1.5 pr-2.5 rounded-[40px] bg-gray-100 dark:bg-gray-800 cursor-default',
                  )}
                >
                  <div className='relative'>
                    <img
                      src={destinationToken?.img ?? Images.Logos.GenericDark}
                      className='w-[24px] h-[24px] rounded-full'
                      onError={imgOnError(Images.Logos.GenericDark)}
                    />
                  </div>

                  <p className='dark:text-white-100 text-sm font-medium'>
                    {destinationToken?.symbol}
                  </p>
                </button>
              </div>
            </div>

            {displayFeeValue?.fiatValue && new BigNumber(amount).gt(0) && !isLoading && (
              <div className='flex justify-between'>
                <Text size='sm' color='text-gray-600 dark:text-gray-400' className='font-medium'>
                  Fees
                </Text>
                <div
                  onClick={() => setShowFeesSettingSheet(true)}
                  className='flex gap-x-1 items-center hover:cursor-pointer ml-auto'
                >
                  <GasPump size={20} className='text-gray-800 dark:text-gray-200' />
                  <Text size='xs' color='text-gray-800 dark:text-gray-200' className='font-medium'>
                    {displayFeeValue?.fiatValue}
                  </Text>
                  <CaretDown size={16} className='text-gray-800 dark:text-gray-200' />
                </div>
              </div>
            )}
          </div>

          {(error || gasError || ledgerError) && (
            <p className='text-sm font-bold text-red-600 px-2 mt-2'>
              {error || gasError || ledgerError}
            </p>
          )}

          <button
            className={classNames(
              'w-full mt-auto text-md font-bold text-white-100 h-12 rounded-full cursor-pointer bg-green-600',
              {
                'hover:bg-green-500 ': !amountError && !isReviewDisabled,
                'bg-red-600': !!amountError,
                'opacity-40': isReviewDisabled,
              },
            )}
            disabled={isReviewDisabled}
            onClick={() => setShowReviewTxSheet(true)}
          >
            {amountError ? amountError : 'Swap now'}
          </button>
          {mode === 'deposit' && (
            <div className='flex items-center gap-1 mt-3.5'>
              <div className='cursor-pointer' onClick={() => setIsChecked(!isChecked)}>
                {isChecked ? (
                  <CheckSquare size={24} className='p-0.5 text-green-600' weight='fill' />
                ) : (
                  <Square size={24} className='p-0.5 text-green-600' />
                )}
              </div>
              <Text size='xs' color='dark:text-gray-400 text-gray-600'>
                I agree to the&nbsp;
                <p
                  className='text-green-500 font-medium cursor-pointer'
                  onClick={() => setShowTerms(true)}
                >
                  Terms & Conditions
                </p>
              </Text>
            </div>
          )}
        </div>
      </>
      {showReviewTxSheet && sourceToken && destinationToken && (
        <ReviewTxSheet
          amountIn={amount}
          amountOut={amountOut}
          destination={destinationToken}
          source={sourceToken}
          isOpen={showReviewTxSheet}
          onClose={() => setShowReviewTxSheet(false)}
          onConfirm={handleConfirmTx}
          isProcessing={isProcessing || isLoading}
          error={error || gasError || ledgerError}
          showLedgerPopup={showLedgerPopup}
        />
      )}
      <GasPriceOptions
        recommendedGasLimit={recommendedGasLimit.toString()}
        gasLimit={userPreferredGasLimit?.toString() ?? recommendedGasLimit.toString()}
        setGasLimit={(value: number | string | BigNumber) =>
          setUserPreferredGasLimit(Number(value.toString()))
        }
        gasPriceOption={gasPriceOption}
        onGasPriceOptionChange={onGasPriceOptionChange}
        error={gasError}
        setError={setGasError}
        chain={'noble'}
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
    // </PopupLayout>
    // </div>
  )
})

export default EarnPage
