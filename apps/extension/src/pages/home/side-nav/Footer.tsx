import Text from 'components/text'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { isCompassWallet } from 'utils/isCompassWallet'

import VersionIndicator from './VersionIndicator'

export const Footer = observer(() => {
  return (
    <div className='flex flex-col justify-center items-center  mt-[80px] mb-[60px] ml-[24px] mr-[24px]'>
      <Text size='xl' color='text-center text-gray-600 dark:text-gray-200 font-bold mb-[10px]'>
        {isCompassWallet() ? 'Compass' : 'Leap'} Wallet
      </Text>
      <VersionIndicator />
    </div>
  )
})
