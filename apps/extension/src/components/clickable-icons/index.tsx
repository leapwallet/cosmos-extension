import { ThemeName, useTheme } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import { Images } from 'images'
import React from 'react'
import { ComponentPropsWithoutRef, forwardRef } from 'react'

interface ClickableIconProps extends ComponentPropsWithoutRef<'button'> {
  darker?: boolean
  disabled?: boolean
  label: string
  icon: React.ReactNode
  iconType?: 'image' | 'icon'
}

const ClickableIcon = forwardRef<HTMLButtonElement, ClickableIconProps>(
  ({ disabled, icon, label, iconType = 'icon', ...rest }, ref) => {
    const { theme } = useTheme()
    const isDark = theme === ThemeName.DARK

    return (
      <div
        className={classNames('flex flex-col text-center justify-center', {
          'opacity-40': disabled,
        })}
      >
        <button
          className={classNames(
            'mx-auto relative h-11 w-11 text-center text-black-100 dark:text-white-100 cursor-pointer',
            {
              '!cursor-not-allowed': disabled,
            },
          )}
          disabled={disabled}
          ref={ref}
          {...rest}
        >
          <Images.Nav.ActionButton
            fill={isDark ? 'white' : 'black'}
            color={isDark ? 'white' : ''}
            className='absolute top-0 pointer-events-none'
          />
          <div className={'flex flex-col justify-center items-center'}>
            {iconType === 'image' && typeof icon === 'string' ? (
              <img src={icon} alt={label} className='invert dark:invert-0 w-4 h-4' />
            ) : (
              icon
            )}
          </div>
        </button>
        {label ? (
          <p className='font-medium text-xs pt-3 tracking-wide text-black-100 dark:text-white-100'>
            {label}
          </p>
        ) : null}
      </div>
    )
  },
)

ClickableIcon.displayName = 'ClickableIcon'

export default ClickableIcon
