import React, { ComponentPropsWithoutRef, forwardRef } from 'react'
import { cn } from 'utils/cn'

interface ClickableIconProps extends ComponentPropsWithoutRef<'button'> {
  disabled?: boolean
  label: string
  icon: React.ElementType
}

const ClickableIcon = forwardRef<HTMLButtonElement, ClickableIconProps>(
  ({ disabled, icon: Icon, label, className, ...rest }, ref) => {
    return (
      <div className={cn('flex flex-col text-center justify-center', disabled && 'opacity-40')}>
        <button
          ref={ref}
          {...rest}
          disabled={disabled}
          className={cn(
            'mx-auto relative size-[52px] bg-secondary-100 hover:bg-secondary-200 transition-colors rounded-full text-center cursor-pointer disabled:cursor-not-allowed flex items-center justify-center',
            className,
          )}
        >
          <Icon className='size-5' weight='fill' />
        </button>

        {!!label && (
          <p className='text-sm mt-[10px] tracking-wide font-medium !leading-[22px]'>{label}</p>
        )}
      </div>
    )
  },
)

ClickableIcon.displayName = 'ClickableIcon'

export default ClickableIcon
