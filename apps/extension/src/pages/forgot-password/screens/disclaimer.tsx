import { Buttons } from '@leapwallet/leap-ui'
import { Lock } from '@phosphor-icons/react'
import PopupLayout from 'components/layout/popup-layout'
import Text from 'components/text'
import React from 'react'
import { Colors } from 'theme/colors'

interface PropsType {
  incrementStep: () => void
}

/**
 *
 * @description This component is used intimate the user about the process they are going through to reset a password.
 * @param props PropsType - props.incrementStep() is called when the user clicks the button to move to the next step
 * @returns React Component
 */
const Disclaimer: React.FC<PropsType> = ({ incrementStep }) => {
  return (
    <PopupLayout>
      <div className='p-5 flex flex-col justify-center h-full'>
        <div className='bg-gray-900 dark:bg-gray-100 rounded-[16px] mb-4 h-[36px] w-[36px] flex flex-col justify-center text-center'>
          <Lock size={20} className='dark:text-gray-900 text-gray-100' />
        </div>
        <Text size='xxl' className='font-bold'>
          Forgot your password?
        </Text>
        <Text size='md' color='text-gray-500 dark:text-gray-300 mb-[32px]'>
          Clear your data and restore your wallet using your recovery phrase
        </Text>
        <Text size='md' color='text-gray-500 dark:text-gray-300 mb-[16px]'>
          We won’t be able to recover your password as it’s stored securely only on your computer.
        </Text>
        <Text size='md' color='text-gray-500 dark:text-gray-300'>
          To recover the wallet you will have to clear you data which will delete your current
          wallet and recovery phrase from this device, along with the list of accounts you’ve
          curated. After that you can restore you wallet using your recovery phrase
        </Text>
        <div className='flex w-full shrink mt-[44px]'>
          <Buttons.Generic size='normal' color={Colors.cosmosPrimary} onClick={incrementStep}>
            Clear data and restore using recovery phrase
          </Buttons.Generic>
        </div>
      </div>
    </PopupLayout>
  )
}

export default Disclaimer
