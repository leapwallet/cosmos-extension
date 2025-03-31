import classNames from 'classnames'
import React from 'react'
import { ComponentPropsWithoutRef, forwardRef } from 'react'

/** The `'type'` prop will be `'button'` if `undefined`. */
export type IconButtonProps = ComponentPropsWithoutRef<'button'> & {
  readonly image: Pick<HTMLImageElement, 'src' | 'alt'>
  readonly isFilled?: boolean
  readonly onClick?: () => void
  readonly 'data-testing-id'?: string
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ type, image, isFilled, onClick, ...rest }, ref) => (
    <div
      className={classNames({
        'h-9 w-9 bg-white-100 dark:bg-gray-900 flex items-center justify-center rounded-full':
          isFilled,
      })}
      onClick={onClick}
      data-testing-id={rest['data-testing-id']}
    >
      <button
        className=' mx-2 cursor-pointer border-none'
        ref={ref}
        type={type ?? 'button'}
        {...rest}
      >
        <img className='invert dark:invert-0' src={image.src} alt={image.alt} />
      </button>
    </div>
  ),
)

IconButton.displayName = 'IconButton'

export default IconButton
