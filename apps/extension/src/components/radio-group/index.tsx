import classNames from 'classnames'
import React, { CSSProperties, useCallback } from 'react'

type RadioGroupProps = {
  options: { title: string; subTitle?: string; value: string }[]
  selectedOption: string
  onChange: (value: string) => void
  className?: string
  themeColor?: CSSProperties['color']
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  selectedOption,
  onChange,
  className,
  themeColor,
}) => {
  const handleOptionChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      onChange(event.target.value)
    },
    [onChange],
  )

  return (
    <fieldset className={classNames('flex flex-col', className)}>
      {options.map((option) => {
        const isSelected = selectedOption === option.value

        return (
          <label
            key={option.value}
            className={`inline-flex items-center last-of-type:border-0 border-b dark:border-b-gray-800 border-b-gray-300 ${
              option.subTitle ? 'py-2 last-of-type:pb-0' : 'py-3 last-of-type:pb-0'
            }`}
          >
            <input
              type='radio'
              value={option.value}
              checked={isSelected}
              onChange={handleOptionChange}
              className='hidden'
            />
            <div
              aria-label='radio-button'
              className={classNames(
                'w-5 h-5 rounded-full border-[2px] flex items-center justify-center cursor-pointer border-gray-300 transition-all',
                {
                  'shadow-sm': isSelected,
                },
              )}
              style={{
                borderColor: isSelected ? themeColor : undefined,
              }}
              tabIndex={0}
              onClick={() => onChange(option.value)}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !isSelected) {
                  onChange(option.value)
                }
              }}
            >
              <div
                className='w-[10px] h-[10px] rounded-full bg-gray-300 transition-all'
                style={{
                  backgroundColor: isSelected ? themeColor : undefined,
                  opacity: isSelected ? 1 : 0,
                }}
              />
            </div>
            <div className='flex flex-col ml-3'>
              <p className='dark:text-white-100 text-gray-900 font-medium'>{option.title}</p>
              {option.subTitle ? <p className='text-gray-500 text-xs'>{option.subTitle}</p> : null}
            </div>
          </label>
        )
      })}
    </fieldset>
  )
}

export default RadioGroup
