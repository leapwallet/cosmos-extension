import { Info } from '@phosphor-icons/react'
import React from 'react'

import Text from '../text'

export default function WarningCard({ text, subText }: { text: string; subText?: string }) {
  return (
    <div className='dark:bg-gray-950 p-[16px] pr-[21px] w-[344px] h-[86px] bg-white-100 rounded-2xl justify-center flex'>
      <Info size={16} className='text-orange-500' />
      <div className='flex flex-col gap-y-[2px]'>
        <Text size='sm' className='text font-black ml-1'>
          {text}
        </Text>
        {subText ? (
          <Text size='xs' color='text-gray-400 ml-[5px]'>
            {subText}
          </Text>
        ) : null}
      </div>
    </div>
  )
}
