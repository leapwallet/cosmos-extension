import { LineDivider } from '@leapwallet/leap-ui'
import ExtensionPage from 'components/extension-page'
import Text from 'components/text'
import { Images } from 'images'
import React from 'react'
import Confetti from 'react-confetti'
import { isCompassWallet } from 'utils/isCompassWallet'

export default function OnboardingSuccess() {
  return (
    <ExtensionPage
      headerRightComponent={
        <div className='absolute top-0 right-0'>
          {' '}
          <img
            src={isCompassWallet() ? Images.Misc.CompassPinExtension : Images.Misc.PinToExtension}
            className='w-[320px] h-[210px]'
          />
        </div>
      }
      titleComponent={
        <div className='w-screen absolute opacity-50 top-0 z-1'>
          <Confetti numberOfPieces={1000} recycle={false} />
        </div>
      }
    >
      <div className='flex flex-col justify-center items-center'>
        <img src={Images.Misc.CheckGreen} className='h-[72px]' />
        <Text
          size='jumbo'
          className='font-medium mt-[24px] mb-[30px]'
          data-testing-id='ready-wallet-ele'
        >
          Your {isCompassWallet() ? 'Compass' : 'Leap'} wallet is ready!
        </Text>
        <LineDivider />
        <Text size='xl' className='font-medium mt-[30px]'>
          Access your wallet
        </Text>
        <Text size='sm' color='text-gray-400'>
          using this keyboard shortcut
        </Text>
        <img src={Images.Misc.CMDShiftL} className='h-[32px] m-[20px]' />
        <Text size='xs' color='text-gray-400'>
          Mac: Command + Shift + L
        </Text>
        <Text size='xs' color='text-gray-400'>
          Windows / others: Control + Shift + L
        </Text>
      </div>
    </ExtensionPage>
  )
}
