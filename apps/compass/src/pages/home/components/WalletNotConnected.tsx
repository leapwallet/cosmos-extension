import { Buttons } from '@leapwallet/leap-ui'
import Text from 'components/text'
import { FrogPanic } from 'images/misc'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { closeSidePanel } from 'utils/closeSidePanel'
import { isSidePanel } from 'utils/isSidePanel'
import Browser from 'webextension-polyfill'

export function WalletNotConnected({ visible }: { visible: boolean }) {
  const navigate = useNavigate()

  if (!visible) {
    return null
  }

  return (
    <div className={'flex flex-col items-center justify-around'}>
      <div className='mb-auto mt-7'>
        <Text size='md' color='text-gray-300' className='font-bold uppercase'>
          Wallet not connected
        </Text>
      </div>
      <div className='flex flex-col items-center justify-center h-[471px]'>
        <img src={FrogPanic} alt='Wallet not connected' className='mb-8' />
        <div className='flex flex-col items-center mb-8'>
          <Text size='lg'>You need to import an</Text>
          <Text size='lg'>EVM wallet to use this chain.</Text>
        </div>
        <Buttons.Generic
          className='w-[344px]'
          onClick={() => {
            const views = Browser.extension.getViews({ type: 'popup' })
            if (views.length === 0 && !isSidePanel) {
              navigate('/onboardEvmLedger')
            } else {
              window.open(Browser.runtime.getURL('index.html#/onboardEvmLedger'))
              closeSidePanel()
            }
          }}
        >
          Connect EVM wallet
        </Buttons.Generic>
      </div>
    </div>
  )
}
