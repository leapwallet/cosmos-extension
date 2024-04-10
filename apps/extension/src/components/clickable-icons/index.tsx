import { ThemeName, useTheme } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import { Images } from 'images'
import React from 'react'
import { ComponentPropsWithoutRef, forwardRef } from 'react'

/** The `'type'` prop will be `'button'` if `undefined`. */
export type ClickableIconProps = ComponentPropsWithoutRef<'button'> & {
  readonly image: { src: string; alt: string; type?: string }
  readonly darker?: boolean
  readonly disabled?: boolean
}

const ClickableIcon = forwardRef<HTMLButtonElement, ClickableIconProps>(
  ({ type, image, disabled, ...rest }, ref) => {
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
          type={type ?? 'button'}
          {...rest}
        >
          <Images.Nav.ActionButton
            fill={isDark ? 'white' : 'black'}
            color={isDark ? 'white' : ''}
            className='absolute top-0'
          />
          <div className={'flex flex-col justify-center items-center'}>
            {image.type === 'url' ? (
              <img src={image.src} alt={image.alt} className='invert dark:invert-0 w-4 h-4' />
            ) : (
              <span className='material-icons-round' style={{ fontSize: 20 }}>
                {image.src}
              </span>
            )}
          </div>
        </button>
        {image.alt !== '' ? (
          <p className='font-medium text-xs pt-3 tracking-wide text-black-100 dark:text-white-100'>
            {image.alt}
          </p>
        ) : (
          <></>
        )}
      </div>
    )
  },
)

ClickableIcon.displayName = 'ClickableIcon'

export default ClickableIcon
