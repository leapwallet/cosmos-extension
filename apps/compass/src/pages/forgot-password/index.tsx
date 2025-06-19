import { ArrowLeft } from '@phosphor-icons/react'
import { Button } from 'components/ui/button'
import { AnimatePresence } from 'framer-motion'
import { observer } from 'mobx-react-lite'
import React from 'react'

import { ForgotPasswordContextProvider, useForgotPasswordContext } from './context'
import Disclaimer from './screens/disclaimer'
import RequireSeedPhrase from './screens/requireSeedPhrase'
import SelectWallets from './screens/select-wallets'
import SetPassword from './screens/setPassword'

const ForgotPasswordView = observer(() => {
  const {
    processStep,
    incrementStep,
    decrementStep,
    onSubmit,
    walletAccounts,
    selectedIds,
    setSelectedIds,
    setMnemonic,
    loading,
  } = useForgotPasswordContext()

  return (
    <div className='p-5 flex flex-col h-full'>
      <header>
        <Button variant='ghost' size='icon' onClick={decrementStep}>
          <ArrowLeft className='size-4' />
        </Button>
      </header>

      <AnimatePresence mode='wait' presenceAffectsLayout>
        {processStep === 1 && <Disclaimer key={'Disclaimer'} incrementStep={incrementStep} />}

        {processStep === 2 && (
          <RequireSeedPhrase
            key={'RequireSeedPhrase'}
            incrementStep={incrementStep}
            setMnemonicAtRoot={setMnemonic}
          />
        )}
        {processStep === 3 && (
          <SelectWallets
            key={'SelectWallets'}
            accountsData={walletAccounts}
            onProceed={incrementStep}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
          />
        )}
        {processStep === 4 && (
          <SetPassword key={'SetPassword'} resetPassword={onSubmit} loading={loading} />
        )}
      </AnimatePresence>
    </div>
  )
})

const ForgotPassword = () => {
  return (
    <ForgotPasswordContextProvider>
      <ForgotPasswordView />
    </ForgotPasswordContextProvider>
  )
}

export default ForgotPassword
