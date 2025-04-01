import { isLedgerUnlocked, sleep } from '@leapwallet/cosmos-wallet-sdk'
import { KeyChain } from '@leapwallet/leap-keychain'
import { AuthContextType, useAuth } from 'context/auth-context'
import { WalletAccount } from 'hooks/onboarding/types'
import { useOnboarding } from 'hooks/onboarding/useOnboarding'
import useQuery from 'hooks/useQuery'
import usePrevious from 'hooks/utility/usePrevious'
import { Wallet } from 'hooks/wallet/useWallet'
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

import { useWeb3Login } from '../use-social-login'
import { LEDGER_CONNECTION_STEP } from './types'

type StepName =
  | 'seed-phrase'
  | 'private-key'
  | 'loading'
  | 'select-import-type'
  | 'import-ledger'
  | 'select-ledger-wallet'
  | 'select-wallet'
  | 'choose-password'
  | 'onboarding-success'
export type ImportWalletType = 'seed-phrase' | 'private-key' | 'ledger' | 'social'

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
    return 'import-ledger'
  }

  if (currentStep === 2 && walletName === 'ledger') {
    return 'select-ledger-wallet'
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
  importLedger: (fn: (flag: boolean) => Promise<void>) => Promise<void>
  backToPreviousStep: () => void
  moveToNextStep: () => void
  moveToNextStepSocial: () => void
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
  getLedgerAccountDetails: (useEvmApp: boolean) => Promise<void>
  getLedgerAccountDetailsForIdxs: (useEvmApp: boolean, idxs: number[]) => Promise<void>
  currentStepName: StepName
  socialLogin: ReturnType<typeof useWeb3Login>
  customWalletAccounts?: WalletAccount[]
  getCustomLedgerAccountDetails: (
    useEvmApp: boolean,
    customDerivationPath: string,
    name: string,
    existingAddresses: string[] | undefined,
  ) => Promise<void>
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
    walletAccounts,
    customWalletAccounts,
    getAccountDetails,
    onOnboardingComplete,
    onBoardingCompleteLedger,
    getLedgerAccountDetails,
    getLedgerAccountDetailsForIdxs,
    socialLogin,
    getCustomLedgerAccountDetails,
  } = useOnboarding()

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
            .map(
              ([id]) =>
                [...(customWalletAccounts ?? []), ...(walletAccounts ?? [])]?.find(
                  (w) => (w.path ?? w.index).toString() === id,
                )?.address,
            ) as string[],
        )
      } else if (walletName === 'social') {
        const [privateKey, userInfo] = await Promise.all([
          socialLogin.getPrivateKey(),
          socialLogin.getUserInfo(),
        ])

        if (!privateKey) {
          throw new Error('Private key not found')
        }

        await onOnboardingComplete(
          privateKey,
          password,
          { 0: true },
          'import-social',
          userInfo?.email,
        )
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

  const moveToNextStepSocial = () => {
    setWalletName('social')
    if (passwordStore.password) {
      return onOnboardingCompleted(passwordStore.password)
    }

    setCurrentStep(3)
  }

  const moveToNextStep = async () => {
    if (currentStep === totalSteps) return navigateToSuccess()
    if (currentStep === 1 && isPrivateKey && passwordStore.password) {
      await onOnboardingCompleted(passwordStore.password)
      return navigateToSuccess()
    }
    if (currentStep + 1 === 2 && isPrivateKey && !passwordStore.password) {
      setCurrentStep(currentStep + 2)
    } else if (currentStep === 2 && !noAccount) {
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

    if (currentStep === 3 && walletName === 'social') setCurrentStep(0)
    else if (currentStep === 3 && isPrivateKey) setCurrentStep(currentStep - 2)
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

  const importLedger = async (fn: (flag: boolean) => Promise<void>) => {
    if (isLedger) {
      try {
        setLedgerConnectionStatus(LEDGER_CONNECTION_STEP.step2)
        await fn(false)
        setLedgerConnectionStatus(LEDGER_CONNECTION_STEP.step3)
        await moveToNextStep()
      } catch {
        setLedgerConnectionStatus(LEDGER_CONNECTION_STEP.step1)
      }
    }
  }

  const currentStepName = getStepName({ currentStep, walletName, loading })

  useEffect(() => {
    let timeout: NodeJS.Timeout
    const fn = async () => {
      isLedgerUnlocked('Cosmos').then((unlocked) => {
        if (unlocked) {
          setLedgerConnectionStatus(LEDGER_CONNECTION_STEP.step1)
          clearTimeout(timeout)
        } else {
          timeout = setTimeout(async () => {
            await fn()
          }, 1000)
        }
      })
    }
    if (isLedger) {
      fn()
    }
  }, [isLedger])

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
        addresses.push(wallet.addresses.seiTestnet2)
      }

      setExistingAddresses(addresses)
    }
    fn()
  }, [])

  useEffect(() => {
    if (walletAccounts?.length) {
      const [firstWallet] = walletAccounts
      setSelectedIds({
        [firstWallet.path ?? firstWallet.index]: !existingAddresses?.includes(firstWallet.address),
      })
    }
  }, [existingAddresses, walletAccounts])

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
        moveToNextStepSocial,
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
        getLedgerAccountDetails,
        getLedgerAccountDetailsForIdxs,
        walletAccounts,
        currentStepName,
        socialLogin,
        customWalletAccounts,
        getCustomLedgerAccountDetails,
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
