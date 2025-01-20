import React from 'react'

export type BadgeProps = {
  text: string
  isImgRounded?: boolean
  title?: string
}

export default function Badge({ text, title }: BadgeProps) {
  return (
    <div
      className='flex items-center dark:bg-gray-800 bg-gray-100 hover:overflow-visible h-4 rounded-[4px] py-0.5 px-1'
      title={title ?? ''}
    >
      <div className='text-[10px] dark:text-gray-200 text-gray-800 font-medium text-ellipsis overflow-hidden whitespace-nowrap'>
        {text}
      </div>
    </div>
  )
}
