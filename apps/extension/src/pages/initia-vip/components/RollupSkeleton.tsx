import React from 'react'
import Skeleton from 'react-loading-skeleton'

export const RollupSkeleton = () => {
  return (
    <div className='flex flex-col p-5 gap-5 w-full h-[136px] rounded-xl bg-gray-50 dark:bg-gray-900'>
      <div className='flex gap-3 items-center'>
        <Skeleton className='rounded-full' width={40} height={40} />
        <Skeleton width={200} height={20} />
      </div>
      <div className='flex gap-3 w-full justify-between'>
        <Skeleton width={150} height={12} />
        <Skeleton width={150} height={12} />
      </div>
    </div>
  )
}
