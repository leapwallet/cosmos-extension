import { AnimatePresence, motion } from 'framer-motion'
import { LedgerDriveIcon } from 'icons/ledger-icon'
import { onboardingWrapperVariants } from 'pages/onboarding/wrapper'
import React, { useCallback, useEffect, useState } from 'react'

import { LEDGER_NETWORK, useImportWalletContext } from '../import-wallet-context'
import { HoldState } from './hold-state'
import { ledgerNetworkOptions } from './select-ledger-network'

export const ImportingLedgerAccounts = () => {
  const [currentAppToImport, setCurrentAppToImport] = useState<LEDGER_NETWORK>()

  const [alreadyImported, setAlreadyImported] = useState<Set<LEDGER_NETWORK>>(new Set())

  const { moveToNextStep, ledgerNetworks, setCurrentStep, currentStep, prevStep } =
    useImportWalletContext()

  useEffect(() => {
    const firstAppToImport = ledgerNetworkOptions.find((network) => ledgerNetworks.has(network.id))
    if (firstAppToImport) {
      setAlreadyImported((prev) => prev.add(firstAppToImport.id))
      setCurrentAppToImport(firstAppToImport.id)
    } else {
      setCurrentStep((prev) => prev - 1)
    }
  }, [])

  const moveToNextApp = useCallback(
    (appType: LEDGER_NETWORK) => {
      const nextAppToImport = ledgerNetworkOptions.find(
        (network) =>
          network.id !== appType &&
          !alreadyImported.has(network.id) &&
          ledgerNetworks.has(network.id),
      )
      if (nextAppToImport) {
        setAlreadyImported((prev) => prev.add(nextAppToImport.id))
        setCurrentAppToImport(nextAppToImport.id)
      } else {
        setCurrentAppToImport(undefined)
        moveToNextStep()
      }
    },
    [alreadyImported, ledgerNetworks, moveToNextStep],
  )

  if (ledgerNetworks.size > 0 && currentAppToImport) {
    return (
      <motion.div
        className='flex flex-col items-stretch w-full h-full gap-7'
        variants={onboardingWrapperVariants}
        initial={prevStep <= currentStep ? 'fromRight' : 'fromLeft'}
        animate='animate'
        exit='exit'
      >
        <AnimatePresence mode='wait' initial={false} presenceAffectsLayout>
          <HoldState
            key={`hold-state-${currentAppToImport}`}
            title={`Open ${
              currentAppToImport === LEDGER_NETWORK.ETH ? 'Ethereum' : 'Cosmos'
            } app on your ledger`}
            Icon={LedgerDriveIcon}
            appType={currentAppToImport}
            moveToNextApp={moveToNextApp}
          />
        </AnimatePresence>
      </motion.div>
    )
  }
}
