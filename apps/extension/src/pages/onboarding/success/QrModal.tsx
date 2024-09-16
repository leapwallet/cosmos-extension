import { QrCode } from '@leapwallet/leap-ui'
import { X } from '@phosphor-icons/react'
import Text from 'components/text'
import { Images } from 'images'
import React, { Dispatch, SetStateAction } from 'react'

export function QrModal({ setShowQrModal }: { setShowQrModal: Dispatch<SetStateAction<boolean>> }) {
  return (
    <div
      className='fixed top-0 left-0 z-[5] h-screen w-screen bg-[#000000B2] p-2 backdrop-blur-[2.5px] dark:bg-[#000000B2]'
      onClick={(event) => {
        event.stopPropagation()
        setShowQrModal(false)
      }}
    >
      <div
        className='fixed top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-[24px] shadow-[0px,7px,24px,0px,rgba(0,0,0,0.25)] bg-gray-50 !p-0 dark:bg-gray-950'
        onClick={(event) => event.stopPropagation()}
      >
        <div className='flex flex-col items-center justify-between w-[430px]'>
          <div className='flex w-full flex-row items-center justify-between py-[10px] px-6 h-[55px]'>
            <Text size='lg' className='font-bold !leading-[28px]'>
              Don’t have this app yet?✋
            </Text>
            <div
              className='flex !h-6 !w-6 cursor-pointer items-center justify-center p-1 text-gray-500 dark:text-gray-500'
              onClick={() => setShowQrModal(false)}
            >
              <X size={16} className='text-gray-500 dark:text-gray-500' />
            </div>
          </div>
          <div className='overflow-hidden rounded-3xl !pt-3 p-6'>
            <div className='rounded-[30px] overflow-hidden'>
              <QrCode data={'https://onelink.to/gq7zmg'} height={350} width={350} />
            </div>
          </div>
          <Text
            size='sm'
            color='dark:text-gray-400 text-gray-600'
            className='pb-6 px-10 text-center'
          >
            Scan the QR code to download our app on Android/iOS
          </Text>
          <div className='flex pb-6 gap-4'>
            <button
              className='border border-gray-800 p-2 rounded-lg flex gap-2 items-center'
              onClick={() => window.open('https://bit.ly/47uSPXy')}
            >
              <img src={Images.Logos.Appstore} />
              <Text color='dark:text-gray-500 text-gray-600' className='text=[18px]'>
                App Store
              </Text>
            </button>
            <button
              className='border border-gray-800 p-2 rounded-lg flex gap-2 items-center'
              onClick={() => window.open('https://bit.ly/45sTW8y')}
            >
              <img src={Images.Logos.Playstore} />
              <Text color='dark:text-gray-500 text-gray-600' className='text=[18px]'>
                Play Store
              </Text>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
