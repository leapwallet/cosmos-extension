import React from 'react'
import Skeleton from 'react-loading-skeleton'

export default function NFTGallerySkeleton() {
  return (
    <>
      <div className='flex items-center py-2 px-4 mb-4 min-w-[344px] bg-gray-900 rounded-2xl'>
        <Skeleton count={1} className='min-w-[40px] max-w-[40px] h-[40px] mr-2' />
        <Skeleton count={1} className='min-w-[240px] max-w-[240px] h-[12px]' />
      </div>
      <div className='flex items-center py-2 px-4 mb-4 min-w-[344px] bg-gray-900 rounded-2xl'>
        <Skeleton count={1} className='min-w-[40px] max-w-[40px] h-[40px] mr-2' />
        <Skeleton count={1} className='min-w-[240px] max-w-[240px] h-[12px]' />
      </div>
      <div className='flex items-center py-2 px-4 mb-4 min-w-[344px] bg-gray-900 rounded-2xl'>
        <Skeleton count={1} className='min-w-[40px] max-w-[40px] h-[40px] mr-2' />
        <Skeleton count={1} className='min-w-[240px] max-w-[240px] h-[12px]' />
      </div>
      <div className='flex items-center py-2 px-4 mb-4 min-w-[344px] bg-gray-900 rounded-2xl'>
        <Skeleton count={1} className='min-w-[40px] max-w-[40px] h-[40px] mr-2' />
        <Skeleton count={1} className='min-w-[240px] max-w-[240px] h-[12px]' />
      </div>
    </>
  )
}
