import classNames from 'classnames'
import { WatchingWalletStrip } from 'components/alert-strip/WatchingWalletStrip'
import React, { ReactNode } from 'react'

type PopupLayoutProps = {
  children: ReactNode
  header?: ReactNode
  className?: string
  headerZIndex?: number
  skipWatchingWalletHeader?: boolean
}

export default function PopupLayout({
  children,
  header,
  className,
  headerZIndex = 2,
  skipWatchingWalletHeader = false,
}: PopupLayoutProps) {
  return (
    <div
      id='popup-layout'
      className={classNames(
        'panel-width enclosing-panel panel-height max-panel-height overflow-y-auto bg-gray-50 dark:bg-black-100 relative',
        className,
      )}
    >
      {header && (
        <div
          className='fixed dark:bg-black-100 bg-gray-50 z-5 panel-width enclosing-panel'
          style={{ zIndex: headerZIndex }}
        >
          {header}
        </div>
      )}
      {header && <div className='mt-[72px]' />}
      {header && !skipWatchingWalletHeader && <WatchingWalletStrip />}
      {children}
    </div>
  )
}
