import React from 'react'
import Skeleton from 'react-loading-skeleton'

export function WalletInfoCardSkeleton() {
  return (
    <div className='flex flex-col items-center bg-white-100 dark:bg-gray-900 w-[360px] rounded-xl my-2'>
      <div className='flex px-6 py-3 w-full'>
        <Skeleton circle={true} width={40} height={40} className='z-0' />

        <div className='flex flex-col'>
          <div className='w-[120px] ml-2'>
            <Skeleton count={1} className='z-0' />
          </div>

          <div className='w-[80px] ml-2'>
            <Skeleton count={1} className='z-0' />
          </div>
        </div>
      </div>

      <div className='h-[1px] bg-gray-100 dark:bg-gray-600 w-full' />

      <div className='w-[360px] px-6 py-2 rounded-b-lg'>
        <Skeleton className='light:bg-gray-200 bg-gray-800 z-0' />
      </div>
    </div>
  )
}

export function WalletInfoCardSkeletons() {
  return (
    <div className='flex flex-col space-y-3'>
      <WalletInfoCardSkeleton />
      <WalletInfoCardSkeleton />
    </div>
  )
}
