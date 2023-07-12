import { DropUp, Header, HeaderActionType } from '@leapwallet/leap-ui'
import React, { ReactElement } from 'react'

type Props = {
  readonly isVisible: boolean
  readonly onClose: VoidFunction
  readonly children: ReactElement
  readonly headerTitle?: string
  readonly headerActionType?: HeaderActionType
  readonly delayDrawTime?: number
  readonly closeOnClickBackDrop?: boolean
  readonly headerRightImg?: string
  readonly onClickHeaderRight?: VoidFunction
  readonly customHeader?: (toggle: () => void) => ReactElement
}

const BottomSheet: React.FC<Props> = ({
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
}) => {
  if (!isVisible) return null

  return (
    <DropUp
      onClose={onClose}
      delayDrawTime={delayDrawTime}
      closeOnClickBackdrop={closeOnClickBackDrop}
    >
      {(toggle) => (
        <div className='max-h-[580px] overflow-y-auto'>
          {!customHeader && (
            <Header
              title={headerTitle}
              action={{
                type: headerActionType!,
                onClick: toggle,
              }}
              imgSrc={headerRightImg}
              onImgClick={function noRefCheck() {
                if (onClickHeaderRight) onClickHeaderRight()
              }}
            />
          )}
          {!!customHeader && customHeader(toggle)}
          {children}
        </div>
      )}
    </DropUp>
  )
}

export default BottomSheet
