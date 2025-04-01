import { IconProps } from '@phosphor-icons/react'
import { GoogleIcon } from 'icons/google-icon'
import { KeyIcon } from 'icons/key'
import { LedgerDriveIcon } from 'icons/ledger-icon'
import { RecoveryPhraseIcon } from 'icons/recovery-phrase'
import { WalletIcon } from 'icons/wallet-icon'
import { OnboardingWrapper } from 'pages/onboarding/wrapper'
import React from 'react'
import { cn } from 'utils/cn'

import { useImportWalletContext } from './import-wallet-context'

const ImportTypeButton = (props: {
  title: string
  icon: (props: IconProps) => JSX.Element
  onClick: () => void
  className?: string
}) => {
  return (
    <button
      onClick={props.onClick}
      className={cn(
        'bg-secondary-200 hover:bg-secondary-400 transition-colors w-full p-5 text-start rounded-xl font-bold text-md flex items-center gap-4',
        props.className,
      )}
    >
      <props.icon className='size-6 text-muted-foreground' />
      <span>{props.title}</span>
    </button>
  )
}

const importMethods = [
  {
    id: 'seed-phrase',
    title: 'Import recovery phrase',
    icon: RecoveryPhraseIcon,
  },
  {
    id: 'private-key',
    title: 'Import private key',
    icon: KeyIcon,
  },
  {
    id: 'ledger',
    title: 'Connect via Ledger',
    icon: LedgerDriveIcon,
  },
] as const

const SelectImportType = () => {
  const {
    prevStep,
    currentStep,
    setCurrentStep,
    setWalletName,
    socialLogin,
    moveToNextStepSocial,
  } = useImportWalletContext()

  return (
    <OnboardingWrapper
      headerIcon={<WalletIcon className='size-6' />}
      heading='Use an existing wallet'
      subHeading={`Select how you'd like to access your existing wallet`}
      className='gap-10'
      entry={prevStep <= currentStep ? 'right' : 'left'}
    >
      <div className='flex flex-col gap-4 w-full'>
        {/* <ImportTypeButton
          onClick={async () => {
            const loginRes = await socialLogin.login()
            if (!loginRes) return

            moveToNextStepSocial()
          }}
          icon={GoogleIcon}
          title={socialLogin.isLoading ? 'Logging in...' : 'Import via Google account'}
          className={
            socialLogin.isLoading ? 'animate-pulse hover:bg-secondary-200 cursor-progress' : ''
          }
        /> */}

        {importMethods.map((method) => (
          <ImportTypeButton
            key={method.id}
            onClick={() => {
              setWalletName(method.id)
              setCurrentStep(currentStep + 1)
            }}
            icon={method.icon}
            title={method.title}
          />
        ))}
      </div>
    </OnboardingWrapper>
  )
}

export default SelectImportType
