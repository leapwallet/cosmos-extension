import classNames from 'classnames'
import { Images } from 'images'
import React from 'react'
import { imgOnError } from 'utils/imgOnError'

import { normalizeImageSrc } from '../generalized/util'

type NFTAvatarProps = {
  image?: string
}

export function NFTAvatar({ image }: NFTAvatarProps) {
  return (
    <div className='w-10 h-10 rounded-lg bg-gray-50 dark:bg-black-100 flex'>
      {image && image.includes('mp4') ? (
        <video autoPlay loop playsInline muted className='rounded-lg w-full h-full'>
          <source type='video/mp4' src={normalizeImageSrc(image)} />
          Your browser does not support this video player.
        </video>
      ) : (
        <img
          className={classNames('rounded-lg m-auto', {
            'h-full w-full': image,
          })}
          src={image ? normalizeImageSrc(image) ?? Images.Misc.Sell : Images.Misc.Sell}
          onError={imgOnError(Images.Misc.Sell)}
        />
      )}
    </div>
  )
}
