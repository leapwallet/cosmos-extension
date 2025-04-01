import { Check } from '@phosphor-icons/react'
import React from 'react'
import { cn } from 'utils/cn'

import { Colors } from '../../theme/colors'

type Props = {
  selectColorIndex: (index: number) => void
  colorIndex: number
}

export default function SelectWalletColors({ selectColorIndex, colorIndex }: Props) {
  return (
    <div className='flex items-center gap-x-2 justify-center'>
      {Colors.walletColors.map((color, index) => {
        return (
          <button
            type='button'
            key={index}
            onClick={() => {
              selectColorIndex(index)
            }}
            className={cn('p-[5px] rounded-full', colorIndex === index && 'ring-2 ring-offset-0')}
            style={
              {
                '--tw-ring-color': color,
                '--tw-ring-offset-color': color,
              } as React.CSSProperties
            }
          >
            <div
              className={'flex items-center justify-center rounded-full size-6'}
              style={{ backgroundColor: color }}
            >
              {index === colorIndex && <Check size={16} className='text-white-100' />}
            </div>
          </button>
        )
      })}
    </div>
  )
}
