import React from 'react'

export type BadgeProps = {
  text: string
  isImgRounded?: boolean
}

export default function Badge({ text }: BadgeProps) {
  return (
    <div className='flex items-center dark:bg-gray-800 bg-gray-100 hover:overflow-visible  rounded-l-xl h-4 rounded-r py-0.5 px-1'>
      <div className='text-[10px] dark:text-gray-200 text-gray-800 font-medium text-ellipsis overflow-hidden whitespace-nowrap'>
        {text}
      </div>
    </div>
  )
}
