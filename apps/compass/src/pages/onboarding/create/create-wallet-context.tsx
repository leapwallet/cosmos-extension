import { sleep } from '@leapwallet/cosmos-wallet-sdk'
import { useOnboarding } from 'hooks/onboarding/useOnboarding'
import { usePrevious } from 'hooks/utility/usePrevious'
import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { passwordStore } from 'stores/password-store'
import browser from 'webextension-polyfill'

export type CreateWalletContextType = {
  mnemonic: string
  onOnboardingCompleted: (password: Uint8Array) => void
  moveToStep: (step: number) => void
  moveToNextStep: (createType?: 'seed-phrase') => void
  backToPreviousStep: () => void
  currentStep: number
  prevStep: number
  totalSteps: number
  loading: boolean
  createType: 'seed-phrase'
}

export const CreateWalletContext = React.createContext<CreateWalletContextType | null>(null)

export const useCreateWalletContext = () => {
  const context = React.useContext(CreateWalletContext)
  if (!context) {
    throw new Error('useCreateWalletContext must be used within a CreateWalletProvider')
  }

  return context
}

export const CreateWalletProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate()

  const { mnemonic, onOnboardingComplete } = useOnboarding()

  const totalSteps = 3
  const createType = useRef<'seed-phrase'>('seed-phrase')

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const prevStep = usePrevious(currentStep) || 1

  const onOnboardingCompleted = async (password: Uint8Array) => {
    setLoading(true)
    const actualMnemonic = mnemonic

    await onOnboardingComplete(actualMnemonic, password, { 0: true }, 'create')

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

  const moveToNextStep = (type?: 'seed-phrase') => {
    if (type) {
      createType.current = type
    }

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
        moveToStep,
        backToPreviousStep,
        currentStep,
        totalSteps,
        loading,
        prevStep,
        createType: createType.current,
      }}
    >
      {children}
    </CreateWalletContext.Provider>
  )
}
