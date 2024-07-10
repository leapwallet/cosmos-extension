import Text from 'components/text'
import React from 'react'

export function CardWithHeading({ children, title }: { title: string; children: React.ReactNode }) {
  return (
    <div className=' dark:bg-gray-950 bg-white-100 rounded-[16px]  items-center'>
      <Text size='xs' className='pl-[16px] pr-[16px] pt-[16px] font-bold' color='text-gray-400'>
        {title}
      </Text>
      {children}
    </div>
  )
}
