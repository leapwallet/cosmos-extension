import { Buttons, ThemeName, useTheme } from '@leapwallet/leap-ui'
import Text from 'components/text'
import { Images } from 'images'
import React from 'react'
import { Colors } from 'theme/colors'

type WatchWalletPopupProps = {
  origin: string
  handleCancel: () => void
}

export default function WatchWalletPopup({ handleCancel, origin }: WatchWalletPopupProps) {
  const { theme } = useTheme()
  return (
    <div className='panel-height enclosing-panel relative w-screen max-w-3xl h-full self-center p-6 pb-0'>
      <div className='flex flex-col gap-y-4 items-center'>
        <div className='flex flex-col gap-y-2 items-center px-6 pb-4'>
          <img src={Images.Misc.Connect} width={80} height={80} />
          <div className='flex flex-col gap-y-0.5 items-center'>
            <Text
              size='lg'
              color='text-black-100 dark:text-white-100'
              className='font-bold text-center'
            >
              {origin}
            </Text>
            <Text
              size='md'
              color='text-gray-800 dark:text-gray-200'
              className='font-bold text-center'
            >
              wants to connect to your wallet
            </Text>
          </div>
          <div className='flex gap-x-1 items-center'>
            <Text size='md' color='text-green-500' className='font-bold text-center'>
              {origin}
            </Text>
            <img src={Images.Activity.TxSwapSuccess} width={16} height={16} />
          </div>
        </div>
        <div className='flex flex-col gap-y-4 items-center rounded-[13px] dark:bg-gray-850 bg-gray-100 p-4 border border-orange-500'>
          <div className='relative'>
            <img src={Images.Misc.GreenEye} width={40} height={40} />
            <img
              src={Images.Activity.TxSwapFailure}
              width={18}
              height={18}
              className='absolute top-0 left-[31px]'
            />
          </div>
          <div className='flex flex-col gap-y-2 items-center'>
            <Text
              size='md'
              color='text-gray-800 dark:text-gray-200'
              className='font-bold text-center'
            >
              You are watching this wallet.
            </Text>
            <Text
              size='md'
              color='text-gray-800 dark:text-gray-200'
              className='font-medium text-center'
            >
              Import the wallet using your recovery phrase to manage assets and sign transactions.
            </Text>
          </div>
        </div>
      </div>
      <Buttons.Generic
        size='normal'
        color={theme === ThemeName.DARK ? Colors.gray900 : Colors.gray100}
        className='w-[344px] absolute bottom-0 p-6 pt-0'
        onClick={handleCancel}
      >
        Cancel
      </Buttons.Generic>
    </div>
  )
}
