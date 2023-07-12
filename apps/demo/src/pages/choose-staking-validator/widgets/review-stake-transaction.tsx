import { ChainInfos } from '@leapwallet/cosmos-wallet-sdk'
import { Delegation, RewardsResponse } from '@leapwallet/cosmos-wallet-sdk/dist/types/staking'
import { Validator } from '@leapwallet/cosmos-wallet-sdk/dist/types/validators'
import {
  Avatar,
  Buttons,
  Card,
  CardDivider,
  HeaderActionType,
  Memo,
  ThemeName,
  useTheme,
} from '@leapwallet/leap-ui'
import { BigNumber } from 'bignumber.js'
import React, { ReactElement, useEffect, useState } from 'react'

import BottomSheet from '~/components/bottom-sheet'
import InfoSheet from '~/components/info-sheet'
import Text from '~/components/text'
import { useActiveChain } from '~/hooks/settings/use-active-chain'
import { useFormatCurrency, usePreferredCurrency } from '~/hooks/settings/use-currency'
import { Images } from '~/images'
import { Colors } from '~/theme/colors'
import { Token } from '~/types/bank'
import { convertFromUsdToRegional } from '~/util/currency-conversion'
import { formatTokenAmount, sliceWord } from '~/util/strings'
import { tokenAndUsdPrice } from '~/util/tokens'

import { STAKE_MODE } from './input-stake-amount-view'

export type ClaimRewardReviewProps = {
  validators: Validator[]
  delegations: Record<string, Delegation>
  rewards: RewardsResponse
}

export type DelegateUndelegateReviewProps = {
  toValidator: Validator
}

export type RedelegateReviewProps = {
  toValidator: Validator
  fromValidator: Validator
}

export type AutoAdjustAmountProps = {
  token: Token
  amount: string
  feeAmount: string
  setAmount: (a: string) => void
}

export type ReviewStakeTransactionProps = {
  memo: string
  feesText: string
  amount: string
  error: string
  unstakingPeriod: string

  type: STAKE_MODE
  data: ClaimRewardReviewProps | DelegateUndelegateReviewProps | RedelegateReviewProps

  isLoading: boolean
  isVisible: boolean
  autoAdjustAmount: AutoAdjustAmountProps
  setMemo: (s: string) => void
  onSubmit: () => void
  onCloseHandler?: () => void
  showLedgerPopup?: boolean
}

export function CardWithHeading({ children, title }: { title: string; children: React.ReactNode }) {
  return (
    <div className=' dark:bg-gray-900 bg-white-100 rounded-[16px]  items-center'>
      <Text size='xs' className='pl-[16px] pr-[16px] pt-[16px] font-bold' color='text-gray-200'>
        {title}
      </Text>
      {children}
    </div>
  )
}

export default function ReviewStakeTransaction({
  memo,
  feesText,
  isVisible,
  amount,
  type,
  data,
  isLoading,
  error,
  unstakingPeriod,
  autoAdjustAmount,
  setMemo,
  onSubmit,
  onCloseHandler,
}: ReviewStakeTransactionProps): ReactElement {
  const formatCurrency = useFormatCurrency()
  const activeChain = useActiveChain()
  const isDark = useTheme().theme === ThemeName.DARK
  const preferredCurrency = usePreferredCurrency()
  const [isAutoAdjust, setIsAutoAdjust] = useState<boolean>(true)
  const [currencyValue, setCurrencyValue] = useState<string>('')
  const [viewInfoSheet, setViewInfoSheet] = useState(false)

  useEffect(() => {
    const fn = async () => {
      if (amount === '') return
      try {
        const _denom = Object.values(ChainInfos[activeChain].nativeDenoms)[0]
        const coinValue = convertFromUsdToRegional(
          new BigNumber(tokenAndUsdPrice[_denom.coinDenom.toUpperCase()]),
          preferredCurrency,
        )
        if (coinValue) setCurrencyValue(coinValue.toFixed(4))
      } catch (e) {
        console.log(e)
      }
    }
    fn()
  }, [amount, activeChain, preferredCurrency])

  const denom = ChainInfos[activeChain].denom
  let buttonText = 'Stake'
  let mainTitle = 'Stake'
  let validators: Validator[] = []
  let validatorText = 'Validator'

  switch (type) {
    case 'DELEGATE':
      buttonText = `Stake ${denom}`
      mainTitle = 'Stake'
      validatorText = 'Validator'
      validators = [(data as DelegateUndelegateReviewProps).toValidator]
      break
    case 'UNDELEGATE':
      buttonText = `Unstake ${denom}`
      mainTitle = 'Untake'
      validatorText = 'Validator'
      validators = [(data as DelegateUndelegateReviewProps).toValidator]
      break
    case 'CLAIM_REWARDS':
      buttonText = `Claim Rewards`
      mainTitle = 'Staking Rewards'
      validatorText = 'Validators'
      validators = (data as ClaimRewardReviewProps).validators
      break
    case 'REDELEGATE':
      buttonText = `Switch Validator`
      mainTitle = 'Switching Validator'
      validatorText = 'Validators'
      validators = [
        (data as RedelegateReviewProps).fromValidator,
        (data as RedelegateReviewProps).toValidator,
      ]
      break
    default:
      break
  }

  const netAmount = (type === 'DELEGATE' ? Number(amount) : 0) + Number(autoAdjustAmount?.feeAmount)
  const isPossibleToPayFee = netAmount < Number(autoAdjustAmount?.token?.amount)

  if (
    type === 'DELEGATE' &&
    autoAdjustAmount &&
    autoAdjustAmount.amount &&
    autoAdjustAmount.token.amount &&
    autoAdjustAmount.feeAmount &&
    isAutoAdjust &&
    !isPossibleToPayFee
  ) {
    return (
      <BottomSheet
        isVisible={isVisible}
        onClose={() => {
          setIsAutoAdjust(true)
          onCloseHandler()
        }}
        headerTitle='Adjust for transaction fee'
        headerActionType={HeaderActionType.CANCEL}
      >
        <>
          <div className='flex flex-col items-center w-full px-7 gap-y-[16px] mt-[28px] mb-[40px]'>
            <Text size='md'>
              You are about to stake almost all of the balance amount. There won&rsquo;t be enough{' '}
              {ChainInfos[activeChain].denom} left to afford the fees in this transaction.{' '}
            </Text>
            <Text size='md'>
              Would you like to auto adjust the amount to leave some {ChainInfos[activeChain].denom}{' '}
              for the transaction fee?
            </Text>
            <Buttons.Generic
              color={Colors.getChainColor(activeChain)}
              size='normal'
              className='w-[344px]'
              onClick={() => {
                autoAdjustAmount.setAmount(
                  // Reserve Fees for next 3 transactions
                  (Number(amount) - 3 * Number(autoAdjustAmount.feeAmount)).toFixed(6).toString(),
                )
                setIsAutoAdjust(false)
              }}
            >
              Auto-adjust
            </Buttons.Generic>
            <Buttons.Generic
              color={isDark ? Colors.gray900 : Colors.gray300}
              size='normal'
              className='w-[344px]'
              title={buttonText}
              onClick={() => setIsAutoAdjust(false)}
            >
              {`Don't adjust`}
            </Buttons.Generic>
          </div>
        </>
      </BottomSheet>
    )
  }

  return (
    <>
      <BottomSheet
        isVisible={isVisible}
        onClose={() => {
          setIsAutoAdjust(true)
          onCloseHandler()
        }}
        headerTitle='Review Transaction'
        headerActionType={HeaderActionType.CANCEL}
      >
        <>
          <div className='flex flex-col items-center w-[400px] gap-y-[16px] mt-[28px] mb-[40px]'>
            {(type === 'UNDELEGATE' || type === 'DELEGATE') && (
              <div className='flex justify-between'>
                <Text size='sm'>
                  Please Note:
                  <span className='ml-1 font-bold'>Unstaking will take {unstakingPeriod}</span>
                </Text>
                <div className='px-4'>
                  <div
                    className={
                      'flex justify-center text-xs text-gray-600 dark:text-gray-200 items-center cursor-pointer'
                    }
                    onClick={() => {
                      setViewInfoSheet(true)
                    }}
                  >
                    <span className='mr-1 text-lg material-icons-round'>info</span>
                    <span className='text-xs font-semibold'>Why?</span>
                  </div>
                </div>
              </div>
            )}
            <CardWithHeading title={mainTitle}>
              {type === 'REDELEGATE' && (
                <>
                  <Card
                    avatar={
                      <img
                        className='h-10 w-10 rounded-full'
                        src={
                          validators[0].image ??
                          validators[0].mintscan_image ??
                          validators[0].keybase_image ??
                          Images.Misc.Validator
                        }
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = Images.Misc.Validator
                        }}
                      />
                    }
                    isRounded
                    size='md'
                    subtitle={<>Current Validator</>}
                    title={sliceWord(validators[0].moniker ?? validators[0].name, 15, 3)}
                  />
                  <CardDivider />
                  <Card
                    avatar={
                      <img
                        className='h-10 w-10 rounded-full'
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = Images.Misc.Validator
                        }}
                        src={
                          validators[1].image ??
                          validators[1].mintscan_image ??
                          validators[1].keybase_image ??
                          Images.Misc.Validator
                        }
                      />
                    }
                    isRounded
                    size='md'
                    subtitle={<>New Validator</>}
                    title={sliceWord(validators[1].moniker ?? validators[0].name, 15, 3)}
                  />
                  <CardDivider />
                </>
              )}
              <Card
                avatar={
                  <Avatar avatarImage={ChainInfos[activeChain].chainSymbolImageUrl} size='sm' />
                }
                isRounded
                size='md'
                subtitle={
                  <>
                    {currencyValue && +currencyValue > 0.01 ? (
                      `~ ${formatCurrency(new BigNumber(currencyValue))}`
                    ) : (
                      <></>
                    )}
                  </>
                }
                title={formatTokenAmount(amount, denom, 6)}
              />
            </CardWithHeading>

            {validators.length !== 0 && type !== 'REDELEGATE' && type !== 'CLAIM_REWARDS' && (
              <CardWithHeading title={validatorText}>
                {validators.map((v, index) => (
                  <Card
                    key={`rev_val_${index}`}
                    avatar={
                      <img
                        className='h-10 w-10 rounded-full'
                        src={
                          v.image ?? v.mintscan_image ?? v.keybase_image ?? Images.Misc.Validator
                        }
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = Images.Misc.Validator
                        }}
                      />
                    }
                    isRounded
                    size='md'
                    // Subtitle in case of delegations
                    title={v.moniker ?? v.name}
                  />
                ))}
              </CardWithHeading>
            )}

            <Memo
              value={memo}
              onChange={(e) => {
                setMemo(e.target.value)
              }}
            />

            <Text size='sm' color='text-gray-400 dark:text-gray-600' className='justify-center'>
              {feesText}
            </Text>

            <Buttons.Generic
              color={Colors.getChainColor(activeChain)}
              size='normal'
              disabled={!isPossibleToPayFee || isLoading || !!error}
              className='w-[344px]'
              title={buttonText}
              onClick={onSubmit}
            >
              {buttonText}
            </Buttons.Generic>
          </div>
        </>
      </BottomSheet>
      <InfoSheet
        isVisible={viewInfoSheet}
        setVisible={setViewInfoSheet}
        heading={`Why does is take ${unstakingPeriod} to get the funds back?`}
        title={`${unstakingPeriod} for unstaking`}
        desc={`Upon unstaking, tokens are locked for a period of ${unstakingPeriod} post which you will automatically get them back in your wallet.`}
      />
    </>
  )
}
