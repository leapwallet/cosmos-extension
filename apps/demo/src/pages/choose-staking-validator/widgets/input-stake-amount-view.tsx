import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/constants'
import { Delegation } from '@leapwallet/cosmos-wallet-sdk/dist/types/staking'
import { Validator } from '@leapwallet/cosmos-wallet-sdk/dist/types/validators'
import { Buttons, GenericCard, StakeInput } from '@leapwallet/leap-ui'
import React, { useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { useNavigate } from 'react-router-dom'

import Text from '~/components/text'
import { useStakeTx } from '~/hooks/staking/use-stake-tx'
import { Images } from '~/images'
import { Colors } from '~/theme/colors'
import { Token } from '~/types/bank'
import { capitalize } from '~/util/strings'

import CurrentValidatorCard from './current-validator-card'
import ReviewStakeTransaction, {
  DelegateUndelegateReviewProps,
  RedelegateReviewProps,
} from './review-stake-transaction'

export type STAKE_MODE = 'DELEGATE' | 'UNDELEGATE' | 'REDELEGATE' | 'CLAIM_REWARDS'

export default function InputStakeAmountView({
  toValidator,
  fromValidator,
  activeChain,
  token,
  delegation,
  mode,
  unstakingPeriod,
  onClickNewValidator,
}: {
  toValidator: Validator
  fromValidator?: Validator
  delegation?: Delegation
  activeChain: SupportedChain
  token: Token
  unstakingPeriod: string
  mode: STAKE_MODE
  onClickNewValidator: () => void
}) {
  const [showReviewTransactionSheet, setReviewTransactionSheet] = useState<boolean>(false)

  const { amount, error, isLoading, memo, displayFeeText, fees, setMemo, setAmount, onDelegate } =
    useStakeTx()

  const amountNumber = Number(amount)
  const navigate = useNavigate()

  const disableReview = amountNumber === 0 || amountNumber > Number(token.amount)

  return (
    <>
      <div className='flex flex-col gap-y-4 mb-8 justify-center'>
        {fromValidator && delegation && mode === 'REDELEGATE' && (
          <CurrentValidatorCard delegation={delegation} fromValidator={fromValidator} />
        )}
        {!token && !delegation && (
          <div className='flex flex-col dark:bg-gray-900 h-[252px] w-[344px] justify-center items-center p-4 bg-white-100 rounded-2xl overflow-clip '>
            <Skeleton circle count={1} className='my-8' height={80} width={80} />
            <Skeleton count={1} width={300} />
            <Skeleton count={1} width={300} />
          </div>
        )}
        {token && mode === 'DELEGATE' && (
          <StakeInput
            name={token.symbol}
            amount={amount}
            stakeAllText={capitalize(mode.toLowerCase())}
            setAmount={setAmount}
            balance={token.amount}
            icon={token.img}
            onStakeAllClick={() => {
              setAmount(token.amount)
            }}
          />
        )}
        <GenericCard
          onClick={onClickNewValidator}
          img={
            <img
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = Images.Misc.Validator
              }}
              src={
                toValidator.image ??
                toValidator.keybase_image ??
                toValidator.mintscan_image ??
                Images.Misc.Validator
              }
              className={'rounded-full overflow-clip w-6 h-6'}
            />
          }
          isRounded
          title={
            <Text size='md' className='font-bold ml-3 w-[120px]'>
              New Validator
            </Text>
          }
          title2={
            <div className='text-right truncate w-[130px] py-2 text-ellipsis'>
              {toValidator.moniker ?? toValidator.name}
            </div>
          }
          subtitle={''}
          subtitle2={''}
          icon={<span className='material-icons-round text-gray-400'>keyboard_arrow_right</span>}
        />
        <Buttons.Generic
          color={Colors.getChainColor(activeChain)}
          size='normal'
          className='w-[344px] '
          title='Review'
          disabled={disableReview}
          onClick={() => {
            if (!disableReview) setReviewTransactionSheet(true)
          }}
        >
          Review
        </Buttons.Generic>
        <Text size='sm' color='text-gray-400 dark:text-gray-600' className='justify-center'>
          {isLoading ? <Skeleton count={1} width={280} /> : displayFeeText}
        </Text>
      </div>
      <ReviewStakeTransaction
        error={error}
        autoAdjustAmount={{ amount: '0', feeAmount: fees, setAmount, token }}
        amount={amount}
        data={
          mode !== 'REDELEGATE'
            ? ({ toValidator } as DelegateUndelegateReviewProps)
            : ({
                fromValidator,
                toValidator,
              } as RedelegateReviewProps)
        }
        unstakingPeriod={unstakingPeriod}
        feesText={displayFeeText}
        isLoading={isLoading}
        isVisible={showReviewTransactionSheet}
        memo={memo}
        onSubmit={() => {
          onDelegate(toValidator.address)
          navigate('/stake')
        }}
        setMemo={setMemo}
        type={mode}
        onCloseHandler={() => {
          setReviewTransactionSheet(false)
        }}
        showLedgerPopup={false}
      />
    </>
  )
}
