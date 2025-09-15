import { AnimatePresence } from 'framer-motion'
import { LedgerDriveIcon } from 'icons/ledger-icon'
import { LEDGER_NETWORK } from 'pages/onboarding/import/import-wallet-context'
import React, { useCallback, useEffect, useState } from 'react'

import { HoldState } from './hold-state'
import { useReconnectLedgerContext } from './reconnect-ledger-context'
import { ledgerNetworkOptions } from './select-ledger-network'
import { ReconnectLedgerWrapper } from './wrapper'

export const ReconnectingLedger = () => {
  const [currentAppToImport, setCurrentAppToImport] = useState<LEDGER_NETWORK>()

  const [alreadyReconnected, setAlreadyReconnected] = useState<Set<LEDGER_NETWORK>>(new Set())

  const { moveToNextStep, ledgerNetworks, prevStep, currentStep, setCurrentStep } =
    useReconnectLedgerContext()

  useEffect(() => {
    const firstAppToImport = ledgerNetworkOptions.find((network) => ledgerNetworks.has(network.id))
    if (firstAppToImport) {
      setAlreadyReconnected((prev) => prev.add(firstAppToImport.id))
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
          !alreadyReconnected.has(network.id) &&
          ledgerNetworks.has(network.id),
      )
      if (nextAppToImport) {
        setAlreadyReconnected((prev) => prev.add(nextAppToImport.id))
        setCurrentAppToImport(nextAppToImport.id)
      } else {
        setCurrentAppToImport(undefined)
        moveToNextStep()
      }
    },
    [alreadyReconnected, ledgerNetworks, moveToNextStep],
  )

  if (ledgerNetworks.size > 0 && currentAppToImport) {
    return (
      <ReconnectLedgerWrapper heading='' entry={prevStep <= currentStep ? 'right' : 'left'}>
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
      </ReconnectLedgerWrapper>
    )
  }
}
