import ChoosePasswordView from 'components/choose-password-view'
import { AnimatePresence } from 'framer-motion'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { passwordStore } from 'stores/password-store'

import { CreateWalletProvider, useCreateWalletContext } from './create-wallet-context'
import { CreatingWalletLoader } from './creating-wallet-loader'
import { CreateWalletLayout } from './layout'
import { ConfirmSecretPhrase } from './steps/confirm-secret-phrase'
import { SeedPhrase } from './steps/seed-phrase'

const OnboardingCreateWalletView = observer(function OnboardingCreateWallet() {
  const { onOnboardingCompleted, currentStep, loading, prevStep } = useCreateWalletContext()

  return (
    <AnimatePresence mode='wait' presenceAffectsLayout>
      {loading && <CreatingWalletLoader key='creating-wallet-loader' />}

      {currentStep === 1 && !loading && <SeedPhrase key='seed-phrase-view' />}

      {currentStep === 2 && !loading && <ConfirmSecretPhrase key='confirm-secret-phrase-view' />}

      {currentStep === 3 && !loading && !passwordStore.password && (
        <ChoosePasswordView
          entry={prevStep <= currentStep ? 'right' : 'left'}
          key='choose-password-view'
          onProceed={onOnboardingCompleted}
        />
      )}
    </AnimatePresence>
  )
})

const OnboardingCreateWallet = observer(() => (
  <CreateWalletProvider>
    <CreateWalletLayout>
      <OnboardingCreateWalletView />
    </CreateWalletLayout>
  </CreateWalletProvider>
))

export default OnboardingCreateWallet
