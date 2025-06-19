import { Key, useChainsStore } from '@leapwallet/cosmos-wallet-hooks'
import { importLedgerAccountV2, SupportedChain } from '@leapwallet/cosmos-wallet-sdk'
import { WALLETTYPE } from '@leapwallet/cosmos-wallet-store'
import { Keystore } from '@leapwallet/leap-keychain'
import { KEYSTORE } from 'config/storage-keys'
import { AnimatePresence } from 'framer-motion'
import useActiveWallet from 'hooks/settings/useActiveWallet'
import { LedgerDriveIcon } from 'icons/ledger-drive-icon'
import { observer } from 'mobx-react-lite'
import { CreatingWalletLoader } from 'pages/onboarding/create/creating-wallet-loader'
import { LEDGER_NETWORK } from 'pages/onboarding/import/import-wallet-context'
import { OnboardingLayout } from 'pages/onboarding/layout'
import React, { useCallback, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { cn } from 'utils/cn'
import { getLedgerEnabledEvmChainsKey } from 'utils/getLedgerEnabledEvmChains'
import Browser from 'webextension-polyfill'

import { HoldState } from './hold-state'

const ImportLedgerView = () => {
  const [searchParams] = useSearchParams()

  const { chains } = useChainsStore()

  const getLedgerAccountDetails = async (app: LEDGER_NETWORK) => {
    const primaryChain = app === LEDGER_NETWORK.ETH ? 'ethereum' : 'cosmos'
    const defaultIndexes = [0, 1, 2, 3, 4]
    const ledgerEnabledEvmChains = getLedgerEnabledEvmChainsKey(Object.values(chains))
    const chainsToImport = app === LEDGER_NETWORK.ETH ? ledgerEnabledEvmChains : []
    const chainInfos = {} as Record<
      SupportedChain,
      { addressPrefix: string; enabled: boolean; coinType: string }
    >

    for (const chainEntry of Object.entries(chains)) {
      const [chain, chainInfo] = chainEntry
      chainInfos[chain as SupportedChain] = {
        addressPrefix: chainInfo.addressPrefix,
        enabled: chainInfo.enabled,
        coinType: chainInfo.bip44.coinType,
      }
    }

    const { pathWiseAddresses } = await importLedgerAccountV2(app, defaultIndexes, undefined, {
      primaryChain,
      chainsToImport,
      chainInfos,
    })

    return pathWiseAddresses
  }

  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const app = searchParams.get('app')

  const { activeWallet, setActiveWallet } = useActiveWallet()

  const importComplete = useCallback(
    async (
      addresses: Record<
        string,
        Record<
          string,
          {
            address: string
            pubKey: Uint8Array
          }
        >
      >,
    ) => {
      setIsLoading(true)
      if (!activeWallet || !addresses) throw new Error('Unable to import ledger wallet')
      const store = await Browser.storage.local.get('keystore')

      const keystore: Keystore<SupportedChain> = store[KEYSTORE]
      if (!keystore) throw new Error('Unable to import ledger wallet')

      const existingLedgerWallets = Object.values(keystore).filter(
        (key) => key.walletType === WALLETTYPE.LEDGER,
      )
      const newKeystore = keystore

      for (const ledgerWallet of existingLedgerWallets) {
        const path =
          (ledgerWallet as Key)?.path ||
          (ledgerWallet.addressIndex?.toString()?.length === 1
            ? `0'/0/${ledgerWallet.addressIndex}`
            : ledgerWallet.addressIndex?.toString())
        const addressesForPath = addresses?.[path] ?? {}
        const newAddresses: Record<string, string> = {}
        const newPubKeys: Record<string, string> = {}

        Object.keys(addressesForPath).forEach((chain) => {
          const address = addressesForPath[chain]
          newAddresses[chain] = address.address
          newPubKeys[chain] = Buffer.from(address.pubKey).toString('base64')
        })

        const newWallet = {
          ...ledgerWallet,
          addresses: {
            ...ledgerWallet.addresses,
            ...newAddresses,
          },
          pubKeys: {
            ...(ledgerWallet.pubKeys as Record<SupportedChain, string>),
            ...newPubKeys,
          },
        }

        newKeystore[ledgerWallet.id] = newWallet
      }

      const newActiveWallet = newKeystore[activeWallet.id]

      await Browser.storage.local.set({ keystore: newKeystore, 'active-wallet': newActiveWallet })
      setActiveWallet(newActiveWallet)
      navigate('/onboardingSuccess')
    },
    [activeWallet, navigate, setActiveWallet],
  )

  const currentAppToImport = (app === 'EVM' ? 'eth' : app)?.toLowerCase() as LEDGER_NETWORK

  return (
    <AnimatePresence mode='wait' presenceAffectsLayout>
      {currentAppToImport && !isLoading && (
        <HoldState
          key={`hold-state-${currentAppToImport}`}
          title={`Open ${
            currentAppToImport === LEDGER_NETWORK.ETH ? 'Ethereum' : 'Cosmos'
          } app on your ledger`}
          Icon={LedgerDriveIcon}
          appType={currentAppToImport}
          moveToNextApp={importComplete}
          getLedgerAccountDetails={getLedgerAccountDetails}
        />
      )}
      {isLoading && (
        <CreatingWalletLoader title={`Importing ${app} wallets`} key='creating-wallet-loader' />
      )}

      {/* {currentStepName === 'importing-ledger-accounts' && (
        <ImportingLedgerAccounts key={'importing-ledger-accounts-view'} />
      )} */}
    </AnimatePresence>
  )
}

export const ImportLedgerLayout = (props: React.PropsWithChildren<{ className?: string }>) => {
  return (
    <OnboardingLayout
      className={cn(
        'flex flex-col items-stretch gap-7 p-7 overflow-auto border-secondary-300 relative',
        props.className,
      )}
    >
      {props.children}
    </OnboardingLayout>
  )
}

const ImportLedger = () => (
  <ImportLedgerLayout>
    <ImportLedgerView />
  </ImportLedgerLayout>
)

export default observer(ImportLedger)
