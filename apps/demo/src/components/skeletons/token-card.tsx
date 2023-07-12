import React from 'react'
import Skeleton from 'react-loading-skeleton'

export default function TokenCardSkeleton() {
  return (
    <div className='flex p-4 min-w-[344px] z-0'>
      <div className='z-0'>
        <Skeleton circle className='min-w-[28px] max-w-[28px] h-[28px] mr-2 z-0' />
      </div>

      <div className='flex-1 max-w-[120px] z-0'>
        <Skeleton count={1} className='z-0' />
        <Skeleton count={1} className='z-0' />
      </div>
      <div className='flex-1 max-w-[60px] ml-auto z-0'>
        <Skeleton count={1} className='z-0' />
        <Skeleton count={1} className='z-0' />
      </div>
    </div>
  )
}
