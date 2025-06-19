import {
  FeeTokenData,
  SelectedNetwork,
  sliceWord,
  STAKE_MODE,
  useActiveChain,
  useActiveStakingDenom,
  useSelectedNetwork,
  useStakeTx,
  useValidatorImage,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain, UnbondingDelegationEntry, Validator } from '@leapwallet/cosmos-wallet-sdk'
import { useTheme } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import GasPriceOptions, { useDefaultGasPrice } from 'components/gas-price-options'
import { GasPriceOptionValue } from 'components/gas-price-options/context'
import { DisplayFee } from 'components/gas-price-options/display-fee'
import { FeesSettingsSheet } from 'components/gas-price-options/fees-settings-sheet'
import LedgerConfirmationPopup from 'components/ledger-confirmation/LedgerConfirmationPopup'
import BottomModal from 'components/new-bottom-modal'
import { Button } from 'components/ui/button'
import { EventName } from 'config/analytics'
import { useCaptureUIException } from 'hooks/perf-monitoring/useCaptureUIException'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useCaptureTxError } from 'hooks/utility/useCaptureTxError'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import loadingImage from 'lottie-files/swaps-btn-loading.json'
import Lottie from 'lottie-react'
import mixpanel from 'mixpanel-browser'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { rootBalanceStore } from 'stores/root-store'
import { isSidePanel } from 'utils/isSidePanel'

import { transitionTitleMap } from '../utils/stake-text'
import { ClaimCard } from './ReviewClaimTx'

import useGetWallet = Wallet.useGetWallet
interface ReviewCancelUnstakeTxProps {
  isOpen: boolean
  onClose: () => void
  validator: Validator
  unbondingDelegationEntry?: UnbondingDelegationEntry
  forceChain?: SupportedChain
  forceNetwork?: SelectedNetwork
  setClaimTxMode: (mode: STAKE_MODE | 'CLAIM_AND_DELEGATE' | null) => void
}

const ReviewCancelUnstakeTx = observer(
  ({
    isOpen,
    onClose,
    validator,
    unbondingDelegationEntry,
    forceChain,
    forceNetwork,
    setClaimTxMode,
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
    const { data: validatorImage } = useValidatorImage(validator?.image ? undefined : validator)
    const imageUrl = validator?.image || validatorImage || Images.Misc.Validator

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
      setClaimTxMode('CANCEL_UNDELEGATION')
      // mixpanel.track(EventName.TransactionSigned, {
      //   transactionType: 'stake_cancel_undelegate',
      // })
      onClose()
    }, [onClose, setClaimTxMode])

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
        rootBalanceStore={rootBalanceStore}
        rootDenomsStore={rootDenomsStore}
      >
        <BottomModal
          isOpen={isOpen}
          onClose={onClose}
          title={transitionTitleMap.CANCEL_UNDELEGATION}
          className='p-6'
        >
          <div className='flex flex-col items-center w-full gap-y-4'>
            {/* <div className='flex items-start gap-1.5 px-3 py-2.5 rounded-xl text-orange-500 dark:text-orange-300 bg-orange-500/10 dark:bg-orange-400/10'>
              <Info size={16} className='shrink-0' />
              <div className='flex gap-2 flex-col'>
                <span className='text-xs font-medium'>
                  This will reset the unstaking period and stake the tokens back to the validator
                </span>
              </div>
            </div> */}
            <span className='text-sm text-foreground'>
              This will reset the unstaking period and stake the tokens back to the validator
            </span>
            <ClaimCard
              title={formatCurrency(new BigNumber(unbondingDelegationEntry?.currencyBalance ?? ''))}
              subText={unbondingDelegationEntry?.formattedBalance}
              imgSrc={activeStakingDenom.icon}
            />
            {/* <div className='ml-auto flex flex-col items-end'>
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
            </div> */}
            <ClaimCard
              title={sliceWord(
                validator?.moniker,
                isSidePanel()
                  ? 15 + Math.floor(((Math.min(window.innerWidth, 400) - 320) / 81) * 7)
                  : 10,
                3,
              )}
              subText='Validator'
              imgSrc={imageUrl}
            />
          </div>

          <div className='flex items-center w-full justify-between mt-5 mb-7'>
            <span className='text-sm text-muted-foreground font-medium'>Fees</span>
            <DisplayFee setShowFeesSettingSheet={setShowFeesSettingSheet} />
          </div>

          <div className='flex flex-col items-center w-full gap-y-2'>
            {ledgerError && (
              <p className='text-sm font-bold text-destructive-100 px-2'>{ledgerError}</p>
            )}
            {error && <p className='text-sm font-bold text-destructive-100 px-2'>{error}</p>}
            {gasError && !showFeesSettingSheet && (
              <p className='text-sm font-bold text-destructive-100 px-2'>{gasError}</p>
            )}

            <Button
              onClick={onSubmit}
              className='w-full'
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
                  className={'h-[24px] w-[24px]'}
                />
              ) : (
                'Confirm'
              )}
            </Button>
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
