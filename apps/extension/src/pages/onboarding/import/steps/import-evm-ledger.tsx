import {
  useActiveChain,
  useActiveWallet,
  useChainsStore,
  WALLETTYPE,
} from '@leapwallet/cosmos-wallet-hooks'
import {
  importLedgerAccount,
  isLedgerUnlocked,
  SupportedChain,
} from '@leapwallet/cosmos-wallet-sdk'
import { Keystore } from '@leapwallet/leap-keychain'
import { CheckCircle } from '@phosphor-icons/react/dist/ssr'
import { captureException } from '@sentry/react'
import { Button } from 'components/ui/button'
import { KEYSTORE } from 'config/storage-keys'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import { LedgerDriveIcon } from 'icons/ledger-drive-icon'
import { Images } from 'images'
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLedgerEnabledEvmChainsKey } from 'utils/getLedgerEnabledEvmChains'
import Browser from 'webextension-polyfill'

import useActiveWalletExt from '../../../../hooks/settings/useActiveWallet'
import { OnboardingWrapper } from '../../wrapper'
import { LEDGER_CONNECTION_STEP } from '../types'
import { ledgerImgTransition, walletCableVariants, walletUsbVariants } from './import-ledger'

const stepsData = [
  {
    description: 'Unlock Ledger & connect to your device via USB',
  },
  {
    description: 'Select networks & choose wallets to import',
  },
]

type ChainWiseAddresses = Record<string, { address: string; pubKey: Uint8Array }[]>

const entry = 'right'

export const ImportEvmLedger = () => {
  const [error, setError] = useState('')
  const [status, setLedgerConnectionStatus] = useState(LEDGER_CONNECTION_STEP.step0)

  const activeWallet = useActiveWallet()
  const activeChain = useActiveChain()
  const { chains } = useChainsStore()
  const { setActiveWallet } = useActiveWalletExt()
  const navigate = useNavigate()

  const ledgerEnabledEvmChains = useMemo(() => {
    return getLedgerEnabledEvmChainsKey(Object.values(chains))
  }, [chains])

  const getLedgerAccountDetails = async () => {
    if (
      chains[activeChain].bip44.coinType !== '60' ||
      ledgerEnabledEvmChains.includes(activeChain) === false
    ) {
      throw new Error(`Import Error: Ledger is not supported on ${chains[activeChain].chainName}`)
    }

    if (!activeWallet) {
      throw new Error('Import Error: No active wallet found')
    }

    const useEvmApp = true
    const addressIndex = String(activeWallet.addressIndex)
    const isCustomDerivationPathWallet = addressIndex?.includes("'")

    const { chainWiseAddresses } = await importLedgerAccount(
      isCustomDerivationPathWallet ? [] : [0, 1, 2, 3, 4],
      useEvmApp,
      activeChain,
      ledgerEnabledEvmChains,
      chains,
      isCustomDerivationPathWallet ? [addressIndex] : [],
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

      for (const chain of ledgerEnabledEvmChains) {
        if (chainWiseAddresses[chain] && !ledgerWallet.addresses[chain]) {
          const account = chainWiseAddresses[chain][ledgerWallet.addressIndex]

          newAddresses[chain] = account.address
          newPubKeys[chain] = Buffer.from(account.pubKey).toString('base64')
        }
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

      const chainWiseAddresses = await getLedgerAccountDetails()
      await confirmImport(chainWiseAddresses)
      setLedgerConnectionStatus(LEDGER_CONNECTION_STEP.step3)
    } catch (error) {
      captureException(error)
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
    <OnboardingWrapper
      headerIcon={<LedgerDriveIcon className='size-6' />}
      heading='Connect your Ledger'
      entry={entry}
    >
      {/* fixed height is hardcoded to avoid layout shift from transitions */}
      <div className='flex flex-col gap-4 w-full relative h-[301px]'>
        {stepsData.map((d, index) => (
          <div
            key={index}
            className='bg-secondary-200 py-4 px-5 w-full rounded-xl text-sm font-medium flex items-center gap-4'
          >
            <CheckCircle weight='bold' className='size-5 shrink-0 text-muted-foreground' />
            {d.description}
          </div>
        ))}
        <div className='-mx-7 mt-7 flex items-center justify-between'>
          <AnimatePresence>
            <motion.img
              width={446}
              height={77}
              src={Images.Misc.HardwareWalletConnectCable}
              alt='Hardware Wallet Connect Cable'
              className='w-2/5'
              transition={ledgerImgTransition}
              variants={entry === 'right' ? walletCableVariants : undefined} // disable animation for backward entry
              initial='hidden'
              animate='visible'
            />
            <motion.img
              width={446}
              height={77}
              src={Images.Misc.HardwareWalletConnectUsb}
              alt='Hardware Wallet Connect USB'
              className='w-3/5'
              transition={ledgerImgTransition}
              variants={entry === 'right' ? walletUsbVariants : undefined} // disable animation for backward entry
              initial='hidden'
              animate='visible'
            />
          </AnimatePresence>
        </div>
      </div>

      <Button
        className={'w-full mt-auto'}
        disabled={status === LEDGER_CONNECTION_STEP.step2}
        onClick={importLedger}
      >
        {status === LEDGER_CONNECTION_STEP.step2 ? 'Looking for device...' : 'Continue'}
      </Button>
    </OnboardingWrapper>
  )
}
