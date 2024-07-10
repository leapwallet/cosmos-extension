import { ThemeName, useTheme } from '@leapwallet/leap-ui'
import React from 'react'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'

export function GlobalBannersLoading() {
  const { theme } = useTheme()
  const isDark = theme === ThemeName.DARK
  const baseColor1 = isDark ? '#393939' : '#D6D6D6'
  const highlightColor1 = isDark ? '#2C2C2C' : '#E8E8E8'

  return (
    <div className='rounded-xl dark:bg-gray-950 bg-white-100 w-[352px] h-[64px]'>
      <div className='flex items-center justify-between px-[12px] py-[12px] pb-[10px] w-full h-full'>
        <div className='flex items-start justify-center gap-2'>
          <SkeletonTheme duration={2} baseColor={baseColor1} highlightColor={highlightColor1}>
            <Skeleton
              count={1}
              className='!w-[40px] !h-[40px] !rounded-xl !inline-block !mt-[4px] !z-0 !bg-gray-200 dark:!bg-[#393939]'
            />
          </SkeletonTheme>

          <div className='flex flex-col pt-[4px]'>
            <SkeletonTheme duration={2} baseColor={baseColor1} highlightColor={highlightColor1}>
              <Skeleton
                count={1}
                className='!w-[56px] !h-[14px] !rounded-3xl !z-0 !bg-gray-200 dark:!bg-[#393939]'
              />
            </SkeletonTheme>
          </div>
        </div>
      </div>
    </div>
  )
}
