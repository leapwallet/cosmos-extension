import { sleep } from '@leapwallet/cosmos-wallet-sdk'
import { KeyChain } from '@leapwallet/leap-keychain'
import { AuthContextType, useAuth } from 'context/auth-context'
import { WalletAccount } from 'hooks/onboarding/types'
import { useLedgerOnboarding, useOnboarding } from 'hooks/onboarding/useOnboarding'
import useQuery from 'hooks/useQuery'
import usePrevious from 'hooks/utility/usePrevious'
import { LedgerAppId, Wallet } from 'hooks/wallet/useWallet'
import { observer } from 'mobx-react-lite'
import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
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
  | 'import-ledger'
  | 'select-ledger-app'
  | 'select-ledger-wallet'
  | 'select-wallet'
  | 'choose-password'
  | 'onboarding-success'
export type ImportWalletType = 'seed-phrase' | 'private-key' | 'ledger'

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

  if (currentStep === 1 && walletName === 'ledger') {
    return 'select-ledger-app'
  }

  if (currentStep === 2 && walletName === 'ledger') {
    return 'select-ledger-wallet'
  }

  if (currentStep === 3 && walletName === 'ledger') {
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

export type ImportWalletContextType = {
  prevStep: number
  currentStep: number
  setCurrentStep: Dispatch<SetStateAction<number>>
  totalSteps: number
  loading: boolean
  setLoading: Dispatch<SetStateAction<boolean>>
  importWalletFromSeedPhrase: () => Promise<void>
  importLedger: (fn: (idxs?: Array<number>) => Promise<void>) => Promise<void>
  backToPreviousStep: () => void
  moveToNextStep: () => void
  onOnboardingCompleted: (password: Uint8Array) => void
  privateKeyError: string
  setPrivateKeyError: Dispatch<SetStateAction<string>>
  ledgerConnectionStatus: LEDGER_CONNECTION_STEP
  setLedgerConnectionStatus: Dispatch<SetStateAction<LEDGER_CONNECTION_STEP>>
  secret: string
  setSecret: Dispatch<SetStateAction<string>>
  selectedIds: { [id: string]: boolean }
  setSelectedIds: Dispatch<SetStateAction<{ [id: string]: boolean }>>
  walletName: ImportWalletType
  setWalletName: Dispatch<SetStateAction<ImportWalletType>>
  walletAccounts?: WalletAccount[]
  //getLedgerAccountDetails: () => Promise<void>
  getLedgerAccountDetailsForIdxs: (idxs?: Array<number>) => Promise<void>
  currentStepName: StepName
  customWalletAccounts?: WalletAccount[]
  getCustomLedgerAccountDetails: (
    customDerivationPath: string,
    name: string,
    existingAddresses: string[] | undefined,
  ) => Promise<void>
  selectedApp: LedgerAppId
  setSelectedApp: (app: LedgerAppId) => void
}

const ImportWalletContext = createContext<ImportWalletContextType | null>(null)

export const ImportWalletProvider = observer(({ children }: { children: React.ReactNode }) => {
  const query = useQuery()
  const [walletName, setWalletName] = useState<ImportWalletType>('seed-phrase')
  const isLedger = walletName === 'ledger'
  const isPrivateKey = walletName === 'private-key'
  const { noAccount } = useAuth() as AuthContextType

  const [secret, setSecret] = useState('')
  const [selectedIds, setSelectedIds] = useState<{ [id: number]: boolean }>({})
  const [loading, setLoading] = useState(false)

  const [currentStep, setCurrentStep] = useState(0)
  const prevStep = usePrevious(currentStep) || 0

  const [ledgerConnectionStatus, setLedgerConnectionStatus] = useState(LEDGER_CONNECTION_STEP.step0)
  const navigate = useNavigate()
  const location = useLocation()
  const totalSteps = 3
  const [privateKeyError, setPrivateKeyError] = useState('')
  const [existingAddresses, setExistingAddresses] = useState<string[] | undefined>(undefined)

  const {
    walletAccounts: hotWalletAccounts = [],
    getAccountDetails,
    onOnboardingComplete,
  } = useOnboarding()

  const {
    onBoardingCompleteLedger,
    //getLedgerAccountDetails,
    getLedgerAccountDetailsForIdxs,
    customWalletAccounts,
    getCustomLedgerAccountDetails,
    selectedApp,
    setSelectedApp,
    walletAccounts: ledgerWalletAccounts = [],
    customWalletAccounts: ledgerCustomWalletAccounts = [],
  } = useLedgerOnboarding()

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
        const walletAccounts = isLedger
          ? ledgerWalletAccounts.concat(ledgerCustomWalletAccounts)
          : hotWalletAccounts
        const walletsToImport = Object.entries(selectedIds)
          .filter(([, selected]) => selected)
          .map(
            ([id]) =>
              [...(customWalletAccounts ?? []), ...(walletAccounts ?? [])]?.find(
                (w) => (w.path ?? w.index).toString() === id,
              )?.address,
          ) as string[]

        await onBoardingCompleteLedger(password, walletsToImport)
      } else {
        const onBoardingSelectedIds = isPrivateKey ? { 0: true } : selectedIds
        await onOnboardingComplete(secret, password, onBoardingSelectedIds, 'import')
      }

      if (!passwordStore.password) {
        await moveToNextStep()
      }

      const passwordBase64 = Buffer.from(password).toString('base64')
      browser.runtime.sendMessage({ type: 'unlock', data: { password: passwordBase64 } })
      passwordStore.setPassword(password)
      await navigateToSuccess()

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
    if (currentStep === totalSteps) return navigateToSuccess()
    if (currentStep === 1 && isPrivateKey && passwordStore.password) {
      await onOnboardingCompleted(passwordStore.password)
      return navigateToSuccess()
    }
    if (currentStep + 1 === 2 && isPrivateKey && !passwordStore.password) {
      setCurrentStep(currentStep + 2)
    } else if (currentStep === 2 && !noAccount && !isLedger) {
      try {
        if (passwordStore.password) {
          await onOnboardingCompleted(passwordStore.password)
        }
      } catch (_) {
        //
      }
      return navigateToSuccess(false)
    } else if (currentStep === 2 && !noAccount && isLedger) {
      try {
        if (passwordStore.password) {
          await onOnboardingCompleted(passwordStore.password)
        }
      } catch (_) {
        //
      }
      return navigateToSuccess(false)
    } else {
      setCurrentStep(currentStep + 1)
    }
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
    if (isPrivateKey) {
      try {
        await moveToNextStep()
      } catch (error: unknown) {
        setPrivateKeyError((error as Error)?.message.trim())
      }

      return
    }

    const correctedSecret = correctMnemonic(secret)

    await getAccountDetails(correctedSecret)
    await moveToNextStep()
  }

  const importLedger = async (fn: (idxs?: Array<number>) => Promise<void>) => {
    if (isLedger) {
      setLedgerConnectionStatus(LEDGER_CONNECTION_STEP.step2)
      await fn()
      setLedgerConnectionStatus(LEDGER_CONNECTION_STEP.step3)
      await moveToNextStep()
    }
  }

  const currentStepName = getStepName({ currentStep, walletName, loading })

  useEffect(() => {
    const walletName = query.get('walletName')
    const app = query.get('app')
    if (walletName === 'ledger') {
      setWalletName('ledger')
      setCurrentStep(1)
    }
    if (app === 'sei') {
      setSelectedApp('sei')
    }
  }, [query])

  useEffect(() => {
    const fn = async () => {
      const allWallets = await KeyChain.getAllWallets()
      const addresses = []

      for (const wallet of Object.values(allWallets ?? {})) {
        addresses.push(wallet.addresses.seiTestnet2)
      }

      setExistingAddresses(addresses)
    }
    fn()
  }, [])

  const selectIds = (walletAccounts: WalletAccount[]) => {
    if (walletAccounts?.length) {
      const [firstWallet] = walletAccounts
      setSelectedIds({
        [firstWallet.path ?? firstWallet.index]: !existingAddresses?.includes(firstWallet.address),
      })
    }
  }

  useEffect(() => {
    if (!isLedger) return
    const walletAccounts = ledgerWalletAccounts.concat(ledgerCustomWalletAccounts)
    selectIds(walletAccounts)
  }, [existingAddresses, isLedger, ledgerWalletAccounts, ledgerCustomWalletAccounts])

  useEffect(() => {
    if (isLedger) return
    selectIds(hotWalletAccounts)
  }, [existingAddresses, hotWalletAccounts, isLedger])

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
        setPrivateKeyError,
        ledgerConnectionStatus,
        setLedgerConnectionStatus,
        secret,
        setSecret,
        selectedIds,
        setSelectedIds,
        walletName,
        setWalletName,
        //getLedgerAccountDetails,
        getLedgerAccountDetailsForIdxs,
        walletAccounts: isLedger
          ? ledgerWalletAccounts.concat(ledgerCustomWalletAccounts)
          : hotWalletAccounts,
        currentStepName,
        customWalletAccounts,
        getCustomLedgerAccountDetails,
        selectedApp,
        setSelectedApp,
      }}
    >
      {children}
    </ImportWalletContext.Provider>
  )
})

export const useImportWalletContext = () => {
  const context = useContext(ImportWalletContext)
  if (!context) {
    throw new Error('useImportWalletContext must be used within a ImportWalletProvider')
  }

  return context
}
