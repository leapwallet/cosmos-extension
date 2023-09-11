import classNames from 'classnames'
import React, { ReactNode } from 'react'

type NoCollectionCardProps = {
  title: string
  subTitle?: ReactNode
}

export function NoCollectionCard({ title, subTitle }: NoCollectionCardProps) {
  return (
    <div className='rounded-2xl bg-white-100 dark:bg-gray-900 p-8 flex flex-col items-center mb-4 text-center'>
      <div className='rounded-full bg-gray-50 dark:bg-gray-800 p-[18px] w-fit flex'>
        <div className={classNames('material-icons-round w-6 h-6 text-gray-200')}>sell</div>
      </div>
      <div className='font-bold text-gray-800 dark:text-white-100 text-base mt-3'>{title}</div>
      {subTitle && <div className='text-gray-400 font-medium text-sm'>{subTitle}</div>}
    </div>
  )
}
