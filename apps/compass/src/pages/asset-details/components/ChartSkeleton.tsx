import classNames from 'classnames'
import React from 'react'
import Skeleton from 'react-loading-skeleton'

export default function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={classNames('w-full', className)}>
      <div className='flex flex-col overflow-clip items-center gap-2'>
        <Skeleton count={1} height={180} width={400} />
        <Skeleton count={1} height={28} width={324} />
      </div>
    </div>
  )
}
