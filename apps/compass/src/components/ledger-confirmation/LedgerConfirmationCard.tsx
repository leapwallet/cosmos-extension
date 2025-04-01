import React from 'react'

import { Images } from '../../images'
import { LoaderAnimation } from '../loader/Loader'
import Text from '../text'

export default function LedgerConfirmationCard() {
  return (
    <div className='w-[344px] flex rounded-[8px] dark:bg-gray-900 bg-white-100 p-[12px] items-center'>
      <img src={Images.Misc.HardwareWallet} className='mr-[8px]' />
      <Text size='md' className='font-bold'>
        Approve transaction on Ledger
      </Text>
      <LoaderAnimation color='#E18881' className='h-5 w-5 bg-[#5A3634] rounded-2xl ml-auto' />
    </div>
  )
}
