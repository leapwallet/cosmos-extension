import classNames from 'classnames'
import React from 'react'

import { Colors } from '../../theme/colors'

type Props = {
  // eslint-disable-next-line no-unused-vars
  selectColorIndex: (index: number) => void
  colorIndex: number
}

export default function SelectWalletColors({ selectColorIndex, colorIndex }: Props) {
  return (
    <div className='flex items-center gap-x-[8px] justify-center'>
      {Colors.walletColors.map((color, index) => {
        return (
          <div
            key={index}
            onClick={() => {
              selectColorIndex(index)
            }}
            className={classNames('p-[5px] rounded-full', {
              'border-2': colorIndex === index,
            })}
            style={{ borderColor: color }}
          >
            <div
              className={classNames(
                'flex items-center justify-center rounded-full w-[24px] h-[24px]',
              )}
              style={{ backgroundColor: color }}
            >
              {index === colorIndex && (
                <div className='material-icons-round text-white-100'>check</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
