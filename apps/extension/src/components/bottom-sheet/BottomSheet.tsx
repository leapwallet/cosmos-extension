import { DropUp, Header, HeaderActionType } from '@leapwallet/leap-ui'
import React, { ReactElement } from 'react'

type BottomSheetProps = {
  readonly isVisible: boolean
  readonly onClose: VoidFunction
  readonly children: ReactElement
  readonly headerTitle?: string
  readonly headerActionType?: HeaderActionType
  readonly delayDrawTime?: number
  readonly closeOnClickBackDrop?: boolean
  readonly headerRightImg?: string
  readonly onClickHeaderRight?: VoidFunction
  // eslint-disable-next-line no-unused-vars
  readonly customHeader?: (toggle: () => void) => ReactElement
}

export default function BottomSheet({
  isVisible,
  onClose,
  children,
  headerTitle,
  headerActionType,
  delayDrawTime,
  headerRightImg,
  onClickHeaderRight,
  closeOnClickBackDrop = true,
  customHeader,
}: BottomSheetProps) {
  if (!isVisible) return null
  return (
    <DropUp
      onClose={onClose}
      delayDrawTime={delayDrawTime}
      closeOnClickBackdrop={closeOnClickBackDrop}
    >
      {(toggle) => (
        <div className='max-h-[580px] overflow-scroll'>
          {!customHeader && (
            <Header
              title={headerTitle}
              action={{
                type: headerActionType as HeaderActionType,
                onClick: toggle,
              }}
              imgSrc={headerRightImg}
              onImgClick={
                onClickHeaderRight
                  ? function noRefCheck() {
                      if (onClickHeaderRight) onClickHeaderRight()
                    }
                  : undefined
              }
            />
          )}
          {!!customHeader && customHeader(toggle)}
          {children}
        </div>
      )}
    </DropUp>
  )
}
