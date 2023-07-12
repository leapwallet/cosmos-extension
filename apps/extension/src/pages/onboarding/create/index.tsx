import { Buttons, ProgressBar } from '@leapwallet/leap-ui'
import ChoosePasswordView from 'components/choose-password-view'
import ExtensionPage from 'components/extension-page'
import { useOnboarding } from 'hooks/onboarding/useOnboarding'
import { usePassword } from 'hooks/settings/usePassword'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Colors } from 'theme/colors'

import { ConfirmSecretPhraseView } from './ConfirmSecretPhraseView'
import { SeedPhraseView } from './SeedPhraseView'

export default function OnboardingCreateWallet() {
  const { mnemonic, onOnboardingComplete } = useOnboarding()
  const savedPassword = usePassword()

  const [currentStep, setCurrentStep] = useState(1)
  const navigate = useNavigate()
  const totalSteps = 4

  const onOnboardingCompleted = async (password: string) => {
    await onOnboardingComplete(mnemonic, password, { 0: true }, 'create')
    navigate('/onboardingSuccess')
  }

  const moveToNextStep = () => {
    if (currentStep === 2 && savedPassword) {
      onOnboardingCompleted(savedPassword)
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
      {currentStep === 3 && !savedPassword && (
        <ChoosePasswordView onProceed={onOnboardingCompleted} />
      )}
    </ExtensionPage>
  )
}
