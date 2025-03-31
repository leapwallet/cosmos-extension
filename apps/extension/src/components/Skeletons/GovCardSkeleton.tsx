import { CardDivider } from '@leapwallet/leap-ui'
import { Images } from 'images'
import React from 'react'
import Skeleton from 'react-loading-skeleton'

export default function GovCardSkeleton({
  isLast,
  aggregatedView,
}: {
  isLast: boolean
  aggregatedView?: boolean
}) {
  if (aggregatedView) {
    return (
      <div className='w-full p-3 min-w-[344px] flex flex-col items-start rounded-xl justify-start gap-1 bg-white-100 dark:bg-gray-950 !h-[112px]'>
        <Skeleton
          count={1}
          height={12}
          width={70}
          containerClassName='!block !leading-none h-[14px]'
        />
        <Skeleton count={1} height={20} containerClassName='!block !leading-none w-full' />
        <Skeleton count={1} height={20} containerClassName='!block !leading-none w-full' />
        <Skeleton
          count={1}
          height={14}
          width={100}
          containerClassName='!block !leading-none h-[16px]'
        />
      </div>
    )
  }

  return (
    <>
      <div className='flex-1 p-4 min-w-[344px] flex flex-row items-center justify-between'>
        <div className='flex flex-col items-start justify-center gap-[4px]'>
          <Skeleton count={1} height={18} width={270} containerClassName='!block !leading-none' />
          <Skeleton count={1} height={18} width={270} containerClassName='!block !leading-none' />
          <Skeleton
            count={1}
            height={14}
            width={100}
            containerClassName='!block !leading-none h-[16px] mt-[4px]'
          />
        </div>
        <img className='ml-5' src={Images.Misc.RightArrow} />
      </div>
      {!isLast ? <CardDivider /> : null}
    </>
  )
}
