import React from 'react'
import Skeleton from 'react-loading-skeleton'

/**
 * Skeleton loader for Alpha page
 */
export default function AlphaSkeleton() {
  return (
    <div className='bg-white-100 dark:bg-gray-950 rounded-xl p-4 mb-4'>
      {/* Header */}
      <div className='flex justify-between items-start mb-3'>
        <div className='flex gap-2 items-center'>
          <Skeleton width={80} height={20} borderRadius={20} />
          <Skeleton width={96} height={20} borderRadius={20} />
        </div>
        <Skeleton width={64} height={16} borderRadius={20} />
      </div>

      {/* Description */}
      <div className='space-y-2 mb-4'>
        <Skeleton width='100%' height={16} />
        <Skeleton width='75%' height={16} />
      </div>

      {/* Footer */}
      <div className='flex justify-between items-center'>
        <div className='flex gap-2 items-center'>
          <Skeleton circle width={16} height={16} />
          <Skeleton width={64} height={16} />
        </div>
        <Skeleton circle width={16} height={16} />
      </div>
    </div>
  )
}

export function AlphaSkeletonList() {
  return (
    <>
      <AlphaSkeleton />
      <AlphaSkeleton />
    </>
  )
}
