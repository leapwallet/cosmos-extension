import { Buttons } from '@leapwallet/leap-ui'
import React, { ReactNode } from 'react'
import { Colors } from 'theme/colors'

type FooterActionProps = {
  rejectBtnClick: () => void
  rejectBtnText: ReactNode
  confirmBtnText: ReactNode
  confirmBtnClick?: () => void
}

export function FooterAction({
  rejectBtnClick,
  rejectBtnText,
  confirmBtnClick,
  confirmBtnText,
}: FooterActionProps) {
  return (
    <div className='flex flex-row justify-between w-full'>
      <Buttons.Generic
        style={{ height: '48px', background: Colors.gray900, color: Colors.white100 }}
        onClick={rejectBtnClick}
      >
        {rejectBtnText}
      </Buttons.Generic>

      <Buttons.Generic
        style={{
          height: '48px',
          background: Colors.cosmosPrimary,
          color: Colors.white100,
        }}
        className='ml-3 bg-gray-800'
        onClick={confirmBtnClick}
      >
        {confirmBtnText}
      </Buttons.Generic>
    </div>
  )
}
