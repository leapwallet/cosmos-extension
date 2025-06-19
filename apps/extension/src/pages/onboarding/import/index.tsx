import ChoosePasswordView from 'components/choose-password-view'
import { AnimatePresence } from 'framer-motion'
import { observer } from 'mobx-react-lite'
import React from 'react'

import { CreatingWalletLoader } from '../create/creating-wallet-loader'
import { ImportWalletProvider, useImportWalletContext } from './import-wallet-context'
import { ImportWalletLayout } from './layout'
import { ImportLedger } from './steps/import-ledger'
import { ImportingLedgerAccounts } from './steps/importing-ledger-accounts'
import { PrivateKey } from './steps/private-key'
import { SeedPhrase } from './steps/seed-phrase'
import { SelectImportType } from './steps/select-import-type'
import { SelectLedgerNetwork } from './steps/select-ledger-network'
import { SelectLedgerWallet } from './steps/select-ledger-wallet'
import { SelectWallet } from './steps/select-wallet'
import { ImportWatchWallet } from './steps/watch-wallet'

const OnboardingImportWalletView = () => {
  const { currentStepName, onOnboardingCompleted, prevStep, currentStep } = useImportWalletContext()

  return (
    <AnimatePresence mode='wait' presenceAffectsLayout>
      {currentStepName === 'loading' && <CreatingWalletLoader key='creating-wallet-loader' />}

      {currentStepName === 'select-import-type' && <SelectImportType key={'select-import-type'} />}

      {currentStepName === 'seed-phrase' && <SeedPhrase key={'seed-phrase-view'} />}

      {currentStepName === 'private-key' && <PrivateKey key={'private-key-view'} />}

      {currentStepName === 'import-ledger' && <ImportLedger key={'import-ledger-view'} />}

      {currentStepName === 'select-ledger-network' && (
        <SelectLedgerNetwork key={'select-ledger-network-view'} />
      )}

      {currentStepName === 'import-watch-wallet' && (
        <ImportWatchWallet key={'import-watch-wallet-view'} />
      )}

      {currentStepName === 'select-wallet' && <SelectWallet key={'select-wallet-view'} />}

      {currentStepName === 'importing-ledger-accounts' && (
        <ImportingLedgerAccounts key={'importing-ledger-accounts-view'} />
      )}

      {currentStepName === 'select-ledger-wallet' && (
        <SelectLedgerWallet key={'select-ledger-wallet-view'} />
      )}

      {currentStepName === 'choose-password' && (
        <ChoosePasswordView
          key={'choose-password-view'}
          onProceed={onOnboardingCompleted}
          entry={prevStep <= currentStep ? 'right' : 'left'}
        />
      )}
    </AnimatePresence>
  )
}

const OnboardingImportWallet = () => (
  <ImportWalletProvider>
    <ImportWalletLayout>
      <OnboardingImportWalletView />
    </ImportWalletLayout>
  </ImportWalletProvider>
)

export default observer(OnboardingImportWallet)
