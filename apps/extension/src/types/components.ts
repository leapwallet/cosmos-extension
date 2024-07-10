import { ReactNode } from 'react'

export enum HeaderActionType {
  BACK = 'back',
  CANCEL = 'cancel',
  NAVIGATION = 'nav',
}

export type HeaderAction = {
  type: HeaderActionType
  onClick: () => void
  className?: string
}

export type PageHeaderProps = {
  title: ReactNode
  action?: HeaderAction
  imgSrc?: ReactNode
  onImgClick?: () => void
  dontShowFilledArrowIcon?: boolean
}
