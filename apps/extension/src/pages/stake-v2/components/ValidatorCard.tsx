/* eslint-disable @typescript-eslint/no-explicit-any */
import { sliceWord, useValidatorImage } from '@leapwallet/cosmos-wallet-hooks'
import { UnbondingDelegation, Validator } from '@leapwallet/cosmos-wallet-sdk'
import BigNumber from 'bignumber.js'
import Text from 'components/text'
import { useFormatCurrency } from 'hooks/settings/useCurrency'
import { Images } from 'images'
import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { epochIntervalStore } from 'stores/epoch-interval-store'
import { hideAssetsStore } from 'stores/hide-assets-store'
import { imgOnError } from 'utils/imgOnError'
import { isSidePanel } from 'utils/isSidePanel'

type ValidatorCardProps = {
  validator: Validator
  isCancelledScheduled?: boolean
  onClick?: () => void
  isCancleUnstakeSupported: boolean
  timeLeftText: string | null
  entry: UnbondingDelegation['entries'][number]
}

const ValidatorCardView = ({
  validator,
  isCancelledScheduled,
  onClick,
  isCancleUnstakeSupported,
  timeLeftText,
  entry,
}: ValidatorCardProps) => {
  const { data: imageUrl } = useValidatorImage(validator)
  const [formatCurrency] = useFormatCurrency()

  const amountTitleText = useMemo(() => {
    if (new BigNumber(entry.currencyBalance ?? '').gt(0)) {
      return hideAssetsStore.formatHideBalance(
        formatCurrency(new BigNumber(entry.currencyBalance ?? '')),
      )
    } else {
      return hideAssetsStore.formatHideBalance(entry.formattedBalance ?? '')
    }
  }, [entry.currencyBalance, entry.formattedBalance, formatCurrency])

  const amountSubtitleText = useMemo(() => {
    if (new BigNumber(entry.currencyBalance ?? '').gt(0)) {
      return hideAssetsStore.formatHideBalance(entry.formattedBalance ?? '')
    }

    return ''
  }, [entry.currencyBalance, entry.formattedBalance])

  return (
    <div
      onClick={onClick}
      className={`flex justify-between items-center px-4 py-3 bg-white-100 dark:bg-gray-950 cursor-pointer rounded-xl ${
        isCancleUnstakeSupported && 'cursor-pointer'
      }`}
    >
      <div className='flex items-center w-full'>
        <img
          src={imageUrl ?? validator?.image ?? Images.Misc.Validator}
          onError={imgOnError(Images.Misc.Validator)}
          width={28}
          height={28}
          className='mr-4 rounded-full'
        />

        <div className='flex justify-between items-center w-full'>
          <div className='flex flex-col'>
            <Text
              size='sm'
              color='text-black-100 dark:text-white-100'
              className='font-bold  overflow-hidden'
            >
              {sliceWord(
                validator.moniker,
                isSidePanel()
                  ? 6 + Math.floor(((Math.min(window.innerWidth, 400) - 320) / 81) * 7)
                  : 10,
                3,
              )}
            </Text>

            {isCancelledScheduled ? (
              <Text size='xs' color='dark:text-yellow-500 text-yellow-600' className='font-medium'>
                Queued for cancellation in {epochIntervalStore.timeLeft}
              </Text>
            ) : (
              !!timeLeftText && (
                <Text size='xs' color='dark:text-gray-400 text-gray-600' className='font-medium'>
                  {timeLeftText}
                </Text>
              )
            )}
          </div>

          <div className='flex flex-col items-end'>
            <Text size='sm' color='text-black-100 dark:text-white-100' className='font-bold'>
              {amountTitleText}
            </Text>

            <Text size='xs' color='dark:text-gray-400 text-gray-600' className='font-medium'>
              {amountSubtitleText}
            </Text>
          </div>
        </div>
      </div>
    </div>
  )
}

export const ValidatorCard = observer(ValidatorCardView)
