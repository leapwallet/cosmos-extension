import { sleep } from '@leapwallet/cosmos-wallet-sdk'
import { KeyChain } from '@leapwallet/leap-keychain'
import { AuthContextType, useAuth } from 'context/auth-context'
import { Addresses, WalletAccount } from 'hooks/onboarding/types'
import { useOnboarding } from 'hooks/onboarding/useOnboarding'
import useQuery from 'hooks/useQuery'
import usePrevious from 'hooks/utility/usePrevious'
import { Wallet } from 'hooks/wallet/useWallet'
import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { passwordStore } from 'stores/password-store'
import correctMnemonic from 'utils/correct-mnemonic'
import { hasMnemonicWallet } from 'utils/hasMnemonicWallet'
import browser from 'webextension-polyfill'

import { LEDGER_CONNECTION_STEP } from './types'

type StepName =
  | 'seed-phrase'
  | 'private-key'
  | 'loading'
  | 'select-import-type'
  | 'select-ledger-network'
  | 'import-ledger'
  | 'select-ledger-wallet'
  | 'select-wallet'
  | 'choose-password'
  | 'onboarding-success'
  | 'import-watch-wallet'
  | 'importing-ledger-accounts'

export type ImportWalletType =
  | 'seed-phrase'
  | 'private-key'
  | 'ledger'
  | 'watch-wallet'
  | 'evm-ledger'

export enum LEDGER_NETWORK {
  COSMOS = 'cosmos',
  ETH = 'eth',
}

export type ImportWalletContextType = {
  prevStep: number
  currentStep: number
  setCurrentStep: Dispatch<SetStateAction<number>>
  totalSteps: number
  loading: boolean
  setLoading: Dispatch<SetStateAction<boolean>>
  importWalletFromSeedPhrase: () => Promise<void>
  importLedger: (fn: (flag: boolean) => Promise<void>) => Promise<void>
  backToPreviousStep: () => void
  moveToNextStep: () => void
  onOnboardingCompleted: (password: Uint8Array) => void
  privateKeyError: string
  setPrivateKeyError: Dispatch<SetStateAction<string>>
  ledgerConnectionStatus: LEDGER_CONNECTION_STEP
  setLedgerConnectionStatus: Dispatch<SetStateAction<LEDGER_CONNECTION_STEP>>
  secret: string
  setSecret: Dispatch<SetStateAction<string>>
  watchWalletAddress: string
  setWatchWalletAddress: Dispatch<SetStateAction<string>>
  watchWalletName: string
  setWatchWalletName: Dispatch<SetStateAction<string>>
  selectedIds: { [id: string]: boolean }
  setSelectedIds: Dispatch<SetStateAction<{ [id: string]: boolean }>>
  walletName: ImportWalletType
  setWalletName: Dispatch<SetStateAction<ImportWalletType>>
  walletAccounts?: WalletAccount[]
  customWalletAccounts?: WalletAccount[]
  setWalletAccounts: Dispatch<SetStateAction<WalletAccount[] | undefined>>
  getLedgerAccountDetails: (app: LEDGER_NETWORK) => Promise<void>
  getLedgerAccountDetailsForIdxs: (app: LEDGER_NETWORK, idxs: number[]) => Promise<void>
  getCustomLedgerAccountDetails: (
    app: LEDGER_NETWORK,
    customDerivationPath: string,
    name: string,
    existingAddresses: string[] | undefined,
  ) => Promise<void>
  currentStepName: StepName
  ledgerNetworks: Set<LEDGER_NETWORK>
  setLedgerNetworks: Dispatch<SetStateAction<Set<LEDGER_NETWORK>>>
  addresses: Addresses | undefined
  setAddresses: (_addresses: Addresses) => void
}

const ImportWalletContext = createContext<ImportWalletContextType | null>(null)

const getStepName = (config: {
  currentStep: number
  walletName: ImportWalletType
  loading: boolean
}): StepName => {
  const { currentStep, walletName, loading } = config

  if (loading) {
    return 'loading'
  }

  if (currentStep === 0) {
    return 'select-import-type'
  }

  if (currentStep === 1 && walletName === 'seed-phrase') {
    return 'seed-phrase'
  }

  if (currentStep === 1 && walletName === 'private-key') {
    return 'private-key'
  }

  const isLedger = walletName === 'ledger' || walletName === 'evm-ledger'

  if (isLedger) {
    switch (currentStep) {
      case 1:
        return 'import-ledger'
      case 2:
        return 'select-ledger-network'
      case 3:
        return 'importing-ledger-accounts'
      case 4:
        return 'select-ledger-wallet'
      default:
        return 'choose-password'
    }
  }

  if (currentStep === 1 && walletName === 'watch-wallet') {
    return 'import-watch-wallet'
  }

  if (currentStep === 2 && (walletName === 'watch-wallet' || walletName === 'private-key')) {
    return 'choose-password'
  }

  if (currentStep === 2) {
    return 'select-wallet'
  }

  if (currentStep === 3) {
    return 'choose-password'
  }

  return 'onboarding-success'
}

export const ImportWalletProvider = ({ children }: { children: React.ReactNode }) => {
  const { noAccount } = useAuth() as AuthContextType
  const query = useQuery()

  const [secret, setSecret] = useState('')
  const [watchWalletAddress, setWatchWalletAddress] = useState('')
  const [watchWalletName, setWatchWalletName] = useState('')
  const [walletName, setWalletName] = useState<ImportWalletType>('seed-phrase')
  const [selectedIds, setSelectedIds] = useState<{ [id: number]: boolean }>({})
  const [loading, setLoading] = useState(false)

  const [ledgerConnectionStatus, setLedgerConnectionStatus] = useState(LEDGER_CONNECTION_STEP.step0)
  const [privateKeyError, setPrivateKeyError] = useState('')
  const [existingAddresses, setExistingAddresses] = useState<string[] | undefined>(undefined)
  const [currentStep, setCurrentStep] = useState(0)
  const prevStep = usePrevious(currentStep) || 0

  const navigate = useNavigate()
  const isLedger = ['ledger', 'evm-ledger'].includes(walletName || '')
  const isMetamask = walletName?.toLowerCase().includes('metamask')
  const isOtherEvmWallets = walletName?.toLowerCase().includes('evm wallets')
  const isPrivateKey =
    walletName?.toLowerCase().includes('private') || isMetamask || isOtherEvmWallets

  const [ledgerNetworks, setLedgerNetworks] = useState(new Set<LEDGER_NETWORK>())
  const totalSteps = isLedger ? 4 : 3
  const currentStepName = getStepName({ currentStep, walletName, loading })

  const {
    walletAccounts,
    addresses,
    customWalletAccounts,
    setWalletAccounts,
    getAccountDetails,
    getLedgerAccountDetails,
    onOnboardingComplete,
    onBoardingCompleteLedger,
    getLedgerAccountDetailsForIdxs,
    getCustomLedgerAccountDetails,
    setAddresses,
  } = useOnboarding()
  const saveWatchWallet = Wallet.useSaveWatchWallet()

  const navigateToSuccess = async (delay = true) => {
    if (!noAccount) {
      return navigate('/home', { state: { from: location } })
    }

    if (!delay) {
      return navigate('/onboardingSuccess')
    }

    await sleep(2_000)

    navigate('/onboardingSuccess')
  }

  const onOnboardingCompleted = async (password: Uint8Array) => {
    try {
      setLoading(true)
      if (isLedger) {
        await onBoardingCompleteLedger(
          password,
          Object.entries(selectedIds)
            .filter(([, selected]) => selected)
            .map(([id]) => id),
          existingAddresses ?? [],
        )
      } else if (walletName === 'watch-wallet' && watchWalletAddress && watchWalletName) {
        await saveWatchWallet(watchWalletAddress, watchWalletName, password)
      } else {
        const onBoardingSelectedIds = isPrivateKey ? { 0: true } : selectedIds
        await onOnboardingComplete(secret, password, onBoardingSelectedIds, 'import')
      }

      if (!passwordStore.password) {
        await moveToNextStep()
      }

      if (password) {
        const passwordBase64 = Buffer.from(password).toString('base64')
        browser.runtime.sendMessage({ type: 'unlock', data: { password: passwordBase64 } })
        passwordStore.setPassword(password)
        await navigateToSuccess()
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.message.trim() === 'Wallet already present') {
        throw error
      }
    } finally {
      setLoading(false)
    }
  }

  const moveToNextStep = async () => {
    if (isLedger) {
      if (currentStep === totalSteps + 1) {
        return navigateToSuccess()
      }

      if (currentStep === 4 && passwordStore.password) {
        await onOnboardingCompleted(passwordStore.password)
        return
      }
    } else if (currentStep === totalSteps) {
      return navigateToSuccess()
    }

    if (currentStep === 2 && !noAccount && !isLedger) {
      try {
        if (passwordStore.password) {
          await onOnboardingCompleted(passwordStore.password)
        }
      } catch (_) {
        //
      }
      return navigateToSuccess(false)
    }

    setCurrentStep(currentStep + 1)
  }

  const backToPreviousStep = async () => {
    // if user is importing ledger from the home page and tries to go back
    // we need to check if they have a primary wallet and close the page if necessary
    if (walletName === 'ledger' && currentStep === 1) {
      const allWallets = await Wallet.getAllWallets()
      const hasPrimaryWallet = hasMnemonicWallet(allWallets)
      if (hasPrimaryWallet) {
        navigate('/home', { state: { from: location } })
        return
      }
    }

    if (currentStep === 3 && isPrivateKey) setCurrentStep(currentStep - 2)
    else if (currentStep > 0) setCurrentStep(currentStep - 1)
    else {
      navigate(-1)
    }
  }

  const importWalletFromSeedPhrase = async () => {
    try {
      if (!isPrivateKey) {
        await getAccountDetails(correctMnemonic(secret))
      }

      await moveToNextStep()
    } catch (error: unknown) {
      if (error instanceof Error) {
        setPrivateKeyError(error.message.trim())
      }
    }
  }

  const importLedger = async (fn: (flag: boolean) => Promise<void>) => {
    if (isLedger) {
      try {
        setLedgerConnectionStatus(LEDGER_CONNECTION_STEP.step2)
        await fn(walletName === 'evm-ledger')
        setLedgerConnectionStatus(LEDGER_CONNECTION_STEP.step3)
        await moveToNextStep()
      } catch {
        setLedgerConnectionStatus(LEDGER_CONNECTION_STEP.step1)
      }
    }
  }

  useEffect(() => {
    const walletName = query.get('walletName')
    if (walletName === 'ledger') {
      setWalletName('ledger')
      setCurrentStep(1)
    }
  }, [query])

  useEffect(() => {
    const fn = async () => {
      const allWallets = await KeyChain.getAllWallets()
      const addresses = []

      for (const wallet of Object.values(allWallets ?? {})) {
        addresses.push(wallet?.addresses?.cosmos)
        // This is intentional, since we check against addresses?.ethereum in `useOnboarding.txs` line #99-100
        if (wallet?.addresses?.ethereum) {
          addresses.push(wallet?.addresses?.ethereum)
        }
      }

      setExistingAddresses(addresses)
    }
    fn()
  }, [])

  useEffect(() => {
    if (walletAccounts?.length && Object.keys(selectedIds).length === 0) {
      const [firstWallet] = walletAccounts
      setSelectedIds({
        [firstWallet.index]:
          !!firstWallet.address && !existingAddresses?.includes(firstWallet.address),
      })
    }
  }, [existingAddresses, walletAccounts, selectedIds])

  return (
    <ImportWalletContext.Provider
      value={{
        prevStep,
        currentStep,
        setCurrentStep,
        totalSteps,
        loading,
        setLoading,
        importWalletFromSeedPhrase,
        importLedger,
        backToPreviousStep,
        moveToNextStep,
        onOnboardingCompleted,
        privateKeyError,
        currentStepName,
        walletAccounts,
        customWalletAccounts,
        setWalletAccounts,
        getLedgerAccountDetails,
        getLedgerAccountDetailsForIdxs,
        ledgerConnectionStatus,
        setLedgerConnectionStatus,
        secret,
        setSecret,
        watchWalletAddress,
        setWatchWalletAddress,
        watchWalletName,
        setWatchWalletName,
        selectedIds,
        setSelectedIds,
        walletName,
        setPrivateKeyError,
        setWalletName,
        getCustomLedgerAccountDetails,
        ledgerNetworks,
        setLedgerNetworks,
        addresses,
        setAddresses,
      }}
    >
      {children}
    </ImportWalletContext.Provider>
  )
}

export const useImportWalletContext = () => {
  const context = useContext(ImportWalletContext)
  if (!context) {
    throw new Error('useImportWalletContext must be used within a ImportWalletProvider')
  }

  return context
}
