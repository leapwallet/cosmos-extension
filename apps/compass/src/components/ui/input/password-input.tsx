import { Eye, EyeSlash } from '@phosphor-icons/react'
import * as React from 'react'

import { buttonRingClass } from '../button'
import { Input, InputProps } from '.'

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  Omit<InputProps, 'trailingElement'>
>(({ type = 'password', ...props }, ref) => {
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false)

  return (
    <Input
      {...props}
      ref={ref}
      type={isPasswordVisible ? 'text' : type}
      trailingElement={
        <button
          type='button'
          onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          className={'shrink-0 rounded-full ' + buttonRingClass}
        >
          {isPasswordVisible ? (
            <Eye weight='fill' className='size-5' />
          ) : (
            <EyeSlash weight='fill' className='size-5' />
          )}
        </button>
      }
    />
  )
})

PasswordInput.displayName = 'PasswordInput'
