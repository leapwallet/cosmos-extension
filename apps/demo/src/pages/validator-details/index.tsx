import { denoms, fromSmall, SupportedDenoms } from '@leapwallet/cosmos-wallet-sdk'
import { ChainInfos, SupportedChain } from '@leapwallet/cosmos-wallet-sdk/dist/constants'
import { Delegation, Reward } from '@leapwallet/cosmos-wallet-sdk/dist/types/staking'
import { Validator } from '@leapwallet/cosmos-wallet-sdk/dist/types/validators'
import {
  Avatar,
  Buttons,
  Header,
  HeaderActionType,
  LineDivider,
  ThemeName,
  useTheme,
} from '@leapwallet/leap-ui'
import { BigNumber } from 'bignumber.js'
import currency from 'currency.js'
import { Images } from 'images'
import { ChainLogos } from 'images/logos'
import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Colors } from 'theme/colors'

import BottomNav, { BottomNavLabel } from '~/components/bottom-nav'
import PopupLayout from '~/components/popup-layout'
import ReadMoreText from '~/components/read-more-text'
import Text from '~/components/text'
import { useActiveChain } from '~/hooks/settings/use-active-chain'
import { useFormatCurrency } from '~/hooks/settings/use-currency'
import { useStakeTx } from '~/hooks/staking/use-stake-tx'
import { useActiveWallet } from '~/hooks/wallet/use-wallet'
import showOrHideBalances from '~/util/show-or-hide-balances'
import { capitalize, formatTokenAmount, sliceWord } from '~/util/strings'
import { tokensByChain } from '~/util/tokens'

import { ChooseValidatorProps } from '../choose-staking-validator'
import InputStakeAmountView, {
  STAKE_MODE,
} from '../choose-staking-validator/widgets/input-stake-amount-view'
import ReviewStakeTransaction, {
  ClaimRewardReviewProps,
} from '../choose-staking-validator/widgets/review-stake-transaction'
import StakeRewardCard from '../stake/widgets/stake-reward-card'

function DepositAmountCard({
  totalDelegations,
  currencyAmountDelegation,
  validatorName,
  percentage,
}: {
  validatorName: string
  totalDelegations: string
  currencyAmountDelegation: string
  percentage: number
}) {
  if (!totalDelegations) return <div></div>

  return (
    <div className='dark:bg-gray-900 rounded-2xl bg-white-100 pt-4'>
      {totalDelegations && (
        <Text
          size='xs'
          color='dark:text-gray-200 text-gray-600'
          className='font-bold mb-3 py-1 px-4'
        >
          Your Deposited amount {`(${validatorName})`}
        </Text>
      )}
      {totalDelegations && (
        <div className='flex px-4 pb-4 justify-between items-center'>
          <div>
            <Text size='xl' className='text-[28px] mb-2 font-black'>
              {currencyAmountDelegation}
            </Text>
            <Text size='xs' className='font-semibold'>
              {totalDelegations}
              <span className='mx-2'>|</span>
              {showOrHideBalances(false, percentage)}
            </Text>
          </div>
        </div>
      )}
    </div>
  )
}

function ValidatorHeading({ validator }: { validator: Validator }) {
  return (
    <div className='flex flex-col pb-8'>
      <div className='flex gap-x-[12px]'>
        <div className='h-10 w-10 rounded-full overflow-clip border border-gray-400 shrink flex'>
          <Avatar
            size='sm'
            avatarImage={
              validator.image ??
              validator.keybase_image ??
              validator.mintscan_image ??
              Images.Misc.Validator
            }
          />
        </div>
        <Text size='xxl' className='font-black'>
          {validator.moniker ?? validator.name}
        </Text>
      </div>
      <Text size='md' color='dark:text-gray-200 text-gray-800' className='font-bold'>
        {`Staked: ${currency(validator.delegations?.total_tokens_display, {
          precision: 2,
          symbol: '',
        }).format()} | Commission: ${
          currency((+validator.commission?.commission_rates.rate * 100).toString(), {
            precision: 0,
            symbol: '',
          }).format() + '%'
        }`}
      </Text>
    </div>
  )
}

function DetailsView({
  validator,
  apy,
  delegation,
  formattedRewardAmount,
  activeChain,
  percentChange,
  onClickStake,
  onClickSwitchValidator,
  onClickUnstake,
  onClaimClickReward,
}: {
  validator: Validator
  delegation: Delegation
  formattedRewardAmount: string
  activeChain: SupportedChain
  apy: Record<string, number>
  percentChange: number
  onClickStake: () => void
  onClickUnstake: () => void
  onClickSwitchValidator: () => void
  onClaimClickReward: () => void
}) {
  const formatter = useFormatCurrency()
  const isDark = useTheme().theme === ThemeName.DARK

  return (
    <div>
      <ValidatorHeading validator={validator} />
      <div className='flex flex-col gap-y-4'>
        <DepositAmountCard
          currencyAmountDelegation={formatter(new BigNumber(delegation.balance.currenyAmount))}
          totalDelegations={delegation.balance.formatted_amount}
          validatorName={sliceWord(validator.moniker ?? validator.name, 18, 3)}
          percentage={percentChange}
        />
        {
          <StakeRewardCard
            activeChain={activeChain}
            onClaim={onClaimClickReward}
            isLoading={false}
            // @ts-ignore
            rewardsAmount={formattedRewardAmount}
            validatorIcon={
              validator.image ??
              validator.mintscan_image ??
              validator.keybase_image ??
              Images.Misc.Validator
            }
            percent={`${Math.round(apy[validator.address] * 100)}%`}
          />
        }
        <div className='flex justify-between'>
          <Buttons.Generic
            size='sm'
            color={Colors.getChainColor(activeChain)}
            onClick={onClickStake}
          >
            <div className={'flex justify-center text-white-100  items-center'}>
              <span className='mr-1 material-icons-round'>add_circle</span>
              <span>Stake</span>
            </div>
          </Buttons.Generic>
          <Buttons.Generic
            size='sm'
            color={isDark ? Colors.gray900 : Colors.white100}
            onClick={onClickUnstake}
          >
            <div className={'flex justify-center dark:text-white-100 text-black-100  items-center'}>
              <span className='mr-1 material-icons-round'>remove_circle</span>
              <span>Unstake</span>
            </div>
          </Buttons.Generic>
        </div>
        <Buttons.Generic
          onClick={onClickSwitchValidator}
          color={isDark ? Colors.gray900 : Colors.white100}
          size='normal'
          className='w-[344px]'
        >
          <div className={'flex justify-center dark:text-white-100 text-black-100  items-center'}>
            <span className='mr-1 material-icons-round'>swap_horizontal_circle</span>
            <span>Switch Validator</span>
          </div>
        </Buttons.Generic>
        <LineDivider size='sm' />
      </div>
      <div className='rounded-[16px] my-[16px] items-center'>
        <Text size='sm' className='p-[4px] font-bold ' color='text-gray-600 dark:text-gray-200'>
          {`About ${validator.moniker ?? validator.name}`}
        </Text>
        <div className='flex flex-col p-[4px]'>
          <ReadMoreText
            textProps={{ size: 'md', className: 'font-medium  flex flex-column' }}
            readMoreColor={Colors.getChainColor(activeChain)}
          >
            {validator.description.details}
          </ReadMoreText>
        </div>
      </div>
    </div>
  )
}

export type ValidatorDetailsProps = {
  validators: Record<string, Validator>
  validatorAddress: string
  delegation: Delegation
  reward: Reward
  percentChange: number
  unstakingPeriod: string
  apy: Record<string, number>
}

export default function ValidatorDetails() {
  const state = useLocation().state
  const navigate = useNavigate()

  const { percentChange, validators, validatorAddress, apy, delegation, reward, unstakingPeriod } =
    state as ValidatorDetailsProps

  const activeChain = useActiveChain()
  const wallet = useActiveWallet()
  const token = wallet.assets[activeChain].find(
    (asset) => asset.symbol === tokensByChain[activeChain].symbol,
  )
  const [showInputAmount, setShowInputAmount] = useState<STAKE_MODE>()
  const [showReviewTransactionSheet, setReviewTransactionSheet] = useState<boolean>(false)

  const { amount, isLoading, displayFeeText, memo, setMemo, error, fees, setAmount } = useStakeTx()

  const totalRewards = reward?.reward
    ?.reduce((a, v) => a + +fromSmall(v.amount, denoms[v.denom as SupportedDenoms].coinDecimals), 0)
    .toString()
  const formattedTotalReward = formatTokenAmount(totalRewards, ChainInfos[activeChain].denom, 6)

  const onReviewClaimReward = async () => {
    // claim reward
  }

  return (
    <div className='relative w-[400px] overflow-clip'>
      <PopupLayout
        header={
          <Header
            action={{
              onClick: function noRefCheck() {
                if (showInputAmount) {
                  setShowInputAmount(undefined)
                } else navigate(-1)
              },
              type: HeaderActionType.BACK,
            }}
            imgSrc={ChainLogos[activeChain]}
            title={
              <>
                <Text size='lg' className='font-bold'>
                  {!showInputAmount || showInputAmount === 'DELEGATE' ? 'Stake' : 'Unstake'}{' '}
                  {capitalize(ChainInfos[activeChain].denom.toLowerCase())}
                </Text>
              </>
            }
            topColor={ChainInfos[activeChain].theme.primaryColor}
          />
        }
      >
        <div className='flex flex-col p-7 mb-8 overflow-scroll'>
          {!showInputAmount && (
            <DetailsView
              onClaimClickReward={() => {
                setReviewTransactionSheet(true)
              }}
              onClickStake={() => {
                setShowInputAmount('DELEGATE')
              }}
              onClickSwitchValidator={() => {
                navigate('/stakeChooseValidator', {
                  state: {
                    validators,
                    apy: apy,
                    mode: 'REDELEGATE',
                    unstakingPeriod,
                    fromValidator: validatorAddress,
                    fromDelegation: delegation,
                  } as ChooseValidatorProps,
                })
              }}
              onClickUnstake={() => {
                setShowInputAmount('UNDELEGATE')
              }}
              activeChain={activeChain}
              apy={apy}
              delegation={delegation}
              formattedRewardAmount={formattedTotalReward}
              validator={validators[validatorAddress]}
              percentChange={percentChange}
            />
          )}
          {showInputAmount && (
            <InputStakeAmountView
              onClickNewValidator={() => setShowInputAmount(undefined)}
              mode={showInputAmount}
              unstakingPeriod={unstakingPeriod}
              toValidator={validators[validatorAddress]}
              delegation={delegation}
              activeChain={activeChain}
              token={token}
            />
          )}
        </div>
      </PopupLayout>
      <ReviewStakeTransaction
        autoAdjustAmount={{ amount: '0', feeAmount: fees, setAmount, token }}
        error={error}
        unstakingPeriod={unstakingPeriod}
        amount={amount}
        data={
          {
            delegations: { [validatorAddress]: delegation },
            validators: [],
            rewards: {},
          } as ClaimRewardReviewProps
        }
        feesText={displayFeeText}
        isLoading={isLoading}
        isVisible={showReviewTransactionSheet}
        memo={memo}
        onSubmit={onReviewClaimReward}
        setMemo={setMemo}
        type='CLAIM_REWARDS'
        onCloseHandler={() => {
          setReviewTransactionSheet(false)
        }}
        showLedgerPopup={false}
      />
      <BottomNav label={BottomNavLabel.Stake} />
    </div>
  )
}
