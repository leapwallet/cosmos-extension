import React, { ReactNode } from 'react'

import useMediaQuery from '~/hooks/use-media-query'
import { Images } from '~/images'
import { Colors } from '~/theme/colors'

import AlertStrip from './alert-strip'
import Text from './text'

export default function PopupLayout({
  children,
  header,
}: {
  children: ReactNode
  header?: ReactNode
  showBetaTag?: boolean
}) {
  const matches = useMediaQuery('(max-width: 420px)')

  return (
    <div className='popup-layout w-screen relative max-w-[420px] h-screen overflow-y-auto bg-gray-50 dark:bg-black-100'>
      {header && (
        <div
          className='header-container fixed dark:bg-black-100 bg-gray-50 z-5'
          style={{ zIndex: 1 }}
        >
          {header}
        </div>
      )}
      {header && <div className='mt-[72px]' />}
      <AlertStrip
        message={
          <a
            target='_blank'
            rel='noopener noreferrer'
            href='https://chrome.google.com/webstore/detail/leap-cosmos-wallet/fcfcfllfndlomdhbehjjcoimbgofdncg'
            title='Leap Cosmos Logo'
            className='flex space-x-2 items-center'
          >
            <Text size='sm'>Install Leap Now</Text>
            <img width='40px' src={Images.Logos.LeapCosmos} />
          </a>
        }
        alwaysShow
        bgColor={Colors.cosmosPrimary}
      />
      {matches ? (
        <a
          target='_blank'
          rel='noopener noreferrer'
          href='https://chrome.google.com/webstore/detail/leap-cosmos-wallet/fcfcfllfndlomdhbehjjcoimbgofdncg'
          title='Leap Cosmos Logo'
          className='flex items-center justify-center bg-mainChainTheme-400 shadow-md hover:shadow-lg active:shadow-sm transition-shadow border-none rounded-full fixed bottom-20 right-4 p-2 z-20'
        >
          <img width='60px' src={Images.Logos.LeapCosmos} />
        </a>
      ) : null}
      {children}
    </div>
  )
}
