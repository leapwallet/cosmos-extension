import { useCallback, useEffect, useRef, useState } from 'react'

const AUTO_SWITCH_LEFT = 352
const DEFAULT_AUTO_SCROLL_DURATION = 30

export const useCarousel = (
  totalItems: number,
  autoScrollDuration = DEFAULT_AUTO_SCROLL_DURATION,
) => {
  const scrollableContainerRef = useRef<HTMLDivElement>(null)
  const [timeCounter, setTimeCounter] = useState(0)
  const [autoSwitchBanner, setAutoSwitchBanner] = useState(true)
  const timerCountRef = useRef(0)

  const activeBannerIndex = timeCounter % totalItems

  const handleContainerScroll = useCallback(
    (newIndex?: number) => {
      if (newIndex !== undefined) {
        timerCountRef.current = Math.floor(timerCountRef.current / totalItems) + newIndex
      } else {
        timerCountRef.current += 1
      }

      scrollableContainerRef.current?.scrollTo({
        top: 0,
        left: AUTO_SWITCH_LEFT * (timerCountRef.current % totalItems),
        behavior: 'smooth',
      })

      setTimeCounter(timerCountRef.current)
    },
    [totalItems],
  )

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null
    if (scrollableContainerRef.current && totalItems > 1 && autoSwitchBanner) {
      intervalId = setInterval(handleContainerScroll, autoScrollDuration * 1000)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [totalItems, handleContainerScroll, autoSwitchBanner, autoScrollDuration])

  useEffect(() => {
    if (!scrollableContainerRef.current) {
      return
    }

    const intersectionCallback = (entries: IntersectionObserverEntry[]) => {
      const isIntersecting = entries[0].isIntersecting
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

  const handleScroll: React.UIEventHandler<HTMLDivElement> = useCallback(
    (e) => {
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

  return {
    scrollableContainerRef,
    activeBannerIndex,
    handleContainerScroll,
    handleScroll,
    handleMouseEnter,
    handleMouseLeave,
  }
}
