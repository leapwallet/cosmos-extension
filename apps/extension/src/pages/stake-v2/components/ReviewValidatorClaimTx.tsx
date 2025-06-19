import {
  FeeTokenData,
  formatTokenAmount,
  SelectedNetwork,
  sliceWord,
  STAKE_MODE,
  useActiveChain,
  useActiveStakingDenom,
  useSelectedNetwork,
  useStakeTx,
  useValidatorImage,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain, Validator } from '@leapwallet/cosmos-wallet-sdk'
import { Card } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import GasPriceOptions, { useDefaultGasPrice } from 'components/gas-price-options'
import { GasPriceOptionValue } from 'components/gas-price-options/context'
import { DisplayFee } from 'components/gas-price-options/display-fee'
import { FeesSettingsSheet } from 'components/gas-price-options/fees-settings-sheet'
import LedgerConfirmationPopup from 'components/ledger-confirmation/LedgerConfirmationPopup'
import BottomModal from 'components/new-bottom-modal'
import Text from 'components/text'
import { EventName } from 'config/analytics'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useCaptureTxError } from 'hooks/utility/useCaptureTxError'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import loadingImage from 'lottie-files/swaps-btn-loading.json'
import Lottie from 'lottie-react'
import mixpanel from 'mixpanel-browser'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { imgOnError } from 'utils/imgOnError'
import { isSidePanel } from 'utils/isSidePanel'
import useGetWallet = Wallet.useGetWallet

import { Delegation } from '@leapwallet/cosmos-wallet-sdk'
import { Button } from 'components/ui/button'
import { useCaptureUIException } from 'hooks/perf-monitoring/useCaptureUIException'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { rootBalanceStore } from 'stores/root-store'
import { claimRewardsStore } from 'stores/stake-store'

import { StakeTxnPageState } from '../StakeTxnPage'
import { transitionTitleMap } from '../utils/stake-text'
import { ClaimCard } from './ReviewClaimTx'

interface ReviewValidatorClaimTxProps {
  isOpen: boolean
  onClose: () => void
  validator?: Validator
  validators?: Record<string, Validator>
  forceChain?: SupportedChain
  forceNetwork?: SelectedNetwork
  selectedDelegation: Delegation
  setClaimTxMode: (mode: STAKE_MODE | 'CLAIM_AND_DELEGATE' | null) => void
}

const ReviewValidatorClaimTx = observer(
  ({
    isOpen,
    onClose,
    validator,
    forceChain,
    forceNetwork,
    selectedDelegation,
    setClaimTxMode,
  }: ReviewValidatorClaimTxProps) => {
    const _activeChain = useActiveChain()
    const activeChain = forceChain ?? _activeChain
    const _activeNetwork = useSelectedNetwork()
    const activeNetwork = forceNetwork ?? _activeNetwork

    const getWallet = useGetWallet(activeChain)
    const denoms = rootDenomsStore.allDenoms
    const defaultGasPrice = useDefaultGasPrice(denoms, {
      activeChain,
      selectedNetwork: activeNetwork,
    })

    const [formatCurrency] = useFormatCurrency()
    const defaultTokenLogo = useDefaultTokenLogo()
    const [activeStakingDenom] = useActiveStakingDenom(denoms, activeChain, activeNetwork)

    const chainClaimRewards = claimRewardsStore.claimRewardsForChain(activeChain)

    const {
      showLedgerPopup,
      onReviewTransaction,
      isLoading,
      error,
      setAmount,
      recommendedGasLimit,
      userPreferredGasLimit,
      setUserPreferredGasLimit,
      gasOption,
      setGasOption,
      userPreferredGasPrice,
      setFeeDenom,
      ledgerError,
      setLedgerError,
      customFee,
      feeDenom,
      setUserPreferredGasPrice,
    } = useStakeTx(
      denoms,
      'CLAIM_REWARDS',
      validator as Validator,
      undefined,
      [selectedDelegation],
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

    const [validatorRewardCurrency, validatorRewardToken, validatorRewardTotal] = useMemo(() => {
      const validatorRewards = chainClaimRewards?.rewards?.rewards?.[validator?.address ?? '']
      const _validatorRewardCurrency = validatorRewards?.reward.reduce(
        (acc, reward) => acc.plus(new BigNumber(reward.currencyAmount ?? '')),
        new BigNumber(0),
      )
      const rewardCount = validatorRewards?.reward.length ?? 0
      const nativeReward = validatorRewards?.reward.find(
        (r) => r.denom === activeStakingDenom?.coinMinimalDenom,
      )
      const _validatorRewardToken =
        formatTokenAmount(nativeReward?.amount ?? '', activeStakingDenom?.coinDenom) +
        `${rewardCount > 1 ? ` +${rewardCount - 1} more` : ''}`

      const _validatorRewardTotal = validatorRewards?.reward.reduce(
        (acc, reward) => acc.plus(new BigNumber(reward.amount)),
        new BigNumber(0),
      )
      return [_validatorRewardCurrency, _validatorRewardToken, _validatorRewardTotal]
    }, [activeStakingDenom, chainClaimRewards, validator])

    useCaptureTxError(error)
    useEffect(() => {
      setAmount(validatorRewardTotal?.toString() ?? '0')
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [validatorRewardTotal])

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
      setClaimTxMode('CLAIM_REWARDS')
      // mixpanel.track(EventName.TransactionSigned, {
      //   transactionType: 'stake_claim',
      // })
      onClose()
    }, [setClaimTxMode, onClose])

    const onClaimRewardsClick = useCallback(async () => {
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
      activeChain,
      customFee,
      feeDenom,
      getWallet,
      onReviewTransaction,
      setLedgerError,
      txCallback,
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
          title={transitionTitleMap.CLAIM_REWARDS}
          className='p-6 mt-4'
        >
          <div className='flex flex-col items-center w-full gap-y-4'>
            <ClaimCard
              title={formatCurrency(validatorRewardCurrency ?? new BigNumber(''))}
              subText={validatorRewardToken}
              imgSrc={activeStakingDenom.icon}
            />
            <ClaimCard
              title={
                validator &&
                sliceWord(
                  validator.moniker,
                  isSidePanel()
                    ? 15 + Math.floor(((Math.min(window.innerWidth, 400) - 320) / 81) * 7)
                    : 10,
                  3,
                )
              }
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
              className='w-full'
              disabled={isLoading || !!error || !!gasError || showLedgerPopup || !!ledgerError}
              onClick={onClaimRewardsClick}
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
                'Confirm Claim'
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

export default ReviewValidatorClaimTx
