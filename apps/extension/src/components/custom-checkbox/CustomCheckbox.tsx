import { Images } from 'images'
import React from 'react'

type CustomCheckboxProps = {
  checked: boolean
  onClick: () => void
}

export function CustomCheckbox({ checked, onClick }: CustomCheckboxProps) {
  return (
    <div
      className={'w-[20px] h-[20px] rounded cursor-pointer flex justify-center items-center'}
      onClick={onClick}
    >
      {checked ? (
        <div className='w-[15px] h-[15px] relative'>
          <img src={Images.Misc.FilledRoundedSquareCheckMark} className='absolute inset-0' />
        </div>
      ) : (
        <div className='w-[15px] h-[15px] rounded-[2px] border-[2px] border-gray-800 dark:border-gray-200'></div>
      )}
    </div>
  )
}
