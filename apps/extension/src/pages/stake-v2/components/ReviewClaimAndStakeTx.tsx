import {
  ChainRewards,
  FeeTokenData,
  formatTokenAmount,
  SelectedNetwork,
  sliceWord,
  useActiveChain,
  useActiveStakingDenom,
  useClaimAndStakeRewards,
  useSelectedNetwork,
  useStaking,
  useValidatorImage,
} from '@leapwallet/cosmos-wallet-hooks'
import { GasPrice, SupportedChain, Validator } from '@leapwallet/cosmos-wallet-sdk'
import {
  ClaimRewardsStore,
  DelegationsStore,
  RootBalanceStore,
  RootDenomsStore,
  UndelegationsStore,
  ValidatorsStore,
} from '@leapwallet/cosmos-wallet-store'
import { Buttons, Card } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import BottomModal from 'components/bottom-modal'
import GasPriceOptions, { useDefaultGasPrice } from 'components/gas-price-options'
import { GasPriceOptionValue } from 'components/gas-price-options/context'
import { DisplayFee } from 'components/gas-price-options/display-fee'
import { FeesSettingsSheet } from 'components/gas-price-options/fees-settings-sheet'
import LedgerConfirmationPopup from 'components/ledger-confirmation/LedgerConfirmationPopup'
import Text from 'components/text'
import { EventName } from 'config/analytics'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useHideAssets } from 'hooks/settings/useHideAssets'
import { useCaptureTxError } from 'hooks/utility/useCaptureTxError'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Wallet } from 'hooks/wallet/useWallet'
import { Images } from 'images'
import loadingImage from 'lottie-files/swaps-btn-loading.json'
import Lottie from 'lottie-react'
import mixpanel from 'mixpanel-browser'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { Colors } from 'theme/colors'
import { imgOnError } from 'utils/imgOnError'
import { isSidePanel } from 'utils/isSidePanel'
import useGetWallet = Wallet.useGetWallet

import { StakeTxnPageState } from '../StakeTxnPage'

interface ReviewClaimAndStakeTxProps {
  isOpen: boolean
  onClose: () => void
  validator?: Validator
  validators: Record<string, Validator>
  chainRewards: ChainRewards
  rootDenomsStore: RootDenomsStore
  rootBalanceStore: RootBalanceStore
  delegationsStore: DelegationsStore
  validatorsStore: ValidatorsStore
  unDelegationsStore: UndelegationsStore
  claimRewardsStore: ClaimRewardsStore
  forceChain?: SupportedChain
  forceNetwork?: SelectedNetwork
}

const ReviewClaimAndStakeTx = observer(
  ({
    isOpen,
    onClose,
    validators,
    chainRewards,
    rootDenomsStore,
    rootBalanceStore,
    delegationsStore,
    validatorsStore,
    unDelegationsStore,
    claimRewardsStore,
    forceChain,
    forceNetwork,
  }: ReviewClaimAndStakeTxProps) => {
    const _activeChain = useActiveChain()
    const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain])

    const _activeNetwork = useSelectedNetwork()
    const activeNetwork = useMemo(
      () => forceNetwork || _activeNetwork,
      [_activeNetwork, forceNetwork],
    )

    const getWallet = useGetWallet(activeChain)
    const [formatCurrency] = useFormatCurrency()
    const { formatHideBalance } = useHideAssets()
    const defaultTokenLogo = useDefaultTokenLogo()

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
      const state = {
        validator: rewardValidators && rewardValidators[0],
        mode: 'CLAIM_AND_DELEGATE',
        forceChain: activeChain,
        forceNetwork: activeNetwork,
      } as StakeTxnPageState

      sessionStorage.setItem('navigate-stake-pending-txn-state', JSON.stringify(state))
      navigate('/stake/pending-txn', {
        state,
      })

      mixpanel.track(EventName.TransactionSigned, {
        transactionType: 'stake_claim_and_delegate',
      })
    }, [activeChain, activeNetwork, navigate, rewardValidators])

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
      return formatHideBalance(
        formatTokenAmount(nativeTokenReward?.amount ?? '', activeStakingDenom?.coinDenom),
      )
    }, [activeStakingDenom?.coinDenom, formatHideBalance, nativeTokenReward?.amount])

    const titleText = useMemo(() => {
      if (totalRewardsDollarAmt && new BigNumber(totalRewardsDollarAmt).gt(0)) {
        return formatHideBalance(formatCurrency(new BigNumber(totalRewardsDollarAmt)))
      } else {
        return formattedTokenAmount
      }
    }, [formatCurrency, formatHideBalance, formattedTokenAmount, totalRewardsDollarAmt])

    const subTitleText = useMemo(() => {
      if (totalRewardsDollarAmt && new BigNumber(totalRewardsDollarAmt).gt(0)) {
        return formattedTokenAmount
      }
      return ''
    }, [formattedTokenAmount, totalRewardsDollarAmt])

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
          <div className='flex flex-col gap-y-6'>
            <div className='flex flex-col items-center w-full gap-y-4'>
              <Card
                className='bg-white-100 dark:bg-gray-950'
                avatar={
                  <img
                    src={activeStakingDenom.icon}
                    onError={imgOnError(defaultTokenLogo)}
                    width={36}
                    height={36}
                    className='rounded-full'
                  />
                }
                isRounded
                size='md'
                title={
                  <Text
                    size='sm'
                    color='text-black-100 dark:text-white-100'
                    className='font-bold mb-0.5'
                  >
                    {titleText}
                  </Text>
                }
                subtitle={
                  <Text size='xs' color='text-gray-600 dark:text-gray-400' className='font-medium'>
                    {subTitleText}
                  </Text>
                }
              />

              <Card
                className='bg-white-100 dark:bg-gray-950'
                avatar={
                  <img
                    src={
                      imageUrl ??
                      (rewardValidators && rewardValidators[0]?.image) ??
                      Images.Misc.Validator
                    }
                    onError={imgOnError(Images.Misc.Validator)}
                    width={36}
                    height={36}
                    className='rounded-full'
                  />
                }
                isRounded
                size='md'
                title={
                  <Text
                    size='sm'
                    color='text-black-100 dark:text-white-100'
                    className='font-bold mb-0.5'
                  >
                    {rewardValidators &&
                      sliceWord(
                        rewardValidators[0]?.moniker,
                        isSidePanel()
                          ? 15 + Math.floor(((Math.min(window.innerWidth, 400) - 320) / 81) * 7)
                          : 10,
                        3,
                      )}
                  </Text>
                }
                subtitle={
                  <Text size='xs' color='text-gray-600 dark:text-gray-400' className='font-medium'>
                    {rewardValidators &&
                      (rewardValidators.length > 1
                        ? `+${rewardValidators.length - 1} more validators`
                        : '')}
                  </Text>
                }
              />
            </div>
            <div className='flex flex-col gap-y-2 items-center'>
              <DisplayFee setShowFeesSettingSheet={setShowFeesSettingSheet} />
              {ledgerError && <p className='text-sm font-bold text-red-300 px-2'>{ledgerError}</p>}
              {error && <p className='text-sm font-bold text-red-300 px-2'>{error}</p>}
              {gasError && <p className='text-sm font-bold text-red-300 px-2'>{gasError}</p>}

              <Buttons.Generic
                color={Colors.green600}
                size='normal'
                disabled={loading || !!error || !!gasError || !!ledgerError || showLedgerPopup}
                className='w-full'
                onClick={onClaimRewardsClick}
              >
                {loading ? (
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
                  'Confirm Claim & Stake'
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

export default ReviewClaimAndStakeTx
