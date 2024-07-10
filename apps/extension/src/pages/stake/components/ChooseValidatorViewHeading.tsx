import Text from 'components/text'
import React from 'react'

type ChooseValidatorViewHeadingProps = {
  activeStakingCoinDenom: string
}

const ChooseValidatorViewHeading = React.memo(
  ({ activeStakingCoinDenom }: ChooseValidatorViewHeadingProps) => {
    return (
      <div className='flex flex-col pb-6'>
        <Text size='xxl' className='text-[28px] mb-1 font-black'>
          Choose a Validator
        </Text>

        <Text size='sm' color='dark:text-gray-400 text-gray-600' className='font-bold'>
          To delegate {'(stake)'} your {activeStakingCoinDenom} token, please select a validator
          from the list of active validators below:
        </Text>
      </div>
    )
  },
)

ChooseValidatorViewHeading.displayName = 'ChooseValidatorViewHeading'
export { ChooseValidatorViewHeading }
