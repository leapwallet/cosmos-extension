import { Skeleton } from 'components/ui/skeleton'
import React from 'react'
import { cn } from 'utils/cn'

import { BannerControls } from './controls'
import { useCarousel } from './use-carousel'

const BANNER_LOADING_COUNT = 4
const loadingBanners = new Array(BANNER_LOADING_COUNT).fill(null)

export const BannersLoading = () => {
  const {
    activeBannerIndex,
    handleContainerScroll,
    handleScroll,
    handleMouseEnter,
    handleMouseLeave,
    scrollableContainerRef,
  } = useCarousel(BANNER_LOADING_COUNT)

  return (
    <>
      <div
        className='flex items-center overflow-hidden px-4 snap-x snap-mandatory gap-2 w-full '
        ref={scrollableContainerRef}
        onScroll={handleScroll}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {loadingBanners.map((_, index) => (
          <div
            key={index}
            className={
              'relative shrink-0 inline-block overflow-hidden w-full snap-center h-16 aspect-[11/2]'
            }
          >
            <div
              className={cn(
                'overflow-hidden w-full h-full rounded-lg items-center flex bg-secondary transform transition-transform ease-out duration-300',
                activeBannerIndex === index ? 'scale-100' : 'scale-[87.5%]',
                activeBannerIndex < index ? 'origin-left' : 'origin-right',
              )}
            >
              <Skeleton className='w-full h-full bg-secondary-200' />
            </div>
          </div>
        ))}
      </div>

      <BannerControls
        activeBannerIndex={activeBannerIndex}
        activeBannerId={''}
        totalItems={BANNER_LOADING_COUNT}
        handleContainerScroll={handleContainerScroll}
        handleMouseEnter={handleMouseEnter}
        handleMouseLeave={handleMouseLeave}
      />
    </>
  )
}
