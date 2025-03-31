import classNames from 'classnames'
import Text from 'components/text'
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
        <div
          className={classNames({
            '!border-red-300': error,
            '!border-yellow-600': warning,
            'w-full border border-gray-500 rounded-xl flex h-12 bg-white-100 dark:bg-gray-900 py-2 pl-5 pr-[10px] mb-4':
              true,
          })}
        >
          <input
            placeholder={placeholder}
            className={classNames({
              'flex flex-grow text-base dark:text-white-100 text-gray-400 outline-none bg-white-0 placeholder-gray-400::placeholder':
                true,
              'border-red-300': error,
              'border-yellow-600': warning,
            })}
            value={value}
            name={name}
            onChange={onChange}
            autoComplete='off'
            onBlur={onBlur}
            ref={ref}
          />
        </div>

        {error && (
          <Text size='sm' color='text-red-300 mb-4'>
            {error}
          </Text>
        )}

        {warning && (
          <Text size='sm' color='text-yellow-600 mb-4'>
            {warning}
          </Text>
        )}
      </>
    )
  },
)

InputComponent.displayName = 'InputComponent'

export { InputComponent }
