import {
  ErrorTxType,
  GasOptions,
  getErrorMsg,
  useActiveChain,
  useActiveStakingDenom,
  useChainId,
  useChainInfo,
  useformatCurrency,
  useValidatorImage,
} from '@leapwallet/cosmos-wallet-hooks'
import { NativeDenom, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import {
  Delegation,
  RewardsResponse,
} from '@leapwallet/cosmos-wallet-sdk/dist/browser/types/staking'
import { Validator } from '@leapwallet/cosmos-wallet-sdk/dist/browser/types/validators'
import { Avatar, Buttons, Card, CardDivider, Memo } from '@leapwallet/leap-ui'
import { BigNumber } from 'bignumber.js'
import BottomModal from 'components/bottom-modal'
import { ErrorCard } from 'components/ErrorCard'
import InfoSheet from 'components/Infosheet'
import { LoaderAnimation } from 'components/loader/Loader'
import Text from 'components/text'
import { currencyDetail, useUserPreferredCurrency } from 'hooks/settings/useCurrency'
import { useCaptureTxError } from 'hooks/utility/useCaptureTxError'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import React, { ReactElement, useEffect, useMemo, useState } from 'react'
import { Colors } from 'theme/colors'
import { DEBUG } from 'utils/debug'
import { fetchCurrency } from 'utils/findUSDValue'
import { imgOnError } from 'utils/imgOnError'
import { formatTokenAmount, sliceWord } from 'utils/strings'

import LedgerConfirmationPopup from '../../components/ledger-confirmation/LedgerConfirmationPopup'
import { CardWithHeading } from './components'
import { STAKE_MODE } from './InputStakeAmountView'

export type ClaimRewardReviewProps = {
  validators: Validator[]
  delegations: Record<string, Delegation>
  rewards: RewardsResponse
}

export type DelegateUndelegateReviewProps = {
  toValidator: Validator
}

export type CancelUndelegationReviewProps = {
  toValidator: Validator
  creationHeight: string
}

export type RedelegateReviewProps = {
  toValidator: Validator
  fromValidator: Validator
}

export type ReviewStakeTransactionProps = {
  memo: string
  amount: string
  error?: string
  ledgerError?: string
  gasError?: string | null
  unstakingPeriod: string

  feesText?: string
  feeDenom?: NativeDenom
  displayFee?: {
    formattedAmount: string
    fiatValue: string
  }

  type: STAKE_MODE
  data:
    | ClaimRewardReviewProps
    | DelegateUndelegateReviewProps
    | RedelegateReviewProps
    | CancelUndelegationReviewProps

  isLoading: boolean
  isVisible: boolean

  // eslint-disable-next-line no-unused-vars
  setMemo: (s: string) => void
  onSubmit: () => void
  onCloseHandler: () => void
  showLedgerPopup?: boolean
  gasOption: GasOptions
}

export default function ReviewStakeTransaction({
  memo,
  feesText,
  feeDenom,
  displayFee,
  isVisible,
  amount,
  gasError,
  type,
  data,
  isLoading,
  error,
  unstakingPeriod,
  setMemo,
  onSubmit,
  onCloseHandler,
  showLedgerPopup,
  ledgerError,
  gasOption,
}: ReviewStakeTransactionProps): ReactElement {
  const [formatCurrency] = useformatCurrency()
  const activeChainInfo = useChainInfo()
  const activeChain = useActiveChain()
  const [preferredCurrency] = useUserPreferredCurrency()
  const chainId = useChainId()

  const defaultTokenLogo = useDefaultTokenLogo()
  const [currencyValue, setCurrencyValue] = useState<string>('')
  const [viewInfoSheet, setViewInfoSheet] = useState(false)

  const [activeStakingDenom] = useActiveStakingDenom()
  const denom = activeStakingDenom.coinDenom

  useCaptureTxError(gasError ?? undefined)
  useCaptureTxError(error)

  useEffect(() => {
    const fn = async () => {
      if (amount === '') return

      try {
        const coinValue = await fetchCurrency(
          amount,
          activeStakingDenom.coinGeckoId,
          activeStakingDenom.chain as unknown as SupportedChain,
          currencyDetail[preferredCurrency].currencyPointer,
          `${chainId}-${activeStakingDenom.coinMinimalDenom}`,
        )

        if (coinValue) setCurrencyValue(coinValue)
      } catch (e) {
        DEBUG('Cur Val Err', '', e)
      }
    }
    fn()
  }, [
    amount,
    preferredCurrency,
    activeStakingDenom.coinGeckoId,
    activeStakingDenom.chain,
    chainId,
    activeStakingDenom.coinMinimalDenom,
  ])

  const { buttonText, mainTitle, validators, validatorText } = useMemo(() => {
    switch (type) {
      case 'DELEGATE':
        return {
          buttonText: `Stake ${denom}`,
          mainTitle: 'Stake',
          validatorText: 'Validator',
          validators: [(data as DelegateUndelegateReviewProps).toValidator],
        }
      case 'UNDELEGATE':
        return {
          buttonText: `Unstake ${denom}`,
          mainTitle: 'Untake',
          validatorText: 'Validator',
          validators: [(data as DelegateUndelegateReviewProps).toValidator],
        }
      case 'CLAIM_REWARDS':
        return {
          buttonText: `Claim Rewards`,
          mainTitle: 'Staking Rewards',
          validatorText: 'Validators',
          validators: (data as ClaimRewardReviewProps).validators,
        }
      case 'CANCEL_UNDELEGATION':
        return {
          buttonText: `Cancel Undelegation`,
          mainTitle: 'Cancel Undelegation',
          validatorText: 'Validator',
          validators: [(data as CancelUndelegationReviewProps).toValidator],
        }
      case 'REDELEGATE':
        return {
          buttonText: `Switch Validator`,
          mainTitle: 'Switching Validator',
          validatorText: 'Validators',
          validators: [
            (data as RedelegateReviewProps).fromValidator,
            (data as RedelegateReviewProps).toValidator,
          ],
        }
      default:
        return {
          buttonText: `Stake ${denom}`,
          mainTitle: 'Stake',
          validatorText: 'Validator',
          validators: [],
        }
    }
  }, [data, denom, type])

  const { data: keybaseImageUrl1 } = useValidatorImage(validators[0])
  const { data: keybaseImageUrl2 } = useValidatorImage(validators[1])

  if (showLedgerPopup) {
    return <LedgerConfirmationPopup showLedgerPopup={showLedgerPopup} />
  }

  return (
    <>
      <BottomModal isOpen={isVisible} onClose={onCloseHandler} title='Review Transaction'>
        <div>
          <div className='flex flex-col items-center w-full gap-y-4'>
            {['DELEGATE', 'UNDELEGATE'].includes(type) && (
              <div className='flex align-middle justify-between w-full'>
                <Text size='sm'>
                  Note:
                  <span className='ml-1 font-bold'>Unstaking will take {unstakingPeriod}</span>
                </Text>
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
            )}
            <CardWithHeading title={mainTitle}>
              {type === 'REDELEGATE' && (
                <>
                  <Card
                    avatar={
                      <Avatar
                        size='sm'
                        className='rounded-full'
                        avatarImage={
                          keybaseImageUrl1 ?? validators[0].image ?? Images.Misc.Validator
                        }
                        avatarOnError={imgOnError(Images.Misc.Validator)}
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
                      <Avatar
                        size='sm'
                        className='rounded-full'
                        avatarOnError={imgOnError(Images.Misc.Validator)}
                        avatarImage={
                          keybaseImageUrl2 ?? validators[1].image ?? Images.Misc.Validator
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
                  <Avatar
                    avatarImage={activeChainInfo.chainSymbolImageUrl ?? defaultTokenLogo}
                    avatarOnError={imgOnError(defaultTokenLogo)}
                    size='sm'
                  />
                }
                isRounded
                size='md'
                subtitle={
                  currencyValue && +currencyValue > 0.01
                    ? `~ ${formatCurrency(new BigNumber(currencyValue))}`
                    : null
                }
                title={formatTokenAmount(amount, denom)}
              />
            </CardWithHeading>

            {validators.length !== 0 && type !== 'REDELEGATE' && type !== 'CLAIM_REWARDS' && (
              <CardWithHeading title={validatorText}>
                {validators.map((v, index) => {
                  const Component = () => {
                    const { data } = useValidatorImage(v)
                    return (
                      <Card
                        avatar={
                          <Avatar
                            className='rounded-full overflow-hidden'
                            avatarImage={data ?? v.image ?? Images.Misc.Validator}
                            avatarOnError={imgOnError(Images.Misc.Validator)}
                          />
                        }
                        isRounded
                        size='md'
                        // Subtitle in case of delegations
                        title={v.moniker ?? v.name ?? ''}
                      />
                    )
                  }

                  return <Component key={`rev_val_${index}`} />
                })}
              </CardWithHeading>
            )}

            <Memo
              value={memo}
              onChange={(e) => {
                setMemo(e.target.value)
              }}
            />

            {displayFee && feeDenom ? (
              <div className='flex items-center justify-center text-gray-600 dark:text-gray-200'>
                <p className='font-semibold text-center text-sm'>Transaction fee: </p>
                <p className='font-semibold text-center text-sm ml-1'>
                  <strong data-testing-id='stake-review-sheet-fee-ele'>
                    {displayFee.formattedAmount} {feeDenom.coinDenom}
                  </strong>{' '}
                  {displayFee.fiatValue ? `(${displayFee.fiatValue})` : null}
                </p>
              </div>
            ) : !error && !!feesText ? (
              <Text size='sm' color='text-gray-400 dark:text-gray-600' className='justify-center'>
                {feesText}
              </Text>
            ) : null}

            {gasError ? (
              <p className='text-sm text-red-300 font-medium text-center'>
                {getErrorMsg(gasError, gasOption, type.toLowerCase() as ErrorTxType)}
              </p>
            ) : null}

            {error ?? ledgerError ? (
              <ErrorCard
                text={getErrorMsg(
                  error ?? ledgerError ?? '',
                  gasOption,
                  type.toLowerCase() as ErrorTxType,
                )}
              />
            ) : null}

            <Buttons.Generic
              color={Colors.getChainColor(activeChain)}
              size='normal'
              disabled={!!gasError || isLoading || !!error || showLedgerPopup}
              className='w-[344px]'
              title={buttonText}
              onClick={onSubmit}
            >
              {isLoading ? <LoaderAnimation color={Colors.white100} /> : buttonText}
            </Buttons.Generic>
          </div>
        </div>
      </BottomModal>
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
