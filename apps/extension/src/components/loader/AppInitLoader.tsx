import ExtensionPage from 'components/extension-page'
import React from 'react'
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
  const views = Browser.extension.getViews({ type: 'popup' })
  return views.length === 0 ? (
    <ExtensionPage>
      <div className='absolute top-0 flex h-full w-1/2 z-5 justify-center items-center'>
        <div className='dark:shadow-sm shadow-xl dark:shadow-gray-700'>
          <PopupLoader />
        </div>
      </div>
    </ExtensionPage>
  ) : (
    <PopupLoader />
  )
}
