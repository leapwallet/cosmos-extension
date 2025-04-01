import {
  ChainRewards,
  FeeTokenData,
  formatTokenAmount,
  sliceWord,
  STAKE_MODE,
  useActiveChain,
  useActiveStakingDenom,
  useClaimAndStakeRewards,
  useSelectedNetwork,
  useStaking,
  useValidatorImage,
} from '@leapwallet/cosmos-wallet-hooks'
import { GasPrice, Validator } from '@leapwallet/cosmos-wallet-sdk'
import BigNumber from 'bignumber.js'
import BottomModal from 'components/bottom-modal'
import GasPriceOptions, { useDefaultGasPrice } from 'components/gas-price-options'
import { GasPriceOptionValue } from 'components/gas-price-options/context'
import { DisplayFee } from 'components/gas-price-options/display-fee'
import { FeesSettingsSheet } from 'components/gas-price-options/fees-settings-sheet'
import LedgerConfirmationPopup from 'components/ledger-confirmation/LedgerConfirmationPopup'
import { EventName } from 'config/analytics'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useCaptureTxError } from 'hooks/utility/useCaptureTxError'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import mixpanel from 'mixpanel-browser'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { sidePanel } from 'utils/isSidePanel'
import useGetWallet = Wallet.useGetWallet

import { Button } from 'components/ui/button'
import { useCaptureUIException } from 'hooks/perf-monitoring/useCaptureUIException'
import { rootDenomsStore } from 'stores/denoms-store-instance'
import { hideAssetsStore } from 'stores/hide-assets-store'
import {
  claimRewardsStore,
  delegationsStore,
  unDelegationsStore,
  validatorsStore,
} from 'stores/stake-store'

import { transitionTitleMap } from '../utils/stake-text'
import { ClaimCard } from './ReviewClaimTx'

interface ReviewClaimAndStakeTxProps {
  isOpen: boolean
  onClose: () => void
  validators: Record<string, Validator>
  chainRewards: ChainRewards
  setClaimTxMode: (mode: STAKE_MODE | 'CLAIM_AND_DELEGATE' | null) => void
}

const ReviewClaimAndStakeTx = observer(
  ({ isOpen, onClose, validators, chainRewards, setClaimTxMode }: ReviewClaimAndStakeTxProps) => {
    const activeChain = useActiveChain()
    const activeNetwork = useSelectedNetwork()

    const getWallet = useGetWallet(activeChain)
    const [formatCurrency] = useFormatCurrency()

    const denoms = rootDenomsStore.allDenoms
    const chainDelegations = delegationsStore.delegationsForChain(activeChain)
    const chainValidators = validatorsStore.validatorsForChain(activeChain)
    const chainUnDelegations = unDelegationsStore.unDelegationsForChain(activeChain)
    const chainClaimRewards = claimRewardsStore.claimRewardsForChain(activeChain)

    const [activeStakingDenom] = useActiveStakingDenom(denoms, activeChain, activeNetwork)
    const { delegations, totalRewardsDollarAmt, rewards } = useStaking(
      denoms,
      chainDelegations,
      chainValidators,
      chainUnDelegations,
      chainClaimRewards,
      activeChain,
      activeNetwork,
    )

    const [error, setError] = useState('')
    const defaultGasPrice = useDefaultGasPrice(denoms, {
      activeChain,
      selectedNetwork: activeNetwork,
    })

    const {
      claimAndStakeRewards,
      loading,
      recommendedGasLimit,
      userPreferredGasLimit,
      setUserPreferredGasLimit,
      setUserPreferredGasPrice,
      gasOption,
      setGasOption,
      userPreferredGasPrice,
      setFeeDenom,
      setMemo,
      showLedgerPopup,
      ledgerError,
      setLedgerError,
    } = useClaimAndStakeRewards(
      denoms,
      delegations,
      chainRewards,
      chainClaimRewards.refetchDelegatorRewards,
      setError,
      activeChain,
      undefined,
      activeNetwork,
    )

    const [gasError, setGasError] = useState<string | null>(null)
    const [showFeesSettingSheet, setShowFeesSettingSheet] = useState(false)
    const [gasPriceOption, setGasPriceOption] = useState<GasPriceOptionValue>({
      option: gasOption,
      gasPrice: (userPreferredGasPrice ?? defaultGasPrice.gasPrice) as GasPrice,
    })
    const navigate = useNavigate()

    const nativeTokenReward = useMemo(() => {
      if (rewards) {
        return rewards.total?.find((token) => token.denom === activeStakingDenom?.coinMinimalDenom)
      }
    }, [activeStakingDenom?.coinMinimalDenom, rewards])

    const rewardValidators = useMemo(() => {
      if (rewards && Object.values(validators ?? {}).length) {
        return rewards.rewards
          .filter((reward) =>
            reward.reward.some((r) => r.denom === activeStakingDenom?.coinMinimalDenom),
          )
          .map((reward) => validators[reward.validator_address])
      }
    }, [activeStakingDenom?.coinMinimalDenom, rewards, validators])
    const { data: imageUrl } = useValidatorImage(rewardValidators && rewardValidators[0])

    useCaptureTxError(error)

    useEffect(() => {
      let isPromotedValidator = false
      if (rewardValidators?.length) {
        for (const validator of rewardValidators) {
          if (
            validator &&
            validator.custom_attributes?.priority &&
            validator.custom_attributes.priority > 0
          ) {
            isPromotedValidator = true
            break
          }
        }
      }
      setMemo(isPromotedValidator ? 'Staked with Leap Wallet' : '')
    }, [rewardValidators, setMemo])

    const txCallback = useCallback(() => {
      setClaimTxMode('CLAIM_AND_DELEGATE')
      onClose()

      mixpanel.track(EventName.TransactionSigned, {
        transactionType: 'stake_claim_and_delegate',
      })
    }, [onClose, setClaimTxMode])

    const onClaimRewardsClick = useCallback(async () => {
      try {
        const wallet = await getWallet()
        await claimAndStakeRewards(wallet, {
          success: txCallback,
        })
      } catch (error) {
        const _error = error as Error
        setLedgerError(_error.message)

        setTimeout(() => {
          setLedgerError('')
        }, 6000)
      }
    }, [claimAndStakeRewards, getWallet, setLedgerError, txCallback])

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
      return hideAssetsStore.formatHideBalance(
        formatTokenAmount(nativeTokenReward?.amount ?? '', activeStakingDenom?.coinDenom),
      )
    }, [activeStakingDenom?.coinDenom, nativeTokenReward?.amount])

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

    useCaptureUIException(ledgerError || error, {
      activeChain,
      activeNetwork,
    })

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

      const imgSrc =
        imageUrl ?? (rewardValidators && rewardValidators[0]?.image) ?? Images.Misc.Validator

      return { title, subText, imgSrc, fallbackImgSrc: Images.Misc.Validator }
    }, [imageUrl, rewardValidators])

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
      >
        <BottomModal
          isOpen={isOpen}
          onClose={onClose}
          title={<span className='whitespace-nowrap'>{transitionTitleMap.CLAIM_AND_DELEGATE}</span>}
          className='p-6 mt-4'
        >
          <div className='flex flex-col items-center w-full gap-y-4'>
            <ClaimCard title={titleText} subText={subTitleText} imgSrc={activeStakingDenom?.icon} />
            <ClaimCard {...validatorDetails} />
          </div>

          <div className='flex items-center w-full justify-between mt-5 mb-7'>
            <span className='text-sm text-muted-foreground font-medium'>Fees</span>
            <DisplayFee setShowFeesSettingSheet={setShowFeesSettingSheet} />
          </div>

          <div className='flex flex-col gap-y-2 items-center'>
            {ledgerError && (
              <p className='text-sm font-bold text-destructive-100 px-2'>{ledgerError}</p>
            )}
            {error && <p className='text-sm font-bold text-destructive-100 px-2'>{error}</p>}
            {gasError && !showFeesSettingSheet && (
              <p className='text-sm font-bold text-destructive-100 px-2'>{gasError}</p>
            )}

            <Button
              className='w-full'
              disabled={loading || !!error || !!gasError || !!ledgerError || showLedgerPopup}
              onClick={onClaimRewardsClick}
            >
              Confirm claim
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

export default ReviewClaimAndStakeTx
