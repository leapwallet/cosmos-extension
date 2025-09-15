import { AnimatePresence } from 'framer-motion'
import { OnboardingLayout } from 'pages/onboarding/layout'
import React from 'react'

import { NavBar } from './nav-bar'
import { ReconnectLedgerProvider, useReconnectLedgerContext } from './reconnect-ledger-context'
import { ReconnectLedgerSuccess } from './reconnect-ledger-success'
import { ReconnectingLedger } from './reconnecting-ledger'
import { SelectLedgerNetwork } from './select-ledger-network'

const ReconnectLedgerView = () => {
  const { currentStep } = useReconnectLedgerContext()
  return (
    <AnimatePresence mode='wait' initial={false} presenceAffectsLayout>
      {currentStep === 0 && <SelectLedgerNetwork />}

      {currentStep === 1 && <ReconnectingLedger />}

      {currentStep === 2 && <ReconnectLedgerSuccess />}
    </AnimatePresence>
  )
}

export default function ReconnectLedger() {
  return (
    <OnboardingLayout className='flex flex-col gap-y-5 justify-center items-center grow p-7'>
      <ReconnectLedgerProvider>
        <NavBar />
        <ReconnectLedgerView />
      </ReconnectLedgerProvider>
    </OnboardingLayout>
  )
}
