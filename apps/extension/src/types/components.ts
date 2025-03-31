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
  titleIcon?: ReactNode
  action?: HeaderAction
  imgSrc?: ReactNode
  onImgClick?: (
    event?: React.MouseEvent<HTMLDivElement>,
    props?: { defaultFilter?: string },
  ) => void
  dontShowFilledArrowIcon?: boolean
}
