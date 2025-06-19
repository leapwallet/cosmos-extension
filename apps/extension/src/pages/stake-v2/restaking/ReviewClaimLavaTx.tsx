import {
  FeeTokenData,
  SelectedNetwork,
  sliceWord,
  STAKE_MODE,
  useActiveChain,
  useActiveStakingDenom,
  useDualStaking,
  useDualStakingTx,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks'
import { Provider, SupportedChain, Validator } from '@leapwallet/cosmos-wallet-sdk'
import { RootBalanceStore, RootDenomsStore } from '@leapwallet/cosmos-wallet-store'
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
import mixpanel from 'mixpanel-browser'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { hideAssetsStore } from 'stores/hide-assets-store'
import { isSidePanel } from 'utils/isSidePanel'

import { StakeTxnPageState } from '../StakeTxnPage'

import useGetWallet = Wallet.useGetWallet

import Lottie from 'lottie-react'

import { ClaimCard } from '../components/ReviewClaimTx'
import { transitionTitleMap } from '../utils/stake-text'

interface ReviewClaimLavaTxProps {
  isOpen: boolean
  onClose: () => void
  validator?: Validator
  rootDenomsStore: RootDenomsStore
  rootBalanceStore: RootBalanceStore
  forceChain?: SupportedChain
  forceNetwork?: SelectedNetwork
  setClaimTxMode: (mode: STAKE_MODE | 'CLAIM_AND_DELEGATE' | null) => void
}
export const ReviewClaimLavaTx = observer(
  ({
    isOpen,
    onClose,
    validator,
    rootDenomsStore,
    rootBalanceStore,
    forceChain,
    forceNetwork,
    setClaimTxMode,
  }: ReviewClaimLavaTxProps) => {
    const denoms = rootDenomsStore.allDenoms
    const _activeChain = useActiveChain()
    const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain])

    const _activeNetwork = useSelectedNetwork()
    const activeNetwork = useMemo(
      () => forceNetwork || _activeNetwork,
      [_activeNetwork, forceNetwork],
    )

    const getWallet = useGetWallet()
    const defaultGasPrice = useDefaultGasPrice(denoms, {
      activeChain,
      selectedNetwork: activeNetwork,
    })

    const [formatCurrency] = useFormatCurrency()
    const [activeStakingDenom] = useActiveStakingDenom(denoms, activeChain, activeNetwork)

    const { rewards, providers } = useDualStaking()
    const rewardProviders = useMemo(() => {
      if (rewards && providers) {
        const _rewardProviders = rewards?.rewards
          ?.map((reward) => providers.find((provider) => provider.address === reward.provider))
          .filter((provider) => provider !== undefined)
        return _rewardProviders as Provider[]
      }
    }, [providers, rewards])
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
      customFee,
      feeDenom,
      ledgerError,
      setLedgerError,
    } = useDualStakingTx(
      denoms,
      'CLAIM_REWARDS',
      validator as Validator,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      rewardProviders,
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

    useCaptureTxError(error)
    useEffect(() => {
      setAmount(rewards?.totalRewards ?? '0')
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rewards?.totalRewards])

    const formattedTokenProviderReward = useMemo(() => {
      if (rewards) {
        const rewardItems = rewards.rewards
          ?.flatMap((reward) => reward.amount)
          .reduce((acc, curr) => {
            acc[curr.denom] = acc[curr.denom]
              ? new BigNumber(acc[curr.denom]).plus(new BigNumber(curr.amount))
              : new BigNumber(curr.amount)
            return acc
          }, {} as Record<string, BigNumber>)
        const rewardsLength = Object.keys(rewardItems ?? {}).length
        return hideAssetsStore.formatHideBalance(
          `${rewards.formattedTotalRewards} ${
            rewardsLength > 1 ? `+${rewardsLength - 1} more` : ''
          }`,
        )
      }
    }, [rewards])

    const onGasPriceOptionChange = useCallback(
      (value: GasPriceOptionValue, feeBaseDenom: FeeTokenData) => {
        setGasPriceOption(value)
        setFeeDenom(feeBaseDenom.denom)
        if (value.option) {
          setGasOption(value.option)
        }
      },
      [setFeeDenom, setGasOption],
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
    }, [onClose, setClaimTxMode])

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

    useCaptureUIException(ledgerError || error)

    return (
      <GasPriceOptions
        recommendedGasLimit={recommendedGasLimit}
        gasLimit={userPreferredGasLimit?.toString() ?? recommendedGasLimit}
        setGasLimit={(value: string | number | BigNumber) =>
          setUserPreferredGasLimit(Number(value.toString()))
        }
        gasPriceOption={gasPriceOption}
        onGasPriceOptionChange={onGasPriceOptionChange}
        error={gasError}
        chain={activeChain}
        network={activeNetwork}
        setError={setGasError}
        rootDenomsStore={rootDenomsStore}
        rootBalanceStore={rootBalanceStore}
      >
        <BottomModal
          isOpen={isOpen}
          onClose={onClose}
          title={transitionTitleMap.CLAIM_REWARDS}
          className='p-6 mt-4'
        >
          <div className='flex flex-col items-center w-full gap-y-4'>
            <ClaimCard
              title={hideAssetsStore.formatHideBalance(
                formatCurrency(new BigNumber(rewards?.totalRewardsDollarAmt ?? '0')),
              )}
              subText={formattedTokenProviderReward}
              imgSrc={activeStakingDenom.icon}
            />
            <ClaimCard
              title={
                rewardProviders &&
                sliceWord(
                  rewardProviders[0]?.moniker,
                  isSidePanel()
                    ? 2 + Math.floor(((Math.min(window.innerWidth, 400) - 320) / 81) * 7)
                    : 10,
                  3,
                )
              }
              subText={
                rewardProviders &&
                (rewardProviders.length > 1 ? `+${rewardProviders.length - 1} more providers` : '')
              }
              imgSrc={Images.Misc.Validator}
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

        <LedgerConfirmationPopup showLedgerPopup={showLedgerPopup} />

        <FeesSettingsSheet
          showFeesSettingSheet={showFeesSettingSheet}
          onClose={handleCloseFeeSettingSheet}
          gasError={gasError}
        />
      </GasPriceOptions>
    )
  },
)
