import classNames from 'classnames'
import React, { useState } from 'react'

import { NftCard, NftCardProps } from './index'

type NftCardCarouselProps = NftCardProps & {
  images: string[]
}

export function NftCardCarousel({ images, ...nftCardProps }: NftCardCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  const handleArrowClick = (direction: 'left' | 'right') => {
    switch (direction) {
      case 'left':
        setActiveIndex((prevIndex) => {
          if (prevIndex === 0) {
            return images.length - 1
          }

          return prevIndex - 1
        })
        break

      case 'right':
        setActiveIndex((prevIndex) => {
          if (prevIndex === images.length - 1) {
            return 0
          }

          return prevIndex + 1
        })
        break
    }
  }

  return (
    <div className={classNames('relative overflow-hidden', nftCardProps.imgClassName)}>
      <div className='w-full'>
        {images.map((image, index) => (
          <div
            key={`${image}-${index}`}
            className='absolute w-full'
            style={{
              transform: `translateX(${(index - activeIndex) * 100}%)`,
              transition: 'transform 0.5s ease-in-out',
            }}
          >
            <NftCard {...nftCardProps} imgSrc={image} />
          </div>
        ))}
      </div>

      {images.length > 1 ? (
        <>
          <button
            className='rounded-full w-[25px] h-[25px] absolute top-1/2 -translate-y-1/2 left-2 bg-gray-200 dark:bg-gray-900 flex items-center justify-center'
            onClick={() => handleArrowClick('left')}
          >
            <span className='material-icons-round dark:text-gray-300 text-gray-800'>
              navigate_before
            </span>
          </button>

          <button
            className='rounded-full w-[25px] h-[25px] absolute top-1/2 -translate-y-1/2 right-2 bg-gray-200 dark:bg-gray-900 flex items-center justify-center'
            onClick={() => handleArrowClick('right')}
          >
            <span className='material-icons-round dark:text-gray-300 text-gray-800'>
              navigate_next
            </span>
          </button>
        </>
      ) : null}
    </div>
  )
}
