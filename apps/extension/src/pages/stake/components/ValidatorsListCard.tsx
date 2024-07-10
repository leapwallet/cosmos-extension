import { formatTokenAmount, sliceWord, useValidatorImage } from '@leapwallet/cosmos-wallet-hooks'
import { Validator } from '@leapwallet/cosmos-wallet-sdk'
import classNames from 'classnames'
import Text from 'components/text'
import currency from 'currency.js'
import { Images } from 'images'
import React, { useState } from 'react'
import { imgOnError } from 'utils/imgOnError'

type ValidatorsListCardProps = {
  validator: Validator
  apys: Record<string, number>
  onClick: () => void
  activeStakingCoinDenom: string
}

const ValidatorsListCard = React.memo(
  ({ validator, apys, onClick, activeStakingCoinDenom }: ValidatorsListCardProps) => {
    const [showInfo, setShowInfo] = useState<boolean>(false)
    const { data: keybaseImageUrl } = useValidatorImage(validator)

    return (
      <>
        <div className='flex justify-between h-[72px] items-center px-4 bg-white-100 dark:bg-gray-950 cursor-pointer'>
          <div onClick={onClick} className={classNames('flex w-[256px] items-center flex-grow')}>
            <img
              src={keybaseImageUrl ?? validator.image ?? Images.Misc.Validator}
              onError={imgOnError(Images.Misc.Validator)}
              className={'rounded-full mr-3 overflow-clip w-10 h-10'}
            />

            <div className={classNames('flex flex-col justify-center items-start')}>
              <div
                className={classNames(
                  'text-base font-bold text-black-100 dark:text-white-100 text-left text-ellipsis overflow-hidden',
                )}
              >
                <Text size='md' className='font-bold'>
                  {sliceWord(validator.moniker ?? validator.name, 15, 3)}
                </Text>
              </div>

              <div className={classNames('text-xs font-medium text-gray-400')}>{`Staked: ${currency(
                (validator.delegations?.total_tokens_display ?? validator.tokens) as string,
                {
                  symbol: '',
                  precision: 0,
                },
              ).format()} | APY: ${
                apys[validator.address]
                  ? `${currency(apys[validator.address] * 100, {
                      precision: 2,
                      symbol: '',
                    }).format()}%`
                  : 'N/A'
              }`}</div>
            </div>
            <div className='flex flex-grow' />
          </div>

          <div className={classNames('flex gap-x-2')}>
            <span
              onClick={() => setShowInfo(!showInfo)}
              className='material-icons-round w-6 text-gray-400'
            >
              info_outlined
            </span>

            <span onClick={onClick} className='material-icons-round w-6 text-gray-400'>
              keyboard_arrow_right
            </span>
          </div>
        </div>

        {showInfo && (
          <div className='flex rounded-lg flex-row justify-evenly mx-4 mb-4 p-4 dark:bg-gray-900 bg-gray-50'>
            <div className='flex flex-col grow'>
              <Text size='xs' color='dark:text-gray-400 text-gray-600'>
                Voting power
              </Text>

              <Text size='xs' className='font-bold mt-1'>
                {formatTokenAmount(validator.tokens as string, activeStakingCoinDenom, 2)}
              </Text>
            </div>

            <div className='flex flex-col grow'>
              <Text size='xs' color='dark:text-gray-400 text-gray-600'>
                Commission
              </Text>

              <Text size='xs' className='font-bold mt-1'>
                {`${(+(validator.commission?.commission_rates.rate ?? '') * 100).toFixed(2)}%`}
              </Text>
            </div>
          </div>
        )}
      </>
    )
  },
)

ValidatorsListCard.displayName = 'ValidatorsListCard'
export { ValidatorsListCard }
