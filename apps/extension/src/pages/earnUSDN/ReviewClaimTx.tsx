import { useEarnTx } from '@leapwallet/cosmos-wallet-hooks'
import { NativeDenom } from '@leapwallet/cosmos-wallet-sdk'
import { FeeTokenData } from '@leapwallet/cosmos-wallet-store'
import { formatTokenAmount } from '@leapwallet/cosmos-wallet-store/dist/utils'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import GasPriceOptions, { useDefaultGasPrice } from 'components/gas-price-options'
import { DisplayFeeValue, GasPriceOptionValue } from 'components/gas-price-options/context'
import { DisplayFee } from 'components/gas-price-options/display-fee'
import { FeesSettingsSheet } from 'components/gas-price-options/fees-settings-sheet'
import LedgerConfirmationPopup from 'components/ledger-confirmation/LedgerConfirmationPopup'
import BottomModal from 'components/new-bottom-modal'
import Text from 'components/text'
import { useSelectedNetwork } from 'hooks/settings/useNetwork'
import { Wallet } from 'hooks/wallet/useWallet'
import loadingImage from 'lottie-files/swaps-btn-loading.json'
import Lottie from 'lottie-react'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useState } from 'react'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { rootBalanceStore } from 'stores/root-store'

type Props = {
  isOpen: boolean
  onClose: () => void
  denom: NativeDenom
  amount: string
  setTxHash: (val: string) => void
}

const ReviewClaimTxSheet = observer(({ isOpen, onClose, denom, amount, setTxHash }: Props) => {
  const activeNetwork = useSelectedNetwork()
  const {
    setAmount,
    userPreferredGasLimit,
    recommendedGasLimit,
    setUserPreferredGasLimit,
    userPreferredGasPrice,
    gasOption,
    setGasOption,
    setUserPreferredGasPrice,
    setFeeDenom,
    onReviewTransaction,
    txHash,
    isLoading,
    setError,
    error,
    ledgerError,
    showLedgerPopup,
  } = useEarnTx(rootDenomsStore.allDenoms, 'claim')
  const getWallet = Wallet.useGetWallet()
  const [isProcessing, setIsProcessing] = useState(false)
  const [showFeesSettingSheet, setShowFeesSettingSheet] = useState(false)

  const defaultGasPrice = useDefaultGasPrice(rootDenomsStore.allDenoms, {
    activeChain: 'noble',
  })
  const [gasError, setGasError] = useState<string | null>(null)
  const [gasPriceOption, setGasPriceOption] = useState<GasPriceOptionValue>({
    option: gasOption,
    gasPrice: userPreferredGasPrice ?? defaultGasPrice.gasPrice,
  })
  const [displayFeeValue, setDisplayFeeValue] = useState<DisplayFeeValue>()
  const isReviewDisabled = isLoading || !!error || !!gasError || !!ledgerError || isProcessing

  const handleConfirmTx = useCallback(async () => {
    setIsProcessing(true)
    try {
      const wallet = await getWallet('noble')
      onReviewTransaction(wallet, () => {}, false)
    } catch (error) {
      setError(error as string)
      setTimeout(() => {
        setError(undefined)
      }, 5000)
    } finally {
      setIsProcessing(false)
    }
  }, [getWallet, onReviewTransaction, setError])

  useEffect(() => {
    if (txHash) {
      setTxHash(txHash)
    }
  }, [setTxHash, txHash])

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
    setAmount(amount)
  }, [amount, setAmount])

  return (
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
      <BottomModal
        title='Confirm Transaction'
        isOpen={isOpen}
        onClose={onClose}
        className='p-6 z-10'
      >
        <div className='flex flex-col gap-4 w-full'>
          <div className='w-full bg-gray-50 dark:bg-gray-900 flex items-center justify-between p-4 gap-2 rounded-2xl mb-4'>
            <div className='flex items-center w-full gap-5'>
              <img src={denom.icon} className='w-11 h-11' />
              <Text color='text-black-100 dark:text-white-100' size='sm' className='font-bold'>
                {formatTokenAmount(amount, denom.coinDenom, 5)}
              </Text>
            </div>
          </div>

          <DisplayFee setShowFeesSettingSheet={setShowFeesSettingSheet} />

          {(error || gasError || ledgerError) && (
            <p className='text-sm font-bold text-red-600 px-2 mt-2'>
              {error || gasError || ledgerError}
            </p>
          )}
          <button
            className={classNames(
              'w-full text-md font-bold text-white-100 h-12 rounded-full cursor-pointer bg-green-600',
              {
                'hover:bg-green-500 ': !isReviewDisabled,
                'opacity-40': isReviewDisabled,
              },
            )}
            disabled={isReviewDisabled}
            onClick={handleConfirmTx}
          >
            {isProcessing ? (
              <Lottie
                loop={true}
                autoplay={true}
                animationData={loadingImage}
                rendererSettings={{
                  preserveAspectRatio: 'xMidYMid slice',
                }}
                className={'h-[24px] w-[24px]'}
              />
            ) : (
              'Confirm Claim'
            )}
          </button>
        </div>
      </BottomModal>
      {showLedgerPopup && <LedgerConfirmationPopup showLedgerPopup={showLedgerPopup} />}
      <FeesSettingsSheet
        showFeesSettingSheet={showFeesSettingSheet}
        onClose={() => setShowFeesSettingSheet(false)}
        gasError={gasError}
      />
    </GasPriceOptions>
  )
})

export default ReviewClaimTxSheet
