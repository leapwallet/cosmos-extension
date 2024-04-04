import { useActiveChain, useActiveWallet, useChainsStore } from '@leapwallet/cosmos-wallet-hooks'
import {
  importLedgerAccount,
  isLedgerUnlocked,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { Keystore, WALLETTYPE } from '@leapwallet/leap-keychain'
import { Buttons } from '@leapwallet/leap-ui'
import ExtensionPage from 'components/extension-page'
import { LEDGER_ENABLED_EVM_CHAINS } from 'config/config'
import { KEYSTORE } from 'config/storage-keys'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import Browser from 'webextension-polyfill'

import useActiveWalletExt from '../../../hooks/settings/useActiveWallet'
import ImportLedgerView from './ImportLedgerView'
import { LEDGER_CONNECTION_STEP } from './types'

type ChainWiseAddresses = Record<string, { address: string; pubKey: Uint8Array }[]>

export function AddEvmLedger() {
  const [error, setError] = useState('')
  const [ledgerConnectionStatus, setLedgerConnectionStatus] = useState(LEDGER_CONNECTION_STEP.step0)
  const [accountInfo, setAccountInfo] = useState<ChainWiseAddresses>()

  const activeWallet = useActiveWallet()
  const activeChain = useActiveChain()
  const { chains } = useChainsStore()
  const { setActiveWallet } = useActiveWalletExt()
  const navigate = useNavigate()

  const getEvmLedgerAccountDetails = async () => {
    if (
      chains[activeChain].bip44.coinType !== '60' ||
      LEDGER_ENABLED_EVM_CHAINS.includes(activeChain) === false
    ) {
      throw new Error(`Import Error: Ledger is not supported on ${chains[activeChain].chainName}`)
    }

    if (!activeWallet) {
      throw new Error('Import Error: No active wallet found')
    }
    const useEvmApp = true
    const { chainWiseAddresses } = await importLedgerAccount(
      [0, 1, 2, 3, 4],
      useEvmApp,
      activeChain,
      LEDGER_ENABLED_EVM_CHAINS,
    )

    return { chainWiseAddresses }
  }

  const confirmImport = async ({
    chainWiseAddresses,
  }: {
    chainWiseAddresses: ChainWiseAddresses
  }) => {
    if (!activeWallet) throw new Error('Unable to import ledger wallet')
    const store = await Browser.storage.local.get('keystore')
    const keystore: Keystore<SupportedChain> = store[KEYSTORE]
    if (!keystore) throw new Error('Unable to import ledger wallet')
    const ledgerWallets = Object.values(keystore).filter(
      (key) => key.walletType === WALLETTYPE.LEDGER,
    )
    const newKeystore = keystore

    for (const ledgerWallet of ledgerWallets) {
      const newAddresses: Record<string, string> = {}
      const newPubKeys: Record<string, string> = {}

      for (const chain of LEDGER_ENABLED_EVM_CHAINS) {
        const account = chainWiseAddresses[chain][ledgerWallet.addressIndex]
        newAddresses[chain] = account.address
        newPubKeys[chain] = Buffer.from(account.pubKey).toString('base64')
      }
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
    navigate('/home')
  }

  const importLedger = async () => {
    try {
      setError('')
      setLedgerConnectionStatus(LEDGER_CONNECTION_STEP.step2)
      const chainWiseAddresses = await getEvmLedgerAccountDetails()
      await confirmImport(chainWiseAddresses)
      setLedgerConnectionStatus(LEDGER_CONNECTION_STEP.step3)
    } catch {
      setLedgerConnectionStatus(LEDGER_CONNECTION_STEP.step1)
    }
  }

  useEffect(() => {
    let timeout: NodeJS.Timeout
    const fn = async () => {
      const unlocked = await isLedgerUnlocked('Ethereum')
      if (unlocked) {
        setLedgerConnectionStatus(LEDGER_CONNECTION_STEP.step1)
        clearTimeout(timeout)
      } else {
        timeout = setTimeout(async () => {
          await fn()
        }, 1000)
      }
    }
    fn()
  }, [])
  return (
    <ExtensionPage
      titleComponent={
        <div className='flex flex-row w-[836px] items-center justify-between align-'>
          <Buttons.Back isFilled={true} onClick={() => navigate('/home')} />
          <div />
        </div>
      }
    >
      <div>
        <ImportLedgerView
          retry={importLedger}
          error={error}
          onNext={importLedger}
          onSkip={() => navigate('/home')}
          status={ledgerConnectionStatus}
          isEvmLedger={true}
        />
      </div>
    </ExtensionPage>
  )
}
