import classNames from 'classnames'
import React from 'react'

export default function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={classNames('w-full', className)}>
      <div className='flex flex-col gap-y-5 overflow-clip items-center'>
        <div className='h-[128px] w-[400px]' />
        <div className='h-[28px] w-[324px]' />
      </div>
    </div>
  )
}
