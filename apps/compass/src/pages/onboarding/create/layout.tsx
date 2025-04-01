import { ArrowLeft } from '@phosphor-icons/react'
import { Button } from 'components/ui/button'
import StepProgress from 'components/ui/step-progress'
import React from 'react'
import { cn } from 'utils/cn'

import { OnboardingLayout } from '../layout'
import { useCreateWalletContext } from './create-wallet-context'

const NavHeader = () => {
  const { backToPreviousStep, currentStep, totalSteps, createType } = useCreateWalletContext()

  return (
    <div className='flex flex-row items-center justify-between align-center w-full relative -m-1'>
      <Button variant='secondary' size='icon' onClick={backToPreviousStep}>
        <ArrowLeft className='size-4' />
      </Button>

      {createType !== 'social' && (
        <>
          {currentStep > 0 && (
            <StepProgress
              currentStep={currentStep}
              totalSteps={totalSteps}
              className='mx-auto h-9'
            />
          )}

          {/* to center the progress bar horizontally */}
          <div className='size-9 shrink-0' />
        </>
      )}
    </div>
  )
}

export const CreateWalletLayout = (props: React.PropsWithChildren<{ className?: string }>) => {
  return (
    <OnboardingLayout
      className={cn(
        'flex flex-col items-stretch gap-7 p-7 overflow-auto border-secondary-300',
        props.className,
      )}
    >
      <NavHeader key='nav-header' />

      {props.children}
    </OnboardingLayout>
  )
}
