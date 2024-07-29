import { useActiveStakingDenom } from '@leapwallet/cosmos-wallet-hooks'
import Text from 'components/text'
import { Images } from 'images'
import React from 'react'

export default function NotStakedCard() {
  const [activeStakingDenom] = useActiveStakingDenom()
  return (
    <div className='flex flex-col items-center w-full px-4 pt-6 bg-white-100 dark:bg-gray-950 rounded-2xl'>
      <Text size='xs' color='text-gray-600 dark:text-gray-400'>
        You haven&apos;t staked any {activeStakingDenom.coinDenom}
      </Text>
      <Text className='text-[18px] font-bold' color='text-black-100 dark:text-white-100'>
        Stake tokens to earn rewards
      </Text>
      <img className='w-[200px] h-[106px] object-cover mt-8' src={Images.Logos.LeapLogo} />
    </div>
  )
}
