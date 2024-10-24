import { ThemeName, useTheme } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import { Images } from 'images'
import React from 'react'

type CustomCardDividerProps = {
  className?: string
}

export function CustomCardDivider({ className }: CustomCardDividerProps) {
  const src =
    useTheme().theme === ThemeName.DARK
      ? Images.Misc.CardDividerDarkMode
      : Images.Misc.CardDividerLightMode

  return (
    <div
      className={classNames(
        'flex w-[344px] justify-center items-center bg-white-100 dark:bg-gray-950 px-4',
        className,
      )}
    >
      <img src={src} alt='CardDivider' className='block w-full' />
    </div>
  )
}
