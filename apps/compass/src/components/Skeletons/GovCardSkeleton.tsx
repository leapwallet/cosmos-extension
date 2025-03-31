import { CardDivider } from '@leapwallet/leap-ui'
import { Images } from 'images'
import React from 'react'
import Skeleton from 'react-loading-skeleton'

export default function GovCardSkeleton({ isLast }: { isLast?: boolean }) {
  return (
    <>
      <div className='flex-1 p-4 min-w-[344px] flex flex-row items-center justify-between'>
        <div className='flex flex-col items-start justify-center gap-[2px]'>
          <Skeleton count={1} height={18} width={200} containerClassName='!block !leading-none' />
          <Skeleton
            count={1}
            height={14}
            width={75}
            containerClassName='!block !leading-none h-[16px] mt-[4px]'
          />
        </div>
        <img className='ml-5' src={Images.Misc.RightArrow} />
      </div>
      {!isLast ? <CardDivider /> : null}
    </>
  )
}
