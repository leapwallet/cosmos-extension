import React from 'react'
import Skeleton from 'react-loading-skeleton'

export default function StakeCardSkeleton() {
  return (
    <div className='flex-1 p-7 gap-y-4 min-w-[344px]'>
      <Skeleton count={1} />
      <Skeleton count={2} />
      <Skeleton count={4} />
    </div>
  )
}
