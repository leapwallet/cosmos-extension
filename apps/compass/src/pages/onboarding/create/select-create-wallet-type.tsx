import { GoogleColorIcon } from 'icons/google-color-icon'
import { RecoveryPhraseIcon } from 'icons/recovery-phrase'
import { WalletIcon } from 'icons/wallet-icon'
import React from 'react'
import { cn } from 'utils/cn'

import { OnboardingWrapper } from '../wrapper'
import { useCreateWalletContext } from './create-wallet-context'

const SelectWalletButton = (props: {
  title: string
  description: string
  icon: React.ReactNode
  onClick: () => void
  className?: string
}) => {
  return (
    <button
      onClick={props.onClick}
      className={cn(
        'flex items-center gap-4 py-4 px-5 bg-secondary-200 rounded-lg hover:bg-secondary-300 text-start transition-colors',
        props.className,
      )}
    >
      {props.icon}

      <div className='flex flex-col gap-1'>
        <span className='font-bold text-md'>{props.title}</span>
        <span className='text-sm'>{props.description}</span>
      </div>
    </button>
  )
}

export const SelectCreateWalletType = () => {
  const { moveToNextStep, prevStep, currentStep, socialLogin } = useCreateWalletContext()

  return (
    <OnboardingWrapper
      headerIcon={<WalletIcon className='size-6' />}
      heading='Create a new wallet'
      entry={prevStep <= currentStep ? 'right' : 'left'}
    >
      <div className={'flex flex-col gap-6 justify-center'}>
        {/* <SelectWalletButton
          className={
            socialLogin.isLoading ? 'animate-pulse hover:bg-secondary-200 cursor-progress' : ''
          }
          title={socialLogin.isLoading ? 'Logging in...' : 'Google'}
          description='Create a wallet using your Google account'
          icon={<GoogleColorIcon className='size-10' />}
          onClick={async () => {
            const res = await socialLogin.login()
            if (!res) return

            moveToNextStep('social')
          }}
        /> */}

        <SelectWalletButton
          title='Seed phrase'
          description='Create a seed phrase wallet'
          icon={<RecoveryPhraseIcon className='size-10 text-secondary-800' />}
          onClick={() => moveToNextStep('seed-phrase')}
        />
      </div>

      {socialLogin.error && (
        <div className='text-destructive-100 text-sm text-center'>{socialLogin.error}</div>
      )}
    </OnboardingWrapper>
  )
}
