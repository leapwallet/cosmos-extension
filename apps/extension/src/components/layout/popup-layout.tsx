import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks'
import classNames from 'classnames'
import { WatchingWalletStrip } from 'components/alert-strip/WatchingWalletStrip'
import Text from 'components/text'
import React, { ReactNode } from 'react'
import { Colors } from 'theme/colors'

type PopupLayoutProps = {
  children: ReactNode
  header?: ReactNode
  showBetaTag?: boolean
  className?: string
  headerZIndex?: number
  skipWatchingWalletHeader?: boolean
}

export default function PopupLayout({
  children,
  header,
  className,
  showBetaTag = false,
  headerZIndex = 2,
  skipWatchingWalletHeader = false,
}: PopupLayoutProps) {
  const activeChain = useActiveChain()

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
          {showBetaTag && (
            <Text
              size='xs'
              style={{ borderColor: Colors.getChainColor(activeChain) }}
              className='absolute border-[1px] z-10 top-[25px] px-[10px] py-[3px] rounded-2xl font-medium left-[64px]'
            >
              Beta
            </Text>
          )}
          {header}
        </div>
      )}
      {header && <div className='mt-[72px]' />}
      {header && !skipWatchingWalletHeader && <WatchingWalletStrip />}
      {children}
    </div>
  )
}
