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
  useStaking,
  useValidatorImage,
} from '@leapwallet/cosmos-wallet-hooks'
import { SupportedChain, Validator } from '@leapwallet/cosmos-wallet-sdk'
import BigNumber from 'bignumber.js'
import GasPriceOptions, { useDefaultGasPrice } from 'components/gas-price-options'
import { GasPriceOptionValue } from 'components/gas-price-options/context'
import { DisplayFee } from 'components/gas-price-options/display-fee'
import { FeesSettingsSheet } from 'components/gas-price-options/fees-settings-sheet'
import LedgerConfirmationPopup from 'components/ledger-confirmation/LedgerConfirmationPopup'
import BottomModal from 'components/new-bottom-modal'
import { EventName } from 'config/analytics'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useCaptureTxError } from 'hooks/utility/useCaptureTxError'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import loadingImage from 'lottie-files/swaps-btn-loading.json'
import mixpanel from 'mixpanel-browser'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { imgOnError } from 'utils/imgOnError'
import { sidePanel } from 'utils/isSidePanel'
import useGetWallet = Wallet.useGetWallet

import { Button } from 'components/ui/button'
import { useCaptureUIException } from 'hooks/perf-monitoring/useCaptureUIException'
import Lottie from 'lottie-react'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { hideAssetsStore } from 'stores/hide-assets-store'
import { rootBalanceStore } from 'stores/root-store'
import {
  claimRewardsStore,
  delegationsStore,
  unDelegationsStore,
  validatorsStore,
} from 'stores/stake-store'

import { transitionTitleMap } from '../utils/stake-text'

export const ClaimCard = (props: {
  title?: string
  subText?: string
  imgSrc: string
  fallbackImgSrc?: string
}) => {
  const defaultTokenLogo = useDefaultTokenLogo()

  return (
    <div className='flex gap-2 items-center justify-between bg-secondary-100 p-6 rounded-xl w-full'>
      <div className='flex flex-col'>
        <span className='text-lg font-bold'>{props.title}</span>
        <span className='text-sm text-muted-foreground'>{props.subText}</span>
      </div>

      <img
        src={props.imgSrc}
        alt='validator'
        className='size-12 rounded-full'
        onError={imgOnError(props.fallbackImgSrc ?? defaultTokenLogo)}
      />
    </div>
  )
}

interface ReviewClaimTxProps {
  isOpen: boolean
  onClose: () => void
  validator?: Validator
  validators?: Record<string, Validator>
  setClaimTxMode: (mode: STAKE_MODE | 'CLAIM_AND_DELEGATE' | null) => void
  forceChain?: SupportedChain
  forceNetwork?: SelectedNetwork
}

const ReviewClaimTx = observer(
  ({
    isOpen,
    onClose,
    validator,
    validators,
    setClaimTxMode,
    forceChain,
    forceNetwork,
  }: ReviewClaimTxProps) => {
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
    const [activeStakingDenom] = useActiveStakingDenom(denoms, activeChain, activeNetwork)

    const chainDelegations = delegationsStore.delegationsForChain(activeChain)
    const chainValidators = validatorsStore.validatorsForChain(activeChain)
    const chainUnDelegations = unDelegationsStore.unDelegationsForChain(activeChain)
    const chainClaimRewards = claimRewardsStore.claimRewardsForChain(activeChain)

    const { delegations, totalRewardsDollarAmt, rewards, totalRewards } = useStaking(
      denoms,
      chainDelegations,
      chainValidators,
      chainUnDelegations,
      chainClaimRewards,
      activeChain,
      activeNetwork,
    )

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
      Object.values(delegations ?? {}),
      activeChain,
      activeNetwork,
    )

    const [showFeesSettingSheet, setShowFeesSettingSheet] = useState<boolean>(false)
    const [gasError, setGasError] = useState<string | null>(null)
    const [gasPriceOption, setGasPriceOption] = useState<GasPriceOptionValue>({
      option: gasOption,
      gasPrice: userPreferredGasPrice ?? defaultGasPrice.gasPrice,
    })

    const rewardValidators = useMemo(() => {
      if (rewards && validators) {
        return rewards.rewards.map((reward) => validators[reward.validator_address])
      }
    }, [rewards, validators])

    const { data: validatorImage } = useValidatorImage(
      rewardValidators?.[0]?.image ? undefined : rewardValidators?.[0],
    )
    const imageUrl = rewardValidators?.[0]?.image || validatorImage || Images.Misc.Validator

    const nativeTokenReward = useMemo(() => {
      if (rewards) {
        return rewards?.total?.find((token) => token.denom === activeStakingDenom?.coinMinimalDenom)
      }
    }, [activeStakingDenom?.coinMinimalDenom, rewards])

    useCaptureTxError(error)
    useEffect(() => {
      setAmount(nativeTokenReward?.amount ?? '0')
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [totalRewards])

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

    const formattedTokenAmount = useMemo(() => {
      const rewardCount = rewards?.total?.length ?? 0
      return hideAssetsStore.formatHideBalance(
        `${formatTokenAmount(nativeTokenReward?.amount ?? '', activeStakingDenom?.coinDenom)} ${
          rewardCount > 1 ? `+${rewardCount - 1} more` : ''
        }`,
      )
    }, [activeStakingDenom?.coinDenom, nativeTokenReward?.amount, rewards?.total.length])

    const titleText = useMemo(() => {
      if (totalRewardsDollarAmt && new BigNumber(totalRewardsDollarAmt).gt(0)) {
        return hideAssetsStore.formatHideBalance(
          formatCurrency(new BigNumber(totalRewardsDollarAmt)),
        )
      } else {
        return formattedTokenAmount
      }
    }, [formatCurrency, formattedTokenAmount, totalRewardsDollarAmt])

    const subTitleText = useMemo(() => {
      if (totalRewardsDollarAmt && new BigNumber(totalRewardsDollarAmt).gt(0)) {
        return formattedTokenAmount
      }
      return ''
    }, [formattedTokenAmount, totalRewardsDollarAmt])

    const txCallback = useCallback(() => {
      setClaimTxMode('CLAIM_REWARDS')
      onClose()
      // mixpanel.track(EventName.TransactionSigned, {
      //   transactionType: 'stake_claim',
      // })
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

    const validatorDetails = useMemo(() => {
      const title =
        rewardValidators &&
        sliceWord(
          rewardValidators[0]?.moniker,
          sidePanel ? 15 + Math.floor(((Math.min(window.innerWidth, 400) - 320) / 81) * 7) : 10,
          3,
        )

      const subText =
        rewardValidators &&
        (rewardValidators.length > 1 ? `+${rewardValidators.length - 1} more validators` : '')

      const imgSrc = imageUrl

      return {
        title,
        subText,
        imgSrc,
      }
    }, [imageUrl, rewardValidators])

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
            <ClaimCard title={titleText} subText={subTitleText} imgSrc={activeStakingDenom.icon} />
            <ClaimCard {...validatorDetails} />
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

export default ReviewClaimTx
