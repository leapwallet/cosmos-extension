import {
  GasOptions,
  getErrorMsg,
  sliceWord,
  useActiveChain,
  useStakeTx,
  useStaking,
  useValidatorImage,
} from '@leapwallet/cosmos-wallet-hooks'
import { Validator } from '@leapwallet/cosmos-wallet-sdk'
import BottomModal from 'components/bottom-modal'
import LedgerConfirmationPopup from 'components/ledger-confirmation/LedgerConfirmationPopup'
import { Wallet } from 'hooks/wallet/useWallet'
import React, { useEffect, useMemo } from 'react'
import { Colors } from 'theme/colors'
import useGetWallet = Wallet.useGetWallet
import { Avatar, Buttons, Card, Memo } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import { ErrorCard } from 'components/ErrorCard'
import { LoaderAnimation } from 'components/loader/Loader'
import Text from 'components/text'
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
}: YourRewardsSheetProps) {
  const getWallet = useGetWallet()
  const txCallback = useTxCallBack()
  const activeChain = useActiveChain()
  const { data: imgUrl } = useValidatorImage(validator)

  const [formatCurrency] = useFormatCurrency()
  const { formatHideBalance } = useHideAssets()
  const defaultTokenLogo = useDefaultTokenLogo()

  const { delegations, refetchDelegatorRewards, totalRewards, totalRewardsDollarAmt, rewards } =
    useStaking()
  const {
    showLedgerPopup,
    onReviewTransaction,
    isLoading,
    error,
    displayFeeText,
    memo,
    setMemo,
    setAmount,
  } = useStakeTx(
    'CLAIM_REWARDS',
    validator as Validator,
    undefined,
    Object.values(delegations ?? {}),
  )

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

  const _totalRewards = useMemo(() => {
    if (reward?.reward) {
      return reward.reward
        .reduce((a, v) => {
          return a + +v.amount
        }, 0)
        .toString()
    }

    return totalRewards
  }, [reward?.reward, totalRewards])

  useCaptureTxError(error)
  useEffect(() => {
    setAmount(_totalRewards ?? '')

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_totalRewards])

  if (showLedgerPopup) {
    return <LedgerConfirmationPopup showLedgerPopup={showLedgerPopup} />
  }

  const onClaimRewardsClick = async () => {
    const wallet = await getWallet()

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
    <BottomModal
      isOpen={isOpen}
      onClose={onClose}
      title='Review Transaction'
      closeOnBackdropClick={true}
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
                totalRewardsDollarAmt ? formatCurrency(new BigNumber(totalRewardsDollarAmt)) : '-',
              )}
              title={titleText ?? ''}
            />
          </CardWithHeading>

          <Memo
            value={memo}
            onChange={(e) => {
              setMemo(e.target.value)
            }}
          />

          {!error && !!displayFeeText ? (
            <Text size='sm' color='text-gray-400 dark:text-gray-600' className='justify-center'>
              {displayFeeText}
            </Text>
          ) : null}

          {error ? <ErrorCard text={getErrorMsg(error, GasOptions.HIGH, 'claim')} /> : null}

          <Buttons.Generic
            color={Colors.getChainColor(activeChain)}
            size='normal'
            disabled={isLoading || !!error || showLedgerPopup}
            className='w-[344px]'
            onClick={onClaimRewardsClick}
          >
            {isLoading ? <LoaderAnimation color={Colors.white100} /> : 'Claim Rewards'}
          </Buttons.Generic>
        </div>
      </div>
    </BottomModal>
  )
}
