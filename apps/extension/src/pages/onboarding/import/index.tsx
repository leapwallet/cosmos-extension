import { isLedgerUnlocked } from '@leapwallet/cosmos-wallet-sdk'
import { Buttons, ProgressBar } from '@leapwallet/leap-ui'
import ChoosePasswordView from 'components/choose-password-view'
import CssLoader from 'components/css-loader/CssLoader'
import ExtensionPage from 'components/extension-page'
import { AuthContextType, useAuth } from 'context/auth-context'
import { useOnboarding } from 'hooks/onboarding/useOnboarding'
import useQuery from 'hooks/useQuery'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { passwordStore } from 'stores/password-store'
import { Colors } from 'theme/colors'
import correctMnemonic from 'utils/correct-mnemonic'
import { isCompassWallet } from 'utils/isCompassWallet'
import browser from 'webextension-polyfill'

import { SeedPhraseView } from '../components'
import ImportLedgerView from './ImportLedgerView'
import SelectLedgerWalletView from './SelectLedgerWalletView'
import { SelectWalletView } from './SelectWalletView'
import { LEDGER_CONNECTION_STEP } from './types'

export default observer(function OnboardingImportWallet() {
  const walletName = useQuery().get('walletName') ?? undefined
  const isLedger = ['hardwarewallet', 'evmhardwarewallet'].includes(walletName || '')
  const isMetamask = walletName?.toLowerCase().includes('metamask')
  const isOtherEvmWallets = walletName?.toLowerCase().includes('evm wallets')
  const isPrivateKey =
    walletName?.toLowerCase().includes('private') || isMetamask || isOtherEvmWallets
  const { noAccount } = useAuth() as AuthContextType

  const [secret, setSecret] = useState('')
  const [selectedIds, setSelectedIds] = useState<{ [id: number]: boolean }>({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [importEvmLedgerStep, setImportEvmLedgerStep] = useState(false)

  const [currentStep, setCurrentStep] = useState(1)
  const [ledgerConnectionStatus, setLedgerConnectionStatus] = useState(LEDGER_CONNECTION_STEP.step0)
  const navigate = useNavigate()
  const totalSteps = 4
  const [privateKeyError, setPrivateKeyError] = useState('')

  const {
    walletAccounts,
    getAccountDetails,
    getLedgerAccountDetails,
    onOnboardingComplete,
    onBoardingCompleteLedger,
    getEvmLedgerAccountDetails,
    getLedgerAccountDetailsForIdxs,
  } = useOnboarding()

  const onOnboardingCompleted = async (password: Uint8Array) => {
    try {
      setLoading(true)
      if (isLedger) {
        await onBoardingCompleteLedger(
          password,
          Object.entries(selectedIds)
            .filter(([, selected]) => selected)
            .map(
              ([id]) => walletAccounts?.find((w) => w.index.toString() === id)?.address,
            ) as string[],
        )
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
        navigate('/onboardingSuccess')
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
    if (currentStep + 1 === totalSteps) navigate('/onboardingSuccess')
    if (currentStep === 1 && isPrivateKey && passwordStore.password) {
      await onOnboardingCompleted(passwordStore.password)
      navigate('/onboardingSuccess')
      return
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
      navigate('/onboardingSuccess')
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const backToPreviousStep = () => {
    if (currentStep === 3 && isPrivateKey) setCurrentStep(currentStep - 2)
    else if (currentStep > 1) setCurrentStep(currentStep - 1)
    else {
      navigate(-1)
    }
  }

  const importWalletFromSeedPhrase = async () => {
    if (isPrivateKey) {
      try {
        await moveToNextStep()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        setPrivateKeyError(error.message.trim())
      }
    } else {
      const correctedSecret = correctMnemonic(secret)

      getAccountDetails(correctedSecret).then(moveToNextStep)
    }
  }

  const importLedger = async (fn: (flag: boolean) => Promise<void>) => {
    if (isLedger) {
      try {
        setError('')
        setLedgerConnectionStatus(LEDGER_CONNECTION_STEP.step2)
        await fn(false)
        setLedgerConnectionStatus(LEDGER_CONNECTION_STEP.step3)
        await moveToNextStep()
      } catch {
        setLedgerConnectionStatus(LEDGER_CONNECTION_STEP.step1)
      }
    }
  }

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

  if (loading) {
    return (
      <ExtensionPage
        titleComponent={
          <div className='flex flex-row w-[836px] items-center justify-between align-'>
            <Buttons.Back isFilled={true} onClick={backToPreviousStep} />
            <ProgressBar
              color={Colors.cosmosPrimary}
              currentStep={currentStep}
              totalSteps={totalSteps}
            />
            <div />
          </div>
        }
      >
        <div className='mt-72'>
          <CssLoader />
        </div>
      </ExtensionPage>
    )
  }

  const showImportLedgerView = (currentStep === 1 && isLedger) || importEvmLedgerStep

  return (
    <ExtensionPage
      titleComponent={
        <div className='flex flex-row w-[836px] items-center justify-between align-'>
          <Buttons.Back isFilled={true} onClick={backToPreviousStep} />
          <ProgressBar
            color={Colors.cosmosPrimary}
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
          <div />
        </div>
      }
    >
      {currentStep === 1 && !isLedger && (
        <SeedPhraseView
          secret={secret}
          setSecret={setSecret}
          walletName={walletName as string}
          onProceed={importWalletFromSeedPhrase}
          isPrivateKey={isPrivateKey as boolean}
          privateKeyError={privateKeyError}
          setPrivateKeyError={setPrivateKeyError}
          isMetamaskKey={isMetamask}
          isOtherEvmWallets={isOtherEvmWallets}
        />
      )}

      {showImportLedgerView && currentStep !== 3 && (
        <ImportLedgerView
          retry={() => importLedger(getLedgerAccountDetails)}
          error={error}
          onNext={async () => {
            if (importEvmLedgerStep) {
              await importLedger(getEvmLedgerAccountDetails)
            } else {
              await importLedger(getLedgerAccountDetails)
              if (!isCompassWallet()) {
                setImportEvmLedgerStep(false)
              }
            }
          }}
          onSkip={moveToNextStep}
          status={ledgerConnectionStatus}
          isEvmLedger={importEvmLedgerStep}
        />
      )}

      {currentStep === 2 && !isLedger && (
        <SelectWalletView
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          accountsData={walletAccounts as { address: string; index: number }[]}
          onProceed={moveToNextStep}
        />
      )}

      {currentStep === 2 && isLedger && !showImportLedgerView && (
        <SelectLedgerWalletView
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          accountsData={walletAccounts as { address: string; index: number }[]}
          onProceed={moveToNextStep}
          getLedgerAccountDetailsForIdxs={getLedgerAccountDetailsForIdxs}
          onEVMConnect={() => {
            setError('')
            setLedgerConnectionStatus(LEDGER_CONNECTION_STEP.step1)
            setImportEvmLedgerStep(true)
          }}
        />
      )}

      {currentStep === 3 && !passwordStore.password && (
        <ChoosePasswordView onProceed={onOnboardingCompleted} />
      )}
    </ExtensionPage>
  )
})
