import classNames from 'classnames'
import React from 'react'
import { normalizeImageSrc } from 'utils/normalizeImageSrc'

type CollectionAvatarProps = {
  image?: string
  className?: string
  bgColor?: string
}

export function CollectionAvatar({ image, className, bgColor }: CollectionAvatarProps) {
  return (
    <div
      className={classNames('rounded-full mr-2', className)}
      style={{ backgroundColor: bgColor }}
    >
      {image &&
        (image.includes('mp4') ? (
          <video
            autoPlay
            loop
            playsInline
            muted
            className='rounded-full w-full h-full object-cover object-top'
          >
            <source type='video/mp4' src={normalizeImageSrc(image)} />
            Your browser does not support this video player.
          </video>
        ) : (
          <img
            className={classNames('rounded-full h-full w-full object-cover object-top')}
            src={normalizeImageSrc(image)}
            onError={({ currentTarget }: { currentTarget: HTMLImageElement }) => {
              currentTarget.onerror = null
              currentTarget.style.display = 'none'
            }}
          />
        ))}
    </div>
  )
}
