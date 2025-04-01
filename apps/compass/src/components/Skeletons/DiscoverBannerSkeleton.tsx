import { ThemeName, useTheme } from '@leapwallet/leap-ui'
import React from 'react'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'

export function DiscoverBannerLoading() {
  const { theme } = useTheme()
  const isDark = theme === ThemeName.DARK
  const baseColor1 = isDark ? '#393939' : '#D6D6D6'
  const highlightColor1 = isDark ? '#2C2C2C' : '#E8E8E8'

  return (
    <SkeletonTheme duration={2} baseColor={baseColor1} highlightColor={highlightColor1}>
      <div className='rounded-xl bg-secondary w-full h-[106px] p-[26px] mx-4'>
        <div className='flex gap-2 items-center'>
          <Skeleton width={50} height={50} circle={true} />
          <div className='flex flex-col gap-0.5'>
            <Skeleton width={150} height={14} borderRadius={8} />
            <Skeleton width={100} height={14} borderRadius={8} />
          </div>
        </div>
      </div>
    </SkeletonTheme>
  )
}
