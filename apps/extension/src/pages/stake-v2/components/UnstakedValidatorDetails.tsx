import {
  daysLeft,
  sliceWord,
  useActiveStakingDenom,
  useStaking,
  useValidatorImage,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  UnbondingDelegation,
  UnbondingDelegationEntry,
  Validator,
} from '@leapwallet/cosmos-wallet-sdk'
import { Buttons, ThemeName, useTheme } from '@leapwallet/leap-ui'
import BigNumber from 'bignumber.js'
import BottomModal from 'components/bottom-modal'
import Text from 'components/text'
import currency from 'currency.js'
import { useDefaultTokenLogo } from 'hooks'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { Images } from 'images'
import React, { useState } from 'react'
import { Colors } from 'theme/colors'
import { imgOnError } from 'utils/imgOnError'
import { timeLeft } from 'utils/timeLeft'

import ReviewCancelUnstakeTx from './ReviewCancelUnstakeTx'

interface UnstakedValidatorDetailsProps {
  isOpen: boolean
  onClose: () => void
  validator: Validator
  unbondingDelegation?: UnbondingDelegation
  unbondingDelegationEntry?: UnbondingDelegationEntry
}

export default function UnstakedValidatorDetails({
  isOpen,
  onClose,
  validator,
  unbondingDelegationEntry,
}: UnstakedValidatorDetailsProps) {
  const [activeStakingDenom] = useActiveStakingDenom()
  const defaultTokenLogo = useDefaultTokenLogo()
  const [formatCurrency] = useFormatCurrency()
  const { theme } = useTheme()
  const [showReviewCancelUnstakeTx, setShowReviewCancelUnstakeTx] = useState(false)
  const { network } = useStaking()
  const apys = network?.validatorApys
  const { data: imageUrl } = useValidatorImage(validator)

  return (
    <>
      <BottomModal
        isOpen={isOpen}
        onClose={onClose}
        title='Validator Details'
        closeOnBackdropClick={true}
        className='p-6'
      >
        <div className='flex flex-col w-full gap-y-4'>
          <div className='flex w-full gap-x-2 items-center'>
            <img
              width={24}
              height={24}
              className='rounded-full'
              src={imageUrl ?? validator?.image ?? Images.Misc.Validator}
              onError={imgOnError(Images.Misc.Validator)}
            />
            <Text size='lg' color='text-black-100 dark:text-white-100' className='font-bold'>
              {sliceWord(validator.moniker, 10, 3)}
            </Text>
          </div>
          <div className='flex w-full rounded-lg p-3 bg-white-100 dark:bg-gray-950 border  border-gray-100 dark:border-gray-850'>
            <div className='flex flex-col items-center gap-y-0.5 w-1/3'>
              <Text color='text-gray-700 dark:text-gray-400' size='xs' className='font-medium'>
                Total Staked
              </Text>
              <Text color='text-black-100 dark:text-white-100' size='sm' className='font-bold'>
                {currency(validator?.delegations?.total_tokens_display ?? 1, {
                  symbol: '',
                  precision: 0,
                }).format()}
              </Text>
            </div>
            <div className='w-px h-10 bg-gray-200 dark:bg-gray-850' />
            <div className='flex flex-col items-center gap-y-0.5 w-1/3'>
              <Text color='text-gray-700 dark:text-gray-400' size='xs' className='font-medium'>
                Commission
              </Text>
              <Text color='text-black-100 dark:text-white-100' size='sm' className='font-bold'>
                {validator.commission?.commission_rates.rate
                  ? `${new BigNumber(validator.commission.commission_rates.rate)
                      .multipliedBy(100)
                      .toFixed(0)}%`
                  : 'N/A'}
              </Text>
            </div>
            <div className='w-px h-10 bg-gray-200 dark:bg-gray-850' />
            <div className='flex flex-col items-center gap-y-0.5 w-1/3'>
              <Text color='text-gray-700 dark:text-gray-400' size='xs' className='font-medium'>
                APY
              </Text>
              <Text color='text-black-100 dark:text-white-100' size='sm' className='font-bold'>
                {apys &&
                  (apys[validator.address]
                    ? `${currency(apys[validator.address] * 100, {
                        precision: 2,
                        symbol: '',
                      }).format()}%`
                    : 'N/A')}
              </Text>
            </div>
          </div>
          <Text size='xs' color='text-gray-800 dark:text-gray-200' className='font-medium'>
            Pending Unstake
          </Text>
          <div className='flex gap-x-4 w-full p-4 bg-white-100 dark:bg-gray-950 rounded-lg'>
            <img
              className='w-9 h-9'
              src={activeStakingDenom.icon}
              onError={imgOnError(defaultTokenLogo)}
            />
            <div>
              <Text
                color='text-black-100 dark:text-white-100'
                size='sm'
                className='font-bold mt-0.5'
              >
                {formatCurrency(new BigNumber(unbondingDelegationEntry?.currencyBalance ?? ''))}
              </Text>
              <Text color='text-gray-700 dark:text-gray-400' size='xs' className='font-medium'>
                {unbondingDelegationEntry?.formattedBalance}
              </Text>
            </div>
            <div className='ml-auto flex flex-col items-end'>
              <Text
                color='text-black-100 dark:text-white-100'
                size='sm'
                className='font-bold mt-0.5'
              >
                {timeLeft(unbondingDelegationEntry?.completion_time ?? '')}
              </Text>
              <Text color='text-gray-700 dark:text-gray-400' size='xs' className='font-medium'>
                {unbondingDelegationEntry?.completion_time &&
                  daysLeft(unbondingDelegationEntry?.completion_time)}
              </Text>
            </div>
          </div>
          <Buttons.Generic
            onClick={() => {
              setShowReviewCancelUnstakeTx(true)
              onClose()
            }}
            className='w-full'
            size='normal'
            color={theme === ThemeName.DARK ? Colors.white100 : Colors.black100}
          >
            <Text color='text-white-100 dark:text-black-100'>Cancel Unstake</Text>
          </Buttons.Generic>
        </div>
      </BottomModal>
      <ReviewCancelUnstakeTx
        isOpen={showReviewCancelUnstakeTx}
        onClose={() => setShowReviewCancelUnstakeTx(false)}
        unbondingDelegationEntry={unbondingDelegationEntry}
        validator={validator}
      />
    </>
  )
}
