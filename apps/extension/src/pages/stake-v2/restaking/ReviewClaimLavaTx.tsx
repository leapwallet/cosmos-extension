import {
  FeeTokenData,
  formatTokenAmount,
  sliceWord,
  useActiveStakingDenom,
  useDualStaking,
  useDualStakingTx,
} from '@leapwallet/cosmos-wallet-hooks'
import { Validator } from '@leapwallet/cosmos-wallet-sdk'
import { RootBalanceStore, RootDenomsStore } from '@leapwallet/cosmos-wallet-store'
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

import { isCompassWallet } from 'utils/isCompassWallet'

import { StakeTxnPageState } from '../StakeTxnPage'

interface ReviewClaimLavaTxProps {
  isOpen: boolean
  onClose: () => void
  validator?: Validator
  rootDenomsStore: RootDenomsStore
  rootBalanceStore: RootBalanceStore
}
export const ReviewClaimLavaTx = observer(
  ({ isOpen, onClose, validator, rootDenomsStore, rootBalanceStore }: ReviewClaimLavaTxProps) => {
    const denoms = rootDenomsStore.allDenoms
    const getWallet = useGetWallet()
    const defaultGasPrice = useDefaultGasPrice(denoms)

    const [formatCurrency] = useFormatCurrency()
    const { formatHideBalance } = useHideAssets()
    const defaultTokenLogo = useDefaultTokenLogo()
    const [activeStakingDenom] = useActiveStakingDenom(denoms)

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
    } = useDualStakingTx(denoms, 'CLAIM_REWARDS', validator as Validator)
    const { rewards, providers } = useDualStaking()
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

    const rewardProviders = useMemo(() => {
      if (rewards && providers) {
        return rewards?.rewards?.map((reward) =>
          providers.find((provider) => provider.address === reward.provider),
        )
      }
    }, [providers, rewards])

    const handleCloseFeeSettingSheet = useCallback(() => {
      setShowFeesSettingSheet(false)
    }, [])

    const txCallback = useCallback(() => {
      navigate('/stake/pending-txn', {
        state: {
          mode: 'CLAIM_REWARDS',
        } as StakeTxnPageState,
      })
      mixpanel.track(EventName.TransactionSigned, {
        transactionType: 'stake_claim',
      })
    }, [navigate])

    const onClaimRewardsClick = useCallback(async () => {
      try {
        const wallet = await getWallet()
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
    }, [customFee, feeDenom, getWallet, onReviewTransaction, setLedgerError, txCallback])

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
        setError={setGasError}
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
                    {formatHideBalance(
                      formatCurrency(new BigNumber(rewards?.totalRewardsDollarAmt ?? '0')),
                    )}
                  </Text>
                }
                subtitle={
                  <Text size='xs' color='text-gray-600 dark:text-gray-400' className='font-medium'>
                    {formatHideBalance(
                      `${formatTokenAmount(
                        rewards?.totalRewards ?? '',
                        activeStakingDenom.coinDenom,
                      )}`,
                    )}
                  </Text>
                }
              />
              <Card
                className='bg-white-100 dark:bg-gray-950'
                avatar={
                  <img
                    src={Images.Misc.Validator}
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
                    {rewardProviders &&
                      sliceWord(
                        rewardProviders[0]?.address,
                        isSidePanel()
                          ? 2 + Math.floor(((Math.min(window.innerWidth, 400) - 320) / 81) * 7)
                          : 10,
                        3,
                      )}
                  </Text>
                }
                subtitle={
                  <Text size='xs' color='text-gray-600 dark:text-gray-400' className='font-medium'>
                    {rewardProviders &&
                      (rewardProviders.length > 1
                        ? `+${rewardProviders.length - 1} more providers`
                        : '')}
                  </Text>
                }
              />
            </div>
            <div className='flex flex-col items-center w-full gap-y-2'>
              <DisplayFee setShowFeesSettingSheet={setShowFeesSettingSheet} />

              {ledgerError && <p className='text-sm font-bold text-red-300 px-2'>{ledgerError}</p>}
              {error && <p className='text-sm font-bold text-red-300 px-2'>{error}</p>}
              {gasError && !showFeesSettingSheet && (
                <p className='text-sm font-bold text-red-300 px-2'>{gasError}</p>
              )}

              <Buttons.Generic
                color={isCompassWallet() ? Colors.compassPrimary : Colors.green600}
                size='normal'
                disabled={isLoading || !!error || !!gasError || showLedgerPopup || !!ledgerError}
                className='w-full'
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
                    className={'h-[28px] w-[28px]'}
                  />
                ) : (
                  'Confirm Claim'
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
