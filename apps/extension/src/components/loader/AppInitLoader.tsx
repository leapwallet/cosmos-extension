import classNames from 'classnames'
import ExtensionPage from 'components/extension-page'
import React from 'react'
import { isSidePanel } from 'utils/isSidePanel'
import Browser from 'webextension-polyfill'

import PopupLayout from '../layout/popup-layout'
import Loader from '../loader/Loader'

const PopupLoader = () => (
  <PopupLayout>
    <div className='flex flex-col items-center justify-center h-full'>
      <Loader />
    </div>
  </PopupLayout>
)

export function AppInitLoader() {
  let views = []
  if (typeof Browser.extension.getViews === 'function') {
    views = Browser.extension.getViews({ type: 'popup' })
  }

  return views.length === 0 || isSidePanel() ? (
    <ExtensionPage>
      <div
        className={classNames('absolute top-0 flex h-full z-5 justify-center items-center', {
          'w-1/2': !isSidePanel(),
          'panel-width': isSidePanel(),
        })}
      >
        <div
          className={classNames('dark:shadow-sm shadow-xl dark:shadow-gray-700', {
            'panel-height panel-width enclosing-panel': isSidePanel(),
          })}
        >
          <PopupLoader />
        </div>
      </div>
    </ExtensionPage>
  ) : (
    <PopupLoader />
  )
}
