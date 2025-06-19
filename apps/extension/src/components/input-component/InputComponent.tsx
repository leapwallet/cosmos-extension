import classNames from 'classnames'
import { Input } from 'components/ui/input'
import React, { ChangeEvent, forwardRef } from 'react'

type InputProps = {
  placeholder: string
  value: string
  // eslint-disable-next-line no-unused-vars
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  name: string
  warning?: string
  error?: string
  // eslint-disable-next-line no-unused-vars
  onBlur?: (event: ChangeEvent<HTMLInputElement>) => void
  className?: string
}

const InputComponent = forwardRef<HTMLInputElement, InputProps>(
  ({ placeholder, value, onChange, name, error, warning, onBlur }, ref) => {
    return (
      <>
        <Input
          className={classNames({
            '!border-red-300': error,
            '!border-yellow-600': warning,
            'w-full border border-secondary-200 rounded-xl flex h-12 bg-transparent py-2 pl-5 pr-[10px] mb-4 focus-within:border-foreground focus-within:hover:border-foreground focus-within:ring-0 hover:ring-0 focus-within:bg-secondary-100':
              true,
            'bg-secondary-100': value !== '',
          })}
          key={`${name}-input`}
          placeholder={placeholder}
          value={value}
          name={name}
          onChange={onChange}
          autoComplete='off'
          onBlur={onBlur}
          ref={ref}
        />

        {error && (
          <div className='text-red-300 mb-4' key={`${name}-error`}>
            {error}
          </div>
        )}

        {warning && (
          <div className='text-yellow-600 mb-4' key={`${name}-warning`}>
            {warning}
          </div>
        )}
      </>
    )
  },
)

InputComponent.displayName = 'InputComponent'

export { InputComponent }
