import classNames from 'classnames'
import React from 'react'
import Skeleton from 'react-loading-skeleton'

export default function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={classNames('w-full', className)}>
      <div className='flex flex-col gap-y-[24px] overflow-clip rounded-2xl'>
        <Skeleton count={1} height={248} containerClassName='!leading-none block' />
        <Skeleton count={1} height={34} containerClassName='!leading-none block' />
      </div>
    </div>
  )
}
