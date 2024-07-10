import { ThemeName, useTheme } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import { AGGREGATED_CHAIN_KEY } from 'config/constants'
import { useActiveChain } from 'hooks/settings/useActiveChain'
import React from 'react'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import { AggregatedSupportedChain } from 'types/utility'

type AggregatedLoadingProps = {
  className?: string
}

export function AggregatedLoading({ className }: AggregatedLoadingProps) {
  const { theme } = useTheme()
  const activeChain = useActiveChain() as AggregatedSupportedChain

  const isDark = theme === ThemeName.DARK
  const baseColor1 = isDark ? '#393939' : '#D6D6D6'
  const highlightColor1 = isDark ? '#2C2C2C' : '#E8E8E8'
  const baseColor2 = isDark ? '#222222' : '#E8E8E8'
  const highlightColor2 = isDark ? '#1f1e1e' : '#F4F4F4'

  return (
    <div className={classNames('rounded-xl dark:bg-gray-950 bg-white-100', className)}>
      <div className='flex items-center justify-between px-[12px] py-[12px] pb-[10px] w-full'>
        <div className='flex items-center justify-center gap-2'>
          <SkeletonTheme duration={2} baseColor={baseColor1} highlightColor={highlightColor1}>
            <Skeleton
              circle
              className='!w-[36px] !h-[36px] !rounded-full !inline-block !mt-[4px] !z-0 !bg-gray-200 dark:!bg-[#393939]'
            />
          </SkeletonTheme>

          <div className='flex flex-col'>
            <SkeletonTheme duration={2} baseColor={baseColor1} highlightColor={highlightColor1}>
              <Skeleton
                count={1}
                className='!w-[76px] !h-[16px] !rounded-3xl !z-0 !bg-gray-200 dark:!bg-[#393939]'
              />
            </SkeletonTheme>

            {activeChain === AGGREGATED_CHAIN_KEY && (
              <SkeletonTheme duration={2} baseColor={baseColor2} highlightColor={highlightColor2}>
                <Skeleton
                  count={1}
                  className='!w-[56px] !h-[12px] !rounded-3xl !z-0 !bg-gray-100 dark:!bg-[#222222]'
                />
              </SkeletonTheme>
            )}
          </div>
        </div>

        <div className='flex flex-col items-end'>
          <SkeletonTheme duration={2} baseColor={baseColor1} highlightColor={highlightColor1}>
            <Skeleton
              count={1}
              className='!w-[76px] !h-[16px] !rounded-3xl !z-0 !bg-gray-200 dark:!bg-[#393939]'
            />
          </SkeletonTheme>

          <SkeletonTheme duration={2} baseColor={baseColor2} highlightColor={highlightColor2}>
            <Skeleton
              count={1}
              className='!w-[102px] !h-[12px] !rounded-3xl !z-0 !bg-gray-100 dark:!bg-[#222222]'
            />
          </SkeletonTheme>
        </div>
      </div>{' '}
    </div>
  )
}

export function AggregatedBalanceLoading() {
  const { theme } = useTheme()
  const isDark = theme === ThemeName.DARK
  const baseColor1 = isDark ? '#393939' : '#D6D6D6'
  const highlightColor1 = isDark ? '#2C2C2C' : '#E8E8E8'

  return (
    <div className='flex'>
      {[0, 1, 2, 3].map((_, index) => (
        <SkeletonTheme
          key={index}
          duration={2}
          baseColor={baseColor1}
          highlightColor={highlightColor1}
        >
          <Skeleton
            circle
            className='!w-[32px] !h-[48px] !rounded-md !mx-1 !z-0 !bg-gray-200 dark:!bg-[#393939]'
          />
        </SkeletonTheme>
      ))}
    </div>
  )
}
