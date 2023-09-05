import {
  useChainInfo,
  useGetTokenBalances,
  useValidatorImage,
} from '@leapwallet/cosmos-wallet-hooks'
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
import BottomNav, { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import PopupLayout from 'components/layout/popup-layout'
import ReadMoreText from 'components/read-more-text'
import showOrHideBalances from 'components/show-or-hide-balances'
import Text from 'components/text'
import currency from 'currency.js'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useHideAssets } from 'hooks/settings/useHideAssets'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import { Images } from 'images'
import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Colors } from 'theme/colors'
import { imgOnError } from 'utils/imgOnError'
import { capitalize, sliceWord } from 'utils/strings'

import { ChooseValidatorProps } from './chooseValidator'
import { YourRewardsSheet } from './components'
import { StakeRewardCard } from './index'
import InputStakeAmountView, { STAKE_MODE } from './InputStakeAmountView'

function ValidatorHeading({ validator }: { validator: Validator }) {
  const { data: imageUrl } = useValidatorImage(validator)

  return (
    <div className='flex flex-col pb-4 gap-2'>
      <div className='flex items-center gap-3'>
        <div className='h-9 w-9 rounded-full overflow-clip border border-gray-400 shrink flex items-center justify-center'>
          <Avatar
            size='sm'
            avatarImage={imageUrl ?? validator.image ?? Images.Misc.Validator}
            avatarOnError={imgOnError(Images.Misc.Validator)}
          />
        </div>
        <Text size='xxl' className='font-black'>
          {validator.moniker ?? validator.name}
        </Text>
      </div>
      <Text size='md' color='dark:text-gray-200 text-gray-800' className='font-bold'>
        {`Staked: ${currency(validator.delegations?.total_tokens_display as number, {
          precision: 2,
          symbol: '',
        }).format()} | Commission: ${
          currency((+(validator.commission?.commission_rates.rate ?? '') * 100).toString(), {
            precision: 0,
            symbol: '',
          }).format() + '%'
        }`}
      </Text>
    </div>
  )
}

function DepositAmountCard({
  totalDelegations,
  currencyAmountDelegation,
  validatorName,
  percentage,
  formatHideBalance,
}: {
  validatorName: string
  totalDelegations: string
  currencyAmountDelegation: string
  percentage: number
  // eslint-disable-next-line no-unused-vars
  formatHideBalance: (s: string) => React.ReactNode
}) {
  if (!totalDelegations) return null

  return (
    <div className='dark:bg-gray-900 rounded-2xl bg-white-100 pt-4'>
      {totalDelegations && (
        <Text
          size='xs'
          color='dark:text-gray-200 text-gray-600'
          className='font-bold mb-3 py-1 px-4'
        >
          Your deposited amount {`(${validatorName})`}
        </Text>
      )}
      {totalDelegations && (
        <div className='flex px-4 pb-4 justify-between items-center'>
          <div>
            <Text size='xl' className='text-[28px] mb-2 font-black'>
              {formatHideBalance(currencyAmountDelegation)}
            </Text>
            <Text size='xs' className='font-semibold'>
              {formatHideBalance(totalDelegations)}
              <span className='mx-2'>|</span>
              {showOrHideBalances(false, percentage)}
            </Text>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailsView({
  validator,
  delegation,
  totalRewardsDollarAmt,
  totalRewardsTokens,
  activeChain,
  percentChange,
  onClickClaimReward,
  onClickStake,
  onClickSwitchValidator,
  onClickUnstake,
}: {
  validator: Validator
  delegation: Delegation
  totalRewardsDollarAmt: string
  totalRewardsTokens: string
  activeChain: SupportedChain
  percentChange: number
  onClickStake: () => void
  onClickUnstake: () => void
  onClickSwitchValidator: () => void
  onClickClaimReward: () => void
}) {
  const [formatter] = useFormatCurrency()
  const isDark = useTheme().theme === ThemeName.DARK
  const { formatHideBalance } = useHideAssets()
  const { data: imgUrl } = useValidatorImage(validator)

  return (
    <div>
      <ValidatorHeading validator={validator} />
      <div className='flex flex-col gap-y-4'>
        <DepositAmountCard
          formatHideBalance={formatHideBalance}
          currencyAmountDelegation={formatter(
            new BigNumber(delegation.balance?.currenyAmount ?? ''),
          )}
          totalDelegations={delegation.balance?.formatted_amount ?? ''}
          validatorName={sliceWord(validator.moniker ?? validator.name ?? '', 18, 3)}
          percentage={percentChange}
        />

        {totalRewardsTokens && totalRewardsTokens !== 'undefined' && totalRewardsTokens.length && (
          <StakeRewardCard
            isLoading={false}
            onClaim={onClickClaimReward}
            rewardsAmount={totalRewardsDollarAmt}
            validatorIcon={imgUrl ?? validator.image ?? Images.Misc.Validator}
            rewardsTokens={totalRewardsTokens}
          />
        )}

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
          {`About ${validator.moniker ?? validator.name ?? 'Validator'}`}
        </Text>
        <div className='flex flex-col p-[4px]'>
          <ReadMoreText
            textProps={{ size: 'md', className: 'font-medium  flex flex-column' }}
            readMoreColor={Colors.getChainColor(activeChain)}
          >
            {validator.description?.details ?? ''}
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

  const {
    percentChange,
    validators = {},
    validatorAddress = '',
    apy = {},
    delegation = {},
    reward,
    unstakingPeriod,
  } = state as ValidatorDetailsProps

  const activeChain = useActiveChain()
  const { allAssets } = useGetTokenBalances()
  const token = allAssets?.find((e) => e.symbol === (ChainInfos[activeChain]?.denom ?? ''))
  const [showInputAmount, setShowInputAmount] = useState<STAKE_MODE>()
  const [showYourRewardsSheet, setShowYourRewardsSheet] = useState(false)

  const defaultTokenLogo = useDefaultTokenLogo()
  const totalRewardsDollarAmt = reward?.reward
    ?.reduce((totalSum, token) => {
      return totalSum.plus(new BigNumber(token.currenyAmount ?? ''))
    }, new BigNumber('0'))
    .toString()

  const activeChainInfo = useChainInfo()

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
            imgSrc={activeChainInfo.chainSymbolImageUrl ?? defaultTokenLogo}
            title={
              <>
                <Text size='lg' className='font-bold'>
                  {!showInputAmount || showInputAmount === 'DELEGATE' ? 'Stake' : 'Unstake'}{' '}
                  {capitalize((ChainInfos[activeChain]?.denom ?? '').toLowerCase())}
                </Text>
              </>
            }
            topColor={Colors.getChainColor(activeChain)}
          />
        }
      >
        <div className='flex flex-col p-7 mb-8 overflow-scroll'>
          {!showInputAmount && (
            <DetailsView
              onClickClaimReward={() => setShowYourRewardsSheet(true)}
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
              delegation={delegation as Delegation}
              totalRewardsDollarAmt={totalRewardsDollarAmt}
              totalRewardsTokens={
                reward?.reward.length
                  ? `${token?.symbol ?? ''}${
                      (reward?.reward.length ?? 1) > 1 ? ` +${reward?.reward.length - 1} more` : ''
                    }`
                  : ''
              }
              validator={validators[validatorAddress] ?? {}}
              percentChange={percentChange}
            />
          )}
          {showInputAmount && token ? (
            <InputStakeAmountView
              mode={showInputAmount}
              unstakingPeriod={unstakingPeriod}
              toValidator={validators[validatorAddress]}
              delegation={delegation as Delegation}
              activeChain={activeChain}
              token={token}
            />
          ) : null}
        </div>
      </PopupLayout>

      <YourRewardsSheet
        isOpen={showYourRewardsSheet}
        onClose={() => setShowYourRewardsSheet(false)}
        validator={validators[validatorAddress]}
        reward={reward}
      />
      <BottomNav label={BottomNavLabel.Stake} />
    </div>
  )
}
