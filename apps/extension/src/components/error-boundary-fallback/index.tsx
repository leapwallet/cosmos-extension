import { Header } from '@leapwallet/leap-ui'
import PopupLayout from 'components/layout/popup-layout'
import { ACTIVE_CHAIN, SELECTED_NETWORK } from 'config/storage-keys'
import { Images } from 'images'
import React, { useCallback } from 'react'
import { Colors } from 'theme/colors'
import { isCompassWallet } from 'utils/isCompassWallet'
import { isSidePanel } from 'utils/isSidePanel'
import browser from 'webextension-polyfill'

const ErrorBoundaryFallback = () => {
  const reload = useCallback(() => {
    //reset the active chain to cosmos or sei
    if (isCompassWallet()) {
      browser.storage.local.set({ [ACTIVE_CHAIN]: 'seiTestnet2', [SELECTED_NETWORK]: 'mainnet' })
    } else {
      browser.storage.local.set({ [ACTIVE_CHAIN]: 'cosmos', [SELECTED_NETWORK]: 'mainnet' })
    }
    const url = isSidePanel() ? `/sidepanel.html#/home` : `/index.html#/home`
    window.location.href = browser.runtime.getURL(url)
    window.location.reload()
  }, [])

  return (
    <div className='relative w-full overflow-clip enclosing-panel panel-height'>
      <PopupLayout header={<Header title={isCompassWallet() ? 'Compass Wallet' : 'Leap Wallet'} />}>
        <div
          className='flex flex-col items-center justify-center w-full'
          style={{
            height: 'calc(100% - 72px)',
            background: isCompassWallet()
              ? Colors.compassGradient
              : 'linear-gradient(180deg, rgba(209, 80, 98, 0.32) 0%, rgba(209, 80, 98, 0) 100%)',
          }}
        >
          <div className='flex justify-center space-x-2'>
            <img
              src={isCompassWallet() ? Images.Logos.CompassCircle : Images.Logos.LeapLogo}
              height='150px'
            />
            <h1 className='text-xxl font-bold' style={{ color: '#E54f47' }}>
              Oops!
            </h1>
          </div>
          <h2 className='mt-2 text-lg font-bold text-gray-800 dark:text-gray-100'>
            Something went wrong
          </h2>
          <p className='mt-6 px-8 text-center text-gray-800 dark:text-gray-100'>
            You can try reloading the extension.
          </p>
          <button
            className='font-medium bg-indigo-300 px-4 py-1 rounded-full text-white-100 mt-4'
            onClick={reload}
          >
            Reload
          </button>
          <p className='mt-8 px-8 text-xs text-center text-gray-700 dark:text-gray-200'>
            Our systems will auto report this issue. If the issue persists you can contact us at{' '}
            <a
              href='mailto:support@leapwallet.io'
              className='font-medium text-indigo-300 underline'
            >
              support@leapwallet.io
            </a>{' '}
            for any further assistance.
          </p>
          <div className='mt-12' />
        </div>
      </PopupLayout>
    </div>
  )
}

export default ErrorBoundaryFallback
