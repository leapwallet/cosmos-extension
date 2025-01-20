import { Buttons, ProgressBar } from '@leapwallet/leap-ui'
import ChoosePasswordView from 'components/choose-password-view'
import ExtensionPage from 'components/extension-page'
import { useOnboarding } from 'hooks/onboarding/useOnboarding'
import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { passwordStore } from 'stores/password-store'
import { Colors } from 'theme/colors'
import browser from 'webextension-polyfill'

import { ConfirmSecretPhraseView } from './ConfirmSecretPhraseView'
import { SeedPhraseView } from './SeedPhraseView'

export default observer(function OnboardingCreateWallet() {
  const { mnemonic, onOnboardingComplete } = useOnboarding()

  const [currentStep, setCurrentStep] = useState(1)
  const navigate = useNavigate()
  const totalSteps = 4

  const onOnboardingCompleted = async (password: Uint8Array) => {
    await onOnboardingComplete(mnemonic, password, { 0: true }, 'create')
    const passwordBase64 = Buffer.from(password).toString('base64')
    browser.runtime.sendMessage({ type: 'unlock', data: { password: passwordBase64 } })
    passwordStore.setPassword(password)
    navigate('/onboardingSuccess')
  }

  const moveToNextStep = () => {
    if (currentStep === 2 && passwordStore.password) {
      onOnboardingCompleted(passwordStore.password)
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const backToPreviousStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
    else {
      //Get Back to welcome screen
      navigate(-1)
    }
  }

  return (
    <ExtensionPage
      titleComponent={
        <div className='flex flex-row w-[836px] items-center justify-between align- w-[calc(100%-500px)]'>
          <Buttons.Back isFilled={true} onClick={backToPreviousStep} />
          <ProgressBar
            color={Colors.cosmosPrimary}
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
          <div />
        </div>
      }
    >
      {currentStep === 1 && <SeedPhraseView mnemonic={mnemonic} onProceed={moveToNextStep} />}
      {currentStep === 2 && (
        <ConfirmSecretPhraseView mnemonic={mnemonic} onProceed={moveToNextStep} />
      )}
      {currentStep === 3 && !passwordStore.password && (
        <ChoosePasswordView onProceed={onOnboardingCompleted} />
      )}
    </ExtensionPage>
  )
})
