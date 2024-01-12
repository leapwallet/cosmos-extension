import classNames from 'classnames'
import React from 'react'
import { ComponentPropsWithoutRef, forwardRef } from 'react'

/** The `'type'` prop will be `'button'` if `undefined`. */
export type ClickableIconProps = ComponentPropsWithoutRef<'button'> & {
  readonly image: Pick<HTMLImageElement, 'src' | 'alt'>
  readonly darker?: boolean
  readonly disabled?: boolean
}

const ClickableIcon = forwardRef<HTMLButtonElement, ClickableIconProps>(
  ({ type, image, darker, disabled, ...rest }, ref) => (
    <div className='flex flex-col text-center justify-center'>
      <button
        className={classNames('mx-auto h-12 w-12 rounded-full border-none text-center', {
          'bg-gray-400 dark:bg-[#14100f] text-[#6c6867] cursor-not-allowed': disabled,
          'bg-white-100 dark:bg-gray-900 text-gray-900 dark:text-white-100 cursor-pointer':
            (darker !== undefined || !darker) && !disabled,
          'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white-100 cursor-pointer':
            darker && !disabled,
        })}
        disabled={disabled}
        ref={ref}
        type={type ?? 'button'}
        {...rest}
      >
        <div className={'flex flex-col justify-center items-center'}>
          {image.alt === 'IBC' ? (
            <img
              src={image.src}
              alt=''
              className={classNames('invert dark:invert-0', {
                'opacity-30': disabled,
              })}
            />
          ) : (
            <span className='material-icons-round'>{image.src}</span>
          )}
        </div>
      </button>
      {image.alt !== '' ? (
        <p
          className={classNames('font-bold text-sm pt-[4px]', {
            'text-[#6c6867]': disabled,
            'text-gray-900 dark:text-white-100': !disabled,
          })}
        >
          {image.alt}
        </p>
      ) : (
        <></>
      )}
    </div>
  ),
)

ClickableIcon.displayName = 'ClickableIcon'

export default ClickableIcon
