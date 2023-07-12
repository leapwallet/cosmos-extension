import classNames from 'classnames'
import React from 'react'

type NoNFTEmptyCardProps = {
  title: string
  subTitle?: string
}

export function NoNFTEmptyCard({ title, subTitle }: NoNFTEmptyCardProps) {
  return (
    <div className='rounded-2xl bg-gray-900 p-8 flex flex-col items-center mb-4 text-center'>
      <div className='rounded-full bg-gray-800 p-[18px] w-fit flex'>
        <div className={classNames('material-icons-round w-6 h-6 text-gray-200')}>sell</div>
      </div>
      <div className='font-bold text-white-100 text-base mt-3'>{title}</div>
      {subTitle && <div className='text-gray-400 font-medium text-xs'>{subTitle}</div>}{' '}
    </div>
  )
}
