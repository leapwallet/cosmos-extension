import Text from 'components/text'
import { Images } from 'images'
import React from 'react'

export function NoStake() {
  return (
    <div className='flex flex-col items-center justify-center'>
      <img src={Images.Stake.NoStakeSVG} className='h-[240px] w-[240px] mt-6 mb-4' />
      <Text size='lg' className='font-bold text-center mb-0.5'>
        Staking not available
      </Text>
      <Text size='md' className='text-center max-w-[300px]' color='text-gray-300'>
        Unfortunately, this chain does not support staking due to its underlying design
      </Text>
    </div>
  )
}
