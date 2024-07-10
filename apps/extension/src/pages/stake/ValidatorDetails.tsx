import {
  capitalize,
  useActiveStakingDenom,
  useGetTokenSpendableBalances,
} from '@leapwallet/cosmos-wallet-hooks'
import { Delegation, Reward, SupportedChain, Validator } from '@leapwallet/cosmos-wallet-sdk'
import BigNumber from 'bignumber.js'
import BottomNav, { BottomNavLabel } from 'components/bottom-nav/BottomNav'
import { PageHeader } from 'components/header'
import PopupLayout from 'components/layout/popup-layout'
import Text from 'components/text'
import { useChainPageInfo } from 'hooks'
import { SelectedNetwork } from 'hooks/settings/useNetwork'
import React, { useCallback, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { HeaderActionType } from 'types/components'

import { ChooseValidatorProps } from './ChooseValidator'
import {
  InputStakeAmountView,
  STAKE_MODE,
  ValidatorDetailsView,
  YourRewardsSheet,
} from './components'

export type ValidatorDetailsProps = {
  validators: Record<string, Validator>
  validatorAddress: string
  delegation: Delegation
  reward: Reward
  percentChange: number
  unstakingPeriod: string
  apy: Record<string, number>
  activeChain: SupportedChain
  activeNetwork: SelectedNetwork
}

export default function ValidatorDetails() {
  const state = useLocation().state
  const navigate = useNavigate()

  const {
    validators = {},
    validatorAddress = '',
    apy = {},
    delegation = {},
    reward,
    unstakingPeriod,
    activeChain,
    activeNetwork,
  } = state as ValidatorDetailsProps
  const { headerChainImgSrc } = useChainPageInfo()

  const { allAssets } = useGetTokenSpendableBalances(activeChain, activeNetwork)
  const [activeStakingDenom] = useActiveStakingDenom(activeChain, activeNetwork)

  const token = allAssets?.find((e) => e.symbol === (activeStakingDenom.coinDenom ?? ''))
  const [showInputAmount, setShowInputAmount] = useState<STAKE_MODE>()
  const [showYourRewardsSheet, setShowYourRewardsSheet] = useState(false)

  const totalRewardsDollarAmt = reward?.reward
    ?.reduce((totalSum, token) => {
      return totalSum.plus(new BigNumber(token.currenyAmount ?? ''))
    }, new BigNumber('0'))
    .toString()

  const handleBackClick = useCallback(() => {
    if (showInputAmount) {
      setShowInputAmount(undefined)
    } else {
      navigate(-1)
    }
  }, [navigate, showInputAmount])

  return (
    <div className='relative w-[400px] overflow-clip'>
      <PopupLayout
        header={
          <PageHeader
            title={
              <>
                <Text size='lg' className='font-bold'>
                  {!showInputAmount || showInputAmount === 'DELEGATE' ? 'Stake' : 'Unstake'}{' '}
                  {capitalize((activeStakingDenom.coinDenom ?? '').toLowerCase())}
                </Text>
              </>
            }
            imgSrc={headerChainImgSrc}
            action={{
              onClick: handleBackClick,
              type: HeaderActionType.BACK,
            }}
          />
        }
      >
        <div className='flex flex-col p-7 mb-8 overflow-scroll'>
          {!showInputAmount && (
            <ValidatorDetailsView
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
                    activeChain,
                    activeNetwork,
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
              activeNetwork={activeNetwork}
            />
          ) : null}
        </div>
      </PopupLayout>

      <YourRewardsSheet
        isOpen={showYourRewardsSheet}
        onClose={() => setShowYourRewardsSheet(false)}
        validator={validators[validatorAddress]}
        reward={reward}
        forceChain={activeChain}
        forceNetwork={activeNetwork}
      />
      <BottomNav label={BottomNavLabel.Stake} />
    </div>
  )
}
