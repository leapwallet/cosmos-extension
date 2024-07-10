import {
  FeeTokenData,
  getErrorMsg,
  sliceWord,
  useActiveChain,
  useActiveStakingDenom,
  useSelectedNetwork,
  useStakeTx,
  useStaking,
  useValidatorImage,
} from '@leapwallet/cosmos-wallet-hooks'
import { Validator } from '@leapwallet/cosmos-wallet-sdk'
import BottomModal from 'components/bottom-modal'
import LedgerConfirmationPopup from 'components/ledger-confirmation/LedgerConfirmationPopup'
import { Wallet } from 'hooks/wallet/useWallet'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Colors } from 'theme/colors'
import useGetWallet = Wallet.useGetWallet
import { Avatar, Buttons, Card, Memo } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import { ErrorCard } from 'components/ErrorCard'
import GasPriceOptions, { useDefaultGasPrice } from 'components/gas-price-options'
import { GasPriceOptionValue } from 'components/gas-price-options/context'
import { DisplayFee } from 'components/gas-price-options/display-fee'
import { FeesSettingsSheet } from 'components/gas-price-options/fees-settings-sheet'
import { LoaderAnimation } from 'components/loader/Loader'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useHideAssets } from 'hooks/settings/useHideAssets'
import { useCaptureTxError } from 'hooks/utility/useCaptureTxError'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import { imgOnError } from 'utils/imgOnError'
import { isCompassWallet } from 'utils/isCompassWallet'
import { useTxCallBack } from 'utils/txCallback'

import { CardWithHeading, YourRewardsSheetProps } from './index'

export function ReviewClaimRewardsTx({
  isOpen,
  onClose,
  validator,
  reward,
  forceChain,
  forceNetwork,
}: YourRewardsSheetProps) {
  const getWallet = useGetWallet()
  const txCallback = useTxCallBack()

  const _activeChain = useActiveChain()
  const activeChain = useMemo(() => forceChain || _activeChain, [forceChain, _activeChain])
  const _activeNetwork = useSelectedNetwork()
  const activeNetwork = useMemo(
    () => forceNetwork || _activeNetwork,
    [forceNetwork, _activeNetwork],
  )

  const { data: imgUrl } = useValidatorImage(validator)
  const defaultGasPrice = useDefaultGasPrice({
    activeChain,
    selectedNetwork: activeNetwork,
  })

  const [formatCurrency] = useFormatCurrency()
  const { formatHideBalance } = useHideAssets()
  const defaultTokenLogo = useDefaultTokenLogo()
  const [activeStakingDenom] = useActiveStakingDenom(activeChain, activeNetwork)

  const { delegations, refetchDelegatorRewards, totalRewardsDollarAmt, rewards } = useStaking(
    activeChain,
    activeNetwork,
  )

  const {
    showLedgerPopup,
    onReviewTransaction,
    isLoading,
    error,
    memo,
    setMemo,
    setAmount,
    recommendedGasLimit,
    userPreferredGasLimit,
    setUserPreferredGasLimit,
    gasOption,
    userPreferredGasPrice,
    setFeeDenom,
  } = useStakeTx(
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

  const rewardTokens = useMemo(() => {
    if (reward?.reward) {
      return reward.reward
    }

    return rewards?.total
  }, [reward?.reward, rewards?.total])

  const titleText = useMemo(() => {
    if (!rewardTokens || rewardTokens.length === 0) return

    if ((rewardTokens.length ?? 1) > 2) {
      return `${rewardTokens[0].tokenInfo?.coinDenom ?? sliceWord(rewardTokens[0].denom, 4, 3)} | ${
        rewardTokens[1].tokenInfo?.coinDenom ?? sliceWord(rewardTokens[1].denom, 4, 3)
      } | +${(rewardTokens.length ?? 3) - 2} more`
    }

    if ((rewardTokens.length ?? 1) === 2) {
      return `${rewardTokens[0].tokenInfo?.coinDenom ?? sliceWord(rewardTokens[0].denom, 4, 3)} | ${
        rewardTokens[1].tokenInfo?.coinDenom ?? sliceWord(rewardTokens[1].denom, 4, 3)
      }`
    }

    return `${
      rewardTokens[0]?.tokenInfo?.coinDenom ?? sliceWord(rewardTokens[0].denom, 4, 3) ?? ''
    }`
  }, [rewardTokens])

  const nativeTokenReward = useMemo(() => {
    return rewardTokens?.find((token) => token.denom === activeStakingDenom.coinMinimalDenom)
      ?.amount
  }, [activeStakingDenom.coinMinimalDenom, rewardTokens])

  useCaptureTxError(error)
  useEffect(() => {
    setAmount(nativeTokenReward ?? '')
  }, [nativeTokenReward, setAmount])

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

  if (showLedgerPopup) {
    return <LedgerConfirmationPopup showLedgerPopup={showLedgerPopup} />
  }

  const onClaimRewardsClick = async () => {
    const wallet = await getWallet(activeChain)

    onReviewTransaction(
      wallet,
      (status) => {
        txCallback(status)
        refetchDelegatorRewards()
      },
      false,
    )
  }

  return (
    <GasPriceOptions
      recommendedGasLimit={recommendedGasLimit}
      gasLimit={userPreferredGasLimit?.toString() ?? recommendedGasLimit}
      setGasLimit={(value: number) => setUserPreferredGasLimit(Number(value.toString()))}
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
        title='Review Transaction'
        closeOnBackdropClick={true}
        contentClassName='[&>div:first-child>div:last-child]:-mt-[2px]'
      >
        <div>
          <div className='flex flex-col items-center w-full gap-y-4'>
            <CardWithHeading title='Staking Rewards'>
              <Card
                avatar={
                  <Avatar
                    avatarImage={
                      (isCompassWallet() ? Images.Misc.CompassReward : Images.Misc.LeapReward) ??
                      defaultTokenLogo
                    }
                    chainIcon={
                      validator ? imgUrl ?? validator.image ?? Images.Misc.Validator : undefined
                    }
                    avatarOnError={imgOnError(defaultTokenLogo)}
                    size='sm'
                  />
                }
                isRounded
                size='md'
                subtitle={formatHideBalance(
                  totalRewardsDollarAmt
                    ? formatCurrency(new BigNumber(totalRewardsDollarAmt))
                    : '-',
                )}
                title={titleText ?? ''}
                className='dark:!bg-gray-950'
              />
            </CardWithHeading>

            <div className='[&>div]:dark:!bg-gray-950 [&>div_input]:dark:!bg-gray-950'>
              <Memo
                value={memo}
                onChange={(e) => {
                  setMemo(e.target.value)
                }}
              />
            </div>

            <DisplayFee setShowFeesSettingSheet={setShowFeesSettingSheet} />

            {error ? <ErrorCard text={getErrorMsg(error, gasOption, 'claim')} /> : null}
            {gasError && !showFeesSettingSheet ? (
              <p className='text-red-300 text-sm font-medium text-center'>{gasError}</p>
            ) : null}

            <Buttons.Generic
              color={Colors.getChainColor(activeChain)}
              size='normal'
              disabled={isLoading || !!error || !!gasError || showLedgerPopup}
              className='w-[344px]'
              onClick={onClaimRewardsClick}
            >
              {isLoading ? <LoaderAnimation color={Colors.white100} /> : 'Claim Rewards'}
            </Buttons.Generic>
          </div>
        </div>
      </BottomModal>

      <FeesSettingsSheet
        showFeesSettingSheet={showFeesSettingSheet}
        onClose={handleCloseFeeSettingSheet}
        gasError={gasError}
      />
    </GasPriceOptions>
  )
}
