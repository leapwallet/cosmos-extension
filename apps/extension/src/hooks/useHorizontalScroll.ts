import { useCallback, useRef, useState } from 'react'

type scrollBehavior = 'natural' | 'reverse'

const useHorizontalScroll = <T extends HTMLElement>(behavior: scrollBehavior = 'natural') => {
  const scrollRef = useRef<T>(null)
  const [clickStartX, setClickStartX] = useState<number | null>(null)
  const [scrollStartX, setScrollStartX] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = useCallback((e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if (scrollRef.current) {
      setClickStartX(e.screenX)
      setScrollStartX(scrollRef.current.scrollLeft)
      setIsDragging(true)
    }
  }, [])

  const handleDragMove = useCallback(
    (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
      if (scrollRef && scrollRef.current) {
        e.preventDefault()
        e.stopPropagation()

        if (clickStartX !== null && scrollStartX !== null && isDragging) {
          const touchDelta = clickStartX - e.screenX
          scrollRef.current.scrollLeft =
            behavior === 'natural' ? scrollStartX - touchDelta : scrollStartX + touchDelta
        }
      }
    },
    [clickStartX, isDragging, scrollStartX, behavior],
  )

  const handleDragEnd = useCallback(() => {
    if (isDragging) {
      setClickStartX(null)
      setScrollStartX(null)
      setIsDragging(false)
    }
  }, [isDragging])

  const props = {
    onMouseDown: handleDragStart,
    onMouseMove: handleDragMove,
    onMouseUp: handleDragEnd,
    onMouseLeave: handleDragEnd,
  }

  return { props, scrollRef, clickStartX, scrollStartX, isDragging }
}

export default useHorizontalScroll
