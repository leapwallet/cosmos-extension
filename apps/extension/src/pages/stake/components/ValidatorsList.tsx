import { Validator } from '@leapwallet/cosmos-wallet-sdk'
import { CardDivider } from '@leapwallet/leap-ui'
import Text from 'components/text'
import React from 'react'

import { ValidatorsListCard } from './index'

type ValidatorsListProps = {
  validators: Validator[]
  apys: Record<string, number>
  onShuffleClick?: () => void
  onSelectValidator: (v: Validator) => void
  activeStakingCoinDenom: string
}

const ValidatorsList = React.memo(
  ({
    validators,
    apys,
    onShuffleClick,
    onSelectValidator,
    activeStakingCoinDenom,
  }: ValidatorsListProps) => {
    if (!validators || validators.length === 0) return <></>

    return (
      <div className='pt-4 rounded-2xl overflow-clip dark:bg-gray-950 bg-white-100'>
        <div className='flex justify-between'>
          <Text size='xs' color='dark:text-gray-400 text-gray-600' className='font-bold py-1 px-4'>
            Validators
          </Text>

          {onShuffleClick && (
            <div className='px-4'>
              <div
                className='flex justify-center text-xs text-gray-600 dark:text-gray-400 items-center cursor-pointer'
                onClick={() => {
                  onShuffleClick()
                }}
              >
                <span className='mr-1 text-lg material-icons-round'>shuffle</span>
                <span className='text-xs font-semibold'>Shuffle</span>
              </div>
            </div>
          )}
        </div>

        {validators.map((v, index) => (
          <React.Fragment key={`validator-${index}-${v.address}`}>
            {index !== 0 && (
              <div className='[&>div]:dark:!bg-gray-950'>
                <CardDivider />
              </div>
            )}

            <ValidatorsListCard
              onClick={() => onSelectValidator(v)}
              apys={apys}
              validator={v}
              activeStakingCoinDenom={activeStakingCoinDenom}
            />
          </React.Fragment>
        ))}
      </div>
    )
  },
)

ValidatorsList.displayName = 'ValidatorsList'
export { ValidatorsList }
