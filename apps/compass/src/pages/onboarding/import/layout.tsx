import { ArrowLeft } from '@phosphor-icons/react'
import { Button } from 'components/ui/button'
import StepProgress from 'components/ui/step-progress'
import React from 'react'
import { cn } from 'utils/cn'

import { OnboardingLayout } from '../layout'
import { useImportWalletContext } from './import-wallet-context'

const NavHeader = () => {
  const { backToPreviousStep, currentStep, totalSteps, walletName } = useImportWalletContext()

  const totalStepsToShow = walletName === 'private-key' ? totalSteps - 1 : totalSteps
  const currentStepToShow = walletName === 'private-key' && currentStep === 3 ? 2 : currentStep

  return (
    <div className='flex flex-row items-center justify-between align-center w-full relative -m-1'>
      <Button variant='secondary' size='icon' onClick={backToPreviousStep}>
        <ArrowLeft className='size-4' />
      </Button>

      {currentStep > 0 && (
        <StepProgress currentStep={currentStepToShow} totalSteps={totalStepsToShow} />
      )}

      {/* to center the progress bar horizontally */}
      <div className='size-9 shrink-0' />
    </div>
  )
}

export const ImportWalletLayout = (props: React.PropsWithChildren<{ className?: string }>) => {
  return (
    <OnboardingLayout
      className={cn(
        'flex flex-col items-stretch gap-7 p-7 overflow-auto border-secondary-300 relative',
        props.className,
      )}
    >
      <NavHeader />

      {props.children}
    </OnboardingLayout>
  )
}
