import classNames from 'classnames'
import { useDefaultTokenLogo } from 'hooks/utility/useDefaultTokenLogo'
import React from 'react'
import { imgOnError } from 'utils/imgOnError'

export type BadgeProps = {
  image: string
  text: string
  isImgRounded?: boolean
}

export default function Badge({ image, text, isImgRounded }: BadgeProps) {
  const defaultTokenLogo = useDefaultTokenLogo()

  return (
    <div className='flex items-center dark:bg-gray-800 bg-gray-100 hover:overflow-visible  rounded-l-xl h-4 rounded-r py-0.5 px-1'>
      <img
        src={image ?? defaultTokenLogo}
        className={classNames('h-[14px] w-[14px] mr-0.5', {
          'rounded-full': isImgRounded,
        })}
        onError={imgOnError(defaultTokenLogo)}
      />
      <div className='text-[10px] dark:text-gray-200 text-gray-800 font-medium text-ellipsis overflow-hidden whitespace-nowrap'>
        {text}
      </div>
    </div>
  )
}
