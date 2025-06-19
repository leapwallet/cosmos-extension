import { Images } from 'images'
import React from 'react'
import { cn } from 'utils/cn'

type CustomCheckboxProps = {
  checked: boolean
  onClick: () => void
  isWhite?: boolean
}

export function CustomCheckbox({ checked, onClick, isWhite }: CustomCheckboxProps) {
  return (
    <div
      className={'w-[20px] h-[20px] rounded cursor-pointer flex justify-center items-center'}
      onClick={onClick}
    >
      {checked ? (
        <div className='w-[15px] h-[15px] relative'>
          <img
            src={
              isWhite
                ? Images.Misc.FilledRoundedSquareWhite
                : Images.Misc.FilledRoundedSquareCheckMark
            }
            className='absolute inset-0'
          />
        </div>
      ) : (
        <div
          className={cn('w-[15px] h-[15px] rounded-[2px] border-[2px]', {
            'border-green-600': !isWhite,
            'border-white-100': isWhite,
          })}
        ></div>
      )}
    </div>
  )
}
