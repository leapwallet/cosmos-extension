import classNames from 'classnames'
import React from 'react'
import Skeleton from 'react-loading-skeleton'

export default function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={classNames('w-full', className)}>
      <div className='flex flex-col gap-y-5 overflow-clip items-center'>
        <Skeleton count={1} height={124} width={400} />
        <Skeleton count={1} height={24} width={324} />
      </div>
    </div>
  )
}
