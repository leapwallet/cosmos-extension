import React, { ComponentPropsWithoutRef, forwardRef } from 'react'
import { cn } from 'utils/cn'

interface ClickableIconProps extends ComponentPropsWithoutRef<'button'> {
  darker?: boolean
  disabled?: boolean
  label: string
  icon: React.ElementType
}

const ClickableIcon = forwardRef<HTMLButtonElement, ClickableIconProps>(
  ({ disabled, icon: Icon, label, ...rest }, ref) => {
    return (
      <div className={cn('flex flex-col text-center justify-center', disabled && 'opacity-40')}>
        <button
          className={
            'mx-auto relative size-[3.75rem] bg-secondary-100 hover:bg-secondary-200 transition-colors rounded-full text-center cursor-pointer disabled:cursor-not-allowed flex items-center justify-center'
          }
          disabled={disabled}
          ref={ref}
          title={label}
          {...rest}
        >
          <Icon className='size-6' />
        </button>

        {!!label && <p className='text-sm mt-2 tracking-wide font-bold'>{label}</p>}
      </div>
    )
  },
)

ClickableIcon.displayName = 'ClickableIcon'

export default ClickableIcon
