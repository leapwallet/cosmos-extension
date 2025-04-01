import { sleep } from '@leapwallet/cosmos-wallet-sdk'
import { useOnboarding } from 'hooks/onboarding/useOnboarding'
import { usePrevious } from 'hooks/utility/usePrevious'
import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { passwordStore } from 'stores/password-store'
import browser from 'webextension-polyfill'

import { useWeb3Login } from '../use-social-login'

export type CreateWalletContextType = {
  mnemonic: string
  onOnboardingCompleted: (password: Uint8Array) => void
  moveToStep: (step: number) => void
  moveToNextStep: (createType?: 'social' | 'seed-phrase') => void
  backToPreviousStep: () => void
  currentStep: number
  prevStep: number
  totalSteps: number
  loading: boolean
  createType: 'social' | 'seed-phrase'
  socialLogin: ReturnType<typeof useWeb3Login>
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

  const { mnemonic, onOnboardingComplete, socialLogin } = useOnboarding()

  const totalSteps = 3
  const createType = useRef<'social' | 'seed-phrase'>('seed-phrase')

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const prevStep = usePrevious(currentStep) || 1

  const onOnboardingCompleted = async (password: Uint8Array) => {
    setLoading(true)
    let actualMnemonic = mnemonic
    let type: 'create' | 'create-social' = 'create'
    let email = ''

    if (createType.current === 'social') {
      const privateKey = await socialLogin.getPrivateKey()
      if (!privateKey) {
        throw new Error('Private key not found')
      }

      const userInfo = await socialLogin.getUserInfo()
      email = userInfo?.email || ''

      actualMnemonic = privateKey
      type = 'create-social'
    }

    await onOnboardingComplete(actualMnemonic, password, { 0: true }, type, email)

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

  const moveToNextStep = (type?: 'social' | 'seed-phrase') => {
    if (type) {
      createType.current = type
    }

    if (type === 'social') {
      moveToStep(3)
      return
    }

    moveToStep(currentStep + 1)
  }

  const backToPreviousStep = () => {
    if (createType.current === 'social') {
      if (currentStep === 0) {
        navigate(-1)
        return
      }

      moveToStep(0)
      return
    }

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
        socialLogin,
      }}
    >
      {children}
    </CreateWalletContext.Provider>
  )
}
