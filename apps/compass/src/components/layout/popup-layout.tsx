import React, { ReactNode } from 'react'
import { cn } from 'utils/cn'

type PopupLayoutProps = {
  children: ReactNode
  header?: ReactNode
  className?: string
  headerZIndex?: number
  skipWatchingWalletHeader?: boolean
}

export default function PopupLayout({ children, className }: PopupLayoutProps) {
  return (
    <div
      id='popup-layout'
      className={cn(
        'panel-width enclosing-panel panel-height max-panel-height overflow-y-auto bg-background relative m-auto',
        className,
      )}
    >
      {children}
    </div>
  )
}
