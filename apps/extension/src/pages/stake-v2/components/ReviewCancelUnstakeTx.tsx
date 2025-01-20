import {
  daysLeft,
  FeeTokenData,
  SelectedNetwork,
  sliceWord,
  useActiveChain,
  useActiveStakingDenom,
  useSelectedNetwork,
  useStakeTx,
  useValidatorImage,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain, UnbondingDelegationEntry, Validator } from '@leapwallet/cosmos-wallet-sdk'
import { RootBalanceStore, RootDenomsStore } from '@leapwallet/cosmos-wallet-store'
import { Buttons, ThemeName, useTheme } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import BottomModal from 'components/bottom-modal'
import GasPriceOptions, { useDefaultGasPrice } from 'components/gas-price-options'
import { GasPriceOptionValue } from 'components/gas-price-options/context'
import { DisplayFee } from 'components/gas-price-options/display-fee'
import { FeesSettingsSheet } from 'components/gas-price-options/fees-settings-sheet'
import LedgerConfirmationPopup from 'components/ledger-confirmation/LedgerConfirmationPopup'
import Text from 'components/text'
import { EventName } from 'config/analytics'
import { useDefaultTokenLogo } from 'hooks'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useCaptureTxError } from 'hooks/utility/useCaptureTxError'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import { GenericLight } from 'images/logos'
import loadingImage from 'lottie-files/swaps-btn-loading.json'
import Lottie from 'lottie-react'
import mixpanel from 'mixpanel-browser'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { Colors } from 'theme/colors'
import { imgOnError } from 'utils/imgOnError'
import { isSidePanel } from 'utils/isSidePanel'
import { timeLeft } from 'utils/timeLeft'
import useGetWallet = Wallet.useGetWallet

import { Info } from '@phosphor-icons/react'
import { useCaptureUIException } from 'hooks/perf-monitoring/useCaptureUIException'
import { isCompassWallet } from 'utils/isCompassWallet'

import { StakeTxnPageState } from '../StakeTxnPage'

interface ReviewCancelUnstakeTxProps {
  isOpen: boolean
  onClose: () => void
  validator: Validator
  unbondingDelegationEntry?: UnbondingDelegationEntry
  rootDenomsStore: RootDenomsStore
  rootBalanceStore: RootBalanceStore
  forceChain?: SupportedChain
  forceNetwork?: SelectedNetwork
}

const ReviewCancelUnstakeTx = observer(
  ({
    isOpen,
    onClose,
    validator,
    unbondingDelegationEntry,
    rootDenomsStore,
    rootBalanceStore,
    forceChain,
    forceNetwork,
  }: ReviewCancelUnstakeTxProps) => {
    const denoms = rootDenomsStore.allDenoms
    const getWallet = useGetWallet()

    const _activeChain = useActiveChain()
    const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain])

    const _activeNetwork = useSelectedNetwork()
    const activeNetwork = useMemo(
      () => forceNetwork || _activeNetwork,
      [_activeNetwork, forceNetwork],
    )

    const defaultGasPrice = useDefaultGasPrice(denoms, {
      activeChain,
      selectedNetwork: activeNetwork,
    })

    const [formatCurrency] = useFormatCurrency()
    const [activeStakingDenom] = useActiveStakingDenom(denoms, activeChain, activeNetwork)
    const defaultTokenLogo = useDefaultTokenLogo()
    const { theme } = useTheme()

    const {
      showLedgerPopup,
      onReviewTransaction,
      isLoading,
      error,
      setAmount,
      recommendedGasLimit,
      userPreferredGasLimit,
      setUserPreferredGasLimit,
      setUserPreferredGasPrice,
      gasOption,
      setGasOption,
      userPreferredGasPrice,
      setFeeDenom,
      setCreationHeight,
      ledgerError,
      setLedgerError,
      customFee,
      feeDenom,
    } = useStakeTx(
      denoms,
      'CANCEL_UNDELEGATION',
      validator as Validator,
      undefined,
      undefined,
      activeChain,
      activeNetwork,
    )

    const [showFeesSettingSheet, setShowFeesSettingSheet] = useState<boolean>(false)
    const [gasError, setGasError] = useState<string | null>(null)
    const [gasPriceOption, setGasPriceOption] = useState<GasPriceOptionValue>({
      option: gasOption,
      gasPrice: userPreferredGasPrice ?? defaultGasPrice.gasPrice,
    })
    const navigate = useNavigate()
    const { data: imageUrl } = useValidatorImage(validator)

    useCaptureTxError(error)

    useEffect(() => {
      setCreationHeight((unbondingDelegationEntry as UnbondingDelegationEntry).creation_height)
      setAmount((unbondingDelegationEntry as UnbondingDelegationEntry).balance)

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [unbondingDelegationEntry])

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

    const handleCloseFeeSettingSheet = useCallback(() => {
      setShowFeesSettingSheet(false)
    }, [])

    const txCallback = useCallback(() => {
      const state = {
        validator: validator,
        mode: 'CANCEL_UNDELEGATION',
        forceChain: activeChain,
        forceNetwork: activeNetwork,
      } as StakeTxnPageState

      sessionStorage.setItem('navigate-stake-pending-txn-state', JSON.stringify(state))
      navigate('/stake/pending-txn', {
        state,
      })

      mixpanel.track(EventName.TransactionSigned, {
        transactionType: 'stake_cancel_undelegate',
      })
    }, [activeChain, activeNetwork, navigate, validator])

    const onSubmit = useCallback(async () => {
      try {
        const wallet = await getWallet(activeChain)
        onReviewTransaction(wallet, txCallback, false, {
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
      customFee,
      feeDenom,
      getWallet,
      onReviewTransaction,
      setLedgerError,
      txCallback,
      activeChain,
    ])

    useCaptureUIException(ledgerError || error, {
      activeChain,
      activeNetwork,
    })

    return (
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
        <BottomModal
          isOpen={isOpen}
          onClose={onClose}
          title='Review Transaction'
          closeOnBackdropClick={true}
          className='p-6'
        >
          <div className='flex flex-col items-center w-full gap-y-4'>
            <div className='flex flex-col gap-y-2'>
              <div className='flex items-center gap-x-2'>
                <Info size={20} className='text-orange-500 dark:text-orange-300' />

                <Text size='sm' className='font-bold'>
                  Confirm Unstaking
                </Text>
              </div>

              <Text size='xs' color='text-gray-800 dark:text-gray-200'>
                This will reset the unstaking period and stake the tokens back to the validator
              </Text>
            </div>

            <div className='flex gap-x-4 w-full p-4 bg-white-100 dark:bg-gray-950 rounded-lg'>
              <img
                className='w-9 h-9'
                src={activeStakingDenom.icon}
                onError={imgOnError(defaultTokenLogo)}
              />
              <div>
                <Text
                  color='text-black-100 dark:text-white-100'
                  size='sm'
                  className='font-bold mb-0.5'
                >
                  {formatCurrency(new BigNumber(unbondingDelegationEntry?.currencyBalance ?? ''))}
                </Text>

                <Text color='text-gray-600 dark:text-gray-400' size='xs' className='font-medium'>
                  {unbondingDelegationEntry?.formattedBalance}
                </Text>
              </div>

              <div className='ml-auto flex flex-col items-end'>
                <Text
                  color='text-black-100 dark:text-white-100'
                  size='sm'
                  className='font-bold mb-0.5'
                >
                  {timeLeft(unbondingDelegationEntry?.completion_time ?? '')}
                </Text>

                <Text color='text-gray-600 dark:text-gray-400' size='xs' className='font-medium'>
                  {unbondingDelegationEntry?.completion_time &&
                    daysLeft(unbondingDelegationEntry?.completion_time)}
                </Text>
              </div>
            </div>

            <div className='flex gap-x-4 w-full p-4 bg-white-100 dark:bg-gray-950 rounded-lg'>
              <img
                className='w-9 h-9'
                src={imageUrl ?? validator?.image ?? Images.Misc.Validator}
                onError={imgOnError(GenericLight)}
              />

              <div>
                <Text
                  color='text-black-100 dark:text-white-100'
                  size='sm'
                  className='font-bold mb-0.5'
                >
                  {sliceWord(
                    validator?.moniker,
                    isSidePanel()
                      ? 15 + Math.floor(((Math.min(window.innerWidth, 400) - 320) / 81) * 7)
                      : 10,
                    3,
                  )}
                </Text>

                <Text color='text-gray-600 dark:text-gray-400' size='xs' className='font-medium'>
                  Validator
                </Text>
              </div>
            </div>

            <DisplayFee setShowFeesSettingSheet={setShowFeesSettingSheet} />

            {ledgerError && (
              <p className='text-sm font-bold text-red-300 my-1 px-2'>{ledgerError}</p>
            )}
            {error && <p className='text-sm font-bold text-red-300 my-1 px-2'>{error}</p>}
            {gasError && !showFeesSettingSheet && (
              <p className='text-sm font-bold text-red-300 my-1 px-2'>{gasError}</p>
            )}

            <div className='flex gap-x-4 w-full'>
              <Buttons.Generic
                onClick={onClose}
                color={theme === ThemeName.DARK ? Colors.gray800 : Colors.gray200}
                className='w-full'
                size='normal'
              >
                <Text color='dark:text-white-100 text-black-100'>Cancel</Text>
              </Buttons.Generic>

              <Buttons.Generic
                onClick={onSubmit}
                color={isCompassWallet() ? Colors.compassPrimary : Colors.green600}
                className='w-full'
                size='normal'
                disabled={isLoading || !!error || !!gasError || !!ledgerError}
              >
                {isLoading ? (
                  <Lottie
                    loop={true}
                    autoplay={true}
                    animationData={loadingImage}
                    rendererSettings={{
                      preserveAspectRatio: 'xMidYMid slice',
                    }}
                    className={'h-[28px] w-[28px]'}
                  />
                ) : (
                  'Confirm'
                )}
              </Buttons.Generic>
            </div>
          </div>
        </BottomModal>

        {showLedgerPopup && <LedgerConfirmationPopup showLedgerPopup={showLedgerPopup} />}
        <FeesSettingsSheet
          showFeesSettingSheet={showFeesSettingSheet}
          onClose={handleCloseFeeSettingSheet}
          gasError={gasError}
        />
      </GasPriceOptions>
    )
  },
)

export default ReviewCancelUnstakeTx
