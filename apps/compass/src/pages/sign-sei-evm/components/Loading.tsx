import { Header } from '@leapwallet/leap-ui'
import PopupLayout from 'components/layout/popup-layout'
import { LoaderAnimation } from 'components/loader/Loader'
import React from 'react'

export function Loading() {
  return (
    <PopupLayout
      className='self-center justify-self-center'
      header={<Header title='Sign Transaction' />}
    >
      <div className='h-full w-full flex flex-col gap-4 items-center justify-center'>
        <LoaderAnimation color='white' />
      </div>
    </PopupLayout>
  )
}
