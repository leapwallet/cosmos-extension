import { ChainInfos, pubKeyToEvmAddressToShow } from '@leapwallet/cosmos-wallet-sdk'
import { KeyChain } from '@leapwallet/leap-keychain'
import { WalletAccount } from 'hooks/onboarding/types'
import { usePreviousState } from 'hooks/utility/usePrevious'
import { Wallet } from 'hooks/wallet/useWallet'
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { passwordStore } from 'stores/password-store'
import correctMnemonic from 'utils/correct-mnemonic'
import { DEBUG } from 'utils/debug'
import { isCompassWallet } from 'utils/isCompassWallet'

type ForgotPasswordContextType = {
  mnemonic: string
  setMnemonic: React.Dispatch<React.SetStateAction<string>>
  processStep: number
  setProcessStep: React.Dispatch<React.SetStateAction<number>>
  prevProcessStep: number
  walletAccounts: WalletAccount[]
  setWalletAccounts: React.Dispatch<React.SetStateAction<WalletAccount[]>>
  selectedIds: { [k: number]: boolean }
  setSelectedIds: React.Dispatch<React.SetStateAction<{ [k: number]: boolean }>>
  loading: boolean
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  incrementStep: () => void
  decrementStep: () => void
  onSubmit: (password: Uint8Array) => Promise<void>
}

const ForgotPasswordContext = createContext<ForgotPasswordContextType | null>(null)

const maxSteps = 4

export const ForgotPasswordContextProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate()

  const [mnemonic, setMnemonic] = useState('')
  const [processStep, setProcessStep] = useState(1)
  const prevProcessStep = usePreviousState(processStep) || 0
  const [walletAccounts, setWalletAccounts] = useState<WalletAccount[]>([])
  const [selectedIds, setSelectedIds] = useState<{ [k: number]: boolean }>({})
  const [loading, setLoading] = useState(false)

  const importWalletAccounts = Wallet.useImportMultipleWalletAccounts()
  const { removeAll } = Wallet.useRemoveWallet()

  const fetchWalletAccounts = useCallback(async (mnemonic: string) => {
    const correctedMnemonic = correctMnemonic(mnemonic)
    const fetchChainInfosOf = isCompassWallet() ? 'seiTestnet2' : 'cosmos'

    const walletAccounts = await KeyChain.getWalletsFromMnemonic(
      correctedMnemonic,
      5,
      ChainInfos[fetchChainInfosOf].bip44.coinType,
      ChainInfos[fetchChainInfosOf].addressPrefix,
    )

    setWalletAccounts(
      walletAccounts.map((account) => ({
        ...account,
        evmAddress: account.pubkey ? pubKeyToEvmAddressToShow(account.pubkey) : null,
      })),
    )
    setSelectedIds(walletAccounts.reduce((acc, { index }) => ({ ...acc, [index]: true }), {}))
  }, [])

  /**
   * @description Increment the process step
   * @returns null
   */
  const incrementStep = useCallback(() => {
    if (processStep + 1 <= maxSteps) {
      setProcessStep(processStep + 1)
    } else {
      navigate('/onboardingSuccess')
    }
  }, [navigate, processStep])

  /**
   * @description Increment the process step
   * @returns null
   */
  const decrementStep = useCallback(() => {
    if (processStep <= maxSteps && processStep - 1 > 0) {
      setProcessStep(processStep - 1)
    } else {
      navigate('/')
    }
  }, [navigate, processStep])

  /**
   * @description Final step that resets the password of the wallet
   * @returns null
   */
  const onSubmit = useCallback(
    async (password: Uint8Array) => {
      setLoading(true)
      passwordStore.setPassword(password)
      await removeAll()
      if (mnemonic && password) {
        await importWalletAccounts({
          mnemonic,
          password,
          selectedAddressIndexes: Object.entries(selectedIds)
            .filter(([, selected]) => selected)
            .map(([addressIndex]) => parseInt(addressIndex)),
          type: 'import',
        })
        incrementStep()
      }
      setLoading(false)
    },
    [importWalletAccounts, incrementStep, mnemonic, removeAll, selectedIds],
  )

  useEffect(() => {
    if (processStep === 3) {
      fetchWalletAccounts(mnemonic).catch((e) => DEBUG('Fetching Wallet Accounts', e.message))
    }
  }, [fetchWalletAccounts, mnemonic, processStep])

  return (
    <ForgotPasswordContext.Provider
      value={{
        mnemonic,
        setMnemonic,
        processStep,
        setProcessStep,
        prevProcessStep,
        walletAccounts,
        setWalletAccounts,
        selectedIds,
        setSelectedIds,
        loading,
        setLoading,
        incrementStep,
        decrementStep,
        onSubmit,
      }}
    >
      {children}
    </ForgotPasswordContext.Provider>
  )
}

export const useForgotPasswordContext = () => {
  const context = useContext(ForgotPasswordContext)
  if (!context) {
    throw new Error('useForgotPasswordContext must be used within a ForgotPasswordContextProvider')
  }

  return context
}
