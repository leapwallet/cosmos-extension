import { Images } from 'images'
import React from 'react'

type CustomCheckboxProps = {
  checked: boolean
  color: string
  onClick: () => void
}

export function CustomCheckbox({ checked, color, onClick }: CustomCheckboxProps) {
  return (
    <div
      className={`w-[20px] h-[20px] rounded border-[2px] border-${color}-400 cursor-pointer relative`}
      onClick={onClick}
    >
      <span className='w-[20px] block h-[20px]' />
      {checked && (
        <img src={Images.Misc.FilledRoundedSquareCheckMark} className='absolute inset-0' />
      )}
    </div>
  )
}
