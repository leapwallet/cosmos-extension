import { useCompassDiscoverBanners } from '@leapwallet/cosmos-wallet-hooks'
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react'
import { DiscoverBannerLoading } from 'components/Skeletons'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cn } from 'utils/cn'

import BannerAdCard from './BannerAdCard'

const AUTO_SWITCH_LEFT = 368

export type BannerAD = {
  id: string
  title: string
  icon?: string
  subtitle: string
  category: string
  url: string
}

const DiscoverBannerAD = React.memo(() => {
  const scrollableContainerRef = useRef<HTMLDivElement>(null)
  const [autoSwitchBanner, setAutoSwitchBanner] = useState(true)
  const timerCountRef = useRef(0)
  const [timeCounter, setTimeCounter] = useState(0)
  const { isLoading: showBannersLoading, data: banners = [] } = useCompassDiscoverBanners()

  const autoScrollDuration = 30

  const { activeBannerId, activeBannerIndex } = useMemo(() => {
    const activeBannerIndex = timeCounter % banners.length
    const activeBannerData: BannerAD | undefined = banners?.[activeBannerIndex]
    const activeBannerId: string | undefined = activeBannerData?.id

    return {
      activeBannerId,
      activeBannerIndex,
    }
  }, [banners, timeCounter])

  const handleScroll: React.UIEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      // if event is user generated, then update the active banner index
      // for this we check the isTrusted property of the event
      if (e.isTrusted && !autoSwitchBanner) {
        const scrollLeft = e.currentTarget.scrollLeft
        const bannerIndex = Math.round(scrollLeft / AUTO_SWITCH_LEFT)
        timerCountRef.current = bannerIndex
        setTimeCounter(bannerIndex)
      }
    },
    [autoSwitchBanner],
  )

  const handleMouseEnter = useCallback(() => {
    setAutoSwitchBanner(false)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setAutoSwitchBanner(true)
  }, [])

  const handleContainerScroll = useCallback(
    (newIndex?: number) => {
      // new index will be from 0 - displayADs.length
      if (newIndex !== undefined) {
        timerCountRef.current = Math.floor(timerCountRef.current / banners.length) + newIndex
      } else {
        timerCountRef.current += 1
      }

      scrollableContainerRef.current?.scrollTo({
        top: 0,
        left: AUTO_SWITCH_LEFT * (timerCountRef.current % banners.length),
        behavior: 'smooth',
      })

      setTimeCounter(timerCountRef.current)
    },
    [banners.length],
  )

  const handleLeftArrowClick = useCallback(() => {
    handleContainerScroll(activeBannerIndex - 1)
  }, [activeBannerIndex, handleContainerScroll])

  const handleRightArrowClick = useCallback(() => {
    handleContainerScroll(activeBannerIndex + 1)
  }, [activeBannerIndex, handleContainerScroll])

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let intervalId: any
    if (scrollableContainerRef.current && banners.length > 1 && autoSwitchBanner) {
      intervalId = setInterval(handleContainerScroll, autoScrollDuration * 1000)
    }

    return () => clearInterval(intervalId)
  }, [handleContainerScroll, autoSwitchBanner, autoScrollDuration, banners.length])

  useEffect(() => {
    // stop auto-switching when the banner is not visible to the user
    if (!scrollableContainerRef.current) {
      return
    }

    const intersectionCallback = (entries: IntersectionObserverEntry[]) => {
      const isIntersecting = entries[0].isIntersecting
      // isIntersecting - meaning the banner is visible to the user (in the popup-layout area)
      setAutoSwitchBanner(isIntersecting)
    }

    const observer = new IntersectionObserver(intersectionCallback, {
      root: document.querySelector('#popup-layout'),
      rootMargin: '0px',
      threshold: 1.0,
    })

    observer.observe(scrollableContainerRef.current)

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    // stop auto-switching when the user is not on the tab, or has minimised the window or using another app

    const handleVisibilityChanges = () => {
      if (document.visibilityState === 'visible') {
        setAutoSwitchBanner(true)
      } else {
        setAutoSwitchBanner(false)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChanges)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChanges)
    }
  }, [])

  if (!showBannersLoading && (!banners || banners.length === 0)) return null

  return (
    <div className='flex flex-col items-center justify-center gap-1 w-full mb-4'>
      {showBannersLoading ? <DiscoverBannerLoading /> : null}
      <div
        ref={scrollableContainerRef}
        className='h-[106px] hide-scrollbar w-[400px] whitespace-nowrap overflow-x-auto overflow-y-hidden hide-scrollbar snap-x snap-mandatory'
        onScroll={handleScroll}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {banners.map((bannerData, index) => {
          return (
            <BannerAdCard
              key={bannerData.id}
              bannerData={bannerData}
              index={index}
              isActive={activeBannerIndex === index}
            />
          )
        })}
      </div>

      {banners.length > 1 ? (
        <div className='flex w-full items-center justify-between'>
          <ArrowLeft
            size={17}
            onClick={handleLeftArrowClick}
            className={`text-secondary-600 hover:text-secondary-800 cursor-pointer ${
              activeBannerIndex === 0 ? 'invisible' : ''
            }`}
          />

          <div
            className='flex gap-1'
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {banners.map((ad, i) => {
              const isActive = activeBannerId === ad.id

              return (
                <span
                  role='button'
                  key={ad.id}
                  className={cn('h-[5px] rounded-full transition-all cursor-pointer', {
                    'w-[20px] bg-accent-blue-200': isActive,
                    'w-[5px] bg-secondary-600': !isActive,
                  })}
                  onClick={() => handleContainerScroll(i)}
                />
              )
            })}
          </div>
          <ArrowRight
            size={17}
            onClick={handleRightArrowClick}
            className={`text-secondary-600 hover:text-secondary-800 cursor-pointer ${
              activeBannerIndex === banners.length - 1 ? 'invisible' : ''
            }`}
          />
        </div>
      ) : null}
    </div>
  )
})

DiscoverBannerAD.displayName = 'DiscoverBannerAD'
export { DiscoverBannerAD }
