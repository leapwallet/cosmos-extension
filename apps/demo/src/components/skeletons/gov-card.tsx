import React from 'react'
import Skeleton from 'react-loading-skeleton'

export default function GovCardSkeleton() {
  return (
    <div className='flex-1 p-4 min-w-[344px]'>
      <Skeleton count={3} />
    </div>
  )
}
