import React from 'react'
import Skeleton from 'react-loading-skeleton'

export default function TokenCardSkeleton() {
  return (
    <div className='flex px-4 py-2 min-w-[344px] z-0'>
      <div className='w-10 '>
        <Skeleton
          circle
          className='w-10 h-10'
          style={{
            zIndex: 0,
          }}
        />
      </div>
      <div className='w-[120px] z-0 ml-2'>
        <Skeleton count={1} className='z-0' />
        <Skeleton count={1} className='z-0' />
      </div>
      <div className='w-[60px] ml-auto z-0'>
        <Skeleton count={1} className='z-0' />
        <Skeleton count={1} className='z-0' />
      </div>
    </div>
  )
}
