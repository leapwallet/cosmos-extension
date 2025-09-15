import classNames from 'classnames'
import React from 'react'
import Skeleton from 'react-loading-skeleton'

export default function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={classNames('w-full', className)}>
      <div className='flex flex-col gap-y-5 overflow-clip items-center'>
        <Skeleton
          className='h-[128px] rounded-sm'
          containerClassName='w-full block !leading-none'
        />
        <Skeleton
          className='h-[28px] rounded-full'
          containerClassName='w-full px-10 block !leading-none'
        />
      </div>
    </div>
  )
}
