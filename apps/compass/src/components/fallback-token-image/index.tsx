import { sliceWord } from '@leapwallet/cosmos-wallet-hooks'
import classNames from 'classnames'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

export function FallbackTokenImage({
  containerClassName = '',
  textClassName = '',
  text,
}: {
  containerClassName?: string
  textClassName?: string
  text: string
}) {
  const [textWidth, setTextWidth] = useState<{ clientWidth: number; scrollWidth: number } | null>(
    null,
  )
  const [containerWidth, setContainerWidth] = useState<{
    clientWidth: number
    scrollWidth: number
  } | null>(null)

  const [slicePrefixLength, setSlicePrefixLength] = useState<number>(5)

  const isOverflowing = useMemo(() => {
    return (
      textWidth &&
      containerWidth &&
      (textWidth?.clientWidth > containerWidth?.clientWidth ||
        textWidth?.scrollWidth > textWidth?.clientWidth ||
        containerWidth?.scrollWidth > containerWidth?.clientWidth)
    )
  }, [textWidth, containerWidth])

  useEffect(() => {
    if (isOverflowing) {
      setSlicePrefixLength((prevSlicePrefixLength) => prevSlicePrefixLength - 1)
    }
  }, [isOverflowing])

  const handleTextRef = useCallback((el: HTMLSpanElement) => {
    if (el) {
      setTextWidth({ clientWidth: el.clientWidth, scrollWidth: el.scrollWidth })
    }
  }, [])

  const handleContainerRef = useCallback((el: HTMLDivElement) => {
    if (el) {
      setContainerWidth({ clientWidth: el.clientWidth, scrollWidth: el.scrollWidth })
    }
  }, [])

  return (
    <div
      className={classNames(
        'rounded-full bg-gray-100 dark:bg-gray-850 shrink-0 flex items-center justify-center',
        containerClassName,
      )}
      ref={handleContainerRef}
      key={text}
    >
      <span
        className={classNames(
          'text-black-100 dark:text-white-100 font-semibold px-[2px] overflow-hidden',
          textClassName,
        )}
        ref={handleTextRef}
        key={text}
      >
        {sliceWord(text, slicePrefixLength, 0, '..')}
      </span>
    </div>
  )
}
