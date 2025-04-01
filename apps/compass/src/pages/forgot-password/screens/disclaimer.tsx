import { Lock } from '@phosphor-icons/react'
import { Button } from 'components/ui/button'
import React from 'react'

import { ForgotPasswordWrapper } from './wrapper'

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
    <ForgotPasswordWrapper>
      <div className='bg-secondary rounded-full size-20 mx-auto flex items-center justify-center'>
        <Lock size={32} className='text-secondary-800' />
      </div>

      <span className='font-bold text-xl text-center'>Forgot your password?</span>

      <div className='flex flex-col gap-4 mt-2'>
        <span className='text-secondary-foreground text-md'>
          Clear your data and restore your wallet using your recovery phrase
        </span>
        <span className='text-secondary-foreground text-md'>
          We won&apos;t be able to recover your password as it&apos;s stored securely only on your
          computer.
        </span>
        <span className='text-secondary-foreground text-md'>
          To recover the wallet you will have to clear you data which will delete your current
          wallet and recovery phrase from this device, along with the list of accounts you&apos;ve
          curated. After that you can restore you wallet using your recovery phrase
        </span>
      </div>
      <Button className='w-full mt-auto' onClick={incrementStep}>
        Clear data and restore
      </Button>
    </ForgotPasswordWrapper>
  )
}

export default Disclaimer
