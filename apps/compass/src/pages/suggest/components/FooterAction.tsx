import { Buttons } from '@leapwallet/leap-ui'
import classNames from 'classnames'
import React, { ReactNode } from 'react'
import { Colors } from 'theme/colors'

type FooterActionProps = {
  error?: string
  rejectBtnText: ReactNode
  rejectBtnClick: () => void
  confirmBtnText: ReactNode
  confirmBtnClick?: () => void
  isConfirmBtnDisabled?: boolean
}

export function FooterAction({
  error,
  rejectBtnClick,
  rejectBtnText,
  confirmBtnClick,
  confirmBtnText,
  isConfirmBtnDisabled,
}: FooterActionProps) {
  return (
    <div
      className={classNames('flex flex-row justify-between w-full', {
        'mb-6': !!error,
      })}
    >
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
          cursor: 'pointer',
        }}
        className='ml-3 bg-gray-800'
        onClick={confirmBtnClick}
        disabled={isConfirmBtnDisabled}
      >
        {confirmBtnText}
      </Buttons.Generic>
    </div>
  )
}
