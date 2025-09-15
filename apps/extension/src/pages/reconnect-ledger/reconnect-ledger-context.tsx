import { useDebounce } from '@leapwallet/cosmos-wallet-hooks'
import usePrevious from 'hooks/utility/usePrevious'
import { LEDGER_NETWORK } from 'pages/onboarding/import/import-wallet-context'
import React, { createContext, Dispatch, SetStateAction, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const ReconnectLedgerContext = createContext<{
  ledgerNetworks: Set<LEDGER_NETWORK>
  setLedgerNetworks: Dispatch<SetStateAction<Set<LEDGER_NETWORK>>>
  prevStep: number
  currentStep: number
  setCurrentStep: Dispatch<SetStateAction<number>>
  moveToNextStep: () => void
  backToPreviousStep: () => void
  reconnectLedger: (appType: LEDGER_NETWORK) => Promise<void>
}>({
  ledgerNetworks: new Set<LEDGER_NETWORK>(),
  setLedgerNetworks: () => {},
  prevStep: 0,
  currentStep: 0,
  setCurrentStep: () => {},
  moveToNextStep: () => {},
  backToPreviousStep: () => {},
  reconnectLedger: (appType: LEDGER_NETWORK) => Promise.resolve(),
})

export const useReconnectLedgerContext = () => {
  const context = useContext(ReconnectLedgerContext)
  if (!context) {
    throw new Error('useReconnectLedgerContext must be used within a ReconnectLedgerProvider')
  }
  return context
}

export const ReconnectLedgerProvider = ({ children }: { children: React.ReactNode }) => {
  const [ledgerNetworks, setLedgerNetworks] = useState(new Set<LEDGER_NETWORK>())
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const prevStep = usePrevious(currentStep) || 0

  const backToPreviousStep = async () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
    else {
      navigate(-1)
    }
  }

  const moveToNextStep = () => {
    setCurrentStep(currentStep + 1)
  }

  const reconnectLedger = async (appType: LEDGER_NETWORK) => {
    // const unlocked = await isLedgerUnlocked(
    //   appType === LEDGER_NETWORK.ETH ? 'Ethereum' : 'Cosmos',
    // )
    // if (unlocked) {
    //   await getLedgerAccountDetails(appType)
    // }
  }

  const debouncedCurrentStep = useDebounce(currentStep, 100)

  return (
    <ReconnectLedgerContext.Provider
      value={{
        ledgerNetworks,
        setLedgerNetworks,
        prevStep,
        currentStep: debouncedCurrentStep,
        setCurrentStep,
        moveToNextStep,
        backToPreviousStep,
        reconnectLedger,
      }}
    >
      {children}
    </ReconnectLedgerContext.Provider>
  )
}
