import ChoosePasswordView from 'components/choose-password-view'
import { AnimatePresence } from 'framer-motion'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { passwordStore } from 'stores/password-store'

import { ConfirmSecretPhrase } from './ConfirmSecretPhraseView'
import { CreateWalletProvider, useCreateWalletContext } from './create-wallet-context'
import { CreatingWalletLoader } from './creating-wallet-loader'
import { CreateWalletLayout } from './layout'
import { SeedPhraseView } from './SeedPhraseView'
import { SelectCreateWalletType } from './select-create-wallet-type'

const OnboardingCreateWalletView = () => {
  const { mnemonic, onOnboardingCompleted, moveToNextStep, currentStep, loading, prevStep } =
    useCreateWalletContext()

  return (
    <AnimatePresence mode='wait' presenceAffectsLayout>
      {loading && <CreatingWalletLoader key='creating-wallet-loader' />}

      {currentStep === 0 && !loading && <SelectCreateWalletType />}

      {currentStep === 1 && !loading && (
        <SeedPhraseView key='seed-phrase-view' mnemonic={mnemonic} onProceed={moveToNextStep} />
      )}

      {currentStep === 2 && !loading && (
        <ConfirmSecretPhrase
          key='confirm-secret-phrase-view'
          mnemonic={mnemonic}
          onProceed={moveToNextStep}
        />
      )}

      {currentStep === 3 && !loading && !passwordStore.password && (
        <ChoosePasswordView
          entry={prevStep <= currentStep ? 'right' : 'left'}
          key='choose-password-view'
          onProceed={onOnboardingCompleted}
        />
      )}
    </AnimatePresence>
  )
}

const OnboardingCreateWallet = observer(() => (
  <CreateWalletProvider>
    <CreateWalletLayout>
      <OnboardingCreateWalletView />
    </CreateWalletLayout>
  </CreateWalletProvider>
))

export default OnboardingCreateWallet
