import { sliceWord, useValidatorImage } from '@leapwallet/cosmos-wallet-hooks'
import { Delegation, SupportedChain, Validator } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons, LineDivider, ThemeName, useTheme } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import ReadMoreText from 'components/read-more-text'
import Text from 'components/text'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { useHideAssets } from 'hooks/settings/useHideAssets'
import { Images } from 'images'
import React from 'react'
import { Colors } from 'theme/colors'

import {
  CancelUndelegationDetailsViewAmountCard,
  CancelUndelegationDetailsViewHeading,
  StakeRewardCard,
} from './index'

type ValidatorDetailsViewProps = {
  validator: Validator
  delegation: Delegation
  totalRewardsDollarAmt: string
  totalRewardsTokens: string
  activeChain: SupportedChain
  onClickStake: () => void
  onClickUnstake: () => void
  onClickSwitchValidator: () => void
  onClickClaimReward: () => void
}

const ValidatorDetailsView = React.memo(
  ({
    validator,
    delegation,
    totalRewardsDollarAmt,
    totalRewardsTokens,
    activeChain,
    onClickClaimReward,
    onClickStake,
    onClickSwitchValidator,
    onClickUnstake,
  }: ValidatorDetailsViewProps) => {
    const [formatter] = useFormatCurrency()
    const isDark = useTheme().theme === ThemeName.DARK
    const { formatHideBalance } = useHideAssets()
    const { data: imgUrl } = useValidatorImage(validator)

    return (
      <div>
        <CancelUndelegationDetailsViewHeading validator={validator} />
        <div className='flex flex-col gap-y-4'>
          <CancelUndelegationDetailsViewAmountCard
            formatHideBalance={formatHideBalance}
            currencyAmountDelegation={formatter(
              new BigNumber(delegation.balance?.currenyAmount ?? ''),
            )}
            totalDelegations={delegation.balance?.formatted_amount ?? ''}
            validatorName={sliceWord(validator.moniker ?? validator.name ?? '', 18, 3)}
            renderingOnValidatorDetails={true}
          />

          {totalRewardsTokens &&
            totalRewardsTokens !== 'undefined' &&
            totalRewardsTokens.length && (
              <StakeRewardCard
                isLoading={false}
                onClaim={onClickClaimReward}
                rewardsAmount={totalRewardsDollarAmt}
                validatorIcon={imgUrl ?? validator.image ?? Images.Misc.Validator}
                rewardsTokens={totalRewardsTokens}
                forceChain={activeChain}
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
              color={isDark ? Colors.gray950 : Colors.white100}
              onClick={onClickUnstake}
            >
              <div
                className={'flex justify-center dark:text-white-100 text-black-100  items-center'}
              >
                <span className='mr-1 material-icons-round'>remove_circle</span>
                <span>Unstake</span>
              </div>
            </Buttons.Generic>
          </div>

          <Buttons.Generic
            onClick={onClickSwitchValidator}
            color={isDark ? Colors.gray950 : Colors.white100}
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
          <Text size='sm' className='p-[4px] font-bold ' color='text-gray-600 dark:text-gray-400'>
            {`About ${validator.moniker ?? validator.name ?? 'Validator'}`}
          </Text>
          <div className='flex flex-col p-[4px]'>
            <ReadMoreText
              textProps={{ size: 'md', className: 'font-medium flex flex-column' }}
              readMoreColor={Colors.getChainColor(activeChain)}
            >
              {validator.description?.details ?? ''}
            </ReadMoreText>
          </div>
        </div>
      </div>
    )
  },
)

ValidatorDetailsView.displayName = 'ValidatorDetailsView'
export { ValidatorDetailsView }
