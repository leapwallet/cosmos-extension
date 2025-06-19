import { sleep } from '@leapwallet/cosmos-wallet-sdk'
import { useOnboarding } from 'hooks/onboarding/useOnboarding'
import { usePrevious } from 'hooks/utility/usePrevious'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { passwordStore } from 'stores/password-store'
import browser from 'webextension-polyfill'

export type CreateWalletContextType = {
  mnemonic: string
  onOnboardingCompleted: (password: Uint8Array) => void
  moveToNextStep: () => void
  backToPreviousStep: () => void
  currentStep: number
  prevStep: number
  totalSteps: number
  loading: boolean
}

const CreateWalletContext = React.createContext<CreateWalletContextType | null>(null)

const totalSteps = 3

export const CreateWalletProvider = ({ children }: { children: React.ReactNode }) => {
  const { mnemonic, onOnboardingComplete } = useOnboarding()

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const prevStep = usePrevious(currentStep) || 1
  const navigate = useNavigate()

  const onOnboardingCompleted = async (password: Uint8Array) => {
    setLoading(true)

    await onOnboardingComplete(mnemonic, password, { 0: true }, 'create')

    const passwordBase64 = Buffer.from(password).toString('base64')
    browser.runtime.sendMessage({ type: 'unlock', data: { password: passwordBase64 } })
    passwordStore.setPassword(password)

    await sleep(2_000)

    navigate('/onboardingSuccess')
    setLoading(false)
  }

  const moveToStep = (step: number) => {
    if (step === totalSteps && passwordStore.password) {
      onOnboardingCompleted(passwordStore.password)
      return
    }

    if (step < 1) {
      navigate(-1)
      return
    }

    setCurrentStep(step)
  }

  const moveToNextStep = () => {
    moveToStep(currentStep + 1)
  }

  const backToPreviousStep = () => {
    moveToStep(currentStep - 1)
  }

  return (
    <CreateWalletContext.Provider
      value={{
        mnemonic,
        onOnboardingCompleted,
        moveToNextStep,
        backToPreviousStep,
        currentStep,
        prevStep,
        totalSteps,
        loading,
      }}
    >
      {children}
    </CreateWalletContext.Provider>
  )
}

export const useCreateWalletContext = () => {
  const context = React.useContext(CreateWalletContext)
  if (!context) {
    throw new Error('useCreateWalletContext must be used within a CreateWalletProvider')
  }

  return context
}
