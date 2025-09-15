import { ArrowLeft } from '@phosphor-icons/react'
import { Button } from 'components/ui/button'
import React from 'react'
import { cn } from 'utils/cn'

import { useReconnectLedgerContext } from './reconnect-ledger-context'

export const NavBar = () => {
  const { backToPreviousStep, currentStep } = useReconnectLedgerContext()

  return (
    <div
      className={cn(
        'flex flex-row items-center justify-between relative w-full -m-1',
        currentStep === 2 && 'hidden',
      )}
    >
      <Button variant='secondary' size='icon' onClick={backToPreviousStep} className='w-fit'>
        <ArrowLeft className='size-4' />
      </Button>
    </div>
  )
}
