import useQuery from 'hooks/useQuery'
import React from 'react'
import { useState } from 'react'

import { ConnectLedger } from './ConnectLedger'
import { OpenAppView } from './OpenAppView'
import { SelectLedgerAppView } from './SelectLedgerAppView'

const Steps = {
  step1: 'unlock-ledger',
  step2: 'select-app',
  step3: 'open-app',
  step4: 'select-wallets',
}

export function LedgerFlow() {
  const query = useQuery()
  let startStep = Steps.step1
  if (query.get('app') === 'sei') {
    startStep = Steps.step3
  }
  const [currentStep, setCurrentStep] = useState(startStep)

  const appSelected = () => {
    setCurrentStep(Steps.step3)
  }

  switch (currentStep) {
    case Steps.step1:
      return <ConnectLedger onNext={() => setCurrentStep(Steps.step2)} />
    case Steps.step2:
      return <SelectLedgerAppView onNext={appSelected} />
    case Steps.step3:
      return <OpenAppView />
    default:
      return null
  }
}
